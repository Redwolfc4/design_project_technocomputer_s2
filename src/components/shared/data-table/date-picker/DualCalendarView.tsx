'use client';

import React from 'react';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  toISODateString,
  compareDates,
} from './dateUtils';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

export const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface SingleLightMonthCalendarProps {
  year: number;
  monthIndex: number;
  startDate?: string;
  endDate?: string;
  hoverDate?: string | null;
  onSelectDate: (dateISO: string) => void;
  onHoverDate: (dateISO: string | null) => void;
  minDate?: string;
  maxDate?: string;
}

const SingleLightMonthCalendar: React.FC<SingleLightMonthCalendarProps> = ({
  year,
  monthIndex,
  startDate,
  endDate,
  hoverDate,
  onSelectDate,
  onHoverDate,
  minDate,
  maxDate,
}) => {
  const totalDays = getDaysInMonth(year, monthIndex);
  const firstDayOfWeek = getFirstDayOfMonth(year, monthIndex);

  // Normalization for visual range calculation
  const effectiveEnd = endDate || hoverDate || undefined;
  let rangeStart = startDate;
  let rangeEnd = effectiveEnd;
  if (rangeStart && rangeEnd && compareDates(rangeStart, rangeEnd) > 0) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="flex-1 min-w-[190px] sm:min-w-[210px]">
      {/* Month Year Title */}
      <div className="text-center text-xs font-bold text-[#0F172A] py-0.5 select-none tracking-wide">
        {MONTH_NAMES_EN[monthIndex]} {year}
      </div>

      {/* Weekday Header S M T W T F S */}
      <div className="grid grid-cols-7 gap-1 mt-2 text-center text-[11px] font-semibold text-[#64748B] select-none">
        {DAY_LETTERS.map((letter, idx) => (
          <div key={idx} className="h-5 flex items-center justify-center">
            {letter}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 mt-1 text-center text-xs">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-6 w-6" />
        ))}

        {days.map((d) => {
          const dateISO = toISODateString(year, monthIndex, d);
          const isStart = startDate === dateISO;
          const isEnd = endDate === dateISO;
          const isHoverEnd = !endDate && hoverDate === dateISO;
          const isInRange =
            rangeStart && rangeEnd && dateISO >= rangeStart && dateISO <= rangeEnd;

          const isDisabled =
            (minDate && compareDates(dateISO, minDate) < 0) ||
            (maxDate && compareDates(dateISO, maxDate) > 0);

          let cellStyle = 'text-[#334155] hover:bg-slate-100 hover:text-[#0F172A]';
          if (isDisabled) {
            cellStyle = 'opacity-30 cursor-not-allowed text-slate-400 pointer-events-none';
          } else if (isStart || isEnd || isHoverEnd) {
            // Selected rounded button with theme Indigo #4F46E5
            cellStyle =
              'bg-[#4F46E5] text-white font-bold shadow-xs hover:bg-[#4338CA] z-10';
          } else if (isInRange) {
            // Soft theme purple/indigo range highlight
            cellStyle = 'bg-[#EEF2FF] text-[#4338CA] font-medium';
          }

          return (
            <button
              key={dateISO}
              type="button"
              disabled={Boolean(isDisabled)}
              onClick={() => !isDisabled && onSelectDate(dateISO)}
              onMouseEnter={() => !isDisabled && onHoverDate(dateISO)}
              onMouseLeave={() => !isDisabled && onHoverDate(null)}
              className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition-all select-none ${cellStyle} ${
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-label={`Pilih tanggal ${dateISO}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export interface DualCalendarViewProps {
  currentLeftYear: number;
  currentLeftMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  startDate?: string;
  endDate?: string;
  hoverDate?: string | null;
  onSelectDate: (dateISO: string) => void;
  onHoverDate: (dateISO: string | null) => void;
  minDate?: string;
  maxDate?: string;
}

export const DualCalendarView: React.FC<DualCalendarViewProps> = ({
  currentLeftYear,
  currentLeftMonth,
  onPrevMonth,
  onNextMonth,
  startDate,
  endDate,
  hoverDate,
  onSelectDate,
  onHoverDate,
  minDate,
  maxDate,
}) => {
  const rightMonth = (currentLeftMonth + 1) % 12;
  const rightYear = currentLeftMonth === 11 ? currentLeftYear + 1 : currentLeftYear;

  // Determine if next month navigation should be disabled when maxDate is reached
  const isNextDisabled = Boolean(
    maxDate &&
      compareDates(
        toISODateString(rightYear, rightMonth, 1),
        maxDate
      ) > 0
  );

  return (
    <div className="relative">
      {/* Month Navigation Arrows */}
      <div className="absolute -top-0.5 left-0 z-10">
        <button
          type="button"
          onClick={onPrevMonth}
          className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute -top-0.5 right-0 z-10">
        <button
          type="button"
          onClick={onNextMonth}
          disabled={isNextDisabled}
          className={`p-1 rounded-md transition-colors ${
            isNextDisabled
              ? 'opacity-30 cursor-not-allowed text-slate-300'
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer'
          }`}
          aria-label="Bulan berikutnya"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Side-by-side Dual Calendar with subtle clean divider */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <SingleLightMonthCalendar
          year={currentLeftYear}
          monthIndex={currentLeftMonth}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          minDate={minDate}
          maxDate={maxDate}
        />

        {/* Subtle Vertical Divider matching light enterprise theme */}
        <div className="hidden sm:block w-[1px] bg-slate-200 self-stretch my-1" />

        <SingleLightMonthCalendar
          year={rightYear}
          monthIndex={rightMonth}
          startDate={startDate}
          endDate={endDate}
          hoverDate={hoverDate}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    </div>
  );
};
