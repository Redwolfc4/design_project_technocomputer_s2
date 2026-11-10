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
} from '@/components/ui/icons';
import {
  DataTableRow,
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
} from '@/components/shared/data-table';
import { DocumentQuickDetailModal } from '@/components/dashboard/documents/DocumentQuickDetailModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useAppMode } from '@/context/ModeContext';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { isDemo, isProduction, tenantName } = useAppMode();
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => DocumentService.getDocuments());
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Base metrics
  const totalDocs = documents.length || 1;
  const pendingDocs = documents.filter((d) => d.status === 'needs_review').length;
  const approvedDocs = documents.filter((d) => d.status === 'approved').length;
  const rejectedDocs = documents.filter((d) => d.status === 'rejected').length;

  const avgConfidence = documents.length
    ? Math.round(documents.reduce((acc, d) => acc + d.confidence, 0) / documents.length)
    : 0;

  const totalValue = documents
    .filter((d) => d.status === 'approved')
    .reduce((acc, d) => acc + d.totalAmount, 0);

  // Operational Analytics breakdown
  const firstPassApprovalRate = Math.round((approvedDocs / totalDocs) * 100);
  const typeCounts: Record<string, number> = {};
  documents.forEach((d) => {
    typeCounts[d.documentType] = (typeCounts[d.documentType] || 0) + 1;
  });

  // Filtered recent documents based on Topbar search
  const filteredRecentDocs = useMemo(() => {
    let list = documents;
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
  }, [documents, searchQuery]);

  const recentDocActions: RowAction<DocumentRecord>[] = useMemo(
    () => [
      {
        id: 'open_verification',
        label: 'Buka Workspace Verifikasi',
        icon: <ArrowRightIcon className="w-4 h-4 text-[#4F46E5]" />,
        onSelect: (doc) => router.push(`/dashboard/verification?docId=${doc.id}`),
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
    [router]
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
              ? { label: 'Live Enterprise Telemetry', variant: 'success' }
              : { label: 'Simulasi Ekstraksi AI', variant: 'purple' }
          }
        />

        {/* 1. Primary KPI Cards Grid (Interactive & Clickable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-5 [grid-template-columns:repeat(auto-fit,minmax(0,1fr))]">
          {/* Total Documents -> /dashboard/documents */}
          <Link
            href="/dashboard/documents"
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
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{documents.length} Berkas</div>
              <div className="text-[11px] text-[#059669] font-medium flex items-center gap-1 mt-1">
                <span>↑ +18.4%</span>
                <span className="text-[#64748B]">volume bulan ini</span>
              </div>
            </div>
          </Link>

          {/* Menunggu Review (HITL) -> /dashboard/verification */}
          <Link
            href="/dashboard/verification"
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
            href="/dashboard/export"
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
            href="/dashboard/settings"
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

        {/* 2. Intelligent Processing Overview & Quick Actions Banner */}
        <div className="p-6 sm:p-7 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/30 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 min-w-0">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase font-extrabold tracking-wider text-[#4F46E5]">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
              <span>{isProduction ? 'Antrean Verifikasi Dokumen Masuk' : 'Simulasi Intelligent Processing'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
              Ada {pendingDocs} dokumen menunggu review mata manusia sebelum ekspor ke SAP ERP
            </h3>
            <p className="text-xs sm:text-[13px] text-[#64748B]">
              Total nominal transaksi yang telah tervalidasi dan siap dibayar:{' '}
              <strong className="text-[#059669] font-bold">{formatIDR(totalValue)}</strong>
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/upload"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] shadow-2xs hover:border-[#94A3B8] transition-all"
            >
              <UploadCloudIcon className="w-4 h-4 text-[#4F46E5]" />
              <span className="whitespace-nowrap">Unggah Faktur Baru</span>
            </Link>
            <Link
              href="/dashboard/verification"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white shadow-xs transition-all"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span className="whitespace-nowrap">Buka Reviewer Workspace</span>
            </Link>
          </div>
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
              href="/dashboard/documents?status=approved"
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
              href="/dashboard/audit"
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

          {/* Breakdown Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            {/* Status Distribution */}
            <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-4 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">Distribusi Status Dokumen</h3>
              <div className="space-y-3.5">
                {/* Approved Link */}
                <Link
                  href="/dashboard/documents?status=approved"
                  className="group block p-2 -mx-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#059669] group-hover:underline flex items-center gap-1">
                      Terverifikasi & Siap Bayar
                      <ArrowUpRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#059669]" />
                    </span>
                    <span className="tabular-nums text-[#0F172A]">{approvedDocs} berkas ({Math.round((approvedDocs / totalDocs) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#059669] rounded-full transition-all duration-500"
                      style={{ width: `${(approvedDocs / totalDocs) * 100}%` }}
                    />
                  </div>
                </Link>

                {/* Pending Link */}
                <Link
                  href="/dashboard/verification"
                  className="group block p-2 -mx-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#F59E0B] group-hover:underline flex items-center gap-1">
                      Perlu Validasi Reviewer
                      <ArrowUpRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#F59E0B]" />
                    </span>
                    <span className="tabular-nums text-[#0F172A]">{pendingDocs} berkas ({Math.round((pendingDocs / totalDocs) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                      style={{ width: `${(pendingDocs / totalDocs) * 100}%` }}
                    />
                  </div>
                </Link>

                {/* Rejected Link */}
                <Link
                  href="/dashboard/documents?status=rejected"
                  className="group block p-2 -mx-2 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#E11D48] group-hover:underline flex items-center gap-1">
                      Ditolak Karena Buram / Cacat
                      <ArrowUpRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#E11D48]" />
                    </span>
                    <span className="tabular-nums text-[#0F172A]">{rejectedDocs} berkas ({Math.round((rejectedDocs / totalDocs) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#E11D48] rounded-full transition-all duration-500"
                      style={{ width: `${(rejectedDocs / totalDocs) * 100}%` }}
                    />
                  </div>
                </Link>
              </div>
            </div>

            {/* Volume by Document Type */}
            <div className="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">Volume Berdasarkan Jenis Berkas</h3>
              <div className="space-y-2.5">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <Link
                    key={type}
                    href={`/dashboard/documents?type=${type}`}
                    className="group flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-transparent hover:border-indigo-200 transition-all cursor-pointer block"
                  >
                    <span className="font-semibold text-[#334155] group-hover:text-[#4F46E5] flex items-center gap-1.5 transition-colors">
                      {getDocumentTypeLabel(type)}
                      <ArrowUpRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F46E5]" />
                    </span>
                    <span className="font-bold text-[#0F172A] group-hover:text-[#4F46E5] bg-white px-2.5 py-0.5 rounded border border-[#CBD5E1] group-hover:border-indigo-200 transition-colors">
                      {count} Berkas
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Section: Dokumen Terbaru Diproses */}
        <div className="space-y-4">
          <SectionHeader
            title="Dokumen Terbaru Diproses"
            description="Daftar faktur, invoice, dan kontrak terkini dalam sistem IDP"
            action={
              <Link
                href="/dashboard/documents"
                className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] inline-flex items-center gap-1"
              >
                <span>Lihat Semua Dokumen</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
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
                          onRowDoubleClick={(d) => router.push(`/dashboard/verification?docId=${d.id}`)}
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
