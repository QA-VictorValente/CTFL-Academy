import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors ring-1 ring-inset',
  {
    variants: {
      variant: {
        default:
          'ring-primary/30 bg-primary/10 text-primary',
        info:
          'ring-sky-600/30 bg-sky-500/10 text-sky-800 dark:text-sky-300',
        secondary:
          'ring-border bg-secondary text-secondary-foreground',
        success:
          'ring-emerald-600/30 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300',
        warning:
          'ring-amber-600/30 bg-amber-500/12 text-amber-800 dark:text-amber-300',
        destructive:
          'ring-rose-600/30 bg-rose-500/12 text-rose-800 dark:text-rose-300',
        danger:
          'ring-rose-600/30 bg-rose-500/12 text-rose-800 dark:text-rose-300',
        purple:
          'ring-teal-600/30 bg-teal-500/12 text-teal-800 dark:text-teal-300',
        outline: 'text-foreground ring-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
