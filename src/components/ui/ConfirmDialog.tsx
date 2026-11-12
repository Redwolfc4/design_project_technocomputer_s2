'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangleIcon, TrashIcon } from '@/components/ui/icons';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      bg: 'bg-rose-100 text-rose-600',
      icon: <TrashIcon className="w-5 h-5" />,
      btnVariant: 'danger' as const,
    },
    warning: {
      bg: 'bg-amber-100 text-amber-600',
      icon: <AlertTriangleIcon className="w-5 h-5" />,
      btnVariant: 'primary' as const,
    },
    primary: {
      bg: 'bg-indigo-100 text-indigo-600',
      icon: <AlertTriangleIcon className="w-5 h-5" />,
      btnVariant: 'primary' as const,
    },
  }[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={!isLoading}
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${iconConfig.bg}`}>
          {iconConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[#0F172A]">{title}</h3>
          <div className="mt-2 text-xs text-[#64748B] leading-relaxed">
            {description}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={iconConfig.btnVariant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

