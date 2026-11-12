import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface MarketingPageProps {
  title: string;
  subtitle: string;
  description: string;
  points: { title: string; desc: string }[];
}

export function MarketingPageTemplate({ title, subtitle, description, points }: MarketingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col font-sans selection:bg-[#4F46E5]/10 selection:text-[#4F46E5]">
      {/* Navigation Bar */}
      <Header />

      <main className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16 space-y-12 flex-1">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#4F46E5]">
            {subtitle}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {points.map((pt, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-[#CBD5E1] bg-white shadow-sm space-y-2">
              <h3 className="text-base font-bold text-[#0F172A]">{pt.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{pt.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#3730A3] text-white text-center space-y-4">
          <h2 className="text-xl font-bold">Siap Menguji Coba Ekstraksi Dokumen Secara Interaktif?</h2>
          <p className="text-xs text-indigo-100 max-w-xl mx-auto">
            Masuk ke portal demonstrasi dengan pilihan persona Finance Lead, Admin CISO, atau Reviewer.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#4F46E5] text-xs font-extrabold shadow-md hover:bg-slate-50 transition-all"
            >
              <span>Eksplorasi Dashboard Sekarang</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

