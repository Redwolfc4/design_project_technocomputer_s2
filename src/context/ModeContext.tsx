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

export const ModeProvider: React.FC<{ children: React.ReactNode; defaultMode?: AppEnvironmentMode }> = ({
  children,
  defaultMode,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Mode is resolved primarily from defaultMode prop, pathname (/demo/* vs /dashboard/*), or session
  const [mode, setModeState] = useState<AppEnvironmentMode>(() => {
    if (defaultMode) return defaultMode;
    if (pathname?.startsWith('/demo')) return 'demo';
    if (pathname?.startsWith('/dashboard')) return 'production';
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/demo')) return 'demo';
      if (window.location.pathname.startsWith('/dashboard')) return 'production';
      const savedUser = MockAuthService.getCurrentUser();
      if (savedUser && !savedUser.isDemo) return 'production';
    }
    return 'production'; // Live is the main enterprise dashboard path
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
      setModeState('production');
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
      router.push('/demo/dashboard');
    } else {
      router.push('/dashboard');
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

