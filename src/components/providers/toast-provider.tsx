'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...item, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => {
          const variant = item.variant || 'info';
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4',
                variant === 'success' &&
                  'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
                variant === 'error' &&
                  'border-rose-500/40 bg-rose-950/90 text-rose-100',
                variant === 'info' &&
                  'border-indigo-500/40 bg-slate-900/95 text-slate-100'
              )}
            >
              {variant === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {variant === 'error' && (
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              {variant === 'info' && (
                <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-semibold">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-xs opacity-90">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar notificação"
                className="rounded-md p-1 opacity-70 hover:opacity-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return ctx;
}
