'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, CheckIcon, SearchIcon, XIcon } from '@/components/ui/icons';
import { FilterConfig, FilterOption } from './types';

export interface DataTableFilterSelectProps {
  filter: FilterConfig;
}

export const DataTableFilterSelect: React.FC<DataTableFilterSelectProps> = ({ filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [alignRight, setAlignRight] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isMulti = filter.type === 'multi-select';
  const options = filter.options || [];
  const selectedValues = Array.isArray(filter.selectedValue)
    ? filter.selectedValue
    : [filter.selectedValue];

  // Search input is enabled unless explicitly disabled, when searchable=true or options > 3
  const isSearchable =
    filter.searchable !== false && (filter.searchable === true || options.length > 3);

  const hasActiveFilter = isMulti
    ? selectedValues.length > 0
    : Boolean(filter.selectedValue && filter.selectedValue !== 'all' && filter.selectedValue !== 'Semua');

  const updateHorizontalAlignment = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    const minMenuWidth = Math.max(rect.width, 240);
    setAlignRight(rect.left + minMenuWidth > window.innerWidth - 16 && rect.right > minMenuWidth);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    if (isOpen) {
      updateHorizontalAlignment();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateHorizontalAlignment);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateHorizontalAlignment);
    };
  }, [isOpen, updateHorizontalAlignment]);

  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.category && opt.category.toLowerCase().includes(term)) ||
      (opt.badge && opt.badge.toLowerCase().includes(term)) ||
      (opt.value && opt.value.toLowerCase().includes(term))
    );
  });

  useEffect(() => {
    if (!isOpen || !isSearchable) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [isOpen, isSearchable]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-filter-index="${highlightedIndex}"]`
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  // Label to show on the button
  const getButtonLabel = () => {
    if (isMulti) {
      if (selectedValues.length === 0) {
        return filter.placeholder || 'Semua';
      }
      if (selectedValues.length === 1) {
        const single = options.find((o) => o.value === selectedValues[0]);
        return single ? single.label : `${selectedValues.length} dipilih`;
      }
      return `${selectedValues.length} dipilih`;
    }

    const current = options.find((o) => o.value === filter.selectedValue);
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
      setHighlightedIndex(-1);
    }
  };

  const handleResetFilter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isMulti) {
      filter.onChange([]);
    } else {
      const defaultOpt = options.find((o) => o.value === 'all' || o.value === 'Semua');
      filter.onChange(defaultOpt ? defaultOpt.value : '');
    }
  };

  const handleSelectAllFiltered = () => {
    if (!isMulti) return;
    const filteredVals = filteredOptions.map((o) => o.value);
    const merged = Array.from(new Set([...selectedValues, ...filteredVals]));
    filter.onChange(merged);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setHighlightedIndex((prev) => (prev <= 0 ? filteredOptions.length - 1 : prev - 1));
      return;
    }

    if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
      e.preventDefault();
      handleSelectOption(filteredOptions[highlightedIndex]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
        {filter.label} {isMulti && selectedValues.length > 0 && `(${selectedValues.length})`}
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (prev) setHighlightedIndex(-1);
            return !prev;
          });
        }}
        className={`w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFF] border rounded-lg text-xs transition-all duration-150 focus:outline-none shadow-sm group cursor-pointer ${
          isOpen
            ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 bg-white text-[#0F172A]'
            : hasActiveFilter
              ? 'border-[#4F46E5]/40 bg-indigo-50/30 text-[#0F172A] hover:bg-white hover:border-[#4F46E5]'
              : 'border-[#CBD5E1] text-[#0F172A] hover:bg-white hover:border-[#94A3B8]'
        }`}
        aria-label={`Filter ${filter.label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate font-medium">{getButtonLabel()}</span>
        <span className="flex items-center gap-1 shrink-0 ml-1.5">
          {hasActiveFilter && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleResetFilter}
              title={`Reset filter ${filter.label}`}
              aria-label={`Reset filter ${filter.label}`}
              className="p-0.5 rounded hover:bg-slate-200/80 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <XIcon className="w-3 h-3" />
            </span>
          )}
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#4F46E5]' : 'group-hover:text-[#334155]'
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            alignRight ? 'right-0' : 'left-0'
          } mt-1.5 w-full min-w-[230px] max-w-[calc(100vw-32px)] max-h-[min(380px,calc(100vh-140px))] bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-40 p-2 flex flex-col animate-in`}
        >
          {/* Sticky Header Section */}
          <div className="shrink-0 space-y-1.5 pb-1.5">
            {isMulti && (
              <div className="flex items-center justify-between gap-2 pb-1 px-1 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 truncate">
                  Pilih {filter.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {filteredOptions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-[10px] text-[#4F46E5] font-semibold hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                  )}
                  {selectedValues.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleResetFilter()}
                      className="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {isSearchable && (
              <div className="relative">
                <SearchIcon className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder={`Cari ${filter.label.toLowerCase()}...`}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Options List */}
          <div
            ref={listRef}
            role="listbox"
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-0.5 pr-0.5 custom-scrollbar"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                Tidak ada pilihan yang cocok
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedValues.includes(opt.value);
                const isHighlighted = idx === highlightedIndex;

                if (isMulti) {
                  return (
                    <label
                      key={opt.value}
                      data-filter-index={idx}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#F5F3FF]'
                          : isHighlighted
                            ? 'bg-[#F1F5F9]'
                            : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOption(opt)}
                        className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5 cursor-pointer"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`truncate ${
                              isSelected ? 'font-semibold text-[#4F46E5]' : 'font-medium text-[#0F172A]'
                            }`}
                          >
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                              {opt.badge}
                            </span>
                          )}
                        </div>
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
                    role="option"
                    aria-selected={isSelected}
                    data-filter-index={idx}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                        : isHighlighted
                          ? 'bg-[#F1F5F9] text-[#0F172A]'
                          : 'text-[#334155] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#4F46E5]/15 text-[#4F46E5]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.category && (
                        <span className="block text-[10px] text-[#64748B] truncate">
                          {opt.category}
                        </span>
                      )}
                    </div>
                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />}
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
