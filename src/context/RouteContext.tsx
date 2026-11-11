'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';

export interface RouteContextType {
  isDemo: boolean;
  basePath: string; // '/demo/dashboard' or '/dashboard'
  getRoute: (subpath: string) => string;
}

const RouteContext = createContext<RouteContextType>({
  isDemo: false,
  basePath: '/dashboard',
  getRoute: (subpath: string) => `/dashboard${subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : ''}`,
});

export const RouteProvider: React.FC<{ children: React.ReactNode; isDemo?: boolean }> = ({
  children,
  isDemo: isDemoProp,
}) => {
  const pathname = usePathname();
  const isDemo = isDemoProp !== undefined ? isDemoProp : (pathname?.startsWith('/demo') ?? false);
  const basePath = isDemo ? '/demo/dashboard' : '/dashboard';

  const value = useMemo(() => {
    return {
      isDemo,
      basePath,
      getRoute: (subpath: string) => {
        const cleanSub = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
        return `${basePath}${cleanSub}`;
      },
    };
  }, [isDemo, basePath]);

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};

export const useAppRoutes = (): RouteContextType => {
  return useContext(RouteContext);
};
