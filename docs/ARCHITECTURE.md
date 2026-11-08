# DokumenAI Enterprise — Arsitektur Sistem

## 1. Ikhtisar Arsitektur
DokumenAI Enterprise dibangun dengan arsitektur modern Next.js 15 (App Router), TypeScript mode ketat, dan Tailwind CSS. Sistem mengimplementasikan pola **Clean Architecture** yang memisahkan lapisan presentasi, domain model, penyimpanan (repository mock/storage), dan layanan formatters.

```text
src/
├── app/                  # Next.js App Router (Marketing, Auth, Dashboard Modules)
├── components/           # Reusable UI Primitives, Layouts, Topbar, Sidebar
├── lib/
│   ├── constants/        # Persona demo, vendor fiktif, profil ekstraksi
│   ├── mocks/            # Deterministic Mock Storage & Document Engine
│   └── utils/            # Formatters rupiah, tanggal, skema helper
└── types/                # Strict TypeScript Interface (Document, Audit, Settings)
```

## 2. Model Ekstraksi & Human-in-the-Loop
- **Engine**: Disimulasikan secara deterministik untuk mendukung reproduktibilitas pengujian otomatis.
- **Bounding Boxes**: Setiap bidang ekstraksi (Nomor Faktur, NPWP, DPP, PPN) memiliki koordinat relatif dokumen yang disorot dua arah (*bidirectional highlighting*) antara lembar dokumen dan formulir editor verifikator.
- **Validasi Aritmatika**: Memeriksa kalkulasi DPP + PPN 11%/12% terhadap Grand Total serta menampilkan peringatan audit jika terjadi pembulatan tidak lazim.

## 3. Ekspor & Integrasi
- Menghasilkan berkas CSV, Excel XLSX, dan JSON API siap posting ke ERP (SAP S/4HANA, Oracle Cloud, DJP Tax SPT).
- Setiap aksi approval dan ekspor secara otomatis membuat entri log baru di modul **Audit Trail Forensik**.

