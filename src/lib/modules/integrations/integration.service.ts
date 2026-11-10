import { STORAGE_KEYS, isClientEnvironment, safeLocalStorageGet, safeLocalStorageSet } from '../storage.base';
import { AuditService } from '../audit/audit.service';

export interface IntegrationEndpoint {
  id: string;
  name: string;
  systemType: 'sap' | 'oracle' | 'djp_tax' | 'accurate' | 'generic';
  endpointUrl: string;
  authMethod: 'bearer' | 'basic' | 'apiKey';
  format: 'json' | 'csv' | 'xml';
  status: 'active' | 'inactive';
  lastSyncAt?: string;
  createdAt: string;
}

export const INITIAL_INTEGRATION_ENDPOINTS: IntegrationEndpoint[] = [
  {
    id: 'int-001',
    name: 'SAP S/4HANA Finance Connector',
    systemType: 'sap',
    endpointUrl: 'https://sap-gateway.nusantara-tech.co.id/api/v2/invoices',
    authMethod: 'bearer',
    format: 'json',
    status: 'active',
    lastSyncAt: '2026-03-04T08:30:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'int-002',
    name: 'DJP e-Faktur Pajak Gateway',
    systemType: 'djp_tax',
    endpointUrl: 'https://efaktur.pajak.go.id/api/v1/sync',
    authMethod: 'apiKey',
    format: 'csv',
    status: 'active',
    lastSyncAt: '2026-03-03T16:00:00Z',
    createdAt: '2026-01-20T00:00:00Z',
  },
];

export class IntegrationService {
  static getIntegrations(): IntegrationEndpoint[] {
    if (!isClientEnvironment()) return INITIAL_INTEGRATION_ENDPOINTS;
    const stored = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.INTEGRATIONS, INITIAL_INTEGRATION_ENDPOINTS);
      return INITIAL_INTEGRATION_ENDPOINTS;
    }
    return safeLocalStorageGet<IntegrationEndpoint[]>(STORAGE_KEYS.INTEGRATIONS, INITIAL_INTEGRATION_ENDPOINTS);
  }

  static addIntegration(
    data: Omit<IntegrationEndpoint, 'id' | 'createdAt'>,
    actorName = 'Enterprise Architect'
  ): { success: boolean; integration: IntegrationEndpoint } {
    const list = this.getIntegrations();
    const item: IntegrationEndpoint = {
      ...data,
      id: `int-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    safeLocalStorageSet(STORAGE_KEYS.INTEGRATIONS, list);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'INTEGRATION_CREATED' as any,
      resourceType: 'system' as any,
      resourceId: item.id,
      resourceName: item.name,
      details: `Menambahkan konfigurasi konektor integrasi: ${item.name} (${item.systemType})`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, integration: item };
  }

  static updateIntegration(
    id: string,
    updates: Partial<Omit<IntegrationEndpoint, 'id' | 'createdAt'>>,
    actorName = 'Enterprise Architect'
  ): { success: boolean; integration?: IntegrationEndpoint; error?: string } {
    const list = this.getIntegrations();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) {
      return { success: false, error: 'Konfigurasi integrasi tidak ditemukan.' };
    }

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    safeLocalStorageSet(STORAGE_KEYS.INTEGRATIONS, list);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'INTEGRATION_UPDATED' as any,
      resourceType: 'system' as any,
      resourceId: updated.id,
      resourceName: updated.name,
      details: `Memperbarui endpoint integrasi: ${updated.name}`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, integration: updated };
  }

  static deleteIntegration(id: string, actorName = 'Enterprise Architect'): { success: boolean; error?: string } {
    const list = this.getIntegrations();
    const target = list.find((i) => i.id === id);
    if (!target) return { success: false, error: 'Integrasi tidak ditemukan.' };

    const filtered = list.filter((i) => i.id !== id);
    safeLocalStorageSet(STORAGE_KEYS.INTEGRATIONS, filtered);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'super_admin',
      action: 'INTEGRATION_DELETED' as any,
      resourceType: 'system' as any,
      resourceId: target.id,
      resourceName: target.name,
      details: `Menghapus konfigurasi integrasi: ${target.name}`,
      status: 'warning',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true };
  }
}

