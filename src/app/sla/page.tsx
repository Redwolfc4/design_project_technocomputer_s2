import { Metadata } from 'next';
import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export const metadata: Metadata = {
  title: 'Jaminan Service Level Agreement (SLA) 99.9% | DokumenAI Enterprise',
  description: 'Komitmen ketersediaan uptime 99.9%, latensi ekstraksi berkecepatan tinggi, dan dukungan teknis 24/7 DokumenAI Enterprise.',
};

export default function SlaPage() {
  return (
    <MarketingPageTemplate
      title="Jaminan Service Level Agreement (SLA) 99.9%"
      subtitle="Komitmen Keandalan & Performa"
      description="Kami memberikan garansi ketersediaan infrastruktur komputasi dan performa pemrosesan dokumen tingkat enterprise untuk memastikan kelancaran operasional keuangan dan akuntansi bisnis Anda."
      points={[
        {
          title: 'Komitmen Uptime 99.9% Per Bulan',
          desc: 'DokumenAI Enterprise menjamin ketersediaan akses sistem dan layanan API ekstraksi minimal 99.9% setiap bulan kalender dengan arsitektur multi-zone cloud yang memiliki redundansi tinggi.',
          image: '/images/cards/security-onprem.webp',
          tag: 'High Availability',
          badge: 'Uptime 99.9%',
          actionText: 'Tinjau Infrastruktur',
          actionHref: '/security',
        },
        {
          title: 'Performa Ekstraksi Berkecepatan Tinggi',
          desc: 'Waktu siklus pemrosesan rata-rata dari pengunggahan pindaian faktur hingga ekstraksi bidang JSON terstruktur dijamin selesai dalam kurun waktu 1.4 hingga 1.5 detik per dokumen standar.',
          image: '/images/cards/solutions-sla.webp',
          tag: 'Performa OCR',
          badge: '~1.4s / Dokumen',
          actionText: 'Uji Kecepatan Upload',
          actionHref: '/demo/dashboard/upload',
        },
        {
          title: 'Matriks Respons Insiden 24/7 (Severity 1-3)',
          desc: 'Untuk insiden kritis (Severity 1 / Layanan Terhenti), tim teknis kami siap merespons dalam waktu kurang dari 15 menit. Insiden Severity 2 ditangani dalam < 1 jam, dan perbaikan minor < 4 jam.',
          image: '/images/cards/pricing-business.webp',
          tag: 'Dukungan 24/7',
          badge: 'Respon < 15m',
          actionText: 'Lihat Paket Layanan',
          actionHref: '/pricing',
        },
        {
          title: 'Jendela Pemeliharaan Terencana yang Terkendali',
          desc: 'Pemeliharaan perangkat lunak berkala hanya dilakukan di luar jam sibuk bisnis dengan pemberitahuan resmi sekurang-kurangnya 48 jam sebelum jadwal pelaksanaan.',
          image: '/images/cards/features-export.webp',
          tag: 'Maintenance',
          badge: 'Notifikasi 48 Jam',
          actionText: 'Cek Arsitektur Sistem',
          actionHref: '/product',
        },
        {
          title: 'Kompensasi Layanan (Service Credit Policy)',
          desc: 'Apabila tingkat ketersediaan bulanan berada di bawah komitmen 99.9%, organisasi berhak mengajukan kredit pemotongan biaya tagihan langganan proporsional sesuai ketentuan kontrak.',
          image: '/images/cards/pricing-starter.webp',
          tag: 'Garansi Layanan',
          badge: 'Service Credit',
          actionText: 'Tinjau Ketentuan Layanan',
          actionHref: '/terms',
        },
        {
          title: 'Pemantauan Telemetri & Status Real-Time',
          desc: 'Dasbor pemantauan kesehatan sistem dan metrik beban kerja dapat dipantau langsung secara transparan melalui portal analitik operasional terpusat.',
          image: '/images/cards/pricing-demo.webp',
          tag: 'Observability',
          badge: 'Real-Time Telemetry',
          actionText: 'Buka Portal Analitik',
          actionHref: '/demo/dashboard/analytics',
        },
      ]}
    />
  );
}

