import { CurrencyCode, MonetaryValue } from '@/types';

/**
 * Universal Currency Formatter (Intl.NumberFormat)
 * Supports IDR, USD, EUR, SGD, and fallback ISO codes.
 */
export const formatCurrency = (
  amount: number | string,
  currency: CurrencyCode = 'IDR',
  options?: { showCurrencyCode?: boolean }
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const curr = (currency || 'IDR').toUpperCase().trim();

  const localeMap: Record<string, string> = {
    IDR: 'id-ID',
    USD: 'en-US',
    EUR: 'de-DE',
    SGD: 'en-SG',
    GBP: 'en-GB',
    JPY: 'ja-JP',
  };

  const locale = localeMap[curr] || 'id-ID';
  // Standard zero fraction digits for IDR & JPY, 2 for others
  const fractionDigits = curr === 'IDR' || curr === 'JPY' ? 0 : 2;

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(num);

    // Ensure non-breaking space after standard symbols like Rp
    return formatted;
  } catch {
    return `${curr} ${num.toLocaleString('id-ID')}`;
  }
};

/**
 * Backward-compatible alias for formatCurrency with default IDR
 */
export const formatIDR = (amount: number): string => {
  return formatCurrency(amount, 'IDR');
};

/**
 * Parser for user-entered or CSV-imported currency strings.
 * Detects currency code/symbol and resolves numeric amount safely.
 */
export interface ParsedMonetaryResult {
  amount: number;
  currency: CurrencyCode;
  confidence: 'high' | 'ambiguous' | 'invalid';
  rawString: string;
}

export const parseCurrencyInput = (input: string | number, defaultCurrency: CurrencyCode = 'IDR'): ParsedMonetaryResult => {
  if (typeof input === 'number') {
    return {
      amount: input,
      currency: defaultCurrency,
      confidence: 'high',
      rawString: String(input),
    };
  }

  const raw = String(input).trim();
  if (!raw) {
    return {
      amount: 0,
      currency: defaultCurrency,
      confidence: 'invalid',
      rawString: '',
    };
  }

  let detectedCurrency: CurrencyCode = defaultCurrency;
  let confidence: 'high' | 'ambiguous' | 'invalid' = 'high';

  // 1. Check explicit currency tokens
  if (/\bIDR\b/i.test(raw) || /Rp/i.test(raw)) {
    detectedCurrency = 'IDR';
  } else if (/\bUSD\b/i.test(raw) || /US\$/i.test(raw)) {
    detectedCurrency = 'USD';
  } else if (/\bEUR\b/i.test(raw) || /€/.test(raw)) {
    detectedCurrency = 'EUR';
  } else if (/\bSGD\b/i.test(raw) || /S\$/i.test(raw)) {
    detectedCurrency = 'SGD';
  } else if (/\$/.test(raw)) {
    detectedCurrency = 'USD';
    confidence = 'ambiguous';
  }

  // 2. Clean currency symbols and currency tokens (keep digits, ., ,, -, +)
  let cleaned = raw
    .replace(/\b(IDR|USD|EUR|SGD|JPY|GBP)\b/gi, '')
    .replace(/(Rp|US\$|S\$|[$€¥£])/g, '')
    .replace(/[^\d.,\-+]/g, '')
    .trim();

  // Handle dot vs comma separator logic
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // Determine which is decimal and which is thousand separator
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      // European/Indonesian format: 1.250,50 -> 1250.50
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,250.50 -> 1250.50
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasComma && !hasDot) {
    // Comma only: Could be decimal (1250,50) or thousand (1,250,000)
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasDot && !hasComma) {
    // Dot only: Could be thousand (38.850.000) or decimal (1250.50)
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      // Multiple dots -> thousand separators: 38.850.000 -> 38850000
      cleaned = cleaned.replace(/\./g, '');
    } else if (parts.length === 2) {
      if (parts[1].length === 3 && parts[0].length >= 1) {
        // e.g. 50.000 -> 50000 (Indonesian thousand separator)
        cleaned = cleaned.replace(/\./g, '');
      } else if (parts[1].length > 3) {
        cleaned = cleaned.replace(/\./g, '');
      }
      // If 1 or 2 digits after dot, standard decimal: 1250.50 -> keep as decimal
    }
  }

  const parsedNum = parseFloat(cleaned);
  if (isNaN(parsedNum)) {
    return {
      amount: 0,
      currency: detectedCurrency,
      confidence: 'invalid',
      rawString: raw,
    };
  }

  return {
    amount: parsedNum,
    currency: detectedCurrency,
    confidence,
    rawString: raw,
  };
};


export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatDate = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const getStatusBadgeInfo = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        label: 'Terverifikasi',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'needs_review':
      return {
        label: 'Perlu Verifikasi',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'rejected':
      return {
        label: 'Ditolak',
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    case 'queued':
      return {
        label: 'Dalam Antrean',
        bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800',
        dot: 'bg-slate-400',
      };
    case 'preprocessing':
    case 'ocr_processing':
    case 'field_extraction':
    case 'schema_validation':
      return {
        label: 'Memproses AI...',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800',
        dot: 'bg-indigo-500 animate-pulse',
      };
    case 'failed':
      return {
        label: 'Gagal Ekstraksi',
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
        dot: 'bg-slate-400',
      };
  }
};

export const getDocumentTypeLabel = (type: string): string => {
  switch (type) {
    case 'tax_invoice':
      return 'Faktur Pajak (e-Faktur)';
    case 'commercial_invoice':
      return 'Invoice Komersial';
    case 'purchase_order':
      return 'Surat Pesanan (PO)';
    case 'delivery_order':
      return 'Surat Jalan (DO)';
    case 'receipt':
      return 'Kuitansi / Bukti Bayar';
    case 'contract':
      return 'Perjanjian Kontrak';
    case 'withholding_tax':
      return 'Bukti Potong PPh';
    default:
      return type;
  }
};

export const formatActionLabel = (action: string): string => {
  if (!action) return '';
  return action.replace(/_/g, ' ');
};


