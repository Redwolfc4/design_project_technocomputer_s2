'use client';

import React, { useState } from 'react';
import { getDocumentTypeLabel } from '@/lib/utils/formatters';

export interface DocumentTypeItem {
  type: string;
  count: number;
}

interface DocumentTypeBarChartProps {
  items: DocumentTypeItem[];
  total: number;
  activeTypeFilter: string | null;
  onSelectType: (type: string | null) => void;
}

export const DocumentTypeBarChart: React.FC<DocumentTypeBarChartProps> = ({
  items,
  total,
  activeTypeFilter,
  onSelectType,
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  // Sort descending by count
  const sortedItems = [...items].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...sortedItems.map((i) => i.count), 1);

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-xs space-y-4 min-w-0 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
            Volume Berdasarkan Jenis Berkas
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Distribusi berkas berdasarkan kategori e-Faktur, PO, dan invoice
          </p>
        </div>
        {activeTypeFilter && (
          <button
            type="button"
            onClick={() => onSelectType(null)}
            className="text-[11px] font-bold text-[#4F46E5] hover:text-[#4338CA] bg-[#EEF2FF] hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            Reset Filter ✕
          </button>
        )}
      </div>

      {/* Horizontal Bars */}
      <div className="space-y-3 pt-1">
        {sortedItems.map((item) => {
          const isSelected = activeTypeFilter === item.type;
          const isHovered = hoveredType === item.type;
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const barWidthPercent = Math.max((item.count / maxCount) * 100, 4);

          return (
            <div
              key={item.type}
              onMouseEnter={() => setHoveredType(item.type)}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => onSelectType(isSelected ? null : item.type)}
              className={`group p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#4F46E5] bg-[#EEF2FF]/60 shadow-2xs ring-1 ring-[#4F46E5]/20'
                  : isHovered
                  ? 'border-[#CBD5E1] bg-[#F8FAFC]'
                  : 'border-transparent hover:bg-[#F8FAFC]'
              }`}
            >
              {/* Labels & Counts */}
              <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                <span
                  className={`font-semibold truncate transition-colors ${
                    isSelected || isHovered
                      ? 'text-[#4F46E5] font-bold'
                      : 'text-[#334155]'
                  }`}
                >
                  {getDocumentTypeLabel(item.type)}
                </span>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <span className="font-bold text-[#0F172A] tabular-nums">
                    {item.count} Berkas
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] tabular-nums bg-slate-100 px-1.5 py-0.2 rounded">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#4338CA]'
                      : isHovered
                      ? 'bg-gradient-to-r from-indigo-500 to-[#4F46E5]'
                      : 'bg-[#4F46E5]'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

