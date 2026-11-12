import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function PricingPage() {
  return (
    <MarketingPageTemplate
      title="Paket Lisensi & Kapasitas Pemrosesan Dokumen"
      subtitle="Struktur Investasi"
      description="Pilihan paket berjenjang yang fleksibel mulai dari tim keuangan bertumbuh hingga holding korporasi multi-anak perusahaan."
      points={[
        {
          title: 'Starter Finance — Rp 4.500.000 / bln',
          desc: 'Kapasitas hingga 1.000 dokumen/bulan, 3 akun pengguna AP, format ekspor CSV standar, dan dukungan email.',
          image: '/images/cards/pricing-starter.webp',
          tag: 'Paket Pemula',
          badge: '1.000 Dokumen/Bln',
          actionText: 'Mulai Uji Starter',
          actionHref: '/demo/login',
        },
        {
          title: 'Business Standard — Rp 14.500.000 / bln',
          desc: 'Kapasitas hingga 10.000 dokumen/bulan, antrean Human-in-the-Loop, integrasi Webhook & API, audit trail 90 hari.',
          image: '/images/cards/pricing-business.webp',
          tag: 'Paling Populer',
          badge: '10.000 Dokumen/Bln',
          actionText: 'Coba Paket Business',
          actionHref: '/demo/login',
        },
        {
          title: 'Enterprise Dedicated — Kustom',
          desc: 'Volume dokumen tanpa batas, penyesuaian model AI untuk format faktur khusus, SLA pemeliharaan 99.9%, dan dedicated account manager.',
          image: '/images/cards/pricing-enterprise.webp',
          tag: 'Solusi Korporasi',
          badge: 'Volume Unlimited',
          actionText: 'Konsultasi Enterprise',
          actionHref: '/demo/login',
        },
        {
          title: 'Catatan Demonstrasi Interaktif',
          desc: 'Seluruh harga dan kuota di atas disajikan sebagai data simulasi komersial untuk kebutuhan uji kelayakan produk.',
          image: '/images/cards/pricing-demo.webp',
          tag: 'Simulasi Terkendali',
          badge: 'Uji Coba Bebas Biaya',
          actionText: 'Masuk Sandbox Demo',
          actionHref: '/demo/login',
        },
      ]}
    />
  );
}

