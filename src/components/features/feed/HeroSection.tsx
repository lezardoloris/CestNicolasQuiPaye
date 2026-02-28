'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection() {
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
              background: 'linear-gradient(135deg, #111318 0%, #1a1015 45%, #111318 100%)',
            }}
          />
          {/* Decorative blur blobs */}
          <div
            className="absolute -top-16 -right-16 size-64 rounded-full opacity-20 blur-3xl"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, #C62828 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 size-48 rounded-full opacity-10 blur-2xl"
            aria-hidden="true"
            style={{ background: 'radial-gradient(circle, #C62828 0%, transparent 70%)' }}
          />

          <div className="relative px-5 py-5 sm:px-6 sm:py-6">
            {/* Top row: headline + collapse */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-text-primary text-2xl leading-tight font-black tracking-tight sm:text-3xl md:text-4xl">
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

            {/* CTA + feedback row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Link
                href="/submit"
                className={cn(
                  'bg-chainsaw-red inline-flex items-center gap-2 rounded-lg px-4 py-2',
                  'shadow-chainsaw-red/20 text-sm font-semibold text-white shadow-md',
                  'hover:bg-chainsaw-red-hover transition-all duration-200',
                  'focus-visible:ring-chainsaw-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                )}
                id="hero-cta-submit"
              >
                <PlusCircle className="size-4" aria-hidden="true" />
                Signaler une dépense
              </Link>
              <p className="text-text-muted text-xs">
                <a
                  href="https://github.com/lezardoloris/CestNicolasQuiPaye"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary decoration-text-muted/30 hover:text-text-primary font-medium underline"
                >
                  Proposer une amélioration
                </a>
              </p>
            </div>
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
