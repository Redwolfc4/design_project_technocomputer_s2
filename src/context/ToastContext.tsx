'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  XCircleIcon,
  XIcon,
} from '@/components/ui/icons';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastVariant;
  badge?: string | null;
  duration?: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastVariant;
  badge: string | null;
  isDemoContext: boolean;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (input: string | ToastOptions, type?: ToastVariant) => void;
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const DEFAULT_TITLES: Record<ToastVariant, string> = {
  success: 'Berhasil',
  error: 'Validasi Gagal',
  warning: 'Peringatan',
  info: 'Informasi Sistem',
};

let toastSeq = 0;
function createToastId(): string {
  toastSeq += 1;
  return `toast-${Date.now()}-${toastSeq}`;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDemoRoute = Boolean(pathname?.startsWith('/demo'));

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    timersRef.current = {};
    setToasts([]);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
      timersRef.current = {};
    };
  }, []);

  const showToast = useCallback(
    (input: string | ToastOptions, typeArg: ToastVariant = 'success') => {
      const normalized: ToastOptions =
        typeof input === 'string'
          ? { message: input, type: typeArg }
          : { ...input, type: input.type ?? typeArg };

      const variant: ToastVariant = normalized.type ?? 'success';
      const id = createToastId();

      const resolvedBadge =
        normalized.badge !== undefined
          ? normalized.badge
          : isDemoRoute
            ? 'Demo Sandbox'
            : null;

      const isDemoContext =
        isDemoRoute || Boolean(resolvedBadge && resolvedBadge.toLowerCase().includes('demo'));

      const nextItem: ToastItem = {
        id,
        title: normalized.title || DEFAULT_TITLES[variant],
        message: normalized.message,
        type: variant,
        badge: resolvedBadge,
        isDemoContext,
      };

      setToasts((prev) => [...prev.slice(-3), nextItem]);

      const duration = normalized.duration ?? (variant === 'error' ? 4500 : 3600);
      timersRef.current[id] = setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [isDemoRoute, dismissToast]
  );

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
      showToast({ ...options, message, type: 'success' });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
      showToast({ ...options, message, type: 'error' });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
      showToast({ ...options, message, type: 'info' });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
      showToast({ ...options, message, type: 'warning' });
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      success,
      error,
      info,
      warning,
      dismissToast,
      clearToasts,
    }),
    [toasts, showToast, success, error, info, warning, dismissToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-96 pointer-events-none"
        >
          {toasts.map((item) => {
            const variantStyles: Record<
              ToastVariant,
              {
                container: string;
                iconWrap: string;
                titleColor: string;
                icon: React.ReactNode;
              }
            > = {
              success: {
                container: 'bg-[#0F172A] border-emerald-500/40 text-white',
                iconWrap: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                titleColor: 'text-emerald-300',
                icon: <CheckCircleIcon className="w-4 h-4" />,
              },
              error: {
                container: 'bg-rose-950 border-rose-500/50 text-white',
                iconWrap: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                titleColor: 'text-rose-200',
                icon: <XCircleIcon className="w-4 h-4" />,
              },
              warning: {
                container: 'bg-amber-950 border-amber-500/50 text-white',
                iconWrap: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                titleColor: 'text-amber-200',
                icon: <AlertTriangleIcon className="w-4 h-4" />,
              },
              info: {
                container: 'bg-[#0F172A] border-indigo-400/40 text-white',
                iconWrap: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
                titleColor: 'text-indigo-300',
                icon: <SparklesIcon className="w-4 h-4" />,
              },
            };

            const style = variantStyles[item.type];

            return (
              <div
                key={item.id}
                role={item.type === 'error' ? 'alert' : 'status'}
                className={`pointer-events-auto rounded-xl border shadow-2xl px-4 py-3.5 flex items-start gap-3 transition-all duration-200 ${style.container}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${style.iconWrap}`}
                >
                  {style.icon}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold tracking-wide ${style.titleColor}`}>
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                          item.isDemoContext
                            ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                            : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-100 leading-relaxed break-words">
                    {item.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(item.id)}
                  aria-label="Tutup notifikasi"
                  className="p-1 -mr-1 -mt-0.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

