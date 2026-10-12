import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-indigo-500/30 bg-indigo-500/15 text-indigo-400 dark:text-indigo-300',
        info:
          'border-indigo-500/30 bg-indigo-500/15 text-indigo-400 dark:text-indigo-300',
        secondary:
          'border-border bg-secondary text-secondary-foreground',
        success:
          'border-emerald-500/30 bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
        warning:
          'border-amber-500/30 bg-amber-500/15 text-amber-500 dark:text-amber-400',
        destructive:
          'border-rose-500/30 bg-rose-500/15 text-rose-500 dark:text-rose-400',
        danger:
          'border-rose-500/30 bg-rose-500/15 text-rose-500 dark:text-rose-400',
        purple:
          'border-violet-500/30 bg-violet-500/15 text-violet-500 dark:text-violet-300',
        outline: 'text-foreground border-border',
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
