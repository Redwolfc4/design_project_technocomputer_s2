'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, ChevronDownIcon } from '@/components/ui/icons';
import { DataTableExportOptions } from './types';

export interface DataTableExportProps {
  options: DataTableExportOptions;
  className?: string;
}

export const DataTableExport: React.FC<DataTableExportProps> = ({ options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasMultiple = Boolean(
    (options.onExportCSV && options.onExportExcel) ||
    (options.onExportCSV && options.onExportPDF) ||
    (options.onExportExcel && options.onExportPDF)
  );

  const handleSingleExport = () => {
    if (options.onExportCSV) options.onExportCSV();
    else if (options.onExportExcel) options.onExportExcel();
    else if (options.onExportPDF) options.onExportPDF();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={options.disabled}
        onClick={() => {
          if (hasMultiple) {
            setIsOpen((prev) => !prev);
          } else {
            handleSingleExport();
          }
        }}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#FAFAFF] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <DownloadIcon className="w-3.5 h-3.5 text-[#64748B]" />
        <span>Export</span>
        {hasMultiple && <ChevronDownIcon className="w-3 h-3 text-[#64748B]" />}
      </button>

      {isOpen && hasMultiple && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-[#CBD5E1] rounded-lg shadow-xl z-30 p-1.5 space-y-0.5">
          {options.onExportCSV && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                options.onExportCSV!();
              }}
              className="w-full text-left px-3 py-2 rounded text-xs text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Export CSV (.csv)</span>
            </button>
          )}

          {options.onExportExcel && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                options.onExportExcel!();
              }}
              className="w-full text-left px-3 py-2 rounded text-xs text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Export Excel (.xls)</span>
            </button>
          )}

          {options.onExportPDF && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                options.onExportPDF!();
              }}
              className="w-full text-left px-3 py-2 rounded text-xs text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Export PDF (.pdf)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

