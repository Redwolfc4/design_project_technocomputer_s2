# Batasan & Karakteristik Simulasi (Known Limitations)

DokumenAI Enterprise adalah aplikasi **Demonstrasi Interaktif Tingkat Produksi (Production-Quality SaaS Demo)** untuk kebutuhan evaluasi komersial dan alur kerja IDP enterprise.

1. **Simulasi Ekstraksi AI**: Model OCR dan parsing bidang tidak memanggil model AI neural secara langsung di cloud demi kestabilan pengujian offline, melainkan dijalankan oleh mesin simulasi deterministik lokal.
2. **Penyimpanan Browser**: Data demo disimpan secara persisten di `localStorage` peramban klien. Tombol "Reset Demo Data" di topbar dapat digunakan kapan saja untuk mengembalikan data ke setelan awal pabrikan.
3. **Data Bisnis Fiktif**: Seluruh nama PT, CV, nomor NPWP, dan nomor seri faktur pajak (NSFP) yang digunakan adalah 100% entitas fiktif demi privasi dan kepatuhan.
4. **Keamanan & SSO**: Pemilihan peran pengguna (RBAC) pada antarmuka login dan sidebar adalah simulasi sisi klien untuk mendemonstrasikan pengalaman otorisasi multi-peran, bukan pengganti SSO OAuth2/SAML sisi server.

