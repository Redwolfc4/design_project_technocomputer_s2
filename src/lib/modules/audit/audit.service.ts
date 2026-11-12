import { AuditLogEntry } from '@/types';
import { STORAGE_KEYS, isClientEnvironment, safeLocalStorageGet, safeLocalStorageSet } from '../storage.base';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
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

export class AuditService {
  static getLogs(): AuditLogEntry[] {
    if (!isClientEnvironment()) return INITIAL_AUDIT_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return safeLocalStorageGet<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }

  static getLogById(id: string): AuditLogEntry | undefined {
    return this.getLogs().find((l) => l.id === id);
  }

  /**
   * Append-only event logging. Modifikasi atau penghapusan log audit dilarang secara desain.
   */
  static recordEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    if (isClientEnvironment()) {
      const logs = this.getLogs();
      logs.unshift(newEntry);
      safeLocalStorageSet(STORAGE_KEYS.AUDIT, logs);
    }

    return newEntry;
  }
}
