import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan | DokumenAI Enterprise',
  description: 'Ketentuan penggunaan platform ekstraksi faktur cerdas, hak dan tanggung jawab organisasi, serta lisensi DokumenAI Enterprise.',
};

export default function TermsPage() {
  return (
    <MarketingPageTemplate
      title="Syarat & Ketentuan Layanan Enterprise"
      subtitle="Perjanjian Penggunaan Platform"
      description="Syarat dan ketentuan ini mengatur hak, kewajiban, serta batasan hukum dalam penggunaan platform pemrosesan dokumen otomatis DokumenAI Enterprise oleh organisasi dan pengguna terdaftar."
      points={[
        {
          title: 'Ruang Lingkup Lisensi Enterprise',
          desc: 'DokumenAI Enterprise memberikan lisensi non-eksklusif bagi organisasi Anda untuk memanfaatkan mesin OCR cerdas, modul antrean verifikasi faktur, dan integrasi ekspor ERP sesuai paket langganan aktif.',
          image: '/images/cards/pricing-enterprise.webp',
          tag: 'Lisensi Komersial',
          badge: 'Enterprise Tier',
          actionText: 'Lihat Paket Lisensi',
          actionHref: '/pricing',
        },
        {
          title: 'Tanggung Jawab Akun & Tata Kelola Pengguna',
          desc: 'Organisasi bertanggung jawab penuh atas pengelolaan kredensial akun para staf, penugasan hak akses RBAC, serta kepatuhan internal terhadap data kredensial akses yang diberikan.',
          image: '/images/cards/pricing-business.webp',
          tag: 'Tata Kelola',
          badge: 'Governance',
          actionText: 'Kelola Peran Pengguna',
          actionHref: '/demo/dashboard/users',
        },
        {
          title: 'Prinsip Validasi Human-in-the-Loop (HITL)',
          desc: 'Meskipun model AI memberikan tingkat akurasi tinggi, sistem dirancang untuk mengarahkan dokumen yang ambigu ke antrean verifikasi manual. Verifikator manusia memegang persetujuan akhir sebelum data diekspor ke sistem pembukuan.',
          image: '/images/cards/features-workspace.webp',
          tag: 'Verifikasi AI',
          badge: 'HITL Approval',
          actionText: 'Coba Workspace Verifikasi',
          actionHref: '/demo/dashboard/verification',
        },
        {
          title: 'Kepatuhan & Integritas Audit Trail',
          desc: 'Pengguna dilarang melakukan upaya rekayasa balik, pembobolan batasan sandbox, atau manipulasi terhadap pencatatan log audit forensik yang disediakan oleh sistem.',
          image: '/images/cards/security-rbac.webp',
          tag: 'Integritas Sistem',
          badge: 'Anti-Tamper',
          actionText: 'Buka Log Audit',
          actionHref: '/demo/dashboard/audit',
        },
        {
          title: 'Ketersediaan Layanan & Pembaruan Sistem',
          desc: 'Layanan disediakan dengan jaminan Service Level Agreement (SLA) enterprise. Pembaruan dan perbaikan sistem rutin dijadwalkan dengan pemberitahuan awal guna meminimalkan disrupsi operasional.',
          image: '/images/cards/features-export.webp',
          tag: 'Keandalan Cloud',
          badge: 'SLA 99.9%',
          actionText: 'Cek Jaminan SLA',
          actionHref: '/sla',
        },
        {
          title: 'Yurisdiksi & Penyelesaian Sengketa',
          desc: 'Perjanjian layanan ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia. Segala perselisihan diselesaikan melalui musyawarah mufakat atau forum arbitrase yang disepakati bersama.',
          image: '/images/cards/solutions-spt.webp',
          tag: 'Hukum & Kepatuhan',
          badge: 'Hukum Indonesia',
          actionText: 'Lihat Komitmen Privasi',
          actionHref: '/privacy',
        },
      ]}
    />
  );
}

