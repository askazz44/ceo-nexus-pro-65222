import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { transactionSchema } from "@/lib/schemas/transactionSchema";
import { Badge } from "@/components/ui/badge";
import { 
  detectBankFormat, 
  parseAmount, 
  parseDate, 
  determineTransactionType, 
  sanitizeField,
  BANK_FORMATS,
  type CSVRow,
  type DetectedFormat 
} from "@/lib/utils/bankFormatDetector";

interface CSVUploadProps {
  projectId: string;
  onUploadComplete: () => void;
}

export function CSVUpload({ projectId, onUploadComplete }: CSVUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat | null>(null);
  const [previewData, setPreviewData] = useState<{ valid: number; invalid: number } | null>(null);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const supportedBanks = [
    { key: 'postepay', name: 'Postepay', icon: '💳' },
    { key: 'intesa_sanpaolo', name: 'Intesa Sanpaolo', icon: '🏦' },
    { key: 'unicredit', name: 'UniCredit', icon: '🏦' },
    { key: 'hype', name: 'Hype', icon: '📱' },
    { key: 'n26', name: 'N26', icon: '📱' },
    { key: 'revolut', name: 'Revolut', icon: '📱' },
  ];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setDetectedFormat(null);
    setPreviewData(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const headers = results.meta.fields || [];
          const detected = detectBankFormat(headers);
          setDetectedFormat(detected);

          const { transactions, validCount, invalidCount } = processCSVData(
            results.data as CSVRow[], 
            detected
          );
          
          setPreviewData({ valid: validCount, invalid: invalidCount });

          if (transactions.length === 0) {
            toast({
              title: t('error'),
              description: t('noValidTransactions'),
              variant: "destructive",
            });
            setUploading(false);
            return;
          }

          // Validate all transactions against schema before insertion
          const validatedTransactions = [];
          const validationErrors = [];

          for (let i = 0; i < transactions.length; i++) {
            const result = transactionSchema.safeParse(transactions[i]);
            if (result.success) {
              validatedTransactions.push({
                ...result.data,
                project_id: projectId,
              });
            } else {
              validationErrors.push(`${language === 'it' ? 'Riga' : 'Row'} ${i + 1}: ${result.error.errors[0].message}`);
            }
          }

          if (validationErrors.length > 0 && validatedTransactions.length === 0) {
            toast({
              title: t('validationErrors'),
              description: `${validationErrors.length} ${t('invalidTransactions')} ${validationErrors[0]}`,
              variant: "destructive",
            });
            setUploading(false);
            return;
          }

          const { error } = await supabase
            .from("transactions")
            .insert(validatedTransactions);

          if (error) throw error;

          toast({
            title: t('importCompleted'),
            description: `${validatedTransactions.length} ${t('transactionsImported')}${validationErrors.length > 0 ? ` (${validationErrors.length} ${language === 'it' ? 'ignorate' : 'skipped'})` : ''}`,
          });
          
          setOpen(false);
          setFileName("");
          setDetectedFormat(null);
          setPreviewData(null);
          onUploadComplete();
        } catch (error: any) {
          toast({
            title: t('importError'),
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        toast({
          title: t('csvParseError'),
          description: error.message,
          variant: "destructive",
        });
        setUploading(false);
      },
    });
  };

  const processCSVData = (rows: CSVRow[], detected: DetectedFormat) => {
    const transactions: any[] = [];
    let validCount = 0;
    let invalidCount = 0;
    
    for (const row of rows) {
      // Try to extract amount using detected column or fallback
      let amount: number | null = null;
      
      if (detected.matchedColumns.amount) {
        amount = parseAmount(row[detected.matchedColumns.amount], detected.format);
      }
      
      // Fallback: try to find amount in any column
      if (amount === null) {
        for (const value of Object.values(row)) {
          const parsed = parseAmount(value, detected.format);
          if (parsed !== null && parsed !== 0) {
            amount = parsed;
            break;
          }
        }
      }

      // Extract date
      let date: string | null = null;
      
      if (detected.matchedColumns.date) {
        date = parseDate(row[detected.matchedColumns.date], detected.format);
      }
      
      // Fallback: try to find date in any column
      if (!date) {
        for (const value of Object.values(row)) {
          const parsed = parseDate(value, detected.format);
          if (parsed) {
            date = parsed;
            break;
          }
        }
      }

      // Use today's date as last resort
      if (!date) {
        date = new Date().toISOString().split('T')[0];
      }

      // Skip if no valid amount
      if (amount === null || amount === 0) {
        invalidCount++;
        continue;
      }

      // Determine transaction type
      const type = determineTransactionType(row, amount, detected.format, detected.matchedColumns);

      // Extract description/note
      let note: string | null = null;
      if (detected.matchedColumns.description) {
        note = sanitizeField(row[detected.matchedColumns.description]);
      }
      
      // Fallback: combine all text fields
      if (!note) {
        const textFields = Object.entries(row)
          .filter(([key, value]) => {
            const lowerKey = key.toLowerCase();
            return value && 
              typeof value === 'string' && 
              value.length > 3 &&
              !lowerKey.includes('data') && 
              !lowerKey.includes('date') &&
              !lowerKey.includes('importo') &&
              !lowerKey.includes('amount');
          })
          .map(([_, value]) => value)
          .slice(0, 2);
        
        if (textFields.length > 0) {
          note = sanitizeField(textFields.join(' - '));
        }
      }

      // Extract category
      let category: string | null = null;
      if (detected.matchedColumns.category) {
        category = sanitizeField(row[detected.matchedColumns.category]);
      }

      transactions.push({
        type,
        amount: Math.abs(amount),
        transaction_date: date,
        category: category || null,
        note: note || null,
      });
      
      validCount++;
    }

    return { transactions, validCount, invalidCount };
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setFileName("");
        setDetectedFormat(null);
        setPreviewData(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          {t('importCSV')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('importTransactionsCSV')}</DialogTitle>
          <DialogDescription>
            {t('uploadCSVDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Supported Banks */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-3">
                {language === 'it' ? 'Formati supportati:' : 'Supported formats:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {supportedBanks.map((bank) => (
                  <Badge 
                    key={bank.key} 
                    variant="secondary"
                    className="text-xs py-1"
                  >
                    {bank.icon} {bank.name}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs py-1">
                  📄 {language === 'it' ? 'Altri formati' : 'Other formats'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Format Detection Result */}
          {detectedFormat && (
            <Card className={detectedFormat.confidence > 0.5 ? "border-green-500/50 bg-green-500/5" : "border-yellow-500/50 bg-yellow-500/5"}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  {detectedFormat.confidence > 0.5 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {language === 'it' ? 'Formato rilevato:' : 'Detected format:'} {detectedFormat.format.icon} {detectedFormat.format.name}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {detectedFormat.matchedColumns.date && (
                    <p>📅 {language === 'it' ? 'Colonna data:' : 'Date column:'} <code className="bg-muted px-1 rounded">{detectedFormat.matchedColumns.date}</code></p>
                  )}
                  {detectedFormat.matchedColumns.amount && (
                    <p>💰 {language === 'it' ? 'Colonna importo:' : 'Amount column:'} <code className="bg-muted px-1 rounded">{detectedFormat.matchedColumns.amount}</code></p>
                  )}
                  {detectedFormat.matchedColumns.description && (
                    <p>📝 {language === 'it' ? 'Colonna descrizione:' : 'Description column:'} <code className="bg-muted px-1 rounded">{detectedFormat.matchedColumns.description}</code></p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Stats */}
          {previewData && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {previewData.valid} {language === 'it' ? 'transazioni valide' : 'valid transactions'}
                    </span>
                  </div>
                  {previewData.invalid > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">
                        {previewData.invalid} {language === 'it' ? 'righe ignorate' : 'rows skipped'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Input */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="csv-file">{t('csvFile')}</Label>
            <div className="flex items-center gap-2">
              <input
                id="csv-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              />
            </div>
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <FileSpreadsheet className="h-4 w-4" />
                {fileName}
              </div>
            )}
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('importing')}
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 {language === 'it' 
              ? 'Scarica il CSV dalla tua banca/app e caricalo qui. Il sistema riconosce automaticamente il formato.' 
              : 'Download the CSV from your bank/app and upload it here. The system automatically recognizes the format.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
