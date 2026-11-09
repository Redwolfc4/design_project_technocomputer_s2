'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, SearchIcon } from '@/components/ui/icons';
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

  const filteredOptions = filter.options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.category && opt.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        className="w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFF] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] hover:bg-white transition-colors focus:outline-none focus:border-[#4F46E5] shadow-xs"
        aria-label={`Filter ${filter.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{getButtonLabel()}</span>
        <ChevronDownIcon className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-1.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full min-w-[200px] max-w-xs bg-white border border-[#CBD5E1] rounded-lg shadow-xl z-30 p-2 space-y-1">
          {isMulti && (
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-600">Pilih {filter.label}</span>
              {selectedValues.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetMulti}
                  className="text-[10px] text-[#4F46E5] font-semibold hover:underline"
                >
                  Reset Pilihan
                </button>
              )}
            </div>
          )}

          {filter.searchable !== false && filter.options.length > 5 && (
            <div className="relative">
              <SearchIcon className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Cari ${filter.label.toLowerCase()}...`}
                className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded mb-1 focus:outline-none focus:border-[#4F46E5]"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs text-[#94A3B8]">
                Tidak ada pilihan yang cocok
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);

                if (isMulti) {
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F8FAFC] cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOption(opt)}
                        className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5]"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-[#0F172A] truncate">{opt.label}</span>
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
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between hover:bg-[#EEF2FF] transition-colors ${
                      isSelected ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold' : 'text-[#334155]'
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

