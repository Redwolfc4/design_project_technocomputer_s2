'use client';

import React from 'react';
import { RBACMember } from '@/types';
import { RowAction } from './data-table/types';
import { DataTableActionMenu } from './data-table/DataTableActionMenu';
import { EyeIcon, PencilIcon, TrashIcon, ToggleRightIcon } from '@/components/ui/icons';

export interface RBACActionMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  user: RBACMember;
  onClose: () => void;
  onView: (user: RBACMember) => void;
  onEdit: (user: RBACMember) => void;
  onToggleStatus: (user: RBACMember) => void;
  onDelete: (user: RBACMember) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Backward compatible RBACActionMenu wrapper delegating to DataTableActionMenu.
 */
export function RBACActionMenu({
  isOpen,
  position,
  user,
  onClose,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}: RBACActionMenuProps) {
  const actions: RowAction<RBACMember>[] = [
    {
      id: 'view',
      label: 'Lihat Detail',
      icon: <EyeIcon className="w-4 h-4 text-[#64748B]" />,
      onSelect: (u) => onView(u),
    },
    {
      id: 'edit',
      label: 'Edit Anggota',
      icon: <PencilIcon className="w-4 h-4 text-[#64748B]" />,
      onSelect: (u) => onEdit(u),
    },
    {
      id: 'toggle_status',
      label: user.status === 'Aktif' ? 'Nonaktifkan Anggota' : 'Aktifkan Anggota',
      icon: <ToggleRightIcon className="w-4 h-4 text-[#64748B]" />,
      onSelect: (u) => onToggleStatus(u),
      dividerAfter: true,
    },
    {
      id: 'delete',
      label: 'Hapus Anggota',
      icon: <TrashIcon className="w-4 h-4 text-rose-500" />,
      destructive: true,
      onSelect: (u) => onDelete(u),
    },
  ];

  return (
    <DataTableActionMenu
      isOpen={isOpen}
      position={position}
      row={user}
      title="Aksi Anggota"
      subtitle={(u) => u.name}
      actions={actions}
      onClose={onClose}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}
