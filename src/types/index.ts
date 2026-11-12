export type DocumentType = 
  | 'tax_invoice'      // e-Faktur Pajak Indonesia
  | 'commercial_invoice'
  | 'purchase_order'
  | 'delivery_order'
  | 'receipt'
  | 'contract'
  | 'withholding_tax'; // Bukti Potong PPh

export type DocumentStatus = 
  | 'queued'
  | 'preprocessing'
  | 'ocr_processing'
  | 'field_extraction'
  | 'schema_validation'
  | 'needs_review'
  | 'approved'
  | 'rejected'
  | 'failed';

export type UserRole = 
  | 'super_admin'
  | 'finance_supervisor'
  | 'document_reviewer'
  | 'auditor';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  department: string;
  permissions: string[];
}

export interface RBACMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitle: string;
  avatar?: string;
  department: string;
  permissions: string[];
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

export interface BoundingBox {
  page: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
}

export interface ExtractedField {
  id: string;
  key: string;
  label: string;
  value: string | number;
  originalValue: string | number;
  confidence: number; // 0.0 - 1.0
  isEdited: boolean;
  isRequired: boolean;
  validationStatus: 'valid' | 'warning' | 'error';
  validationMessage?: string;
  boundingBox?: BoundingBox;
  category: 'header' | 'vendor' | 'customer' | 'tax' | 'amount' | 'metadata';
}

export interface LineItem {
  id: string;
  itemNumber: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface DocumentReviewNote {
  id: string;
  author: string;
  authorRole: string;
  timestamp: string;
  message: string;
  type: 'note' | 'correction_request' | 'system_alert';
}

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | string;

export interface MonetaryValue {
  amount: number;
  currency: CurrencyCode;
  amountString?: string;
  formatted?: string;
}

export interface DocumentRecord {
  id: string;
  fileNumber: string; // e.g. INV-2026-0891 or 010.002-26.00000001
  title: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: 'application/pdf' | 'image/png' | 'image/jpeg';
  documentType: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  verifiedAt?: string;
  vendorName: string;
  vendorTaxId?: string; // NPWP
  currency: CurrencyCode;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  taxRatePercent?: number; // e.g. 11 or 12 or custom
  confidence: number; // Overall confidence 0-100
  processingTimeMs: number;
  assignedReviewer?: string;
  isSimulatedAI: true; // Mandatory transparency flag
  extractionProfile: string;
  previewUrl: string;
  fields: ExtractedField[];
  lineItems: LineItem[];
  notes: DocumentReviewNote[];
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    details?: string;
  }[];
  tags: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole | string;
  action: string;
  resourceType: 'document' | 'workspace_settings' | 'export' | 'user' | 'api_key' | 'system' | 'batch' | string;
  resourceId: string;
  resourceName: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  status: 'success' | 'warning' | 'failure';
  ipAddress: string;
}

export interface ExportMappingTemplate {
  id: string;
  name: string;
  description: string;
  format: 'csv' | 'json' | 'xlsx' | 'zip';
  systemTarget: 'generic_accounting' | 'sap' | 'oracle' | 'dynamics' | 'indonesian_tax_djp';
  columnMappings: {
    sourceKey: string;
    targetColumn: string;
    transform?: string;
  }[];
}

export type WebhookHttpMethod = 'POST' | 'GET';
export type WebhookAuthType = 'none' | 'bearer' | 'api_key' | 'basic' | 'hmac';
export type WebhookBodyFormat = 'json' | 'form_data' | 'raw';

export interface WebhookHeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  isSecret?: boolean;
}

export interface WebhookParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface WebhookAuthConfig {
  type: WebhookAuthType;
  bearerToken?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyPlacement?: 'header' | 'query';
  basicUsername?: string;
  basicPassword?: string;
  hmacSecret?: string;
  hmacHeader?: string;
}

export interface WebhookConfig {
  url: string;
  method: WebhookHttpMethod;
  events: string[];
  headers: WebhookHeaderItem[];
  params: WebhookParamItem[];
  bodyFormat: WebhookBodyFormat;
  rawBody: string;
  auth: WebhookAuthConfig;
}

export interface WorkspaceSettings {
  workspaceName: string;
  companyName: string;
  taxId: string; // NPWP Perusahaan
  defaultCurrency: 'IDR' | 'USD' | 'EUR';
  locale: 'id-ID' | 'en-US';
  timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura';
  autoApproveConfidenceThreshold: number; // e.g. 95%
  enableDuplicateDetection: boolean;
  defaultTaxRatePercent: number; // 11
  notificationEmail: string;
  webhookUrl: string;
  webhookConfig?: WebhookConfig;
}

