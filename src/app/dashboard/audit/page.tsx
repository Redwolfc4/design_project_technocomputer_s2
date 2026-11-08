'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
import { AuditLogEntry } from '@/types';
import { formatDateTime } from '@/lib/utils/formatters';
import { ShieldCheckIcon } from '@/components/ui/icons';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    setLogs(MockDocumentService.getAuditLogs());
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && !log.action.includes(filterAction.toUpperCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Audit Trail Forensik & Rekam Jejak Kepatuhan"
        subtitle="Log aktivitas kepatuhan tidak dapat dimodifikasi untuk setiap tindakan persetujuan dan pengunggahan"
      />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        {/* Banner */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs text-emerald-800">
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

        {/* Audit Table */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">Waktu Aktivitas</th>
                  <th className="py-3 px-5">Aktor / Pengguna</th>
                  <th className="py-3 px-5">Aksi Tindakan</th>
                  <th className="py-3 px-5">Target Sumber Berkas</th>
                  <th className="py-3 px-5">Rincian Perubahan</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[#64748B]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#0F172A]">{log.actor}</div>
                      <div className="text-[10px] text-[#64748B]">{log.actorRole}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#4F46E5]">
                      {log.action}
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

