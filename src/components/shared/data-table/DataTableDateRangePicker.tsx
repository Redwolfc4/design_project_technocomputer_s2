'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FilterConfig, DateRangeValue } from './types';
import { CalendarIcon } from '@/components/ui/icons';
import { DualCalendarView } from './date-picker/DualCalendarView';
import {
  formatToDisplayDate,
  compareDates,
} from './date-picker/dateUtils';

export interface DataTableDateRangePickerProps {
  filter: FilterConfig;
}

export const DataTableDateRangePicker: React.FC<DataTableDateRangePickerProps> = ({ filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse currentValue
  const currentValue: DateRangeValue = useMemo(() => {
    if (typeof filter.selectedValue === 'object' && filter.selectedValue !== null) {
      return filter.selectedValue as DateRangeValue;
    }
    return { preset: (filter.selectedValue as string) || 'all' };
  }, [filter.selectedValue]);

  // Draft state while popover is open
  const [draftPreset, setDraftPreset] = useState<string>(currentValue.preset || 'all');
  const [draftStart, setDraftStart] = useState<string | undefined>(currentValue.from);
  const [draftEnd, setDraftEnd] = useState<string | undefined>(currentValue.to);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Left calendar view year & month (Default to November 2026 matching user preference)
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(10); // 10 = November

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
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Sync draft state on open
  useEffect(() => {
    if (isOpen) {
      setDraftPreset(currentValue.preset || 'all');
      setDraftStart(currentValue.from);
      setDraftEnd(currentValue.to);

      if (currentValue.from) {
        const d = new Date(currentValue.from);
        if (!isNaN(d.getTime())) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }
      } else {
        setViewYear(2026);
        setViewMonth(10);
      }
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
      // Auto apply immediately without closing popover
      filter.onChange({
        preset: 'custom',
        from: finalStart,
        to: finalEnd,
      });
    }
  };

  // Preset shortcuts: applies without auto-closing popover
  const handleSelectPreset = (presetKey: string) => {
    setDraftPreset(presetKey);

    let start: string | undefined;
    let end: string | undefined;

    if (presetKey === 'today') {
      start = '2026-11-11';
      end = '2026-11-11';
      setViewYear(2026);
      setViewMonth(10);
    } else if (presetKey === 'this_week') {
      start = '2026-11-09';
      end = '2026-11-15';
      setViewYear(2026);
      setViewMonth(10);
    } else if (presetKey === 'last_week') {
      start = '2026-11-02';
      end = '2026-11-08';
      setViewYear(2026);
      setViewMonth(10);
    } else if (presetKey === 'last_7_days') {
      start = '2026-11-05';
      end = '2026-11-11';
      setViewYear(2026);
      setViewMonth(10);
    } else if (presetKey === 'current_month') {
      start = '2026-11-01';
      end = '2026-11-30';
      setViewYear(2026);
      setViewMonth(10);
    } else if (presetKey === 'reset') {
      start = undefined;
      end = undefined;
      setViewYear(2026);
      setViewMonth(10);
    }

    setDraftStart(start);
    setDraftEnd(end);

    // Apply immediately without auto-closing
    filter.onChange({
      preset: presetKey === 'reset' ? 'all' : presetKey,
      from: start,
      to: end,
    });
  };

  // Trigger text: format dd/mm/yyyy - dd/mm/yyyy or placeholder
  const isSelected = Boolean(currentValue.from && currentValue.to);
  const triggerDisplay = isSelected
    ? `${formatToDisplayDate(currentValue.from)} - ${formatToDisplayDate(currentValue.to)}`
    : 'dd/mm/yyyy - dd/mm/yyyy';

  const quickNavItems = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'last_7_days', label: 'Last 7 Days' },
    { key: 'current_month', label: 'Current Month' },
  ];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
        {filter.label}
      </label>

      {/* Trigger Button: Placeholder dd/mm/yyyy - dd/mm/yyyy + Calendar Icon */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFF] border rounded-lg text-xs transition-all duration-150 focus:outline-none shadow-xs group cursor-pointer ${isOpen
          ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 bg-white text-[#0F172A]'
          : 'border-[#CBD5E1] hover:bg-white hover:border-[#94A3B8]'
          }`}
        aria-label={`Filter ${filter.label}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate font-medium tracking-wide ${isSelected ? 'text-[#0F172A]' : 'text-[#94A3B8]'
            }`}
        >
          {triggerDisplay}
        </span>
        <CalendarIcon className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#4F46E5] shrink-0 ml-2 transition-colors" />
      </button>

      {/* Popover: Clean Dual Calendar (Left) + Sidebar Quick Selection List (Right), No Footer */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-[330px] sm:w-[620px] md:w-[650px] max-w-[calc(100vw-32px)] bg-white text-[#0F172A] border border-[#CBD5E1] rounded-2xl shadow-xl z-50 p-4 sm:p-5 flex flex-col animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Main Layout: Left = Dual Calendar, Right = Sidebar List */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 items-stretch">
            {/* Left Column: Dual Calendar View (No Header) */}
            <div className="flex-1 w-full min-w-0">
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
            </div>

            {/* Right Column: Sidebar Quick Selection List (Desktop Right Sidebar) */}
            <div className="w-full sm:w-[130px] md:w-[140px] shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-3 pt-3 sm:pt-0 flex flex-col justify-between">
              {/* Top/Main Items List */}
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
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${isActive
                        ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                        : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Divider & Reset / Selesai Actions */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('reset')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${draftPreset === 'reset' || (!draftStart && !draftEnd && draftPreset === 'all')
                    ? 'bg-rose-50 text-rose-600 font-semibold'
                    : 'text-[#64748B] hover:bg-rose-50/60 hover:text-rose-600'
                    }`}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full px-2.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md text-xs font-semibold text-center transition-colors cursor-pointer shadow-2xs"
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
