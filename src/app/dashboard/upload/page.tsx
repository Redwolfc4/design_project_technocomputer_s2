'use client';

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { BatchService, BatchItemDraft, INITIAL_BATCH_ITEMS } from '@/lib/modules/batches/batch.service';
import { DocumentRecord, DocumentType } from '@/types';
import { formatIDR, getDocumentTypeLabel, getStatusBadgeInfo } from '@/lib/utils/formatters';
import {
  UploadCloudIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
  XIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  ChevronDownIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import {
  DataTableExport,
  DataTableActionMenu,
  DataTableRow,
  DataTablePagination,
  DataTableEmptyState,
  useDataTableInteractions,
  RowAction,
  DataTableToolbar,
  FilterConfig,
} from '@/components/shared/data-table';
import { useAppRoutes } from '@/context/RouteContext';
import { useAppScope } from '@/context/ScopeContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/Select';

function createUploadTimestamp(): number {
  return Date.now();
}

const DEFAULT_FORM_VALUES: {
  selectedType: DocumentType;
  vendorName: string;
  fileNumber: string;
  nominal: string;
} = {
  selectedType: 'tax_invoice',
  vendorName: 'PT Telkom Prima Nusantara',
  fileNumber: '010.002-26.99410123',
  nominal: '35000000',
};

function createDocumentFromBatchDraft(item: BatchItemDraft): DocumentRecord {
  const nowTs = Date.now();
  const nowIso = new Date(nowTs).toISOString();
  const subtotalVal = item.nominal;
  const taxVal = Math.round(subtotalVal * 0.11);
  const totalVal = subtotalVal + taxVal;

  return {
    id: `doc-${nowTs}`,
    fileNumber: item.fileNumber,
    title: item.fileName,
    fileName: item.fileName,
    fileSize: item.fileSize,
    fileType: 'application/pdf',
    documentType: item.documentType,
    status: 'needs_review',
    uploadedAt: nowIso,
    processedAt: nowIso,
    vendorName: item.vendorName,
    vendorTaxId: '01.999.888.7-011.000',
    currency: 'IDR',
    subtotal: subtotalVal,
    taxAmount: taxVal,
    totalAmount: totalVal,
    taxRatePercent: 11,
    confidence: 88,
    processingTimeMs: 1200,
    assignedReviewer: 'Rizky Pratama',
    isSimulatedAI: true,
    extractionProfile: 'Indonesian Enterprise OCR Standard',
    previewUrl: '/demo-documents/sample-faktur-1.png',
    tags: ['Batch Processed', 'Needs Review'],
    notes: [],
    lineItems: [
      {
        id: `item-${nowTs}-1`,
        itemNumber: 1,
        description: `Pengadaan Berkas ${item.fileNumber}`,
        quantity: 1,
        unit: 'Lot',
        unitPrice: subtotalVal,
        totalPrice: subtotalVal,
        confidence: 0.92,
      },
    ],
    fields: [
      {
        id: `f-${nowTs}-1`,
        key: 'invoice_number',
        label: 'Nomor Dokumen',
        value: item.fileNumber,
        originalValue: item.fileNumber,
        confidence: 0.96,
        isEdited: false,
        isRequired: true,
        validationStatus: 'valid',
        category: 'header',
      },
      {
        id: `f-${nowTs}-2`,
        key: 'vendor_name',
        label: 'Nama Penjual / Vendor',
        value: item.vendorName,
        originalValue: item.vendorName,
        confidence: 0.95,
        isEdited: false,
        isRequired: true,
        validationStatus: 'valid',
        category: 'vendor',
      },
      {
        id: `f-${nowTs}-3`,
        key: 'total_amount',
        label: 'Total Nilai Transaksi',
        value: totalVal,
        originalValue: totalVal,
        confidence: 0.98,
        isEdited: false,
        isRequired: true,
        validationStatus: 'valid',
        category: 'amount',
      },
    ],
    auditHistory: [
      {
        timestamp: nowIso,
        actor: 'Batch OCR Engine',
        action: 'BATCH_INGESTION_COMPLETED',
        details: 'Berkas berhasil diproses dari antrean batch dan masuk antrean verifikasi',
      },
    ],
  };
}

function DocumentUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoOpenUpload =
    searchParams.get('action') === 'upload' || searchParams.get('openModal') === 'true';
  const { getRoute, isDemo } = useAppRoutes();
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(shouldAutoOpenUpload);
  const [selectedType, setSelectedType] = useState<DocumentType>(DEFAULT_FORM_VALUES.selectedType);
  const [vendorName, setVendorName] = useState(DEFAULT_FORM_VALUES.vendorName);
  const [fileNumber, setFileNumber] = useState(DEFAULT_FORM_VALUES.fileNumber);
  const [nominal, setNominal] = useState(DEFAULT_FORM_VALUES.nominal);
  const [isSavePopoverOpen, setIsSavePopoverOpen] = useState(false);
  const savePopoverRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');

  // Native File Upload & Drag and Drop state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Batch Drafts State
  const [batchDrafts, setBatchDrafts] = useState<BatchItemDraft[]>(INITIAL_BATCH_ITEMS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'non_draft' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [editingDraft, setEditingDraft] = useState<BatchItemDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BatchItemDraft | null>(null);

  // Floating Action Menu & Context Menu Interactions
  const {
    activeMenu,
    openDropdownMenu,
    openContextMenu,
    closeMenu,
    scheduleCloseMenu,
    cancelScheduledClose,
  } = useDataTableInteractions<BatchItemDraft>();

  const draftCount = useMemo(
    () => batchDrafts.filter((b) => b.status === 'draft').length,
    [batchDrafts]
  );

  const nonDraftCount = useMemo(
    () => batchDrafts.filter((b) => b.status !== 'draft').length,
    [batchDrafts]
  );

  const filteredDrafts = useMemo(() => {
    return batchDrafts.filter((b) => {
      // 0. Scope Filter
      if (activeCompanyId !== 'all') {
        const batchComp = b.companyId || 'comp-01';
        if (batchComp !== activeCompanyId) return false;
      }
      if (activeDepartment && activeDepartment.id !== 'all') {
        const batchDept = b.department;
        if (batchDept && batchDept.toLowerCase() !== activeDepartment.name.toLowerCase()) {
          return false;
        }
      }

      if (statusFilter === 'draft' && b.status !== 'draft') return false;
      if (statusFilter === 'non_draft' && b.status === 'draft') return false;
      if (typeFilter !== 'all' && b.documentType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.fileName.toLowerCase().includes(q);
        const matchVendor = b.vendorName.toLowerCase().includes(q);
        const matchNumber = b.fileNumber.toLowerCase().includes(q);
        if (!matchName && !matchVendor && !matchNumber) return false;
      }
      return true;
    });
  }, [batchDrafts, statusFilter, typeFilter, searchQuery, activeCompanyId, activeDepartment]);

  const totalItems = filteredDrafts.length;
  const paginatedDrafts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDrafts.slice(start, start + pageSize);
  }, [filteredDrafts, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, activeCompanyId, activeDepartment, pageSize]);

  const isFilterActive = searchQuery.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    toast.info('Filter antrean batch berhasil direset.', { title: 'Filter Direset' });
  };

  const batchFilterConfigs: FilterConfig[] = [
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
      label: 'Status Kesiapan',
      type: 'select',
      placeholder: 'Semua Status',
      searchable: true,
      options: [
        { label: 'Semua Status', value: 'all' },
        { label: 'Siap Proses', value: 'non_draft' },
        { label: 'Draft Disimpan', value: 'draft' },
      ],
      selectedValue: statusFilter,
      onChange: (val) => setStatusFilter((val || 'all') as 'all' | 'non_draft' | 'draft'),
    },
    {
      id: 'documentType',
      label: 'Jenis Dokumen',
      type: 'select',
      placeholder: 'Semua Jenis',
      options: [
        { label: 'Semua Jenis', value: 'all' },
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setBatchDrafts(BatchService.getBatches());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    const openModal = searchParams.get('openModal');
    if (action === 'upload' || openModal === 'true') {
      const timer = setTimeout(() => {
        setIsUploadModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isUploadModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSavePopoverOpen) {
          setIsSavePopoverOpen(false);
          return;
        }
        if (!isProcessing) {
          setIsUploadModalOpen(false);
          if (searchParams.get('action') || searchParams.get('openModal')) {
            router.replace(getRoute('/upload'), { scroll: false });
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUploadModalOpen, isSavePopoverOpen, isProcessing, searchParams, router, getRoute]);

  useEffect(() => {
    if (!isSavePopoverOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (savePopoverRef.current && !savePopoverRef.current.contains(event.target as Node)) {
        setIsSavePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSavePopoverOpen]);

  const validateUploadForm = () => {
    const badge = isDemo ? 'Demo Sandbox' : 'Unggah Dokumen';
    if (!fileNumber.trim()) {
      toast.error('Nomor Seri / Referensi dokumen wajib diisi.', {
        title: 'Data Dokumen Belum Lengkap',
        badge,
      });
      return false;
    }
    if (!vendorName.trim() || vendorName.trim().length < 2) {
      toast.error('Nama Vendor Rekanan wajib diisi minimal 2 karakter.', {
        title: 'Data Dokumen Belum Lengkap',
        badge,
      });
      return false;
    }
    const parsedNominal = Number(nominal);
    if (!nominal.trim() || Number.isNaN(parsedNominal) || parsedNominal <= 0) {
      toast.error('Nominal DPP / Subtotal harus berupa angka lebih dari 0.', {
        title: 'Nominal Tidak Valid',
        badge,
      });
      return false;
    }
    return true;
  };

  const handleOpenUploadModal = () => {
    setEditingDraft(null);
    setSelectedType(DEFAULT_FORM_VALUES.selectedType);
    setVendorName(DEFAULT_FORM_VALUES.vendorName);
    setFileNumber(DEFAULT_FORM_VALUES.fileNumber);
    setNominal(DEFAULT_FORM_VALUES.nominal);
    setIsSavePopoverOpen(false);
    setUploadedFile(null);
    setIsDragging(false);
    setProgressStage('');
    setIsUploadModalOpen(true);
  };

  const handleOpenEditDraft = (item: BatchItemDraft) => {
    setEditingDraft(item);
    setSelectedType(item.documentType);
    setVendorName(item.vendorName);
    setFileNumber(item.fileNumber);
    setNominal(String(item.nominal));
    setIsSavePopoverOpen(false);
    setUploadedFile(null);
    setIsDragging(false);
    setProgressStage('');
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    if (isProcessing) return;
    setIsSavePopoverOpen(false);
    setIsUploadModalOpen(false);
    if (searchParams.get('action') || searchParams.get('openModal')) {
      router.replace(getRoute('/upload'), { scroll: false });
    }
  };

  const handleFileSelect = (file: File) => {
    // Validasi ekstensi & tipe file: Hanya PDF dan PNG
    const allowedExtensions = ['.pdf', '.png'];
    const allowedMimeTypes = ['application/pdf', 'image/png'];
    const lowerName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = allowedMimeTypes.includes(file.type);

    if (!hasValidExtension || (file.type && !hasValidMime)) {
      toast.error(
        `Format berkas "${file.name}" tidak didukung. Harap unggah berkas berekstensi PDF (.pdf) atau PNG (.png).`,
        {
          title: 'Format Berkas Tidak Sesuai',
          badge: isDemo ? 'Demo Sandbox' : 'Unggah Dokumen',
        }
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Ukuran berkas "${file.name}" melebihi batas maksimal 25MB.`, {
        title: 'Berkas Terlalu Besar',
        badge: isDemo ? 'Demo Sandbox' : 'Unggah Dokumen',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    setUploadedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (!fileNumber || fileNumber === DEFAULT_FORM_VALUES.fileNumber) {
      setFileNumber(cleanName.slice(0, 30));
    }
    toast.info(`Berkas "${file.name}" dipilih dan siap diproses.`, {
      title: 'Berkas Terlampir',
      badge: isDemo ? 'Demo Sandbox' : 'Unggah Dokumen',
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Add or update current form in Batch Queue with chosen status ('ready' | 'draft')
  const handleSaveToBatchDraft = (targetStatus: 'ready' | 'draft') => {
    setIsSavePopoverOpen(false);
    if (!validateUploadForm()) return;

    const badge = isDemo ? 'Demo Sandbox' : 'Antrean Batch';
    const num = Number(nominal);
    const trimmedNumber = fileNumber.trim();
    const trimmedVendor = vendorName.trim();

    if (editingDraft) {
      const res = BatchService.updateBatchDraft(editingDraft.id, {
        fileName: uploadedFile ? uploadedFile.name : editingDraft.fileName,
        fileSize: uploadedFile ? uploadedFile.size : editingDraft.fileSize,
        documentType: selectedType,
        vendorName: trimmedVendor,
        fileNumber: trimmedNumber,
        nominal: num,
        status: targetStatus,
      });

      if (res.success) {
        setBatchDrafts(BatchService.getBatches());
        setUploadedFile(null);
        setIsUploadModalOpen(false);
        setEditingDraft(null);
        toast.success(
          targetStatus === 'draft'
            ? `Berkas "${trimmedNumber}" disimpan sebagai Draft!`
            : `Berkas "${trimmedNumber}" diperbarui dengan status Siap Proses!`,
          { title: 'Draf Diperbarui', badge }
        );
      } else {
        toast.error(res.error || 'Gagal memperbarui berkas antrean.', {
          title: 'Gagal Memperbarui Draf',
          badge,
        });
      }
      return;
    }

    const prefix = targetStatus === 'draft' ? 'Draf' : 'Berkas';
    const res = BatchService.addBatchDraft({
      fileName: uploadedFile ? uploadedFile.name : `${prefix}_${trimmedNumber}.pdf`,
      fileSize: uploadedFile ? uploadedFile.size : 1500000,
      documentType: selectedType,
      vendorName: trimmedVendor,
      fileNumber: trimmedNumber,
      nominal: num,
      status: targetStatus,
    });

    if (res.success) {
      setBatchDrafts(BatchService.getBatches());
      setUploadedFile(null);
      setIsUploadModalOpen(false);
      toast.success(
        targetStatus === 'draft'
          ? `Berkas "${trimmedNumber}" disimpan sebagai Draft di Antrean Batch!`
          : `Berkas "${trimmedNumber}" (Siap Proses) dimasukkan ke Antrean Batch!`,
        { title: 'Ditambahkan ke Antrean', badge }
      );
    } else {
      toast.error('Gagal menyimpan berkas ke antrean batch.', {
        title: 'Gagal Menyimpan Draf',
        badge,
      });
    }
  };

  const handleDeleteBatchDraft = (id: string) => {
    BatchService.deleteBatchDraft(id);
    setBatchDrafts(BatchService.getBatches());
    toast.success('Berkas berhasil dihapus dari antrean batch.', { title: 'Draf Dihapus' });
  };

  const handleExportBatchCSV = () => {
    if (filteredDrafts.length === 0) {
      toast.error('Antrean batch kosong untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }

    const headers = ['Nama Berkas', 'Nomor Seri', 'Jenis Dokumen', 'Vendor', 'Nominal DPP', 'Mata Uang', 'Status'];
    const rows = filteredDrafts.map((b) => [
      `"${b.fileName}"`,
      `"${b.fileNumber}"`,
      `"${getDocumentTypeLabel(b.documentType)}"`,
      `"${b.vendorName}"`,
      b.nominal,
      `"${b.currency || 'IDR'}"`,
      `"${getStatusBadgeInfo(b.status).label}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dokumenai_antrean_batch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${filteredDrafts.length} berkas antrean ke CSV!`, {
      title: 'Ekspor CSV Selesai',
    });
  };

  const handleExportBatchExcel = () => {
    if (filteredDrafts.length === 0) {
      toast.error('Antrean batch kosong untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #4F46E5; color: #FFFFFF; font-weight: bold;">
              <th>Nama Berkas</th>
              <th>Nomor Seri</th>
              <th>Jenis Dokumen</th>
              <th>Vendor</th>
              <th>Nominal DPP (IDR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDrafts
        .map(
          (b) => `
              <tr>
                <td>${b.fileName}</td>
                <td>${b.fileNumber}</td>
                <td>${getDocumentTypeLabel(b.documentType)}</td>
                <td>${b.vendorName}</td>
                <td style="text-align: right;">${b.nominal}</td>
                <td>${getStatusBadgeInfo(b.status).label}</td>
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
    link.setAttribute('download', `dokumenai_antrean_batch_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${filteredDrafts.length} berkas antrean ke Excel (.xls)!`, {
      title: 'Ekspor Excel Selesai',
    });
  };

  const handleProcessBatchItem = (item: BatchItemDraft) => {
    const newDoc = createDocumentFromBatchDraft(item);

    DocumentService.createDocument(newDoc);
    BatchService.deleteBatchDraft(item.id);
    setBatchDrafts(BatchService.getBatches());
    toast.success(`Dokumen ${item.fileNumber} berhasil diproses dan masuk Antrean Verifikasi!`, {
      title: 'Ekstraksi AI Berhasil',
      badge: isDemo ? 'Demo Sandbox' : 'Ekstraksi AI',
    });
    setTimeout(() => {
      router.push(getRoute(`/verification?docId=${newDoc.id}`));
    }, 800);
  };

  const batchActions: RowAction<BatchItemDraft>[] = useMemo(
    () => [
      {
        id: 'extract-ai',
        label: 'Ekstrak AI Sekarang',
        icon: <SparklesIcon className="w-4 h-4 text-[#4F46E5]" />,
        onSelect: (item) => handleProcessBatchItem(item),
      },
      {
        id: 'edit-draft',
        label: 'Edit Draf Berkas',
        icon: <PencilIcon className="w-4 h-4 text-slate-600" />,
        onSelect: (item) => handleOpenEditDraft(item),
      },
      {
        id: 'delete-draft',
        label: 'Hapus dari Antrean',
        icon: <TrashIcon className="w-4 h-4 text-[#E11D48]" />,
        destructive: true,
        dividerAfter: false,
        onSelect: (item) => setDeleteTarget(item),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUploadForm()) return;

    setIsProcessing(true);

    const stages = [
      'Pre-processing berkas...',
      'Optical Character Recognition (OCR)...',
      'Ekstraksi Entitas & Bidang e-Faktur...',
      'Validasi Aritmatika DPP + PPN 11%...',
    ];

    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setProgressStage(stage);
      }, (idx + 1) * 350);
    });

    const draftBeingProcessed = editingDraft;
    const trimmedNumber = fileNumber.trim();
    const trimmedVendor = vendorName.trim();
    const parsedNominal = Number(nominal);

    setTimeout(() => {
      const nowTs = createUploadTimestamp();
      const nowIso = new Date(nowTs).toISOString();
      const subtotalVal = parsedNominal;
      const taxVal = Math.round(subtotalVal * 0.11);
      const totalVal = subtotalVal + taxVal;

      const resolvedFileName = uploadedFile
        ? uploadedFile.name
        : draftBeingProcessed
          ? draftBeingProcessed.fileName
          : `Scan_${trimmedNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      const resolvedTitle = uploadedFile
        ? uploadedFile.name
        : draftBeingProcessed
          ? draftBeingProcessed.fileName
          : `Unggahan Baru - ${trimmedNumber}`;

      const newDoc: DocumentRecord = {
        id: `doc-${nowTs}`,
        fileNumber: trimmedNumber,
        title: resolvedTitle,
        fileName: resolvedFileName,
        fileSize: uploadedFile ? uploadedFile.size : draftBeingProcessed ? draftBeingProcessed.fileSize : 450000,
        fileType: (uploadedFile && ['application/pdf', 'image/png', 'image/jpeg'].includes(uploadedFile.type)
          ? uploadedFile.type
          : 'application/pdf') as 'application/pdf' | 'image/png' | 'image/jpeg',
        documentType: selectedType,
        status: 'needs_review',
        uploadedAt: nowIso,
        processedAt: nowIso,
        vendorName: trimmedVendor,
        vendorTaxId: '01.999.888.7-011.000',
        currency: 'IDR',
        subtotal: subtotalVal,
        taxAmount: taxVal,
        totalAmount: totalVal,
        taxRatePercent: 11,
        confidence: 86,
        processingTimeMs: 1350,
        assignedReviewer: 'Rizky Pratama',
        isSimulatedAI: true,
        extractionProfile: 'Indonesian Commercial Invoice Standard',
        previewUrl: '/demo-documents/sample-faktur-1.png',
        tags: ['New Upload', 'Batch 01', 'Needs Review'],
        notes: [],
        lineItems: [
          {
            id: `item-${nowTs}-1`,
            itemNumber: 1,
            description: 'Item Jasa / Pengadaan Dokumen Baru',
            quantity: 1,
            unit: 'Unit',
            unitPrice: subtotalVal,
            totalPrice: subtotalVal,
            confidence: 0.9,
          },
        ],
        fields: [
          {
            id: `f-${nowTs}-1`,
            key: 'invoice_number',
            label: 'Nomor Dokumen',
            value: trimmedNumber,
            originalValue: trimmedNumber,
            confidence: 0.95,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'header',
          },
          {
            id: `f-${nowTs}-2`,
            key: 'vendor_name',
            label: 'Nama Vendor / PKP Penjual',
            value: trimmedVendor,
            originalValue: trimmedVendor,
            confidence: 0.93,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'vendor',
          },
          {
            id: `f-${nowTs}-3`,
            key: 'total_amount',
            label: 'Total Tagihan (Grand Total)',
            value: totalVal,
            originalValue: totalVal,
            confidence: 0.98,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'amount',
          },
        ],
        auditHistory: [
          {
            timestamp: nowIso,
            actor: 'Staff Administrasi',
            action: 'UPLOAD_AND_EXTRACT',
            details: 'Dokumen diunggah melalui formulir web dan berhasil diekstraksi ke antrean verifikasi',
          },
        ],
      };

      DocumentService.createDocument(newDoc);
      if (draftBeingProcessed) {
        BatchService.deleteBatchDraft(draftBeingProcessed.id);
        setBatchDrafts(BatchService.getBatches());
      }
      setIsProcessing(false);
      setIsUploadModalOpen(false);
      setEditingDraft(null);
      toast.success(
        isDemo
          ? `Simulasi ekstraksi AI dokumen ${trimmedNumber} selesai dan dibuka di Workspace Verifikasi!`
          : `Dokumen ${trimmedNumber} berhasil diekstraksi oleh AI dan masuk Antrean Verifikasi.`,
        {
          title: 'Ekstraksi AI Berhasil',
          badge: isDemo ? 'Demo Sandbox' : 'Ekstraksi AI',
        }
      );
      router.push(getRoute(`/verification?docId=${newDoc.id}`));
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full min-w-0">
      <Topbar
        title="Unggah Dokumen & Batch Processing"
        subtitle="Ekstraksi data faktur pajak, PO, dan invoice secara otomatis dengan AI model e-Faktur Indonesia"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Unggah Dokumen & Batch Processing"
          subtitle="Ekstraksi data faktur pajak, PO, dan invoice secara otomatis dengan AI model e-Faktur Indonesia."
          badge={{
            label: batchDrafts.length > 0 ? `${nonDraftCount} Siap · ${draftCount} Draft` : '0 Antrean',
            variant: 'info',
          }}
          actions={
            <div className="flex items-center gap-3">
              <DataTableExport
                options={{
                  onExportCSV: handleExportBatchCSV,
                  onExportExcel: handleExportBatchExcel,
                  disabled: filteredDrafts.length === 0,
                }}
              />
              <button
                type="button"
                onClick={handleOpenUploadModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Unggah Dokumen</span>
              </button>
            </div>
          }
        />

        {/* Section Riwayat Antrean Draf Batch (CRUD Modul Upload) */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-5">
          <SectionHeader
            title="Antrean Draf Batch Siap Proses"
            description="Daftar berkas berstatus Draft maupun Siap Proses sebelum dieksekusi ke mesin AI."
          />

          {/* Standardized DataTableToolbar for Batch Drafts */}
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Cari nama berkas, nomor draf, atau vendor..."
            filters={batchFilterConfigs}
            totalFiltered={filteredDrafts.length}
            totalUnfiltered={batchDrafts.length}
            entityName="draf berkas"
            isFilterActive={isFilterActive}
            onResetFilters={handleResetFilters}
          />

          <div className="overflow-x-auto">
            {totalItems === 0 ? (
              <DataTableEmptyState
                isFilterActive={isFilterActive}
                onResetFilters={handleResetFilters}
                title={isFilterActive ? undefined : 'Antrean draf batch masih kosong'}
                description={
                  isFilterActive
                    ? undefined
                    : 'Klik tombol "+ Unggah Dokumen" untuk menambahkan berkas baru ke antrean pemrosesan AI.'
                }
                action={
                  !isFilterActive
                    ? {
                        label: 'Unggah Dokumen',
                        onClick: handleOpenUploadModal,
                      }
                    : undefined
                }
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
                    <th className="py-3 px-4">Nama Berkas</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                  {paginatedDrafts.map((b) => {
                    const badge = getStatusBadgeInfo(b.status);
                    return (
                      <DataTableRow
                        key={b.id}
                        row={b}
                        onRowDoubleClick={handleOpenEditDraft}
                        onRowContextMenu={(r, e) => openContextMenu(r, e, 'Aksi Draf Berkas')}
                      >
                        <td className="py-3.5 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="truncate max-w-[220px]">{b.fileName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#475569]">{getDocumentTypeLabel(b.documentType)}</td>
                        <td className="py-3.5 px-4 text-[#0F172A]">{b.vendorName}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">{formatIDR(b.nominal)}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => openDropdownMenu(b, e, 'Aksi Draf Berkas')}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Menu Aksi Draf"
                          >
                            <MoreHorizontalIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </DataTableRow>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </main>

      {/* Modal Unggah Dokumen & Ekstraksi AI */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          title={editingDraft ? 'Edit Berkas Faktur / Tagihan' : 'Pilih Berkas Faktur / Tagihan'}
          subtitle="Format yang didukung: PDF (.pdf) & PNG (.png) hingga ukuran maksimal 25MB per berkas."
          maxWidth="2xl"
          showCloseButton={!isProcessing}
          closeOnOverlayClick={!isProcessing}
          closeOnEsc={!isProcessing}
        >
          {/* Modal Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,application/pdf,image/png"
                onChange={handleInputChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-7 text-center cursor-pointer transition-all space-y-2.5 ${isDragging
                  ? 'border-[#4F46E5] bg-[#EEF2FF]'
                  : uploadedFile
                    ? 'border-[#059669] bg-[#ECFDF5]'
                    : 'border-[#CBD5E1] bg-[#FAFAFF] hover:border-[#4F46E5] hover:bg-[#EEF2FF]/40'
                  }`}
              >
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">{uploadedFile.name}</p>
                      <p className="text-[11px] text-[#64748B]">{(uploadedFile.size / 1024).toFixed(1)} KB — Siap diproses</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="mt-0.5 text-[11px] font-semibold text-[#E11D48] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <XIcon className="w-3.5 h-3.5" /> Ganti Berkas
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto">
                      <UploadCloudIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">
                        Tarik berkas PDF/PNG ke sini, atau klik untuk memilih
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        {editingDraft
                          ? `Berkas saat ini: ${editingDraft.fileName} (klik untuk mengganti)`
                          : 'Mendukung e-Faktur PDF DJP, Faktur Komersial, PO hingga 25MB'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SearchableSelect<DocumentType>
                    label="Profil / Jenis Dokumen"
                    size="sm"
                    value={selectedType}
                    onChange={(val) => setSelectedType(val)}
                    searchPlaceholder="Cari profil dokumen..."
                    options={[
                      {
                        value: 'tax_invoice',
                        label: 'Faktur Pajak (e-Faktur DJP)',
                        category: 'Perpajakan Indonesia',
                        badge: 'PPN 11%',
                      },
                      {
                        value: 'commercial_invoice',
                        label: 'Invoice Komersial AP',
                        category: 'Accounts Payable',
                        badge: 'OCR v2.4',
                      },
                      {
                        value: 'purchase_order',
                        label: 'Surat Pesanan (PO)',
                        category: 'Procurement',
                      },
                      {
                        value: 'contract',
                        label: 'Perjanjian Kontrak',
                        category: 'Legal & Compliance',
                      },
                      {
                        value: 'withholding_tax',
                        label: 'Bukti Potong PPh 23/26',
                        category: 'Perpajakan Indonesia',
                        badge: 'e-Bupot',
                      },
                      {
                        value: 'receipt',
                        label: 'Kuitansi / Nota Transaksi',
                        category: 'General Expense',
                      },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#475569]">Nomor Seri / Referensi</label>
                  <input
                    type="text"
                    value={fileNumber}
                    onChange={(e) => setFileNumber(e.target.value)}
                    placeholder="Contoh: 010.002-26.99410123"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#475569]">Nama Vendor Rekanan</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Contoh: PT Telkom Prima Nusantara"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#475569]">Nominal DPP / Subtotal (IDR)</label>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="35000000"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                    required
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="p-3.5 rounded-lg bg-[#EEF2FF] border border-[#CBD5E1] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#4F46E5]">
                    <span>Memproses Dokumen...</span>
                    <span className="animate-spin">⏳</span>
                  </div>
                  <p className="text-xs text-[#475569]">{progressStage}</p>
                </div>
              )}

              <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="relative w-full sm:w-auto" ref={savePopoverRef}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={isProcessing}
                    onClick={() => setIsSavePopoverOpen((prev) => !prev)}
                    aria-expanded={isSavePopoverOpen}
                    aria-haspopup="menu"
                    leftIcon={!editingDraft ? <PlusIcon className="w-4 h-4 text-indigo-600" /> : undefined}
                    rightIcon={
                      <ChevronDownIcon
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                          isSavePopoverOpen ? 'rotate-180' : ''
                        }`}
                      />
                    }
                  >
                    {editingDraft ? 'Simpan Perubahan' : 'Simpan ke Antrean'}
                  </Button>

                  {isSavePopoverOpen && (
                    <div
                      role="menu"
                      aria-label="Pilih status penyimpanan berkas"
                      className="absolute bottom-full left-0 mb-2 w-full sm:w-72 bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-30 p-2 space-y-1 animate-in"
                    >
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] border-b border-slate-100 mb-1">
                        Pilih Status Berkas
                      </div>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleSaveToBatchDraft('ready')}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors flex items-start gap-2.5 cursor-pointer group"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#0F172A] group-hover:text-emerald-800">
                              Siap Proses (Bukan Draft)
                            </span>
                            {editingDraft && editingDraft.status !== 'draft' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                Saat ini
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Masuk antrean siap ekstraksi AI
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleSaveToBatchDraft('draft')}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-300 transition-colors flex items-start gap-2.5 cursor-pointer group"
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-500 mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#0F172A]">
                              Draft (Masih Disusun)
                            </span>
                            {editingDraft && editingDraft.status === 'draft' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                Saat ini
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Simpan sebagai draf untuk dilengkapi nanti
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isProcessing}
                  isLoading={isProcessing}
                  rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                >
                  {isProcessing ? 'Sedang Memproses...' : 'Mulai Ekstraksi AI & Buka Verifikasi'}
                </Button>
              </div>
            </form>
        </Modal>
      )}

      {/* Confirm Delete Draft Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteBatchDraft(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Hapus Berkas dari Antrean Batch?"
        description={
          deleteTarget ? (
            <>
              Draf berkas <strong>&ldquo;{deleteTarget.fileName}&rdquo;</strong> ({deleteTarget.fileNumber}) akan dihapus dari antrean pemrosesan batch.
            </>
          ) : null
        }
        confirmLabel="Ya, Hapus Draf"
        cancelLabel="Batal"
        variant="danger"
      />

      {/* Floating Action Menu (3-dot popover & context menu) */}
      {activeMenu && (
        <DataTableActionMenu
          isOpen={Boolean(activeMenu)}
          position={activeMenu.position}
          row={activeMenu.row}
          title={activeMenu.title || 'Aksi Draf Berkas'}
          subtitle={(b) => b.fileNumber}
          actions={batchActions}
          onClose={closeMenu}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={() => scheduleCloseMenu(250)}
        />
      )}
    </div>
  );
}

export default function DocumentUploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat Halaman Unggah Dokumen...</div>}>
      <DocumentUploadContent />
    </Suspense>
  );
}
