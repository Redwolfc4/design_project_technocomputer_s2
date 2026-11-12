'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/shared/PageHeader';
import { VerificationProvider, useVerification } from '@/context/VerificationContext';
import { formatIDR, getDocumentTypeLabel, getStatusBadgeInfo } from '@/lib/utils/formatters';
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  Edit3Icon,
  SaveIcon,
} from '@/components/ui/icons';

function VerificationWorkspaceInner() {
  const {
    documents,
    activeDocId,
    activeDoc,
    activeDraft,
    selectedFieldId,
    notification,
    isEditMode,
    selectDocument,
    setSelectedFieldId,
    toggleEditMode,
    cancelEdit,
    saveEdit,
    updateFieldDraft,
    updateNoteDraft,
    approveDocument,
    rejectDocument,
    clearNotification,
  } = useVerification();

  const pendingList = documents.filter((d) => d.status === 'needs_review');

  return (
    <div className="flex-1 flex flex-col min-h-screen xl:h-screen xl:overflow-hidden min-w-0">
      <Topbar
        title="Human-in-the-Loop Verification Workspace"
        subtitle="Verifikasi berdampingan: Pratinjau berkas asli dengan anotasi visual & formulir koreksi nilai AI"
      />

      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`px-8 py-2.5 text-xs font-bold text-white flex items-center justify-between transition-all shrink-0 ${notification.type === 'success' ? 'bg-[#059669]' : 'bg-[#E11D48]'
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

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 flex flex-col gap-6 min-w-0 min-h-0">
        <PageHeader
          title="Antrean Verifikasi & Rekonsiliasi HITL"
          subtitle="Verifikasi berdampingan: pratinjau berkas asli dengan anotasi visual & formulir koreksi nilai AI."
          badge={{
            label: pendingList.length > 0 ? `${pendingList.length} Antrean Verifikasi` : 'Workspace Verifikasi',
            variant: 'info',
          }}
          className="shrink-0"
        />

        <div className="flex-1 flex flex-col xl:flex-row rounded-xl border border-[#CBD5E1] bg-white shadow-sm overflow-hidden min-w-0 min-h-0">
        {/* ======================================================== */}
        {/* Left Column 1: Verification Queue List                    */}
        {/* ======================================================== */}
        <div className="w-full xl:w-72 2xl:w-80 border-b xl:border-b-0 xl:border-r border-[#E2E8F0] bg-white flex flex-col shrink-0 max-h-64 xl:max-h-full xl:min-h-0">
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
                  className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${isSelected ? 'bg-[#EEF2FF] border-l-4 border-[#4F46E5]' : 'hover:bg-[#F8FAFC]'
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
                      className={`font-bold ${doc.confidence >= 90
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
        <div className="flex-1 bg-[#F1F5F9] p-4 sm:p-6 flex flex-col overflow-y-auto items-center justify-start min-w-0 xl:min-h-0">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-[#CBD5E1] p-6 sm:p-8 relative min-h-[500px] flex flex-col justify-between select-none">
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
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${isHighlighted
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
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${field.confidence >= 0.9
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
                    <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto text-xs bg-white">
                      <table className="w-full min-w-[500px] text-left">
                        <thead className="bg-[#F8FAFC] text-[10px] font-bold text-[#64748B] border-b border-[#E2E8F0]">
                          <tr>
                            <th className="p-2.5 min-w-[200px]">Deskripsi</th>
                            <th className="p-2.5 text-center whitespace-nowrap">Qty</th>
                            <th className="p-2.5 text-right whitespace-nowrap">Harga Satuan</th>
                            <th className="p-2.5 text-right whitespace-nowrap">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {activeDoc.lineItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-2.5 font-medium text-[#0F172A]">{item.description}</td>
                              <td className="p-2.5 text-center text-[#64748B] whitespace-nowrap">{item.quantity} {item.unit}</td>
                              <td className="p-2.5 text-right text-[#64748B] whitespace-nowrap">{formatIDR(item.unitPrice)}</td>
                              <td className="p-2.5 text-right font-semibold text-[#0F172A] whitespace-nowrap">{formatIDR(item.totalPrice)}</td>
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
        <div className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-[#E2E8F0] bg-white flex flex-col shrink-0 min-w-0 xl:min-h-0">
          <div className="p-3.5 border-b border-[#E2E8F0] bg-[#FAFAFF] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Detail & Editor Dokumen
              </span>
              <span className="text-[10px] text-[#64748B]">
                {activeDoc?.status === 'approved' || activeDoc?.status === 'rejected'
                  ? 'Status Final • Terkunci Permanen'
                  : isEditMode
                    ? 'Mode Edit Aktif'
                    : 'Mode Read-Only (Default)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tombol Edit / Batal & Simpan di Pojok Kanan Atas */}
              {activeDoc && activeDoc.status !== 'approved' && activeDoc.status !== 'rejected' && (
                <>
                  {!isEditMode ? (
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-white border border-[#CBD5E1] text-[#4F46E5] hover:bg-[#EEF2FF] shadow-sm transition-all cursor-pointer"
                      title="Klik untuk mengubah nilai field dokumen"
                    >
                      <Edit3Icon className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-[#CBD5E1] text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm transition-colors cursor-pointer"
                      >
                        <SaveIcon className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Status Sync / Saving feedback indicator */}
              {isEditMode && activeDraft?.isSaving && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-200 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-ping" />
                  <span>Menyimpan...</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeDoc && activeDraft && (
              <>
                <div
                  className={`p-3.5 rounded-lg border space-y-1 ${activeDoc.status === 'approved'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : activeDoc.status === 'rejected'
                        ? 'border-rose-200 bg-rose-50/50'
                        : 'border-[#CBD5E1] bg-[#FAFAFF]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Status Verifikasi Dokumen
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${activeDoc.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeDoc.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {activeDoc.status === 'approved'
                        ? 'Terverifikasi'
                        : activeDoc.status === 'rejected'
                          ? 'Ditolak'
                          : 'Perlu Verifikasi'}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A] pt-0.5">
                    {activeDoc.status === 'approved'
                      ? '✓ Dokumen Telah Terverifikasi (Final)'
                      : activeDoc.status === 'rejected'
                        ? '✕ Dokumen Telah Ditolak (Final)'
                        : isEditMode
                          ? '✏️ Sedang Mengedit Field Dokumen'
                          : '🔒 Pratinjau Read-Only'}
                  </div>
                </div>

                {/* Form Fields: Read-Only Secara Default, Editable Hanya di Edit Mode */}
                <div className="space-y-4">
                  {activeDraft.fields.map((field) => {
                    const isFinalStatus =
                      activeDoc.status === 'approved' || activeDoc.status === 'rejected';
                    const isFieldReadOnly = !isEditMode || isFinalStatus;

                    return (
                      <div
                        key={field.id}
                        className={`space-y-1.5 p-3 rounded-lg border transition-all ${selectedFieldId === field.id
                            ? 'border-[#4F46E5] bg-[#EEF2FF]/30 ring-1 ring-[#4F46E5]/20'
                            : 'border-[#E2E8F0] bg-white'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#475569]">
                            {field.label}
                          </label>
                          <div className="flex items-center gap-1.5">
                            {isFieldReadOnly && (
                              <span className="text-[9px] font-semibold text-[#94A3B8]">
                                Read-Only
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${field.confidence >= 0.9 ? 'text-[#059669]' : 'text-[#F59E0B]'
                                }`}
                            >
                              {Math.round(field.confidence * 100)}% Match
                            </span>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={field.value}
                          readOnly={isFieldReadOnly}
                          onChange={(e) => {
                            if (!isFieldReadOnly) {
                              updateFieldDraft(activeDoc.id, field.id, e.target.value);
                            }
                          }}
                          onFocus={() => setSelectedFieldId(field.id)}
                          className={`w-full text-xs font-semibold px-3 py-2 rounded-md border transition-colors ${isFieldReadOnly
                              ? 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] cursor-default focus:outline-none select-all'
                              : 'border-[#4F46E5] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]'
                            }`}
                        />

                        {field.validationMessage && (
                          <p className="text-[10px] text-[#F59E0B] font-medium flex items-center gap-1">
                            <AlertTriangleIcon className="w-3 h-3 shrink-0" />
                            <span>{field.validationMessage}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Catatan Verifikator — Pengecualian Khusus: Editable saat pending, read-only saat final */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#475569]">
                      Catatan Verifikator
                    </label>
                    {(activeDoc.status === 'approved' || activeDoc.status === 'rejected') ? (
                      <span className="text-[9px] font-bold text-[#94A3B8]">Terkunci (Final)</span>
                    ) : (
                      <span className="text-[9px] font-semibold text-[#059669]">
                        Editable (Autosave)
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    placeholder={
                      activeDoc.status === 'approved' || activeDoc.status === 'rejected'
                        ? 'Catatan verifikator terkunci pada status final.'
                        : 'Tuliskan catatan rekonsiliasi atau alasan penolakan/revisi...'
                    }
                    value={activeDraft.reviewerNote}
                    readOnly={activeDoc.status === 'approved' || activeDoc.status === 'rejected'}
                    onChange={(e) => {
                      if (activeDoc.status !== 'approved' && activeDoc.status !== 'rejected') {
                        updateNoteDraft(activeDoc.id, e.target.value);
                      }
                    }}
                    className={`w-full text-xs px-3 py-2 rounded-md border transition-colors ${activeDoc.status === 'approved' || activeDoc.status === 'rejected'
                        ? 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] cursor-default focus:outline-none'
                        : 'border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]'
                      }`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons: Kunci Total pada Status Final ('approved' / 'rejected') */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFAFF]">
            {activeDoc && (
              <>
                {activeDoc.status === 'approved' ? (
                  <div className="py-2.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                    <span>Dokumen Telah Disetujui • Keputusan Terkunci</span>
                  </div>
                ) : activeDoc.status === 'rejected' ? (
                  <div className="py-2.5 px-3 rounded-lg bg-rose-50 border border-rose-200 text-center text-xs font-bold text-rose-800 flex items-center justify-center gap-1.5">
                    <XIcon className="w-4 h-4 text-rose-600" />
                    <span>Dokumen Telah Ditolak • Keputusan Terkunci</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => rejectDocument(activeDoc.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#E11D48] text-[#E11D48] hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XIcon className="w-4 h-4" />
                      <span>Tolak Faktur</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => approveDocument(activeDoc.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>Setujui (Approve)</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </main>
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
