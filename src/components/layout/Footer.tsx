'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/shared/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-14 pb-12 text-[#475569] font-sans">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F1F5F9]">

          {/* Column 1: Company Profile & Contacts (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size={32} showText={true} subtitle="" textSize="base" />
            </Link>

            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
              Platform otomasi pemrosesan dokumen cerdas (Intelligent Document Processing) enterprise terdepan di Indonesia.
              Mengintegrasikan OCR bertenaga deep learning, validasi kepatuhan pajak otomatis, dan audit trail forensik perbankan.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-[#475569]">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Cyber 2 Tower, Lantai 28, Jl. H.R. Rasuna Said Blok X-5 Kav. 13, Jakarta Selatan 12950</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#4F46E5] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:enterprise@dokumenai.id" className="hover:text-[#4F46E5] transition-colors font-medium">
                  enterprise@dokumenai.id
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#4F46E5] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+62 (21) 5088-7200 (Hunting & Dukungan SLA 24/7)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold border border-[#E0E7FF]">
                <svg className="w-3.5 h-3.5 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                ISO 27001 Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F0FDF4] text-[#16A34A] text-[10px] font-semibold border border-[#DCFCE7]">
                <svg className="w-3.5 h-3.5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                SOC 2 Type II Compliant
              </span>
            </div>
          </div>

          {/* Column 2: Solusi & Produk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Solusi & Fitur
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/product" className="hover:text-[#4F46E5] transition-colors">
                  AI Document Processing
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[#4F46E5] transition-colors">
                  Fitur Unggulan Sistem
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:text-[#4F46E5] transition-colors">
                  Otomasi Faktur Pajak & e-Faktur
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:text-[#4F46E5] transition-colors">
                  Rekonsiliasi Rekening Koran
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#4F46E5] transition-colors">
                  Paket & Skema Lisensi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Profil Perusahaan & Tata Kelola */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Profil Perusahaan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/security" className="hover:text-[#4F46E5] transition-colors">
                  Pusat Keamanan & Kepatuhan
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#4F46E5] transition-colors">
                  Tentang PT Nusantara Teknologi
                </Link>
              </li>
              <li>
                <Link href="/leadership" className="hover:text-[#4F46E5] transition-colors">
                  Dewan Direksi & Manajemen
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#4F46E5] transition-colors inline-flex items-center gap-1.5">
                  <span>Karir & Budaya Kerja</span>
                  <span className="px-1.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] text-[9px] rounded font-bold">Hiring</span>
                </Link>
              </li>
              <li>
                <Link href="/investors" className="hover:text-[#4F46E5] transition-colors">
                  Hubungan Investor & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Akses Portal & Bantuan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Akses Portal & Demo
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-[#4F46E5] transition-colors font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <span>Masuk Akun Perusahaan</span>
                  <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#4F46E5] transition-colors">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link href="/demo/login" className="hover:text-[#4F46E5] transition-colors text-[#4F46E5] font-semibold flex items-center gap-1.5">
                  <span>Eksplorasi Simulasi Demo</span>
                  <svg className="w-3.5 h-3.5 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#4F46E5] transition-colors">
                  Konsol Operasional Dokumen
                </Link>
              </li>
              <li>
                <a href="mailto:support@dokumenai.id" className="hover:text-[#4F46E5] transition-colors">
                  Layanan Bantuan & Tiket SLA
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Legal & Disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-medium text-[#334155]">
              © 2026 PT Nusantara Teknologi Cipta Tbk. Seluruh hak cipta dilindungi undang-undang.
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span>DokumenAI Enterprise™ v2.4 (Enterprise Production Ready)</span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <Link href="/privacy" className="hover:text-[#0F172A] transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/terms" className="hover:text-[#0F172A] transition-colors">
              Syarat & Ketentuan Layanan
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/sla" className="hover:text-[#0F172A] transition-colors">
              Jaminan SLA 99.9%
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
