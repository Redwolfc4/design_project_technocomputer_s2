'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RowAction, DataTableMenuPosition, DataTableActionMenuProps } from './types';

export function DataTableActionMenu<T>({
  isOpen,
  position,
  row,
  title = 'Aksi Baris',
  subtitle,
  actions,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: DataTableActionMenuProps<T>) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [clampedPos, setClampedPos] = useState<DataTableMenuPosition>({
    x: position.x,
    y: position.y,
  });

  // Dynamic viewport clamping calculation
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      const el = menuRef.current;
      const width = el?.offsetWidth || 256;
      const height = el?.offsetHeight || 220;

      const maxX = window.innerWidth - width - 12;
      const maxY = window.innerHeight - height - 12;

      setClampedPos({
        x: Math.max(12, Math.min(position.x, maxX)),
        y: Math.max(12, Math.min(position.y, maxY)),
      });
    }
  }, [isOpen, position.x, position.y]);

  // Click outside and Keyboard Navigation (Escape & Arrow Up/Down)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const focusable = menuRef.current?.querySelectorAll<HTMLButtonElement>(
          'button:not([disabled])'
        );
        if (!focusable || focusable.length === 0) return;

        const currentActive = document.activeElement as HTMLButtonElement;
        const currentIndex = Array.from(focusable).indexOf(currentActive);
        let nextIndex = 0;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
        }

        focusable[nextIndex]?.focus();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedSubtitle =
    typeof subtitle === 'function' ? subtitle(row) : subtitle;

  const visibleActions = actions.filter((action) =>
    action.hidden ? !action.hidden(row) : true
  );

  return (
    <div
      ref={menuRef}
      style={{
        top: `${clampedPos.y}px`,
        left: `${clampedPos.x}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 w-64 bg-white rounded-xl border border-[#CBD5E1] shadow-2xl p-1.5 text-xs text-[#0F172A] animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* Header Info */}
      {(title || resolvedSubtitle) && (
        <div className="px-2.5 py-1.5 border-b border-[#F1F5F9] mb-1">
          {title && (
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider truncate">
              {title}
            </p>
          )}
          {resolvedSubtitle && (
            <p className="font-bold text-xs text-[#0F172A] truncate">
              {resolvedSubtitle}
            </p>
          )}
        </div>
      )}

      {/* Action Items */}
      <div className="space-y-0.5">
        {visibleActions.map((action) => {
          const isDisabled = action.disabled ? action.disabled(row) : false;

          return (
            <React.Fragment key={action.id}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onClose();
                  action.onSelect(row);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors focus:outline-none ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-[#94A3B8]'
                    : action.destructive
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 font-semibold'
                    : 'text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] focus:bg-[#EEF2FF] focus:text-[#4F46E5]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {action.icon && (
                    <span
                      className={`shrink-0 ${
                        action.destructive
                          ? 'text-rose-500'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {action.icon}
                    </span>
                  )}
                  <span className="truncate">{action.label}</span>
                </div>

                {action.shortcut && (
                  <span className="text-[10px] text-[#94A3B8] font-mono ml-2">
                    {action.shortcut}
                  </span>
                )}
              </button>
              {action.dividerAfter && (
                <div className="my-1 border-t border-[#F1F5F9]" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
