import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | DokumenAI Enterprise',
  description: 'Komitmen perlindungan data finansial, kepatuhan privasi UU PDP No. 27/2022, dan standar keamanan ISO 27001 di DokumenAI Enterprise.',
};

export default function PrivacyPage() {
  return (
    <MarketingPageTemplate
      title="Kebijakan Privasi & Tata Kelola Data Finansial"
      subtitle="Perlindungan Data & Kepatuhan Privasi"
      description="DokumenAI Enterprise berkomitmen melindungi privasi dan kerahasiaan dokumen finansial perusahaan Anda melalui standar keamanan internasional dan regulasi perlindungan data yang berlaku di Indonesia."
      points={[
        {
          title: 'Kepatuhan Regulasi UU PDP No. 27/2022',
          desc: 'Seluruh pemrosesan dokumen dan data pribadi dalam berkas finansial tunduk pada asas kepatuhan Undang-Undang Pelindungan Data Pribadi (UU PDP) serta standar perlindungan privasi global.',
          image: '/images/cards/solutions-spt.webp',
          tag: 'Regulasi Nasional',
          badge: 'UU PDP 27/2022',
          actionText: 'Tinjau Standar Keamanan',
          actionHref: '/security',
        },
        {
          title: 'Prinsip Nol Pelatihan AI Publik (Zero Data Retention for AI Training)',
          desc: 'Dokumen faktur, nota, dan rincian transaksi Anda tidak pernah digunakan untuk melatih model AI publik pihak ketiga. Data finansial sepenuhnya tetap menjadi hak milik intelektual dan kerahasiaan organisasi Anda.',
          image: '/images/cards/security-demo.webp',
          tag: 'Privasi AI',
          badge: 'Zero AI Training',
          actionText: 'Lihat Arsitektur Produk',
          actionHref: '/product',
        },
        {
          title: 'Enkripsi Data Berlapis (AES-256 & TLS 1.3)',
          desc: 'Setiap berkas dokumen yang diunggah dienkripsi saat transit menggunakan TLS 1.3 dan saat disimpan (at-rest) menggunakan enkripsi berstandar perbankan AES-256.',
          image: '/images/cards/security-audit-trail.webp',
          tag: 'Kriptografi',
          badge: 'AES-256 & TLS 1.3',
          actionText: 'Pelajari Fitur Keamanan',
          actionHref: '/security',
        },
        {
          title: 'Kendali Hak Subjek Data & Retensi Terjadwal',
          desc: 'Organisasi Anda memiliki kontrol penuh untuk mengekspor arsip data, mengatur siklus masa retensi berkas, atau meminta penghapusan permanen dari sistem penyimpanan terisolasi.',
          image: '/images/cards/product-formats.webp',
          tag: 'Kontrol Data',
          badge: 'Retensi Terjadwal',
          actionText: 'Eksplor Repositori Dokumen',
          actionHref: '/demo/dashboard/documents',
        },
        {
          title: 'Pemisahan Hak Akses Berbasis Peran (RBAC)',
          desc: 'Hanya personel terotorisasi dengan peran yang sesuai (Admin CISO, Finance Lead, atau Reviewer) yang dapat melihat dan memverifikasi dokumen finansial tertentu sesuai kebijakan organisasi.',
          image: '/images/cards/security-rbac.webp',
          tag: 'Otorisasi Peran',
          badge: 'RBAC Strict',
          actionText: 'Kelola Akses RBAC',
          actionHref: '/demo/dashboard/users',
        },
        {
          title: 'Jalur Audit Forensik yang Transparan',
          desc: 'Setiap akses baca, ekspor, dan verifikasi dokumen dicatat secara rinci dalam audit trail forensik dengan timestamp presisi milidetik, alamat IP, dan identitas aktor yang tidak dapat dimanipulasi.',
          image: '/images/cards/features-audit.webp',
          tag: 'Audit Log',
          badge: 'Immutable Log',
          actionText: 'Buka Log Audit',
          actionHref: '/demo/dashboard/audit',
        },
      ]}
    />
  );
}

