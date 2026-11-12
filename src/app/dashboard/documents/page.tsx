'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { DocumentRecord } from '@/types';
import { formatCurrency, formatIDR, formatDate, getStatusBadgeInfo, getDocumentTypeLabel, parseCurrencyInput } from '@/lib/utils/formatters';
import {
  ArrowRightIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  CopyIcon,
  CheckCircleIcon,
  XCircleIcon,
  DownloadIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
  PlusIcon,
} from '@/components/ui/icons';
import {
  DataTableRow,
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
  DataTableToolbar,
  DataTablePagination,
  DataTableEmptyState,
  DataTableExport,
  FilterConfig,
  DateRangeValue,
} from '@/components/shared/data-table';
import { DocumentQuickDetailModal } from '@/components/dashboard/documents/DocumentQuickDetailModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAppRoutes } from '@/context/RouteContext';
import { useAppScope } from '@/context/ScopeContext';

function DocumentRepositoryContent() {
  const router = useRouter();
  const { getRoute } = useAppRoutes();
  const { activeCompanyId, activeDepartment } = useAppScope();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => DocumentService.getDocuments());
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(() => searchParams.get('type') || 'all');
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: 'all' });
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const s = searchParams.get('status');
    const t = searchParams.get('type');
    if (s) setStatusFilter(s);
    if (t) setTypeFilter(t);
  }, [searchParams]);

  // Modals & Interactivity
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentRecord | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentRecord | null>(null);
  const [editFormData, setEditFormData] = useState<{
    fileNumber: string;
    vendorName: string;
    vendorTaxId: string;
    totalAmount: string;
    currency: string;
    notes: string;
  }>({
    fileNumber: '',
    vendorName: '',
    vendorTaxId: '',
    totalAmount: '0',
    currency: 'IDR',
    notes: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

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
    setDocuments(DocumentService.getDocuments());
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleOpenEdit = (doc: DocumentRecord) => {
    if (doc.status === 'approved' || doc.status === 'rejected') {
      showToast(`Dokumen berstatus '${doc.status}' terkunci dari modifikasi.`, 'error');
      return;
    }
    setEditDoc(doc);
    setEditFormData({
      fileNumber: doc.fileNumber,
      vendorName: doc.vendorName,
      vendorTaxId: doc.vendorTaxId || '',
      totalAmount: doc.totalAmount.toString(),
      currency: doc.currency || 'IDR',
      notes: '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;
    const parsed = parseCurrencyInput(editFormData.totalAmount, editFormData.currency);
    const res = DocumentService.updateMetadata(editDoc.id, {
      fileNumber: editFormData.fileNumber.trim(),
      vendorName: editFormData.vendorName.trim(),
      vendorTaxId: editFormData.vendorTaxId.trim(),
      totalAmount: parsed.amount,
      notes: editFormData.notes.trim() || undefined,
    });

    if (!res.success) {
      showToast(res.error || 'Gagal memperbarui metadata.', 'error');
      return;
    }

    setDocuments(DocumentService.getDocuments());
    setEditDoc(null);
    showToast(`Metadata dokumen ${editFormData.fileNumber} berhasil diperbarui!`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!deleteDoc) return;
    const res = DocumentService.deleteDocument(deleteDoc.id);
    if (!res.success) {
      showToast(res.error || 'Gagal menghapus dokumen.', 'error');
      return;
    }

    setDocuments(DocumentService.getDocuments());
    showToast(`Dokumen ${deleteDoc.fileNumber} berhasil dihapus dari repositori.`, 'success');
    setDeleteDoc(null);
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} berhasil disalin ke clipboard!`);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // 0. Scope Filtering: Company & Department Isolation
      if (activeCompanyId !== 'all') {
        const docCompanyId = (doc as any).companyId || 'comp-01';
        if (docCompanyId !== activeCompanyId) return false;
      }
      if (activeDepartment && activeDepartment.id !== 'all') {
        const docDept = (doc as any).department;
        if (docDept && docDept.toLowerCase() !== activeDepartment.name.toLowerCase()) {
          return false;
        }
      }

      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (typeFilter !== 'all' && doc.documentType !== typeFilter) return false;

      // Filter Akurasi AI
      if (confidenceFilter === 'high' && doc.confidence < 90) return false;
      if (confidenceFilter === 'medium' && (doc.confidence < 80 || doc.confidence >= 90)) return false;
      if (confidenceFilter === 'low' && doc.confidence >= 80) return false;

      // Filter Rentang Tanggal
      if (dateRange && dateRange.preset !== 'all' && doc.uploadedAt) {
        const docDate = new Date(doc.uploadedAt);
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (docDate < fromDate) return false;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (docDate > toDate) return false;
        }
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNumber = doc.fileNumber.toLowerCase().includes(q);
        const matchVendor = doc.vendorName.toLowerCase().includes(q);
        const matchTitle = doc.title.toLowerCase().includes(q);
        if (!matchNumber && !matchVendor && !matchTitle) return false;
      }
      return true;
    });
  }, [documents, statusFilter, typeFilter, confidenceFilter, dateRange, searchQuery]);

  // Pagination slice
  const totalItems = filteredDocs.length;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, currentPage, pageSize]);

  // Reset page when filter/search/scope changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, confidenceFilter, dateRange, activeCompanyId, activeDepartment, pageSize]);

  const isFilterActive =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    confidenceFilter !== 'all' ||
    Boolean(dateRange && dateRange.preset !== 'all');

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setConfidenceFilter('all');
    setDateRange({ preset: 'all' });
    setCurrentPage(1);
    showToast('Filter repositori dokumen berhasil direset', 'info');
  };

  // Export functions
  const handleExportCSV = () => {
    const headers = ['Nomor Berkas', 'Nama Berkas', 'Kategori', 'Vendor', 'Tanggal Masuk', 'Total Nominal', 'Currency', 'Total Nominal Formatted', 'Akurasi', 'Status'];
    const rows = filteredDocs.map((d) => [
      `"${d.fileNumber}"`,
      `"${d.fileName}"`,
      `"${getDocumentTypeLabel(d.documentType)}"`,
      `"${d.vendorName}"`,
      `"${d.uploadedAt}"`,
      d.totalAmount,
      `"${d.currency || 'IDR'}"`,
      `"${formatCurrency(d.totalAmount, d.currency || 'IDR')}"`,
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
              <th>Mata Uang</th>
              <th>Total Nominal</th>
              <th>Nominal Diformat</th>
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
                <td style="text-align: center;">${d.currency || 'IDR'}</td>
                <td style="mso-number-format:'\\#\\,\\#\\#0\\.00'; text-align: right;">${d.totalAmount}</td>
                <td style="text-align: right;">${formatCurrency(d.totalAmount, d.currency || 'IDR')}</td>
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
    {
      id: 'dateRange',
      label: 'Rentang Tanggal Masuk',
      type: 'date-range',
      placeholder: 'Semua Waktu',
      selectedValue: dateRange,
      onChange: (val) => setDateRange(val as DateRangeValue),
    },
    {
      id: 'confidence',
      label: 'Tingkat Akurasi AI',
      type: 'select',
      placeholder: 'Semua Skor',
      options: [
        { label: 'Semua Skor Akurasi', value: 'all' },
        { label: 'Tinggi (≥ 90%)', value: 'high' },
        { label: 'Perlu Tinjauan (80% - 89%)', value: 'medium' },
        { label: 'Kritis / Rendah (< 80%)', value: 'low' },
      ],
      selectedValue: confidenceFilter,
      onChange: (val) => setConfidenceFilter(val),
    },
  ];

  // Row Actions Definition
  const documentActions: RowAction<DocumentRecord>[] = useMemo(
    () => [
      {
        id: 'open_workspace',
        label: 'Buka Workspace Verifikasi',
        icon: <ArrowRightIcon className="w-4 h-4 text-[#4F46E5]" />,
        onSelect: (doc) => router.push(getRoute(`/verification?docId=${doc.id}`)),
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
      },
      {
        id: 'edit_metadata',
        label: 'Ubah Metadata Dokumen',
        icon: <PencilIcon className="w-4 h-4 text-amber-600" />,
        disabled: (doc) => doc.status === 'approved' || doc.status === 'rejected',
        onSelect: (doc) => handleOpenEdit(doc),
      },
      {
        id: 'delete_doc',
        label: 'Hapus dari Repositori',
        icon: <TrashIcon className="w-4 h-4 text-rose-600" />,
        disabled: (doc) => doc.status === 'approved',
        onSelect: (doc) => setDeleteDoc(doc),
        dividerAfter: true,
      },
      {
        id: 'quick_approve',
        label: 'Persetujuan Cepat (Instant Approve)',
        icon: <CheckCircleIcon className="w-4 h-4 text-emerald-600" />,
        disabled: (doc) => doc.status === 'approved' || doc.status === 'rejected',
        onSelect: (doc) => {
          const res = DocumentService.updateStatus(doc.id, 'approved', 'Reviewer Tim');
          if (!res.success) {
            showToast(res.error || 'Gagal menyetujui dokumen.', 'error');
            return;
          }
          setDocuments(DocumentService.getDocuments());
          showToast(`Dokumen ${doc.fileNumber} berhasil disetujui!`, 'success');
        },
      },
      {
        id: 'quick_reject',
        label: 'Penolakan Cepat (Instant Reject)',
        icon: <XCircleIcon className="w-4 h-4 text-rose-600" />,
        destructive: true,
        disabled: (doc) => doc.status === 'approved' || doc.status === 'rejected',
        onSelect: (doc) => {
          const res = DocumentService.updateStatus(
            doc.id,
            'rejected',
            'Reviewer Tim',
            'Ditolak cepat melalui repositori dokumen'
          );
          if (!res.success) {
            showToast(res.error || 'Gagal menolak dokumen.', 'error');
            return;
          }
          setDocuments(DocumentService.getDocuments());
          showToast(`Dokumen ${doc.fileNumber} berhasil ditolak.`, 'error');
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
          {toast.type === 'error' ? (
            <XCircleIcon className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <Topbar
        title="Repositori Dokumen Enterprise"
        subtitle="Kelola, telusuri, dan saring seluruh arsip faktur, invoice, dan kontrak perusahaan"
        onSearch={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Repositori Dokumen Enterprise"
          subtitle="Kelola, telusuri, dan saring seluruh arsip faktur, invoice, dan kontrak perusahaan."
          badge={{ label: 'Arsip Aktif', variant: 'info' }}
          actions={
            <div className="flex items-center gap-3">
              <DataTableExport
                options={{
                  onExportCSV: handleExportCSV,
                  onExportExcel: handleExportExcel,
                }}
              />
              <button
                onClick={() => router.push(getRoute('/upload'))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Unggah Dokumen</span>
              </button>
            </div>
          }
        />

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
                  <th className="py-3 px-5 text-right">Total Nominal</th>
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
                          onClick: () => router.push(getRoute('/upload')),
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
                        onRowDoubleClick={(d) => router.push(getRoute(`/verification?docId=${d.id}`))}
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
                        <td className="py-3.5 px-5 font-bold text-[#0F172A] text-right tabular-nums">
                          <div className="flex items-center justify-end gap-1.5">
                            <span>{formatCurrency(doc.totalAmount, doc.currency)}</span>
                            {doc.currency && doc.currency !== 'IDR' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {doc.currency}
                              </span>
                            )}
                          </div>
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

      {/* Modal Edit Metadata */}
      {editDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Ubah Metadata Dokumen</h3>
              <button onClick={() => setEditDoc(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor Berkas / Faktur</label>
                <input
                  type="text"
                  value={editFormData.fileNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, fileNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Rekanan / Vendor</label>
                <input
                  type="text"
                  value={editFormData.vendorName}
                  onChange={(e) => setEditFormData({ ...editFormData, vendorName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">NPWP Vendor</label>
                <input
                  type="text"
                  value={editFormData.vendorTaxId}
                  onChange={(e) => setEditFormData({ ...editFormData, vendorTaxId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mata Uang</label>
                  <select
                    value={editFormData.currency}
                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 bg-white font-semibold text-slate-800"
                  >
                    <option value="IDR">IDR — Rupiah Indonesia</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="SGD">SGD — Singapore Dollar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Nilai Transaksi</label>
                  <input
                    type="text"
                    value={editFormData.totalAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, totalAmount: e.target.value })}
                    placeholder="Contoh: 38850000 atau 1,250.50"
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 font-semibold"
                    required
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">Pratinjau Format:</span>
                <span className="font-bold text-[#059669]">
                  {formatCurrency(parseCurrencyInput(editFormData.totalAmount, editFormData.currency).amount, editFormData.currency)}
                </span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Catatan Perubahan</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Tambahkan alasan koreksi metadata..."
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditDoc(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Dokumen */}
      {deleteDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2">
              <TrashIcon className="w-4 h-4" />
              <span>Hapus Dokumen?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <strong className="text-slate-900">{deleteDoc.fileNumber}</strong> ({deleteDoc.fileName}) dari repositori? Tindakan ini akan dicatat ke dalam audit trail.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteDoc(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentRepositoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat Repositori Dokumen...</div>}>
      <DocumentRepositoryContent />
    </Suspense>
  );
}
