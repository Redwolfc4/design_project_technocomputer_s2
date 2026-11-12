'use client';

import React, { useState, useRef, useEffect, useMemo, useId, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon, SearchIcon, XIcon, PlusIcon } from '@/components/ui/icons';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  category?: string;
  badge?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string> {
  options: SelectOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  allowCustom?: boolean;
  customOptionPrefix?: string;
  clearable?: boolean;
  onClear?: () => void;
  emptyText?: string;
  size?: 'xs' | 'sm' | 'md';
  minDropdownWidth?: number;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  id?: string;
  'aria-label'?: string;
}

interface MenuCoords {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUpward: boolean;
}

const sizeClasses: Record<'xs' | 'sm' | 'md', string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg min-h-[28px]',
  sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[34px]',
  md: 'px-3.5 py-2 text-xs rounded-lg min-h-[38px]',
};

export function Select<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = 'Pilih salah satu...',
  searchPlaceholder = 'Cari opsi...',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  searchable = false,
  allowCustom = false,
  customOptionPrefix = 'Gunakan nilai kustom:',
  clearable = false,
  onClear,
  emptyText = 'Tidak ada pilihan yang cocok',
  size = 'md',
  minDropdownWidth,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  id,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const listboxId = `${controlId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const effectiveSearchable = searchable || allowCustom;

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const hasValue = value !== undefined && value !== null && String(value) !== '';

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      if (opt.label.toLowerCase().includes(q)) return true;
      if (String(opt.value).toLowerCase().includes(q)) return true;
      if (opt.description && opt.description.toLowerCase().includes(q)) return true;
      if (opt.category && opt.category.toLowerCase().includes(q)) return true;
      if (opt.badge && opt.badge.toLowerCase().includes(q)) return true;
      if (opt.keywords && opt.keywords.some((kw) => kw.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [options, searchTerm]);

  // Custom entry option if allowCustom is active and searchTerm doesn't match an existing exact option
  const trimmedSearch = searchTerm.trim();
  const showCustomCreateOption = useMemo(() => {
    if (!allowCustom || !trimmedSearch) return false;
    return !options.some(
      (opt) =>
        opt.label.toLowerCase() === trimmedSearch.toLowerCase() ||
        String(opt.value).toLowerCase() === trimmedSearch.toLowerCase()
    );
  }, [allowCustom, trimmedSearch, options]);

  const computePosition = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const targetWidth = Math.min(
      Math.max(rect.width, minDropdownWidth || rect.width),
      viewportW - 24
    );

    let left = rect.left;
    if (left + targetWidth > viewportW - 12) {
      left = Math.max(12, rect.right - targetWidth);
    }
    if (left < 12) left = 12;

    const spaceBelow = viewportH - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const desiredMaxHeight = 320;
    const openUpward = spaceBelow < 210 && spaceAbove > spaceBelow;
    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(150, Math.min(desiredMaxHeight, availableSpace - 8));

    setCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left,
      width: targetWidth,
      maxHeight,
      openUpward,
    });
  }, [minDropdownWidth]);

  useEffect(() => {
    if (!isOpen) return;
    computePosition();

    const handleReposition = () => computePosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, computePosition]);

  // Outside click and escape close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setSearchTerm('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (!isOpen || !effectiveSearchable) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [isOpen, effectiveSearchable]);

  // Ensure highlighted item stays scrolled into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const targetEl = listRef.current.querySelector<HTMLElement>(
      `[data-option-index="${highlightedIndex}"]`
    );
    targetEl?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const activeIdx = options.findIndex((o) => o.value === value && !o.disabled);
    if (activeIdx >= 0) {
      setHighlightedIndex(activeIdx);
    } else if (options.length > 0) {
      setHighlightedIndex(options.findIndex((o) => !o.disabled));
    } else {
      setHighlightedIndex(-1);
    }
    setIsOpen(true);
  }, [disabled, options, value]);

  const closeMenu = useCallback((returnFocus = false) => {
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    if (returnFocus) {
      setTimeout(() => triggerRef.current?.focus(), 0);
    }
  }, []);

  const handleSelectOption = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    closeMenu(true);
  };

  const handleSelectCustom = () => {
    if (!allowCustom || !trimmedSearch) return;
    onChange(trimmedSearch as T);
    closeMenu(true);
  };

  const totalNavigable = filteredOptions.length + (showCustomCreateOption ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeMenu(true);
      return;
    }

    if (e.key === 'Tab') {
      closeMenu(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalNavigable === 0) return;
      const next = highlightedIndex + 1;
      for (let i = 0; i < totalNavigable; i++) {
        const candidate = (next + i) % totalNavigable;
        if (candidate < filteredOptions.length) {
          if (!filteredOptions[candidate].disabled) {
            setHighlightedIndex(candidate);
            break;
          }
        } else {
          setHighlightedIndex(candidate);
          break;
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalNavigable === 0) return;
      let prev = highlightedIndex - 1;
      if (prev < 0) prev = totalNavigable - 1;
      for (let i = 0; i < totalNavigable; i++) {
        const candidate = (prev - i + totalNavigable) % totalNavigable;
        if (candidate < filteredOptions.length) {
          if (!filteredOptions[candidate].disabled) {
            setHighlightedIndex(candidate);
            break;
          }
        } else {
          setHighlightedIndex(candidate);
          break;
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[highlightedIndex]);
      } else if (showCustomCreateOption) {
        handleSelectCustom();
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (onClear) {
      onClear();
    } else {
      onChange('' as T);
    }
  };

  const displayLabel = selectedOption
    ? selectedOption.label
    : hasValue
      ? String(value)
      : placeholder;

  const portalContent =
    isOpen && isMounted && coords
      ? createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel || label || placeholder}
            onKeyDown={handleKeyDown}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              ...(coords.openUpward
                ? { bottom: `${window.innerHeight - coords.top}px` }
                : { top: `${coords.top}px` }),
              maxHeight: `${coords.maxHeight}px`,
            }}
            className={`z-[70] bg-white dark:bg-slate-900 border border-[#CBD5E1] dark:border-slate-700 rounded-xl shadow-xl p-1.5 flex flex-col animate-in ${dropdownClassName}`}
          >
            {effectiveSearchable && (
              <div className="shrink-0 p-1 pb-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
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
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg text-[#0F172A] dark:text-slate-100 placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#4F46E5] transition-colors"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      aria-label="Hapus pencarian"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-0.5 pr-0.5 custom-scrollbar"
            >
              {filteredOptions.length === 0 && !showCustomCreateOption ? (
                <div className="px-3 py-4 text-center text-xs text-[#94A3B8]">
                  {emptyText}
                </div>
              ) : (
                <>
                  {filteredOptions.map((opt, idx) => {
                    const isSelected = opt.value === value;
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={opt.disabled}
                        data-option-index={idx}
                        onMouseEnter={() => !opt.disabled && setHighlightedIndex(idx)}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start justify-between gap-2 transition-colors ${
                          opt.disabled
                            ? 'opacity-45 cursor-not-allowed text-slate-400'
                            : isSelected
                              ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B]/80 text-[#4F46E5] dark:text-[#818CF8] font-semibold cursor-pointer'
                              : isHighlighted
                                ? 'bg-[#F1F5F9] dark:bg-slate-800 text-[#0F172A] dark:text-slate-100 cursor-pointer'
                                : 'text-[#334155] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/70 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          {opt.icon && (
                            <span className="shrink-0 mt-0.5 text-[#64748B] dark:text-slate-400">
                              {opt.icon}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="truncate font-medium">{opt.label}</span>
                              {opt.badge && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                    isSelected
                                      ? 'bg-[#4F46E5]/15 text-[#4F46E5] dark:text-[#A5B4FC]'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            {(opt.description || opt.category) && (
                              <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate mt-0.5">
                                {[opt.category, opt.description].filter(Boolean).join(' • ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckIcon className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}

                  {showCustomCreateOption && (
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      data-option-index={filteredOptions.length}
                      onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                      onClick={handleSelectCustom}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2 ${
                        highlightedIndex === filteredOptions.length
                          ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B]/70 text-[#4F46E5] dark:text-[#A5B4FC]'
                          : 'text-[#4F46E5] dark:text-[#818CF8] hover:bg-[#F5F3FF] dark:hover:bg-slate-800'
                      }`}
                    >
                      <PlusIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {customOptionPrefix}{' '}
                        <strong className="font-bold">&ldquo;{trimmedSearch}&rdquo;</strong>
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={controlId}
          className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={controlId}
          type="button"
          disabled={disabled}
          onClick={() => (isOpen ? closeMenu(false) : openMenu())}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel || label || placeholder}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          className={`w-full flex items-center justify-between gap-2 border transition-all duration-150 focus:outline-none text-left ${
            sizeClasses[size]
          } ${
            disabled
              ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-75'
              : error
                ? 'bg-white dark:bg-slate-900 border-rose-400 text-[#0F172A] dark:text-slate-100 focus:ring-2 focus:ring-rose-500/20 cursor-pointer'
                : isOpen
                  ? 'bg-white dark:bg-slate-900 border-[#4F46E5] ring-2 ring-[#4F46E5]/15 text-[#0F172A] dark:text-slate-100 shadow-sm cursor-pointer'
                  : 'bg-[#FAFAFF] dark:bg-slate-900 border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800/80 hover:border-[#94A3B8] shadow-xs cursor-pointer'
          } ${triggerClassName}`}
        >
          <span className="flex items-center gap-2 min-w-0 flex-1">
            {selectedOption?.icon && (
              <span className="shrink-0 text-[#64748B] dark:text-slate-400">
                {selectedOption.icon}
              </span>
            )}
            <span
              className={`truncate font-medium ${
                hasValue ? 'text-[#0F172A] dark:text-slate-100' : 'text-[#94A3B8]'
              }`}
            >
              {displayLabel}
            </span>
            {selectedOption?.badge && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#4F46E5] dark:text-[#A5B4FC] text-[10px] font-bold shrink-0">
                {selectedOption.badge}
              </span>
            )}
          </span>

          <span className="flex items-center gap-1 shrink-0">
            {clearable && hasValue && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClear}
                title="Hapus pilihan"
                aria-label="Hapus pilihan"
                className="p-0.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <XIcon className="w-3 h-3" />
              </span>
            )}
            <ChevronDownIcon
              className={`w-3.5 h-3.5 text-[#64748B] dark:text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#4F46E5]' : ''
              }`}
            />
          </span>
        </button>
      </div>

      {error && <p className="text-[11px] font-medium text-rose-600 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">{helperText}</p>
      )}

      {portalContent}
    </div>
  );
}

export function SearchableSelect<T extends string | number = string>(
  props: SelectProps<T>
) {
  return <Select<T> searchable={true} {...props} />;
}
