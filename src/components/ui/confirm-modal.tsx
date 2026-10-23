'use client';

import * as React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ConfirmModalProps {
  open: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  isLoading = false,
  children,
}: ConfirmModalProps) {
  if (!open) return null;

  const handleDismiss = onClose || onCancel || (() => {});

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 text-card-foreground ring-1 ring-border">
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isLoading}
          aria-label="Fechar modal"
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={
              variant === 'destructive'
                ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary'
            }
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2
              id="confirm-modal-title"
              className="text-lg font-semibold leading-tight"
            >
              {title}
            </h2>
            <p
              id="confirm-modal-desc"
              className="mt-2 text-sm text-muted-foreground"
            >
              {description}
            </p>
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
