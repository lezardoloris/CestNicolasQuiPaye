'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { displayNameSchema } from '@/lib/validators/display-name';
import { resolveDisplayName } from '@/lib/utils/user-display';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WelcomeDisplayNameModalProps {
  open: boolean;
  onClose: () => void;
  anonymousId: string;
}

export default function WelcomeDisplayNameModal({
  open,
  onClose,
  anonymousId,
}: WelcomeDisplayNameModalProps) {
  const router = useRouter();
  const { update } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewName = resolveDisplayName(
    displayName.trim() || null,
    anonymousId,
  );

  async function handleChooseName() {
    setError(null);
    setIsLoading(true);

    const parsed = displayNameSchema.safeParse({ displayName: displayName.trim() });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setError(fieldErrors.displayName?.[0] ?? 'Donnees invalides');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/display-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? 'Une erreur est survenue');
        setIsLoading(false);
        return;
      }

      await update({ name: displayName.trim(), displayName: displayName.trim() });
      toast.success('Pseudonyme choisi avec succes');
      dismissAndClose();
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleStayAnonymous() {
    dismissAndClose();
  }

  function dismissAndClose() {
    // Set cookie to prevent modal from reappearing
    document.cookie = 'liberal_welcome_dismissed=true; path=/; max-age=31536000'; // 1 year
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="bg-surface-secondary border-border-default"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-text-primary">
            Bienvenue !
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Vous pouvez choisir un pseudonyme ou rester anonyme en tant que{' '}
            <strong className="text-chainsaw-red">{anonymousId}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="welcomeDisplayName"
              className="text-sm font-medium text-text-primary"
            >
              Pseudonyme
            </label>
            <Input
              id="welcomeDisplayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              placeholder="Votre pseudonyme"
              aria-describedby={error ? 'welcome-name-error' : 'welcome-name-counter'}
              aria-invalid={!!error}
              className="bg-surface-primary border-border-default text-text-primary"
            />
            <div className="flex items-center justify-between">
              {error ? (
                <p
                  id="welcome-name-error"
                  role="alert"
                  className="text-sm text-chainsaw-red"
                >
                  {error}
                </p>
              ) : (
                <span />
              )}
              <span id="welcome-name-counter" className="text-xs text-text-muted">
                {displayName.length}/100
              </span>
            </div>
          </div>

          {/* Live preview */}
          <p className="text-sm text-text-muted">
            Vous apparaitrez comme :{' '}
            <strong className="text-text-primary">{previewName}</strong>
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleStayAnonymous}
              disabled={isLoading}
              className="text-text-secondary"
            >
              Rester anonyme
            </Button>
            <Button
              type="button"
              onClick={handleChooseName}
              disabled={isLoading || !displayName.trim()}
              className="bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Choisir ce pseudo'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
