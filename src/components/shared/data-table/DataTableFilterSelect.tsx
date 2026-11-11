'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDownIcon, CheckIcon, SearchIcon, XIcon } from '@/components/ui/icons';
import { FilterConfig, FilterOption } from './types';

export interface DataTableFilterSelectProps {
  filter: FilterConfig;
}

export const DataTableFilterSelect: React.FC<DataTableFilterSelectProps> = ({ filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMulti = filter.type === 'multi-select';
  const selectedValues = Array.isArray(filter.selectedValue)
    ? filter.selectedValue
    : [filter.selectedValue];

  // Search input is enabled if explicitly true or if undefined and options > 3
  const isSearchable = filter.searchable !== false && (filter.searchable === true || filter.options.length > 3);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = filter.options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.category && opt.category.toLowerCase().includes(term)) ||
      (opt.value && opt.value.toLowerCase().includes(term))
    );
  });

  // Label to show on the button
  const getButtonLabel = () => {
    if (isMulti) {
      if (selectedValues.length === 0) {
        return filter.placeholder || 'Semua';
      }
      return `${selectedValues.length} dipilih`;
    }

    const current = filter.options.find((o) => o.value === filter.selectedValue);
    return current ? current.label : filter.placeholder || 'Semua';
  };

  const handleSelectOption = (option: FilterOption) => {
    if (isMulti) {
      const exists = selectedValues.includes(option.value);
      const next = exists
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      filter.onChange(next);
    } else {
      filter.onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleResetMulti = () => {
    if (isMulti) {
      filter.onChange([]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
        {filter.label} {isMulti && selectedValues.length > 0 && `(${selectedValues.length})`}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFF] border rounded-lg text-xs transition-all duration-150 focus:outline-none shadow-xs group ${isOpen
          ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 bg-white text-[#0F172A]'
          : 'border-[#CBD5E1] text-[#0F172A] hover:bg-white hover:border-[#94A3B8]'
          }`}
        aria-label={`Filter ${filter.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate font-medium">{getButtonLabel()}</span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-[#64748B] shrink-0 ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#4F46E5]' : 'group-hover:text-[#334155]'
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full min-w-full max-w-[calc(100vw-32px)] max-h-[min(380px,calc(100vh-140px))] bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-30 p-2 flex flex-col animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Sticky Header Section */}
          <div className="shrink-0 space-y-1.5 pb-1.5">
            {isMulti && (
              <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-600">Pilih {filter.label}</span>
                {selectedValues.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetMulti}
                    className="text-[10px] text-[#4F46E5] font-semibold hover:underline cursor-pointer"
                  >
                    Reset Pilihan
                  </button>
                )}
              </div>
            )}

            {isSearchable && (
              <div className="relative">
                <SearchIcon className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Cari ${filter.label.toLowerCase()}...`}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Hapus pencarian"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Options List */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                Tidak ada pilihan yang cocok
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);

                if (isMulti) {
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer text-xs transition-colors ${isSelected ? 'bg-[#F5F3FF]' : ''
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOption(opt)}
                        className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`truncate ${isSelected ? 'font-semibold text-[#4F46E5]' : 'font-medium text-[#0F172A]'}`}>
                          {opt.label}
                        </span>
                        {opt.category && (
                          <span className="text-[10px] text-[#64748B] truncate">{opt.category}</span>
                        )}
                      </div>
                    </label>
                  );
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${isSelected
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#334155] hover:bg-[#F8FAFC]'
                      }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 ml-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

