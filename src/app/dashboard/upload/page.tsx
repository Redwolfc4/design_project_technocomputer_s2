'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { BatchService, BatchItemDraft, INITIAL_BATCH_ITEMS } from '@/lib/modules/batches/batch.service';
import { DocumentRecord, DocumentType } from '@/types';
import { formatIDR, getDocumentTypeLabel } from '@/lib/utils/formatters';
import {
  UploadCloudIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
  XIcon,
  TrashIcon,
  PlusIcon,
  PencilIcon,
} from '@/components/ui/icons';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { DataTableExport } from '@/components/shared/data-table';
import { useAppRoutes } from '@/context/RouteContext';

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

export default function DocumentUploadPage() {
  const router = useRouter();
  const { getRoute } = useAppRoutes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>(DEFAULT_FORM_VALUES.selectedType);
  const [vendorName, setVendorName] = useState(DEFAULT_FORM_VALUES.vendorName);
  const [fileNumber, setFileNumber] = useState(DEFAULT_FORM_VALUES.fileNumber);
  const [nominal, setNominal] = useState(DEFAULT_FORM_VALUES.nominal);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');

  // Native File Upload & Drag and Drop state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Batch Drafts State
  const [batchDrafts, setBatchDrafts] = useState<BatchItemDraft[]>(INITIAL_BATCH_ITEMS);
  const [editingDraft, setEditingDraft] = useState<BatchItemDraft | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBatchDrafts(BatchService.getBatches());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isUploadModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) {
        setIsUploadModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUploadModalOpen, isProcessing]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleOpenUploadModal = () => {
    setEditingDraft(null);
    setSelectedType(DEFAULT_FORM_VALUES.selectedType);
    setVendorName(DEFAULT_FORM_VALUES.vendorName);
    setFileNumber(DEFAULT_FORM_VALUES.fileNumber);
    setNominal(DEFAULT_FORM_VALUES.nominal);
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
    setUploadedFile(null);
    setIsDragging(false);
    setProgressStage('');
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    if (isProcessing) return;
    setIsUploadModalOpen(false);
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (!fileNumber || fileNumber === DEFAULT_FORM_VALUES.fileNumber) {
      setFileNumber(cleanName.slice(0, 30));
    }
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

  // Add or update current form in Batch Queue Draft
  const handleSaveToBatchDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    const num = parseFloat(nominal) || 10000000;

    if (editingDraft) {
      const res = BatchService.updateBatchDraft(editingDraft.id, {
        fileName: uploadedFile ? uploadedFile.name : editingDraft.fileName,
        fileSize: uploadedFile ? uploadedFile.size : editingDraft.fileSize,
        documentType: selectedType,
        vendorName: vendorName || 'Vendor Rekanan',
        fileNumber: fileNumber || editingDraft.fileNumber,
        nominal: num,
      });

      if (res.success) {
        setBatchDrafts(BatchService.getBatches());
        setUploadedFile(null);
        setIsUploadModalOpen(false);
        setEditingDraft(null);
        showToast(`Draf "${fileNumber}" berhasil diperbarui!`);
      } else {
        showToast(res.error || 'Gagal memperbarui draf batch.', 'error');
      }
      return;
    }

    const res = BatchService.addBatchDraft({
      fileName: uploadedFile ? uploadedFile.name : `Draf_${fileNumber}.pdf`,
      fileSize: uploadedFile ? uploadedFile.size : 1500000,
      documentType: selectedType,
      vendorName: vendorName || 'Vendor Rekanan',
      fileNumber: fileNumber || `DRAFT-${Date.now().toString().slice(-4)}`,
      nominal: num,
      status: 'ready',
    });

    if (res.success) {
      setBatchDrafts(BatchService.getBatches());
      setUploadedFile(null);
      setIsUploadModalOpen(false);
      showToast('Berkas dimasukkan ke Antrean Draf Batch!');
    }
  };

  const handleDeleteBatchDraft = (id: string) => {
    BatchService.deleteBatchDraft(id);
    setBatchDrafts(BatchService.getBatches());
    showToast('Draf berkas berhasil dihapus dari antrean.');
  };

  const handleExportBatchCSV = () => {
    if (batchDrafts.length === 0) {
      showToast('Antrean draf batch kosong untuk diekspor.', 'error');
      return;
    }

    const headers = ['Nama Berkas', 'Nomor Seri', 'Jenis Dokumen', 'Vendor', 'Nominal DPP', 'Mata Uang', 'Status'];
    const rows = batchDrafts.map((b) => [
      `"${b.fileName}"`,
      `"${b.fileNumber}"`,
      `"${getDocumentTypeLabel(b.documentType)}"`,
      `"${b.vendorName}"`,
      b.nominal,
      `"${b.currency || 'IDR'}"`,
      `"${b.status}"`,
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
    showToast(`Berhasil mengekspor ${batchDrafts.length} draf batch ke CSV!`, 'success');
  };

  const handleExportBatchExcel = () => {
    if (batchDrafts.length === 0) {
      showToast('Antrean draf batch kosong untuk diekspor.', 'error');
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
            ${batchDrafts
              .map(
                (b) => `
              <tr>
                <td>${b.fileName}</td>
                <td>${b.fileNumber}</td>
                <td>${getDocumentTypeLabel(b.documentType)}</td>
                <td>${b.vendorName}</td>
                <td style="text-align: right;">${b.nominal}</td>
                <td>${b.status}</td>
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
    showToast(`Berhasil mengekspor ${batchDrafts.length} draf batch ke Excel (.xls)!`, 'success');
  };

  const handleProcessBatchItem = (item: BatchItemDraft) => {
    const newDoc = createDocumentFromBatchDraft(item);

    DocumentService.createDocument(newDoc);
    BatchService.deleteBatchDraft(item.id);
    setBatchDrafts(BatchService.getBatches());
    showToast(`Dokumen ${item.fileNumber} berhasil diproses dan masuk Antrean Verifikasi!`);
    setTimeout(() => {
      router.push(getRoute(`/verification?docId=${newDoc.id}`));
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    setTimeout(() => {
      const subtotalVal = parseFloat(nominal) || 10000000;
      const taxVal = Math.round(subtotalVal * 0.11);
      const totalVal = subtotalVal + taxVal;

      const resolvedFileName = uploadedFile
        ? uploadedFile.name
        : draftBeingProcessed
        ? draftBeingProcessed.fileName
        : `Scan_${fileNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      const resolvedTitle = uploadedFile
        ? uploadedFile.name
        : draftBeingProcessed
        ? draftBeingProcessed.fileName
        : `Unggahan Baru - ${fileNumber}`;

      const newDoc: DocumentRecord = {
        id: `doc-${Date.now()}`,
        fileNumber: fileNumber || `INV-${Date.now()}`,
        title: resolvedTitle,
        fileName: resolvedFileName,
        fileSize: uploadedFile ? uploadedFile.size : draftBeingProcessed ? draftBeingProcessed.fileSize : 450000,
        fileType: (uploadedFile && ['application/pdf', 'image/png', 'image/jpeg'].includes(uploadedFile.type)
          ? uploadedFile.type
          : 'application/pdf') as 'application/pdf' | 'image/png' | 'image/jpeg',
        documentType: selectedType,
        status: 'needs_review',
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        vendorName: vendorName || 'Vendor Baru',
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
            id: `item-${Date.now()}-1`,
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
            id: `f-${Date.now()}-1`,
            key: 'invoice_number',
            label: 'Nomor Dokumen',
            value: fileNumber,
            originalValue: fileNumber,
            confidence: 0.95,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'header',
          },
          {
            id: `f-${Date.now()}-2`,
            key: 'vendor_name',
            label: 'Nama Vendor / PKP Penjual',
            value: vendorName,
            originalValue: vendorName,
            confidence: 0.93,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'vendor',
          },
          {
            id: `f-${Date.now()}-3`,
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
            timestamp: new Date().toISOString(),
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
      router.push(getRoute(`/verification?docId=${newDoc.id}`));
    }, 1600);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full min-w-0">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-[#0F172A] text-white border-slate-700'
          }`}
        >
          <CheckCircleIcon
            className={`w-4 h-4 shrink-0 ${toast.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}
          />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <Topbar
        title="Unggah Dokumen & Batch Processing"
        subtitle="Ekstraksi data faktur pajak, PO, dan invoice secara otomatis dengan AI model e-Faktur Indonesia"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Unggah Dokumen & Batch Processing"
          subtitle="Ekstraksi data faktur pajak, PO, dan invoice secara otomatis dengan AI model e-Faktur Indonesia."
          badge={{ label: `${batchDrafts.length} Draf Siap`, variant: 'info' }}
          actions={
            <div className="flex items-center gap-3">
              <DataTableExport
                options={{
                  onExportCSV: handleExportBatchCSV,
                  onExportExcel: handleExportBatchExcel,
                  disabled: batchDrafts.length === 0,
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
        <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-6">
          <SectionHeader
            title="Antrean Draf Batch Siap Proses"
            description="Daftar berkas yang telah dikelompokkan sebelum dieksekusi secara serentak ke mesin AI."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-3 px-4">Nama Berkas</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4 text-right">Aksi Draf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                {batchDrafts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center space-y-3">
                      <p className="text-slate-400">
                        Antrean draf batch kosong. Klik tombol <strong className="text-slate-600">+ Unggah Dokumen</strong> di kanan atas untuk memilih berkas baru.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenUploadModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Unggah Dokumen</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  batchDrafts.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[220px]">{b.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">{getDocumentTypeLabel(b.documentType)}</td>
                      <td className="py-3.5 px-4 text-[#0F172A]">{b.vendorName}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">{formatIDR(b.nominal)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleProcessBatchItem(b)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                          >
                            Ekstrak AI
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditDraft(b)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors cursor-pointer"
                            title="Edit Draf"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBatchDraft(b.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition-colors cursor-pointer"
                            title="Hapus Draf"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Unggah Dokumen & Ekstraksi AI */}
      {isUploadModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseUploadModal();
          }}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-[#CBD5E1] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                  {editingDraft ? 'Edit Draf Berkas Faktur / Tagihan' : 'Pilih Berkas Faktur / Tagihan'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Format yang didukung: PDF, PNG, JPG, TIFF hingga ukuran maksimal 25MB per berkas.
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCloseUploadModal}
                aria-label="Tutup modal unggah"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleInputChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-7 text-center cursor-pointer transition-all space-y-2.5 ${
                  isDragging
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
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#475569]">Profil / Jenis Dokumen</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value="tax_invoice">Faktur Pajak (e-Faktur DJP)</option>
                    <option value="commercial_invoice">Invoice Komersial AP</option>
                    <option value="purchase_order">Surat Pesanan (PO)</option>
                    <option value="contract">Perjanjian Kontrak</option>
                    <option value="withholding_tax">Bukti Potong PPh 23/26</option>
                  </select>
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
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSaveToBatchDraft}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#CBD5E1] hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {!editingDraft && <PlusIcon className="w-4 h-4 text-indigo-600" />}
                  <span>{editingDraft ? 'Simpan Perubahan Draf' : 'Simpan ke Antrean Draf Batch'}</span>
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>{isProcessing ? 'Sedang Memproses...' : 'Mulai Ekstraksi AI & Buka Verifikasi'}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
