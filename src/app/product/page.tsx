import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function ProductPage() {
  return (
    <MarketingPageTemplate
      title="Intelligent Document Processing (IDP) Platform"
      subtitle="Arsitektur Produk"
      description="DokumenAI mengonversi jutaan halaman berkas faktur pajak, invoice komersial, purchase order, dan kontrak menjadi data terstruktur siap ERP dengan jaminan akurasi tinggi."
      points={[
        {
          title: 'Ekstraksi e-Faktur Pajak DJP',
          desc: 'Membaca dan memverifikasi QR code DJP, NSFP 16 digit, masa pajak, dan perhitungan DPP serta PPN secara akurat.',
          image: '/images/cards/product-faktur.webp',
          tag: 'Perpajakan DJP',
          badge: 'Otomasi OCR',
          actionText: 'Uji Coba Faktur Pajak',
          actionHref: '/demo/dashboard/verification',
        },
        {
          title: 'Pencocokan 3-Arah (3-Way Matching)',
          desc: 'Menyelaraskan rincian barang antara Surat Pesanan (PO), Surat Jalan (DO), dan Invoice tagihan pemasok.',
          image: '/images/cards/product-matching.webp',
          tag: 'Rekonsiliasi AP',
          badge: 'Akurasi 99.8%',
          actionText: 'Lihat Alur Matching',
          actionHref: '/demo/dashboard/documents',
        },
        {
          title: 'Adaptor Multi-Format Berkas',
          desc: 'Menerima PDF digital hasil generator ERP maupun pindaian (scan) foto dokumen fisik dengan koreksi orientasi otomatis.',
          image: '/images/cards/product-formats.webp',
          tag: 'Multi Format',
          badge: 'PDF, JPG, PNG, TIFF',
          actionText: 'Unggah Sampel Berkas',
          actionHref: '/demo/dashboard/upload',
        },
        {
          title: 'Keamanan Data Tersimulasi Transparan',
          desc: 'Semua proses komputasi dirancang siap kompatibel dengan standar keamanan data perusahaan dan regulasi perpajakan Indonesia.',
          image: '/images/cards/product-security.webp',
          tag: 'Kepatuhan Enterprise',
          badge: 'ISO 27001 Ready',
          actionText: 'Cek Standar Kepatuhan',
          actionHref: '/security',
        },
      ]}
    />
  );
}

