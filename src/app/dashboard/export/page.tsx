'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DocumentRecord } from '@/types';
import { formatIDR, getDocumentTypeLabel } from '@/lib/utils/formatters';
import { DownloadIcon, CheckIcon } from '@/components/ui/icons';

export default function ExportIntegrationsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [targetSystem, setTargetSystem] = useState<'sap' | 'oracle' | 'djp_tax' | 'generic'>('sap');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  useEffect(() => {
    setDocuments(MockDocumentService.getDocuments());
  }, []);

  const approvedDocs = documents.filter((d) => d.status === 'approved');

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      let content = '';
      let filename = `dokumenai_export_${targetSystem}_${Date.now()}`;

      if (selectedFormat === 'json') {
        content = JSON.stringify(approvedDocs, null, 2);
        filename += '.json';
      } else {
        // Generate CSV
        const headers = ['Nomor Dokumen', 'Jenis', 'Vendor', 'NPWP', 'DPP', 'PPN', 'Total', 'Tanggal'];
        const rows = approvedDocs.map((d) => [
          `"${d.fileNumber}"`,
          `"${getDocumentTypeLabel(d.documentType)}"`,
          `"${d.vendorName}"`,
          `"${d.vendorTaxId || ''}"`,
          d.subtotal,
          d.taxAmount,
          d.totalAmount,
          `"${d.uploadedAt}"`,
        ]);
        content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        filename += '.csv';
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record audit log
      const user = MockDocumentService.getCurrentUser();
      MockDocumentService.addAuditLog({
        timestamp: new Date().toISOString(),
        actor: user.name,
        actorRole: user.role,
        action: 'EXPORT_GENERATED',
        resourceType: 'export',
        resourceId: `exp-${Date.now()}`,
        resourceName: filename,
        details: `Ekspor data ${approvedDocs.length} dokumen terverifikasi untuk sistem target ${targetSystem.toUpperCase()}`,
        status: 'success',
        ipAddress: '127.0.0.1 (Demo Local)',
      });

      setIsExporting(false);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Ekspor Data & Integrasi Enterprise ERP"
        subtitle="Unduh hasil verifikasi tervalidasi dalam format siap posting akuntansi dan rekonsiliasi pajak"
      />

      <main className="flex-1 p-8 max-w-4xl space-y-8">
        <div className="p-8 rounded-xl border border-[#CBD5E1] bg-white shadow-sm space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-base font-bold text-[#0F172A]">Konfigurasi Ekspor Dokumen Terverifikasi</h2>
            <p className="text-xs text-[#64748B]">
              Tersedia <strong className="text-[#059669]">{approvedDocs.length} berkas</strong> siap ekspor dengan status Terverifikasi (Approved).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#475569]">Format Berkas Unduhan</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
              >
                <option value="csv">CSV (Comma-Separated Values)</option>
                <option value="json">JSON API Payload</option>
                <option value="xlsx">Excel Spreadsheet (XLSX)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#475569]">Profil Pemetaan Sistem Target</label>
              <select
                value={targetSystem}
                onChange={(e) => setTargetSystem(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A]"
              >
                <option value="sap">SAP S/4HANA (Accounts Payable Schema)</option>
                <option value="oracle">Oracle Financials Cloud Mapping</option>
                <option value="djp_tax">DJP e-Faktur Pajak SPT PPN Schema</option>
                <option value="generic">Generic General Ledger CSV</option>
              </select>
            </div>
          </div>

          {/* Export Preview Card */}
          <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFF] space-y-3">
            <span className="text-xs font-bold text-[#0F172A] block">
              Pratinjau Berkas Siap Diunduh
            </span>
            <div className="text-xs text-[#64748B] space-y-1">
              <div>• Jumlah baris dokumen: <strong className="text-[#0F172A]">{approvedDocs.length} entitas</strong></div>
              <div>• Total nominal transaksi: <strong className="text-[#059669]">{formatIDR(approvedDocs.reduce((acc, d) => acc + d.totalAmount, 0))}</strong></div>
              <div>• Format ekstensi: <strong className="text-[#4F46E5]">.{selectedFormat}</strong></div>
            </div>
          </div>

          {exportedSuccess && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-emerald-600" />
              <span>Berkas berhasil digenerate dan diunduh ke komputer Anda! Aktivitas dicatat di Audit Trail.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleDownload}
              disabled={isExporting || approvedDocs.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all disabled:opacity-50"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>{isExporting ? 'Memproses Berkas...' : 'Generate & Download Export'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

