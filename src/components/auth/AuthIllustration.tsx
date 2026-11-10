import React from 'react';

interface AuthIllustrationProps {
  mode: 'login' | 'register';
  variant?: 'account' | 'demo';
  className?: string;
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({
  mode,
  variant = 'account',
  className = '',
}) => {
  if (variant === 'demo') {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center p-8 select-none ${className}`}>
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <svg
          viewBox="0 0 500 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-md h-auto drop-shadow-xl"
        >
          {/* Base Backdrop Grid */}
          <rect x="50" y="40" width="400" height="300" rx="20" fill="url(#demo_backdrop)" stroke="#E0E7FF" strokeWidth="2" />
          <path d="M50 100H450" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Persona Card 1 (Super Admin) */}
          <g className="transition-transform duration-700 hover:translate-y--1">
            <rect x="80" y="70" width="160" height="100" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="110" cy="105" r="16" fill="#EEF2FF" />
            <path d="M104 105L108 109L116 101" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="135" y="95" width="85" height="8" rx="4" fill="#0F172A" />
            <rect x="135" y="110" width="60" height="6" rx="3" fill="#64748B" />
            <rect x="95" y="140" width="65" height="16" rx="4" fill="#EEF2FF" />
            <text x="100" y="152" fill="#4F46E5" fontSize="8" fontWeight="bold">SUPER ADMIN</text>
          </g>

          {/* Persona Card 2 (Finance Supervisor) */}
          <g className="transition-transform duration-700 hover:translate-y--1">
            <rect x="260" y="70" width="160" height="100" rx="12" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2" />
            <circle cx="290" cy="105" r="16" fill="#ECFDF5" />
            <path d="M290 97V113M285 102H295" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
            <rect x="315" y="95" width="85" height="8" rx="4" fill="#0F172A" />
            <rect x="315" y="110" width="70" height="6" rx="3" fill="#64748B" />
            <rect x="275" y="140" width="95" height="16" rx="4" fill="#ECFDF5" />
            <text x="280" y="152" fill="#059669" fontSize="8" fontWeight="bold">FINANCE SUPERVISOR</text>
          </g>

          {/* Central Connecting Data Hub */}
          <circle cx="250" cy="240" r="36" fill="#4F46E5" />
          <circle cx="250" cy="240" r="44" stroke="#4F46E5" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="6 4" />
          <path d="M240 235L250 225L260 235M250 227V252" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Flow Lines */}
          <path d="M160 170V210C160 225 180 240 214 240" stroke="#818CF8" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M340 170V210C340 225 320 240 286 240" stroke="#34D399" strokeWidth="2" strokeDasharray="4 4" />

          {/* Floating Pill: Live Sandbox */}
          <g transform="translate(160, 310)">
            <rect width="180" height="32" rx="16" fill="#0F172A" />
            <circle cx="20" cy="16" r="4" fill="#10B981" />
            <text x="32" y="20" fill="#FFFFFF" fontSize="11" fontWeight="bold">Enterprise Demo Sandbox</text>
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="demo_backdrop" x1="50" y1="40" x2="450" y2="340" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="1" stopColor="#EEF2FF" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        <div className="text-center mt-6 max-w-sm space-y-1">
          <h4 className="text-base font-bold text-[#0F172A]">
            {mode === 'login' ? 'Simulasi Peran & Akses Operasional' : 'Daftarkan Profil Simulasi Baru'}
          </h4>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {mode === 'login'
              ? 'Pilih persona profesional untuk menguji otomasi persetujuan, ekstraksi pajak, dan rekonsiliasi faktur.'
              : 'Eksplorasi fleksibilitas hak akses matriks RBAC dengan membuat profil uji coba kustom.'}
          </p>
        </div>
      </div>
    );
  }

  // Variant: Account (Login & Register)
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-8 select-none ${className}`}>
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {mode === 'login' ? (
        // Ilustrasi Mode Login: AI-Powered Document Intelligence
        <svg
          viewBox="0 0 500 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-md h-auto drop-shadow-xl"
        >
          {/* Main Floating Invoice Document */}
          <g transform="translate(130, 40)">
            <rect width="240" height="310" rx="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            {/* Header Document */}
            <rect x="24" y="24" width="40" height="40" rx="8" fill="#4F46E5" />
            <path d="M38 38L42 42L50 34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="76" y="28" width="100" height="10" rx="5" fill="#0F172A" />
            <rect x="76" y="46" width="60" height="8" rx="4" fill="#94A3B8" />

            {/* Document Lines */}
            <rect x="24" y="85" width="192" height="6" rx="3" fill="#E2E8F0" />
            <rect x="24" y="105" width="150" height="6" rx="3" fill="#E2E8F0" />
            <rect x="24" y="125" width="170" height="6" rx="3" fill="#E2E8F0" />

            {/* AI Bounding Box Extraction Area */}
            <rect x="20" y="150" width="200" height="75" rx="8" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="32" y="172" fill="#4F46E5" fontSize="10" fontWeight="bold">AI EXTRACTION ZONE</text>
            <rect x="32" y="184" width="80" height="12" rx="4" fill="#FFFFFF" stroke="#C7D2FE" />
            <rect x="32" y="202" width="110" height="10" rx="4" fill="#4F46E5" fillOpacity="0.2" />

            {/* Bottom Total Pill */}
            <rect x="24" y="250" width="192" height="38" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
            <text x="36" y="274" fill="#0F172A" fontSize="11" fontWeight="bold">Total: Rp 143.985.000</text>
          </g>

          {/* Floating Badge Left: Accuracy Rate */}
          <g transform="translate(60, 160)" className="animate-bounce" style={{ animationDuration: '4s' }}>
            <rect width="110" height="54" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="14" y="26" fill="#64748B" fontSize="9" fontWeight="bold">AI ACCURACY</text>
            <text x="14" y="44" fill="#059669" fontSize="15" fontWeight="900">99.8%</text>
          </g>

          {/* Floating Badge Right: e-Faktur Verified */}
          <g transform="translate(320, 220)" className="animate-bounce" style={{ animationDuration: '5s' }}>
            <rect width="130" height="58" rx="12" fill="#0F172A" />
            <circle cx="28" cy="29" r="12" fill="#10B981" fillOpacity="0.2" />
            <path d="M24 29L27 32L32 26" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="48" y="26" fill="#94A3B8" fontSize="9">STATUS</text>
            <text x="48" y="41" fill="#FFFFFF" fontSize="11" fontWeight="bold">DJP Verified</text>
          </g>
        </svg>
      ) : (
        // Ilustrasi Mode Register: Enterprise Collaboration & Security
        <svg
          viewBox="0 0 500 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-md h-auto drop-shadow-xl"
        >
          {/* Main Workspace Frame */}
          <rect x="70" y="50" width="360" height="280" rx="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M70 110H430" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Left Mini Sidebar */}
          <rect x="70" y="110" width="80" height="220" fill="#F8FAFC" />
          <rect x="85" y="130" width="50" height="8" rx="4" fill="#CBD5E1" />
          <rect x="85" y="150" width="50" height="8" rx="4" fill="#4F46E5" />
          <rect x="85" y="170" width="50" height="8" rx="4" fill="#CBD5E1" />

          {/* Central Analytics Graph */}
          <path d="M180 250L230 200L280 220L340 160L390 180" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="340" cy="160" r="5" fill="#4F46E5" />

          {/* Floating Collaborator 1 */}
          <g transform="translate(170, 70)">
            <circle cx="20" cy="20" r="18" fill="#4F46E5" />
            <text x="14" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold">DL</text>
          </g>

          {/* Floating Collaborator 2 */}
          <g transform="translate(215, 70)">
            <circle cx="20" cy="20" r="18" fill="#059669" />
            <text x="14" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold">BS</text>
          </g>

          {/* Floating Collaborator 3 */}
          <g transform="translate(260, 70)">
            <circle cx="20" cy="20" r="18" fill="#F59E0B" />
            <text x="14" y="25" fill="#FFFFFF" fontSize="12" fontWeight="bold">RP</text>
          </g>

          {/* Shield Security Badge */}
          <g transform="translate(320, 240)">
            <rect width="130" height="60" rx="14" fill="#0F172A" />
            <path d="M25 25L35 20L45 25V35C45 42 35 48 35 48C35 48 25 42 25 35V25Z" fill="#4F46E5" />
            <path d="M32 34L35 37L40 31" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="54" y="32" fill="#94A3B8" fontSize="9">COMPLIANCE</text>
            <text x="54" y="47" fill="#FFFFFF" fontSize="11" fontWeight="bold">SOC2 / ISO</text>
          </g>
        </svg>
      )}

      {/* Caption Text */}
      <div className="text-center mt-6 max-w-sm space-y-1">
        <h4 className="text-base font-bold text-[#0F172A]">
          {mode === 'login' ? 'AI Document Intelligence Platform' : 'Solusi Kolaborasi Finansial Enterprise'}
        </h4>
        <p className="text-xs text-[#64748B] leading-relaxed">
          {mode === 'login'
            ? 'Ekstraksi otomatis untuk Faktur Pajak e-Faktur, Invoice Komersial, PO, dan Dokumen Finansial Indonesia.'
            : 'Kelola alur verifikasi dokumen tim, multi-level approval, dan audit trail kepatuhan dalam satu portal terpadu.'}
        </p>
      </div>
    </div>
  );
};

