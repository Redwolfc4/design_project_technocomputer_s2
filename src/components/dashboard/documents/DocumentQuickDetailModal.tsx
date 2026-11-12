'use client';

import React from 'react';
import Link from 'next/link';
import { DocumentRecord } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeInfo, getDocumentTypeLabel } from '@/lib/utils/formatters';
import { FileTextIcon, ArrowRightIcon, CopyIcon } from '@/components/ui/icons';
import { Modal } from '@/components/ui/Modal';
import { useAppRoutes } from '@/context/RouteContext';

export interface DocumentQuickDetailModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
  onCopyText?: (text: string, label: string) => void;
}

export function DocumentQuickDetailModal({
  document,
  onClose,
  onCopyText,
}: DocumentQuickDetailModalProps) {
  const { getRoute } = useAppRoutes();

  const handleCopy = (text: string, label: string) => {
    if (onCopyText) {
      onCopyText(text, label);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const badge = document ? getStatusBadgeInfo(document.status) : null;

  return (
    <Modal
      isOpen={Boolean(document)}
      onClose={onClose}
      maxWidth="lg"
      title={
        document && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-200 shrink-0">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-[#0F172A] truncate">{document.fileNumber}</h3>
              <p className="text-xs text-[#64748B] truncate max-w-xs">{document.fileName}</p>
            </div>
          </div>
        )
      }
      footer={
        document && (
          <div className="w-full flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleCopy(document.fileNumber, 'Nomor Berkas')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition-colors cursor-pointer"
            >
              <CopyIcon className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Salin Nomor Berkas</span>
            </button>

            <Link
              href={getRoute(`/verification?docId=${document.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Buka Workspace Verifikasi</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        )
      }
    >
      {document && badge && (
        <div className="space-y-4 text-xs text-[#334155]">
          <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Jenis Dokumen</p>
              <p className="font-semibold text-[#0F172A] mt-0.5">{getDocumentTypeLabel(document.documentType)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status Validasi</p>
              <div className="mt-0.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  <span>{badge.label}</span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Nilai Tagihan</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-sm text-[#0F172A]">{formatCurrency(document.totalAmount, document.currency)}</span>
                {document.currency && document.currency !== 'IDR' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {document.currency}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Skor Akurasi AI</p>
              <p
                className={`font-bold text-sm mt-0.5 ${
                  document.confidence >= 90
                    ? 'text-[#059669]'
                    : document.confidence >= 75
                      ? 'text-[#F59E0B]'
                      : 'text-[#E11D48]'
                }`}
              >
                {document.confidence}% Confidence
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Vendor / Lawan Transaksi</p>
              <p className="font-bold text-xs text-[#0F172A]">{document.vendorName}</p>
              {document.vendorTaxId && (
                <p className="text-[11px] text-[#64748B] font-mono">NPWP: {document.vendorTaxId}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Tanggal Dokumen</p>
              <p className="text-xs text-[#475569]">{formatDate(document.uploadedAt)}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Judul Ringkasan</p>
              <p className="text-xs text-[#334155] bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0]">{document.title}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
