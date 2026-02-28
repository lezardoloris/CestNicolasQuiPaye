'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronDown, PlusCircle, ShieldCheck, TrendingUp } from 'lucide-react';
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
          className="border-border-default relative mb-6 overflow-hidden rounded-xl border"
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0 -z-10"
            aria-hidden="true"
            style={{
              background: 'linear-gradient(135deg, #0F0F0F 0%, #1a0808 45%, #0F0F0F 100%)',
            }}
          />
          {/* Decorative blur blobs */}
          <div
            className="absolute -top-16 -right-16 size-64 rounded-full opacity-20 blur-3xl"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, #DC2626 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 size-48 rounded-full opacity-10 blur-2xl"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
          />

          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            {/* Top controls */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <Image
                src="/logo.png"
                alt="C'est Nicolas qui paie"
                width={140}
                height={24}
                className="h-5 w-auto opacity-60"
              />
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Réduire la présentation"
                className="text-text-muted hover:bg-surface-elevated hover:text-text-secondary rounded-md p-1.5 transition-colors"
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Headline */}
            <h1 className="font-display text-text-primary text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl md:text-6xl">
              TRONÇONNONS LES <span className="text-chainsaw-red">DÉPENSES PUBLIQUES.</span>
            </h1>

            {/* Subheading with trust badge */}
            <div className="mt-4 flex flex-wrap items-start gap-3">
              <span className="border-info/30 bg-info/10 text-info inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Sources vérifiées
              </span>
              <p className="text-text-secondary max-w-lg text-base leading-relaxed sm:text-lg">
                La plateforme citoyenne qui traque, documente et{' '}
                <span className="text-text-primary font-semibold">chiffre chaque gaspillage</span>{' '}
                de vos impôts. Montants par contribuable.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/submit"
                className={cn(
                  'bg-chainsaw-red inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
                  'shadow-chainsaw-red/20 text-sm font-semibold text-white shadow-lg',
                  'hover:bg-chainsaw-red-hover hover:shadow-chainsaw-red/30 transition-all duration-200',
                  'focus-visible:ring-chainsaw-red focus-visible:ring-offset-surface-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                )}
                id="hero-cta-submit"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                Signaler une dépense
              </Link>
              <a
                href="#main-feed"
                className={cn(
                  'border-border-default inline-flex items-center gap-2 rounded-lg border px-5 py-2.5',
                  'text-text-secondary text-sm font-semibold',
                  'hover:border-text-muted hover:bg-surface-elevated hover:text-text-primary transition-all duration-200',
                  'focus-visible:ring-chainsaw-red focus-visible:ring-offset-surface-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                )}
                id="hero-cta-feed"
              >
                Voir les signalements
                <ChevronDown className="size-4" aria-hidden="true" />
              </a>
            </div>

            {/* Hero KPI: Total Amount */}
            <div className="border-border-default mt-8 border-t pt-6">
              <p className="font-display text-chainsaw-red text-4xl font-black tabular-nums sm:text-5xl">
                {stats ? formatCompactEUR(stats.totalAmountEur) : '--'}
              </p>
              <p className="text-text-muted mt-1 text-sm">de gaspillages publics documentés</p>
            </div>

            {/* Supporting KPIs */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="font-display text-text-primary text-lg font-bold tabular-nums sm:text-xl">
                  {stats ? formatCompactNumber(stats.totalSubmissions) : '--'}
                </p>
                <p className="text-text-muted text-[11px] sm:text-xs">dépenses signalées</p>
              </div>
              <div>
                <p className="font-display text-warning text-lg font-bold tabular-nums sm:text-xl">
                  {stats ? formatCompactEUR(stats.costPerTaxpayer) : '--'}
                </p>
                <p className="text-text-muted text-[11px] sm:text-xs">par contribuable</p>
              </div>
              <div>
                <p className="font-display text-text-primary text-lg font-bold tabular-nums sm:text-xl">
                  {stats ? formatCompactNumber(stats.totalUniqueVoters) : '--'}
                </p>
                <p className="text-text-muted text-[11px] sm:text-xs">citoyens mobilisés</p>
              </div>
            </div>

            {/* Social proof */}
            {stats && stats.submissionsThisWeek > 0 && (
              <p className="text-text-muted mt-4 flex items-center gap-1.5 text-xs">
                <TrendingUp className="text-success size-3.5" aria-hidden="true" />
                <span>
                  +{stats.submissionsThisWeek} signalement
                  {stats.submissionsThisWeek > 1 ? 's' : ''} cette semaine
                </span>
              </p>
            )}

            {/* Feedback CTA */}
            <p className="text-text-muted mt-3 text-xs">
              Une idée pour améliorer le site ?{' '}
              <a
                href="https://github.com/lezardoloris/CestNicolasQuiPaye/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-info decoration-info/30 hover:text-info/80 font-medium underline"
              >
                Proposer une amélioration
              </a>
            </p>
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="hero-collapsed"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mb-4"
        >
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Déplier la présentation"
            className={cn(
              'border-border-default flex w-full items-center justify-between gap-2 rounded-lg border',
              'bg-surface-secondary text-text-secondary px-4 py-2.5 text-sm',
              'hover:bg-surface-elevated hover:text-text-primary transition-colors',
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
