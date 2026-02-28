import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Flag, Megaphone, Lightbulb, ChevronRight } from 'lucide-react';

const QUICK_LINKS = [
  {
    href: '/admin/moderation',
    label: 'File de modération',
    description: 'Approuver ou rejeter les soumissions',
    icon: Shield,
  },
  {
    href: '/admin/flags',
    label: 'Contenus signalés',
    description: 'Examiner les signalements',
    icon: Flag,
  },
  {
    href: '/admin/broadcast',
    label: 'Diffusion',
    description: 'Publier sur Twitter/X',
    icon: Megaphone,
  },
  {
    href: '/admin/features',
    label: 'Propositions',
    description: 'Gérer les demandes de fonctionnalités',
    icon: Lightbulb,
  },
];

export function QuickLinksPanel() {
  return (
    <Card className="bg-surface-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Accès rapide</CardTitle>
      </CardHeader>
      <CardContent>
        <nav aria-label="Liens rapides administration">
          <ul className="space-y-1" role="list">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chainsaw-red"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{link.label}</p>
                      <p className="text-xs text-text-muted">{link.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
}
