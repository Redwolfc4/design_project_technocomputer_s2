'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { IntegrationService, IntegrationEndpoint } from '@/lib/modules/integrations/integration.service';
import { AuditService } from '@/lib/modules/audit/audit.service';
import { DocumentRecord } from '@/types';
import { formatIDR, getDocumentTypeLabel } from '@/lib/utils/formatters';
import { DownloadIcon, CheckIcon, PlusIcon, PencilIcon, TrashIcon, XIcon } from '@/components/ui/icons';

export default function ExportIntegrationsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationEndpoint[]>(() => IntegrationService.getIntegrations());
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [targetSystem, setTargetSystem] = useState<'sap' | 'oracle' | 'djp_tax' | 'generic'>('sap');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // Modal CRUD State for Integration Endpoint
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationEndpoint | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    systemType: 'sap' | 'oracle' | 'djp_tax' | 'accurate' | 'generic';
    endpointUrl: string;
    authMethod: 'bearer' | 'basic' | 'apiKey';
    format: 'json' | 'csv' | 'xml';
    status: 'active' | 'inactive';
  }>({
    name: '',
    systemType: 'sap',
    endpointUrl: '',
    authMethod: 'bearer',
    format: 'json',
    status: 'active',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setDocuments(DocumentService.getDocuments());
    setIntegrations(IntegrationService.getIntegrations());
  }, []);

  const approvedDocs = documents.filter((d) => d.status === 'approved');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

      AuditService.recordEvent({
        actor: 'Enterprise User',
        actorRole: 'finance_supervisor',
        action: 'EXPORT_GENERATED',
        resourceType: 'export',
        resourceId: `exp-${Date.now()}`,
        resourceName: filename,
        details: `Ekspor data ${approvedDocs.length} dokumen terverifikasi untuk sistem target ${targetSystem.toUpperCase()}`,
        status: 'success',
        ipAddress: '127.0.0.1 (Web Demo)',
      });

      setIsExporting(false);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 4000);
    }, 1000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      systemType: 'sap',
      endpointUrl: '',
      authMethod: 'bearer',
      format: 'json',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IntegrationEndpoint) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      systemType: item.systemType,
      endpointUrl: item.endpointUrl,
      authMethod: item.authMethod,
      format: item.format,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteIntegration = (item: IntegrationEndpoint) => {
    if (confirm(`Yakin ingin menghapus konfigurasi konektor "${item.name}"?`)) {
      IntegrationService.deleteIntegration(item.id);
      setIntegrations(IntegrationService.getIntegrations());
      showToast(`Konektor ${item.name} berhasil dihapus.`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.endpointUrl.trim()) {
      showToast('Nama dan URL Endpoint wajib diisi.', 'error');
      return;
    }

    if (editingItem) {
      IntegrationService.updateIntegration(editingItem.id, formData);
      showToast(`Konektor "${formData.name}" berhasil diperbarui.`);
    } else {
      IntegrationService.addIntegration(formData);
      showToast(`Konektor "${formData.name}" berhasil ditambahkan.`);
    }

    setIntegrations(IntegrationService.getIntegrations());
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Ekspor Data & Integrasi Enterprise ERP"
        subtitle="Unduh hasil verifikasi tervalidasi dalam format siap posting akuntansi dan rekonsiliasi pajak"
      />

      {toast && (
        <div
          className={`px-8 py-2.5 text-xs font-bold text-white flex items-center justify-between transition-all ${
            toast.type === 'error' ? 'bg-[#E11D48]' : 'bg-[#059669]'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-8 min-w-0">
        <PageHeader
          title="Ekspor Data & Integrasi Enterprise ERP"
          subtitle="Unduh hasil verifikasi tervalidasi dalam format siap posting akuntansi dan rekonsiliasi pajak."
          badge={{ label: `${approvedDocs.length} Siap Ekspor`, variant: 'success' }}
        />

        {/* Section 1: Unduh Berkas Ekspor */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#CBD5E1] bg-white shadow-sm space-y-6">
          <SectionHeader
            title="Konfigurasi Ekspor Dokumen Terverifikasi"
            description={`Tersedia ${approvedDocs.length} berkas siap ekspor dengan status Terverifikasi (Approved).`}
          />

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
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>{isExporting ? 'Memproses Berkas...' : 'Generate & Download Export'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Kelola Konektor Integrasi ERP & API (CRUD) */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#CBD5E1] bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <SectionHeader
              title="Konektor Integrasi ERP & Webhook"
              description="Konfigurasi target API otomatis untuk sinkronisasi dokumen AI Enterprise."
            />
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Tambah Konektor</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-3 px-4">Nama Integrasi</th>
                  <th className="py-3 px-4">Tipe Sistem</th>
                  <th className="py-3 px-4">Endpoint URL</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                {integrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada konfigurasi integrasi tersimpan.
                    </td>
                  </tr>
                ) : (
                  integrations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold">{item.name}</td>
                      <td className="py-3.5 px-4 uppercase text-[#4F46E5] font-semibold">{item.systemType}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px] truncate max-w-[200px]">
                        {item.endpointUrl}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[11px]">{item.format}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                          title="Edit Konektor"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIntegration(item)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-md transition-colors"
                          title="Hapus Konektor"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form Tambah / Edit Konektor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem ? 'Edit Konektor Integrasi' : 'Tambah Konektor Integrasi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Konektor</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Oracle Finance Cloud Prod"
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipe Sistem</label>
                  <select
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                  >
                    <option value="sap">SAP S/4HANA</option>
                    <option value="oracle">Oracle Financials</option>
                    <option value="djp_tax">DJP e-Faktur Pajak</option>
                    <option value="accurate">Accurate Online</option>
                    <option value="generic">Generic REST API</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Format Payload</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Endpoint URL</label>
                <input
                  type="url"
                  value={formData.endpointUrl}
                  onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                  placeholder="https://api.erp.domain.com/v1/invoices"
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Metode Autentikasi</label>
                  <select
                    value={formData.authMethod}
                    onChange={(e) => setFormData({ ...formData, authMethod: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                  >
                    <option value="bearer">Bearer Token</option>
                    <option value="apiKey">API Key Header</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm cursor-pointer"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
