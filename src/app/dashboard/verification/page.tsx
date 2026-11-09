'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { VerificationProvider, useVerification } from '@/context/VerificationContext';
import { formatIDR, getDocumentTypeLabel, getStatusBadgeInfo } from '@/lib/utils/formatters';
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
} from '@/components/ui/icons';

function VerificationWorkspaceInner() {
  const {
    documents,
    activeDocId,
    activeDoc,
    activeDraft,
    selectedFieldId,
    notification,
    selectDocument,
    setSelectedFieldId,
    updateFieldDraft,
    updateNoteDraft,
    approveDocument,
    rejectDocument,
    clearNotification,
  } = useVerification();

  const pendingList = documents.filter((d) => d.status === 'needs_review');

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Topbar
        title="Human-in-the-Loop Verification Workspace"
        subtitle="Verifikasi berdampingan: Pratinjau berkas asli dengan anotasi visual & formulir koreksi nilai AI"
      />

      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`px-8 py-2.5 text-xs font-bold text-white flex items-center justify-between transition-all ${
            notification.type === 'success' ? 'bg-[#059669]' : 'bg-[#E11D48]'
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={clearNotification}
            className="p-1 hover:opacity-80 transition-opacity"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================== */}
        {/* Left Column 1: Verification Queue List                    */}
        {/* ======================================================== */}
        <div className="w-80 border-r border-[#E2E8F0] bg-white flex flex-col h-full">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#FAFAFF] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Antrean Verifikasi ({pendingList.length})
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Pending AP
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {documents.map((doc) => {
              const isSelected = activeDocId === doc.id;
              const badge = getStatusBadgeInfo(doc.status);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => selectDocument(doc.id)}
                  className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${
                    isSelected ? 'bg-[#EEF2FF] border-l-4 border-[#4F46E5]' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">{doc.fileNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#475569] font-medium truncate">{doc.vendorName}</div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-semibold text-[#0F172A]">{formatIDR(doc.totalAmount)}</span>
                    <span
                      className={`font-bold ${
                        doc.confidence >= 90
                          ? 'text-[#059669]'
                          : doc.confidence >= 75
                          ? 'text-[#F59E0B]'
                          : 'text-[#E11D48]'
                      }`}
                    >
                      {doc.confidence}% Match
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Center Column: Visual Document Preview & Extraction Box  */}
        {/* ======================================================== */}
        <div className="flex-1 bg-[#F1F5F9] p-6 flex flex-col overflow-y-auto items-center justify-start">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-[#CBD5E1] p-8 relative min-h-[640px] flex flex-col justify-between select-none">
            <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EEF2FF] border border-[#CBD5E1] text-[#4F46E5] text-[10px] font-bold uppercase tracking-wider">
              <span>Preview Simulasi IDP</span>
            </div>

            {activeDoc ? (
              <div className="space-y-6">
                <div className="border-b-2 border-[#0F172A] pb-4">
                  <div className="text-[10px] uppercase font-extrabold tracking-widest text-[#4F46E5]">
                    {getDocumentTypeLabel(activeDoc.documentType)}
                  </div>
                  <div className="text-xl font-black text-[#0F172A] tracking-tight">
                    {activeDoc.fileNumber}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    Entitas: <strong className="text-[#0F172A]">{activeDoc.vendorName}</strong>
                    {activeDoc.vendorTaxId && ` | NPWP: ${activeDoc.vendorTaxId}`}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Area Ekstraksi Bidang Data (Klik bidang untuk sorot):
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {(activeDraft?.fields || activeDoc.fields).map((field) => {
                      const isHighlighted = selectedFieldId === field.id;
                      return (
                        <div
                          key={field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isHighlighted
                              ? 'border-[#4F46E5] bg-[#EEF2FF]/60 shadow-md ring-2 ring-[#4F46E5]/20'
                              : 'border-[#E2E8F0] bg-[#FAFAFF] hover:border-[#CBD5E1]'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                              {field.label}
                            </span>
                            <span className="text-xs font-bold text-[#0F172A]">
                              {typeof field.value === 'number' ? formatIDR(field.value) : field.value}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {field.validationStatus === 'warning' && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                                Perlu Cek
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                field.confidence >= 0.9
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : field.confidence >= 0.75
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {Math.round(field.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeDoc.lineItems && activeDoc.lineItems.length > 0 && (
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Item Baris Transaksi ({activeDoc.lineItems.length})
                    </span>
                    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-[#F8FAFC] text-[10px] font-bold text-[#64748B] border-b border-[#E2E8F0]">
                          <tr>
                            <th className="p-2">Deskripsi</th>
                            <th className="p-2 text-center">Qty</th>
                            <th className="p-2 text-right">Harga Satuan</th>
                            <th className="p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {activeDoc.lineItems.map((item) => (
                            <tr key={item.id}>
                              <td className="p-2 font-medium text-[#0F172A]">{item.description}</td>
                              <td className="p-2 text-center text-[#64748B]">{item.quantity} {item.unit}</td>
                              <td className="p-2 text-right text-[#64748B]">{formatIDR(item.unitPrice)}</td>
                              <td className="p-2 text-right font-semibold text-[#0F172A]">{formatIDR(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#64748B]">Pilih dokumen dari antrean</div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Column: Debounced Auto-Sync Editor & Direct Actions */}
        {/* ======================================================== */}
        <div className="w-96 border-l border-[#E2E8F0] bg-white flex flex-col h-full">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#FAFAFF] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Editor Nilai Ekstraksi
            </span>
            <div className="flex items-center gap-1.5">
              {activeDraft?.isSaving ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-ping" />
                  <span>Menyimpan...</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Tersinkronisasi Otomatis</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeDoc && activeDraft && (
              <>
                <div className="p-3.5 rounded-lg border border-[#CBD5E1] bg-[#FAFAFF] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Status Verifikasi Dokumen
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A]">
                    {activeDoc.status === 'approved'
                      ? '✓ Dokumen Telah Disetujui'
                      : activeDoc.status === 'rejected'
                      ? '✕ Dokumen Ditolak'
                      : '⏳ Menunggu Validasi Reviewer'}
                  </div>
                </div>

                <div className="space-y-4">
                  {activeDraft.fields.map((field) => (
                    <div
                      key={field.id}
                      className={`space-y-1.5 p-3 rounded-lg border transition-all ${
                        selectedFieldId === field.id
                          ? 'border-[#4F46E5] bg-[#EEF2FF]/30'
                          : 'border-[#E2E8F0] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#475569]">
                          {field.label}
                        </label>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            field.confidence >= 0.9 ? 'text-[#059669]' : 'text-[#F59E0B]'
                          }`}
                        >
                          {Math.round(field.confidence * 100)}%
                        </span>
                      </div>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateFieldDraft(activeDoc.id, field.id, e.target.value)}
                        onFocus={() => setSelectedFieldId(field.id)}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      />
                      {field.validationMessage && (
                        <p className="text-[10px] text-[#F59E0B] font-medium flex items-center gap-1">
                          <AlertTriangleIcon className="w-3 h-3 shrink-0" />
                          <span>{field.validationMessage}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-[#475569]">Catatan Verifikator</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan catatan rekonsiliasi atau alasan revisi..."
                    value={activeDraft.reviewerNote}
                    onChange={(e) => updateNoteDraft(activeDoc.id, e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons: Bersih Langsung Tolak & Setujui */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFAFF]">
            {activeDoc && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => rejectDocument(activeDoc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#E11D48] text-[#E11D48] hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                  <span>Tolak Faktur</span>
                </button>

                <button
                  type="button"
                  onClick={() => approveDocument(activeDoc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Setujui (Approve)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationContentWrapper() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get('docId');

  return (
    <VerificationProvider initialDocId={docIdParam}>
      <VerificationWorkspaceInner />
    </VerificationProvider>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Memuat Workspace Verifikasi...</div>}>
      <VerificationContentWrapper />
    </Suspense>
  );
}
