'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  EyeIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
} from '@/components/ui/icons';
import {
  DataTableToolbar,
  DataTableRow,
  DataTablePagination,
  DataTableEmptyState,
  DataTableActionMenu,
  useDataTableInteractions,
  RowAction,
  FilterConfig,
} from '@/components/shared/data-table';
import { Select, SearchableSelect } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';

type TargetSystem = 'sap' | 'oracle' | 'djp_tax' | 'generic';

export default function ExportIntegrationsPage() {
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationEndpoint[]>(() =>
    IntegrationService.getIntegrations()
  );
  const [targetSystem, setTargetSystem] = useState<TargetSystem>('sap');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Filter, Search & Pagination for Integration Table
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [authFilter, setAuthFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal CRUD State for Integration Endpoint
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationEndpoint | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IntegrationEndpoint | null>(null);
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

  // Action Menu Interactions (Dropdown & Context Menu)
  const {
    activeMenu,
    openDropdownMenu,
    openContextMenu,
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

  const approvedDocs = documents.filter((d) => d.status === 'approved');
  const totalApprovedAmount = approvedDocs.reduce((acc, d) => acc + d.totalAmount, 0);

  // Filter Integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      if (systemFilter !== 'all' && item.systemType !== systemFilter) return false;
      if (authFilter !== 'all' && item.authMethod !== authFilter) return false;
      if (formatFilter !== 'all' && item.format !== formatFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchUrl = item.endpointUrl.toLowerCase().includes(q);
        const matchSystem = formatSystemTypeLabel(item.systemType).toLowerCase().includes(q);
        if (!matchName && !matchUrl && !matchSystem) return false;
      }
      return true;
    });
  }, [integrations, systemFilter, authFilter, formatFilter, statusFilter, searchQuery]);

  const totalItems = filteredIntegrations.length;
  const paginatedIntegrations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIntegrations.slice(start, start + pageSize);
  }, [filteredIntegrations, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, systemFilter, authFilter, formatFilter, statusFilter, pageSize]);

  const isFilterActive =
    searchQuery.trim() !== '' ||
    systemFilter !== 'all' ||
    authFilter !== 'all' ||
    formatFilter !== 'all' ||
    statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSystemFilter('all');
    setAuthFilter('all');
    setFormatFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
    toast.info('Filter konektor integrasi berhasil direset.', { title: 'Filter Direset' });
  };

  const connectorFilters: FilterConfig[] = useMemo(
    () => [
      {
        id: 'systemType',
        label: 'Tipe Sistem ERP',
        type: 'select',
        placeholder: 'Semua Sistem',
        searchable: true,
        options: [
          { label: 'Semua Sistem', value: 'all' },
          { label: 'SAP S/4HANA', value: 'sap', badge: 'Enterprise' },
          { label: 'Oracle Financials', value: 'oracle', badge: 'Cloud' },
          { label: 'DJP e-Faktur Pajak', value: 'djp_tax', badge: 'Tax' },
          { label: 'Accurate Online', value: 'accurate', badge: 'SMB' },
          { label: 'Generic REST API', value: 'generic', badge: 'Custom' },
        ],
        selectedValue: systemFilter,
        onChange: (val) => setSystemFilter(val || 'all'),
      },
      {
        id: 'authMethod',
        label: 'Autentikasi',
        type: 'select',
        placeholder: 'Semua Auth',
        searchable: true,
        options: [
          { label: 'Semua Metode', value: 'all' },
          { label: 'Bearer Token', value: 'bearer' },
          { label: 'API Key Header', value: 'apiKey' },
          { label: 'Basic Auth', value: 'basic' },
        ],
        selectedValue: authFilter,
        onChange: (val) => setAuthFilter(val || 'all'),
      },
      {
        id: 'format',
        label: 'Format Payload',
        type: 'select',
        placeholder: 'Semua Format',
        searchable: true,
        options: [
          { label: 'Semua Format', value: 'all' },
          { label: 'JSON', value: 'json' },
          { label: 'CSV', value: 'csv' },
          { label: 'XML', value: 'xml' },
        ],
        selectedValue: formatFilter,
        onChange: (val) => setFormatFilter(val || 'all'),
      },
      {
        id: 'status',
        label: 'Status Konektor',
        type: 'select',
        placeholder: 'Semua Status',
        searchable: true,
        options: [
          { label: 'Semua Status', value: 'all' },
          { label: 'Aktif', value: 'active' },
          { label: 'Nonaktif', value: 'inactive' },
        ],
        selectedValue: statusFilter,
        onChange: (val) => setStatusFilter(val || 'all'),
      },
    ],
    [systemFilter, authFilter, formatFilter, statusFilter]
  );

  const handleExportConnectors = (format: 'csv' | 'xls') => {
    if (filteredIntegrations.length === 0) {
      toast.error('Tidak ada konfigurasi konektor untuk diekspor.', { title: 'Ekspor Gagal' });
      return;
    }
    const headers = ['Nama Konektor', 'Tipe Sistem', 'Endpoint URL', 'Auth Method', 'Format Payload', 'Status'];
    const rows = filteredIntegrations.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      `"${formatSystemTypeLabel(i.systemType)}"`,
      `"${i.endpointUrl}"`,
      `"${i.authMethod}"`,
      `"${i.format.toUpperCase()}"`,
      `"${i.status === 'active' ? 'Aktif' : 'Nonaktif'}"`,
    ]);
    const delimiter = format === 'xls' ? '\t' : ',';
    const content = '\uFEFF' + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\r\n');
    const mimeType =
      format === 'xls' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';
    const filename = `konektor_erp_dokumenai_${Date.now()}.${format}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Daftar konektor berhasil diekspor ke ${filename}!`, {
      title: `Ekspor ${format.toUpperCase()} Berhasil`,
    });
  };

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
        content = '\uFEFF' + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\r\n');
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

  const handleConfirmDeleteIntegration = () => {
    if (!deleteTarget) return;
    IntegrationService.deleteIntegration(deleteTarget.id);
    setIntegrations(IntegrationService.getIntegrations());
    toast.success(`Konektor "${deleteTarget.name}" berhasil dihapus.`, { title: 'Konektor Dihapus' });
    setDeleteTarget(null);
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
      onSelect: (item) => setDeleteTarget(item),
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
              {/* ERP Export Dropdown */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#FAFAFF] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <DownloadIcon className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>{isExporting ? 'Memproses...' : 'Export ERP'}</span>
                  <ChevronDownIcon className="w-3 h-3 text-[#64748B]" />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-72 bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-30 p-3 space-y-3 animate-in">
                    <div className="px-2 py-1.5 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B] font-medium">
                        {approvedDocs.length} dokumen terverifikasi
                      </span>
                      <span className="font-bold text-[#059669]">
                        {formatIDR(totalApprovedAmount)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#475569] block px-0.5">
                        Profil Pemetaan Sistem Target
                      </label>
                      <Select<TargetSystem>
                        size="sm"
                        value={targetSystem}
                        onChange={(val) => setTargetSystem(val)}
                        aria-label="Profil Pemetaan Sistem Target"
                        options={[
                          { value: 'sap', label: 'SAP S/4HANA', description: 'AP Schema Mapping' },
                          { value: 'oracle', label: 'Oracle Financials Cloud', description: 'ERP AP Ledger' },
                          { value: 'djp_tax', label: 'DJP e-Faktur SPT PPN', description: 'CSV/XML Pajak' },
                          { value: 'generic', label: 'Generic General Ledger', description: 'Standard Table' },
                        ]}
                      />
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

        {/* Enterprise Search & Filter Toolbar for Konektor */}
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari nama konektor, URL endpoint, atau tipe sistem ERP..."
          filters={connectorFilters}
          totalFiltered={totalItems}
          totalUnfiltered={integrations.length}
          entityName="konektor integrasi"
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          exportOptions={{
            onExportCSV: () => handleExportConnectors('csv'),
            onExportExcel: () => handleExportConnectors('xls'),
            disabled: filteredIntegrations.length === 0,
          }}
        />

        {/* Kelola Konektor Integrasi ERP & API (CRUD) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#E2E8F0]">
            <SectionHeader
              title="Konektor Integrasi ERP & Webhook"
              description="Klik dua kali atau klik kanan pada baris untuk mengubah atau mengelola endpoint sinkronisasi."
            />
          </div>

          <div className="overflow-x-auto">
            {totalItems === 0 ? (
              <DataTableEmptyState
                isFilterActive={isFilterActive}
                onResetFilters={handleResetFilters}
                title={isFilterActive ? undefined : 'Belum ada konfigurasi konektor ERP'}
                description={
                  isFilterActive
                    ? undefined
                    : 'Tambahkan endpoint API ERP atau webhook baru untuk mengotomatisasi sinkronisasi data.'
                }
                action={
                  !isFilterActive
                    ? {
                        label: 'Tambah Konektor',
                        onClick: handleOpenAdd,
                      }
                    : undefined
                }
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider bg-[#F8FAFC]">
                    <th className="py-3 px-5">Nama Integrasi</th>
                    <th className="py-3 px-4">Tipe Sistem</th>
                    <th className="py-3 px-4">Endpoint URL</th>
                    <th className="py-3 px-4">Autentikasi</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs font-medium text-[#0F172A]">
                  {paginatedIntegrations.map((item) => (
                    <DataTableRow
                      key={item.id}
                      row={item}
                      onRowDoubleClick={handleOpenEdit}
                      onRowContextMenu={(r, e) => openContextMenu(r, e, 'Aksi Konektor ERP')}
                    >
                      <td className="py-3.5 px-5 font-bold">{item.name}</td>
                      <td className="py-3.5 px-4 uppercase text-[#4F46E5] font-semibold">
                        {formatSystemTypeLabel(item.systemType)}
                      </td>
                      <td
                        className="py-3.5 px-4 text-[#64748B] font-mono text-[11px] truncate max-w-[240px]"
                        title={item.endpointUrl}
                      >
                        {item.endpointUrl}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-slate-600">
                        {item.authMethod === 'bearer'
                          ? 'Bearer Token'
                          : item.authMethod === 'apiKey'
                            ? 'API Key'
                            : 'Basic Auth'}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[11px] font-bold">{item.format}</td>
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
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => openDropdownMenu(item, e, 'Aksi Konektor ERP')}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Menu Aksi Konektor"
                        >
                          <MoreHorizontalIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </DataTableRow>
                  ))}
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

      {/* Shared Modal Form Tambah / Edit Konektor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingItem ? 'Edit Konektor Integrasi' : 'Tambah Konektor Integrasi Baru'}
        subtitle="Konfigurasi endpoint REST/Webhook, autentikasi, dan format payload."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="connector-form"
              className="px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] shadow-sm cursor-pointer"
            >
              Simpan Konfigurasi
            </button>
          </div>
        }
      >
        <form id="connector-form" onSubmit={handleFormSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Nama Konektor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Oracle Finance Cloud Prod"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SearchableSelect<'sap' | 'oracle' | 'djp_tax' | 'accurate' | 'generic'>
              label="Tipe Sistem"
              size="sm"
              value={formData.systemType}
              onChange={(val) => setFormData({ ...formData, systemType: val })}
              searchPlaceholder="Cari sistem ERP..."
              options={[
                { value: 'sap', label: 'SAP S/4HANA', badge: 'Enterprise' },
                { value: 'oracle', label: 'Oracle Financials', badge: 'Cloud' },
                { value: 'djp_tax', label: 'DJP e-Faktur Pajak', badge: 'Tax' },
                { value: 'accurate', label: 'Accurate Online', badge: 'SMB' },
                { value: 'generic', label: 'Generic REST API', badge: 'Custom' },
              ]}
            />
            <Select<'json' | 'csv' | 'xml'>
              label="Format Payload"
              size="sm"
              value={formData.format}
              onChange={(val) => setFormData({ ...formData, format: val })}
              options={[
                { value: 'json', label: 'JSON', description: 'REST Application JSON' },
                { value: 'csv', label: 'CSV', description: 'Tabular Delimited' },
                { value: 'xml', label: 'XML', description: 'SOAP / DJP Schema' },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Endpoint URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={formData.endpointUrl}
              onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
              placeholder="https://api.erp.domain.com/v1/invoices"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select<'bearer' | 'apiKey' | 'basic'>
              label="Metode Autentikasi"
              size="sm"
              value={formData.authMethod}
              onChange={(nextMethod) => {
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
              options={[
                { value: 'bearer', label: 'Bearer Token', badge: 'OAuth/JWT' },
                { value: 'apiKey', label: 'API Key Header', badge: 'Header' },
                { value: 'basic', label: 'Basic Auth', badge: 'Credentials' },
              ]}
            />
            <Select<'active' | 'inactive'>
              label="Status"
              size="sm"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={[
                { value: 'active', label: 'Aktif', badge: 'Online' },
                { value: 'inactive', label: 'Nonaktif', badge: 'Paused' },
              ]}
            />
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
        </form>
      </Modal>

      {/* Confirm Delete Connector */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteIntegration}
        title="Hapus Konfigurasi Konektor?"
        description={
          deleteTarget ? (
            <>
              Konfigurasi konektor <strong>&ldquo;{deleteTarget.name}&rdquo;</strong> akan dihapus permanen dan tidak lagi digunakan untuk sinkronisasi otomatis.
            </>
          ) : null
        }
        confirmLabel="Ya, Hapus Konektor"
        cancelLabel="Batal"
        variant="danger"
      />

      {/* Floating Action Menu (3-dot popover & right-click context menu) */}
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
