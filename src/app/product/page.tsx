import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function ProductPage() {
  return (
    <MarketingPageTemplate
      title="Intelligent Document Processing (IDP) Platform"
      subtitle="Arsitektur Produk"
      description="DokumenAI mengonversi jutaan halaman berkas faktur pajak, invoice komersial, purchase order, dan kontrak menjadi data terstruktur siap ERP dengan jaminan akurasi tinggi."
      points={[
        { title: 'Ekstraksi e-Faktur Pajak DJP', desc: 'Membaca dan memverifikasi QR code DJP, NSFP 16 digit, masa pajak, dan perhitungan DPP serta PPN secara akurat.' },
        { title: 'Pencocokan 3-Arah (3-Way Matching)', desc: 'Menyelaraskan rincian barang antara Surat Pesanan (PO), Surat Jalan (DO), dan Invoice tagihan pemasok.' },
        { title: 'Adaptor Multi-Format Berkas', desc: 'Menerima PDF digital hasil generator ERP maupun pindaian (scan) foto dokumen fisik dengan koreksi orientasi otomatis.' },
        { title: 'Keamanan Data Tersimulasi Transparan', desc: 'Semua proses komputasi dirancang siap kompatibel dengan standar keamanan data perusahaan dan regulasi perpajakan Indonesia.' },
      ]}
    />
  );
}

