'use client';

import React, { useMemo } from 'react';
import { useAppScope } from '@/context/ScopeContext';
import { SearchableSelect, SelectOption } from '@/components/ui/Select';

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

  const companyOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Semua Perusahaan (Global)', badge: 'Global' },
      ...allowedCompanies.map((c) => ({
        value: c.id,
        label: compact ? c.code : c.name,
        badge: compact ? undefined : c.code,
      })),
    ],
    [allowedCompanies, compact]
  );

  const departmentOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'Semua Departemen' },
      ...allowedDepartments.map((d) => ({
        value: d.id,
        label: d.name,
      })),
    ],
    [allowedDepartments]
  );

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
          <div className="min-w-[180px] sm:min-w-[215px]">
            <SearchableSelect
              size="xs"
              value={activeCompanyId}
              options={companyOptions}
              onChange={(val) => setActiveCompanyId(val)}
              searchPlaceholder="Cari perusahaan..."
              aria-label="Pilih Scope Perusahaan"
              minDropdownWidth={260}
              triggerClassName="font-bold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
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
          <div className="min-w-[165px] sm:min-w-[190px]">
            <SearchableSelect
              size="xs"
              value={activeDepartmentId}
              options={departmentOptions}
              onChange={(val) => setActiveDepartmentId(val)}
              searchPlaceholder="Cari departemen..."
              aria-label="Pilih Scope Departemen"
              minDropdownWidth={230}
              triggerClassName="font-bold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
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
