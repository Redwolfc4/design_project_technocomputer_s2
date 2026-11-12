import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function SecurityPage() {
  return (
    <MarketingPageTemplate
      title="Keamanan, Kepatuhan & Transparansi Simulasi"
      subtitle="Komitmen Keamanan"
      description="Prinsip perlindungan data finansial tingkat enterprise dengan pemisahan tugas berbasis peran (RBAC) dan audit forensik."
      points={[
        {
          title: 'Transparansi Simulasi Demo',
          desc: 'Aplikasi ini adalah demonstrasi interaktif berstandar komersial. Seluruh data vendor dan dokumen adalah fiktif demi keamanan.',
          image: '/images/cards/security-demo.webp',
          tag: 'Simulasi Aman',
          badge: 'Safe Sandbox',
          actionText: 'Eksplor Data Demo',
          actionHref: '/demo/login',
        },
        {
          title: 'Role-Based Access Control (RBAC)',
          desc: 'Pemisahan ketat hak unggah, review verifikasi, persetujuan nominal, dan hak akses auditor eksternal.',
          image: '/images/cards/security-rbac.webp',
          tag: 'Manajemen Akses',
          badge: 'Pemisahan Peran',
          actionText: 'Kelola Role & User',
          actionHref: '/demo/dashboard/users',
        },
        {
          title: 'Jalur Audit Tanpa Celah',
          desc: 'Pencatatan setiap interaksi dokumen dengan informasi aktor, peran, alamat IP, dan nilai sebelum vs sesudah perubahan.',
          image: '/images/cards/security-audit-trail.webp',
          tag: 'Kepatuhan Regulasi',
          badge: 'Audit Trail 90 Hari',
          actionText: 'Buka Log Audit',
          actionHref: '/demo/dashboard/audit',
        },
        {
          title: 'Kesiapan On-Premise & Cloud Terisolasi',
          desc: 'Arsitektur modular siap dihubungkan ke penyimpanan objek privat perusahaan (S3 / Azure Blob) dan PostgreSQL.',
          image: '/images/cards/security-onprem.webp',
          tag: 'Infrastruktur Privat',
          badge: 'Private VPC & S3',
          actionText: 'Tinjau Arsitektur',
          actionHref: '/product',
        },
      ]}
    />
  );
}

