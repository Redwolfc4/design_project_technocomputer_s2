'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { ArrowRightIcon } from '@/components/ui/icons';
import { MockDocumentService } from '@/lib/mocks/storage';
import { MockAuthService } from '@/lib/services/mockAuth';
import { UserPersona, UserRole } from '@/types';

interface DemoRegisterFormProps {
  onSwitchToLogin: () => void;
}

export const DemoRegisterForm: React.FC<DemoRegisterFormProps> = ({ onSwitchToLogin }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('document_reviewer');
  const [department, setDepartment] = useState('Financial Audit Operations');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama lengkap peserta demo wajib diisi.');
      return;
    }

    setIsLoading(true);
    const newPersona: UserPersona = {
      id: `custom-${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@demo-company.co.id`,
      role,
      roleTitle:
        role === 'super_admin'
          ? 'Super Admin (Simulasi)'
          : role === 'finance_supervisor'
          ? 'Finance Supervisor (Simulasi)'
          : role === 'auditor'
          ? 'Auditor Eksternal (Simulasi)'
          : 'Document Specialist (Simulasi)',
      department,
      avatar: '/demo-documents/avatar.png',
      permissions: ['read', 'write', 'verify'],
    };

    setTimeout(() => {
      MockDocumentService.setCurrentUser(newPersona);
      MockAuthService.loginDemo(newPersona);
      router.push('/demo/dashboard');
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="space-y-2">
          <BrandLogo size={36} textSize="base" subtitle="" />
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Daftar Peran Demo Custom
          </h2>
          <p className="text-xs text-[#64748B]">
            Buat profil peran kustom Anda sendiri untuk menguji simulasi alur verifikasi AI
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Demo Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#475569]">Nama Peserta Demo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Anugerah Saputra, M.Ak."
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#475569]">Pilih Level Hak Akses Simulasi</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all cursor-pointer"
            >
              <option value="document_reviewer">Document Specialist (Reviewer Verifikasi)</option>
              <option value="finance_supervisor">Finance & Tax Supervisor (Persetujuan Keuangan)</option>
              <option value="auditor">Compliance Auditor (Inspeksi Forensik)</option>
              <option value="super_admin">Super Admin / CISO (Akses Penuh)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#475569]">Departemen / Divisi</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Divisi Akuntansi / Pajak"
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all cursor-pointer disabled:opacity-70 mt-3"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyiapkan Sesi Simulasi...</span>
              </span>
            ) : (
              <>
                <span>Mulai Simulasi Demo Sekarang</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Demo Login */}
      <div className="pt-6 border-t border-[#E2E8F0] text-center space-y-2">
        <p className="text-xs text-[#64748B]">
          Sudah punya peran yang ingin dipakai?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#4F46E5] hover:underline cursor-pointer"
          >
            Pilih Peran Demo
          </button>
        </p>

        <div>
          <a href="/" className="text-[11px] text-[#94A3B8] hover:text-[#475569] font-medium transition-colors">
            ← Kembali ke Beranda DokumenAI
          </a>
        </div>
      </div>
    </div>
  );
};
