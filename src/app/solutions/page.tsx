import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function SolutionsPage() {
  return (
    <MarketingPageTemplate
      title="Solusi Perpajakan & Operasional Accounts Payable"
      subtitle="Studi Kasus & Manfaat"
      description="Menjawab tantangan pengetikan manual ribuan faktur bulanan pada korporasi multi-cabang, logistik, manufaktur, dan ritel."
      points={[
        {
          title: 'Otomasi Rekonsiliasi SPT Masa PPN',
          desc: 'Validasi faktur masukan terhadap daftar master data pemasok resmi DJP guna menghindari risiko faktur fiktif.',
          image: '/images/cards/solutions-spt.webp',
          tag: 'Mitigasi Risiko Pajak',
          badge: 'DJP Validated',
          actionText: 'Lihat Rekonsiliasi SPT',
          actionHref: '/demo/dashboard/documents',
        },
        {
          title: 'Pemrosesan Cepat Bukti Potong PPh 23/26',
          desc: 'Ekstraksi nilai jasa, tarif 2%, dan nomor bupot unifikasi untuk pelaporan pajak penghasilan yang tertib.',
          image: '/images/cards/solutions-bupot.webp',
          tag: 'Bupot Unifikasi',
          badge: 'PPh 23 / 26',
          actionText: 'Uji Ekstraksi Bupot',
          actionHref: '/demo/dashboard/upload',
        },
        {
          title: 'Pencegahan Pembayaran Ganda (Duplicate Invoice)',
          desc: 'Deteksi otomatis kesamaan nomor faktur atau kombinasi vendor dan tanggal untuk menjaga likuiditas kas.',
          image: '/images/cards/solutions-duplicate.webp',
          tag: 'Proteksi Kas AP',
          badge: 'Anti-Duplicate Engine',
          actionText: 'Cek Deteksi Duplikasi',
          actionHref: '/demo/dashboard',
        },
        {
          title: 'SLA Pembayaran Vendor Tepat Waktu',
          desc: 'Percepat siklus persetujuan invoice dari 7 hari menjadi kurang dari 24 jam dengan antrean review pintar.',
          image: '/images/cards/solutions-sla.webp',
          tag: 'Efisiensi Operasional',
          badge: 'SLA < 24 Jam',
          actionText: 'Pantau Metrik SLA',
          actionHref: '/demo/dashboard/analytics',
        },
      ]}
    />
  );
}

