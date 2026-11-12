import { STORAGE_KEYS, isClientEnvironment, safeLocalStorageGet, safeLocalStorageSet } from '../storage.base';
import { DocumentType } from '@/types';
import { AuditService } from '../audit/audit.service';

export interface BatchItemDraft {
  id: string;
  fileName: string;
  fileSize: number;
  documentType: DocumentType;
  vendorName: string;
  fileNumber: string;
  nominal: number;
  currency?: string;
  status: 'draft' | 'ready' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  companyId?: string;
  department?: string;
}

export const INITIAL_BATCH_ITEMS: BatchItemDraft[] = [
  {
    id: 'batch-draft-01',
    fileName: 'Faktur_Maret_PT_Telkom.pdf',
    fileSize: 2450000,
    documentType: 'tax_invoice',
    vendorName: 'PT Telkom Prima Nusantara',
    fileNumber: '010.002-26.99410123',
    nominal: 35000000,
    currency: 'IDR',
    status: 'ready',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'batch-draft-02',
    fileName: 'PO_Vendor_Logistik_Jawa.pdf',
    fileSize: 1820000,
    documentType: 'purchase_order',
    vendorName: 'PT Jawa Angkutan Express',
    fileNumber: 'PO-2026-03-8821',
    nominal: 14250000,
    currency: 'IDR',
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

export class BatchService {
  static getBatches(): BatchItemDraft[] {
    if (!isClientEnvironment()) return INITIAL_BATCH_ITEMS;
    const stored = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (stored === null) {
      safeLocalStorageSet(STORAGE_KEYS.BATCHES, INITIAL_BATCH_ITEMS);
      return INITIAL_BATCH_ITEMS;
    }
    return safeLocalStorageGet<BatchItemDraft[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCH_ITEMS);
  }

  static addBatchDraft(
    item: Omit<BatchItemDraft, 'id' | 'createdAt'>,
    actorName = 'Operator Batch'
  ): { success: boolean; item: BatchItemDraft } {
    const batches = this.getBatches();
    const newItem: BatchItemDraft = {
      ...item,
      id: `batch-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    batches.unshift(newItem);
    safeLocalStorageSet(STORAGE_KEYS.BATCHES, batches);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'document_reviewer',
      action: 'BATCH_DRAFT_CREATED' as any,
      resourceType: 'system' as any,
      resourceId: newItem.id,
      resourceName: newItem.fileName,
      details: `Menambahkan draf batch berkas: ${newItem.fileName} (${newItem.vendorName})`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, item: newItem };
  }

  static updateBatchDraft(
    id: string,
    updates: Partial<Omit<BatchItemDraft, 'id' | 'createdAt'>>,
    actorName = 'Operator Batch'
  ): { success: boolean; item?: BatchItemDraft; error?: string } {
    const batches = this.getBatches();
    const index = batches.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, error: 'Draf batch tidak ditemukan.' };
    }

    const updated = { ...batches[index], ...updates };
    batches[index] = updated;
    safeLocalStorageSet(STORAGE_KEYS.BATCHES, batches);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'document_reviewer',
      action: 'BATCH_DRAFT_UPDATED' as any,
      resourceType: 'system' as any,
      resourceId: updated.id,
      resourceName: updated.fileName,
      details: `Memperbarui parameter draf batch: ${updated.fileName}`,
      status: 'success',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true, item: updated };
  }

  static deleteBatchDraft(id: string, actorName = 'Operator Batch'): { success: boolean; error?: string } {
    const batches = this.getBatches();
    const target = batches.find((b) => b.id === id);
    if (!target) return { success: false, error: 'Draf batch tidak ditemukan.' };

    const filtered = batches.filter((b) => b.id !== id);
    safeLocalStorageSet(STORAGE_KEYS.BATCHES, filtered);

    AuditService.recordEvent({
      actor: actorName,
      actorRole: 'document_reviewer',
      action: 'BATCH_DRAFT_DELETED' as any,
      resourceType: 'system' as any,
      resourceId: target.id,
      resourceName: target.fileName,
      details: `Menghapus draf batch berkas: ${target.fileName}`,
      status: 'warning',
      ipAddress: '127.0.0.1 (Web Demo)',
    });

    return { success: true };
  }
}

