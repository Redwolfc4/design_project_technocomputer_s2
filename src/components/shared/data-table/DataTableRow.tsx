'use client';

import React from 'react';
import { DataTableRowProps } from './types';

export function DataTableRow<T>({
  row,
  children,
  onRowDoubleClick,
  onRowContextMenu,
  className = '',
  ...props
}: DataTableRowProps<T>) {
  const handleDoubleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Shield interactive elements (buttons, links, inputs, selects)
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('[role="button"]') ||
      target.closest('[data-interactive="true"]')
    ) {
      return;
    }

    if (onRowDoubleClick) {
      onRowDoubleClick(row);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (onRowContextMenu) {
      e.preventDefault();
      onRowContextMenu(row, e);
    }
  };

  return (
    <tr
      {...props}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className={`hover:bg-[#F8FAFC] transition-colors cursor-default select-none ${className}`}
    >
      {children}
    </tr>
  );
}
