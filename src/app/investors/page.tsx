import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Hubungan Investor & Media | PT Nusantara Teknologi Cipta Tbk',
  description: 'Informasi kinerja keuangan, keterbukaan informasi emiten, tata kelola korporasi, dan siaran pers resmi PT Nusantara Teknologi Cipta Tbk.',
};

export default function InvestorsPage() {
  return (
    <MarketingPageTemplate
      title="Transparansi Kinerja, Pertumbuhan Finansial & Ruang Media Perseroan"
      subtitle="Hubungan Investor & Media"
      description="Portal resmi keterbukaan informasi PT Nusantara Teknologi Cipta Tbk bagi seluruh pemegang saham, investor institusi, regulator, dan rekan media massa."
      points={[
        {
          title: 'Kinerja Finansial & Pertumbuhan Pendapatan Berulang (ARR)',
          desc: 'Laporan pertumbuhan tahunan yang solid didorong oleh perluasan adopsi platform DokumenAI Enterprise di berbagai sektor korporasi terkemuka di tanah air.',
          image: '/images/cards/investors-growth.webp',
          tag: 'Kinerja Finansial',
          badge: 'Solid ARR Growth',
          actionText: 'Lihat Paket Bisnis',
          actionHref: '/pricing',
        },
        {
          title: 'Keterbukaan Informasi & Kepatuhan Pasar Modal',
          desc: 'Penyampaian laporan berkala, aksi korporasi terencana, dan keterbukaan fakta material secara tepat waktu sesuai peraturan OJK dan regulasi Bursa Efek.',
          image: '/images/cards/investors-governance.webp',
          tag: 'Kepatuhan Regulasi',
          badge: 'OJK & IDX Compliant',
          actionText: 'Struktur Tata Kelola',
          actionHref: '/leadership',
        },
        {
          title: 'Ruang Siaran Pers & Arsip Berita Resmi',
          desc: 'Akses siaran pers terverifikasi mengenai kemitraan strategis, peluncuran kapabilitas AI generasi terbaru, dan pencapaian operasional perseroan.',
          image: '/images/cards/features-audit.webp',
          tag: 'Siaran Media',
          badge: 'Press Releases',
          actionText: 'Pusat Keamanan Kami',
          actionHref: '/security',
        },
        {
          title: 'Kontak Hubungan Investor & Sekretariat Perusahaan',
          desc: 'Saluran komunikasi langsung bagi analis pasar, manajer investasi, dan media untuk mendapatkan klarifikasi atau menjadwalkan audiensi korporasi.',
          image: '/images/cards/pricing-starter.webp',
          tag: 'Sekretariat Perusahaan',
          badge: 'IR Direct Line',
          actionText: 'Hubungi Sekretariat',
          actionHref: '/about',
        },
      ]}
    />
  );
}

