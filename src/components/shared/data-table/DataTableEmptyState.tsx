'use client';

import React from 'react';
import { SearchIcon, XIcon } from '@/components/ui/icons';

export interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
  isFilterActive?: boolean;
  onResetFilters?: () => void;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const DataTableEmptyState: React.FC<DataTableEmptyStateProps> = ({
  title,
  description,
  isFilterActive = false,
  onResetFilters,
  icon,
  action,
  className = '',
}) => {
  const defaultTitle = isFilterActive
    ? 'Tidak ada data yang sesuai filter'
    : 'Belum ada data tersedia';

  const defaultDescription = isFilterActive
    ? 'Coba sesuaikan kata kunci pencarian atau ubah kriteria filter yang Anda pilih.'
    : 'Data akan muncul di sini setelah ditambahkan ke sistem.';

  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        {icon || <SearchIcon className="w-6 h-6" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#0F172A]">{title || defaultTitle}</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto">{description || defaultDescription}</p>
      </div>

      <div className="flex items-center gap-2 pt-2">
        {isFilterActive && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
          >
            <XIcon className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        )}

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4F46E5] text-white text-xs font-semibold hover:bg-[#4338CA] transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

