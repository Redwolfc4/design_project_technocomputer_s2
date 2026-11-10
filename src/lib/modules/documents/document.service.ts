import { DocumentRecord, DocumentStatus } from '@/types';
import { INITIAL_MOCK_DOCUMENTS } from '@/lib/mocks/documents';
import { STORAGE_KEYS, isClientEnvironment, safeLocalStorageGet, safeLocalStorageSet } from '../storage.base';
import { AuditService } from '../audit/audit.service';

export class DocumentService {
  static getDocuments(): DocumentRecord[] {
    if (!isClientEnvironment()) return INITIAL_MOCK_DOCUMENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
      return INITIAL_MOCK_DOCUMENTS;
    }
    return safeLocalStorageGet<DocumentRecord[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
  }

  static getDocumentById(id: string): DocumentRecord | undefined {
    return this.getDocuments().find((d) => d.id === id);
  }

  static createDocument(
    doc: DocumentRecord,
    actorName = 'Petugas Unggah Dokumen'
  ): { success: boolean; document: DocumentRecord } {
    const docs = this.getDocuments();
    docs.unshift(doc);
    safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, docs);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'document_reviewer',
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'document',
      resourceId: doc.id,
      resourceName: doc.fileName || doc.title,
      details: `Mengunggah dokumen ${doc.fileNumber} (${doc.vendorName})`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, document: doc };
  }

  static updateMetadata(
    id: string,
    metadata: {
      fileNumber?: string;
      vendorName?: string;
      vendorTaxId?: string;
      totalAmount?: number;
      subtotal?: number;
      taxAmount?: number;
      notes?: string;
    },
    actorName = 'Staff Administrasi'
  ): { success: boolean; document?: DocumentRecord; error?: string } {
    const docs = this.getDocuments();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) {
      return { success: false, error: 'Dokumen tidak ditemukan.' };
    }

    const current = docs[index];
    // Aturan bisnis: Dokumen yang sudah approved atau rejected tidak boleh diubah nilai intinya
    if (current.status === 'approved' || current.status === 'rejected') {
      return {
        success: false,
        error: `Dokumen dengan status '${current.status}' terkunci dari modifikasi metadata.`,
      };
    }

    const prevVendor = current.vendorName;
    const updated: DocumentRecord = {
      ...current,
      ...metadata,
      notes: metadata.notes
        ? [
            ...current.notes,
            {
              id: `note-${Date.now()}`,
              author: actorName,
              authorRole: 'Editor',
              timestamp: new Date().toISOString(),
              message: metadata.notes,
              type: 'note',
            },
          ]
        : current.notes,
    };

    docs[index] = updated;
    safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, docs);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'document_reviewer',
      action: 'UPDATE_DOCUMENT' as any,
      resourceType: 'document',
      resourceId: updated.id,
      resourceName: updated.fileName,
      details: `Memperbarui metadata dokumen ${updated.fileNumber}`,
      previousValue: `Vendor: ${prevVendor}, Total: ${current.totalAmount}`,
      newValue: `Vendor: ${updated.vendorName}, Total: ${updated.totalAmount}`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, document: updated };
  }

  static deleteDocument(
    id: string,
    actorName = 'Admin Sistem'
  ): { success: boolean; error?: string } {
    const docs = this.getDocuments();
    const target = docs.find((d) => d.id === id);
    if (!target) {
      return { success: false, error: 'Dokumen tidak ditemukan.' };
    }

    // Aturan bisnis forensik: Dokumen approved tidak boleh dihapus sembarangan
    if (target.status === 'approved') {
      return {
        success: false,
        error: 'Dokumen yang telah Disetujui (Approved) tidak dapat dihapus untuk menjaga keabsahan pembukuan!',
      };
    }

    const filtered = docs.filter((d) => d.id !== id);
    safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, filtered);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'DELETE_DOCUMENT' as any,
      resourceType: 'document',
      resourceId: target.id,
      resourceName: target.fileName,
      details: `Menghapus dokumen antrean/draf: ${target.fileNumber} (${target.fileName})`,
      status: 'warning',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true };
  }

  static updateStatus(
    id: string,
    status: DocumentStatus,
    actorName: string,
    note?: string
  ): { success: boolean; document?: DocumentRecord; error?: string } {
    const docs = this.getDocuments();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) {
      return { success: false, error: 'Dokumen tidak ditemukan.' };
    }

    const doc = docs[index];
    if (doc.status === 'approved' || doc.status === 'rejected') {
      return {
        success: false,
        error: `Dokumen ${id} berstatus final '${doc.status}'. Status terkunci.`,
      };
    }

    const prevStatus = doc.status;
    doc.status = status;
    if (status === 'approved' || status === 'rejected') {
      doc.verifiedAt = new Date().toISOString();
    }

    doc.auditHistory.unshift({
      timestamp: new Date().toISOString(),
      actor: actorName,
      action: `STATUS_CHANGE_TO_${status.toUpperCase()}`,
      details: note || `Status diubah dari ${prevStatus} menjadi ${status}`,
    });

    if (note) {
      doc.notes.push({
        id: `note-${Date.now()}`,
        author: actorName,
        authorRole: 'Reviewer',
        timestamp: new Date().toISOString(),
        message: note,
        type: status === 'rejected' ? 'correction_request' : 'note',
      });
    }

    docs[index] = doc;
    safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, docs);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'finance_supervisor',
      action: `DOCUMENT_${status.toUpperCase()}` as any,
      resourceType: 'document',
      resourceId: doc.id,
      resourceName: doc.fileName,
      details: note || `Verifikasi dokumen selesai dengan status ${status}`,
      previousValue: `Status: ${prevStatus}`,
      newValue: `Status: ${status}`,
      status: status === 'rejected' ? 'warning' : 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, document: doc };
  }
}

