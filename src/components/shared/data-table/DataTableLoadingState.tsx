'use client';

import React from 'react';

export interface DataTableLoadingStateProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const DataTableLoadingState: React.FC<DataTableLoadingStateProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`p-6 space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-slate-200 rounded ${
                cIdx === 0 ? 'w-1/3' : cIdx === columns - 1 ? 'w-1/6' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

