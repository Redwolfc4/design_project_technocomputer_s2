'use client';

import React, { useState, useEffect } from 'react';
import { formatToDisplayDate, parseDisplayDateToISO, getDaysDifference } from './dateUtils';

interface CustomDateInputsProps {
  startDate?: string;
  endDate?: string;
  onChangeRange: (from?: string, to?: string) => void;
}

export const CustomDateInputs: React.FC<CustomDateInputsProps> = ({
  startDate,
  endDate,
  onChangeRange,
}) => {
  const [fromText, setFromText] = useState(formatToDisplayDate(startDate));
  const [toText, setToText] = useState(formatToDisplayDate(endDate));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setFromText(formatToDisplayDate(startDate));
  }, [startDate]);

  useEffect(() => {
    setToText(formatToDisplayDate(endDate));
  }, [endDate]);

  const handleBlurFrom = () => {
    if (!fromText.trim()) {
      onChangeRange(undefined, endDate);
      setErrorMsg(null);
      return;
    }
    const iso = parseDisplayDateToISO(fromText);
    if (!iso) {
      setErrorMsg('Format tanggal awal tidak valid (DD/MM/YYYY)');
    } else {
      setErrorMsg(null);
      onChangeRange(iso, endDate);
    }
  };

  const handleBlurTo = () => {
    if (!toText.trim()) {
      onChangeRange(startDate, undefined);
      setErrorMsg(null);
      return;
    }
    const iso = parseDisplayDateToISO(toText);
    if (!iso) {
      setErrorMsg('Format tanggal akhir tidak valid (DD/MM/YYYY)');
    } else {
      setErrorMsg(null);
      onChangeRange(startDate, iso);
    }
  };

  const diffDays = startDate && endDate ? getDaysDifference(startDate, endDate) : null;

  return (
    <div className="pt-2 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Kustom Rentang Tanggal:
        </span>
        {diffDays !== null && (
          <span className="text-[11px] font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {diffDays} Hari Terpilih
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#475569]">Dari Tanggal</label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={fromText}
            onChange={(e) => setFromText(e.target.value)}
            onBlur={handleBlurFrom}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#475569]">Sampai Tanggal</label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={toText}
            onChange={(e) => setToText(e.target.value)}
            onBlur={handleBlurTo}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {errorMsg && <p className="text-[10px] text-rose-600 font-medium">{errorMsg}</p>}
    </div>
  );
};

