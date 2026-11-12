'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { DocumentService } from '@/lib/modules/documents/document.service';
import {
  IntegrationService,
  IntegrationEndpoint,
  IntegrationAuthConfig,
  INITIAL_INTEGRATION_ENDPOINTS,
} from '@/lib/modules/integrations/integration.service';
import { AuditService } from '@/lib/modules/audit/audit.service';
import { DocumentRecord } from '@/types';
import { formatIDR, getDocumentTypeLabel, formatSystemTypeLabel } from '@/lib/utils/formatters';
import {
  DownloadIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
} from '@/components/ui/icons';
import {
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
} from '@/components/shared/data-table';
import { useToast } from '@/context/ToastContext';

export default function ExportIntegrationsPage() {
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationEndpoint[]>(() => IntegrationService.getIntegrations());
  const [targetSystem, setTargetSystem] = useState<'sap' | 'oracle' | 'djp_tax' | 'generic'>('sap');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Modal CRUD State for Integration Endpoint
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationEndpoint | null>(null);
  const [showAuthSecret, setShowAuthSecret] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    systemType: 'sap' | 'oracle' | 'djp_tax' | 'accurate' | 'generic';
    endpointUrl: string;
    authMethod: 'bearer' | 'basic' | 'apiKey';
    authConfig: IntegrationAuthConfig;
    format: 'json' | 'csv' | 'xml';
    status: 'active' | 'inactive';
  }>({
    name: '',
    systemType: 'sap',
    endpointUrl: '',
    authMethod: 'bearer',
    authConfig: {
      bearerToken: '',
      apiKeyHeaderName: 'X-API-Key',
      apiKeyValue: '',
      basicUsername: '',
      basicPassword: '',
    },
    format: 'json',
    status: 'active',
  });

  // 3-dot Floating Action Menu Interactions
  const {
    activeMenu,
    openDropdownMenu,
    closeMenu,
    scheduleCloseMenu,
    cancelScheduledClose,
  } = useDataTableInteractions<IntegrationEndpoint>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDocuments(DocumentService.getDocuments());
      setIntegrations(IntegrationService.getIntegrations());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportMenuOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const approvedDocs = documents.filter((d) => d.status === 'approved');
  const totalApprovedAmount = approvedDocs.reduce((acc, d) => acc + d.totalAmount, 0);

  const handleDownload = (format: 'csv' | 'json' | 'xlsx') => {
    if (approvedDocs.length === 0) {
      toast.error('Tidak ada dokumen terverifikasi yang siap diekspor.', { title: 'Ekspor Gagal' });
      return;
    }

    setIsExportMenuOpen(false);
    setIsExporting(true);

    setTimeout(() => {
      let content = '';
      let mimeType = 'text/plain;charset=utf-8';
      let filename = `dokumenai_export_${targetSystem}_${Date.now()}`;

      if (format === 'json') {
        content = JSON.stringify(
          {
            targetSystem,
            exportedAt: new Date().toISOString(),
            totalDocuments: approvedDocs.length,
            totalAmount: totalApprovedAmount,
            documents: approvedDocs,
          },
          null,
          2
        );
        mimeType = 'application/json;charset=utf-8';
        filename += '.json';
      } else {
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
        const delimiter = format === 'xlsx' ? '\t' : ',';
        content = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');
        mimeType = format === 'xlsx' ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8';
        filename += format === 'xlsx' ? '.xls' : '.csv';
      }

      const blob = new Blob([content], { type: mimeType });
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
        details: `Ekspor data ${approvedDocs.length} dokumen terverifikasi (${format.toUpperCase()}) untuk sistem target ${targetSystem.toUpperCase()}`,
        status: 'success',
        ipAddress: '127.0.0.1 (Web Demo)',
      });

      setIsExporting(false);
      toast.success(`Berkas ${filename} berhasil diunduh & dicatat di Audit Trail!`, {
        title: 'Ekspor ERP Selesai',
      });
    }, 450);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setShowAuthSecret(false);
    setFormData({
      name: '',
      systemType: 'sap',
      endpointUrl: '',
      authMethod: 'bearer',
      authConfig: {
        bearerToken: '',
        apiKeyHeaderName: 'X-API-Key',
        apiKeyValue: '',
        basicUsername: '',
        basicPassword: '',
      },
      format: 'json',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IntegrationEndpoint) => {
    const fallbackAuth = INITIAL_INTEGRATION_ENDPOINTS.find((i) => i.id === item.id)?.authConfig;
    const mergedAuth = item.authConfig || fallbackAuth || {};

    setEditingItem(item);
    setShowAuthSecret(false);
    setFormData({
      name: item.name,
      systemType: item.systemType,
      endpointUrl: item.endpointUrl,
      authMethod: item.authMethod,
      authConfig: {
        bearerToken: mergedAuth.bearerToken || '',
        apiKeyHeaderName: mergedAuth.apiKeyHeaderName || 'X-API-Key',
        apiKeyValue: mergedAuth.apiKeyValue || '',
        basicUsername: mergedAuth.basicUsername || '',
        basicPassword: mergedAuth.basicPassword || '',
      },
      format: item.format,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteIntegration = (item: IntegrationEndpoint) => {
    if (confirm(`Yakin ingin menghapus konfigurasi konektor "${item.name}"?`)) {
      IntegrationService.deleteIntegration(item.id);
      setIntegrations(IntegrationService.getIntegrations());
      toast.success(`Konektor ${item.name} berhasil dihapus.`, { title: 'Konektor Dihapus' });
    }
  };

  const integrationActions: RowAction<IntegrationEndpoint>[] = [
    {
      id: 'edit-connector',
      label: 'Edit Konfigurasi',
      icon: <PencilIcon className="w-4 h-4 text-slate-600" />,
      onSelect: (item) => handleOpenEdit(item),
    },
    {
      id: 'delete-connector',
      label: 'Hapus Konektor',
      icon: <TrashIcon className="w-4 h-4 text-[#E11D48]" />,
      destructive: true,
      onSelect: (item) => handleDeleteIntegration(item),
    },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.endpointUrl.trim()) {
      toast.error('Nama dan URL Endpoint wajib diisi.', { title: 'Validasi Konektor Gagal' });
      return;
    }

    try {
      const parsedEndpoint = new URL(formData.endpointUrl.trim());
      if (parsedEndpoint.protocol !== 'http:' && parsedEndpoint.protocol !== 'https:') {
        toast.error('URL Endpoint harus menggunakan protokol http:// atau https://.', {
          title: 'URL Endpoint Tidak Valid',
        });
        return;
      }
    } catch {
      toast.error('Format URL Endpoint tidak valid.', { title: 'URL Endpoint Tidak Valid' });
      return;
    }

    let cleanedAuthConfig: IntegrationAuthConfig = {};
    if (formData.authMethod === 'bearer') {
      const token = formData.authConfig.bearerToken?.trim() || '';
      if (!token) {
        toast.error('Bearer Token wajib diisi.', { title: 'Kredensial Tidak Lengkap' });
        return;
      }
      cleanedAuthConfig = { bearerToken: token };
    } else if (formData.authMethod === 'apiKey') {
      const headerName = formData.authConfig.apiKeyHeaderName?.trim() || '';
      const keyValue = formData.authConfig.apiKeyValue?.trim() || '';
      if (!headerName || !keyValue) {
        toast.error('Nama Header dan Nilai API Key wajib diisi.', {
          title: 'Kredensial Tidak Lengkap',
        });
        return;
      }
      cleanedAuthConfig = { apiKeyHeaderName: headerName, apiKeyValue: keyValue };
    } else if (formData.authMethod === 'basic') {
      const username = formData.authConfig.basicUsername?.trim() || '';
      const password = formData.authConfig.basicPassword?.trim() || '';
      if (!username || !password) {
        toast.error('Username dan Password wajib diisi untuk Basic Auth.', {
          title: 'Kredensial Tidak Lengkap',
        });
        return;
      }
      cleanedAuthConfig = { basicUsername: username, basicPassword: password };
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      endpointUrl: formData.endpointUrl.trim(),
      authConfig: cleanedAuthConfig,
    };

    if (editingItem) {
      IntegrationService.updateIntegration(editingItem.id, payload);
      toast.success(`Konektor "${payload.name}" berhasil diperbarui.`, {
        title: 'Konektor Diperbarui',
      });
    } else {
      IntegrationService.addIntegration(payload);
      toast.success(`Konektor "${payload.name}" berhasil ditambahkan.`, {
        title: 'Konektor Ditambahkan',
      });
    }

    setIntegrations(IntegrationService.getIntegrations());
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full min-w-0">
      <Topbar
        title="Ekspor Data & Integrasi Enterprise ERP"
        subtitle="Unduh hasil verifikasi tervalidasi dalam format siap posting akuntansi dan rekonsiliasi pajak"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Ekspor Data & Integrasi Enterprise ERP"
          subtitle="Unduh hasil verifikasi tervalidasi dalam format siap posting akuntansi dan rekonsiliasi pajak."
          badge={{ label: `${approvedDocs.length} Siap Ekspor`, variant: 'success' }}
          actions={
            <div className="flex items-center gap-3">
              {/* Simple Export Dropdown (Matches Enterprise DataTableExport Pattern) */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#FAFAFF] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <DownloadIcon className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{isExporting ? 'Memproses...' : 'Export'}</span>
                  <ChevronDownIcon className="w-3 h-3 text-[#64748B]" />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-72 bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-30 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1.5 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B] font-medium">{approvedDocs.length} dokumen terverifikasi</span>
                      <span className="font-bold text-[#059669]">{formatIDR(totalApprovedAmount)}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#475569] block px-0.5">
                        Profil Pemetaan Sistem Target
                      </label>
                      <select
                        value={targetSystem}
                        onChange={(e) => setTargetSystem(e.target.value as any)}
                        className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-hidden focus:border-[#4F46E5]"
                      >
                        <option value="sap">SAP S/4HANA (AP Schema)</option>
                        <option value="oracle">Oracle Financials Cloud</option>
                        <option value="djp_tax">DJP e-Faktur SPT PPN</option>
                        <option value="generic">Generic General Ledger</option>
                      </select>
                    </div>

                    <div className="pt-1 border-t border-[#F1F5F9] space-y-0.5">
                      <button
                        type="button"
                        disabled={approvedDocs.length === 0}
                        onClick={() => handleDownload('csv')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] font-medium flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <span>Export CSV (.csv)</span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">UTF-8</span>
                      </button>
                      <button
                        type="button"
                        disabled={approvedDocs.length === 0}
                        onClick={() => handleDownload('xlsx')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] font-medium flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <span>Export Excel (.xls)</span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">Sheet</span>
                      </button>
                      <button
                        type="button"
                        disabled={approvedDocs.length === 0}
                        onClick={() => handleDownload('json')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] font-medium flex items-center justify-between transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <span>Export JSON Payload (.json)</span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">API</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Tambah Konektor</span>
              </button>
            </div>
          }
        />

        {/* Kelola Konektor Integrasi ERP & API (CRUD) */}
        <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-6">
          <SectionHeader
            title="Konektor Integrasi ERP & Webhook"
            description="Konfigurasi target API otomatis untuk sinkronisasi dokumen AI Enterprise."
          />

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
                      <td className="py-3.5 px-4 uppercase text-[#4F46E5] font-semibold">
                        {formatSystemTypeLabel(item.systemType)}
                      </td>
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
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => openDropdownMenu(item, e, 'Aksi Konektor ERP')}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Menu Aksi Konektor"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem ? 'Edit Konektor Integrasi' : 'Tambah Konektor Integrasi Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Konektor</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Oracle Finance Cloud Prod"
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipe Sistem</label>
                  <select
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500"
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
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500"
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
                  className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Metode Autentikasi</label>
                  <select
                    value={formData.authMethod}
                    onChange={(e) => {
                      const nextMethod = e.target.value as 'bearer' | 'basic' | 'apiKey';
                      setShowAuthSecret(false);
                      setFormData({
                        ...formData,
                        authMethod: nextMethod,
                        authConfig: {
                          ...formData.authConfig,
                          apiKeyHeaderName:
                            nextMethod === 'apiKey' && !formData.authConfig.apiKeyHeaderName
                              ? 'X-API-Key'
                              : formData.authConfig.apiKeyHeaderName,
                        },
                      });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500"
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
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Auth Configuration Fields */}
              {formData.authMethod === 'bearer' && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Bearer Token <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAuthSecret ? 'text' : 'password'}
                      value={formData.authConfig.bearerToken || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authConfig: { ...formData.authConfig, bearerToken: e.target.value },
                        })
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      className="w-full text-xs font-mono px-3 py-2 pr-9 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthSecret((prev) => !prev)}
                      aria-label={showAuthSecret ? 'Sembunyikan Bearer Token' : 'Tampilkan Bearer Token'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAuthSecret ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Token dikirim otomatis melalui header <code className="font-mono text-slate-700">Authorization: Bearer &lt;token&gt;</code>.
                  </p>
                </div>
              )}

              {formData.authMethod === 'apiKey' && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Nama Header <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.authConfig.apiKeyHeaderName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authConfig: { ...formData.authConfig, apiKeyHeaderName: e.target.value },
                          })
                        }
                        placeholder="X-API-Key"
                        className="w-full text-xs font-mono px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Nilai API Key <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showAuthSecret ? 'text' : 'password'}
                          value={formData.authConfig.apiKeyValue || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              authConfig: { ...formData.authConfig, apiKeyValue: e.target.value },
                            })
                          }
                          placeholder="api_key_secret..."
                          className="w-full text-xs font-mono px-3 py-2 pr-9 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthSecret((prev) => !prev)}
                          aria-label={showAuthSecret ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showAuthSecret ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pasangan header dan kunci API dikirimkan pada setiap request sinkronisasi endpoint.
                  </p>
                </div>
              )}

              {formData.authMethod === 'basic' && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.authConfig.basicUsername || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            authConfig: { ...formData.authConfig, basicUsername: e.target.value },
                          })
                        }
                        placeholder="erp_service_user"
                        className="w-full text-xs font-mono px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showAuthSecret ? 'text' : 'password'}
                          value={formData.authConfig.basicPassword || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              authConfig: { ...formData.authConfig, basicPassword: e.target.value },
                            })
                          }
                          placeholder="••••••••"
                          className="w-full text-xs font-mono px-3 py-2 pr-9 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthSecret((prev) => !prev)}
                          aria-label={showAuthSecret ? 'Sembunyikan Password' : 'Tampilkan Password'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showAuthSecret ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Kredensial akan di-encode Base64 melalui header <code className="font-mono text-slate-700">Authorization: Basic &lt;base64&gt;</code>.
                  </p>
                </div>
              )}

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

      {/* Floating Action Menu (3-dot popover) */}
      {activeMenu && (
        <DataTableActionMenu
          isOpen={Boolean(activeMenu)}
          position={activeMenu.position}
          row={activeMenu.row}
          title={activeMenu.title || 'Aksi Konektor ERP'}
          subtitle={(item) => item.name}
          actions={integrationActions}
          onClose={closeMenu}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={() => scheduleCloseMenu(250)}
        />
      )}
    </div>
  );
}
