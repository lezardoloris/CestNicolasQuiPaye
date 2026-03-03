'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const SESSION_KEY_COUNT = 'anon_vote_count';
const SESSION_KEY_DISMISSED = 'anon_prompt_dismissed';
const VOTES_BEFORE_PROMPT = 3;

/**
 * Increment the anonymous vote counter and return whether the prompt should show.
 * Call this after every successful anonymous vote.
 */
export function incrementAnonVoteCount(): boolean {
  if (typeof window === 'undefined') return false;

  const dismissed = sessionStorage.getItem(SESSION_KEY_DISMISSED);
  if (dismissed === 'true') return false;

  const current = parseInt(sessionStorage.getItem(SESSION_KEY_COUNT) || '0', 10);
  const next = current + 1;
  sessionStorage.setItem(SESSION_KEY_COUNT, String(next));

  return next >= VOTES_BEFORE_PROMPT;
}

interface SoftRegistrationPromptProps {
  visible: boolean;
  onDismiss: () => void;
}

export function SoftRegistrationPrompt({ visible, onDismiss }: SoftRegistrationPromptProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY_DISMISSED, 'true');
    }
    onDismiss();
  }, [onDismiss]);

  // Keyboard dismiss
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, handleDismiss]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Créer un compte"
      className={cn(
        'bg-surface-primary border-border-primary fixed bottom-20 left-4 right-4 z-50 rounded-xl border p-4 shadow-lg md:bottom-6 md:left-auto md:right-6 md:max-w-sm',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
      )}
    >
      <button
        onClick={handleDismiss}
        className="text-text-secondary hover:text-text-primary absolute right-3 top-3"
        aria-label="Fermer"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="bg-drapeau-bleu/10 flex-shrink-0 rounded-full p-2">
          <UserPlus className="text-drapeau-bleu size-5" />
        </div>
        <div>
          <p className="text-text-primary text-sm font-medium">
            3 contributions sans compte.
          </p>
          <p className="text-text-secondary mt-1 text-xs">
            Créez votre profil en 10 secondes pour sauvegarder votre progression.
          </p>
          <Link
            href="/register"
            className="bg-drapeau-bleu mt-3 inline-block rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Créer mon compte
          </Link>
        </div>
      </div>
    </div>
  );
}
