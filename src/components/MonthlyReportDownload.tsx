import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: "1", label: "Gennaio" },
    { value: "2", label: "Febbraio" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Aprile" },
    { value: "5", label: "Maggio" },
    { value: "6", label: "Giugno" },
    { value: "7", label: "Luglio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Settembre" },
    { value: "10", label: "Ottobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Dicembre" },
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
          Report PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scarica Report Mensile</DialogTitle>
          <DialogDescription>
            Seleziona il mese e l'anno per generare il report in PDF con tutte le entrate e uscite
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="month">Mese</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Seleziona mese" />
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
            <Label htmlFor="year">Anno</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Seleziona anno" />
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
            Genera e Scarica PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
