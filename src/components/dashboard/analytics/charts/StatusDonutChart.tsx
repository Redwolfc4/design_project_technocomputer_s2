'use client';

import React, { useState } from 'react';
import { DocumentStatus } from '@/types';

export interface StatusDonutItem {
  status: DocumentStatus;
  label: string;
  count: number;
  color: string;
  hoverColor: string;
  bgLight: string;
}

interface StatusDonutChartProps {
  items: StatusDonutItem[];
  total: number;
  activeFilter: DocumentStatus | null;
  onSelectStatus: (status: DocumentStatus | null) => void;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  items,
  total,
  activeFilter,
  onSelectStatus,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<DocumentStatus | null>(null);

  // SVG Geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulatedPercent = 0;
  const segments = items.map((item) => {
    const percent = total > 0 ? (item.count / total) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      percent: Math.round(percent),
      exactPercent: percent.toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeOrHoveredItem = items.find(
    (i) => i.status === (hoveredStatus || activeFilter)
  );

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-5 min-w-0 flex flex-col justify-between">
      {/* Header with Title & Reset Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
            Distribusi Status Dokumen
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Klik segmen untuk menyaring tabel dokumen
          </p>
        </div>
        {activeFilter && (
          <button
            type="button"
            onClick={() => onSelectStatus(null)}
            className="text-[11px] font-bold text-[#4F46E5] hover:text-[#4338CA] bg-[#EEF2FF] hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            Reset Filter ✕
          </button>
        )}
      </div>

      {/* Main Chart & Donut Center */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-1">
        {/* SVG Donut Circle */}
        <div className="relative w-[180px] h-[180px] shrink-0 select-none">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Empty Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Render Segments */}
            {total > 0 &&
              segments.map((seg) => {
                const isHovered = hoveredStatus === seg.status;
                const isSelected = activeFilter === seg.status;
                const isDimmed =
                  (hoveredStatus !== null && !isHovered) ||
                  (activeFilter !== null && !isSelected);

                return (
                  <circle
                    key={seg.status}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      filter: isHovered || isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredStatus(seg.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    onClick={() =>
                      onSelectStatus(activeFilter === seg.status ? null : seg.status)
                    }
                  />
                );
              })}
          </svg>

          {/* Donut Center Counter / Highlight */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {activeOrHoveredItem ? (
              <>
                <span
                  className="text-xs font-bold uppercase tracking-wider truncate max-w-[110px]"
                  style={{ color: activeOrHoveredItem.color }}
                >
                  {activeOrHoveredItem.label.split(' ')[0]}
                </span>
                <span className="text-2xl font-black text-[#0F172A] tracking-tight leading-none my-0.5">
                  {activeOrHoveredItem.count}
                </span>
                <span className="text-[10px] text-[#64748B] font-semibold">
                  {total > 0
                    ? `${Math.round((activeOrHoveredItem.count / total) * 100)}% porsi`
                    : '0%'}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Total Berkas
                </span>
                <span className="text-3xl font-black text-[#0F172A] tracking-tight leading-none my-0.5">
                  {total}
                </span>
                <span className="text-[10px] text-[#059669] font-bold">
                  100% Terpantau
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((seg) => {
            const isSelected = activeFilter === seg.status;
            const isHovered = hoveredStatus === seg.status;

            return (
              <div
                key={seg.status}
                onMouseEnter={() => setHoveredStatus(seg.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() =>
                  onSelectStatus(activeFilter === seg.status ? null : seg.status)
                }
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#4F46E5] bg-[#EEF2FF]/60 shadow-2xs ring-1 ring-[#4F46E5]/20'
                    : isHovered
                    ? 'border-[#CBD5E1] bg-[#F8FAFC]'
                    : 'border-transparent hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-[#4F46E5] font-bold' : 'text-[#334155]'
                    }`}
                  >
                    {seg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {seg.count} berkas
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] tabular-nums bg-slate-100 px-1.5 py-0.5 rounded">
                    {seg.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

