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
} from '@/components/ui/icons';
import { MockDocumentService } from '@/lib/mocks/storage';
import { DEMO_PERSONAS } from '@/lib/constants/personas';
import { TruncatedTextWithTooltip } from '@/components/ui/Tooltip';
import { Select, SelectOption } from '@/components/ui/Select';
import { UserRole, UserPersona } from '@/types';
import { useSidebar } from '@/context/SidebarContext';
import { useAppMode } from '@/context/ModeContext';
import { useAppRoutes } from '@/context/RouteContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const { isDemo, isProduction, tenantName, logout, user } = useAppMode();
  const { getRoute } = useAppRoutes();

  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    return MockDocumentService.getCurrentUser();
  });

  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const docs = MockDocumentService.getDocuments();
    setPendingCount(docs.filter((d) => d.status === 'needs_review').length);
    setCurrentUser(MockDocumentService.getCurrentUser());
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    const persona = DEMO_PERSONAS[newRole];
    if (persona) {
      MockDocumentService.setCurrentUser(persona);
      setCurrentUser(persona);
      window.location.reload();
    }
  };

  const demoRoleOptions: SelectOption<UserRole>[] = [
    {
      value: 'finance_supervisor',
      label: 'Finance & Tax Supervisor',
      description: 'Persona: Dewi Lestari',
      badge: 'Approval',
    },
    {
      value: 'super_admin',
      label: 'Super Admin / CISO',
      description: 'Persona: Budi Santoso',
      badge: 'Full',
    },
    {
      value: 'document_reviewer',
      label: 'Document Specialist',
      description: 'Persona: Rizky Pratama',
      badge: 'HITL',
    },
    {
      value: 'auditor',
      label: 'Compliance Auditor',
      description: 'Persona: Siti Aminah',
      badge: 'Read/Audit',
    },
  ];

  const navItems: NavItem[] = [
    { label: 'Ringkasan Utama', href: getRoute(''), icon: BarChart3Icon },
    { label: 'Unggah Batch', href: getRoute('/upload'), icon: UploadCloudIcon },
    {
      label: 'Antrean Verifikasi',
      href: getRoute('/verification'),
      icon: CheckSquareIcon,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Repositori Dokumen', href: getRoute('/documents'), icon: FileTextIcon },
    { label: 'Ekspor & Integrasi', href: getRoute('/export'), icon: DownloadIcon },
    { label: 'Audit Trail Forensik', href: getRoute('/audit'), icon: ShieldCheckIcon },
    { label: 'Tim & Hak Akses', href: getRoute('/users'), icon: UsersIcon },
    { label: 'Pengaturan Workspace', href: getRoute('/settings'), icon: SettingsIcon },
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

      {/* Drawer Sidebar: Fixed on viewport, left 0, top 0, width w-72 (288px) */}
      <aside
        className={`w-72 border-r border-[#E2E8F0] dark:border-[#1F2937] bg-white dark:bg-[#111827] flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-200 ease-in-out select-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0] dark:border-[#1F2937]">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size={36} textSize="base" />
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
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2 flex items-center justify-between">
              <span>Peran Pengguna Demo</span>
              <span className="text-[10px] bg-[#4F46E5] text-white px-2 py-0.5 rounded font-extrabold shadow-sm">
                SANDBOX
              </span>
            </div>
            <Select<UserRole>
              size="sm"
              value={currentUser.role}
              options={demoRoleOptions}
              onChange={handleRoleChange}
              aria-label="Peran Pengguna Demo"
              minDropdownWidth={256}
            />
          </div>
        ) : (
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center justify-between">
              <span>Tenant Korporat</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Koneksi Aktif" />
            </div>
            <div className="text-sm font-bold text-[#0F172A] truncate">
              {tenantName}
            </div>
            <div className="text-xs text-[#64748B] mt-0.5">
              Cabang: Menara Astra Lt. 28, Jakarta
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-[#EEF2FF] dark:bg-[#1E1B4B]/80 text-[#4F46E5] dark:text-[#818CF8] font-bold shadow-sm'
                  : 'text-[#475569] dark:text-gray-400 hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937] hover:text-[#0F172A] dark:hover:text-gray-200'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${isActive
                      ? 'text-[#4F46E5] dark:text-[#818CF8]'
                      : 'text-[#64748B] dark:text-gray-400'
                      }`}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-[#4F46E5] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card Footer */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#1F2937] bg-[#FAFAFF] dark:bg-[#0D1322]/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm ring-2 ring-[#EEF2FF] shrink-0 shadow-sm">
              {(isProduction && user?.name ? user.name : currentUser.name)
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <TruncatedTextWithTooltip
                text={isProduction && user?.name ? user.name : currentUser.name}
                className="text-sm font-semibold text-[#0F172A] dark:text-gray-200"
                position="top"
              />
              <TruncatedTextWithTooltip
                text={isProduction && user?.roleTitle ? user.roleTitle : currentUser.roleTitle}
                className="text-xs text-[#64748B] dark:text-[#94A3B8]"
                position="top"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Keluar Sesi"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOutIcon className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
