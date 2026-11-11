'use client';

import React, { useState } from 'react';

export type TrendPeriod = '7d' | '30d' | '90d';

interface DailyTrendPoint {
  dateLabel: string;
  ingested: number;
  approved: number;
  needsReview: number;
}

interface DocumentTrendAreaChartProps {
  isDemo?: boolean;
}

export const DocumentTrendAreaChart: React.FC<DocumentTrendAreaChartProps> = ({
  isDemo = false,
}) => {
  const [period, setPeriod] = useState<TrendPeriod>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate realistic dataset based on period
  const trendData: Record<TrendPeriod, DailyTrendPoint[]> = {
    '7d': [
      { dateLabel: '01 Mar', ingested: 8, approved: 6, needsReview: 2 },
      { dateLabel: '02 Mar', ingested: 12, approved: 9, needsReview: 3 },
      { dateLabel: '03 Mar', ingested: 10, approved: 8, needsReview: 2 },
      { dateLabel: '04 Mar', ingested: 16, approved: 12, needsReview: 4 },
      { dateLabel: '05 Mar', ingested: 14, approved: 11, needsReview: 3 },
      { dateLabel: '06 Mar', ingested: 18, approved: 15, needsReview: 3 },
      { dateLabel: '07 Mar', ingested: 15, approved: 13, needsReview: 2 },
    ],
    '30d': [
      { dateLabel: 'Minggu 1', ingested: 42, approved: 34, needsReview: 8 },
      { dateLabel: 'Minggu 2', ingested: 58, approved: 48, needsReview: 10 },
      { dateLabel: 'Minggu 3', ingested: 72, approved: 60, needsReview: 12 },
      { dateLabel: 'Minggu 4', ingested: 65, approved: 56, needsReview: 9 },
    ],
    '90d': [
      { dateLabel: 'Januari', ingested: 180, approved: 152, needsReview: 28 },
      { dateLabel: 'Februari', ingested: 240, approved: 206, needsReview: 34 },
      { dateLabel: 'Maret', ingested: 295, approved: 260, needsReview: 35 },
    ],
  };

  const points = trendData[period];
  const maxVal = Math.max(...points.map((p) => p.ingested), 10);

  // SVG coordinate dimensions
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 24;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Helper to map index & value to (x, y)
  const getX = (idx: number) => paddingX + (idx / (points.length - 1)) * chartW;
  const getY = (val: number) => paddingY + chartH - (val / maxVal) * chartH;

  // Build SVG Path strings
  const buildLinePath = (key: 'ingested' | 'approved' | 'needsReview') => {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p[key])}`)
      .join(' ');
  };

  const buildAreaPath = (key: 'ingested' | 'approved' | 'needsReview') => {
    const linePath = buildLinePath(key);
    const lastX = getX(points.length - 1);
    const firstX = getX(0);
    const bottomY = paddingY + chartH;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const totalPeriodIngested = points.reduce((acc, p) => acc + p.ingested, 0);
  const totalPeriodApproved = points.reduce((acc, p) => acc + p.approved, 0);

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-4 min-w-0 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
              Tren Pemrosesan Dokumen
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200">
              Throughput
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Laju volume dokumen masuk vs verifikasi disetujui
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(['7d', '30d', '90d'] as TrendPeriod[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setPeriod(tab);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                period === tab
                  ? 'bg-white text-[#4F46E5] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab === '7d' ? '7 Hari' : tab === '30d' ? '30 Hari' : '90 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Line / Area SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-48 overflow-visible"
        >
          <defs>
            {/* Gradients for Areas */}
            <linearGradient id="ingestGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="approveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = paddingY + chartH * ratio;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fills */}
          <path d={buildAreaPath('ingested')} fill="url(#ingestGrad)" />
          <path d={buildAreaPath('approved')} fill="url(#approveGrad)" />

          {/* Lines */}
          <path
            d={buildLinePath('ingested')}
            fill="none"
            stroke="#4F46E5"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={buildLinePath('approved')}
            fill="none"
            stroke="#059669"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={buildLinePath('needsReview')}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={2}
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Hover Targets */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cyIngested = getY(p.ingested);
            const cyApproved = getY(p.approved);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Vertical hover guide bar */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={paddingY + chartH}
                    stroke="#CBD5E1"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point Dots */}
                <circle
                  cx={cx}
                  cy={cyIngested}
                  r={isHovered ? 5 : 3.5}
                  fill="#4F46E5"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
                <circle
                  cx={cx}
                  cy={cyApproved}
                  r={isHovered ? 5 : 3.5}
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />

                {/* Transparent Wide Click/Hover Zone */}
                <rect
                  x={cx - chartW / points.length / 2}
                  y={paddingY}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* X-Axis Date Labels */}
                <text
                  x={cx}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold transition-colors ${
                    isHovered ? 'fill-[#4F46E5] font-bold' : 'fill-[#94A3B8]'
                  }`}
                >
                  {p.dateLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-2 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] rounded-lg p-2.5 shadow-xl pointer-events-none transition-all z-20 space-y-1"
            style={{
              left: `${Math.min(
                Math.max((hoveredIndex / (points.length - 1)) * 100, 10),
                85
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
              {points[hoveredIndex].dateLabel}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-300">Dokumen Masuk:</span>
              <span className="font-bold tabular-nums">
                {points[hoveredIndex].ingested}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-emerald-300">Disetujui:</span>
              <span className="font-bold tabular-nums">
                {points[hoveredIndex].approved}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-amber-300">Perlu Review:</span>
              <span className="font-bold tabular-nums">
                {points[hoveredIndex].needsReview}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Summary Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            <span className="text-[#475569] font-medium">Dokumen Masuk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span className="text-[#475569] font-medium">Disetujui</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[#475569] font-medium">Review</span>
          </div>
        </div>

        <div className="text-[11px] text-[#64748B]">
          Total Periode Ini:{' '}
          <strong className="text-[#0F172A] font-bold">
            {totalPeriodIngested} Masuk
          </strong>{' '}
          ({totalPeriodApproved} Valid)
        </div>
      </div>
    </div>
  );
};

