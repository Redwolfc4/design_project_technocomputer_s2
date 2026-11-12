'use client';

import React, { useState, useMemo } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { DocumentRecord } from '@/types';
import { formatIDR, getDocumentTypeLabel } from '@/lib/utils/formatters';
import {
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';
import { Select } from '@/components/ui/Select';
import {
  DataTableToolbar,
  DataTableEmptyState,
  FilterConfig,
  DateRangeValue,
} from '@/components/shared/data-table';
import {
  dateToLocalISO,
  getPresetDateRange,
  isTimestampInDateRange,
} from '@/components/shared/data-table/date-picker/dateUtils';
import { useAppScope } from '@/context/ScopeContext';
import { useToast } from '@/context/ToastContext';

type QuickPeriod = 'all' | '7d' | '30d';

export default function AnalyticsDashboardPage() {
  const toast = useToast();
  const { activeCompanyId, activeDepartment } = useAppScope();
  const [documents] = useState<DocumentRecord[]>(() => DocumentService.getDocuments());
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>('all');
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: 'all' });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleQuickPeriodChange = (next: QuickPeriod) => {
    setQuickPeriod(next);
    if (next === 'all') {
      setDateRange({ preset: 'all' });
    } else if (next === '7d') {
      const { from, to } = getPresetDateRange('last_7_days');
      setDateRange({ preset: 'last_7_days', from, to });
    } else if (next === '30d') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      const pad = (n: number) => String(n).padStart(2, '0');
      const from = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
      const to = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      setDateRange({ preset: 'custom', from, to });
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (activeCompanyId !== 'all' && d.companyId && d.companyId !== activeCompanyId) return false;
      if (activeDepartment && activeDepartment.id !== 'all' && d.department) {
        if (d.department.toLowerCase() !== activeDepartment.name.toLowerCase()) return false;
      }
      if (typeFilter !== 'all' && d.documentType !== typeFilter) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (!isTimestampInDateRange(d.uploadedAt, dateRange)) return false;
      return true;
    });
  }, [documents, activeCompanyId, activeDepartment, typeFilter, statusFilter, dateRange]);

  const isFilterActive =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(dateRange && dateRange.preset !== 'all');

  const handleResetFilters = () => {
    setQuickPeriod('all');
    setDateRange({ preset: 'all' });
    setTypeFilter('all');
    setStatusFilter('all');
    toast.info('Filter analitik operasional berhasil direset.', { title: 'Filter Direset' });
  };

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'dateRange',
        label: 'Rentang Tanggal Masuk',
        type: 'date-range',
        placeholder: 'Semua Tanggal',
        selectedValue: dateRange,
        onChange: (val: DateRangeValue) => {
          setDateRange(val);
          if (!val || val.preset === 'all') setQuickPeriod('all');
          else if (val.preset === 'last_7_days') setQuickPeriod('7d');
          else setQuickPeriod('all');
        },
      },
      {
        id: 'documentType',
        label: 'Jenis Dokumen',
        type: 'select',
        placeholder: 'Semua Jenis',
        searchable: true,
        options: [
          { label: 'Semua Jenis Dokumen', value: 'all' },
          { label: 'Faktur Pajak Standar', value: 'tax_invoice', category: 'DJP / Perpajakan' },
          { label: 'Invoice Komersial', value: 'commercial_invoice', category: 'AP / Penagihan' },
          { label: 'Purchase Order (PO)', value: 'purchase_order', category: 'Pengadaan' },
          { label: 'Perjanjian Kontrak', value: 'contract', category: 'Legal' },
          { label: 'Bukti Potong PPh', value: 'withholding_tax', category: 'DJP / Perpajakan' },
          { label: 'Kuitansi / Receipt', value: 'receipt', category: 'Pengeluaran' },
        ],
        selectedValue: typeFilter,
        onChange: (val) => setTypeFilter(val || 'all'),
      },
      {
        id: 'status',
        label: 'Status Validasi',
        type: 'select',
        placeholder: 'Semua Status',
        searchable: true,
        options: [
          { label: 'Semua Status', value: 'all' },
          { label: 'Disetujui (Approved)', value: 'approved' },
          { label: 'Perlu Verifikasi (HITL)', value: 'needs_review' },
          { label: 'Ditolak (Rejected)', value: 'rejected' },
        ],
        selectedValue: statusFilter,
        onChange: (val) => setStatusFilter(val || 'all'),
      },
    ],
    [dateRange, typeFilter, statusFilter]
  );

  const totalDocs = filteredDocuments.length;
  const approvedDocs = filteredDocuments.filter((d) => d.status === 'approved');
  const reviewDocs = filteredDocuments.filter((d) => d.status === 'needs_review');
  const rejectedDocs = filteredDocuments.filter((d) => d.status === 'rejected');

  const avgConfidence =
    totalDocs > 0
      ? (filteredDocuments.reduce((acc, d) => acc + d.confidence, 0) / totalDocs).toFixed(1)
      : '0';

  const totalValue = filteredDocuments.reduce((acc, d) => acc + d.totalAmount, 0);

  const typeCounts = filteredDocuments.reduce((acc, d) => {
    acc[d.documentType] = (acc[d.documentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExportSummary = (format: 'csv' | 'xls') => {
    if (totalDocs === 0) {
      toast.error('Tidak ada data analitik untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }

    const headers = ['Jenis Dokumen', 'Jumlah Berkas', 'Persentase (%)', 'Total Nilai (IDR)'];
    const rows = Object.entries(typeCounts).map(([typeKey, count]) => {
      const subtotalType = filteredDocuments
        .filter((d) => d.documentType === typeKey)
        .reduce((acc, d) => acc + d.totalAmount, 0);
      const pct = Math.round((count / totalDocs) * 100);
      return [
        `"${getDocumentTypeLabel(typeKey as DocumentRecord['documentType'])}"`,
        count,
        `${pct}%`,
        subtotalType,
      ];
    });

    const delimiter = format === 'xls' ? '\t' : ',';
    const content = '\uFEFF' + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\r\n');
    const mimeType =
      format === 'xls' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';
    const filename = `ringkasan_analitik_dokumenai_${dateToLocalISO(new Date())}.${format}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Ringkasan analitik berhasil diekspor ke ${filename}!`, {
      title: `Ekspor ${format.toUpperCase()} Berhasil`,
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Analisis Operasional Dokumen & Kinerja AI"
        subtitle="Metrik throughput ekstraksi, akurasi OCR per tipe dokumen, dan beban verifikasi tim"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Analisis Operasional Dokumen & Kinerja AI"
          subtitle="Metrik throughput ekstraksi, akurasi OCR per tipe dokumen, dan beban verifikasi tim."
          badge={{ label: 'Realtime Telemetry', variant: 'success' }}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Periode Cepat:</span>
              <div className="w-44">
                <Select<QuickPeriod>
                  size="sm"
                  value={quickPeriod}
                  onChange={handleQuickPeriodChange}
                  aria-label="Filter Periode Analisis"
                  options={[
                    { value: 'all', label: 'Semua Waktu' },
                    { value: '7d', label: '7 Hari Terakhir' },
                    { value: '30d', label: '30 Hari Terakhir' },
                  ]}
                />
              </div>
            </div>
          }
        />

        {/* Enterprise Filter Toolbar + Export */}
        <DataTableToolbar
          compact
          filters={filterConfigs}
          totalFiltered={totalDocs}
          totalUnfiltered={documents.length}
          entityName="dokumen teranalisis"
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          exportOptions={{
            onExportCSV: () => handleExportSummary('csv'),
            onExportExcel: () => handleExportSummary('xls'),
            disabled: totalDocs === 0,
          }}
        />

        {/* KPI Metrik Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Volume Berkas</span>
              <FileTextIcon className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalDocs} Berkas</div>
            <p className="text-[11px] text-slate-500">Nilai: {formatIDR(totalValue)}</p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Rerata Akurasi AI</span>
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{avgConfidence}%</div>
            <p className="text-[11px] text-slate-500">Model: IndoFaktur v2.4 Vision</p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Disetujui (Approved)</span>
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{approvedDocs.length} Berkas</div>
            <p className="text-[11px] text-emerald-600 font-semibold">
              {totalDocs > 0 ? Math.round((approvedDocs.length / totalDocs) * 100) : 0}% Tingkat Kelulusan
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Antrean Verifikasi (HITL)</span>
              <ClockIcon className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{reviewDocs.length} Berkas</div>
            <p className="text-[11px] text-slate-500">Menunggu review verifikator</p>
          </div>
        </div>

        {/* Distribusi Jenis Dokumen & Status Breakdown */}
        {totalDocs === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <DataTableEmptyState
              isFilterActive={isFilterActive}
              onResetFilters={handleResetFilters}
              title="Tidak ada dokumen yang cocok dengan filter analitik"
              description="Coba ubah rentang tanggal, jenis dokumen, atau reset filter untuk melihat statistik lengkap."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
              <SectionHeader
                title="Komposisi Jenis Dokumen"
                description="Proporsi berkas yang diproses oleh sistem berdasarkan klasifikasi e-Faktur & invoice."
              />
              <div className="space-y-3 pt-2">
                {Object.entries(typeCounts).map(([typeKey, count]) => {
                  const percent = Math.round((count / totalDocs) * 100);
                  return (
                    <div key={typeKey} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{getDocumentTypeLabel(typeKey as DocumentRecord['documentType'])}</span>
                        <span className="text-slate-500">{count} berkas ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
              <SectionHeader
                title="Kinerja Verifikasi Human-in-the-Loop"
                description="Efisiensi peninjauan manual dan tingkat intervensi pada data ekstraksi AI."
              />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase">Tingkat Persetujuan</span>
                  <div className="text-2xl font-black text-emerald-700">
                    {Math.round((approvedDocs.length / totalDocs) * 100)}%
                  </div>
                  <p className="text-[10px] text-emerald-600">Lulus validasi compliance</p>
                </div>
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 uppercase">Tingkat Penolakan</span>
                  <div className="text-2xl font-black text-rose-700">
                    {Math.round((rejectedDocs.length / totalDocs) * 100)}%
                  </div>
                  <p className="text-[10px] text-rose-600">{rejectedDocs.length} berkas ditolak</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed">
                💡 <strong>Rekomendasi Otomasi:</strong> Ambang batas auto-approval saat ini aktif pada tingkat kepercayaan 95%. Dokumen dengan akurasi di bawah 95% dialihkan otomatis ke antrean Human-in-the-Loop.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
