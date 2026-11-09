'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_PERSONAS } from '@/lib/constants/personas';
import { MockDocumentService } from '@/lib/mocks/storage';
import { UserRole } from '@/types';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { ArrowRightIcon, ShieldCheckIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('finance_supervisor');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const persona = DEMO_PERSONAS[selectedRole];
    if (persona) {
      MockDocumentService.setCurrentUser(persona);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity">
          <BrandLogo size={40} textSize="lg" subtitle="" />
        </Link>
        <h2 className="text-xl font-bold text-[#0F172A]">Masuk ke Portal Operasional</h2>
        <p className="text-xs text-[#64748B]">
          Pilih salah satu peran demo enterprise di bawah ini untuk mengakses simulasi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md border border-[#E2E8F0] sm:rounded-xl sm:px-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#475569]">Pilih Peran Demo:</label>
              <div className="space-y-2">
                {Object.values(DEMO_PERSONAS).map((persona) => {
                  const isChecked = selectedRole === persona.role;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => setSelectedRole(persona.role)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-[#4F46E5] bg-[#EEF2FF]/50'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">{persona.name}</div>
                        <div className="text-[11px] text-[#64748B]">{persona.roleTitle}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-[#4F46E5] px-2 py-0.5 rounded bg-white border border-indigo-200">
                        {persona.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all"
            >
              <span>Masuk Sebagai {DEMO_PERSONAS[selectedRole]?.name.split(' ')[0]}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E2E8F0] text-center">
            <Link href="/" className="text-xs text-[#4F46E5] hover:underline font-semibold">
              ← Kembali ke Beranda DokumenAI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

