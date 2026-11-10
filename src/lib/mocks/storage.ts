import { DocumentRecord, AuditLogEntry, UserPersona, WorkspaceSettings, DocumentStatus } from '@/types';
import { DocumentService } from '../modules/documents/document.service';
import { AuditService } from '../modules/audit/audit.service';
import { SettingService } from '../modules/settings/setting.service';
import { DEMO_PERSONAS } from '../constants/personas';
import { STORAGE_KEYS, safeLocalStorageGet, safeLocalStorageSet, isClientEnvironment, safeLocalStorageRemove } from '../modules/storage.base';
import { INITIAL_MOCK_DOCUMENTS } from './documents';
import { INITIAL_RBAC_USERS } from './rbacUsers';
import { INITIAL_BATCH_ITEMS } from '../modules/batches/batch.service';
import { INITIAL_INTEGRATION_ENDPOINTS } from '../modules/integrations/integration.service';
import { INITIAL_SETTINGS } from '../modules/settings/setting.service';
import { INITIAL_AUDIT_LOGS } from '../modules/audit/audit.service';

export class MockDocumentService {
  static getDocuments(): DocumentRecord[] {
    return DocumentService.getDocuments();
  }

  static getDocumentById(id: string): DocumentRecord | undefined {
    return DocumentService.getDocumentById(id);
  }

  static saveDocument(doc: DocumentRecord): void {
    const docs = DocumentService.getDocuments();
    const index = docs.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      docs[index] = doc;
      safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, docs);
    } else {
      DocumentService.createDocument(doc);
    }
  }

  static updateDocumentStatus(
    id: string,
    status: DocumentStatus,
    actorName: string,
    note?: string
  ): DocumentRecord | undefined {
    const res = DocumentService.updateStatus(id, status, actorName, note);
    return res.document;
  }

  static getCurrentUser(): UserPersona {
    if (!isClientEnvironment()) return DEMO_PERSONAS.finance_supervisor;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, DEMO_PERSONAS.finance_supervisor);
      return DEMO_PERSONAS.finance_supervisor;
    }
    return safeLocalStorageGet<UserPersona>(STORAGE_KEYS.CURRENT_USER, DEMO_PERSONAS.finance_supervisor);
  }

  static setCurrentUser(persona: UserPersona): void {
    safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, persona);
  }

  static getAuditLogs(): AuditLogEntry[] {
    return AuditService.getLogs();
  }

  static addAuditLog(entry: Omit<AuditLogEntry, 'id'>): void {
    AuditService.recordEvent(entry);
  }

  static getSettings(): WorkspaceSettings {
    return SettingService.getSettings();
  }

  static updateSettings(settings: Partial<WorkspaceSettings>): WorkspaceSettings {
    return SettingService.updateSettings(settings);
  }

  static resetDemoData(): void {
    if (!isClientEnvironment()) return;
    safeLocalStorageRemove(STORAGE_KEYS.DOCUMENTS);
    safeLocalStorageRemove(STORAGE_KEYS.AUDIT);
    safeLocalStorageRemove(STORAGE_KEYS.CURRENT_USER);
    safeLocalStorageRemove(STORAGE_KEYS.SETTINGS);
    safeLocalStorageRemove(STORAGE_KEYS.MEMBERS);
    safeLocalStorageRemove(STORAGE_KEYS.BATCHES);
    safeLocalStorageRemove(STORAGE_KEYS.INTEGRATIONS);

    safeLocalStorageSet(STORAGE_KEYS.DOCUMENTS, INITIAL_MOCK_DOCUMENTS);
    safeLocalStorageSet(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    safeLocalStorageSet(STORAGE_KEYS.CURRENT_USER, DEMO_PERSONAS.finance_supervisor);
    safeLocalStorageSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    safeLocalStorageSet(STORAGE_KEYS.MEMBERS, INITIAL_RBAC_USERS);
    safeLocalStorageSet(STORAGE_KEYS.BATCHES, INITIAL_BATCH_ITEMS);
    safeLocalStorageSet(STORAGE_KEYS.INTEGRATIONS, INITIAL_INTEGRATION_ENDPOINTS);
  }
}
