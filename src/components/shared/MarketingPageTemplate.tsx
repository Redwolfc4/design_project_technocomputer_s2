import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export interface MarketingPoint {
  title: string;
  desc: string;
  image?: string;
  tag?: string;
  badge?: string;
  actionText?: string;
  actionHref?: string;
}

interface MarketingPageProps {
  title: string;
  subtitle: string;
  description: string;
  points: MarketingPoint[];
}

const DEFAULT_CARD_IMAGES = [
  '/images/cards/product-faktur.webp',
  '/images/cards/features-workspace.webp',
  '/images/cards/solutions-spt.webp',
  '/images/cards/security-rbac.webp',
  '/images/cards/pricing-business.webp',
  '/images/cards/security-onprem.webp',
];

export function MarketingPageTemplate({ title, subtitle, description, points }: MarketingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col font-sans selection:bg-[#4F46E5]/10 selection:text-[#4F46E5]">
      {/* Navigation Bar */}
      <Header />

      <main className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-16 flex-1 flex flex-col gap-12 sm:gap-16">
        {/* Header Section */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs uppercase font-extrabold tracking-widest text-[#4F46E5] bg-[#EEF2FF] px-3.5 py-1.5 rounded-full border border-[#CBD5E1]">
            {subtitle}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Cards Grid with Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {points.map((pt, idx) => {
            const cardImage = pt.image || DEFAULT_CARD_IMAGES[idx % DEFAULT_CARD_IMAGES.length];
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-[#CBD5E1] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-[#818CF8]/70 transition-all duration-300 flex flex-col"
              >
                {/* Card Image Banner */}
                <div
                  className="relative w-full bg-slate-100 overflow-hidden shrink-0"
                  style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardImage}
                    alt={pt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent pointer-events-none"
                    style={{ position: 'absolute', inset: 0 }}
                  />

                  {pt.tag && (
                    <span
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-[#4F46E5] shadow-sm"
                      style={{ position: 'absolute', top: '1rem', left: '1rem' }}
                    >
                      {pt.tag}
                    </span>
                  )}
                  {pt.badge && (
                    <span
                      className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#4F46E5] text-white shadow-sm"
                      style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                    >
                      {pt.badge}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors leading-snug">
                      {pt.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#4F46E5]">
                    <Link
                      href={pt.actionHref || '/demo/login'}
                      className="inline-flex items-center gap-1.5 hover:text-[#4338CA] transition-colors group-hover:translate-x-1 transition-transform"
                    >
                      <span>{pt.actionText || 'Eksplor Fitur Ini'}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[11px] text-slate-400 font-mono">0{idx + 1}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner with Generous Spacing */}
        <div
          className="mt-16 sm:mt-24 mb-6 sm:mb-8 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#3730A3] text-white text-center space-y-4 shadow-lg shadow-[#4F46E5]/15"
          style={{ marginTop: '4.5rem', marginBottom: '2rem' }}
        >
          <h2 className="text-xl sm:text-2xl font-bold">Siap Menguji Coba Ekstraksi Dokumen Secara Interaktif?</h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Masuk ke portal demonstrasi dengan pilihan persona Finance Lead, Admin CISO, atau Reviewer.
          </p>
          <div className="pt-2">
            <Link
              href="/demo/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#4F46E5] text-xs font-extrabold shadow-md hover:bg-slate-50 transition-all hover:scale-[1.02]"
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

