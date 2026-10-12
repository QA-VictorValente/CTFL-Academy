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
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
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
    <Card className={cn('hover:border-indigo-500/30 transition-all', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
              accentStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
