'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DocumentRecord } from '@/types';
import { formatIDR, getDocumentTypeLabel } from '@/lib/utils/formatters';
import { BarChart3Icon, LayersIcon } from '@/components/ui/icons';

export default function OperationalAnalyticsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  useEffect(() => {
    setDocuments(MockDocumentService.getDocuments());
  }, []);

  const total = documents.length || 1;
  const approved = documents.filter((d) => d.status === 'approved').length;
  const pending = documents.filter((d) => d.status === 'needs_review').length;
  const rejected = documents.filter((d) => d.status === 'rejected').length;

  const typeCounts: Record<string, number> = {};
  documents.forEach((d) => {
    typeCounts[d.documentType] = (typeCounts[d.documentType] || 0) + 1;
  });

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Analisis Operasional & Efisiensi Finansial"
        subtitle="Metrik waktu siklus verifikasi, akurasi per jenis dokumen, dan estimasi penghematan jam kerja"
      />

      <main className="flex-1 p-8 space-y-8 max-w-7xl">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#64748B]">Tingkat Persetujuan Pertama</span>
            <div className="text-3xl font-extrabold text-[#059669]">
              {Math.round((approved / total) * 100)}%
            </div>
            <p className="text-[11px] text-[#64748B]">Dokumen langsung lolos verifikasi tanpa koreksi</p>
          </div>

          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#64748B]">Rerata Waktu Pemrosesan AI</span>
            <div className="text-3xl font-extrabold text-[#4F46E5]">1.4 Detik</div>
            <p className="text-[11px] text-[#64748B]">Dari upload scan hingga ekstraksi bidang JSON</p>
          </div>

          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-2">
            <span className="text-xs font-semibold text-[#64748B]">Estimasi Jam Kerja Hemat</span>
            <div className="text-3xl font-extrabold text-[#0F172A]">184 Jam</div>
            <p className="text-[11px] text-[#64748B]">Dibandingkan pengetikan manual per nota</p>
          </div>
        </div>

        {/* Breakdown by Type Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <div className="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Distribusi Status Dokumen</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#059669]">Terverifikasi & Siap Bayar</span>
                  <span>{approved} berkas ({Math.round((approved / total) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#059669] rounded-full" style={{ width: `${(approved / total) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#F59E0B]">Perlu Validasi Reviewer</span>
                  <span>{pending} berkas ({Math.round((pending / total) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${(pending / total) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#E11D48]">Ditolak Karena Cacat / Buram</span>
                  <span>{rejected} berkas ({Math.round((rejected / total) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#E11D48] rounded-full" style={{ width: `${(rejected / total) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Volume by Document Type */}
          <div className="p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Volume Berdasarkan Jenis Berkas</h3>
            <div className="space-y-2.5">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFF] border border-[#E2E8F0] text-xs">
                  <span className="font-semibold text-[#0F172A]">{getDocumentTypeLabel(type)}</span>
                  <span className="font-bold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-md">{count} Berkas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

