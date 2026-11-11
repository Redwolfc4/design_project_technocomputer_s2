'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { DocumentRecord } from '@/types';
import { formatIDR, formatDate, getStatusBadgeInfo, getDocumentTypeLabel } from '@/lib/utils/formatters';
import {
  FileTextIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  UploadCloudIcon,
  ArrowRightIcon,
  LayersIcon,
  MoreHorizontalIcon,
  CopyIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  FilterIcon,
  RotateCcwIcon,
  XIcon,
} from '@/components/ui/icons';
import {
  DataTableRow,
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
  DataTableFilters,
  DataTableResultCount,
  FilterConfig,
} from '@/components/shared/data-table';
import { DocumentQuickDetailModal } from '@/components/dashboard/documents/DocumentQuickDetailModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useAppMode } from '@/context/ModeContext';
import { useAppRoutes } from '@/context/RouteContext';
import { StatusDonutChart, StatusDonutItem } from '@/components/dashboard/analytics/charts/StatusDonutChart';
import { DocumentTypeBarChart, DocumentTypeItem } from '@/components/dashboard/analytics/charts/DocumentTypeBarChart';
import { DocumentTrendAreaChart } from '@/components/dashboard/analytics/charts/DocumentTrendAreaChart';
import { OperationalEfficiencyChart } from '@/components/dashboard/analytics/charts/OperationalEfficiencyChart';
import { DocumentStatus } from '@/types';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { isDemo, isProduction, tenantName } = useAppMode();
  const { getRoute } = useAppRoutes();
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => DocumentService.getDocuments());
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<DocumentStatus | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] = useState<'all' | 'today' | '7days' | 'month'>('all');

  const {
    activeMenu,
    closeMenu,
    openDropdownMenu,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    cancelScheduledClose,
    scheduleCloseMenu,
    openContextMenu,
  } = useDataTableInteractions<DocumentRecord>();

  useEffect(() => {
    setDocuments(DocumentService.getDocuments());
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} berhasil disalin ke clipboard!`);
    }
  };

  // Filtered documents for KPIs and analytics
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (activeStatusFilter && d.status !== activeStatusFilter) {
        return false;
      }
      if (activeTypeFilter && d.documentType !== activeTypeFilter) {
        return false;
      }
      if (activeDateRange !== 'all') {
        const docDate = new Date(d.uploadedAt || Date.now()).getTime();
        const now = new Date('2026-03-05T00:00:00Z').getTime(); // Anchored to mock data period (March 2026)
        const oneDay = 24 * 60 * 60 * 1000;

        if (activeDateRange === 'today') {
          // Within last 24-48 hours of mock latest date
          if (now - docDate > 2 * oneDay) return false;
        } else if (activeDateRange === '7days') {
          if (now - docDate > 7 * oneDay) return false;
        } else if (activeDateRange === 'month') {
          if (now - docDate > 31 * oneDay) return false;
        }
      }
      return true;
    });
  }, [documents, activeStatusFilter, activeTypeFilter, activeDateRange]);

  // Is any filter active
  const isAnyFilterActive = activeStatusFilter !== null || activeTypeFilter !== null || activeDateRange !== 'all';

  const handleResetFilters = () => {
    setActiveStatusFilter(null);
    setActiveTypeFilter(null);
    setActiveDateRange('all');
  };

  // Filter configurations for standard enterprise DataTableFilterSelect
  const dashboardFilterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'dateRange',
        label: 'Periode',
        type: 'select',
        placeholder: 'Semua Waktu',
        options: [
          { label: 'Semua Waktu', value: 'all' },
          { label: 'Hari Ini (48 Jam)', value: 'today' },
          { label: '7 Hari Terakhir', value: '7days' },
          { label: 'Bulan Ini (Maret 2026)', value: 'month' },
        ],
        selectedValue: activeDateRange,
        onChange: (val) => setActiveDateRange(val as any),
      },
      {
        id: 'status',
        label: 'Status Verifikasi',
        type: 'select',
        placeholder: 'Semua Status',
        options: [
          { label: 'Semua Status', value: 'all' },
          { label: 'Perlu Verifikasi (HITL)', value: 'needs_review' },
          { label: 'Telah Disetujui', value: 'approved' },
          { label: 'Ditolak', value: 'rejected' },
        ],
        selectedValue: activeStatusFilter || 'all',
        onChange: (val) => setActiveStatusFilter(val === 'all' ? null : (val as DocumentStatus)),
      },
      {
        id: 'documentType',
        label: 'Jenis Dokumen',
        type: 'select',
        placeholder: 'Semua Tipe',
        options: [
          { label: 'Semua Tipe', value: 'all' },
          { label: 'Faktur Pajak Standar', value: 'tax_invoice' },
          { label: 'Invoice Komersial', value: 'commercial_invoice' },
          { label: 'Purchase Order (PO)', value: 'purchase_order' },
          { label: 'Perjanjian Kontrak', value: 'contract' },
          { label: 'Bukti Potong PPh', value: 'withholding_tax' },
          { label: 'Kuitansi / Receipt', value: 'receipt' },
        ],
        selectedValue: activeTypeFilter || 'all',
        onChange: (val) => setActiveTypeFilter(val === 'all' ? null : val),
        searchable: true,
      },
    ],
    [activeDateRange, activeStatusFilter, activeTypeFilter]
  );

  // Metrics based on filteredDocuments
  const totalDocs = filteredDocuments.length || 1;
  const pendingDocs = filteredDocuments.filter((d) => d.status === 'needs_review').length;
  const approvedDocs = filteredDocuments.filter((d) => d.status === 'approved').length;
  const rejectedDocs = filteredDocuments.filter((d) => d.status === 'rejected').length;

  const avgConfidence = filteredDocuments.length
    ? Math.round(filteredDocuments.reduce((acc, d) => acc + d.confidence, 0) / filteredDocuments.length)
    : 0;

  const totalValue = filteredDocuments
    .filter((d) => d.status === 'approved')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  // Unfiltered count for reference
  const pendingDocsUnfiltered = documents.filter((d) => d.status === 'needs_review').length;
  const approvedValueUnfiltered = documents
    .filter((d) => d.status === 'approved')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  // Operational Analytics breakdown
  const firstPassApprovalRate = Math.round((approvedDocs / totalDocs) * 100);
  const typeCounts: Record<string, number> = {};
  filteredDocuments.forEach((d) => {
    typeCounts[d.documentType] = (typeCounts[d.documentType] || 0) + 1;
  });

  const donutItems: StatusDonutItem[] = [
    {
      status: 'approved',
      label: 'Terverifikasi & Siap Bayar',
      count: approvedDocs,
      color: '#059669',
      hoverColor: '#047857',
      bgLight: '#ECFDF5',
    },
    {
      status: 'needs_review',
      label: 'Perlu Validasi Reviewer',
      count: pendingDocs,
      color: '#F59E0B',
      hoverColor: '#D97706',
      bgLight: '#FFFBEB',
    },
    {
      status: 'rejected',
      label: 'Ditolak Karena Buram / Cacat',
      count: rejectedDocs,
      color: '#E11D48',
      hoverColor: '#BE123C',
      bgLight: '#FFF1F2',
    },
  ];

  const typeBarItems: DocumentTypeItem[] = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  // Filtered recent documents based on Topbar search & interactive chart filters
  const filteredRecentDocs = useMemo(() => {
    let list = documents;
    if (activeStatusFilter) {
      list = list.filter((d) => d.status === activeStatusFilter);
    }
    if (activeTypeFilter) {
      list = list.filter((d) => d.documentType === activeTypeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.fileNumber.toLowerCase().includes(q) ||
          d.vendorName.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 5);
  }, [documents, searchQuery, activeStatusFilter, activeTypeFilter]);

  const recentDocActions: RowAction<DocumentRecord>[] = useMemo(
    () => [
      {
        id: 'open_verification',
        label: 'Buka Workspace Verifikasi',
        icon: <ArrowRightIcon className="w-4 h-4 text-[#4F46E5]" />,
        onSelect: (doc) => router.push(getRoute(`/verification?docId=${doc.id}`)),
      },
      {
        id: 'quick_detail',
        label: 'Lihat Rincian Cepat',
        icon: <FileTextIcon className="w-4 h-4 text-[#64748B]" />,
        onSelect: (doc) => setPreviewDoc(doc),
      },
      {
        id: 'copy_faktur',
        label: 'Salin Nomor Faktur',
        icon: <CopyIcon className="w-4 h-4 text-[#64748B]" />,
        onSelect: (doc) => handleCopyText(doc.fileNumber, 'Nomor Faktur'),
      },
    ],
    [router, getRoute]
  );

  return (
    <div className="flex-1 flex flex-col relative w-full min-w-0">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-2xl text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Topbar Navigation Header */}
      <Topbar
        title="Ringkasan Utama"
        subtitle="Pantau performa pemrosesan dokumen, akurasi AI, status verifikasi, dan analisis operasional dalam satu dashboard"
        onSearch={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-8 min-w-0">
        {/* Banner Peringatan Lingkungan Demo */}
        {isDemo && (
          <div className="p-3.5 sm:p-4 rounded-xl border border-amber-300 bg-amber-50/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <strong>Lingkungan Simulasi & Evaluasi Produk:</strong> Data dan integrasi di halaman ini adalah simulasi lokal (sandbox) dan tidak memengaruhi pembukuan produksi riil.
              </div>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 text-center transition-colors shadow-2xs"
            >
              Masuk Akun Live
            </Link>
          </div>
        )}

        {/* Page Identity Header */}
        <PageHeader
          title="Ringkasan Utama & Analisis Operasional"
          subtitle={
            isProduction
              ? `Workspace Operasional AP & Pajak untuk ${tenantName}`
              : 'Pantau performa pemrosesan dokumen, akurasi AI, status verifikasi, dan analisis operasional dalam satu dashboard terpadu.'
          }
          badge={
            isProduction
              ? { label: 'Live Enterprise Sync', variant: 'success' }
              : { label: 'Simulasi Ekstraksi AI', variant: 'purple' }
          }
        />

        {/* 1. Intelligent Processing Overview & Quick Actions Banner (Dipindah ke Atas Card Counter) */}
        <div className="p-6 sm:p-7 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/30 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 min-w-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase font-extrabold tracking-wider text-[#4F46E5]">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
              <span>{isProduction ? 'Antrean Verifikasi Dokumen Masuk' : 'Simulasi Intelligent Processing'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
              Ada {pendingDocsUnfiltered} dokumen menunggu review mata manusia sebelum ekspor ke SAP ERP
            </h3>
            <p className="text-xs sm:text-[13px] text-[#64748B]">
              Total nominal transaksi yang telah tervalidasi dan siap dibayar:{' '}
              <strong className="text-[#059669] font-bold">{formatIDR(approvedValueUnfiltered)}</strong>
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href={getRoute('/upload')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] shadow-2xs hover:border-[#94A3B8] transition-all"
            >
              <UploadCloudIcon className="w-4 h-4 text-[#4F46E5]" />
              <span className="whitespace-nowrap">Unggah Faktur Baru</span>
            </Link>
            <Link
              href={getRoute('/verification')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white shadow-xs transition-all"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span className="whitespace-nowrap">Buka Reviewer Workspace</span>
            </Link>
          </div>
        </div>

        {/* 2. Baris Filter Reaktif Standard Enterprise (DataTableFilters) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4 min-w-0">
          {/* Dropdown Filters Row */}
          <DataTableFilters filters={dashboardFilterConfigs} />

          {/* Action Bar (Hanya tampil saat filter aktif untuk Reset) */}
          {isAnyFilterActive && (
            <div className="flex items-center justify-end pt-3 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                title="Kembalikan semua filter ke kondisi awal"
              >
                <RotateCcwIcon className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Primary KPI Cards Grid (Interactive & Clickable - Dinamis Mengikuti Filter) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 [grid-template-columns:repeat(auto-fit,minmax(0,1fr))]">
          {/* Total Documents -> /dashboard/documents */}
          <Link
            href={getRoute('/documents')}
            className="group p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-3 min-w-0 flex flex-col justify-between hover:border-[#4F46E5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] group-hover:text-[#4F46E5] transition-colors">
              <span className="truncate flex items-center gap-1">
                Total Dokumen
                <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F46E5]" />
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0 ml-2 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                <FileTextIcon className="w-4 h-4 text-[#4F46E5] group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{filteredDocuments.length} Berkas</div>
              <div className="text-[11px] text-[#059669] font-medium flex items-center gap-1 mt-1">
                <span>↑ +18.4%</span>
                <span className="text-[#64748B]">volume bulan ini</span>
              </div>
            </div>
          </Link>

          {/* Menunggu Review (HITL) -> /dashboard/verification */}
          <Link
            href={getRoute('/verification')}
            className="group p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-3 min-w-0 flex flex-col justify-between hover:border-[#F59E0B] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] group-hover:text-[#F59E0B] transition-colors">
              <span className="truncate flex items-center gap-1">
                Perlu Verifikasi (HITL)
                <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#F59E0B]" />
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 ml-2 group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
                <AlertTriangleIcon className="w-4 h-4 text-[#F59E0B] group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{pendingDocs} Berkas</div>
              <div className="text-[11px] text-[#F59E0B] font-medium mt-1 truncate">
                Memerlukan tindakan akuntan
              </div>
            </div>
          </Link>

          {/* Disetujui & Valid -> /dashboard/export */}
          <Link
            href={getRoute('/export')}
            className="group p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-3 min-w-0 flex flex-col justify-between hover:border-[#059669] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] group-hover:text-[#059669] transition-colors">
              <span className="truncate flex items-center gap-1">
                Telah Disetujui & Valid
                <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#059669]" />
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 ml-2 group-hover:bg-[#059669] group-hover:text-white transition-colors">
                <CheckCircleIcon className="w-4 h-4 text-[#059669] group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{approvedDocs} Berkas</div>
              <div className="text-[11px] text-[#059669] font-medium mt-1 truncate">
                Siap diekspor ke SAP ERP
              </div>
            </div>
          </Link>

          {/* Akurasi Model AI -> /dashboard/settings */}
          <Link
            href={getRoute('/settings')}
            className="group p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-3 min-w-0 flex flex-col justify-between hover:border-[#4F46E5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] group-hover:text-[#4F46E5] transition-colors">
              <span className="truncate flex items-center gap-1">
                Akurasi Model AI
                <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F46E5]" />
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 ml-2 group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                <LayersIcon className="w-4 h-4 text-[#4F46E5] group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{avgConfidence}% Skor</div>
              <div className="text-[11px] text-[#64748B] font-medium mt-1 truncate">
                Ambang batas otomatis: 95%
              </div>
            </div>
          </Link>
        </div>

        {/* 3. Section: Analisis Operasional & Efisiensi Finansial */}
        <div className="space-y-6 min-w-0">
          <SectionHeader
            title="Analisis Operasional & Efisiensi Finansial"
            description="Metrik waktu siklus verifikasi otomatis, distribusi status faktur, dan efisiensi jam kerja AP"
          />

          {/* Efficiency Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-5 min-w-0">
            {/* Tingkat Persetujuan Pertama -> /dashboard/documents?status=approved */}
            <Link
              href={getRoute('/documents?status=approved')}
              className="group p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-2 min-w-0 hover:border-[#059669] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] group-hover:text-[#059669] transition-colors">
                <span className="truncate">Tingkat Persetujuan Pertama</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#059669]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#059669] tracking-tight">
                {firstPassApprovalRate}%
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">Dokumen langsung lolos verifikasi tanpa koreksi manual</p>
            </Link>

            {/* Rerata Waktu Pemrosesan AI */}
            <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-2 min-w-0">
              <span className="text-xs font-semibold text-[#64748B] block truncate">Rerata Waktu Pemrosesan AI</span>
              <div className="text-2xl sm:text-3xl font-black text-[#4F46E5] tracking-tight">1.4 Detik</div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">Dari upload scan hingga ekstraksi bidang JSON</p>
            </div>

            {/* Estimasi Jam Kerja Hemat -> /dashboard/audit */}
            <Link
              href={getRoute('/audit')}
              className="group p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-2 min-w-0 hover:border-[#4F46E5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] group-hover:text-[#4F46E5] transition-colors">
                <span className="truncate">Estimasi Jam Kerja Hemat</span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F46E5]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">184 Jam</div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">Dibandingkan pengetikan manual per lembar nota (cek di audit)</p>
            </Link>
          </div>

          {/* Breakdown Distribution Grid: Interactive Donut & Horizontal Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            <StatusDonutChart
              items={donutItems}
              total={documents.length}
              activeFilter={activeStatusFilter}
              onSelectStatus={setActiveStatusFilter}
            />

            <DocumentTypeBarChart
              items={typeBarItems}
              total={documents.length}
              activeTypeFilter={activeTypeFilter}
              onSelectType={setActiveTypeFilter}
            />
          </div>

          {/* Row 4: Throughput Trend Area Chart & ROI Operational Efficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            <DocumentTrendAreaChart isDemo={isDemo} />
            <OperationalEfficiencyChart totalDocs={documents.length} />
          </div>
        </div>

        {/* 4. Section: Dokumen Terbaru Diproses */}
        <div className="space-y-4">
          <SectionHeader
            title="Dokumen Terbaru Diproses"
            description={
              activeStatusFilter || activeTypeFilter
                ? `Menampilkan dokumen hasil filter interaktif: ${activeStatusFilter ? `Status [${activeStatusFilter}]` : ''
                } ${activeTypeFilter ? `Jenis [${getDocumentTypeLabel(activeTypeFilter)}]` : ''}`
                : 'Daftar faktur, invoice, dan kontrak terkini dalam sistem IDP'
            }
            action={
              <div className="flex items-center gap-3">
                {(activeStatusFilter || activeTypeFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStatusFilter(null);
                      setActiveTypeFilter(null);
                    }}
                    className="text-xs font-bold text-[#E11D48] hover:underline cursor-pointer"
                  >
                    Hapus Filter Chart ✕
                  </button>
                )}
                <Link
                  href={getRoute('/documents')}
                  className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] inline-flex items-center gap-1"
                >
                  <span>Lihat Semua Dokumen</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            }
          />

          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
                    <th className="py-3 px-5">Nomor Dokumen / Judul</th>
                    <th className="py-3 px-5">Jenis Dokumen</th>
                    <th className="py-3 px-5">Vendor / Entitas</th>
                    <th className="py-3 px-5">Total Nilai</th>
                    <th className="py-3 px-5">Akurasi</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                  {filteredRecentDocs.length > 0 ? (
                    filteredRecentDocs.map((doc) => {
                      const badge = getStatusBadgeInfo(doc.status);
                      return (
                        <DataTableRow
                          key={doc.id}
                          row={doc}
                          onRowDoubleClick={(d) => router.push(getRoute(`/verification?docId=${d.id}`))}
                          onRowContextMenu={(d, e) => openContextMenu(d, e, 'Aksi Dokumen')}
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-[#0F172A]">{doc.fileNumber}</div>
                            <div className="text-[11px] text-[#64748B] truncate max-w-xs">{doc.title}</div>
                          </td>
                          <td className="py-3.5 px-5 font-medium text-[#475569]">
                            {getDocumentTypeLabel(doc.documentType)}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-medium text-[#0F172A]">{doc.vendorName}</div>
                            {doc.vendorTaxId && (
                              <div className="text-[10px] text-[#64748B]">NPWP: {doc.vendorTaxId}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-[#0F172A]">
                            {formatIDR(doc.totalAmount)}
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`font-bold ${doc.confidence >= 90
                                ? 'text-[#059669]'
                                : doc.confidence >= 75
                                  ? 'text-[#F59E0B]'
                                  : 'text-[#E11D48]'
                                }`}
                            >
                              {doc.confidence}%
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => openDropdownMenu(doc, e, 'Aksi Dokumen')}
                              onMouseEnter={(e) => handleButtonMouseEnter(doc, e, 'Aksi Dokumen')}
                              onMouseLeave={handleButtonMouseLeave}
                              title="Menu Aksi"
                              className="p-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#EEF2FF] text-slate-600 hover:text-[#4F46E5] transition-colors cursor-pointer"
                            >
                              <MoreHorizontalIcon className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </DataTableRow>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#64748B]">
                        Tidak ada dokumen yang sesuai dengan pencarian &quot;{searchQuery}&quot;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Detail Modal */}
      {previewDoc && (
        <DocumentQuickDetailModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onCopyText={handleCopyText}
        />
      )}

      {/* Floating Action Menu */}
      {activeMenu && (
        <DataTableActionMenu
          isOpen={Boolean(activeMenu)}
          position={activeMenu.position}
          row={activeMenu.row}
          title={activeMenu.title || 'Aksi Dokumen'}
          subtitle={(d) => d.fileNumber}
          actions={recentDocActions}
          onClose={closeMenu}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={() => scheduleCloseMenu(250)}
        />
      )}
    </div>
  );
}
