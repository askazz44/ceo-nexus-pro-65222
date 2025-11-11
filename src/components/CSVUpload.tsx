import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { transactionSchema } from "@/lib/schemas/transactionSchema";

interface CSVUploadProps {
  projectId: string;
  onUploadComplete: () => void;
}

interface CSVRow {
  [key: string]: string;
}

export function CSVUpload({ projectId, onUploadComplete }: CSVUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const transactions = processCSVData(results.data as CSVRow[]);
          
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
              validationErrors.push(`Riga ${i + 1}: ${result.error.errors[0].message}`);
            }
          }

          if (validationErrors.length > 0) {
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
            description: `${transactions.length} ${t('transactionsImported')}`,
          });
          
          setOpen(false);
          setFileName("");
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

  const processCSVData = (rows: CSVRow[]) => {
    const transactions: any[] = [];
    
    for (const row of rows) {
      const type = detectTransactionType(row);
      const amount = extractAmount(row);
      const date = extractDate(row);
      const category = extractCategory(row);
      const note = extractNote(row);

      if (amount && date && type) {
        transactions.push({
          type,
          amount: Math.abs(amount),
          transaction_date: date,
          category: category || null,
          note: note || null,
        });
      }
    }

    return transactions;
  };

  const detectTransactionType = (row: CSVRow): "income" | "expense" | null => {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    const values = Object.values(row).map(v => v.toLowerCase());
    
    for (const key of keys) {
      if (key.includes("tipo") || key.includes("type")) {
        const value = row[Object.keys(row).find(k => k.toLowerCase() === key) || ""];
        if (value.toLowerCase().includes("entr") || value.toLowerCase().includes("income") || value.toLowerCase().includes("credit")) {
          return "income";
        }
        if (value.toLowerCase().includes("usc") || value.toLowerCase().includes("expense") || value.toLowerCase().includes("debit")) {
          return "expense";
        }
      }
    }

    for (const key of keys) {
      const value = row[Object.keys(row).find(k => k.toLowerCase() === key) || ""];
      const amount = parseFloat(value.replace(/[^0-9.-]/g, ''));
      
      if (!isNaN(amount)) {
        if (key.includes("entr") || key.includes("income") || key.includes("credit")) {
          return "income";
        }
        if (key.includes("usc") || key.includes("expense") || key.includes("debit")) {
          return "expense";
        }
        
        return amount < 0 ? "expense" : "income";
      }
    }

    return null;
  };

  const extractAmount = (row: CSVRow): number | null => {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    
    for (const key of keys) {
      if (key.includes("importo") || key.includes("amount") || key.includes("valore") || key.includes("value")) {
        const value = row[Object.keys(row).find(k => k.toLowerCase() === key) || ""];
        const amount = parseFloat(value.replace(/[^0-9.-]/g, ''));
        if (!isNaN(amount)) return Math.abs(amount);
      }
    }

    for (const value of Object.values(row)) {
      const amount = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(amount) && amount !== 0) return Math.abs(amount);
    }

    return null;
  };

  const extractDate = (row: CSVRow): string | null => {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    
    for (const key of keys) {
      if (key.includes("data") || key.includes("date")) {
        const value = row[Object.keys(row).find(k => k.toLowerCase() === key) || ""];
        const date = parseDate(value);
        if (date) return date;
      }
    }

    for (const value of Object.values(row)) {
      const date = parseDate(value);
      if (date) return date;
    }

    return new Date().toISOString().split('T')[0];
  };

  const parseDate = (dateStr: string): string | null => {
    const patterns = [
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{2})\/(\d{2})\/(\d{4})/,
      /(\d{2})-(\d{2})-(\d{4})/,
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        if (match[1].length === 4) {
          return `${match[1]}-${match[2]}-${match[3]}`;
        } else {
          return `${match[3]}-${match[2]}-${match[1]}`;
        }
      }
    }

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  };

  const extractCategory = (row: CSVRow): string | null => {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    
    for (const key of keys) {
      if (key.includes("categoria") || key.includes("category") || key.includes("tipo") || key.includes("type")) {
        const value = row[Object.keys(row).find(k => k.toLowerCase() === key) || ""];
        if (value && !value.toLowerCase().includes("entr") && !value.toLowerCase().includes("usc")) {
          return value;
        }
      }
    }

    return null;
  };

  const extractNote = (row: CSVRow): string | null => {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    
    for (const key of keys) {
      if (key.includes("nota") || key.includes("note") || key.includes("descri") || key.includes("causale")) {
        const value = row[Object.keys(row).find(k => k.toLowerCase() === key) || ""];
        if (value) return value;
      }
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          {t('importCSV')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('importTransactionsCSV')}</DialogTitle>
          <DialogDescription>
            {t('uploadCSVDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{t('recommendedFormat')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('dateFormat')}</li>
                  <li>{t('amountFormat')}</li>
                  <li>{t('typeFormat')}</li>
                  <li>{t('categoryFormat')}</li>
                  <li>{t('noteFormat')}</li>
                </ul>
                <p className="mt-2 text-xs">
                  {t('flexibleFormat')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="csv-file">{t('csvFile')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`} />;
}
