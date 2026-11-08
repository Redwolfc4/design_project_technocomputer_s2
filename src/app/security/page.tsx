import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function SecurityPage() {
  return (
    <MarketingPageTemplate
      title="Keamanan, Kepatuhan & Transparansi Simulasi"
      subtitle="Komitmen Keamanan"
      description="Prinsip perlindungan data finansial tingkat enterprise dengan pemisahan tugas berbasis peran (RBAC) dan audit forensik."
      points={[
        { title: 'Transparansi Simulasi Demo', desc: 'Aplikasi ini adalah demonstrasi interaktif berstandar komersial. Seluruh data vendor dan dokumen adalah fiktif demi keamanan.' },
        { title: 'Role-Based Access Control (RBAC)', desc: 'Pemisahan ketat hak unggah, review verifikasi, persetujuan nominal, dan hak akses auditor eksternal.' },
        { title: 'Jalur Audit Tanpa Celah', desc: 'Pencatatan setiap interaksi dokumen dengan informasi aktor, peran, alamat IP, dan nilai sebelum vs sesudah perubahan.' },
        { title: 'Kesiapan On-Premise & Cloud Terisolasi', desc: 'Arsitektur modular siap dihubungkan ke penyimpanan objek privat perusahaan (S3 / Azure Blob) dan PostgreSQL.' },
      ]}
    />
  );
}

