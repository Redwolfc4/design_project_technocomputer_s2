import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Tentang Perusahaan | PT Nusantara Teknologi Cipta Tbk',
  description: 'Mengenal PT Nusantara Teknologi Cipta Tbk, pelopor platform Intelligent Document Processing (IDP) dan kedaulatan otomasi AI finansial di Indonesia.',
};

export default function AboutPage() {
  return (
    <MarketingPageTemplate
      title="Memimpin Revolusi Otomasi Dokumen & Kecerdasan Finansial di Indonesia"
      subtitle="Tentang Perusahaan & Inovasi"
      description="PT Nusantara Teknologi Cipta Tbk adalah perusahaan teknologi nasional yang berdedikasi membangun platform pemrosesan dokumen cerdas bertenaga AI untuk mentransformasi operasional akuntansi, perpajakan, dan rantai pasok korporasi Indonesia."
      points={[
        {
          title: 'Visi Pelopor Kedaulatan AI Finansial',
          desc: 'Mengembangkan model kecerdasan buatan berbasis deep learning yang memahami secara mendalam tata kelola dokumen finansial, regulasi e-Faktur DJP, dan ekosistem bisnis nasional.',
          image: '/images/cards/about-vision.webp',
          tag: 'Visi Korporasi',
          badge: 'Pelopor IDP',
          actionText: 'Lihat Solusi Finansial',
          actionHref: '/solutions',
        },
        {
          title: 'Infrastruktur Komputasi Lokal & Kepatuhan Penuh',
          desc: 'Menjamin kedaulatan data finansial melalui dukungan penempatan server lokal di Indonesia (data center tier-3) maupun deployment on-premise private cloud bersertifikasi ISO 27001.',
          image: '/images/cards/about-compliance.webp',
          tag: 'Kedaulatan Data',
          badge: 'ISO 27001 & UU PDP',
          actionText: 'Standar Kepatuhan',
          actionHref: '/security',
        },
        {
          title: 'Adaptasi Teruji Sektor Industri Strategis',
          desc: 'Platform telah diuji dan diimplementasikan lintas industri mulai dari perbankan, manufaktur, FMCG, hingga logistik nasional dengan volume jutaan lembar dokumen per bulan.',
          image: '/images/cards/product-formats.webp',
          tag: 'Skala Enterprise',
          badge: 'High Throughput',
          actionText: 'Eksplorasi Fitur Produk',
          actionHref: '/product',
        },
        {
          title: 'Dukungan Teknis Berstandar SLA 99.9%',
          desc: 'Komitmen operasional tanpa henti yang didukung oleh rekayasawan lokal terdedikasi dengan layanan pelanggan enterprise 24/7 dan respon tanggap insiden cepat.',
          image: '/images/cards/solutions-sla.webp',
          tag: 'Reliabilitas Sistem',
          badge: '99.9% Uptime',
          actionText: 'Cek Jaminan SLA',
          actionHref: '/sla',
        },
      ]}
    />
  );
}

