'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useGamificationStore } from '@/stores/gamification-store';
import { Zap } from 'lucide-react';

export function XpToastContainer() {
  const toasts = useGamificationStore((s) => s.xpToasts);
  const removeXpToast = useGamificationStore((s) => s.removeXpToast);

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col-reverse gap-2 md:bottom-6 md:right-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <XpToastItem
            key={toast.id}
            id={toast.id}
            amount={toast.amount}
            leveledUp={toast.leveledUp}
            newLevelTitle={toast.newLevelTitle}
            onDismiss={removeXpToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function XpToastItem({
  id,
  amount,
  leveledUp,
  newLevelTitle,
  onDismiss,
}: {
  id: string;
  amount: number;
  leveledUp: boolean;
  newLevelTitle: string | null;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), leveledUp ? 4000 : 2000);
    return () => clearTimeout(timer);
  }, [id, leveledUp, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`pointer-events-auto rounded-full px-4 py-2 shadow-lg ${
        leveledUp
          ? 'bg-linear-to-r from-yellow-500 to-amber-500 text-white'
          : 'bg-chainsaw-red text-white'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-bold">
        <Zap className="size-4" />
        <span>+{amount} XP</span>
        {leveledUp && newLevelTitle && (
          <span className="ml-1 text-xs font-medium">
            — {newLevelTitle} !
          </span>
        )}
      </div>
    </motion.div>
  );
}
