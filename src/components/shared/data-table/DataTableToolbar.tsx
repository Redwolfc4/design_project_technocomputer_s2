'use client';

import React from 'react';
import { PlusIcon } from '@/components/ui/icons';
import { DataTableToolbarProps } from './types';
import { DataTableSearch } from './DataTableSearch';
import { DataTableFilters } from './DataTableFilters';
import { DataTableResultCount } from './DataTableResultCount';
import { DataTableExport } from './DataTableExport';

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filters = [],
  totalFiltered,
  totalUnfiltered,
  entityName = 'data',
  onResetFilters,
  isFilterActive = false,
  exportOptions,
  primaryAction,
  extraActions,
  compact = false,
  className = '',
}) => {
  const showSearch = typeof searchQuery === 'string' && typeof onSearchChange === 'function';
  const hasFilters = filters.length > 0;

  return (
    <div
      className={`rounded-xl border border-[#E2E8F0] bg-white shadow-xs ${
        compact ? 'p-3.5 sm:p-4 space-y-3' : 'p-5 space-y-4'
      } ${className}`}
    >
      {/* 1. Search Bar */}
      {showSearch && (
        <DataTableSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      )}

      {/* 2. Searchable Filters Row */}
      {hasFilters && <DataTableFilters filters={filters} />}

      {/* 3. Action Bar: Hanya tampil jika ada tombol reset filter (saat filter aktif), export, atau aksi */}
      {(isFilterActive && onResetFilters || exportOptions || primaryAction || extraActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#F1F5F9]">
          <DataTableResultCount
            totalFiltered={totalFiltered}
            totalUnfiltered={totalUnfiltered}
            entityName={entityName}
            isFilterActive={isFilterActive}
            onResetFilters={onResetFilters}
          />

          <div className="flex items-center gap-2.5 flex-wrap">
            {extraActions}

            {/* Export Component */}
            {exportOptions && <DataTableExport options={exportOptions} />}

            {/* Primary Action Button */}
            {primaryAction && (
              <button
                type="button"
                disabled={primaryAction.disabled}
                onClick={primaryAction.onClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {primaryAction.icon || <PlusIcon className="w-3.5 h-3.5" />}
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

