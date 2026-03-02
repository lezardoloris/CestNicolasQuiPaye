'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatEUR } from '@/lib/utils/format';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import type { BudgetMission } from '@/types/simulator';

interface BudgetAllocationChartProps {
  allocation: BudgetMission[];
  totalTaxes: number;
}

export function BudgetAllocationChart({ allocation, totalTaxes }: BudgetAllocationChartProps) {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
      <h3 className="mb-1 text-sm font-medium text-text-secondary">
        Où va votre argent (IR + TVA)
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Répartition indicative basée sur la Loi de Finances 2026
      </p>

      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="w-full md:w-1/2">
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
            <PieChart>
              <Pie
                data={allocation}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 55}
                outerRadius={isMobile ? 80 : 100}
                paddingAngle={1}
              >
                {allocation.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload as BudgetMission;
                  return (
                    <div className="rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-text-primary">
                        {d.icon} {d.label}
                      </p>
                      <p className="text-text-secondary">
                        {formatEUR(d.amount)} ({d.percentage} %)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-1.5 md:w-1/2">
          {allocation.map((mission) => (
            <div key={mission.label} className="flex items-center gap-2 text-xs">
              <div
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: mission.color }}
              />
              <span className="flex-1 truncate text-text-secondary">
                {mission.icon} {mission.label}
              </span>
              <span className="tabular-nums font-medium text-text-primary">
                {formatEUR(mission.amount)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border-default pt-2 text-xs">
            <span className="font-medium text-text-secondary">Total</span>
            <span className="font-bold tabular-nums text-chainsaw-red">
              {formatEUR(totalTaxes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
