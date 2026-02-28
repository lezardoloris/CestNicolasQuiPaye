'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';

interface ModerationActionItem {
  action: string;
  reason: string | null;
  createdAt: string;
  submissionTitle: string;
  adminName: string | null;
}

interface RecentActivityFeedProps {
  actions: ModerationActionItem[];
}

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  approve: { label: 'Approuve', variant: 'default' },
  reject: { label: 'Rejete', variant: 'destructive' },
  request_edit: { label: 'Modification demandee', variant: 'secondary' },
  remove: { label: 'Retire', variant: 'destructive' },
};

export function RecentActivityFeed({ actions }: RecentActivityFeedProps) {
  if (actions.length === 0) {
    return (
      <Card className="bg-surface-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Activite recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Aucune action recente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Activite recente</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" role="list" aria-label="Actions de moderation recentes">
          {actions.map((action, idx) => {
            const actionInfo = ACTION_LABELS[action.action] ?? {
              label: action.action,
              variant: 'outline' as const,
            };

            return (
              <li
                key={idx}
                className="flex items-start gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={actionInfo.variant} className="text-xs">
                      {actionInfo.label}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {formatRelativeTime(action.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary line-clamp-1">
                    {action.submissionTitle}
                  </p>
                  {action.reason && (
                    <p className="text-xs text-text-muted line-clamp-1">
                      Raison : {action.reason}
                    </p>
                  )}
                  <p className="text-xs text-text-muted">
                    Par {action.adminName ?? 'Admin'}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
