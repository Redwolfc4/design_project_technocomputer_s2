'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { DEMO_PERSONAS } from '@/lib/constants/personas';
import { UsersIcon, ShieldCheckIcon } from '@/components/ui/icons';

export default function UsersManagementPage() {
  const [users, setUsers] = useState(Object.values(DEMO_PERSONAS));

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Pengguna, Peran & Hak Akses Tim"
        subtitle="Kelola izin verifikasi dokumen, tingkat approval keuangan, dan akun auditor eksternal"
      />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        <div className="p-4 rounded-xl border border-indigo-200 bg-[#EEF2FF]/60 flex items-center justify-between text-xs text-[#4F46E5]">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="w-5 h-5 text-[#4F46E5] shrink-0" />
            <span>
              <strong>Matriks Role-Based Access Control (RBAC):</strong> Hak akses verifikator, persetujuan keuangan, dan audit terisolasi sesuai prinsip pemisahan tugas (Separation of Duties).
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#FAFAFF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">Nama Anggota</th>
                  <th className="py-3 px-5">Departemen</th>
                  <th className="py-3 px-5">Peran Sistem</th>
                  <th className="py-3 px-5">Hak Akses Kunci</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs text-[#334155]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#0F172A]">{user.name}</div>
                      <div className="text-[11px] text-[#64748B]">{user.email}</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#475569]">
                      {user.department}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded text-[11px]">
                        {user.roleTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[11px] text-[#64748B]">
                      {user.permissions.slice(0, 3).join(', ')}...
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

