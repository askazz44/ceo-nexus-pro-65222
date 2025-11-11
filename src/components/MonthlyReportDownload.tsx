import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { generateMonthlyReport } from "@/lib/utils/pdfGenerator";

interface MonthlyReportDownloadProps {
  project: any;
  transactions: any[];
}

export function MonthlyReportDownload({ project, transactions }: MonthlyReportDownloadProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: "1", label: t('january') },
    { value: "2", label: t('february') },
    { value: "3", label: t('march') },
    { value: "4", label: t('april') },
    { value: "5", label: t('may') },
    { value: "6", label: t('june') },
    { value: "7", label: t('july') },
    { value: "8", label: t('august') },
    { value: "9", label: t('september') },
    { value: "10", label: t('october') },
    { value: "11", label: t('november') },
    { value: "12", label: t('december') },
  ];

  const handleGenerate = async () => {
    if (!selectedMonth || !selectedYear) return;
    
    setGenerating(true);
    
    setTimeout(() => {
      generateMonthlyReport(
        project,
        transactions,
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );
      setGenerating(false);
      setOpen(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          {t('reportPDF')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('downloadMonthlyReport')}</DialogTitle>
          <DialogDescription>
            {t('selectMonthYear')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="month">{t('month')}</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder={t('selectMonth')} />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">{t('year')}</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder={t('selectYear')} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!selectedMonth || !selectedYear || generating}
            className="w-full"
          >
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('generatePDF')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
