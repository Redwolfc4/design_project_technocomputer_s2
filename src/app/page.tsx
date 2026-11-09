import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileTextIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  ArrowRightIcon,
  LayersIcon,
} from '@/components/ui/icons';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Header } from '@/components/layout/Header';

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col font-sans selection:bg-[#4F46E5]/10 selection:text-[#4F46E5]">
      {/* Navigation Bar */}
      <Header />

      {/* Hero Section */}
      <section className="pt-16 pb-20 border-b border-[#E2E8F0] relative overflow-hidden bg-gradient-to-b from-white to-[#FAFAFF]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#CBD5E1] text-[#4F46E5] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse"></span>
                <span>Otomasi Finansial & Pajak Indonesia Kelas Enterprise</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-[1.15]">
                Intelligent Document Processing dengan Rekonsiliasi Human-in-the-Loop
              </h1>

              <p className="text-base text-[#475569] leading-relaxed">
                Ekstraksi otomatis untuk e-Faktur Pajak DJP, Invoice Komersial, PO, dan Bukti Potong PPh 23/26. Dilengkapi antrean verifikasi interaktif, pencocokan toleransi aritmatika, dan integrasi siap posting ke ERP SAP/Oracle.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold px-5 py-3 rounded-lg shadow-md transition-all shadow-[#4F46E5]/25"
                >
                  <span>Buka Live Interactive Demo</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/verification"
                  className="flex items-center gap-2 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-bold px-5 py-3 rounded-lg shadow-sm transition-all"
                >
                  <span>Coba Workspace Verifikasi</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center gap-6 text-[11px] font-semibold text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-[#059669]" />
                  <span>Dukungan PPN 11% & 12% Adaptif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-[#4F46E5]" />
                  <span>Audit Trail Forensik Penuh</span>
                </div>
              </div>
            </div>

            {/* Hero SVG Illustration */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="w-full max-w-xl rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-2xl shadow-indigo-500/5">
                <Image
                  src="/images/features/hero-document-flow.webp"
                  alt="Ilustrasi Pemrosesan Dokumen Enterprise DokumenAI"
                  width={800}
                  height={520}
                  priority
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#4F46E5]">
              Arsitektur Sistem Terpercaya
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Menghubungkan Dokumen Tidak Terstruktur ke Buku Besar Perusahaan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-[#E2E8F0] bg-[#FAFAFF] space-y-3 hover:border-[#4F46E5] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold">
                <FileTextIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Ekstraksi Dokumen Finansial</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Model ekstraksi mengenali struktur spesifik e-Faktur Pajak Indonesia (NSFP, DPP, PPN), purchase order multi-item, dan kontrak kerja sama komersial.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E2E8F0] bg-[#FAFAFF] space-y-3 hover:border-[#4F46E5] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Human-in-the-Loop Workspace</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Antarmuka verifikasi berdampingan dengan penyorot koordinat (bounding box) untuk validasi cepat nilai yang membutuhkan konfirmasi mata manusia.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E2E8F0] bg-[#FAFAFF] space-y-3 hover:border-[#4F46E5] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center font-bold">
                <LayersIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Ekspor Terpetakan ke ERP</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Ekspor hasil ekstraksi yang terverifikasi ke format siap impor untuk SAP S/4HANA, Oracle Cloud, Microsoft Dynamics, dan CSV SPT Pajak DJP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Human Verification Workspace Showcase */}
      <section className="py-20 bg-[#FAFAFF] border-b border-[#E2E8F0]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-xl">
                <Image
                  src="/images/features/verification-workspace.webp"
                  alt="Ilustrasi Human-in-the-loop Verification Workspace"
                  width={700}
                  height={420}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#059669]">
                Keandalan Tanpa Kompromi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Human-in-the-Loop: Kunci Akurasi Akuntansi 99.9%
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Dokumen dengan nilai keyakinan di bawah ambang batas (contoh: stempel fisik vendor buram, cetakan faks tidak terbaca) otomatis diarahkan ke antrean verifikasi spesialis akun hutang (AP Lead).
              </p>
              <ul className="space-y-3 text-xs font-medium text-[#334155]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                  <span>Sinkronisasi penyorotan teks dan kotak input formulir secara realtime</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                  <span>Pengecekan otomatis kesesuaian nilai DPP + PPN 11% terhadap total</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                  <span>Catatan koreksi reviewer tersimpan permanen di jalur audit dokumen</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/dashboard/verification"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA]"
                >
                  <span>Buka Antrean Verifikasi Langsung</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Integration & Security Section */}
      <section className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#4F46E5]">
                Konektivitas Tanpa Hambatan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Integrasi REST API, Webhook & Ekspor Format Standar
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                DokumenAI dirancang agar selaras dengan ekosistem enterprise yang sudah ada. Kirim berkas lewat pipeline webhook dan terima payload JSON terstruktur seketika dokumen disetujui.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFF]">
                  <span className="text-xs font-bold text-[#0F172A] block mb-1">Skema Terstandarisasi</span>
                  <span className="text-[11px] text-[#64748B]">Dukungan pemetaan kolom fleksibel sesuai akun bagan perusahaan.</span>
                </div>
                <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#FAFAFF]">
                  <span className="text-xs font-bold text-[#0F172A] block mb-1">Jalur Forensik</span>
                  <span className="text-[11px] text-[#64748B]">Setiap unggahan dan perubahan field tercatat dengan stempel waktu dan identitas aktor.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl border border-[#CBD5E1] bg-white p-2 shadow-xl">
                <Image
                  src="/images/features/enterprise-integrations.webp"
                  alt="Ilustrasi Integrasi Enterprise DokumenAI"
                  width={600}
                  height={380}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Demo Tiers */}
      <section className="py-20 bg-[#FAFAFF] border-b border-[#E2E8F0]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#4F46E5]">
              Paket Lisensi Perusahaan
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Transparan, Terukur & Dirancang untuk Skala Finansial
            </p>
            <p className="text-xs text-[#64748B]">
              *Seluruh kuota dan harga di bawah ini adalah data demonstrasi simulasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-8 rounded-2xl border border-[#E2E8F0] bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Starter Finance</span>
                <div className="text-3xl font-black text-[#0F172A]">Rp 4.500.000<span className="text-xs font-medium text-[#64748B]">/bln</span></div>
                <p className="text-xs text-[#64748B]">Untuk tim akuntansi berkembang yang ingin mempercepat proses entri nota dan invoice bulanan.</p>
                <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-xs text-[#334155]">
                  <div>✓ Hingga 1.000 dokumen/bulan</div>
                  <div>✓ e-Faktur & Invoice Komersial</div>
                  <div>✓ 3 Akun Pengguna</div>
                  <div>✓ Ekspor CSV Standar</div>
                </div>
              </div>
              <Link href="/dashboard" className="mt-8 block text-center py-2.5 px-4 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]">
                Mulai Uji Coba Demo
              </Link>
            </div>

            {/* Business (Popular) */}
            <div className="p-8 rounded-2xl border-2 border-[#4F46E5] bg-white shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Paling Diminati
              </span>
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Business Standard</span>
                <div className="text-3xl font-black text-[#0F172A]">Rp 14.500.000<span className="text-xs font-medium text-[#64748B]">/bln</span></div>
                <p className="text-xs text-[#64748B]">Otomasi menyeluruh untuk departemen Accounts Payable dan perpajakan multi-cabang.</p>
                <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-xs text-[#334155]">
                  <div>✓ Hingga 10.000 dokumen/bulan</div>
                  <div>✓ Seluruh 7 Jenis Dokumen Finansial</div>
                  <div>✓ Human-in-the-Loop Workspace</div>
                  <div>✓ Integrasi Webhook & API Key</div>
                  <div>✓ Audit Trail 90 Hari</div>
                </div>
              </div>
              <Link href="/dashboard" className="mt-8 block text-center py-2.5 px-4 rounded-lg bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA]">
                Jelajahi Solusi Business
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl border border-[#E2E8F0] bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Enterprise Dedicated</span>
                <div className="text-3xl font-black text-[#0F172A]">Kustomisasi</div>
                <p className="text-xs text-[#64748B]">Dukungan on-premise / private cloud, SLA 99.9%, dan adaptor khusus ERP SAP/Oracle.</p>
                <div className="pt-4 border-t border-[#E2E8F0] space-y-2 text-xs text-[#334155]">
                  <div>✓ Dokumen Tanpa Batas</div>
                  <div>✓ Model AI Fine-tuning Dokumen Internal</div>
                  <div>✓ Audit Log Forensik Tanpa Batas</div>
                  <div>✓ Manajer Akun Khusus 24/7</div>
                </div>
              </div>
              <Link href="/dashboard" className="mt-8 block text-center py-2.5 px-4 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]">
                Hubungi Konsultan Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-12">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size={28} showText={true} subtitle="" textSize="sm" />
          </Link>

          <p className="text-xs text-[#64748B] text-center md:text-right">
            © 2026 PT Nusantara Teknologi Cipta. Aplikasi Demonstrasi Intelligent Document Processing.
          </p>
        </div>
      </footer>
    </div>
  );
}
