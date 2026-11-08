import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function FeaturesPage() {
  return (
    <MarketingPageTemplate
      title="Fitur Unggulan DokumenAI Enterprise"
      subtitle="Kemampuan Inti"
      description="Jelajahi fungsionalitas otomasi canggih yang dirancang khusus untuk memotong 80% waktu siklus pembukuan tim Accounts Payable dan perpajakan."
      points={[
        { title: 'Human-in-the-Loop Verification Workspace', desc: 'Pratinjau dokumen berdampingan dengan penyorot koordinat (bounding box) untuk verifikasi cepat bidang berkeyakinan rendah.' },
        { title: 'Mesin Aturan Validasi Aritmatika', desc: 'Pengecekan formula DPP + PPN 11%/12% otomatis dengan peringatan ketidaksesuaian pembulatan desimal.' },
        { title: 'Audit Trail Forensik Tak Terbantahkan', desc: 'Setiap klik persetujuan, penolakan, atau edit bidang data tercatat dengan identitas staf dan stempel waktu forensik.' },
        { title: 'Ekspor Siap Integrasi SAP / Oracle', desc: 'Pemetaan skema kolom fleksibel ke format CSV, Excel XLSX, atau JSON webhook untuk langsung diposting ke ERP.' },
      ]}
    />
  );
}

