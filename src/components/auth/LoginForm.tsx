'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { EyeIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/ui/icons';
import { MockAuthService } from '@/lib/services/mockAuth';
import { useToast } from '@/context/ToastContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  isDemo?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, isDemo = false }) => {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState(() => MockAuthService.getRememberEmail() || 'finance@nusantara-tech.co.id');
  const [password, setPassword] = useState('EnterprisePass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      const msg = 'Harap masukkan alamat email perusahaan yang valid.';
      setErrorMsg(msg);
      toast.error(msg, {
        title: 'Autentikasi Gagal',
        badge: isDemo ? 'Demo Sandbox' : 'Akun Enterprise',
      });
      return;
    }

    if (!password || password.length < 6) {
      const msg = 'Kata sandi harus terdiri dari minimal 6 karakter.';
      setErrorMsg(msg);
      toast.error(msg, {
        title: 'Autentikasi Gagal',
        badge: isDemo ? 'Demo Sandbox' : 'Akun Enterprise',
      });
      return;
    }

    setIsLoading(true);

    if (rememberMe) {
      MockAuthService.setRememberEmail(trimmedEmail);
    } else {
      MockAuthService.clearRememberEmail();
    }

    setTimeout(() => {
      MockAuthService.loginAccount(trimmedEmail);
      toast.success(`Selamat datang kembali di workspace DokumenAI Enterprise (${trimmedEmail}).`, {
        title: 'Login Berhasil',
        badge: isDemo ? 'Demo Sandbox' : 'Akun Enterprise',
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
            Welcome Back
          </h2>
          <p className="text-xs text-[#64748B]">
            Sign in to your enterprise workspace to access intelligent processing
          </p>
        </div>

        {/* Status Toast Banner */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#475569]">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs font-semibold pl-3.5 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5"
              />
              <span className="text-xs text-[#64748B] font-medium">Remember me on this browser</span>
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
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Register Banner */}
      <div className="pt-6 border-t border-[#E2E8F0] text-center space-y-2">
        <p className="text-xs text-[#64748B]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#4F46E5] hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </p>

        <div>
          <Link href="/" className="text-[11px] text-[#94A3B8] hover:text-[#475569] font-medium transition-colors">
            ← Kembali ke Beranda DokumenAI
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal Notice */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2.5 text-[#4F46E5]">
              <CheckCircleIcon className="w-5 h-5 text-[#4F46E5]" />
              <h4 className="font-bold text-sm text-[#0F172A]">Reset Password Layanan</h4>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Pada lingkungan simulasi enterprise, reset kata sandi dikelola oleh CISO / IT Administrator instansi Anda. Silakan hubungi tim IT Internal untuk reset kredensial.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

