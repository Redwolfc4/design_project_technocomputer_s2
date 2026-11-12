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

// Polar coordinate math for precision SVG donut sector paths
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSector(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  // Cap slightly below 360 to avoid full-circle SVG arc singularity
  const sweepAngle = Math.min(Math.max(endAngle - startAngle, 0.1), 359.99);
  const actualEndAngle = startAngle + sweepAngle;

  const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, actualEndAngle);
  const startInner = polarToCartesian(x, y, innerRadius, actualEndAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  items,
  total,
  activeFilter,
  onSelectStatus,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<DocumentStatus | null>(null);

  // SVG Geometry: Clean 200x200 canvas
  const canvasSize = 200;
  const center = canvasSize / 2;
  const innerR = 56;
  const outerR = 86;
  const expandedOuterR = 94; // Scale out on hover/active for clear tactile click response

  // Compute angles
  let currentAngle = 0;
  const sectors = items.map((item) => {
    const fraction = total > 0 ? item.count / total : 0;
    const sweep = fraction * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;
    currentAngle += sweep;

    const isHovered = hoveredStatus === item.status;
    const isSelected = activeFilter === item.status;
    const activeRadius = isHovered || isSelected ? expandedOuterR : outerR;

    const pathData = total > 0 ? describeDonutSector(center, center, innerR, activeRadius, startAngle, endAngle) : '';

    return {
      ...item,
      fraction,
      percent: Math.round(fraction * 100),
      startAngle,
      endAngle,
      pathData,
      isHovered,
      isSelected,
    };
  });

  const activeOrHoveredItem = items.find(
    (i) => i.status === (hoveredStatus || activeFilter)
  );

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-5 min-w-0 flex flex-col justify-between select-none">
      {/* Header with Title & Reset Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
            Distribusi Status Dokumen
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Klik pada cincin grafik atau tombol status untuk memfilter data
          </p>
        </div>
        {activeFilter && (
          <button
            type="button"
            onClick={() => onSelectStatus(null)}
            className="text-[11px] font-bold text-[#4F46E5] hover:text-[#4338CA] bg-[#EEF2FF] hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>Reset Filter</span>
            <span className="font-extrabold">✕</span>
          </button>
        )}
      </div>

      {/* Main Chart & Donut Center */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-1">
        {/* SVG Donut Slices */}
        <div className="relative w-[200px] h-[200px] shrink-0">
          <svg
            width={canvasSize}
            height={canvasSize}
            viewBox={`0 0 ${canvasSize} ${canvasSize}`}
            className="overflow-visible"
          >
            {/* Background Empty Ring (Fallback if 0 docs) */}
            {total === 0 && (
              <circle
                cx={center}
                cy={center}
                r={(innerR + outerR) / 2}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={outerR - innerR}
              />
            )}

            {/* True SVG Donut Sector Paths */}
            {total > 0 &&
              sectors.map((sec) => {
                const isDimmed =
                  (hoveredStatus !== null && !sec.isHovered) ||
                  (activeFilter !== null && !sec.isSelected);

                return (
                  <path
                    key={sec.status}
                    d={sec.pathData}
                    fill={sec.color}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      filter:
                        sec.isHovered || sec.isSelected
                          ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))'
                          : 'none',
                      transformOrigin: `${center}px ${center}px`,
                    }}
                    onMouseEnter={() => setHoveredStatus(sec.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    onClick={() =>
                      onSelectStatus(activeFilter === sec.status ? null : sec.status)
                    }
                  />
                );
              })}
          </svg>

          {/* Donut Center Counter / Highlight */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {activeOrHoveredItem ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span
                  className="text-xs font-bold uppercase tracking-wider truncate block max-w-[110px]"
                  style={{ color: activeOrHoveredItem.color }}
                >
                  {activeOrHoveredItem.label.split(' ')[0]}
                </span>
                <span className="text-3xl font-black text-[#0F172A] tracking-tight leading-none my-0.5 block">
                  {activeOrHoveredItem.count}
                </span>
                <span className="text-[11px] text-[#64748B] font-semibold block">
                  {total > 0
                    ? `${Math.round((activeOrHoveredItem.count / total) * 100)}% porsi`
                    : '0%'}
                </span>
              </div>
            ) : (
              <div className="animate-in fade-in duration-150">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Total Berkas
                </span>
                <span className="text-3xl font-black text-[#0F172A] tracking-tight leading-none my-0.5 block">
                  {total}
                </span>
                <span className="text-[10px] text-[#059669] font-bold block">
                  100% Terpantau
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend / Breakdown List with High-Affordance Click Targets */}
        <div className="flex-1 w-full space-y-2">
          {sectors.map((seg) => {
            const isSelected = activeFilter === seg.status;
            const isHovered = hoveredStatus === seg.status;

            return (
              <button
                key={seg.status}
                type="button"
                onMouseEnter={() => setHoveredStatus(seg.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() =>
                  onSelectStatus(activeFilter === seg.status ? null : seg.status)
                }
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#4F46E5] bg-[#EEF2FF] shadow-sm ring-2 ring-[#4F46E5]/20 font-bold'
                    : isHovered
                    ? 'border-[#CBD5E1] bg-[#F8FAFC]'
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs transition-transform duration-200"
                    style={{
                      backgroundColor: seg.color,
                      transform: isSelected || isHovered ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                  <span
                    className={`text-xs truncate ${
                      isSelected
                        ? 'text-[#4F46E5] font-extrabold'
                        : isHovered
                        ? 'text-[#0F172A] font-bold'
                        : 'text-[#334155] font-medium'
                    }`}
                  >
                    {seg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {seg.count} berkas
                  </span>
                  <span
                    className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#4F46E5] text-white shadow-2xs'
                        : 'bg-slate-100 text-[#64748B]'
                    }`}
                  >
                    {seg.percent}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
