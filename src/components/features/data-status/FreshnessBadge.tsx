import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FreshnessStatus } from '@/lib/utils/denominator-freshness';

interface FreshnessBadgeProps {
  status: FreshnessStatus;
  label: string;
}

export default function FreshnessBadge({
  status,
  label,
}: FreshnessBadgeProps) {
  if (status === 'fresh') {
    return (
      <Badge
        variant="outline"
        className="border-success/30 bg-success/10 text-success gap-1"
      >
        <CheckCircle className="h-3 w-3" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-warning/30 bg-warning/10 text-warning gap-1"
    >
      <AlertTriangle className="h-3 w-3" />
      {label}
    </Badge>
  );
}
