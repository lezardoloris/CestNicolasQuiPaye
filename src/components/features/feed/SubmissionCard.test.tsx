import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubmissionCard } from './SubmissionCard';
import type { SubmissionCardData } from '@/types/submission';

// ─── Mocks ───────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    article: ({
      children,
      initial: _i,
      animate: _a,
      transition: _t,
      ...props
    }: Record<string, unknown> & { children: React.ReactNode }) => (
      <article {...props}>{children}</article>
    ),
    span: ({
      children,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      ...props
    }: Record<string, unknown> & { children: React.ReactNode }) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@/components/features/voting/VoteButtonInline', () => ({
  VoteButtonInline: () => <div data-testid="vote-button-inline">VoteInline</div>,
}));

vi.mock('@/components/features/sharing/ShareButton', () => ({
  ShareButton: () => <button data-testid="share-button">Partager</button>,
}));

vi.mock('@/components/features/sources/SourceBadge', () => ({
  SourceBadge: ({ sourceCount }: { sourceUrl: string; sourceCount?: number }) => (
    <span data-testid="source-badge">{sourceCount ?? 0} sources</span>
  ),
}));

vi.mock('@/components/features/notes/PinnedNote', () => ({
  PinnedNote: ({ body }: { body: string }) => (
    <div data-testid="pinned-note">{body}</div>
  ),
}));

vi.mock('@/components/features/solutions/TopSolutionPreview', () => ({
  TopSolutionPreview: ({ body }: { body: string }) => (
    <div data-testid="top-solution">{body}</div>
  ),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function makeSubmission(
  overrides: Partial<SubmissionCardData> = {},
): SubmissionCardData {
  return {
    id: 'sub-123',
    title: 'Dépense de test',
    slug: 'depense-de-test',
    description: 'Description de la dépense de test',
    sourceUrl: 'https://example.com',
    amount: '1000000',
    costPerTaxpayer: '2.50',
    upvoteCount: 15,
    downvoteCount: 3,
    commentCount: 7,
    hotScore: '42.5',
    status: 'approved',
    authorId: 'user-123',
    authorDisplay: 'JeanDupont',
    createdAt: '2026-03-01T12:00:00Z',
    costToNicolasResults: null,
    ministryTag: null,
    sourceCount: 2,
    pinnedNoteBody: null,
    solutionCount: 3,
    topSolutionBody: null,
    ...overrides,
  };
}

function renderSubmissionCard(
  submissionOverrides: Partial<SubmissionCardData> = {},
  index?: number,
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <SubmissionCard
        submission={makeSubmission(submissionOverrides)}
        index={index}
      />
    </QueryClientProvider>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('SubmissionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le titre de la soumission', () => {
    renderSubmissionCard();
    expect(screen.getByText('Dépense de test')).toBeInTheDocument();
  });

  it('affiche la description', () => {
    renderSubmissionCard({ description: 'Une description utile' });
    expect(screen.getByText('Une description utile')).toBeInTheDocument();
  });

  it('n\'affiche pas la description si elle est vide', () => {
    renderSubmissionCard({ description: '' });
    expect(screen.queryByText('Une description utile')).not.toBeInTheDocument();
  });

  it('affiche le role article avec le titre et le score', () => {
    renderSubmissionCard();
    expect(
      screen.getByRole('article', { name: /Dépense de test, score: 12/ }),
    ).toBeInTheDocument();
  });

  it('affiche le montant en format compact', () => {
    renderSubmissionCard({ amount: '1000000' });
    // formatCompactEUR(1000000) = "1 M €"
    expect(screen.getByText(/1\s*M\s*€/)).toBeInTheDocument();
  });

  it('affiche le cout par contribuable', () => {
    renderSubmissionCard({ costPerTaxpayer: '2.50' });
    // formatEURPrecise(2.50) = "2,50 €" followed by /citoyen
    expect(screen.getByText(/citoyen/)).toBeInTheDocument();
  });

  it('n\'affiche pas le cout par contribuable si null', () => {
    renderSubmissionCard({ costPerTaxpayer: null });
    expect(screen.queryByText(/citoyen/)).not.toBeInTheDocument();
  });

  it('affiche le nombre de commentaires', () => {
    renderSubmissionCard({ commentCount: 7 });
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '7 commentaires' }),
    ).toBeInTheDocument();
  });

  it('affiche le nombre de solutions', () => {
    renderSubmissionCard({ solutionCount: 3 });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '3 solutions' }),
    ).toBeInTheDocument();
  });

  it('affiche 0 solutions quand solutionCount est undefined', () => {
    renderSubmissionCard({ solutionCount: undefined });
    expect(
      screen.getByRole('link', { name: '0 solutions' }),
    ).toBeInTheDocument();
  });

  it('affiche le composant VoteButtonInline', () => {
    renderSubmissionCard();
    expect(screen.getByTestId('vote-button-inline')).toBeInTheDocument();
  });

  it('affiche le bouton de partage', () => {
    renderSubmissionCard();
    expect(screen.getByTestId('share-button')).toBeInTheDocument();
  });

  it('affiche le badge de source', () => {
    renderSubmissionCard({ sourceCount: 5 });
    expect(screen.getByTestId('source-badge')).toBeInTheDocument();
  });

  it('affiche la note epinglee si presente', () => {
    renderSubmissionCard({ pinnedNoteBody: 'Note importante' });
    expect(screen.getByTestId('pinned-note')).toBeInTheDocument();
    expect(screen.getByText('Note importante')).toBeInTheDocument();
  });

  it('n\'affiche pas la note epinglee si absente', () => {
    renderSubmissionCard({ pinnedNoteBody: null });
    expect(screen.queryByTestId('pinned-note')).not.toBeInTheDocument();
  });

  it('affiche la meilleure solution si presente', () => {
    renderSubmissionCard({ topSolutionBody: 'Solution proposee' });
    expect(screen.getByTestId('top-solution')).toBeInTheDocument();
    expect(screen.getByText('Solution proposee')).toBeInTheDocument();
  });

  it('n\'affiche pas la meilleure solution si absente', () => {
    renderSubmissionCard({ topSolutionBody: null });
    expect(screen.queryByTestId('top-solution')).not.toBeInTheDocument();
  });

  it('affiche le badge de categorie quand ministryTag est defini', () => {
    renderSubmissionCard({ ministryTag: 'Santé' });
    expect(screen.getByText('Sante')).toBeInTheDocument();
  });

  it('n\'affiche pas de badge de categorie quand ministryTag est null', () => {
    renderSubmissionCard({ ministryTag: null });
    expect(screen.queryByText('Sante')).not.toBeInTheDocument();
  });

  it('affiche le contexte budgetaire pour les categories pertinentes', () => {
    renderSubmissionCard({ ministryTag: 'Santé' });
    expect(screen.getByText(/Budget santé/)).toBeInTheDocument();
    expect(screen.getByText('Voir les chiffres')).toBeInTheDocument();
  });

  it('contient un lien vers la page de detail', () => {
    renderSubmissionCard({ id: 'sub-abc' });
    const links = screen.getAllByRole('link');
    const detailLink = links.find(
      (link) => link.getAttribute('href') === '/s/sub-abc',
    );
    expect(detailLink).toBeDefined();
  });

  it('contient un lien vers les commentaires', () => {
    renderSubmissionCard({ id: 'sub-abc' });
    const commentLink = screen.getByRole('link', { name: /commentaires/ });
    expect(commentLink).toHaveAttribute('href', '/s/sub-abc#commentaires');
  });

  it('contient un lien vers les solutions', () => {
    renderSubmissionCard({ id: 'sub-abc' });
    const solutionLink = screen.getByRole('link', { name: /solutions/ });
    expect(solutionLink).toHaveAttribute('href', '/s/sub-abc#solutions');
  });
});
