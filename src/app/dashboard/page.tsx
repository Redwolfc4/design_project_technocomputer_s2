'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
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
} from '@/components/ui/icons';
import {
  DataTableRow,
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
} from '@/components/shared/data-table';
import { DocumentQuickDetailModal } from '@/components/dashboard/documents/DocumentQuickDetailModal';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

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
    setDocuments(MockDocumentService.getDocuments());
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

  const totalDocs = documents.length;
  const pendingDocs = documents.filter((d) => d.status === 'needs_review').length;
  const approvedDocs = documents.filter((d) => d.status === 'approved').length;
  const rejectedDocs = documents.filter((d) => d.status === 'rejected').length;

  const avgConfidence = documents.length
    ? Math.round(documents.reduce((acc, d) => acc + d.confidence, 0) / documents.length)
    : 0;

  const totalValue = documents
    .filter((d) => d.status === 'approved')
    .reduce((acc, d) => acc + d.totalAmount, 0);

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
    <div className="flex-1 flex flex-col relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-2xl text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <Topbar
        title="Ringkasan Operasional Dokumen"
        subtitle="Pantau volume ekstraksi AI, status verifikasi human-in-the-loop, dan kepatuhan faktur"
      />

      <main className="flex-1 p-8 space-y-8 max-w-7xl">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Documents */}
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Total Dokumen</span>
              <FileTextIcon className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{totalDocs} Berkas</div>
            <div className="text-[11px] text-[#059669] font-medium flex items-center gap-1">
              <span>↑ +18.4%</span>
              <span className="text-[#64748B]">dari bulan lalu</span>
            </div>
          </div>

          {/* Menunggu Review */}
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Perlu Verifikasi (HITL)</span>
              <AlertTriangleIcon className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{pendingDocs} Berkas</div>
            <div className="text-[11px] text-[#F59E0B] font-medium">
              Memerlukan tindakan akuntan
            </div>
          </div>

          {/* Disetujui */}
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Telah Disetujui & Valid</span>
              <CheckCircleIcon className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{approvedDocs} Berkas</div>
            <div className="text-[11px] text-[#059669] font-medium">
              Siap diekspor ke SAP ERP
            </div>
          </div>

          {/* Akurasi */}
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Akurasi Model AI</span>
              <LayersIcon className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{avgConfidence}% Skor</div>
            <div className="text-[11px] text-[#64748B] font-medium">
              Ambang batas otomatis: 95%
            </div>
          </div>
        </div>

        {/* Quick Action / Workflow Banner */}
        <div className="p-6 rounded-xl border border-[#CBD5E1] bg-gradient-to-r from-white via-white to-[#EEF2FF] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase font-extrabold tracking-wider text-[#4F46E5]">
              Simulasi Intelligent Processing
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Ada {pendingDocs} dokumen menunggu review mata manusia sebelum ekspor ke SAP ERP
            </h3>
            <p className="text-xs text-[#64748B]">
              Total nominal transaksi yang telah tervalidasi dan siap dibayar: <strong className="text-[#059669]">{formatIDR(totalValue)}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/upload"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] shadow-sm transition-all"
            >
              <UploadCloudIcon className="w-4 h-4 text-[#4F46E5]" />
              <span>Unggah Faktur Baru</span>
            </Link>
            <Link
              href="/dashboard/verification"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white shadow-sm transition-all"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Buka Reviewer Workspace</span>
            </Link>
          </div>
        </div>

        {/* Recent Documents Table Section */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Dokumen Terbaru Diproses</h2>
              <p className="text-xs text-[#64748B]">Daftar faktur, invoice, dan kontrak terkini dalam sistem</p>
            </div>
            <Link
              href="/dashboard/documents"
              className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
            >
              <span>Lihat Semua Dokumen</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                {documents.slice(0, 5).map((doc) => {
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
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              doc.confidence >= 90
                                ? 'text-[#059669]'
                                : doc.confidence >= 75
                                ? 'text-[#F59E0B]'
                                : 'text-[#E11D48]'
                            }`}
                          >
                            {doc.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
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
                          className="p-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#EEF2FF] text-slate-600 hover:text-[#4F46E5] transition-colors"
                        >
                          <MoreHorizontalIcon className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </DataTableRow>
                  );
                })}
              </tbody>
            </table>
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
