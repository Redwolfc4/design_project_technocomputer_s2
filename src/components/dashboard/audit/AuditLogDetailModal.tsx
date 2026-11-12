'use client';

import React from 'react';
import { AuditLogEntry } from '@/types';
import { formatDateTime, formatActionLabel, formatRoleLabel } from '@/lib/utils/formatters';
import { XIcon, ShieldCheckIcon, CopyIcon, CodeIcon } from '@/components/ui/icons';

export interface AuditLogDetailModalProps {
  log: AuditLogEntry | null;
  onClose: () => void;
  onCopyText?: (text: string, label: string) => void;
}

export function AuditLogDetailModal({ log, onClose, onCopyText }: AuditLogDetailModalProps) {
  React.useEffect(() => {
    if (!log) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [log, onClose]);

  if (!log) return null;

  const handleCopy = (text: string, label: string) => {
    if (onCopyText) {
      onCopyText(text, label);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F172A]">Rincian Log Forensik Kepatuhan</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    log.status === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {log.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-mono mt-0.5">ID: {log.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs text-[#334155]">
          <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Aktor / Pengguna</p>
              <p className="font-bold text-[#0F172A] mt-0.5">{log.actor}</p>
              <p className="text-[11px] text-[#4F46E5] font-semibold">{formatRoleLabel(log.actorRole)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Waktu Stempel ISO</p>
              <p className="font-mono text-[#0F172A] mt-0.5">{formatDateTime(log.timestamp)}</p>
              <p className="text-[11px] text-[#64748B] font-mono truncate">{log.timestamp}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tindakan / Aksi</p>
              <p className="font-semibold text-[#4F46E5] mt-0.5">{formatActionLabel(log.action)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Alamat IP & Jaringan</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[#0F172A]">{log.ipAddress || '192.168.1.104'}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(log.ipAddress || '192.168.1.104', 'Alamat IP')}
                  title="Salin Alamat IP"
                  className="text-slate-400 hover:text-[#4F46E5] p-0.5"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Target Sumber Berkas</p>
            <div className="p-2.5 rounded-lg border border-[#CBD5E1] bg-white font-medium text-[#0F172A]">
              {log.resourceName}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Rincian Narasi & Mutasi</p>
            <div className="p-3 rounded-lg border border-[#CBD5E1] bg-white space-y-2">
              <p className="text-[#334155] leading-relaxed">{log.details}</p>
              {(log.previousValue || log.newValue) && (
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Perubahan:</span>
                  <span className="line-through text-rose-500 font-medium">
                    {log.previousValue ? log.previousValue.replace(/_/g, ' ') : '(Kosong)'}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {log.newValue ? log.newValue.replace(/_/g, ' ') : '(Dihapus)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Raw JSON Audit Payload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                <CodeIcon className="w-3 h-3 text-[#4F46E5]" />
                <span>Forensic Raw JSON Payload</span>
              </p>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(log, null, 2), 'JSON Payload')}
                className="text-[10px] font-semibold text-[#4F46E5] hover:underline flex items-center gap-1"
              >
                <CopyIcon className="w-3 h-3" />
                <span>Salin JSON</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-xs"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
