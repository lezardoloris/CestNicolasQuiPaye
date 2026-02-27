'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Lightbulb, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FEATURE_PROPOSAL_CATEGORIES } from '@/lib/utils/validation';

interface FeatureProposalFormProps {
  onSuccess?: () => void;
}

export function FeatureProposalForm({ onSuccess }: FeatureProposalFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('general');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Erreur lors de la soumission');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Proposition soumise avec succes');
      setTitle('');
      setDescription('');
      setCategory('general');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['features'] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const isValid =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    category.length > 0;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="min-h-12 gap-2"
        aria-label="Proposer une fonctionnalite"
      >
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        Proposer une idee
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proposer une fonctionnalite</DialogTitle>
            <DialogDescription>
              Decrivez votre idee pour ameliorer LIBERAL. La communaute pourra
              voter pour les propositions les plus interessantes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="feature-title"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Titre
              </label>
              <Input
                id="feature-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ajouter un filtre par ministere"
                maxLength={200}
                aria-label="Titre de la proposition"
              />
              <p className="mt-1 text-xs text-text-muted">
                {title.length}/200 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="feature-description"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Description
              </label>
              <Textarea
                id="feature-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez votre idee en detail..."
                rows={4}
                maxLength={1000}
                aria-label="Description de la proposition"
              />
              <p className="mt-1 text-xs text-text-muted">
                {description.length}/1000 caracteres (min. 10)
              </p>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text-primary">
                Categorie
              </legend>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FEATURE_PROPOSAL_CATEGORIES).map(([key, label]) => (
                  <label
                    key={key}
                    className={cn(
                      'flex min-h-10 cursor-pointer items-center rounded-md border px-3 py-1.5 text-sm transition-colors',
                      category === key
                        ? 'border-chainsaw-red bg-chainsaw-red/10 text-chainsaw-red'
                        : 'border-border text-text-secondary hover:border-text-muted',
                    )}
                  >
                    <input
                      type="radio"
                      name="feature-category"
                      value={key}
                      checked={category === key}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sr-only"
                      aria-label={label}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-h-12"
              aria-label="Annuler"
            >
              Annuler
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!isValid || mutation.isPending}
              className="min-h-12"
              aria-label="Soumettre la proposition"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                'Soumettre'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
