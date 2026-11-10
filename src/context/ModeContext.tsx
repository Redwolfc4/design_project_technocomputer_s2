'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MockAuthService, AuthUser } from '@/lib/services/mockAuth';

export type AppEnvironmentMode = 'demo' | 'production';

interface ModeContextType {
  mode: AppEnvironmentMode;
  isDemo: boolean;
  isProduction: boolean;
  user: AuthUser | null;
  tenantName: string;
  setMode: (mode: AppEnvironmentMode) => void;
  switchToDemo: () => void;
  switchToProduction: () => void;
  logout: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Mode is resolved primarily from route (/demo/* vs /dashboard/*) or session
  const [mode, setModeState] = useState<AppEnvironmentMode>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/demo')) return 'demo';
      const savedUser = MockAuthService.getCurrentUser();
      if (savedUser && !savedUser.isDemo) return 'production';
    }
    return 'demo'; // Default to demo for safety
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      return MockAuthService.getCurrentUser();
    }
    return null;
  });

  // Keep mode in sync with URL
  useEffect(() => {
    if (pathname.startsWith('/demo')) {
      setModeState('demo');
    } else if (pathname.startsWith('/dashboard')) {
      const savedUser = MockAuthService.getCurrentUser();
      if (savedUser && !savedUser.isDemo) {
        setModeState('production');
      } else {
        setModeState('demo');
      }
    }
  }, [pathname]);

  const isDemo = mode === 'demo';
  const isProduction = mode === 'production';
  const tenantName = isProduction
    ? 'PT Nusantara Teknologi Cipta Tbk (HQ Jakarta)'
    : 'Nusantara Enterprise Sandbox Environment';

  const setMode = (newMode: AppEnvironmentMode) => {
    setModeState(newMode);
    if (newMode === 'demo') {
      router.push('/demo/login');
    } else {
      router.push('/login');
    }
  };

  const switchToDemo = () => setMode('demo');
  const switchToProduction = () => setMode('production');

  const logout = () => {
    MockAuthService.logout();
    setUser(null);
    if (isDemo) {
      router.push('/demo/login');
    } else {
      router.push('/login');
    }
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        isDemo,
        isProduction,
        user,
        tenantName,
        setMode,
        switchToDemo,
        switchToProduction,
        logout,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useAppMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within a ModeProvider');
  }
  return context;
};

