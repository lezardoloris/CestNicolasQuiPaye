'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { formatCompactEUR } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { BudgetKpiCard } from './BudgetKpiCard';
import {
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_WRAPPER_STYLE,
} from '@/lib/constants/chart-styles';
import { SocialFraudSection } from './SocialFraudSection';
import type { SocialSpendingItem, SocialFraudItem } from '@/lib/constants/budget-2026';

interface SocialSpendingSectionProps {
  socialProtection: SocialSpendingItem[];
  socialProtectionTotalBn: number;
  healthSpending: SocialSpendingItem[];
  healthSpendingTotalBn: number;
  socialFraud: SocialFraudItem[];
  socialFraudEstimatedTotalBn: number;
  secuDeficit2024Bn: number;
}

export function SocialSpendingSection({
  socialProtection,
  socialProtectionTotalBn,
  healthSpending,
  healthSpendingTotalBn,
  socialFraud,
  socialFraudEstimatedTotalBn,
  secuDeficit2024Bn,
}: SocialSpendingSectionProps) {
  const isMobile = useIsMobile();

  const protectionData = useMemo(() =>
    socialProtection.map((item) => ({
      ...item,
      amountEur: item.amountBn * 1_000_000_000,
    })),
    [socialProtection],
  );

  const healthData = useMemo(() =>
    healthSpending.map((item) => ({
      ...item,
      amountEur: item.amountBn * 1_000_000_000,
    })),
    [healthSpending],
  );

  return (
    <div className="space-y-8">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <BudgetKpiCard
          value={formatCompactEUR(socialProtectionTotalBn * 1_000_000_000)}
          label="Protection sociale (COFOG 2024)"
          color="text-chainsaw-red"
        />
        <BudgetKpiCard
          value={formatCompactEUR(healthSpendingTotalBn * 1_000_000_000)}
          label="Dépenses de santé (DCSi 2024)"
        />
        <BudgetKpiCard
          value={`-${secuDeficit2024Bn} Md€`}
          label="Déficit Sécu (2024)"
          color="text-warning"
        />
        <BudgetKpiCard
          value={`~${socialFraudEstimatedTotalBn} Md€`}
          label="Fraude sociale estimée/an"
          color="text-chainsaw-red"
        />
      </div>

      {/* Comparaison UE */}
      <div className="rounded-lg border border-info/20 bg-info/5 p-4 text-sm text-text-secondary">
        <p>
          La France consacre <strong className="text-text-primary">31,5% de son PIB</strong> à
          la protection sociale, contre <strong className="text-text-primary">26,6%</strong> en
          moyenne dans l&apos;UE — soit environ{' '}
          <strong className="text-text-primary">140 Md&euro; de plus</strong> que la moyenne
          européenne à PIB égal. Elle est{' '}
          <strong className="text-text-primary">1re en Europe</strong> pour les dépenses
          d&apos;assurance maladie et les prestations chômage.
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Protection sociale donut */}
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
          <h3 className="mb-1 text-base font-semibold text-text-primary">
            Protection sociale ({socialProtectionTotalBn} Md&euro;)
          </h3>
          <p className="mb-3 text-xs text-text-muted">
            Répartition COFOG 2024 — 41% des dépenses publiques
          </p>
          <div role="img" aria-label="Graphique de la répartition de la protection sociale (693 Md€) : retraites, maladie, famille, chômage, logement">
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 220}>
            <PieChart>
              <Pie
                data={protectionData}
                dataKey="amountEur"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 35 : 45}
                outerRadius={isMobile ? 60 : 80}
                paddingAngle={2}
                stroke="var(--color-surface-secondary)"
                strokeWidth={2}
              >
                {protectionData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
                formatter={(value, name) => {
                  const item = protectionData.find((d) => d.name === String(name));
                  const pct = item ? ` (${item.pctOfTotal}%)` : '';
                  return [formatCompactEUR(Number(value)), `${String(name)}${pct}`];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {protectionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-text-secondary">{item.name}</span>
                <span className="font-mono text-xs font-semibold tabular-nums text-text-primary">
                  {item.amountBn} Md&euro;
                </span>
                <span className="w-10 text-right font-mono text-xs tabular-nums text-text-muted">
                  {item.pctOfTotal}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Santé bar chart */}
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface-secondary p-4">
          <h3 className="mb-1 text-base font-semibold text-text-primary">
            Dépenses de santé ({healthSpendingTotalBn} Md&euro;)
          </h3>
          <p className="mb-3 text-xs text-text-muted">
            DREES DCSi 2024 — 11,4% du PIB (+3,6% vs 2023)
          </p>
          <div role="img" aria-label="Graphique des dépenses de santé (333 Md€) : soins hospitaliers, soins de ville, médicaments et autres postes">
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
            <BarChart data={healthData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis
                type="number"
                tickFormatter={(v: number) => formatCompactEUR(v)}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 100 : 160}
                tick={{ fill: 'var(--color-text-secondary)', fontSize: isMobile ? 10 : 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
                labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                itemStyle={CHART_TOOLTIP_ITEM_STYLE}
                wrapperStyle={CHART_TOOLTIP_WRAPPER_STYLE}
                formatter={(value) => [formatCompactEUR(Number(value)), 'Montant']}
                labelFormatter={(label) => {
                  const item = healthData.find((d) => d.name === String(label));
                  return item ? `${item.name} (${item.pctOfTotal}%)` : String(label);
                }}
              />
              <Bar dataKey="amountEur" radius={[0, 4, 4, 0]}>
                {healthData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Financement : Sécu 78,7% — Complémentaires 12,8% — Reste à charge ménages 7,8%
            (~292&euro;/habitant/an).
          </p>
        </div>
      </div>

      {/* ══════ FRAUDE SOCIALE ══════ */}
      <SocialFraudSection
        socialFraud={socialFraud}
        socialFraudEstimatedTotalBn={socialFraudEstimatedTotalBn}
        secuDeficit2024Bn={secuDeficit2024Bn}
      />

      <p className="text-xs text-text-muted">
        Sources : DREES — Comptes de la santé 2024, INSEE Première n&deg;2093 (COFOG 2024),
        Cour des comptes — Sécurité sociale 2025, CNAM rapport charges &amp; produits 2025,
        DNLF rapport 2024, HCFiPS, IFRAP, Sénat.
      </p>
    </div>
  );
}
