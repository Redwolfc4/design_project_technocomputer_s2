'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { EyeIcon, ArrowRightIcon } from '@/components/ui/icons';
import { MockAuthService } from '@/lib/services/mockAuth';
import { useToast } from '@/context/ToastContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  isDemo?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, isDemo = false }) => {
  const router = useRouter();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: 'Lemah', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Cukup', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Bagus', color: 'bg-indigo-500' };
      case 4:
      default:
        return { score: 100, label: 'Sangat Kuat', color: 'bg-emerald-500' };
    }
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const badgeLabel = isDemo ? 'Demo Sandbox' : 'Akun Enterprise';
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      const msg = 'Nama lengkap minimal harus 2 karakter.';
      setErrorMsg(msg);
      toast.error(msg, { title: 'Pendaftaran Gagal', badge: badgeLabel });
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      const msg = 'Harap masukkan alamat email perusahaan yang valid.';
      setErrorMsg(msg);
      toast.error(msg, { title: 'Pendaftaran Gagal', badge: badgeLabel });
      return;
    }

    if (!password || password.length < 6) {
      const msg = 'Kata sandi harus terdiri dari minimal 6 karakter.';
      setErrorMsg(msg);
      toast.error(msg, { title: 'Pendaftaran Gagal', badge: badgeLabel });
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Konfirmasi kata sandi tidak cocok.';
      setErrorMsg(msg);
      toast.error(msg, { title: 'Pendaftaran Gagal', badge: badgeLabel });
      return;
    }

    if (!agreeTerms) {
      const msg = 'Anda harus menyetujui syarat & ketentuan simulasi enterprise.';
      setErrorMsg(msg);
      toast.error(msg, { title: 'Pendaftaran Gagal', badge: badgeLabel });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      MockAuthService.registerAccount(trimmedName, trimmedEmail);
      toast.success(`Akun enterprise untuk ${trimmedName} berhasil dibuat dan langsung aktif.`, {
        title: 'Registrasi Berhasil',
        badge: badgeLabel,
      });
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col justify-between gap-6">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="space-y-2">
          <BrandLogo size={36} textSize="base" subtitle="" />
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-[#64748B]">
            Start managing your enterprise documents intelligently with automated AI
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#475569]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Pratama Wijaya, S.E."
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#475569]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.co.id"
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#475569]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full text-xs font-semibold pl-3.5 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>Kekuatan Sandi</span>
                  <span className="font-bold">{passwordStrength.label}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#475569]">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi..."
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
              required
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5 mt-0.5"
              />
              <span className="text-xs text-[#64748B] leading-tight">
                Saya menyetujui{' '}
                <Link href="/terms" className="text-[#4F46E5] hover:underline" target="_blank">
                  Ketentuan Layanan
                </Link>{' '}
                &{' '}
                <Link href="/privacy" className="text-[#4F46E5] hover:underline" target="_blank">
                  Kebijakan Privasi
                </Link>{' '}
                DokumenAI Enterprise
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-md shadow-[#4F46E5]/25 transition-all cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Create Enterprise Account</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Login Link */}
      <div className="pt-6 border-t border-[#E2E8F0] text-center space-y-2">
        <p className="text-xs text-[#64748B]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#4F46E5] hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>

        <div>
          <Link href="/" className="text-[11px] text-[#94A3B8] hover:text-[#475569] font-medium transition-colors">
            ← Kembali ke Beranda DokumenAI
          </Link>
        </div>
      </div>
    </div>
  );
};

