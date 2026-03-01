'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface FamilySituationSelectorProps {
  isSingle: boolean;
  nbChildren: number;
  nbParts: number;
  onSingleChange: (isSingle: boolean) => void;
  onChildrenChange: (nbChildren: number) => void;
}

export function FamilySituationSelector({
  isSingle,
  nbChildren,
  nbParts,
  onSingleChange,
  onChildrenChange,
}: FamilySituationSelectorProps) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-secondary p-5">
      <p className="mb-3 text-sm font-medium text-text-secondary">Situation familiale</p>

      <div className="mb-4 flex gap-2">
        <Button
          variant={isSingle ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSingleChange(true)}
          className="flex-1"
        >
          Célibataire
        </Button>
        <Button
          variant={!isSingle ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSingleChange(false)}
          className="flex-1"
        >
          Couple
        </Button>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm text-text-secondary">Enfants à charge</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onChildrenChange(Math.max(0, nbChildren - 1))}
            disabled={nbChildren === 0}
            aria-label="Retirer un enfant"
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-8 text-center font-display text-xl font-bold tabular-nums text-text-primary">
            {nbChildren}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onChildrenChange(Math.min(10, nbChildren + 1))}
            disabled={nbChildren >= 10}
            aria-label="Ajouter un enfant"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-surface-primary px-3 py-2 text-center">
        <span className="text-sm text-text-muted">Quotient familial : </span>
        <span className="font-display text-lg font-bold text-chainsaw-red">
          {nbParts} {nbParts > 1 ? 'parts' : 'part'}
        </span>
      </div>
    </div>
  );
}
