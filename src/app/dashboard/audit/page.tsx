'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { AuditService } from '@/lib/modules/audit/audit.service';
import { AuditLogEntry } from '@/types';
import { formatDateTime, formatActionLabel } from '@/lib/utils/formatters';
import {
  ShieldCheckIcon,
  EyeIcon,
  CopyIcon,
  CodeIcon,
  MoreHorizontalIcon,
  CheckCircleIcon,
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
import { AuditLogDetailModal } from '@/components/dashboard/audit/AuditLogDetailModal';
import { PageHeader } from '@/components/shared/PageHeader';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => AuditService.getLogs());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
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
  } = useDataTableInteractions<AuditLogEntry>();

  useEffect(() => {
    // Listen to localStorage storage events or refresh
    setLogs(AuditService.getLogs());
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

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction.toLowerCase())) return false;
      if (filterStatus !== 'all' && log.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchActor = log.actor.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchResource = log.resourceName.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        if (!matchActor && !matchAction && !matchResource && !matchDetails) return false;
      }
      return true;
    });
  }, [logs, filterAction, filterStatus, searchQuery]);

  // Pagination slice
  const totalItems = filteredLogs.length;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAction, filterStatus, pageSize]);

  const isFilterActive = searchQuery.trim() !== '' || filterAction !== 'all' || filterStatus !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAction('all');
    setFilterStatus('all');
    setCurrentPage(1);
    showToast('Filter jejak audit forensik berhasil direset', 'info');
  };

  const handleExportCSV = () => {
    const headers = ['Waktu', 'Aktor', 'Peran', 'Aksi Tindakan', 'Sumber Daya', 'Rincian', 'Nilai Sebelum', 'Nilai Sesudah', 'Status'];
    const rows = filteredLogs.map((l) => [
      `"${formatDateTime(l.timestamp)}"`,
      `"${l.actor}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.resourceName}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.previousValue || ''}"`,
      `"${l.newValue || ''}"`,
      `"${l.status}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dokumenai_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Berhasil mengekspor ${filteredLogs.length} rekam log ke CSV!`, 'success');
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'action',
      label: 'Tipe Tindakan',
      type: 'select',
      placeholder: 'Semua Tindakan',
      options: [
        { label: 'Semua Tindakan', value: 'all' },
        { label: 'Persetujuan / Approval', value: 'approved' },
        { label: 'Verifikasi / Koreksi', value: 'verify' },
        { label: 'Unggah / Upload', value: 'upload' },
        { label: 'Ekspor / Export', value: 'export' },
      ],
      selectedValue: filterAction,
      onChange: (val) => setFilterAction(val),
    },
    {
      id: 'status',
      label: 'Status Kepatuhan',
      type: 'select',
      placeholder: 'Semua Status',
      options: [
        { label: 'Semua Status', value: 'all' },
        { label: 'Success / Berhasil', value: 'success' },
        { label: 'Failure / Gagal', value: 'failure' },
      ],
      selectedValue: filterStatus,
      onChange: (val) => setFilterStatus(val),
    },
  ];

  const auditActions: RowAction<AuditLogEntry>[] = useMemo(
    () => [
      {
        id: 'inspect_log',
        label: 'Inspeksi Forensik Lengkap',
        icon: <EyeIcon className="w-4 h-4 text-[#4F46E5]" />,
        onSelect: (log) => setSelectedLog(log),
      },
      {
        id: 'copy_ip',
        label: 'Salin Alamat IP Aktor',
        icon: <CopyIcon className="w-4 h-4 text-[#64748B]" />,
        onSelect: (log) => handleCopyText(log.ipAddress || '192.168.1.104', 'Alamat IP'),
      },
      {
        id: 'copy_log_id',
        label: 'Salin ID Entri Forensik',
        icon: <CodeIcon className="w-4 h-4 text-[#64748B]" />,
        onSelect: (log) => handleCopyText(log.id, 'Log ID'),
      },
    ],
    []
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
        title="Audit Trail Forensik & Rekam Jejak Kepatuhan"
        subtitle="Log aktivitas kepatuhan tidak dapat dimodifikasi untuk setiap tindakan persetujuan dan pengunggahan"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 min-w-0">
        <PageHeader
          title="Audit Trail Forensik & Rekam Jejak Kepatuhan"
          subtitle="Log aktivitas kepatuhan tidak dapat dimodifikasi untuk setiap tindakan persetujuan dan pengunggahan."
          badge={{ label: 'Jalur Forensik Aktif', variant: 'success' }}
        />

        {/* Banner */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Jalur Forensik Aktif:</strong> Seluruh aktivitas human-in-the-loop direkam dengan stempel waktu ISO, peran pengguna, dan alamat IP.
            </span>
          </div>
          <span className="font-bold text-[11px] bg-white px-2 py-1 rounded border border-emerald-200">
            {logs.length} Rekam Log
          </span>
        </div>

        {/* Reusable Global DataTableToolbar */}
        <DataTableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari aktor, aksi tindakan, atau sumber berkas..."
          filters={filterConfigs}
          totalFiltered={filteredLogs.length}
          totalUnfiltered={logs.length}
          entityName="log forensik"
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          exportOptions={{
            onExportCSV: handleExportCSV,
          }}
        />

        {/* Audit Table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
                  <th className="py-3 px-5">Waktu Aktivitas</th>
                  <th className="py-3 px-5">Aktor / Pengguna</th>
                  <th className="py-3 px-5">Aksi Tindakan</th>
                  <th className="py-3 px-5">Target Sumber Berkas</th>
                  <th className="py-3 px-5">Rincian Perubahan</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <DataTableEmptyState
                        title="Tidak ada log forensik yang sesuai"
                        description="Coba sesuaikan kata kunci pencarian atau reset filter tipe tindakan dan status."
                        isFilterActive={isFilterActive}
                        onResetFilters={handleResetFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <DataTableRow
                      key={log.id}
                      row={log}
                      onRowDoubleClick={(l) => setSelectedLog(l)}
                      onRowContextMenu={(l, e) => openContextMenu(l, e, 'Aksi Audit Log')}
                    >
                      <td className="py-3.5 px-5 font-mono text-[#64748B]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0F172A]">{log.actor}</div>
                        <div className="text-[10px] text-[#64748B]">{log.actorRole}</div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#4F46E5]">
                        {formatActionLabel(log.action)}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-[#0F172A]">
                        {log.resourceName}
                      </td>
                      <td className="py-3.5 px-5 text-[#475569] max-w-sm">
                        {log.details}
                        {log.previousValue && (
                          <div className="text-[10px] text-[#64748B] mt-0.5">
                            {log.previousValue} → <strong className="text-[#059669]">{log.newValue}</strong>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => openDropdownMenu(log, e, 'Aksi Audit Log')}
                          onMouseEnter={(e) => handleButtonMouseEnter(log, e, 'Aksi Audit Log')}
                          onMouseLeave={handleButtonMouseLeave}
                          title="Menu Aksi"
                          className="p-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#EEF2FF] text-slate-600 hover:text-[#4F46E5] transition-colors"
                        >
                          <MoreHorizontalIcon className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </DataTableRow>
                  ))
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

      {/* Forensic Inspection Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onCopyText={handleCopyText}
        />
      )}

      {/* Floating Action Menu */}
      {activeMenu && (
        <DataTableActionMenu
          isOpen={Boolean(activeMenu)}
          position={activeMenu.position}
          row={activeMenu.row}
          title={activeMenu.title || 'Aksi Audit Log'}
          subtitle={(l) => `${formatActionLabel(l.action)} - ${l.resourceName}`}
          actions={auditActions}
          onClose={closeMenu}
          onMouseEnter={cancelScheduledClose}
          onMouseLeave={() => scheduleCloseMenu(250)}
        />
      )}
    </div>
  );
}
