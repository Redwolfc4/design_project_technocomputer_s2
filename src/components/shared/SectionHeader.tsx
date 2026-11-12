import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 ${className}`}>
      <div className="space-y-0.5">
        <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-[#64748B]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0 pt-1 sm:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}

