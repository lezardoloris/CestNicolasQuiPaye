import { Badge } from '@/components/ui/badge';
import { ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, FileText, Users, Bot } from 'lucide-react';
import { formatRelativeTime, formatEUR, formatEURPrecise, formatDateFr } from '@/lib/utils/format';
import { getCategoryDef } from '@/lib/constants/categories';
import type { ModerationDetailData, AiContextData, ModerationActionRecord } from '@/types/moderation-detail';

// ─── Submission Info ──────────────────────────────────────────────────

export function SubmissionInfoSection({
  title,
  description,
  ministryTag,
  authorDisplay,
  moderationStatus,
  createdAt,
}: {
  title: string;
  description: string;
  ministryTag: string | null;
  authorDisplay: string;
  moderationStatus: string;
  createdAt: string;
}) {
  const category = getCategoryDef(ministryTag);
  const CategoryIcon = category?.icon;

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>{authorDisplay}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{formatRelativeTime(createdAt)}</span>
        <Badge variant="secondary" className="text-xs">
          {moderationStatus}
        </Badge>
        {category && (
          <Badge variant="outline" className="gap-1 text-xs">
            {CategoryIcon && <CategoryIcon className="h-3 w-3" aria-hidden="true" />}
            {category.label}
          </Badge>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
    </section>
  );
}

// ─── Cost & Source ────────────────────────────────────────────────────

export function CostSection({
  amount,
  costPerTaxpayer,
  sourceUrl,
}: {
  amount: string;
  costPerTaxpayer: string | null;
  sourceUrl: string;
}) {
  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-chainsaw-red/20 bg-surface-secondary p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-chainsaw-red">{formatEUR(amount)}</span>
          {costPerTaxpayer && (
            <span className="text-xs text-text-muted">
              {formatEURPrecise(costPerTaxpayer)} / contribuable
            </span>
          )}
        </div>
      </div>
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-info hover:underline break-all"
      >
        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {sourceUrl}
      </a>
    </section>
  );
}

// ─── Community Signals ───────────────────────────────────────────────

export function CommunitySignalsSection({
  upvoteCount,
  downvoteCount,
  fourPosEssentielCount,
  fourPosJustifieCount,
  fourPosDiscutableCount,
  fourPosInjustifieCount,
  fourPosTotalCount,
  consensusType,
  approveWeight,
  rejectWeight,
  solutionCount,
  noteCount,
  sourceCount,
}: {
  upvoteCount: number;
  downvoteCount: number;
  fourPosEssentielCount: number;
  fourPosJustifieCount: number;
  fourPosDiscutableCount: number;
  fourPosInjustifieCount: number;
  fourPosTotalCount: number;
  consensusType: string | null;
  approveWeight: number;
  rejectWeight: number;
  solutionCount: number;
  noteCount: number;
  sourceCount: number;
}) {
  return (
    <section className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Signaux communautaires
      </h4>

      {/* Votes */}
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-success">
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
          {upvoteCount}
        </span>
        <span className="inline-flex items-center gap-1 text-destructive">
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
          {downvoteCount}
        </span>
        {consensusType && (
          <Badge variant="outline" className="text-xs">
            {consensusType}
          </Badge>
        )}
      </div>

      {/* 4-position breakdown */}
      {fourPosTotalCount > 0 && (
        <div className="space-y-1.5">
          <FourPosBar
            essentiel={fourPosEssentielCount}
            justifie={fourPosJustifieCount}
            discutable={fourPosDiscutableCount}
            injustifie={fourPosInjustifieCount}
            total={fourPosTotalCount}
          />
          <div className="grid grid-cols-2 gap-1 text-xs text-text-muted">
            <span>Essentiel: {fourPosEssentielCount}</span>
            <span>Justifie: {fourPosJustifieCount}</span>
            <span>Discutable: {fourPosDiscutableCount}</span>
            <span>Injustifie: {fourPosInjustifieCount}</span>
          </div>
        </div>
      )}

      {/* Validation weights */}
      {(approveWeight > 0 || rejectWeight > 0) && (
        <div className="flex gap-3 text-xs text-text-muted">
          <span className="text-success">Approbation: {approveWeight}</span>
          <span className="text-destructive">Rejet: {rejectWeight}</span>
        </div>
      )}

      {/* Engagement counts */}
      <div className="flex flex-wrap gap-3 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" aria-hidden="true" />
          {solutionCount} solutions
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3 w-3" aria-hidden="true" />
          {noteCount} notes
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" aria-hidden="true" />
          {sourceCount} sources
        </span>
      </div>
    </section>
  );
}

function FourPosBar({
  essentiel,
  justifie,
  discutable,
  injustifie,
  total,
}: {
  essentiel: number;
  justifie: number;
  discutable: number;
  injustifie: number;
  total: number;
}) {
  const pct = (v: number) => `${((v / total) * 100).toFixed(1)}%`;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full" role="img" aria-label="Repartition des positions">
      <div className="bg-emerald-500" style={{ width: pct(essentiel) }} />
      <div className="bg-sky-500" style={{ width: pct(justifie) }} />
      <div className="bg-amber-500" style={{ width: pct(discutable) }} />
      <div className="bg-red-500" style={{ width: pct(injustifie) }} />
    </div>
  );
}

// ─── AI Context ──────────────────────────────────────────────────────

export function AiContextSection({ aiContext }: { aiContext: AiContextData | null }) {
  if (!aiContext) {
    return (
      <section className="rounded-lg border border-border-default/50 bg-surface-secondary p-3">
        <p className="text-xs text-text-muted italic">Contexte IA non disponible</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h4 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
        Contexte IA ({aiContext.source})
      </h4>

      {aiContext.budgetContext && (
        <div className="rounded-md border-l-2 border-info bg-surface-secondary p-2.5 text-xs leading-relaxed text-text-secondary">
          {aiContext.budgetContext}
        </div>
      )}

      {aiContext.costComparison && (
        <div className="rounded-md border-l-2 border-chainsaw-red/40 bg-surface-secondary p-2.5 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap">
          {aiContext.costComparison}
        </div>
      )}

      {aiContext.summary && (
        <div className="rounded-md border-l-2 border-purple-500/40 bg-surface-secondary p-2.5 text-xs italic leading-relaxed text-text-secondary">
          {aiContext.summary}
        </div>
      )}

      {aiContext.voteSummary && (
        <div className="rounded-md border-l-2 border-purple-500 bg-surface-secondary p-2.5 text-xs leading-relaxed text-text-secondary">
          <span className="font-medium">Tendance vote :</span> {aiContext.voteSummary}
        </div>
      )}

      {aiContext.solutionSummary && (
        <div className="rounded-md border-l-2 border-amber-500 bg-surface-secondary p-2.5 text-xs leading-relaxed text-text-secondary">
          <span className="font-medium">Solutions :</span> {aiContext.solutionSummary}
        </div>
      )}
    </section>
  );
}

// ─── Moderation History ──────────────────────────────────────────────

const ACTION_STYLES: Record<string, string> = {
  approve: 'bg-success/10 text-success border-success/30',
  reject: 'bg-destructive/10 text-destructive border-destructive/30',
  request_edit: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  remove: 'bg-chainsaw-red/10 text-chainsaw-red border-chainsaw-red/30',
};

const ACTION_LABELS: Record<string, string> = {
  approve: 'Approuve',
  reject: 'Rejete',
  request_edit: 'Modification demandee',
  remove: 'Retire',
};

export function ModerationHistorySection({
  history,
}: {
  history: ModerationActionRecord[];
}) {
  if (history.length === 0) {
    return (
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Historique
        </h4>
        <p className="mt-1 text-xs text-text-muted italic">Aucune action precedente</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Historique ({history.length})
      </h4>
      <div className="space-y-2">
        {history.map((entry) => (
          <div key={entry.id} className="rounded-md border border-border-default/50 bg-surface-secondary p-2.5">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${ACTION_STYLES[entry.action] ?? ''}`}
              >
                {ACTION_LABELS[entry.action] ?? entry.action}
              </Badge>
              <span className="text-xs text-text-muted">
                {entry.adminDisplay} &middot; {formatRelativeTime(entry.createdAt)}
              </span>
            </div>
            {entry.reason && (
              <p className="mt-1 text-xs text-text-secondary">{entry.reason}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
