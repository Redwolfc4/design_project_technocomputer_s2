import { MarketingPageTemplate } from '@/components/shared/MarketingPageTemplate';

export default function FeaturesPage() {
  return (
    <MarketingPageTemplate
      title="Fitur Unggulan DokumenAI Enterprise"
      subtitle="Kemampuan Inti"
      description="Jelajahi fungsionalitas otomasi canggih yang dirancang khusus untuk memotong 80% waktu siklus pembukuan tim Accounts Payable dan perpajakan."
      points={[
        {
          title: 'Human-in-the-Loop Verification Workspace',
          desc: 'Pratinjau dokumen berdampingan dengan penyorot koordinat (bounding box) untuk verifikasi cepat bidang berkeyakinan rendah.',
          image: '/images/cards/features-workspace.webp',
          tag: 'Interactive Review',
          badge: 'Confidence Score',
          actionText: 'Buka Workspace Review',
          actionHref: '/demo/dashboard/verification',
        },
        {
          title: 'Mesin Aturan Validasi Aritmatika',
          desc: 'Pengecekan formula DPP + PPN 11%/12% otomatis dengan peringatan ketidaksesuaian pembulatan desimal.',
          image: '/images/cards/features-arithmetic.webp',
          tag: 'Kalkulasi Otomatis',
          badge: 'PPN 11% & 12%',
          actionText: 'Uji Validasi Rumus',
          actionHref: '/demo/dashboard/documents',
        },
        {
          title: 'Audit Trail Forensik Tak Terbantahkan',
          desc: 'Setiap klik persetujuan, penolakan, atau edit bidang data tercatat dengan identitas staf dan stempel waktu forensik.',
          image: '/images/cards/features-audit.webp',
          tag: 'Forensik Perbankan',
          badge: 'Immutable Log',
          actionText: 'Telusuri Log Audit',
          actionHref: '/demo/dashboard/audit',
        },
        {
          title: 'Ekspor Siap Integrasi SAP / Oracle',
          desc: 'Pemetaan skema kolom fleksibel ke format CSV, Excel XLSX, atau JSON webhook untuk langsung diposting ke ERP.',
          image: '/images/cards/features-export.webp',
          tag: 'Integrasi ERP',
          badge: 'SAP, Oracle, REST API',
          actionText: 'Konfigurasi Ekspor ERP',
          actionHref: '/demo/dashboard/export',
        },
      ]}
    />
  );
}

