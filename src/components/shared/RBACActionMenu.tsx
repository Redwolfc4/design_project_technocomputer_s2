'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RBACMember } from '@/types';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ToggleRightIcon,
} from '@/components/ui/icons';

interface RBACActionMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  user: RBACMember;
  onClose: () => void;
  onView: (user: RBACMember) => void;
  onEdit: (user: RBACMember) => void;
  onToggleStatus: (user: RBACMember) => void;
  onDelete: (user: RBACMember) => void;
}

export function RBACActionMenu({
  isOpen,
  position,
  user,
  onClose,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: RBACActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [clampedPos, setClampedPos] = useState({ x: position.x, y: position.y });

  // Clamp menu coordinates inside viewport dynamically
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      const el = menuRef.current;
      const width = el?.offsetWidth || 210;
      const height = el?.offsetHeight || 215;

      const maxX = window.innerWidth - width - 12;
      const maxY = window.innerHeight - height - 12;

      setClampedPos({
        x: Math.max(12, Math.min(position.x, maxX)),
        y: Math.max(12, Math.min(position.y, maxY)),
      });
    }
  }, [isOpen, position.x, position.y]);

  // Click outside & Escape key listeners
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
        const focusable = menuRef.current?.querySelectorAll<HTMLButtonElement>('button');
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

    // Use capture to ensure outside clicks are caught before other elements trigger
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${clampedPos.y}px`,
        left: `${clampedPos.x}px`,
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 w-52 bg-white rounded-xl border border-[#CBD5E1] shadow-2xl p-1.5 text-xs text-[#0F172A] animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* Header Info */}
      <div className="px-2.5 py-1.5 border-b border-[#F1F5F9] mb-1">
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider truncate">
          Aksi Anggota
        </p>
        <p className="font-bold text-xs text-[#0F172A] truncate">
          {user.name}
        </p>
      </div>

      <div className="space-y-0.5">
        {/* 1. Lihat Detail */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onView(user);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] focus:bg-[#EEF2FF] focus:text-[#4F46E5] focus:outline-none transition-colors"
        >
          <EyeIcon className="w-4 h-4 text-[#64748B]" />
          <span>Lihat Detail</span>
        </button>

        {/* 2. Edit Anggota */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit(user);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium text-[#334155] hover:bg-amber-50 hover:text-amber-700 focus:bg-amber-50 focus:text-amber-700 focus:outline-none transition-colors"
        >
          <PencilIcon className="w-4 h-4 text-[#64748B]" />
          <span>Edit Anggota</span>
        </button>

        {/* 3. Ubah Status */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onToggleStatus(user);
          }}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-medium text-[#334155] hover:bg-[#EEF2FF] hover:text-[#4F46E5] focus:bg-[#EEF2FF] focus:text-[#4F46E5] focus:outline-none transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ToggleRightIcon className="w-4 h-4 text-[#64748B]" />
            <span>Ubah Status</span>
          </div>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              user.status === 'Aktif'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            {user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
          </span>
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-[#F1F5F9]" />

        {/* 4. Hapus Anggota */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(user);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 focus:outline-none transition-colors"
        >
          <TrashIcon className="w-4 h-4 text-rose-500" />
          <span>Hapus Anggota</span>
        </button>
      </div>
    </div>
  );
}
