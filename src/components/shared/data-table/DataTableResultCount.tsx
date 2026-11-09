'use client';

import React from 'react';
import { XIcon } from '@/components/ui/icons';

export interface DataTableResultCountProps {
  totalFiltered: number;
  totalUnfiltered?: number;
  entityName?: string;
  isFilterActive?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

export const DataTableResultCount: React.FC<DataTableResultCountProps> = ({
  totalFiltered,
  totalUnfiltered,
  entityName = 'data',
  isFilterActive = false,
  onResetFilters,
  className = '',
}) => {
  const showUnfiltered =
    typeof totalUnfiltered === 'number' && totalUnfiltered !== totalFiltered;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-xs font-semibold text-[#475569]">
        <strong className="text-[#0F172A] font-bold">{totalFiltered}</strong> {entityName} ditemukan
        {showUnfiltered && ` (dari total ${totalUnfiltered})`}
      </span>

      {isFilterActive && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition-colors"
        >
          <XIcon className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>
      )}
    </div>
  );
};

