'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { DocumentService } from '@/lib/modules/documents/document.service';
import { AuditService } from '@/lib/modules/audit/audit.service';
import { DocumentRecord } from '@/types';
import { formatIDR, getDocumentTypeLabel } from '@/lib/utils/formatters';
import {
  FileTextIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';

export default function AnalyticsDashboardPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => DocumentService.getDocuments());
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    setDocuments(DocumentService.getDocuments());
  }, []);

  const totalDocs = documents.length;
  const approvedDocs = documents.filter((d) => d.status === 'approved');
  const reviewDocs = documents.filter((d) => d.status === 'needs_review');
  const rejectedDocs = documents.filter((d) => d.status === 'rejected');

  const avgConfidence = totalDocs > 0
    ? (documents.reduce((acc, d) => acc + d.confidence, 0) / totalDocs).toFixed(1)
    : '0';

  const totalValue = documents.reduce((acc, d) => acc + d.totalAmount, 0);

  // Group by document type
  const typeCounts = documents.reduce((acc, d) => {
    acc[d.documentType] = (acc[d.documentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Analisis Operasional Dokumen & Kinerja AI"
        subtitle="Metrik throughput ekstraksi, akurasi OCR per tipe dokumen, dan beban verifikasi tim"
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-8 min-w-0">
        <PageHeader
          title="Analisis Operasional Dokumen & Kinerja AI"
          subtitle="Metrik throughput ekstraksi, akurasi OCR per tipe dokumen, dan beban verifikasi tim."
          badge={{ label: 'Realtime Telemetry', variant: 'success' }}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Periode:</span>
              <select
                aria-label="Filter Periode Analisis"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="7d">7 Hari Terakhir</option>
                <option value="30d">30 Hari Terakhir</option>
                <option value="all">Semua Waktu</option>
              </select>
            </div>
          }
        />

        {/* KPI Metrik Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Volume Berkas</span>
              <FileTextIcon className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalDocs} Berkas</div>
            <p className="text-[11px] text-slate-500">Nilai: {formatIDR(totalValue)}</p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Rerata Akurasi AI</span>
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{avgConfidence}%</div>
            <p className="text-[11px] text-slate-500">Model: IndoFaktur v2.4 Vision</p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Disetujui (Approved)</span>
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{approvedDocs.length} Berkas</div>
            <p className="text-[11px] text-emerald-600 font-semibold">
              {totalDocs > 0 ? Math.round((approvedDocs.length / totalDocs) * 100) : 0}% Tingkat Kelulusan
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Antrean Verifikasi (HITL)</span>
              <ClockIcon className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{reviewDocs.length} Berkas</div>
            <p className="text-[11px] text-slate-500">Menunggu review verifikator</p>
          </div>
        </div>

        {/* Distribusi Jenis Dokumen & Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
            <SectionHeader
              title="Komposisi Jenis Dokumen"
              description="Proporsi berkas yang diproses oleh sistem berdasarkan klasifikasi e-Faktur & invoice."
            />
            <div className="space-y-3 pt-2">
              {Object.entries(typeCounts).map(([typeKey, count]) => {
                const percent = Math.round((count / totalDocs) * 100);
                return (
                  <div key={typeKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{getDocumentTypeLabel(typeKey as any)}</span>
                      <span className="text-slate-500">{count} berkas ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
            <SectionHeader
              title="Kinerja Verifikasi Human-in-the-Loop"
              description="Efisiensi peninjauan manual dan tingkat intervensi pada data ekstraksi AI."
            />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Tingkat Persetujuan</span>
                <div className="text-2xl font-black text-emerald-700">
                  {totalDocs > 0 ? Math.round((approvedDocs.length / totalDocs) * 100) : 0}%
                </div>
                <p className="text-[10px] text-emerald-600">Lulus validasi compliance</p>
              </div>
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 space-y-1">
                <span className="text-[11px] font-bold text-rose-800 uppercase">Tingkat Penolakan</span>
                <div className="text-2xl font-black text-rose-700">
                  {totalDocs > 0 ? Math.round((rejectedDocs.length / totalDocs) * 100) : 0}%
                </div>
                <p className="text-[10px] text-rose-600">{rejectedDocs.length} berkas ditolak</p>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed">
              💡 <strong>Rekomendasi Otomasi:</strong> Ambang batas auto-approval saat ini aktif pada tingkat kepercayaan 95%. Dokumen dengan akurasi di bawah 95% dialihkan otomatis ke antrean Human-in-the-Loop.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
