'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Lightbulb, Share2, ArrowUpDown, X } from 'lucide-react';
import { XpRewardBadge } from './XpRewardBadge';

type NudgeAction = 'source_added' | 'note_written' | 'solution_proposed' | 'comment_posted';

interface PostActionNudgeProps {
  action: NudgeAction;
  visible: boolean;
  onDismiss: () => void;
}

const NUDGE_CONFIG: Record<NudgeAction, {
  text: string;
  xpAction: 'community_note_written' | 'solution_proposed' | 'share' | 'solution_upvoted';
  icon: typeof BookOpen;
  scrollTo?: string;
}> = {
  source_added: {
    text: 'Ajoutez du contexte avec une note',
    xpAction: 'community_note_written',
    icon: BookOpen,
    scrollTo: 'community-notes',
  },
  note_written: {
    text: 'Proposez une solution',
    xpAction: 'solution_proposed',
    icon: Lightbulb,
    scrollTo: 'solutions',
  },
  solution_proposed: {
    text: 'Partagez ce signalement',
    xpAction: 'share',
    icon: Share2,
  },
  comment_posted: {
    text: 'Votez sur les solutions ci-dessus',
    xpAction: 'solution_upvoted',
    icon: ArrowUpDown,
    scrollTo: 'solutions',
  },
};

const AUTO_DISMISS_MS = 8000;

/** In-place nudge banner suggesting the next contribution action. */
export function PostActionNudge({ action, visible, onDismiss }: PostActionNudgeProps) {
  const config = NUDGE_CONFIG[action];

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  function handleClick() {
    if (config.scrollTo) {
      document.getElementById(config.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onDismiss();
  }

  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-chainsaw-red/20 bg-chainsaw-red/5 px-3 py-2">
            <Icon className="size-4 shrink-0 text-chainsaw-red" aria-hidden="true" />
            <button
              onClick={handleClick}
              className="flex flex-1 items-center gap-2 text-left text-xs font-medium text-text-primary hover:text-chainsaw-red"
            >
              {config.text}
              <XpRewardBadge actionType={config.xpAction} variant="pill" />
            </button>
            <button
              onClick={onDismiss}
              aria-label="Fermer"
              className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
