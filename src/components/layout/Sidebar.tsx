'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import {
  BarChart3Icon,
  FileTextIcon,
  CheckSquareIcon,
  DownloadIcon,
  ShieldCheckIcon,
  UsersIcon,
  SettingsIcon,
  UploadCloudIcon,
  XIcon,
  LogOutIcon,
  ChevronDownIcon,
} from '@/components/ui/icons';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DEMO_PERSONAS } from '@/lib/constants/personas';
import { UserRole, UserPersona } from '@/types';
import { useSidebar } from '@/context/SidebarContext';
import { useAppMode } from '@/context/ModeContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const { isDemo, isProduction, tenantName, logout } = useAppMode();

  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    return MockDocumentService.getCurrentUser();
  });

  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const docs = MockDocumentService.getDocuments();
    setPendingCount(docs.filter((d) => d.status === 'needs_review').length);
    setCurrentUser(MockDocumentService.getCurrentUser());
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    const persona = DEMO_PERSONAS[newRole];
    if (persona) {
      MockDocumentService.setCurrentUser(persona);
      setCurrentUser(persona);
      window.location.reload();
    }
  };

  const navItems: NavItem[] = [
    { label: 'Ringkasan Utama', href: '/dashboard', icon: BarChart3Icon },
    { label: 'Unggah Batch', href: '/dashboard/upload', icon: UploadCloudIcon },
    {
      label: 'Antrean Verifikasi',
      href: '/dashboard/verification',
      icon: CheckSquareIcon,
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
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Drawer Sidebar: Fixed on viewport, left 0, top 0, width 256px */}
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
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Tutup sidebar"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode: Role Switcher | Production Mode: Locked Tenant Profile */}
        {isDemo ? (
          <div className="p-4 border-b border-amber-200 bg-amber-50/60 dark:bg-amber-950/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400 mb-1.5 flex items-center justify-between">
              <span>Peran Pengguna Demo</span>
              <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-extrabold border border-amber-300">
                SANDBOX
              </span>
            </div>
            <select
              value={currentUser.role}
              onChange={handleRoleChange}
              className="w-full text-xs bg-white dark:bg-[#1F2937] border border-amber-300 rounded-md px-2.5 py-1.5 font-semibold text-[#0F172A] shadow-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="finance_supervisor">Finance & Tax Supervisor (Dewi)</option>
              <option value="super_admin">Super Admin / CISO (Budi)</option>
              <option value="document_reviewer">Document Specialist (Rizky)</option>
              <option value="auditor">Compliance Auditor (Siti)</option>
            </select>
          </div>
        ) : (
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1 flex items-center justify-between">
              <span>Tenant Korporat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Koneksi Aktif" />
            </div>
            <div className="text-xs font-bold text-[#0F172A] truncate">
              {tenantName}
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">
              Cabang: Menara Astra Lt. 28, Jakarta
            </div>
          </div>
        )}

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
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1F2937] bg-[#FAFAFF] dark:bg-[#0D1322]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
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

          <button
            type="button"
            onClick={logout}
            title="Keluar Sesi"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
