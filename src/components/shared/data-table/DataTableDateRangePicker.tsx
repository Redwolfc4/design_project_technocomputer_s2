'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FilterConfig, DateRangeValue } from './types';
import { CalendarIcon, XIcon } from '@/components/ui/icons';
import { DualCalendarView } from './date-picker/DualCalendarView';
import { CustomDateInputs } from './date-picker/CustomDateInputs';
import {
  formatToDisplayDate,
  compareDates,
  getPresetDateRange,
  parseLocalISODate,
} from './date-picker/dateUtils';

export interface DataTableDateRangePickerProps {
  filter: FilterConfig;
}

export const DataTableDateRangePicker: React.FC<DataTableDateRangePickerProps> = ({ filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse currentValue
  const currentValue: DateRangeValue = useMemo(() => {
    if (typeof filter.selectedValue === 'object' && filter.selectedValue !== null) {
      return filter.selectedValue as DateRangeValue;
    }
    return { preset: (filter.selectedValue as string) || 'all' };
  }, [filter.selectedValue]);

  const now = useMemo(() => new Date(), []);

  // Draft state while popover is open
  const [draftPreset, setDraftPreset] = useState<string>(currentValue.preset || 'all');
  const [draftStart, setDraftStart] = useState<string | undefined>(currentValue.from);
  const [draftEnd, setDraftEnd] = useState<string | undefined>(currentValue.to);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Left calendar view year & month (default to current month)
  const [viewYear, setViewYear] = useState<number>(() => now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => now.getMonth());

  const updateHorizontalAlignment = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = window.innerWidth >= 768 ? 650 : window.innerWidth >= 640 ? 620 : 330;
    const overflowsRight = rect.left + popoverWidth > window.innerWidth - 16;
    const fitsFromRight = rect.right - popoverWidth >= 16;
    setAlignRight(overflowsRight && fitsFromRight);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      updateHorizontalAlignment();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updateHorizontalAlignment);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateHorizontalAlignment);
    };
  }, [isOpen, updateHorizontalAlignment]);

  // Sync draft state on open
  useEffect(() => {
    if (isOpen) {
      setDraftPreset(currentValue.preset || 'all');
      setDraftStart(currentValue.from);
      setDraftEnd(currentValue.to);

      if (currentValue.from) {
        const d = parseLocalISODate(currentValue.from);
        if (d) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
          return;
        }
      }
      const today = new Date();
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
  }, [isOpen, currentValue]);

  // Month navigation (Moves both calendars together by 1 month)
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar date selection: auto applies when both start & end are selected
  const handleSelectDate = (dateISO: string) => {
    setDraftPreset('custom');

    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(dateISO);
      setDraftEnd(undefined);
      return;
    }

    if (draftStart && !draftEnd) {
      let finalStart = draftStart;
      let finalEnd = dateISO;
      if (compareDates(dateISO, draftStart) < 0) {
        finalStart = dateISO;
        finalEnd = draftStart;
      }
      setDraftStart(finalStart);
      setDraftEnd(finalEnd);
      filter.onChange({
        preset: 'custom',
        from: finalStart,
        to: finalEnd,
      });
    }
  };

  // Manual DD/MM/YYYY custom input change
  const handleCustomInputsChange = (from?: string, to?: string) => {
    let finalFrom = from;
    let finalTo = to;
    if (finalFrom && finalTo && compareDates(finalTo, finalFrom) < 0) {
      finalFrom = to;
      finalTo = from;
    }

    setDraftStart(finalFrom);
    setDraftEnd(finalTo);

    if (finalFrom) {
      const parsed = parseLocalISODate(finalFrom);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }

    if (!finalFrom && !finalTo) {
      setDraftPreset('all');
      filter.onChange({ preset: 'all', from: undefined, to: undefined });
      return;
    }

    setDraftPreset('custom');
    filter.onChange({
      preset: 'custom',
      from: finalFrom,
      to: finalTo,
    });
  };

  // Preset shortcuts: computes dynamic range based on current date
  const handleSelectPreset = (presetKey: string) => {
    setDraftPreset(presetKey);

    if (presetKey === 'reset') {
      const today = new Date();
      setDraftStart(undefined);
      setDraftEnd(undefined);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      filter.onChange({
        preset: 'all',
        from: undefined,
        to: undefined,
      });
      return;
    }

    const { from, to } = getPresetDateRange(presetKey, new Date());
    setDraftStart(from);
    setDraftEnd(to);

    if (from) {
      const d = parseLocalISODate(from);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }

    filter.onChange({
      preset: presetKey,
      from,
      to,
    });
  };

  const handleQuickReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelectPreset('reset');
  };

  // Trigger text: format dd/mm/yyyy - dd/mm/yyyy or placeholder
  const hasActiveRange = Boolean(
    currentValue.from || currentValue.to || (currentValue.preset && currentValue.preset !== 'all')
  );
  const isSelected = Boolean(currentValue.from && currentValue.to);
  const triggerDisplay = isSelected
    ? `${formatToDisplayDate(currentValue.from)} - ${formatToDisplayDate(currentValue.to)}`
    : currentValue.from
      ? `Dari ${formatToDisplayDate(currentValue.from)}`
      : currentValue.to
        ? `Sampai ${formatToDisplayDate(currentValue.to)}`
        : filter.placeholder || 'dd/mm/yyyy - dd/mm/yyyy';

  const quickNavItems = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'this_week', label: 'Minggu Ini' },
    { key: 'last_week', label: 'Minggu Lalu' },
    { key: 'last_7_days', label: '7 Hari Terakhir' },
    { key: 'current_month', label: 'Bulan Ini' },
  ];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
        {filter.label}
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFF] border rounded-lg text-xs transition-all duration-150 focus:outline-none shadow-sm group cursor-pointer ${
          isOpen
            ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 bg-white text-[#0F172A]'
            : hasActiveRange
              ? 'border-[#4F46E5]/40 bg-indigo-50/30 text-[#0F172A] hover:bg-white hover:border-[#4F46E5]'
              : 'border-[#CBD5E1] hover:bg-white hover:border-[#94A3B8]'
        }`}
        aria-label={`Filter ${filter.label}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate font-medium tracking-wide ${
            hasActiveRange ? 'text-[#0F172A]' : 'text-[#94A3B8]'
          }`}
        >
          {triggerDisplay}
        </span>
        <span className="flex items-center gap-1 shrink-0 ml-2">
          {hasActiveRange && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleQuickReset}
              title={`Reset filter ${filter.label}`}
              aria-label={`Reset filter ${filter.label}`}
              className="p-0.5 rounded hover:bg-slate-200/80 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <XIcon className="w-3 h-3" />
            </span>
          )}
          <CalendarIcon className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#4F46E5] transition-colors" />
        </span>
      </button>

      {/* Popover: Dual Calendar + Custom Inputs (Left) + Sidebar Quick Range List (Right) */}
      {isOpen && (
        <div
          className={`absolute ${
            alignRight ? 'right-0' : 'left-0'
          } mt-1.5 w-[330px] sm:w-[620px] md:w-[650px] max-w-[calc(100vw-32px)] bg-white text-[#0F172A] border border-[#CBD5E1] rounded-2xl shadow-xl z-50 p-4 sm:p-5 flex flex-col gap-3 animate-in`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            {/* Left Column: Dual Calendar + Manual DD/MM/YYYY Inputs */}
            <div className="flex-1 w-full min-w-0 space-y-3">
              <DualCalendarView
                currentLeftYear={viewYear}
                currentLeftMonth={viewMonth}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                startDate={draftStart}
                endDate={draftEnd}
                hoverDate={hoverDate}
                onSelectDate={handleSelectDate}
                onHoverDate={setHoverDate}
              />

              <CustomDateInputs
                startDate={draftStart}
                endDate={draftEnd}
                onChangeRange={handleCustomInputsChange}
              />
            </div>

            {/* Right Column: Sidebar Quick Selection List */}
            <div className="w-full sm:w-[140px] shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-3 pt-3 sm:pt-0 flex flex-col justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2.5 py-1 hidden sm:block">
                  Quick Range
                </div>
                {quickNavItems.map((item) => {
                  const isActive = draftPreset === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectPreset(item.key)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                          : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('reset')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    draftPreset === 'reset' || (!draftStart && !draftEnd && draftPreset === 'all')
                      ? 'bg-rose-50 text-rose-600 font-semibold'
                      : 'text-[#64748B] hover:bg-rose-50/60 hover:text-rose-600'
                  }`}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-2.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md text-xs font-semibold text-center transition-colors cursor-pointer shadow-sm"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
