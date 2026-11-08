import { UserPersona } from '@/types';

export const DEMO_PERSONAS: Record<string, UserPersona> = {
  super_admin: {
    id: 'user-01',
    name: 'Budi Santoso, S.Kom., M.T.',
    email: 'budi.santoso@nusantara-tech.co.id',
    role: 'super_admin',
    roleTitle: 'Chief Information & Security Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Enterprise IT & Security',
    permissions: ['all', 'admin', 'manage_users', 'system_config', 'approve_any', 'export_all'],
  },
  finance_supervisor: {
    id: 'user-02',
    name: 'Dewi Lestari, S.E., Ak., CA',
    email: 'dewi.lestari@nusantara-tech.co.id',
    role: 'finance_supervisor',
    roleTitle: 'Finance & Tax Operations Supervisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Finance, AP & Tax',
    permissions: ['view_dashboard', 'verify_documents', 'approve_documents', 'reject_documents', 'export_reports', 'manage_workflows'],
  },
  document_reviewer: {
    id: 'user-03',
    name: 'Rizky Pratama',
    email: 'rizky.pratama@nusantara-tech.co.id',
    role: 'document_reviewer',
    roleTitle: 'Senior Document Verification Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Accounts Payable Operation',
    permissions: ['view_dashboard', 'upload_documents', 'verify_documents', 'edit_fields', 'save_draft'],
  },
  auditor: {
    id: 'user-04',
    name: 'Siti Rahmawati, S.Ak., CISA',
    email: 'siti.rahmawati@audit-indonesia.id',
    role: 'auditor',
    roleTitle: 'External Compliance & Tax Auditor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Risk Management & Audit',
    permissions: ['view_dashboard', 'view_all_documents', 'view_audit_trail', 'export_audit_logs'],
  },
};

export const FICTIONAL_VENDORS = [
  {
    name: 'PT Telkom Prima Nusantara',
    npwp: '01.345.678.9-012.000',
    address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan 12190',
    category: 'Telekomunikasi & Cloud',
  },
  {
    name: 'PT Graha Logistik Indonesia',
    npwp: '02.987.654.3-054.000',
    address: 'Kawasan Industri MM2100 Blok C-4, Cikarang Barat, Bekasi 17520',
    category: 'Logistik & Pengiriman',
  },
  {
    name: 'CV Sinar Mandiri Stationery',
    npwp: '03.112.233.4-081.000',
    address: 'Jl. Gajah Mada No. 108, Krukut, Tamansari, Jakarta Barat 11140',
    category: 'Perlengkapan Kantor',
  },
  {
    name: 'PT Mitra Solusi Digital Nusantara',
    npwp: '01.888.777.6-023.000',
    address: 'Menara Astra Lt. 32, Jl. Jend. Sudirman Kav. 5, Jakarta Pusat 10220',
    category: 'Software & Lisensi SaaS',
  },
  {
    name: 'PT Energi Surya Bersama',
    npwp: '04.555.666.7-045.000',
    address: 'The Energy Building Lt. 15, SCBD Lot 11A, Jakarta Selatan 12190',
    category: 'Utilitas & Energi',
  },
  {
    name: 'PT Kharisma Hardware Solusindo',
    npwp: '02.444.333.2-016.000',
    address: 'Kompleks Ruko Mangga Dua Mall No. 12B, Sawah Besar, Jakarta Pusat 10730',
    category: 'Perangkat Keras & Server',
  },
];

