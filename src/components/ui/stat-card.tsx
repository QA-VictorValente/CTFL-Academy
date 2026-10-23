import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'blue';
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const accentStyles = {
  indigo: 'text-primary',
  violet: 'text-teal-700 dark:text-teal-400',
  emerald: 'text-emerald-700 dark:text-emerald-400',
  amber: 'text-amber-700 dark:text-amber-400',
  rose: 'text-rose-700 dark:text-rose-400',
  blue: 'text-sky-700 dark:text-sky-400',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'indigo',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('hover:ring-primary/35 transition-colors', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/70',
              accentStyles[accent]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
