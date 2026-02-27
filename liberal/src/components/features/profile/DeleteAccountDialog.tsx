'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText === 'SUPPRIMER';

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (isDeleting) return;
      if (nextOpen) {
        // Reset state when opening
        setConfirmText('');
        setError(null);
        // Focus the input after the dialog animation completes
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      onOpenChange(nextOpen);
    },
    [isDeleting, onOpenChange],
  );

  async function handleDelete() {
    if (!isConfirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'SUPPRIMER' }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? 'Une erreur est survenue. Veuillez reessayer.');
        setIsDeleting(false);
        return;
      }

      // Set flash message cookie
      document.cookie = `liberal_flash=${encodeURIComponent('Votre compte a ete supprime.')}; path=/; max-age=60`;

      // Sign out and redirect
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isDeleting}
        onEscapeKeyDown={isDeleting ? (e) => e.preventDefault() : undefined}
        className="bg-surface-secondary border-border-default"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-6 text-chainsaw-red shrink-0" />
            <DialogTitle className="font-display text-xl text-text-primary">
              Supprimer votre compte
            </DialogTitle>
          </div>
          <DialogDescription className="text-text-secondary">
            Cette action est irreversible. Toutes vos donnees personnelles seront
            supprimees. Vos signalements publies seront anonymises.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-chainsaw-red mt-0.5">&#x2022;</span>
              Votre email et mot de passe seront supprimes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chainsaw-red mt-0.5">&#x2022;</span>
              Votre pseudonyme sera supprime
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chainsaw-red mt-0.5">&#x2022;</span>
              Vos votes seront supprimes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chainsaw-red mt-0.5">&#x2022;</span>
              Vos signalements seront anonymises sous &quot;Utilisateur supprime&quot;
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chainsaw-red mt-0.5">&#x2022;</span>
              Vos commentaires seront anonymises sous &quot;Utilisateur supprime&quot;
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="deleteConfirm"
              className="text-sm font-medium text-text-primary"
            >
              Tapez SUPPRIMER pour confirmer
            </label>
            <Input
              id="deleteConfirm"
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              disabled={isDeleting}
              aria-describedby={error ? 'delete-error' : undefined}
              className="bg-surface-primary border-border-default text-text-primary"
            />
            {error && (
              <p id="delete-error" role="alert" className="text-sm text-chainsaw-red">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="text-text-secondary"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Suppression en cours...
              </>
            ) : (
              'Confirmer la suppression'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
