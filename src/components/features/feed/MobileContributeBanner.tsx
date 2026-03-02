import Link from 'next/link';
import { ArrowUpDown, BookOpen, Github } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CONTRIBUTIONS: {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  external?: boolean;
  xp?: string;
}[] = [
  {
    icon: ArrowUpDown,
    label: 'Votez',
    description: 'Soutenez les signalements',
    href: '#main-feed',
    xp: '+2 XP',
  },
  {
    icon: BookOpen,
    label: 'Informez',
    description: 'Ajoutez sources et contexte',
    href: '/contribuer',
    xp: '+20 XP',
  },
  {
    icon: Github,
    label: 'Codez',
    description: 'Contribuez au code open-source',
    href: 'https://github.com/lezardoloris/CestNicolasQuiPaye',
    external: true,
    xp: '+50 XP',
  },
];

export function MobileContributeBanner() {
  return (
    <div className="py-3 px-4 lg:hidden">
      <div className="scrollbar-hide -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {CONTRIBUTIONS.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex min-w-[130px] shrink-0 flex-col gap-1 rounded-xl border border-border-default bg-surface-primary p-3">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-chainsaw-red" aria-hidden="true" />
                <span className="text-xs font-semibold text-text-primary">{item.label}</span>
              </div>
              <p className="text-[11px] leading-tight text-text-muted">{item.description}</p>
              {item.xp && (
                <span className="mt-0.5 inline-flex w-fit items-center gap-0.5 rounded-full bg-chainsaw-red/10 px-1.5 py-0.5 text-[10px] font-bold text-chainsaw-red">
                  {item.xp}
                </span>
              )}
            </div>
          );

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
