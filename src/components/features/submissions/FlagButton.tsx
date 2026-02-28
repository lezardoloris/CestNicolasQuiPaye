'use client';

import { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlagButtonProps {
  submissionId: string;
  className?: string;
}

const FLAG_REASONS = [
  { value: 'inaccurate', label: 'Données inexactes' },
  { value: 'spam', label: 'Spam / Contenu non pertinent' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
] as const;

export function FlagButton({ submissionId, className }: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [hasFlagged, setHasFlagged] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already flagged
  useEffect(() => {
    fetch(`/api/submissions/${submissionId}/flag`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.flagged) {
          setHasFlagged(true);
        }
      })
      .catch(() => {});
  }, [submissionId]);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Veuillez choisir une raison');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          details: details.trim() || undefined,
        }),
      });

      if (res.ok) {
        setHasFlagged(true);
        setOpen(false);
        toast.success('Merci pour votre signalement');
      } else {
        const error = await res.json();
        if (error?.error?.code === 'CONFLICT') {
          setHasFlagged(true);
          setOpen(false);
          toast.info('Vous avez déjà signalé ce contenu');
        } else {
          toast.error(error?.error?.message || 'Erreur lors du signalement');
        }
      }
    } catch {
      toast.error('Erreur lors du signalement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={hasFlagged}
        className={cn('min-h-12 gap-2 text-text-muted hover:text-warning', className)}
        aria-label={hasFlagged ? 'Contenu signalé' : 'Signaler ce contenu'}
      >
        <Flag
          className={cn('h-4 w-4', hasFlagged && 'fill-warning text-warning')}
          aria-hidden="true"
        />
        {hasFlagged ? 'Signalé' : 'Signaler'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler ce contenu</DialogTitle>
            <DialogDescription>
              Indiquez la raison de votre signalement. Nos modérateurs examineront
              votre demande.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text-primary">
                Raison du signalement
              </legend>
              <div className="space-y-2">
                {FLAG_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={cn(
                      'flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors',
                      reason === r.value
                        ? 'border-chainsaw-red bg-surface-elevated text-text-primary'
                        : 'border-border text-text-secondary hover:border-text-muted',
                    )}
                  >
                    <input
                      type="radio"
                      name="flag-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="sr-only"
                      aria-label={r.label}
                    />
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full border-2',
                        reason === r.value
                          ? 'border-chainsaw-red bg-chainsaw-red'
                          : 'border-text-muted',
                      )}
                      aria-hidden="true"
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="flag-details"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Détails (optionnel)
              </label>
              <Textarea
                id="flag-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Précisez votre signalement..."
                rows={3}
                maxLength={500}
                aria-label="Détails supplémentaires"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-h-12"
              aria-label="Annuler le signalement"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
              className="min-h-12"
              aria-label="Confirmer le signalement"
            >
              {isSubmitting ? 'Envoi...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
