'use client';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatEUR } from '@/lib/utils/format';
import { REFERENCE_SALARIES } from '@/lib/constants/tax-2026';

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
}

const QUICK_BUTTONS = [
  { label: 'SMIC', value: REFERENCE_SALARIES.smic },
  { label: 'Médian', value: REFERENCE_SALARIES.median },
  { label: 'Moyen', value: REFERENCE_SALARIES.moyen },
] as const;

export function SalaryInput({ value, onChange }: SalaryInputProps) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
      <label htmlFor="salary-input" className="mb-3 block text-sm font-medium text-text-secondary">
        Salaire brut annuel
      </label>

      <div className="mb-4 text-center">
        <span className="font-display text-3xl font-bold tabular-nums text-text-primary">
          {formatEUR(value)}
        </span>
        <span className="ml-2 text-sm text-text-muted">/an</span>
      </div>

      <Slider
        id="salary-input"
        min={0}
        max={200_000}
        step={500}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="mb-4 [&_[data-slot=slider-range]]:bg-chainsaw-red [&_[data-slot=slider-thumb]]:border-chainsaw-red"
        aria-label="Salaire brut annuel"
      />

      <div className="mb-4 flex items-center justify-between text-xs text-text-muted">
        <span>0 €</span>
        <span>200 000 €</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_BUTTONS.map((btn) => (
          <Button
            key={btn.label}
            variant={value === btn.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(btn.value)}
            className="text-xs"
          >
            {btn.label}
          </Button>
        ))}
        <div className="ml-auto">
          <input
            type="number"
            min={0}
            max={200_000}
            step={100}
            value={value}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0 && v <= 200_000) onChange(v);
            }}
            className="w-28 rounded-md border border-border-default bg-surface-primary px-3 py-1.5 text-right text-sm tabular-nums text-text-primary focus:border-chainsaw-red focus:outline-none"
            aria-label="Saisir un montant exact"
          />
        </div>
      </div>
    </div>
  );
}
