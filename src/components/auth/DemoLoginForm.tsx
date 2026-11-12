'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { ArrowRightIcon } from '@/components/ui/icons';
import { DEMO_PERSONAS } from '@/lib/constants/personas';
import { formatRoleLabel } from '@/lib/utils/formatters';
import { MockDocumentService } from '@/lib/mocks/storage';
import { MockAuthService } from '@/lib/services/mockAuth';
import { UserRole } from '@/types';

interface DemoLoginFormProps {
  onSwitchToRegister: () => void;
}

export const DemoLoginForm: React.FC<DemoLoginFormProps> = ({ onSwitchToRegister }) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('finance_supervisor');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const persona = DEMO_PERSONAS[selectedRole];
    if (persona) {
      setIsLoading(true);
      setTimeout(() => {
        MockDocumentService.setCurrentUser(persona);
        MockAuthService.loginDemo(persona);
        router.push('/demo/dashboard');
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="space-y-2">
          <BrandLogo size={36} textSize="base" subtitle="" />
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Portal Operasional Demo
          </h2>
          <p className="text-xs text-[#64748B]">
            Pilih salah satu peran demo enterprise di bawah ini untuk mengakses simulasi
          </p>
        </div>

        {/* Persona Selector Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#475569]">Pilih Peran Demo:</label>
            <div className="space-y-2">
              {Object.values(DEMO_PERSONAS).map((persona) => {
                const isChecked = selectedRole === persona.role;
                return (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedRole(persona.role)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/60 shadow-xs ring-2 ring-[#4F46E5]/10'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">{persona.name}</div>
                      <div className="text-[11px] text-[#64748B]">{persona.roleTitle}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-[#4F46E5] px-2 py-0.5 rounded bg-white border border-indigo-200 shadow-2xs">
                      {formatRoleLabel(persona.role)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Membuka Sesi Demo...</span>
              </span>
            ) : (
              <>
                <span>Masuk Sebagai {DEMO_PERSONAS[selectedRole]?.name.split(' ')[0]}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Demo Register */}
      <div className="pt-6 border-t border-[#E2E8F0] text-center space-y-2">
        <p className="text-xs text-[#64748B]">
          Ingin mencoba mendaftarkan peran baru?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#4F46E5] hover:underline cursor-pointer"
          >
            Daftar Simulasi Demo
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

