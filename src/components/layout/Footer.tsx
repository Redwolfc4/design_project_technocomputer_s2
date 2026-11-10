'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { 
  BuildingOffice2Icon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-16 pb-12 text-[#475569] font-sans">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#F1F5F9]">
          
          {/* Column 1: Company Info & Vision (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size={32} showText={true} subtitle="" textSize="md" />
            </Link>
            
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
              Platform otomasi pemrosesan dokumen cerdas (Intelligent Document Processing) berbasis AI enterprise. 
              Mengintegrasikan OCR bertenaga deep learning, validasi kepatuhan pajak otomatis, dan audit trail forensik perbankan.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#475569]">
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>Cyber 2 Tower, Lantai 28, Jl. H.R. Rasuna Said Blok X-5 Kav. 13, Jakarta Selatan 12950</span>
              </div>
              <div className="flex items-center gap-2.5">
                <EnvelopeIcon className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <a href="mailto:enterprise@dokumenai.id" className="hover:text-[#4F46E5] transition-colors">
                  enterprise@dokumenai.id
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <span>+62 (21) 5088-7200 (Hunting)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-semibold border border-[#E0E7FF]">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                ISO 27001 Certified
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F0FDF4] text-[#16A34A] text-[10px] font-semibold border border-[#DCFCE7]">
                <DocumentCheckIcon className="w-3.5 h-3.5" />
                SOC 2 Type II Compliant
              </span>
            </div>
          </div>

          {/* Column 2: Solusi & Produk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Produk & Solusi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/product" className="hover:text-[#4F46E5] transition-colors">
                  AI Document Extractor
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[#4F46E5] transition-colors">
                  Fitur Unggulan
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:text-[#4F46E5] transition-colors">
                  Otomasi Faktur Pajak
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="hover:text-[#4F46E5] transition-colors">
                  Verifikasi Rekening Koran
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#4F46E5] transition-colors">
                  Paket & Skema Lisensi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Perusahaan & Tata Kelola */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Perusahaan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/security" className="hover:text-[#4F46E5] transition-colors">
                  Pusat Keamanan & Kepatuhan
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-[#4F46E5] transition-colors">
                  Tentang PT Nusantara Teknologi
                </a>
              </li>
              <li>
                <a href="#governance" className="hover:text-[#4F46E5] transition-colors">
                  Tata Kelola Enterprise (ESG)
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-[#4F46E5] transition-colors inline-flex items-center gap-1.5">
                  <span>Karir & Rekrutmen</span>
                  <span className="px-1.5 py-0.2 bg-[#F1F5F9] text-[#475569] text-[9px] rounded font-semibold">Hiring</span>
                </a>
              </li>
              <li>
                <a href="#press" className="hover:text-[#4F46E5] transition-colors">
                  Press Kit & Publikasi Media
                </a>
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
                <Link href="/login" className="hover:text-[#4F46E5] transition-colors font-semibold text-[#0F172A] flex items-center gap-1">
                  <span>Masuk Akun Enterprise</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 text-[#64748B]" />
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#4F46E5] transition-colors">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link href="/demo/login" className="hover:text-[#4F46E5] transition-colors text-[#4F46E5] font-semibold flex items-center gap-1">
                  <span>Eksplorasi Simulasi Demo</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 text-[#4F46E5]" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#4F46E5] transition-colors">
                  Akses Konsol Operasional
                </Link>
              </li>
              <li>
                <a href="mailto:support@dokumenai.id" className="hover:text-[#4F46E5] transition-colors">
                  Bantuan Teknis & Tiket SLA
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
            <span>DokumenAI Enterprise™ v2.4</span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <a href="#privacy" className="hover:text-[#0F172A] transition-colors">
              Kebijakan Privasi
            </a>
            <span className="text-slate-300">•</span>
            <a href="#terms" className="hover:text-[#0F172A] transition-colors">
              Syarat & Ketentuan Layanan
            </a>
            <span className="text-slate-300">•</span>
            <a href="#sla" className="hover:text-[#0F172A] transition-colors">
              Jaminan SLA 99.9%
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
