'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { DocumentRecord } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeInfo, getDocumentTypeLabel, parseCurrencyInput } from '@/lib/utils/formatters';
import {
  ArrowRightIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  CopyIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
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
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/Select';
import { isTimestampInDateRange } from '@/components/shared/data-table/date-picker/dateUtils';

function DocumentRepositoryContent() {
  const router = useRouter();
  const { getRoute } = useAppRoutes();
  const {
    activeCompanyId,
    setActiveCompanyId,
    allowedCompanies,
    canChangeCompany,
    activeDepartmentId,
    setActiveDepartmentId,
    allowedDepartments,
    canChangeDepartment,
    activeDepartment,
  } = useAppScope();
  const toast = useToast();
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
    const timer = setTimeout(() => {
      setDocuments(DocumentService.getDocuments());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenEdit = (doc: DocumentRecord) => {
    if (doc.status === 'approved' || doc.status === 'rejected') {
      toast.error(`Dokumen berstatus '${doc.status}' terkunci dari modifikasi.`, {
        title: 'Dokumen Terkunci',
      });
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

    const trimmedNumber = editFormData.fileNumber.trim();
    const trimmedVendor = editFormData.vendorName.trim();
    if (!trimmedNumber) {
      toast.error('Nomor Berkas / Faktur wajib diisi.', { title: 'Validasi Metadata Gagal' });
      return;
    }
    if (!trimmedVendor || trimmedVendor.length < 2) {
      toast.error('Nama Rekanan / Vendor wajib diisi minimal 2 karakter.', {
        title: 'Validasi Metadata Gagal',
      });
      return;
    }

    const parsed = parseCurrencyInput(editFormData.totalAmount, editFormData.currency);
    if (!parsed.amount || parsed.amount <= 0) {
      toast.error('Total Nilai Transaksi harus lebih besar dari 0.', {
        title: 'Nominal Tidak Valid',
      });
      return;
    }

    const res = DocumentService.updateMetadata(editDoc.id, {
      fileNumber: trimmedNumber,
      vendorName: trimmedVendor,
      vendorTaxId: editFormData.vendorTaxId.trim(),
      totalAmount: parsed.amount,
      notes: editFormData.notes.trim() || undefined,
    });

    if (!res.success) {
      toast.error(res.error || 'Gagal memperbarui metadata.', { title: 'Pembaruan Gagal' });
      return;
    }

    setDocuments(DocumentService.getDocuments());
    setEditDoc(null);
    toast.success(`Metadata dokumen ${trimmedNumber} berhasil diperbarui!`, {
      title: 'Metadata Disimpan',
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteDoc) return;
    const res = DocumentService.deleteDocument(deleteDoc.id);
    if (!res.success) {
      toast.error(res.error || 'Gagal menghapus dokumen.', { title: 'Penghapusan Gagal' });
      return;
    }

    setDocuments(DocumentService.getDocuments());
    toast.success(`Dokumen ${deleteDoc.fileNumber} berhasil dihapus dari repositori.`, {
      title: 'Dokumen Dihapus',
    });
    setDeleteDoc(null);
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin ke clipboard!`, { title: 'Disalin' });
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // 0. Scope Filtering: Company & Department Isolation
      if (activeCompanyId !== 'all') {
        const docCompanyId = doc.companyId || 'comp-01';
        if (docCompanyId !== activeCompanyId) return false;
      }
      if (activeDepartment && activeDepartment.id !== 'all') {
        const docDept = doc.department;
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
      if (!isTimestampInDateRange(doc.uploadedAt, dateRange)) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNumber = doc.fileNumber.toLowerCase().includes(q);
        const matchVendor = doc.vendorName.toLowerCase().includes(q);
        const matchTitle = doc.title.toLowerCase().includes(q);
        if (!matchNumber && !matchVendor && !matchTitle) return false;
      }
      return true;
    });
  }, [documents, statusFilter, typeFilter, confidenceFilter, dateRange, searchQuery, activeCompanyId, activeDepartment]);

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
    toast.info('Filter repositori dokumen berhasil direset.', { title: 'Filter Direset' });
  };

  // Export functions
  const handleExportCSV = () => {
    if (filteredDocs.length === 0) {
      toast.error('Tidak ada data dokumen untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }
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
    toast.success(`Berhasil mengekspor ${filteredDocs.length} dokumen ke CSV!`, {
      title: 'Ekspor CSV Selesai',
    });
  };

  const handleExportExcel = () => {
    if (filteredDocs.length === 0) {
      toast.error('Tidak ada data dokumen untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }
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
    toast.success(`Berhasil mengekspor ${filteredDocs.length} dokumen ke Excel (.xls)!`, {
      title: 'Ekspor Excel Selesai',
    });
  };

  const filterConfigs: FilterConfig[] = [
    ...(canChangeCompany
      ? [
          {
            id: 'companyScope',
            label: 'Perusahaan (Scope)',
            type: 'select' as const,
            placeholder: 'Semua Perusahaan',
            options: [
              { label: 'Semua Perusahaan', value: 'all' },
              ...allowedCompanies.map((c) => ({ label: `${c.code} · ${c.name}`, value: c.id })),
            ],
            selectedValue: activeCompanyId,
            onChange: (val: string | string[]) => setActiveCompanyId(val as string),
            searchable: true,
          },
        ]
      : []),
    ...(canChangeDepartment
      ? [
          {
            id: 'departmentScope',
            label: 'Departemen (Scope)',
            type: 'select' as const,
            placeholder: 'Semua Departemen',
            options: [
              { label: 'Semua Departemen', value: 'all' },
              ...allowedDepartments.map((d) => ({ label: `${d.code} - ${d.name}`, value: d.id })),
            ],
            selectedValue: activeDepartmentId,
            onChange: (val: string | string[]) => setActiveDepartmentId(val as string),
            searchable: true,
          },
        ]
      : []),
    {
      id: 'status',
      label: 'Status Verifikasi',
      type: 'select',
      placeholder: 'Semua Status',
      searchable: true,
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
      searchable: true,
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
            toast.error(res.error || 'Gagal menyetujui dokumen.', { title: 'Persetujuan Gagal' });
            return;
          }
          setDocuments(DocumentService.getDocuments());
          toast.success(`Dokumen ${doc.fileNumber} berhasil disetujui!`, {
            title: 'Dokumen Disetujui',
          });
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
            toast.error(res.error || 'Gagal menolak dokumen.', { title: 'Penolakan Gagal' });
            return;
          }
          setDocuments(DocumentService.getDocuments());
          toast.error(`Dokumen ${doc.fileNumber} berhasil ditolak.`, {
            title: 'Dokumen Ditolak',
          });
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

  return (
    <div className="flex-1 flex flex-col relative">
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
                  disabled: filteredDocs.length === 0,
                }}
              />
              <button
                onClick={() => router.push(getRoute('/upload?action=upload'))}
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
                          onClick: () => router.push(getRoute('/upload?action=upload')),
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
        <Modal
          isOpen={Boolean(editDoc)}
          onClose={() => setEditDoc(null)}
          title="Ubah Metadata Dokumen"
          subtitle={`Koreksi rincian indeks berkas ${editDoc.fileNumber}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} noValidate className="space-y-3.5">
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
              <div>
                <SearchableSelect
                  label="Mata Uang"
                  size="sm"
                  value={editFormData.currency}
                  onChange={(val) => setEditFormData({ ...editFormData, currency: val })}
                  searchPlaceholder="Cari mata uang..."
                  options={[
                    { value: 'IDR', label: 'IDR — Rupiah Indonesia', badge: 'Rp' },
                    { value: 'USD', label: 'USD — US Dollar', badge: '$' },
                    { value: 'EUR', label: 'EUR — Euro', badge: '€' },
                    { value: 'SGD', label: 'SGD — Singapore Dollar', badge: 'S$' },
                    { value: 'JPY', label: 'JPY — Japanese Yen', badge: '¥' },
                  ]}
                />
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditDoc(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Hapus Dokumen */}
      <ConfirmDialog
        isOpen={Boolean(deleteDoc)}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Dokumen?"
        description={
          deleteDoc ? (
            <>
              Apakah Anda yakin ingin menghapus berkas{' '}
              <strong className="text-slate-900">{deleteDoc.fileNumber}</strong> ({deleteDoc.fileName}) dari repositori? Tindakan ini akan dicatat ke dalam audit trail.
            </>
          ) : null
        }
        confirmLabel="Hapus Dokumen"
        cancelLabel="Batal"
        variant="danger"
      />
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
