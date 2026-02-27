import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Code,
  FileText,
  Lightbulb,
  MessageCircle,
  Bug,
  GraduationCap,
  Github,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contribuer',
  description:
    'NICOLAS PAYE est open source. Contribuez du code, du contenu, des solutions ou des idees.',
};

const GITHUB_URL = 'https://github.com/lezardoloris/liberal';

const contributions = [
  {
    icon: Code,
    title: 'Contribuer du code',
    description:
      'Le projet est en Next.js 16, TypeScript, Tailwind CSS et PostgreSQL. Fork le repo, cree une branche et ouvre une PR.',
    action: 'Voir le code sur GitHub',
    href: GITHUB_URL,
    external: true,
    color: 'text-info',
  },
  {
    icon: FileText,
    title: 'Ajouter une depense publique',
    description:
      'Tu connais un gaspillage public ? Soumets-le avec le cout, une source et une description. Pas besoin de compte.',
    action: 'Soumettre un gaspillage',
    href: '/submit',
    external: false,
    color: 'text-chainsaw-red',
  },
  {
    icon: Lightbulb,
    title: 'Proposer des solutions',
    description:
      'Chaque depense a une section solutions. Propose comment reduire le gaspillage et vote pour les meilleures idees.',
    action: 'Voir le feed',
    href: '/feed/hot',
    external: false,
    color: 'text-warning',
  },
  {
    icon: GraduationCap,
    title: 'Contenu educatif',
    description:
      'Ecris des articles de vulgarisation, cree des infographies ou explique des mecanismes budgetaires complexes.',
    action: 'Proposer du contenu',
    href: `${GITHUB_URL}/issues/new?template=content.yml`,
    external: true,
    color: 'text-success',
  },
  {
    icon: Bug,
    title: 'Signaler un bug',
    description:
      'Tu as trouve un bug ? Un chiffre faux ? Un lien casse ? Ouvre une issue sur GitHub.',
    action: 'Signaler un bug',
    href: `${GITHUB_URL}/issues/new?template=bug_report.yml`,
    external: true,
    color: 'text-chainsaw-red',
  },
  {
    icon: MessageCircle,
    title: 'Discuter et proposer',
    description:
      'Des idees de features ? Des suggestions d amelioration ? Rejoins les discussions GitHub.',
    action: 'Ouvrir une discussion',
    href: `${GITHUB_URL}/discussions`,
    external: true,
    color: 'text-text-secondary',
  },
];

const goodFirstIssues = [
  'Ameliorer le responsive sur mobile',
  'Ajouter des sources a des depenses existantes',
  'Traduire l interface (anglais, etc.)',
  'Ameliorer l accessibilite (RGAA AA)',
  'Ajouter des tests unitaires',
  'Creer des infographies de depenses',
];

export default function ContribuerPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-4 py-8 pb-20 md:pb-8"
    >
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          Contribuer a NICOLAS PAYE
        </h1>
        <p className="mt-3 text-lg text-text-secondary">
          Ce projet est{' '}
          <strong className="text-success">100% open source</strong>. Tout le
          monde peut contribuer, coder ou non.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button asChild>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 size-4" />
              Voir sur GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`${GITHUB_URL}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Good First Issues
            </a>
          </Button>
        </div>
      </div>

      {/* Contribution cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contributions.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className="border-border-default bg-surface-secondary transition-colors hover:border-text-muted"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon className={`size-5 ${item.color}`} />
                  <CardTitle className="text-base text-text-primary">
                    {item.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-text-secondary">
                  {item.description}
                </CardDescription>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-chainsaw-red hover:underline"
                  >
                    {item.action}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-chainsaw-red hover:underline"
                  >
                    {item.action}
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Good first issues */}
      <section className="mt-12">
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary">
          Par ou commencer ?
        </h2>
        <Card className="border-border-default bg-surface-secondary">
          <CardContent className="pt-6">
            <ul className="space-y-2">
              {goodFirstIssues.map((issue) => (
                <li
                  key={issue}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Stack technique */}
      <section className="mt-12">
        <h2 className="mb-4 font-display text-xl font-semibold text-text-primary">
          Stack technique
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            'Next.js 16',
            'React 19',
            'TypeScript',
            'Tailwind CSS 4',
            'PostgreSQL',
            'Drizzle ORM',
            'Auth.js v5',
            'Zustand',
          ].map((tech) => (
            <div
              key={tech}
              className="rounded-lg border border-border-default bg-surface-primary px-3 py-2 text-center text-sm text-text-secondary"
            >
              {tech}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
