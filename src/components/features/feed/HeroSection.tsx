'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronDown, X, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactEUR, formatCompactNumber } from '@/lib/utils/format';
import type { PlatformStats } from '@/lib/api/stats';

const STORAGE_KEY = 'np_hero_dismissed';

interface HeroSectionProps {
    stats?: PlatformStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
    const [dismissed, setDismissed] = useState<boolean | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    // Read localStorage after mount to avoid SSR mismatch
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        setDismissed(stored === 'true');
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    const handleRestore = () => {
        setDismissed(false);
        setCollapsed(false);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Render nothing until hydrated
    if (dismissed === null) return null;

    // Permanently dismissed → show a tiny restore bar
    if (dismissed) {
        return (
            <div className="mb-4">
                <button
                    onClick={handleRestore}
                    aria-label="Afficher la présentation"
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-lg border border-border-default',
                        'bg-surface-secondary py-2 text-xs text-text-muted',
                        'transition-colors hover:bg-surface-elevated hover:text-text-secondary',
                    )}
                >
                    <Image src="/logo.png" alt="" width={100} height={16} className="h-3 w-auto opacity-60" />
                    <span>Tronçonnons les dépenses publiques.</span>
                    <ChevronDown className="size-3" aria-hidden="true" />
                </button>
            </div>
        );
    }

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
                    className="relative mb-6 overflow-hidden rounded-xl border border-border-default"
                >
                    {/* Gradient background */}
                    <div
                        className="absolute inset-0 -z-10"
                        aria-hidden="true"
                        style={{
                            background:
                                'linear-gradient(135deg, #0F0F0F 0%, #1a0808 45%, #0F0F0F 100%)',
                        }}
                    />
                    {/* Decorative blur blob */}
                    <div
                        className="absolute -right-16 -top-16 size-64 rounded-full opacity-20 blur-3xl"
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
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCollapsed(true)}
                                    aria-label="Réduire la présentation"
                                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
                                >
                                    <ChevronDown className="size-4" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    aria-label="Fermer définitivement la présentation"
                                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-secondary"
                                >
                                    <X className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="font-display text-4xl font-black leading-[0.95] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
                            TRONÇONNONS LES{' '}
                            <span className="text-chainsaw-red">DÉPENSES PUBLIQUES.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                            La plateforme citoyenne qui traque, documente et{' '}
                            <span className="font-semibold text-text-primary">chiffre chaque gaspillage</span>{' '}
                            de vos impôts. Sources vérifiées, montants par contribuable.
                        </p>

                        {/* CTAs */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <Link
                                href="/submit"
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg bg-chainsaw-red px-5 py-2.5',
                                    'text-sm font-semibold text-white shadow-lg shadow-chainsaw-red/20',
                                    'transition-all duration-200 hover:bg-chainsaw-red-hover hover:shadow-chainsaw-red/30',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
                                )}
                                id="hero-cta-submit"
                            >
                                <PlusCircle className="size-4" aria-hidden="true" />
                                Signaler une dépense
                            </Link>
                            <a
                                href="#main-feed"
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg border border-border-default px-5 py-2.5',
                                    'text-sm font-semibold text-text-secondary',
                                    'transition-all duration-200 hover:border-text-muted hover:bg-surface-elevated hover:text-text-primary',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary',
                                )}
                                id="hero-cta-feed"
                            >
                                Voir les signalements
                                <ChevronDown className="size-4" aria-hidden="true" />
                            </a>
                        </div>

                        {/* Dynamic KPIs */}
                        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border-default pt-4">
                            <div>
                                <p className="font-display text-xl font-bold tabular-nums text-chainsaw-red sm:text-2xl">
                                    {stats ? formatCompactNumber(stats.totalSubmissions) : '--'}
                                </p>
                                <p className="text-[11px] text-text-muted sm:text-xs">
                                    dépenses signalées
                                </p>
                            </div>
                            <div>
                                <p className="font-display text-xl font-bold tabular-nums text-warning sm:text-2xl">
                                    {stats ? formatCompactEUR(stats.totalAmountEur) : '--'}
                                </p>
                                <p className="text-[11px] text-text-muted sm:text-xs">
                                    de gaspillages
                                </p>
                            </div>
                            <div>
                                <p className="font-display text-xl font-bold tabular-nums text-text-primary sm:text-2xl">
                                    {stats ? formatCompactNumber(stats.totalUniqueVoters) : '--'}
                                </p>
                                <p className="text-[11px] text-text-muted sm:text-xs">
                                    citoyens mobilisés
                                </p>
                            </div>
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
                            'flex w-full items-center justify-between gap-2 rounded-lg border border-border-default',
                            'bg-surface-secondary px-4 py-2.5 text-sm text-text-secondary',
                            'transition-colors hover:bg-surface-elevated hover:text-text-primary',
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Image src="/logo.png" alt="" width={120} height={20} className="h-4 w-auto opacity-60" />
                            <span className="font-medium">Tronçonnons les dépenses publiques.</span>
                            <span className="hidden text-text-muted sm:inline">
                                — Chaque euro compte. Chaque citoyen aussi.
                            </span>
                        </span>
                        <ChevronDown
                            className="size-4 rotate-180 text-text-muted"
                            aria-hidden="true"
                            style={{ transform: 'rotate(180deg)' }}
                        />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
