'use client';

import React from 'react';
import { useAppScope } from '@/context/ScopeContext';
import { ChevronDownIcon } from '@/components/ui/icons';

interface ScopeSelectorBarProps {
  className?: string;
  compact?: boolean;
}

export const ScopeSelectorBar: React.FC<ScopeSelectorBarProps> = ({
  className = '',
  compact = false,
}) => {
  const {
    roleTier,
    canChangeCompany,
    canChangeDepartment,
    allowedCompanies,
    allowedDepartments,
    activeCompanyId,
    activeDepartmentId,
    activeCompany,
    activeDepartment,
    setActiveCompanyId,
    setActiveDepartmentId,
  } = useAppScope();

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 text-xs ${className}`}
      role="region"
      aria-label="Scope Perusahaan dan Departemen"
    >
      {/* 1. Company Scope Selector or Locked Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Perusahaan:
        </span>
        {canChangeCompany ? (
          <div className="relative inline-block">
            <select
              aria-label="Pilih Scope Perusahaan"
              value={activeCompanyId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-2xs hover:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="all">Semua Perusahaan (Global)</option>
              {allowedCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {compact ? c.code : c.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
            <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate max-w-[200px]" title={activeCompany?.name}>
              {compact ? activeCompany?.code : activeCompany?.name || 'Perusahaan Ditugaskan'}
            </span>
          </span>
        )}
      </div>

      <span className="text-slate-300 hidden sm:inline">•</span>

      {/* 2. Department Scope Selector or Locked Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Departemen:
        </span>
        {canChangeDepartment ? (
          <div className="relative inline-block">
            <select
              aria-label="Pilih Scope Departemen"
              value={activeDepartmentId}
              onChange={(e) => setActiveDepartmentId(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-2xs hover:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] cursor-pointer"
            >
              <option value="all">Semua Departemen</option>
              {allowedDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
            <svg className="w-3 h-3 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate max-w-[180px]" title={activeDepartment?.name}>
              {activeDepartment?.name || 'Departemen Ditugaskan'}
            </span>
          </span>
        )}
      </div>

      {/* Role Tier Badge */}
      <span
        className={`ml-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
          roleTier === 'developer'
            ? 'bg-purple-100 text-purple-700 border border-purple-200'
            : roleTier === 'admin'
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}
      >
        {roleTier}
      </span>
    </div>
  );
};

