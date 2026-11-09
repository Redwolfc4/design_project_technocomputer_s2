'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DocumentRecord } from '@/types';
import { formatIDR, formatDate, getStatusBadgeInfo, getDocumentTypeLabel } from '@/lib/utils/formatters';
import {
  ArrowRightIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  CopyIcon,
  CheckCircleIcon,
  DownloadIcon,
} from '@/components/ui/icons';
import {
  DataTableRow,
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
  DataTableToolbar,
  DataTablePagination,
  DataTableEmptyState,
  FilterConfig,
} from '@/components/shared/data-table';
import { DocumentQuickDetailModal } from '@/components/dashboard/documents/DocumentQuickDetailModal';

export default function DocumentRepositoryPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Interactivity
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNumber = doc.fileNumber.toLowerCase().includes(q);
        const matchVendor = doc.vendorName.toLowerCase().includes(q);
        const matchTitle = doc.title.toLowerCase().includes(q);
        if (!matchNumber && !matchVendor && !matchTitle) return false;
      }
      return true;
    });
  }, [documents, statusFilter, typeFilter, searchQuery]);

  // Pagination slice
  const totalItems = filteredDocs.length;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, currentPage, pageSize]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, pageSize]);

  const isFilterActive = searchQuery.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
    showToast('Filter repositori dokumen berhasil direset', 'info');
  };

  // Export functions
  const handleExportCSV = () => {
    const headers = ['Nomor Berkas', 'Nama Berkas', 'Kategori', 'Vendor', 'Tanggal Masuk', 'Total Nominal', 'Akurasi', 'Status'];
    const rows = filteredDocs.map((d) => [
      `"${d.fileNumber}"`,
      `"${d.fileName}"`,
      `"${getDocumentTypeLabel(d.documentType)}"`,
      `"${d.vendorName}"`,
      `"${d.uploadedAt}"`,
      d.totalAmount,
      `${d.confidence}%`,
      `"${d.status}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dokumenai_repositori_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Berhasil mengekspor ${filteredDocs.length} dokumen ke CSV!`, 'success');
  };

  const handleExportExcel = () => {
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #4F46E5; color: #FFFFFF; font-weight: bold;">
              <th>Nomor Berkas</th>
              <th>Nama Berkas</th>
              <th>Kategori</th>
              <th>Vendor</th>
              <th>Tanggal Masuk</th>
              <th>Total Nominal</th>
              <th>Akurasi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDocs
              .map(
                (d) => `
              <tr>
                <td>${d.fileNumber}</td>
                <td>${d.fileName}</td>
                <td>${getDocumentTypeLabel(d.documentType)}</td>
                <td>${d.vendorName}</td>
                <td>${d.uploadedAt}</td>
                <td>${d.totalAmount}</td>
                <td>${d.confidence}%</td>
                <td>${d.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dokumenai_repositori_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Berhasil mengekspor ${filteredDocs.length} dokumen ke Excel (.xls)!`, 'success');
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status Verifikasi',
      type: 'select',
      placeholder: 'Semua Status',
      options: [
        { label: 'Semua Status', value: 'all' },
        { label: 'Perlu Verifikasi', value: 'needs_review' },
        { label: 'Telah Disetujui', value: 'approved' },
        { label: 'Ditolak', value: 'rejected' },
      ],
      selectedValue: statusFilter,
      onChange: (val) => setStatusFilter(val),
    },
    {
      id: 'documentType',
      label: 'Jenis Dokumen',
      type: 'select',
      placeholder: 'Semua Tipe',
      options: [
        { label: 'Semua Tipe', value: 'all' },
        { label: 'Faktur Pajak (e-Faktur)', value: 'tax_invoice' },
        { label: 'Invoice Komersial', value: 'commercial_invoice' },
        { label: 'Purchase Order (PO)', value: 'purchase_order' },
        { label: 'Kontrak Perjanjian', value: 'contract' },
        { label: 'Bukti Potong PPh 23', value: 'withholding_tax' },
        { label: 'Kuitansi / Nota', value: 'receipt' },
      ],
      selectedValue: typeFilter,
      onChange: (val) => setTypeFilter(val),
      searchable: true,
    },
  ];

  // Row Actions Definition
  const documentActions: RowAction<DocumentRecord>[] = useMemo(
    () => [
      {
        id: 'open_workspace',
        label: 'Buka Workspace Verifikasi',
        icon: <ArrowRightIcon className="w-4 h-4 text-[#4F46E5]" />,
        onSelect: (doc) => router.push(`/dashboard/verification?docId=${doc.id}`),
      },
      {
        id: 'view_detail',
        label: 'Lihat Rincian Metadata',
        icon: <FileTextIcon className="w-4 h-4 text-[#64748B]" />,
        onSelect: (doc) => setPreviewDoc(doc),
      },
      {
        id: 'copy_number',
        label: 'Salin Nomor Berkas',
        icon: <CopyIcon className="w-4 h-4 text-[#64748B]" />,
        onSelect: (doc) => handleCopyText(doc.fileNumber, 'Nomor Berkas'),
        dividerAfter: true,
      },
      {
        id: 'quick_approve',
        label: 'Persetujuan Cepat (Instant Approve)',
        icon: <CheckCircleIcon className="w-4 h-4 text-emerald-600" />,
        disabled: (doc) => doc.status === 'approved',
        onSelect: (doc) => {
          MockDocumentService.updateDocumentStatus(doc.id, 'approved', 'Reviewer Tim');
          setDocuments(MockDocumentService.getDocuments());
          showToast(`Dokumen ${doc.fileNumber} berhasil disetujui!`, 'success');
        },
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
        title="Repositori Dokumen Enterprise"
        subtitle="Kelola, telusuri, dan saring seluruh arsip faktur, invoice, dan kontrak perusahaan"
        onSearch={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Reusable Global DataTableToolbar */}
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nomor berkas, nama vendor, atau judul dokumen..."
          filters={filterConfigs}
          totalFiltered={filteredDocs.length}
          totalUnfiltered={documents.length}
          entityName="dokumen"
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          exportOptions={{
            onExportCSV: handleExportCSV,
            onExportExcel: handleExportExcel,
          }}
          primaryAction={{
            label: "+ Unggah Dokumen",
            onClick: () => router.push('/dashboard/upload'),
          }}
        />

        {/* Documents Table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
                  <th className="py-3 px-5">Nomor & File</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5">Vendor / Lawan Transaksi</th>
                  <th className="py-3 px-5">Tanggal Masuk</th>
                  <th className="py-3 px-5">Total Nominal</th>
                  <th className="py-3 px-5">Akurasi</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                {paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <DataTableEmptyState
                        title="Tidak ada dokumen yang sesuai"
                        description="Coba ubah kata kunci pencarian atau sesuaikan filter status dan tipe dokumen."
                        isFilterActive={isFilterActive}
                        onResetFilters={handleResetFilters}
                        action={{
                          label: "Unggah Dokumen Baru",
                          onClick: () => router.push('/dashboard/upload'),
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map((doc) => {
                    const badge = getStatusBadgeInfo(doc.status);
                    return (
                      <DataTableRow
                        key={doc.id}
                        row={doc}
                        onRowDoubleClick={(d) => router.push(`/dashboard/verification?docId=${d.id}`)}
                        onRowContextMenu={(d, e) => openContextMenu(d, e, 'Aksi Dokumen')}
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-[#0F172A]">{doc.fileNumber}</div>
                          <div className="text-[11px] text-[#64748B]">{doc.fileName}</div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-[#475569]">
                          {getDocumentTypeLabel(doc.documentType)}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#0F172A]">
                          {doc.vendorName}
                        </td>
                        <td className="py-3.5 px-5 text-[#64748B]">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-[#0F172A]">
                          {formatIDR(doc.totalAmount)}
                        </td>
                        <td className="py-3.5 px-5">
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Reusable DataTablePagination Controls */}
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
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

      {/* Floating Action Menu (3-dot dropdown & context menu) */}
      {activeMenu && (
        <DataTableActionMenu
          isOpen={Boolean(activeMenu)}
          position={activeMenu.position}
          row={activeMenu.row}
          title={activeMenu.title || 'Aksi Dokumen'}
          subtitle={(d) => d.fileNumber}
          actions={documentActions}
          onClose={closeMenu}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={() => scheduleCloseMenu(250)}
        />
      )}
    </div>
  );
}
