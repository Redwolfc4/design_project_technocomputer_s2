import { DocumentRecord, AuditLogEntry, UserPersona, WorkspaceSettings, DocumentStatus } from '@/types';
import { INITIAL_MOCK_DOCUMENTS } from './documents';
import { DEMO_PERSONAS } from '../constants/personas';

const STORAGE_KEYS = {
  DOCUMENTS: 'dokumenai_documents_v1',
  CURRENT_USER: 'dokumenai_current_user_v1',
  AUDIT_LOGS: 'dokumenai_audit_logs_v1',
  SETTINGS: 'dokumenai_settings_v1',
};

const INITIAL_SETTINGS: WorkspaceSettings = {
  workspaceName: 'Nusantara Enterprise Cloud Workspace',
  companyName: 'PT Nusantara Teknologi Cipta Tbk',
  taxId: '01.234.567.8-051.000',
  defaultCurrency: 'IDR',
  locale: 'id-ID',
  timezone: 'Asia/Jakarta',
  autoApproveConfidenceThreshold: 95,
  enableDuplicateDetection: true,
  defaultTaxRatePercent: 11,
  notificationEmail: 'finance-ops@nusantara-tech.co.id',
  webhookUrl: 'https://api.nusantara-tech.co.id/webhooks/dokumenai',
};

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-101',
    timestamp: '2026-03-04T11:00:00Z',
    actor: 'Budi Santoso, S.Kom., M.T.',
    actorRole: 'super_admin',
    action: 'UPLOAD_DOCUMENT',
    resourceType: 'document',
    resourceId: 'doc-004',
    resourceName: 'Kontrak_SaaS_Mitra_Solusi_Digital.pdf',
    details: 'Berhasil mengunggah dokumen kontrak multi-tahun untuk AI parsing',
    status: 'success',
    ipAddress: '182.253.112.44',
  },
  {
    id: 'log-102',
    timestamp: '2026-03-04T10:05:00Z',
    actor: 'Rizky Pratama',
    actorRole: 'document_reviewer',
    action: 'UPLOAD_DOCUMENT',
    resourceType: 'document',
    resourceId: 'doc-003',
    resourceName: 'Purchase_Order_Kharisma_Hardware.pdf',
    details: 'Batch upload purchase order server rack IT',
    status: 'success',
    ipAddress: '182.253.112.89',
  },
  {
    id: 'log-103',
    timestamp: '2026-03-03T15:10:00Z',
    actor: 'Dewi Lestari, S.E., Ak., CA',
    actorRole: 'finance_supervisor',
    action: 'APPROVE_DOCUMENT',
    resourceType: 'document',
    resourceId: 'doc-002',
    resourceName: 'Invoice_Graha_Logistik_9014.pdf',
    details: 'Verifikasi human-in-the-loop selesai. Nilai invoice Rp 20.535.000 disetujui.',
    previousValue: 'Status: needs_review',
    newValue: 'Status: approved',
    status: 'success',
    ipAddress: '182.253.112.55',
  },
  {
    id: 'log-104',
    timestamp: '2026-03-01T13:40:00Z',
    actor: 'Rizky Pratama',
    actorRole: 'document_reviewer',
    action: 'REJECT_DOCUMENT',
    resourceType: 'document',
    resourceId: 'doc-006',
    resourceName: 'Kuitansi_Sinar_Mandiri_ATK.pdf',
    details: 'Dokumen ditolak karena resolusi fisik buram dan cap tidak terbaca',
    previousValue: 'Status: needs_review',
    newValue: 'Status: rejected',
    status: 'warning',
    ipAddress: '182.253.112.89',
  },
];

export class MockDocumentService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static getDocuments(): DocumentRecord[] {
    if (!this.isClient()) return INITIAL_MOCK_DOCUMENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_MOCK_DOCUMENTS));
      return INITIAL_MOCK_DOCUMENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_DOCUMENTS;
    }
  }

  static getDocumentById(id: string): DocumentRecord | undefined {
    const docs = this.getDocuments();
    return docs.find((d) => d.id === id);
  }

  static saveDocument(doc: DocumentRecord): void {
    if (!this.isClient()) return;
    const docs = this.getDocuments();
    const existing = docs.find((d) => d.id === doc.id);

    // Backend rule: Jika status sebelumnya sudah final ('approved' atau 'rejected'),
    // tolak modifikasi field data dokumen (hanya jika status tetap final)
    if (existing && (existing.status === 'approved' || existing.status === 'rejected')) {
      // Izinkan pembaruan auditHistory atau notes jika perlu, tetapi kunci fields data dokumen
      doc.fields = existing.fields;
      doc.totalAmount = existing.totalAmount;
      doc.subtotal = existing.subtotal;
      doc.taxAmount = existing.taxAmount;
    }

    const index = docs.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      docs[index] = doc;
    } else {
      docs.unshift(doc);
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  }

  static updateDocumentStatus(
    id: string,
    status: DocumentStatus,
    actorName: string,
    note?: string
  ): DocumentRecord | undefined {
    const doc = this.getDocumentById(id);
    if (!doc) return undefined;

    // Backend rule: Status 'approved' dan 'rejected' adalah status final yang tidak boleh diubah kembali
    if (doc.status === 'approved' || doc.status === 'rejected') {
      console.warn(`[MockDocumentService] Dokumen ${id} berstatus final '${doc.status}'. Perubahan ke '${status}' ditolak.`);
      return doc;
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

    this.saveDocument(doc);

    // Record to audit logs as well
    this.addAuditLog({
      timestamp: new Date().toISOString(),
      actor: actorName,
      actorRole: 'finance_supervisor',
      action: `DOCUMENT_${status.toUpperCase()}`,
      resourceType: 'document',
      resourceId: doc.id,
      resourceName: doc.fileName,
      details: note || `Verifikasi dokumen selesai dengan status ${status}`,
      previousValue: `Status: ${prevStatus}`,
      newValue: `Status: ${status}`,
      status: status === 'rejected' ? 'warning' : 'success',
      ipAddress: '127.0.0.1 (Demo Local)',
    });

    return doc;
  }

  static getCurrentUser(): UserPersona {
    if (!this.isClient()) return DEMO_PERSONAS.finance_supervisor;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_PERSONAS.finance_supervisor));
      return DEMO_PERSONAS.finance_supervisor;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEMO_PERSONAS.finance_supervisor;
    }
  }

  static setCurrentUser(persona: UserPersona): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(persona));
  }

  static getAuditLogs(): AuditLogEntry[] {
    if (!this.isClient()) return INITIAL_AUDIT_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  static addAuditLog(entry: Omit<AuditLogEntry, 'id'>): void {
    if (!this.isClient()) return;
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  static getSettings(): WorkspaceSettings {
    if (!this.isClient()) return INITIAL_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static updateSettings(settings: Partial<WorkspaceSettings>): WorkspaceSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    return updated;
  }

  static resetDemoData(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_MOCK_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_PERSONAS.finance_supervisor));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
}

