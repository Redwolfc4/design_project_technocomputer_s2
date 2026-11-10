export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
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


