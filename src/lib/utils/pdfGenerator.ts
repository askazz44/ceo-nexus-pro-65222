import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  type: string;
  amount: number;
  category: string | null;
  note: string | null;
  transaction_date: string;
}

interface Project {
  name: string;
  currency: string;
}

export function generateMonthlyReport(
  project: Project,
  transactions: Transaction[],
  month: number,
  year: number
) {
  const doc = new jsPDF();
  
  const monthName = new Date(year, month - 1).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  
  // Filtra transazioni per il mese selezionato
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  // Calcola totali
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  
  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  
  const netProfit = totalIncome - totalExpense;

  // Intestazione
  doc.setFontSize(20);
  doc.setTextColor(60, 60, 60);
  doc.text('GainFlow', 14, 20);
  
  doc.setFontSize(16);
  doc.text(`Report Mensile - ${project.name}`, 14, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), 14, 38);

  // Riepilogo
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Riepilogo', 14, 50);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: project.currency,
    }).format(amount);
  };

  doc.setFontSize(11);
  doc.setTextColor(40, 167, 69);
  doc.text(`Totale Entrate: ${formatCurrency(totalIncome)}`, 14, 58);
  
  doc.setTextColor(220, 53, 69);
  doc.text(`Totale Uscite: ${formatCurrency(totalExpense)}`, 14, 65);
  
  doc.setTextColor(netProfit >= 0 ? 40 : 220, netProfit >= 0 ? 167 : 53, 69);
  doc.text(`Profitto Netto: ${formatCurrency(netProfit)}`, 14, 72);

  // Tabella transazioni
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.text('Dettaglio Transazioni', 14, 85);

  const tableData = monthlyTransactions.map(t => [
    new Date(t.transaction_date).toLocaleDateString('it-IT'),
    t.type === 'income' ? 'Entrata' : 'Uscita',
    formatCurrency(parseFloat(t.amount.toString())),
    t.category || '-',
    t.note || '-',
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['Data', 'Tipo', 'Importo', 'Categoria', 'Note']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30 },
      4: { cellWidth: 'auto' },
    },
  });

  // Statistiche per categoria
  const categoryStats = calculateCategoryStats(monthlyTransactions);
  
  if (categoryStats.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 90;
    
    doc.setFontSize(14);
    doc.text('Spese per Categoria', 14, finalY + 15);

    const categoryTableData = categoryStats.map(stat => [
      stat.category,
      formatCurrency(stat.amount),
      `${stat.percentage.toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Categoria', 'Importo', '% sul Totale']],
      body: categoryTableData,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generato il ${new Date().toLocaleDateString('it-IT')} - Pagina ${i} di ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Salva PDF
  const fileName = `${project.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

function calculateCategoryStats(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  
  const categoryMap = new Map<string, number>();
  
  expenses.forEach(t => {
    const category = t.category || 'Senza categoria';
    const current = categoryMap.get(category) || 0;
    categoryMap.set(category, current + parseFloat(t.amount.toString()));
  });

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}
