'use client';

import React from 'react';
import { FilterConfig } from './types';
import { DataTableFilterSelect } from './DataTableFilterSelect';
import { DataTableDateRangePicker } from './DataTableDateRangePicker';

export interface DataTableFiltersProps {
  filters: FilterConfig[];
  className?: string;
}

export const DataTableFilters: React.FC<DataTableFiltersProps> = ({
  filters,
  className = '',
}) => {
  if (!filters || filters.length === 0) return null;

  // Dynamically set grid columns depending on how many filters there are
  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridColsClass(filters.length)} gap-3 ${className}`}>
      {filters.map((filter) =>
        filter.type === 'date-range' ? (
          <DataTableDateRangePicker key={filter.id} filter={filter} />
        ) : (
          <DataTableFilterSelect key={filter.id} filter={filter} />
        )
      )}
    </div>
  );
};

