'use client';

import React from 'react';
import { SearchIcon, XIcon } from '@/components/ui/icons';

export interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const DataTableSearch: React.FC<DataTableSearchProps> = ({
  value,
  onChange,
  placeholder = 'Cari...',
  className = '',
  autoFocus = false,
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <SearchIcon className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2.5 bg-[#FAFAFF] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors p-0.5"
          title="Hapus pencarian"
          aria-label="Hapus pencarian"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

