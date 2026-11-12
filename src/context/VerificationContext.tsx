'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DocumentRecord, ExtractedField } from '@/types';
import { MockDocumentService } from '@/lib/mocks/storage';
import { useToast } from '@/context/ToastContext';

export interface DocumentDraft {
  fields: ExtractedField[];
  reviewerNote: string;
  isSaving: boolean;
  lastSavedAt?: Date;
}

export interface VerificationContextType {
  documents: DocumentRecord[];
  activeDocId: string | null;
  activeDoc: DocumentRecord | null;
  activeDraft: DocumentDraft | null;
  drafts: Record<string, DocumentDraft>;
  selectedFieldId: string | null;
  isEditMode: boolean;

  // Actions
  selectDocument: (id: string) => void;
  setSelectedFieldId: (id: string | null) => void;
  setIsEditMode: (editMode: boolean) => void;
  toggleEditMode: () => void;
  cancelEdit: () => void;
  saveEdit: () => { success: boolean; message: string };
  updateFieldDraft: (documentId: string, fieldId: string, value: string) => void;
  updateNoteDraft: (documentId: string, note: string) => void;
  approveDocument: (documentId: string) => { success: boolean; message: string };
  rejectDocument: (documentId: string, reason?: string) => { success: boolean; message: string };
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({
  children,
  initialDocId,
}: {
  children: React.ReactNode;
  initialDocId?: string | null;
}) {
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DocumentDraft>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Snapshot of fields when entering edit mode, to restore on cancel
  const editSnapshot = useRef<Record<string, ExtractedField[]>>({});

  // Debounce timers stored per documentId
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Load initial documents from MockDocumentService (localStorage persistence)
  useEffect(() => {
    const timer = setTimeout(() => {
      const loadedDocs = MockDocumentService.getDocuments();
      setDocuments(loadedDocs);

      // Initialize drafts dictionary per documentId
      const initialDrafts: Record<string, DocumentDraft> = {};
      loadedDocs.forEach((doc) => {
        const latestNote = doc.notes.length > 0 ? doc.notes[doc.notes.length - 1].message : '';
        initialDrafts[doc.id] = {
          fields: JSON.parse(JSON.stringify(doc.fields)),
          reviewerNote: latestNote,
          isSaving: false,
          lastSavedAt: new Date(),
        };
      });
      setDrafts(initialDrafts);

      // Determine initial active document
      let targetDocId: string | null = null;
      if (initialDocId) {
        const found = loadedDocs.find((d) => d.id === initialDocId);
        if (found) targetDocId = found.id;
      }

      if (!targetDocId) {
        const firstPending = loadedDocs.find((d) => d.status === 'needs_review') || loadedDocs[0];
        if (firstPending) targetDocId = firstPending.id;
      }

      if (targetDocId) {
        setActiveDocId(targetDocId);
        const targetDoc = loadedDocs.find((d) => d.id === targetDocId);
        const isFinal = targetDoc?.status === 'approved' || targetDoc?.status === 'rejected';
        if (targetDoc && !isFinal && targetDoc.fields.length > 0) {
          setSelectedFieldId(targetDoc.fields[0].id);
        } else {
          setSelectedFieldId(null);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [initialDocId]);

  // Derived active document
  const activeDoc = useMemo(() => {
    if (!activeDocId) return null;
    return documents.find((d) => d.id === activeDocId) || null;
  }, [documents, activeDocId]);

  // Derived active draft
  const activeDraft = useMemo(() => {
    if (!activeDocId || !drafts[activeDocId]) return null;
    return drafts[activeDocId];
  }, [drafts, activeDocId]);

  // Function to perform actual persist to storage & state
  const commitSave = useCallback((documentId: string, currentDraft: DocumentDraft) => {
    setDocuments((prevDocs) => {
      const doc = prevDocs.find((d) => d.id === documentId);
      if (!doc) return prevDocs;

      // Calculate total amount if changed
      let updatedTotalAmount = doc.totalAmount;
      const totalAmountField = currentDraft.fields.find(
        (f) => f.id === 'total_amount' || f.label.toLowerCase().includes('total')
      );
      if (totalAmountField) {
        const numericVal =
          typeof totalAmountField.value === 'number'
            ? totalAmountField.value
            : parseFloat(String(totalAmountField.value).replace(/[^0-9.-]+/g, ''));
        if (!isNaN(numericVal) && numericVal > 0) {
          updatedTotalAmount = numericVal;
        }
      }

      // Sync notes
      const updatedNotes = [...doc.notes];
      if (currentDraft.reviewerNote) {
        const existingLastNote =
          updatedNotes.length > 0 ? updatedNotes[updatedNotes.length - 1].message : '';
        if (currentDraft.reviewerNote !== existingLastNote) {
          const currentUser = MockDocumentService.getCurrentUser();
          updatedNotes.push({
            id: `note-${Date.now()}`,
            author: currentUser.name,
            authorRole: 'Reviewer',
            timestamp: new Date().toISOString(),
            message: currentDraft.reviewerNote,
            type: 'note',
          });
        }
      }

      const updatedDoc: DocumentRecord = {
        ...doc,
        fields: JSON.parse(JSON.stringify(currentDraft.fields)),
        totalAmount: updatedTotalAmount,
        notes: updatedNotes,
      };

      // Persist to localStorage
      MockDocumentService.saveDocument(updatedDoc);

      return prevDocs.map((d) => (d.id === documentId ? updatedDoc : d));
    });

    // Update draft saving state
    setDrafts((prev) => {
      const d = prev[documentId];
      if (!d) return prev;
      return {
        ...prev,
        [documentId]: {
          ...d,
          isSaving: false,
          lastSavedAt: new Date(),
        },
      };
    });
  }, []);

  // Debounced auto-save schedule (400ms)
  const triggerDebouncedAutoSave = useCallback((documentId: string, updatedDraft: DocumentDraft) => {
    // Set isSaving state immediately for UI feedback
    setDrafts((prev) => ({
      ...prev,
      [documentId]: {
        ...updatedDraft,
        isSaving: true,
      },
    }));

    if (debounceTimers.current[documentId]) {
      clearTimeout(debounceTimers.current[documentId]);
    }

    debounceTimers.current[documentId] = setTimeout(() => {
      commitSave(documentId, updatedDraft);
      delete debounceTimers.current[documentId];
    }, 400);
  }, [commitSave]);

  // Guard field highlight selection when active document is locked in final status
  const handleSelectField = useCallback(
    (id: string | null) => {
      if (activeDoc && (activeDoc.status === 'approved' || activeDoc.status === 'rejected')) {
        setSelectedFieldId(null);
        return;
      }
      setSelectedFieldId(id);
    },
    [activeDoc]
  );

  // Update a single field in draft with immediate debounced auto-save
  const updateFieldDraft = useCallback(
    (documentId: string, fieldId: string, value: string) => {
      const targetDoc = documents.find((d) => d.id === documentId);
      if (targetDoc && (targetDoc.status === 'approved' || targetDoc.status === 'rejected')) {
        return;
      }

      setDrafts((prev) => {
        const currentDraft = prev[documentId];
        if (!currentDraft) return prev;

        const updatedFields = currentDraft.fields.map((f) => {
          if (f.id === fieldId) {
            return {
              ...f,
              value,
              isEdited: true,
              validationStatus: 'valid' as const,
              validationMessage: undefined,
            };
          }
          return f;
        });

        const nextDraft: DocumentDraft = {
          ...currentDraft,
          fields: updatedFields,
          isSaving: true,
        };

        triggerDebouncedAutoSave(documentId, nextDraft);

        return {
          ...prev,
          [documentId]: nextDraft,
        };
      });
    },
    [documents, triggerDebouncedAutoSave]
  );

  // Update note in draft with immediate debounced auto-save
  const updateNoteDraft = useCallback(
    (documentId: string, note: string) => {
      const targetDoc = documents.find((d) => d.id === documentId);
      if (targetDoc && (targetDoc.status === 'approved' || targetDoc.status === 'rejected')) {
        return;
      }

      setDrafts((prev) => {
        const currentDraft = prev[documentId];
        if (!currentDraft) return prev;

        const nextDraft: DocumentDraft = {
          ...currentDraft,
          reviewerNote: note,
          isSaving: true,
        };

        triggerDebouncedAutoSave(documentId, nextDraft);

        return {
          ...prev,
          [documentId]: nextDraft,
        };
      });
    },
    [documents, triggerDebouncedAutoSave]
  );

  // Select document seamlessly (flush any pending debounce on previous document)
  const selectDocument = useCallback((id: string) => {
    // If previous document has a pending debounced save, flush it immediately!
    if (activeDocId && debounceTimers.current[activeDocId]) {
      clearTimeout(debounceTimers.current[activeDocId]);
      delete debounceTimers.current[activeDocId];
      if (drafts[activeDocId]) {
        commitSave(activeDocId, drafts[activeDocId]);
      }
    }

    // Reset Edit Mode when switching documents: Always start in Read-Only Mode!
    setIsEditMode(false);

    setActiveDocId(id);
    const targetDoc = documents.find((d) => d.id === id);
    const isFinal = targetDoc?.status === 'approved' || targetDoc?.status === 'rejected';
    if (targetDoc && !isFinal && targetDoc.fields.length > 0) {
      setSelectedFieldId(targetDoc.fields[0].id);
    } else {
      setSelectedFieldId(null);
    }
  }, [activeDocId, drafts, documents, commitSave]);

  // Toggle Edit Mode: Only allowed if document is not in final status (approved / rejected)
  const toggleEditMode = useCallback(() => {
    if (!activeDoc) return;
    if (activeDoc.status === 'approved' || activeDoc.status === 'rejected') {
      toast.error(
        `Dokumen berstatus final (${activeDoc.status === 'approved' ? 'Terverifikasi' : 'Ditolak'}) terkunci dan tidak dapat diedit.`,
        { title: 'Dokumen Terkunci' }
      );
      return;
    }

    if (!isEditMode) {
      // Entering edit mode: store snapshot of fields
      if (activeDraft) {
        editSnapshot.current[activeDoc.id] = JSON.parse(JSON.stringify(activeDraft.fields));
      }
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [activeDoc, isEditMode, activeDraft, toast]);

  // Cancel Edit Mode: Restore fields to snapshot and return to Read-Only
  const cancelEdit = useCallback(() => {
    if (!activeDoc) return;
    if (editSnapshot.current[activeDoc.id]) {
      const restoredFields = editSnapshot.current[activeDoc.id];
      setDrafts((prev) => {
        const d = prev[activeDoc.id];
        if (!d) return prev;
        const restoredDraft = { ...d, fields: JSON.parse(JSON.stringify(restoredFields)) };
        commitSave(activeDoc.id, restoredDraft);
        return { ...prev, [activeDoc.id]: restoredDraft };
      });
    }
    setIsEditMode(false);
    toast.info('Perubahan dibatalkan. Kembali ke Mode Read-Only.', {
      title: 'Edit Dibatalkan',
    });
  }, [activeDoc, commitSave, toast]);

  // Save Edit Mode: Validate, commit save, and return to Read-Only
  const saveEdit = useCallback(() => {
    if (!activeDoc) return { success: false, message: 'Tidak ada dokumen aktif' };
    if (activeDoc.status === 'approved' || activeDoc.status === 'rejected') {
      toast.error('Dokumen berstatus final tidak dapat diubah.', { title: 'Dokumen Terkunci' });
      return { success: false, message: 'Status final terkunci' };
    }

    if (activeDraft) {
      const missingRequiredField = activeDraft.fields.find(
        (field) => field.isRequired && String(field.value ?? '').trim() === ''
      );
      if (missingRequiredField) {
        toast.error(`Bidang wajib "${missingRequiredField.label}" tidak boleh kosong.`, {
          title: 'Validasi Bidang Gagal',
        });
        return { success: false, message: `Bidang ${missingRequiredField.label} wajib diisi` };
      }

      commitSave(activeDoc.id, activeDraft);
      // Update snapshot to current saved state
      editSnapshot.current[activeDoc.id] = JSON.parse(JSON.stringify(activeDraft.fields));
    }

    setIsEditMode(false);
    toast.success(`Perubahan bidang dokumen ${activeDoc.fileNumber} berhasil disimpan.`, {
      title: 'Bidang Dokumen Tersimpan',
    });
    return { success: true, message: 'Tersimpan' };
  }, [activeDoc, activeDraft, commitSave, toast]);

  // Approve document
  const approveDocument = useCallback((documentId: string) => {
    const targetDoc = documents.find((d) => d.id === documentId);
    if (targetDoc && (targetDoc.status === 'approved' || targetDoc.status === 'rejected')) {
      toast.error('Dokumen berstatus final tidak dapat diproses ulang.', { title: 'Aksi Ditolak' });
      return { success: false, message: 'Status final terkunci' };
    }

    // Flush any pending debounce for this document immediately
    if (debounceTimers.current[documentId]) {
      clearTimeout(debounceTimers.current[documentId]);
      delete debounceTimers.current[documentId];
    }

    const draft = drafts[documentId];
    if (draft) {
      commitSave(documentId, draft);
    }

    const currentUser = MockDocumentService.getCurrentUser();
    const noteToRecord = draft?.reviewerNote || 'Disetujui setelah verifikasi kelengkapan faktur';
    const updated = MockDocumentService.updateDocumentStatus(
      documentId,
      'approved',
      currentUser.name,
      noteToRecord
    );

    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === documentId ? updated : d)));
      setIsEditMode(false);
      setSelectedFieldId(null);
      toast.success(
        `Dokumen ${updated.fileNumber} berhasil disetujui dan disinkronkan ke seluruh sistem!`,
        { title: 'Dokumen Disetujui' }
      );
      return { success: true, message: 'Disetujui' };
    }

    toast.error('Gagal memperbarui status dokumen.', { title: 'Proses Gagal' });
    return { success: false, message: 'Gagal memperbarui status dokumen.' };
  }, [documents, drafts, commitSave, toast]);

  // Reject document
  const rejectDocument = useCallback((documentId: string, reason?: string) => {
    const targetDoc = documents.find((d) => d.id === documentId);
    if (targetDoc && (targetDoc.status === 'approved' || targetDoc.status === 'rejected')) {
      toast.error('Dokumen berstatus final tidak dapat ditolak ulang.', { title: 'Aksi Ditolak' });
      return { success: false, message: 'Status final terkunci' };
    }

    // Flush any pending debounce for this document immediately
    if (debounceTimers.current[documentId]) {
      clearTimeout(debounceTimers.current[documentId]);
      delete debounceTimers.current[documentId];
    }

    const draft = drafts[documentId];
    if (draft) {
      commitSave(documentId, draft);
    }

    const finalReason = (reason ?? draft?.reviewerNote ?? '').trim();

    if (!finalReason) {
      toast.error('Harap masukkan catatan/alasan penolakan terlebih dahulu pada kolom Catatan Verifikator!', {
        title: 'Alasan Penolakan Wajib Diisi',
      });
      return { success: false, message: 'Alasan penolakan wajib diisi.' };
    }

    const currentUser = MockDocumentService.getCurrentUser();
    const updated = MockDocumentService.updateDocumentStatus(
      documentId,
      'rejected',
      currentUser.name,
      finalReason
    );

    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === documentId ? updated : d)));
      setIsEditMode(false);
      setSelectedFieldId(null);
      toast.error(`Dokumen ${updated.fileNumber} telah ditolak dan status tersinkronisasi.`, {
        title: 'Dokumen Ditolak',
      });
      return { success: true, message: 'Ditolak' };
    }

    toast.error('Gagal menolak dokumen.', { title: 'Proses Gagal' });
    return { success: false, message: 'Gagal menolak dokumen.' };
  }, [documents, drafts, commitSave, toast]);

  const contextValue = useMemo(
    () => ({
      documents,
      activeDocId,
      activeDoc,
      activeDraft,
      drafts,
      selectedFieldId,
      isEditMode,
      selectDocument,
      setSelectedFieldId: handleSelectField,
      setIsEditMode,
      toggleEditMode,
      cancelEdit,
      saveEdit,
      updateFieldDraft,
      updateNoteDraft,
      approveDocument,
      rejectDocument,
    }),
    [
      documents,
      activeDocId,
      activeDoc,
      activeDraft,
      drafts,
      selectedFieldId,
      isEditMode,
      selectDocument,
      handleSelectField,
      toggleEditMode,
      cancelEdit,
      saveEdit,
      updateFieldDraft,
      updateNoteDraft,
      approveDocument,
      rejectDocument,
    ]
  );

  return (
    <VerificationContext.Provider value={contextValue}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}
