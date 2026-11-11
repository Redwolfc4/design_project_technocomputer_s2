'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FilterConfig, DateRangeValue } from './types';
import { CalendarIcon, ChevronDownIcon, XIcon, CheckCircleIcon } from '@/components/ui/icons';

export interface DataTableDateRangePickerProps {
  filter: FilterConfig;
}

export const DataTableDateRangePicker: React.FC<DataTableDateRangePickerProps> = ({ filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue: DateRangeValue =
    typeof filter.selectedValue === 'object' && filter.selectedValue !== null
      ? (filter.selectedValue as DateRangeValue)
      : { preset: (filter.selectedValue as string) || 'all' };

  const [tempFrom, setTempFrom] = useState(currentValue.from || '');
  const [tempTo, setTempTo] = useState(currentValue.to || '');
  const [tempPreset, setTempPreset] = useState(currentValue.preset || 'all');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync internal state with external prop changes
  useEffect(() => {
    if (typeof filter.selectedValue === 'object' && filter.selectedValue !== null) {
      const val = filter.selectedValue as DateRangeValue;
      setTempFrom(val.from || '');
      setTempTo(val.to || '');
      setTempPreset(val.preset || 'custom');
    } else {
      setTempPreset((filter.selectedValue as string) || 'all');
      setTempFrom('');
      setTempTo('');
    }
  }, [filter.selectedValue]);

  // Format label shown on trigger button
  const getButtonLabel = () => {
    if (tempPreset === 'today') return 'Hari Ini (48 Jam)';
    if (tempPreset === '7days') return '7 Hari Terakhir';
    if (tempPreset === 'month') return 'Bulan Ini (Maret 2026)';
    if (tempPreset === 'custom' && (tempFrom || tempTo)) {
      if (tempFrom && tempTo) return `${tempFrom} s/d ${tempTo}`;
      if (tempFrom) return `Dari ${tempFrom}`;
      return `Sampai ${tempTo}`;
    }
    return filter.placeholder || 'Semua Waktu';
  };

  const isCustomActive = tempPreset === 'custom';

  const handleSelectPreset = (presetKey: string) => {
    setTempPreset(presetKey);
    if (presetKey === 'all') {
      filter.onChange({ preset: 'all', from: '', to: '' });
      setIsOpen(false);
    } else if (presetKey === 'today') {
      filter.onChange({ preset: 'today', from: '2026-03-05', to: '2026-03-06' });
      setIsOpen(false);
    } else if (presetKey === '7days') {
      filter.onChange({ preset: '7days', from: '2026-02-27', to: '2026-03-06' });
      setIsOpen(false);
    } else if (presetKey === 'month') {
      filter.onChange({ preset: 'month', from: '2026-03-01', to: '2026-03-31' });
      setIsOpen(false);
    } else if (presetKey === 'custom') {
      // Keep open for user to select dates
    }
  };

  const handleApplyCustom = () => {
    filter.onChange({
      preset: 'custom',
      from: tempFrom,
      to: tempTo,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempPreset('all');
    setTempFrom('');
    setTempTo('');
    filter.onChange({ preset: 'all', from: '', to: '' });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
        {filter.label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-[#FAFAFF] border rounded-lg text-xs transition-all duration-150 focus:outline-none shadow-xs group ${
          isOpen
            ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 bg-white text-[#0F172A]'
            : 'border-[#CBD5E1] text-[#0F172A] hover:bg-white hover:border-[#94A3B8]'
        }`}
        aria-label={`Filter ${filter.label}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
          <span className="truncate font-medium">{getButtonLabel()}</span>
        </div>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-[#64748B] shrink-0 ml-1.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#4F46E5]' : 'group-hover:text-[#334155]'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-[320px] sm:w-[420px] max-w-[calc(100vw-32px)] bg-white border border-[#CBD5E1] rounded-xl shadow-xl z-40 p-3 sm:p-4 flex flex-col gap-3 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
              <CalendarIcon className="w-4 h-4 text-[#4F46E5]" />
              <span>Pilih Rentang Tanggal</span>
            </div>
            {tempPreset !== 'all' && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Presets Grid */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Preset Cepat:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { key: 'all', label: 'Semua Waktu' },
                { key: 'today', label: 'Hari Ini (48 Jam)' },
                { key: '7days', label: '7 Hari Terakhir' },
                { key: 'month', label: 'Bulan Ini' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPreset(p.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                    tempPreset === p.key
                      ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-[#334155] border border-transparent'
                  }`}
                >
                  <span className="truncate">{p.label}</span>
                  {tempPreset === p.key && <CheckCircleIcon className="w-3.5 h-3.5 text-[#4F46E5]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Kustom Rentang Tanggal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Dari Tanggal</label>
                <input
                  type="date"
                  value={tempFrom}
                  onChange={(e) => {
                    setTempFrom(e.target.value);
                    setTempPreset('custom');
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Sampai Tanggal</label>
                <input
                  type="date"
                  value={tempTo}
                  onChange={(e) => {
                    setTempTo(e.target.value);
                    setTempPreset('custom');
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplyCustom}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs transition-colors"
            >
              Terapkan Rentang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

