'use client';

import React, { useState, useEffect } from 'react';
import { AuthIllustration } from './AuthIllustration';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { DemoLoginForm } from './DemoLoginForm';
import { DemoRegisterForm } from './DemoRegisterForm';

interface AnimatedAuthLayoutProps {
  initialMode?: 'login' | 'register';
  variant?: 'account' | 'demo';
}

export const AnimatedAuthLayout: React.FC<AnimatedAuthLayoutProps> = ({
  initialMode = 'login',
  variant = 'account',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sync mode changes with browser history state without full-page reload
  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      const targetUrl =
        variant === 'demo'
          ? newMode === 'login'
            ? '/demo/login'
            : '/demo/register'
          : newMode === 'login'
          ? '/login'
          : '/register';
      window.history.pushState(null, '', targetUrl);
    }
  };

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen w-full bg-[#FAFAFF] flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden font-sans">
      {/* Outer Card Container */}
      <div className="relative w-full max-w-5xl min-h-[640px] bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* ======================================================== */}
        {/* DESKTOP SPLIT-SCREEN ANIMATED CONTAINERS (>= lg)         */}
        {/* ======================================================== */}
        <div className="hidden lg:block w-full h-full absolute inset-0 pointer-events-none">
          {/* Animated Illustration Panel */}
          <div
            className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-br from-[#FAFAFF] via-[#EEF2FF]/60 to-[#E0E7FF]/40 border-r border-[#E2E8F0] transition-all duration-500 ease-in-out pointer-events-auto z-10 flex items-center justify-center ${
              isLogin ? 'left-0 translate-x-0' : 'left-0 translate-x-full border-l border-r-0 border-[#E2E8F0]'
            }`}
          >
            <div
              className={`w-full h-full transition-opacity duration-300 ${
                isLogin ? 'opacity-100' : 'opacity-100'
              }`}
            >
              <AuthIllustration mode={mode} variant={variant} />
            </div>
          </div>

          {/* Animated Form Slide Track */}
          <div
            className={`absolute top-0 bottom-0 w-1/2 transition-transform duration-500 ease-in-out pointer-events-auto z-20 flex items-center justify-center overflow-y-auto ${
              isLogin ? 'left-1/2 translate-x-0' : 'left-0 translate-x-0'
            }`}
          >
            <div className="w-full py-8">
              {variant === 'demo' ? (
                isLogin ? (
                  <DemoLoginForm onSwitchToRegister={() => handleSwitchMode('register')} />
                ) : (
                  <DemoRegisterForm onSwitchToLogin={() => handleSwitchMode('login')} />
                )
              ) : isLogin ? (
                <LoginForm onSwitchToRegister={() => handleSwitchMode('register')} />
              ) : (
                <RegisterForm onSwitchToLogin={() => handleSwitchMode('login')} />
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE & TABLET FALLBACK VIEW (< lg)                     */}
        {/* ======================================================== */}
        <div className="lg:hidden w-full flex flex-col justify-between py-6">
          <div className="w-full max-h-48 overflow-hidden flex items-center justify-center border-b border-slate-100 mb-2">
            <AuthIllustration mode={mode} variant={variant} className="scale-75 -my-8" />
          </div>

          <div className="w-full">
            {variant === 'demo' ? (
              isLogin ? (
                <DemoLoginForm onSwitchToRegister={() => handleSwitchMode('register')} />
              ) : (
                <DemoRegisterForm onSwitchToLogin={() => handleSwitchMode('login')} />
              )
            ) : isLogin ? (
              <LoginForm onSwitchToRegister={() => handleSwitchMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => handleSwitchMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

