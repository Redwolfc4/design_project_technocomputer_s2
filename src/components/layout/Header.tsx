'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRightIcon, MenuIcon, XIcon } from '@/components/ui/icons';
import { BrandLogo } from '@/components/shared/BrandLogo';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/product', label: 'Produk' },
  { href: '/features', label: 'Fitur Utama' },
  { href: '/solutions', label: 'Solusi Pajak & AP' },
  { href: '/security', label: 'Keamanan & Audit' },
  { href: '/pricing', label: 'Paket Demo' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Reset menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle click outside & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle window resize -> close mobile menu if breakpoint >= lg (1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md sticky top-0 z-50 py-3 sm:py-4">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo and Desktop Links */}
        <div className="flex items-center gap-8 xl:gap-10">
          <Link href="/" className="hover:opacity-90 transition-opacity shrink-0">
            <BrandLogo size={36} textSize="base" />
          </Link>

          {/* Desktop Navigation Links (>= lg) */}
          <nav
            aria-label="Navigasi Desktop"
            className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-semibold"
          >
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#4F46E5] font-bold'
                      : 'text-[#475569] hover:text-[#4F46E5]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Action Buttons (>= lg) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 py-2 transition-colors whitespace-nowrap"
          >
            Masuk Akun
          </Link>
          <Link
            href="/demo/login"
            className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all shadow-[#4F46E5]/20 hover:shadow-md hover:shadow-[#4F46E5]/30 whitespace-nowrap"
          >
            <span>Eksplor Dashboard Demo</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile / Tablet Hamburger Toggle Button (< lg) */}
        <div className="flex lg:hidden items-center">
          <button
            ref={toggleBtnRef}
            type="button"
            className="p-2 -mr-2 rounded-lg text-[#0F172A] hover:bg-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition-colors"
            aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <XIcon className="w-6 h-6 text-[#0F172A]" />
            ) : (
              <MenuIcon className="w-6 h-6 text-[#0F172A]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile and Tablet Dropdown Navigation (< lg) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id="mobile-navigation"
          aria-label="Navigasi Mobile"
          className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#E2E8F0] shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="max-w-screen-2xl mx-auto px-6 py-5 flex flex-col space-y-4">
            <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-[#475569]">
              {NAV_LINKS.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold'
                        : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#4F46E5]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col space-y-2.5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] py-2.5 rounded-lg transition-colors border border-transparent hover:border-[#E2E8F0]"
              >
                Masuk Akun
              </Link>
              <Link
                href="/demo/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all shadow-[#4F46E5]/20 hover:shadow-md hover:shadow-[#4F46E5]/30"
              >
                <span>Eksplor Dashboard Demo</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

