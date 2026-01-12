// Bank format detection and parsing utilities for international banks
import DOMPurify from 'dompurify';

// Security constants
const MAX_NOTE_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 100;
const MAX_AMOUNT = 999999999.99;
const MIN_DATE = new Date('2000-01-01');
const MAX_DATE_YEARS_AHEAD = 1;

export interface BankFormat {
  name: string;
  icon: string;
  country: 'IT' | 'US' | 'UK' | 'EU' | 'GLOBAL';
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
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'DD.MM.YYYY' | 'MM/DD/YYYY';
  // Amount format
  amountDecimalSeparator: ',' | '.';
  amountThousandSeparator?: '.' | ',' | ' ' | '';
}

export const BANK_FORMATS: Record<string, BankFormat> = {
  // ============ ITALIAN BANKS ============
  postepay: {
    name: 'Postepay',
    icon: '💳',
    country: 'IT',
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
    country: 'IT',
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
    country: 'IT',
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
    country: 'IT',
    dateColumns: ['data', 'date', 'data operazione'],
    amountColumns: ['importo', 'amount', 'valore'],
    descriptionColumns: ['descrizione', 'description', 'nota', 'note'],
    categoryColumns: ['categoria', 'category'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: ',',
    amountThousandSeparator: '.',
  },

  // ============ EU DIGITAL BANKS ============
  n26: {
    name: 'N26',
    icon: '📱',
    country: 'EU',
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
    country: 'GLOBAL',
    dateColumns: ['started date', 'completed date', 'date', 'data'],
    amountColumns: ['amount', 'importo', 'value'],
    descriptionColumns: ['description', 'descrizione', 'reference'],
    categoryColumns: ['type', 'category', 'categoria'],
    typeDetection: 'sign',
    dateFormat: 'YYYY-MM-DD',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  wise: {
    name: 'Wise (TransferWise)',
    icon: '🌍',
    country: 'GLOBAL',
    dateColumns: ['date', 'created date', 'finished date'],
    amountColumns: ['amount', 'source amount', 'target amount'],
    descriptionColumns: ['description', 'recipient', 'reference', 'note'],
    categoryColumns: ['category', 'type'],
    typeDetection: 'sign',
    dateFormat: 'YYYY-MM-DD',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  monzo: {
    name: 'Monzo',
    icon: '📱',
    country: 'UK',
    dateColumns: ['date', 'created'],
    amountColumns: ['amount', 'money out', 'money in'],
    descriptionColumns: ['description', 'name', 'notes and #tags'],
    categoryColumns: ['category', 'type'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  starling: {
    name: 'Starling Bank',
    icon: '🏦',
    country: 'UK',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['amount', 'amount (gbp)'],
    descriptionColumns: ['reference', 'counter party', 'spending category'],
    categoryColumns: ['spending category', 'category'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },

  // ============ US BANKS ============
  chase: {
    name: 'Chase Bank',
    icon: '🏦',
    country: 'US',
    dateColumns: ['transaction date', 'posting date', 'date'],
    amountColumns: ['amount', 'debit', 'credit'],
    descriptionColumns: ['description', 'merchant name', 'memo'],
    categoryColumns: ['category', 'type'],
    typeDetection: 'sign',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  bank_of_america: {
    name: 'Bank of America',
    icon: '🏦',
    country: 'US',
    dateColumns: ['date', 'posted date', 'transaction date'],
    amountColumns: ['amount', 'debit', 'credit'],
    descriptionColumns: ['description', 'payee', 'original description'],
    categoryColumns: ['category', 'type'],
    typeDetection: 'sign',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  wells_fargo: {
    name: 'Wells Fargo',
    icon: '🏦',
    country: 'US',
    dateColumns: ['date', 'posted date'],
    amountColumns: ['amount', 'withdrawal', 'deposit'],
    descriptionColumns: ['description', 'check or slip #'],
    categoryColumns: ['type'],
    typeDetection: 'separate_columns',
    incomeColumn: 'deposit',
    expenseColumn: 'withdrawal',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  capital_one: {
    name: 'Capital One',
    icon: '💳',
    country: 'US',
    dateColumns: ['transaction date', 'posted date', 'date'],
    amountColumns: ['amount', 'debit', 'credit'],
    descriptionColumns: ['description', 'payee', 'merchant'],
    categoryColumns: ['category'],
    typeDetection: 'sign',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  american_express: {
    name: 'American Express',
    icon: '💳',
    country: 'US',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['amount'],
    descriptionColumns: ['description', 'merchant', 'extended details'],
    categoryColumns: ['category'],
    typeDetection: 'sign',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  citi: {
    name: 'Citibank',
    icon: '🏦',
    country: 'US',
    dateColumns: ['date', 'transaction date', 'posted date'],
    amountColumns: ['amount', 'debit', 'credit'],
    descriptionColumns: ['description', 'member message'],
    categoryColumns: ['status'],
    typeDetection: 'sign',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },

  // ============ UK BANKS ============
  barclays: {
    name: 'Barclays',
    icon: '🏦',
    country: 'UK',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['amount', 'money in', 'money out'],
    descriptionColumns: ['description', 'memo', 'subcategory'],
    categoryColumns: ['category', 'subcategory'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  hsbc: {
    name: 'HSBC',
    icon: '🏦',
    country: 'UK',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['amount', 'paid out', 'paid in'],
    descriptionColumns: ['description', 'transaction description'],
    categoryColumns: ['type'],
    typeDetection: 'separate_columns',
    incomeColumn: 'paid in',
    expenseColumn: 'paid out',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  lloyds: {
    name: 'Lloyds Bank',
    icon: '🏦',
    country: 'UK',
    dateColumns: ['transaction date', 'date'],
    amountColumns: ['amount', 'debit amount', 'credit amount'],
    descriptionColumns: ['transaction description', 'description'],
    categoryColumns: ['transaction type'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  natwest: {
    name: 'NatWest',
    icon: '🏦',
    country: 'UK',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['amount', 'value'],
    descriptionColumns: ['description', 'type'],
    categoryColumns: ['type'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  santander_uk: {
    name: 'Santander UK',
    icon: '🏦',
    country: 'UK',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['amount', 'money in', 'money out'],
    descriptionColumns: ['description', 'narrative'],
    categoryColumns: [],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },

  // ============ PAYMENT SERVICES ============
  paypal: {
    name: 'PayPal',
    icon: '💰',
    country: 'GLOBAL',
    dateColumns: ['date', 'transaction date', 'data'],
    amountColumns: ['gross', 'net', 'amount', 'lordo', 'netto'],
    descriptionColumns: ['name', 'description', 'item title', 'nome', 'descrizione'],
    categoryColumns: ['type', 'status', 'tipo'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  stripe: {
    name: 'Stripe',
    icon: '💳',
    country: 'GLOBAL',
    dateColumns: ['created', 'created (utc)', 'date'],
    amountColumns: ['amount', 'gross', 'net'],
    descriptionColumns: ['description', 'customer description', 'statement descriptor'],
    categoryColumns: ['type', 'status'],
    typeDetection: 'sign',
    dateFormat: 'YYYY-MM-DD',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },
  square: {
    name: 'Square',
    icon: '⬛',
    country: 'US',
    dateColumns: ['date', 'transaction date'],
    amountColumns: ['total collected', 'gross sales', 'net total'],
    descriptionColumns: ['description', 'item', 'customer name'],
    categoryColumns: ['category', 'payment type'],
    typeDetection: 'sign',
    dateFormat: 'MM/DD/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
  },

  // ============ GENERIC FALLBACK ============
  generic: {
    name: 'Generic Format',
    icon: '📄',
    country: 'GLOBAL',
    dateColumns: ['data', 'date', 'data operazione', 'data contabile', 'data valuta', 'transaction date', 'posted date'],
    amountColumns: ['importo', 'amount', 'valore', 'value', 'somma', 'gross', 'net', 'total'],
    descriptionColumns: ['descrizione', 'description', 'causale', 'note', 'nota', 'riferimento', 'reference', 'payee', 'merchant'],
    categoryColumns: ['categoria', 'category', 'tipo', 'type'],
    typeDetection: 'sign',
    dateFormat: 'DD/MM/YYYY',
    amountDecimalSeparator: '.',
    amountThousandSeparator: ',',
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
 * Parse amount according to the detected format with bounds checking
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
  
  if (isNaN(amount)) return null;
  
  // Bounds checking to prevent unreasonable values
  if (Math.abs(amount) > MAX_AMOUNT) {
    console.warn(`Amount ${amount} exceeds maximum allowed value of ${MAX_AMOUNT}`);
    return null;
  }
  
  return amount;
}

/**
 * Parse date according to the detected format with range validation
 */
export function parseDate(value: string, format: BankFormat): string | null {
  if (!value || typeof value !== 'string') return null;

  const cleaned = value.trim();
  
  // Try different date patterns
  // Determine date order based on format
  const isUSFormat = format.dateFormat === 'MM/DD/YYYY';
  
  const patterns: Array<{ regex: RegExp; groups: 'dmy' | 'ymd' | 'mdy' }> = [
    { regex: /^(\d{4})-(\d{2})-(\d{2})/, groups: 'ymd' }, // YYYY-MM-DD
    { regex: /^(\d{4})\/(\d{2})\/(\d{2})/, groups: 'ymd' }, // YYYY/MM/DD
    { regex: /^(\d{2})\.(\d{2})\.(\d{4})/, groups: 'dmy' }, // DD.MM.YYYY (always European)
    { regex: /^(\d{2})-(\d{2})-(\d{4})/, groups: 'dmy' }, // DD-MM-YYYY (always European)
  ];
  
  // Add format-specific slash patterns
  if (isUSFormat) {
    patterns.push({ regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, groups: 'mdy' }); // M/D/YYYY or MM/DD/YYYY
  } else {
    patterns.push({ regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, groups: 'dmy' }); // D/M/YYYY or DD/MM/YYYY
  }

  let parsedDate: Date | null = null;

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
        parsedDate = new Date(numYear, numMonth - 1, numDay);
        break;
      }
    }
  }

  // Try parsing as ISO date string or other formats
  if (!parsedDate) {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      parsedDate = date;
    }
  }

  // Validate date range
  if (parsedDate) {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + MAX_DATE_YEARS_AHEAD);
    
    if (parsedDate < MIN_DATE || parsedDate > maxDate) {
      console.warn(`Date ${parsedDate.toISOString()} is outside valid range`);
      // Return current date as fallback for out-of-range dates
      return new Date().toISOString().split('T')[0];
    }
    
    return parsedDate.toISOString().split('T')[0];
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
export function sanitizeField(value: string | null, maxLength: number = MAX_NOTE_LENGTH): string | null {
  if (!value) return value;
  
  // Trim whitespace
  let cleaned = value.trim();
  
  // Sanitize HTML to prevent XSS attacks
  cleaned = DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [] });
  
  // Prefix dangerous characters with single quote to prevent Excel formula execution
  if (/^[=+\-@\t\r]/.test(cleaned)) {
    cleaned = "'" + cleaned;
  }
  
  // Limit length to prevent extremely long strings
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned;
}

/**
 * Sanitize category field with appropriate length limit
 */
export function sanitizeCategory(value: string | null): string | null {
  return sanitizeField(value, MAX_CATEGORY_LENGTH);
}
