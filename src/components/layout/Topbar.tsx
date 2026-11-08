'use client';

import React, { useState } from 'react';
import { SearchIcon, RefreshCwIcon } from '@/components/ui/icons';
import { MockDocumentService } from '@/lib/mocks/storage';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export function Topbar({ title, subtitle, onSearch }: TopbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = () => {
    if (confirm('Reset seluruh data demo ke kondisi awal fixtures pabrikan?')) {
      setIsResetting(true);
      MockDocumentService.resetDemoData();
      setTimeout(() => {
        setIsResetting(false);
        window.location.reload();
      }, 400);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="h-16 border-b border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] sticky top-0 z-20 px-8 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-base font-bold text-[#0F172A] dark:text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-64 md:w-80">
          <SearchIcon className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor faktur, vendor, atau tag..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-md border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-[#0F172A] dark:text-gray-100 placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:bg-white"
          />
        </div>

        {/* Reset Demo Data Pill */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset semua perubahan data demo ke setelan pabrikan"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E2E8F0] dark:border-[#374151] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-medium text-[#475569] dark:text-gray-300 transition-colors"
        >
          <RefreshCwIcon className={`w-3.5 h-3.5 text-[#64748B] ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo Data</span>
        </button>
      </div>
    </header>
  );
}

