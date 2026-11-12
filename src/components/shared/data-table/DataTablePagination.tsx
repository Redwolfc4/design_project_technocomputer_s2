'use client';

import React, { useMemo } from 'react';
import { DataTablePaginationProps } from './types';
import { Select } from '@/components/ui/Select';

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const selectOptions = useMemo(
    () =>
      pageSizeOptions.map((size) => ({
        value: String(size),
        label: String(size),
      })),
    [pageSizeOptions]
  );

  if (totalItems === 0) return null;

  // Generate page numbers with ellipsis handling
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`p-4 border-t border-[#E2E8F0] bg-[#FAFAFF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] ${className}`}
    >
      {/* Left: Page Size Selector & Range Indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        <span>Tampilkan</span>
        <div className="w-20">
          <Select
            size="xs"
            value={String(pageSize)}
            options={selectOptions}
            disabled={isLoading}
            aria-label="Pilih jumlah baris per halaman"
            onChange={(val) => {
              onPageSizeChange(Number(val));
              onPageChange(1);
            }}
          />
        </div>
        <span>
          baris per halaman (Menampilkan {startItem}–{endItem} dari {totalItems} data)
        </span>
      </div>

      {/* Right: Navigation Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          aria-label="Halaman sebelumnya"
        >
          Sebelumnya
        </button>

        {getPageNumbers().map((item, idx) => {
          if (item === '...') {
            return (
              <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 select-none">
                ...
              </span>
            );
          }

          const pageNum = item as number;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-slate-50'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-white text-xs font-semibold text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          aria-label="Halaman selanjutnya"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
};

