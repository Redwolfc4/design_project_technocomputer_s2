import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Karir & Budaya Kerja | PT Nusantara Teknologi Cipta Tbk',
  description: 'Bergabunglah dengan tim engineering dan riset AI di PT Nusantara Teknologi Cipta Tbk. Membuka peluang karir untuk talenta terbaik bangsa.',
};

export default function CareersPage() {
  return (
    <MarketingPageTemplate
      title="Bangun Masa Depan Otomasi Dokumen Cerdas Bersama Kami"
      subtitle="Karir & Budaya Kerja (Hiring)"
      description="Kami membuka pintu bagi para inovator, machine learning engineers, fullstack developers, dan arsitek enterprise yang bersemangat memecahkan masalah otomasi finansial riil berskala masif."
      points={[
        {
          title: 'Budaya Kerja Inovatif & Eksplorasi Terbuka',
          desc: 'Lingkungan teknik yang modern dengan prinsip autonomy, mastery, dan purpose. Kami mengadopsi stack terkini (Bun, Next.js, PyTorch, Go) dan mengutamakan clean architecture.',
          image: '/images/cards/careers-culture.webp',
          tag: 'Budaya Kerja',
          badge: 'High Impact',
          actionText: 'Lihat Lingkup Kerja',
          actionHref: '/about',
        },
        {
          title: 'Senior AI / Computer Vision Engineer',
          desc: 'Memimpin perancangan dan optimalisasi model OCR deep learning untuk ekstraksi data semi-terstruktur pada pindaian faktur dan dokumen transaksi berkualitas rendah.',
          image: '/images/cards/careers-openings.webp',
          tag: 'Lowongan Aktif',
          badge: 'Engineering',
          actionText: 'Daftar Sekarang',
          actionHref: '/login',
        },
        {
          title: 'Fullstack & Enterprise Solution Architect',
          desc: 'Mengembangkan antarmuka verifikasi cerdas Human-in-the-Loop berkecepatan tinggi serta adaptor integrasi API real-time dengan SAP S/4HANA dan Oracle ERP.',
          image: '/images/cards/features-export.webp',
          tag: 'Lowongan Aktif',
          badge: 'Fullstack',
          actionText: 'Daftar Sekarang',
          actionHref: '/login',
        },
        {
          title: 'Kompensasi Kompetitif & Pengembangan Karir',
          desc: 'Paket remunerasi menarik, kepemilikan opsi saham (ESOP) bagi talenta kunci, tunjangan kesehatan keluarga menyeluruh, dan alokasi anggaran pembelajaran tahunan.',
          image: '/images/cards/pricing-enterprise.webp',
          tag: 'Benefit & Tunjangan',
          badge: 'ESOP & Health',
          actionText: 'Hubungi Tim HR',
          actionHref: '/investors',
        },
      ]}
    />
  );
}

