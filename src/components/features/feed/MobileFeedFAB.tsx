'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileFeedFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB after scrolling past the hero area (~400px)
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed right-4 bottom-20 z-40 md:hidden"
        >
          <Link
            href="/submit"
            aria-label="Signaler une dépense"
            className={cn(
              'bg-chainsaw-red flex items-center gap-2 rounded-full px-4 py-3',
              'text-sm font-semibold text-white',
              'shadow-chainsaw-red/30 shadow-lg',
              'hover:bg-chainsaw-red-hover hover:shadow-chainsaw-red/40 transition-all duration-200',
              'active:scale-95',
            )}
          >
            <PlusCircle className="size-5" aria-hidden="true" />
            <span>Signaler</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
