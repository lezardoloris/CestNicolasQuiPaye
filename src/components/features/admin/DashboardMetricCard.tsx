import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success';
  href?: string;
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: DashboardMetricCardProps) {
  return (
    <Card className="bg-surface-elevated border-border/50">
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'default' && 'bg-chainsaw-red/10 text-chainsaw-red',
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          <p className="text-sm text-text-muted">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
