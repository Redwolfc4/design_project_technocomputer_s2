import { WorkspaceSettings } from '@/types';
import { STORAGE_KEYS, isClientEnvironment, safeLocalStorageGet, safeLocalStorageSet } from '../storage.base';
import { AuditService } from '../audit/audit.service';

export const INITIAL_SETTINGS: WorkspaceSettings = {
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

export class SettingService {
  static getSettings(): WorkspaceSettings {
    if (!isClientEnvironment()) return INITIAL_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return safeLocalStorageGet<WorkspaceSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  static updateSettings(
    updates: Partial<WorkspaceSettings>,
    actorName = 'Administrator Sistem'
  ): WorkspaceSettings {
    const current = this.getSettings();
    const updated: WorkspaceSettings = { ...current, ...updates };

    if (isClientEnvironment()) {
      safeLocalStorageSet(STORAGE_KEYS.SETTINGS, updated);

      AuditService.recordEvent({
        actor: actorName,
        actorRole: 'super_admin',
        action: 'SETTINGS_UPDATED' as any,
        resourceType: 'system' as any,
        resourceId: 'workspace-cfg',
        resourceName: updated.workspaceName,
        details: 'Memperbarui parameter konfigurasi workspace enterprise & ambang batas AI',
        status: 'success',
        ipAddress: '127.0.0.1 (Web Demo)',
      });
    }

    return updated;
  }
}

