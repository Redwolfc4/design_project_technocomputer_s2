import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Dewan Direksi & Manajemen | PT Nusantara Teknologi Cipta Tbk',
  description: 'Profil kepemimpinan eksekutif dan dewan komisaris PT Nusantara Teknologi Cipta Tbk yang berpengalaman di bidang Fintech, Keamanan Siber, dan AI.',
};

export default function LeadershipPage() {
  return (
    <MarketingPageTemplate
      title="Dipimpin Praktisi Berpengalaman di FinTech, Keamanan Siber & Kecerdasan Buatan"
      subtitle="Dewan Direksi & Manajemen"
      description="Jajaran pimpinan eksekutif dan dewan pengawas kami menggabungkan keahlian mendalam di industri perbankan nasional, arsitektur komputasi skala masif, dan tata kelola korporasi yang transparan."
      points={[
        {
          title: 'Kepemimpinan Eksekutif & Tata Kelola (GCG)',
          desc: 'Dikelola oleh para eksekutif berlatar belakang kepemimpinan teknologi finansial dan enterprise B2B dengan rekam jejak sukses membangun solusi skala nasional.',
          image: '/images/cards/leadership-board.webp',
          tag: 'Direksi Eksekutif',
          badge: 'GCG Compliance',
          actionText: 'Pelajari Tata Kelola',
          actionHref: '/investors',
        },
        {
          title: 'Tim Peneliti & Perekayasa Machine Learning',
          desc: 'Dipimpin oleh doktor dan praktisi AI spesialis Computer Vision serta NLP yang fokus pada pengenalan teks berderau tinggi dan parsing faktur kompleks.',
          image: '/images/cards/leadership-tech.webp',
          tag: 'Riset & Teknologi',
          badge: 'AI Lab Nusantara',
          actionText: 'Teknologi IDP Kami',
          actionHref: '/features',
        },
        {
          title: 'Komite Audit & Kepatuhan Keamanan Informasi',
          desc: 'Pengawasan ketat terhadap standar keamanan informasi oleh profesional bersertifikasi CISA dan CISSP demi menjamin integritas jalur audit forensik.',
          image: '/images/cards/security-audit-trail.webp',
          tag: 'Pengawasan Audit',
          badge: 'CISA & CISSP',
          actionText: 'Arsitektur Keamanan',
          actionHref: '/security',
        },
        {
          title: 'Pengembangan Budaya Inovasi Talenta Lokal',
          desc: 'Komitmen manajemen dalam membina talenta rekayasa perangkat lunak terbaik Indonesia untuk menciptakan kemandirian teknologi bangsa.',
          image: '/images/cards/careers-culture.webp',
          tag: 'Budaya Kerja',
          badge: 'Top Talents',
          actionText: 'Karir di DokumenAI',
          actionHref: '/careers',
        },
      ]}
    />
  );
}

