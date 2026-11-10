'use client';

import React, { useState } from 'react';
import { SearchIcon, RefreshCwIcon, MenuIcon } from '@/components/ui/icons';
import { MockDocumentService } from '@/lib/mocks/storage';
import { useSidebar } from '@/context/SidebarContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export function Topbar({ title, subtitle, onSearch }: TopbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { toggleSidebar } = useSidebar();

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
    <header className="h-16 border-b border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] sticky top-0 z-20 w-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-full flex items-center justify-between gap-3">
        {/* Left: Mobile Hamburger Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0 cursor-pointer"
            aria-label="Buka navigasi sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Search Bar */}
          <div className="relative hidden xs:block w-32 sm:w-64 md:w-80">
            <SearchIcon className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari faktur, vendor..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-md border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-[#0F172A] dark:text-gray-100 placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:bg-white transition-all"
            />
          </div>

          {/* Global Reset Button */}
          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            title="Reset Data Simulasi"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md border border-[#E2E8F0] dark:border-[#374151] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] text-xs font-medium text-[#475569] dark:text-gray-300 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#4F46E5]' : ''}`} />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
