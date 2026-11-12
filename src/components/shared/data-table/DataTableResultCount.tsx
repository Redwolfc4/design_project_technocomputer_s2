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
  if (!isFilterActive || !onResetFilters) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition-colors cursor-pointer"
      >
        <XIcon className="w-3.5 h-3.5" />
        <span>Reset Filter</span>
      </button>
    </div>
  );
};

