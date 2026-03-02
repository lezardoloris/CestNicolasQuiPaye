'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronDown, PlusCircle, Github, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactEUR, formatCompactNumber } from '@/lib/utils/format';
import type { PlatformStats } from '@/lib/api/stats';

interface HeroSectionProps {
  stats?: PlatformStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AnimatePresence initial={false}>
      {!collapsed ? (
        <motion.section
          key="hero-expanded"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-label="Présentation de Nicolas Paye"
          className="border-b border-border-default px-4 py-4"
        >
          {/* Top row: headline + collapse */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-text-primary text-xl leading-tight font-black tracking-tight sm:text-2xl">
              TRONÇONNONS LES <span className="text-chainsaw-red">DÉPENSES PUBLIQUES.</span>
            </h1>
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Réduire la présentation"
              className="text-text-muted hover:bg-surface-elevated hover:text-text-secondary shrink-0 rounded-md p-1.5 transition-colors"
            >
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Inline stats row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <span>
              <span className="font-display font-black tabular-nums text-chainsaw-red">
                {stats ? formatCompactEUR(stats.totalAmountEur) : '--'}
              </span>
              <span className="ml-1 text-text-muted">documentés</span>
            </span>
            <span>
              <span className="font-display font-bold tabular-nums text-text-primary">
                {stats ? formatCompactEUR(stats.costPerTaxpayer) : '--'}
              </span>
              <span className="ml-1 text-text-muted">/contribuable</span>
            </span>
            <span>
              <span className="font-display font-bold tabular-nums text-text-primary">
                {stats ? formatCompactNumber(stats.totalSubmissions) : '--'}
              </span>
              <span className="ml-1 text-text-muted">signalements</span>
            </span>
          </div>

          {/* CTA row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/submit"
              className={cn(
                'bg-chainsaw-red inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5',
                'text-sm font-semibold text-white',
                'hover:bg-chainsaw-red-hover transition-all duration-200',
                'focus-visible:ring-chainsaw-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              )}
              id="hero-cta-submit"
            >
              <PlusCircle className="size-4" aria-hidden="true" />
              Signaler une dépense
            </Link>
            <a
              href="https://github.com/lezardoloris/CestNicolasQuiPaye"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            >
              <Github className="size-3.5" aria-hidden="true" />
              Contribuer sur GitHub
              <span className="inline-flex items-center gap-0.5 rounded-full bg-chainsaw-red/10 px-1.5 py-0.5 text-[10px] font-bold text-chainsaw-red">
                <Zap className="size-2.5" />
                +50 XP
              </span>
            </a>
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="hero-collapsed"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="border-b border-border-default"
        >
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Déplier la présentation"
            className={cn(
              'flex w-full items-center justify-between gap-2',
              'text-text-secondary px-4 py-2.5 text-sm',
              'hover:bg-surface-secondary/50 hover:text-text-primary transition-colors',
            )}
          >
            <span className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt=""
                width={120}
                height={20}
                className="h-4 w-auto opacity-60"
              />
              <span className="font-medium">Tronçonnons les dépenses publiques.</span>
              <span className="text-text-muted hidden sm:inline">
                — Chaque euro compte. Chaque citoyen aussi.
              </span>
            </span>
            <ChevronDown
              className="text-text-muted size-4 rotate-180"
              aria-hidden="true"
              style={{ transform: 'rotate(180deg)' }}
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
