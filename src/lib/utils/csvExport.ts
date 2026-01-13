import { DatabaseExport } from "./databaseExport";

export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return "";

  const keys = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = keys.map(key => `"${key}"`).join(",");
  
  // Create data rows
  const dataRows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      if (value === null || value === undefined) return '""';
      if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
      return `"${value}"`;
    }).join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

export function downloadCSV(content: string, filename: string) {
  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDatabaseToCSV(data: DatabaseExport) {
  const date = new Date().toISOString().split('T')[0];
  
  // Export projects
  if (data.projects.length > 0) {
    const projectsCSV = convertToCSV(data.projects, [
      'id', 'name', 'industry', 'description', 'target_revenue', 
      'currency', 'start_date', 'created_at', 'updated_at'
    ]);
    downloadCSV(projectsCSV, `gainflow-projects-${date}.csv`);
  }
  
  // Export transactions
  if (data.transactions.length > 0) {
    const transactionsCSV = convertToCSV(data.transactions, [
      'id', 'project_id', 'type', 'amount', 'category', 
      'note', 'transaction_date', 'created_at', 'updated_at'
    ]);
    downloadCSV(transactionsCSV, `gainflow-transactions-${date}.csv`);
  }
}

export function exportTransactionsToCSV(transactions: any[], projectName?: string) {
  if (transactions.length === 0) return;
  
  const date = new Date().toISOString().split('T')[0];
  const filename = projectName 
    ? `${projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-transactions-${date}.csv`
    : `transactions-${date}.csv`;
  
  const csv = convertToCSV(transactions, [
    'transaction_date', 'type', 'amount', 'category', 'note'
  ]);
  
  downloadCSV(csv, filename);
}
