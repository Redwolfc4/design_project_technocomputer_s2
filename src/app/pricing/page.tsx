import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function PricingPage() {
  return (
    <MarketingPageTemplate
      title="Paket Lisensi & Kapasitas Pemrosesan Dokumen"
      subtitle="Struktur Investasi"
      description="Pilihan paket berjenjang yang fleksibel mulai dari tim keuangan bertumbuh hingga holding korporasi multi-anak perusahaan."
      points={[
        { title: 'Starter Finance — Rp 4.500.000 / bln', desc: 'Kapasitas hingga 1.000 dokumen/bulan, 3 akun pengguna AP, format ekspor CSV standar, dan dukungan email.' },
        { title: 'Business Standard — Rp 14.500.000 / bln', desc: 'Kapasitas hingga 10.000 dokumen/bulan, antrean Human-in-the-Loop, integrasi Webhook & API, audit trail 90 hari.' },
        { title: 'Enterprise Dedicated — Kustom', desc: 'Volume dokumen tanpa batas, penyesuaian model AI untuk format faktur khusus, SLA pemeliharaan 99.9%, dan dedicated account manager.' },
        { title: 'Catatan Demonstrasi', desc: 'Seluruh harga dan kuota di atas disajikan sebagai data simulasi komersial untuk kebutuhan uji kelayakan produk.' },
      ]}
    />
  );
}

