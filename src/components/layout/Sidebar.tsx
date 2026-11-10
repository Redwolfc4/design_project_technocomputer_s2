'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileTextIcon,
  BarChart3Icon,
  UploadCloudIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SettingsIcon,
  UsersIcon,
  DownloadIcon,
  XIcon,
} from '@/components/ui/icons';
import { MockDocumentService } from '@/lib/mocks/storage';
import { UserPersona, UserRole } from '@/types';
import { DEMO_PERSONAS } from '@/lib/constants/personas';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { useSidebar } from '@/context/SidebarContext';

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_PERSONAS.finance_supervisor);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const user = MockDocumentService.getCurrentUser();
    setCurrentUser(user);

    const updateCounts = () => {
      const docs = MockDocumentService.getDocuments();
      const needsReview = docs.filter((d) => d.status === 'needs_review').length;
      setPendingCount(needsReview);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleKey = e.target.value as UserRole;
    const persona = DEMO_PERSONAS[roleKey];
    if (persona) {
      MockDocumentService.setCurrentUser(persona);
      setCurrentUser(persona);
      window.location.reload();
    }
  };

  // Menu items: Analisis Operasional telah digabung ke dalam Ringkasan Utama
  const navItems = [
    { label: 'Ringkasan Utama', href: '/dashboard', icon: BarChart3Icon },
    { label: 'Unggah Batch', href: '/dashboard/upload', icon: UploadCloudIcon },
    {
      label: 'Antrean Verifikasi',
      href: '/dashboard/verification',
      icon: CheckCircleIcon,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Repositori Dokumen', href: '/dashboard/documents', icon: FileTextIcon },
    { label: 'Ekspor & Integrasi', href: '/dashboard/export', icon: DownloadIcon },
    { label: 'Audit Trail Forensik', href: '/dashboard/audit', icon: ShieldCheckIcon },
    { label: 'Tim & Hak Akses', href: '/dashboard/users', icon: UsersIcon },
    { label: 'Pengaturan Workspace', href: '/dashboard/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (< lg) */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer: Fixed on lg, slide-over on mobile/tablet */}
      <aside
        className={`w-64 border-r border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-200 ease-in-out select-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0] dark:border-[#1F2937]">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size={32} />
          </Link>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace & Role Switcher */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1F2937] bg-[#FAFAFF] dark:bg-[#0D1322]/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5 flex items-center justify-between">
            <span>Peran Pengguna Demo</span>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-1 rounded font-medium">
              Simulasi Aktif
            </span>
          </div>
          <select
            value={currentUser.role}
            onChange={handleRoleChange}
            className="w-full text-xs bg-white dark:bg-[#1F2937] border border-[#CBD5E1] dark:border-[#374151] rounded-md px-2.5 py-1.5 font-medium text-[#0F172A] dark:text-gray-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#4F46E5] cursor-pointer"
          >
            <option value="finance_supervisor">Finance & Tax Supervisor (Dewi)</option>
            <option value="super_admin">Super Admin / CISO (Budi)</option>
            <option value="document_reviewer">Document Specialist (Rizky)</option>
            <option value="auditor">Compliance Auditor (Siti)</option>
          </select>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${isActive
                    ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B]/80 text-[#4F46E5] dark:text-[#818CF8] font-semibold'
                    : 'text-[#475569] dark:text-gray-400 hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937] hover:text-[#0F172A] dark:hover:text-gray-200'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive
                        ? 'text-[#4F46E5] dark:text-[#818CF8]'
                        : 'text-[#64748B] dark:text-gray-400'
                      }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-[#4F46E5] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-5 text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1F2937] bg-[#FAFAFF] dark:bg-[#0D1322]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#EEF2FF] shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#0F172A] dark:text-gray-200 truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">
                {currentUser.roleTitle}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
