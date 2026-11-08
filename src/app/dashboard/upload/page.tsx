'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DocumentRecord, DocumentType } from '@/types';
import { UploadCloudIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/ui/icons';

export default function DocumentUploadPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<DocumentType>('tax_invoice');
  const [vendorName, setVendorName] = useState('PT Telkom Prima Nusantara');
  const [fileNumber, setFileNumber] = useState('010.002-26.99410123');
  const [nominal, setNominal] = useState('35000000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');

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

    setTimeout(() => {
      const subtotalVal = parseFloat(nominal) || 10000000;
      const taxVal = Math.round(subtotalVal * 0.11);
      const totalVal = subtotalVal + taxVal;

      const newDoc: DocumentRecord = {
        id: `doc-${Date.now()}`,
        fileNumber: fileNumber || `INV-${Date.now()}`,
        title: `Unggahan Baru - ${fileNumber}`,
        fileName: `Scan_${fileNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileSize: 450000,
        fileType: 'application/pdf',
        documentType: selectedType,
        status: 'needs_review',
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        vendorName: vendorName || 'PT Vendor Rekanan Baru',
        currency: 'IDR',
        subtotal: subtotalVal,
        taxAmount: taxVal,
        totalAmount: totalVal,
        taxRatePercent: 11,
        confidence: 89,
        processingTimeMs: 1250,
        assignedReviewer: 'Rizky Pratama',
        isSimulatedAI: true,
        extractionProfile: 'Standard Document OCR Pipeline v2.4',
        previewUrl: '/demo-documents/sample-faktur-1.png',
        tags: ['New Upload', 'Batch Ingestion'],
        fields: [
          {
            id: `f-${Date.now()}-1`,
            key: 'number',
            label: 'Nomor Dokumen',
            value: fileNumber,
            originalValue: fileNumber,
            confidence: 0.98,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'header',
          },
          {
            id: `f-${Date.now()}-2`,
            key: 'vendor',
            label: 'Nama Vendor / PKP',
            value: vendorName,
            originalValue: vendorName,
            confidence: 0.95,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'vendor',
          },
          {
            id: `f-${Date.now()}-3`,
            key: 'total',
            label: 'Total Nilai Transaksi',
            value: totalVal,
            originalValue: totalVal,
            confidence: 0.91,
            isEdited: false,
            isRequired: true,
            validationStatus: 'valid',
            category: 'amount',
          },
        ],
        lineItems: [
          {
            id: `li-${Date.now()}`,
            itemNumber: 1,
            description: 'Item Transaksi Batch Pembelian Operasional',
            quantity: 1,
            unit: 'Lot',
            unitPrice: subtotalVal,
            totalPrice: subtotalVal,
            confidence: 0.94,
          },
        ],
        notes: [],
        auditHistory: [
          {
            timestamp: new Date().toISOString(),
            actor: 'Rizky Pratama (Reviewer)',
            action: 'UPLOAD_DOCUMENT',
            details: `Unggahan baru via formulir batch: ${fileNumber}`,
          },
        ],
      };

      MockDocumentService.saveDocument(newDoc);
      setIsProcessing(false);
      router.push(`/dashboard/verification?docId=${newDoc.id}`);
    }, 1800);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Unggah Dokumen Batch & Profil Ekstraksi"
        subtitle="Simulasi integrasi berkas PDF / gambar faktur pajak, invoice, atau PO dengan pipeline AI"
      />

      <main className="flex-1 p-8 max-w-4xl space-y-8">
        <form onSubmit={handleSubmit} className="p-8 rounded-xl border border-[#CBD5E1] bg-white shadow-sm space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-base font-bold text-[#0F172A]">Formulir Batch Upload Demo</h2>
            <p className="text-xs text-[#64748B]">
              Unggah berkas atau isi rincian faktur untuk langsung disimulasikan melalui pipeline AI OCR.
            </p>
          </div>

          {/* Drag & Drop Box */}
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-8 text-center bg-[#FAFAFF] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto">
              <UploadCloudIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A]">Tarik berkas PDF/PNG ke sini, atau klik untuk memilih</p>
              <p className="text-[11px] text-[#64748B]">Mendukung e-Faktur PDF DJP, Faktur Komersial, PO hingga 25MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#475569]">Profil / Jenis Dokumen</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="w-full text-xs font-medium px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
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
                className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
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
                className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
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
                className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
                required
              />
            </div>
          </div>

          {isProcessing && (
            <div className="p-4 rounded-lg bg-[#EEF2FF] border border-[#CBD5E1] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#4F46E5]">
                <span>Memproses Dokumen...</span>
                <span className="animate-spin">⏳</span>
              </div>
              <p className="text-xs text-[#475569]">{progressStage}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all disabled:opacity-50"
            >
              <span>{isProcessing ? 'Sedang Memproses...' : 'Mulai Ekstraksi AI & Buka Verifikasi'}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

