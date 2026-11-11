'use client';

import React from 'react';

interface OperationalEfficiencyChartProps {
  totalDocs: number;
}

export const OperationalEfficiencyChart: React.FC<OperationalEfficiencyChartProps> = ({
  totalDocs,
}) => {
  // AI processing: 1.4 seconds per doc
  // Manual processing assumption: 15 minutes (900 seconds) per doc based on enterprise finance AP entry
  const aiSecPerDoc = 1.4;
  const manualSecPerDoc = 900; // 15 mins
  const speedupFactor = Math.round(manualSecPerDoc / aiSecPerDoc); // ~642x faster

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-4 min-w-0 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
            Analisis Efisiensi Waktu & ROI Operasional
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#059669] border border-emerald-200">
            642x Lebih Cepat
          </span>
        </div>
        <p className="text-[11px] text-[#64748B] mt-0.5">
          Perbandingan throughput otomatisasi AI vs input manual standar industri
        </p>
      </div>

      {/* Visual Metric Comparison */}
      <div className="space-y-3.5 py-1">
        {/* AI Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#4F46E5] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
              Otomasi DokumenAI Enterprise
            </span>
            <span className="font-extrabold text-[#4F46E5] tabular-nums">
              1.4 Detik / Dokumen
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-full w-full" />
          </div>
        </div>

        {/* Manual Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#64748B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              Verifikasi & Ketik Manual Tradisional
            </span>
            <span className="font-bold text-[#64748B] tabular-nums">
              15 - 20 Menit / Dokumen
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-slate-300 rounded-full w-[4%]" />
          </div>
        </div>
      </div>

      {/* 2 Highlight Cards */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-[#EEF2FF]/60 border border-indigo-100 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
            Akurasi OCR Tanpa Lelah
          </div>
          <div className="text-xl font-black text-[#0F172A] mt-0.5">98.4%</div>
          <div className="text-[10px] text-[#64748B]">Ekstraksi e-Faktur</div>
        </div>

        <div className="p-3 rounded-lg bg-[#F0FDF4]/70 border border-emerald-100 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#059669]">
            Jam Kerja Dialihkan
          </div>
          <div className="text-xl font-black text-[#059669] mt-0.5">184 Jam</div>
          <div className="text-[10px] text-[#64748B]">Ke analisis strategis</div>
        </div>
      </div>

      {/* Transparency Disclaimer */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-[#94A3B8] leading-tight">
        *Estimasi dihitung berdasarkan standar industri AP perbankan: 15 menit/faktur manual dibanding 1.4 detik pemrosesan AI engine.
      </div>
    </div>
  );
};

