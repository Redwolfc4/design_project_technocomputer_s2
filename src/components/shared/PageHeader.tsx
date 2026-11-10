import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'success' | 'warning' | 'info' | 'purple' | 'indigo' | 'neutral';
  };
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}: PageHeaderProps) {
  const badgeColors = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200',
    indigo: 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 w-full min-w-0 ${className}`}>
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            {title}
          </h1>
          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeColors[badge.variant || 'purple']
                }`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

