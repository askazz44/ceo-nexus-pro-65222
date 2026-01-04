// Bank format detection and parsing utilities for Italian banks and cards

export interface BankFormat {
  name: string;
  icon: string;
  dateColumns: string[];
  amountColumns: string[];
  descriptionColumns: string[];
  categoryColumns: string[];
  typeColumn?: string;
  // How to determine income vs expense
  typeDetection: 'sign' | 'column' | 'separate_columns';
  // For separate_columns type
  incomeColumn?: string;
  expenseColumn?: string;
  // Date format pattern
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'DD.MM.YYYY';
  // Amount format
  amountDecimalSeparator: ',' | '.';
  amountThousandSeparator?: '.' | ',' | ' ' | '';
}

export const BANK_FORMATS: Record<string, BankFormat> = {
  postepay: {
    name: 'Postepay',
    icon: '💳',
    dateColumns: ['data operazione', 'data', 'data contabile', 'data valuta'],
    amountColumns: ['importo', 'importo eur', 'importo euro'],
    descriptionColumns: ['descrizione', 'causale', 'descrizione operazione'],
    categoryColumns: ['categoria', 'tipo operazione'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: ',',
    amountThousandSeparator: '.',
  },
  intesa_sanpaolo: {
    name: 'Intesa Sanpaolo',
    icon: '🏦',
    dateColumns: ['data', 'data operazione', 'data contabile', 'data valuta'],
    amountColumns: ['importo', 'dare/avere', 'importo eur'],
    descriptionColumns: ['descrizione', 'causale', 'descrizione operazione'],
    categoryColumns: ['categoria'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: ',',
    amountThousandSeparator: '.',
  },
  unicredit: {
    name: 'UniCredit',
    icon: '🏦',
    dateColumns: ['data', 'data operazione', 'data contabile', 'data valuta', 'booking date'],
    amountColumns: ['importo', 'amount', 'importo eur'],
    descriptionColumns: ['descrizione', 'causale', 'description', 'descrizione operazione'],
    categoryColumns: ['categoria', 'category'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: ',',
    amountThousandSeparator: '.',
  },
  hype: {
    name: 'Hype',
    icon: '📱',
    dateColumns: ['data', 'date', 'data operazione'],
    amountColumns: ['importo', 'amount', 'valore'],
    descriptionColumns: ['descrizione', 'description', 'nota', 'note'],
    categoryColumns: ['categoria', 'category'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: ',',
    amountThousandSeparator: '.',
  },
  n26: {
    name: 'N26',
    icon: '📱',
    dateColumns: ['date', 'data', 'booking date', 'value date'],
    amountColumns: ['amount (eur)', 'amount', 'importo', 'amount in eur'],
    descriptionColumns: ['payee', 'partner name', 'description', 'reference'],
    categoryColumns: ['transaction type', 'type', 'category'],
    typeDetection: 'sign',
    dateFormat: 'YYYY-MM-DD',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  revolut: {
    name: 'Revolut',
    icon: '📱',
    dateColumns: ['started date', 'completed date', 'date', 'data'],
    amountColumns: ['amount', 'importo', 'value'],
    descriptionColumns: ['description', 'descrizione', 'reference'],
    categoryColumns: ['type', 'category', 'categoria'],
    typeDetection: 'sign',
    dateFormat: 'YYYY-MM-DD',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  generic: {
    name: 'Formato Generico',
    icon: '📄',
    dateColumns: ['data', 'date', 'data operazione', 'data contabile', 'data valuta'],
    amountColumns: ['importo', 'amount', 'valore', 'value', 'somma'],
    descriptionColumns: ['descrizione', 'description', 'causale', 'note', 'nota', 'riferimento'],
    categoryColumns: ['categoria', 'category', 'tipo', 'type'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: ',',
    amountThousandSeparator: '.',
  },
};

export interface CSVRow {
  [key: string]: string;
}

export interface DetectedFormat {
  format: BankFormat;
  formatKey: string;
  confidence: number;
  matchedColumns: {
    date?: string;
    amount?: string;
    description?: string;
    category?: string;
    income?: string;
    expense?: string;
  };
}

/**
 * Detects the bank format from CSV headers
 */
export function detectBankFormat(headers: string[]): DetectedFormat {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  let bestMatch: DetectedFormat = {
    format: BANK_FORMATS.generic,
    formatKey: 'generic',
    confidence: 0,
    matchedColumns: {},
  };

  for (const [formatKey, format] of Object.entries(BANK_FORMATS)) {
    if (formatKey === 'generic') continue;

    let score = 0;
    const matchedColumns: DetectedFormat['matchedColumns'] = {};

    // Check date columns
    for (const dateCol of format.dateColumns) {
      const match = normalizedHeaders.find(h => h === dateCol || h.includes(dateCol));
      if (match) {
        score += 3;
        matchedColumns.date = headers[normalizedHeaders.indexOf(match)];
        break;
      }
    }

    // Check amount columns
    for (const amountCol of format.amountColumns) {
      const match = normalizedHeaders.find(h => h === amountCol || h.includes(amountCol));
      if (match) {
        score += 3;
        matchedColumns.amount = headers[normalizedHeaders.indexOf(match)];
        break;
      }
    }

    // Check description columns
    for (const descCol of format.descriptionColumns) {
      const match = normalizedHeaders.find(h => h === descCol || h.includes(descCol));
      if (match) {
        score += 2;
        matchedColumns.description = headers[normalizedHeaders.indexOf(match)];
        break;
      }
    }

    // Check category columns
    for (const catCol of format.categoryColumns) {
      const match = normalizedHeaders.find(h => h === catCol || h.includes(catCol));
      if (match) {
        score += 1;
        matchedColumns.category = headers[normalizedHeaders.indexOf(match)];
        break;
      }
    }

    // Calculate confidence (max possible score is ~9)
    const confidence = Math.min(score / 9, 1);

    if (confidence > bestMatch.confidence) {
      bestMatch = {
        format,
        formatKey,
        confidence,
        matchedColumns,
      };
    }
  }

  // If no good match found, use generic format with best-effort column matching
  if (bestMatch.confidence < 0.3) {
    bestMatch = {
      format: BANK_FORMATS.generic,
      formatKey: 'generic',
      confidence: 0.5,
      matchedColumns: findGenericColumns(headers),
    };
  }

  return bestMatch;
}

/**
 * Find columns using generic patterns
 */
function findGenericColumns(headers: string[]): DetectedFormat['matchedColumns'] {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const matched: DetectedFormat['matchedColumns'] = {};

  // Date patterns
  const datePatterns = ['data', 'date', 'giorno', 'when'];
  for (const pattern of datePatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(pattern));
    if (idx !== -1 && !matched.date) {
      matched.date = headers[idx];
    }
  }

  // Amount patterns
  const amountPatterns = ['importo', 'amount', 'valore', 'value', 'somma', 'eur', 'euro'];
  for (const pattern of amountPatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(pattern));
    if (idx !== -1 && !matched.amount) {
      matched.amount = headers[idx];
    }
  }

  // Description patterns
  const descPatterns = ['descr', 'causale', 'note', 'riferimento', 'reference', 'payee'];
  for (const pattern of descPatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(pattern));
    if (idx !== -1 && !matched.description) {
      matched.description = headers[idx];
    }
  }

  // Category patterns
  const catPatterns = ['categoria', 'category', 'tipo', 'type'];
  for (const pattern of catPatterns) {
    const idx = normalizedHeaders.findIndex(h => h.includes(pattern));
    if (idx !== -1 && !matched.category) {
      matched.category = headers[idx];
    }
  }

  return matched;
}

/**
 * Parse amount according to the detected format
 */
export function parseAmount(value: string, format: BankFormat): number | null {
  if (!value || typeof value !== 'string') return null;

  let cleaned = value.trim();
  
  // Remove currency symbols
  cleaned = cleaned.replace(/[€$£¥]/g, '').trim();
  
  // Handle the thousand and decimal separators based on format
  if (format.amountDecimalSeparator === ',') {
    // European format: 1.234,56
    cleaned = cleaned.replace(/\./g, ''); // Remove thousand separators
    cleaned = cleaned.replace(',', '.'); // Convert decimal separator
  } else {
    // US format: 1,234.56
    cleaned = cleaned.replace(/,/g, ''); // Remove thousand separators
  }

  // Remove any remaining non-numeric characters except - and .
  cleaned = cleaned.replace(/[^0-9.\-]/g, '');

  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}

/**
 * Parse date according to the detected format
 */
export function parseDate(value: string, format: BankFormat): string | null {
  if (!value || typeof value !== 'string') return null;

  const cleaned = value.trim();
  
  // Try different date patterns
  const patterns: Array<{ regex: RegExp; groups: 'dmy' | 'ymd' | 'mdy' }> = [
    { regex: /^(\d{4})-(\d{2})-(\d{2})/, groups: 'ymd' }, // YYYY-MM-DD
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})/, groups: 'dmy' }, // DD/MM/YYYY
    { regex: /^(\d{2})-(\d{2})-(\d{4})/, groups: 'dmy' }, // DD-MM-YYYY
    { regex: /^(\d{2})\.(\d{2})\.(\d{4})/, groups: 'dmy' }, // DD.MM.YYYY
    { regex: /^(\d{4})\/(\d{2})\/(\d{2})/, groups: 'ymd' }, // YYYY/MM/DD
  ];

  for (const { regex, groups } of patterns) {
    const match = cleaned.match(regex);
    if (match) {
      let year: string, month: string, day: string;
      
      if (groups === 'ymd') {
        [, year, month, day] = match;
      } else if (groups === 'dmy') {
        [, day, month, year] = match;
      } else {
        [, month, day, year] = match;
      }

      // Validate date components
      const numYear = parseInt(year);
      const numMonth = parseInt(month);
      const numDay = parseInt(day);

      if (numYear >= 1900 && numYear <= 2100 && numMonth >= 1 && numMonth <= 12 && numDay >= 1 && numDay <= 31) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }

  // Try parsing as ISO date string or other formats
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Determine transaction type from amount and format
 */
export function determineTransactionType(
  row: CSVRow, 
  amount: number, 
  format: BankFormat,
  matchedColumns: DetectedFormat['matchedColumns']
): 'income' | 'expense' {
  if (format.typeDetection === 'sign') {
    return amount < 0 ? 'expense' : 'income';
  }

  if (format.typeDetection === 'separate_columns') {
    const incomeVal = matchedColumns.income ? row[matchedColumns.income] : null;
    const expenseVal = matchedColumns.expense ? row[matchedColumns.expense] : null;

    if (incomeVal && parseAmount(incomeVal, format)) return 'income';
    if (expenseVal && parseAmount(expenseVal, format)) return 'expense';
  }

  // Default to sign-based detection
  return amount < 0 ? 'expense' : 'income';
}

/**
 * Sanitize string to prevent XSS and formula injection
 */
export function sanitizeField(value: string | null): string | null {
  if (!value) return value;
  
  // Trim whitespace
  let cleaned = value.trim();
  
  // Prefix dangerous characters with single quote to prevent Excel formula execution
  if (/^[=+\-@\t\r]/.test(cleaned)) {
    cleaned = "'" + cleaned;
  }
  
  // Limit length to prevent extremely long strings
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500);
  }
  
  return cleaned;
}
