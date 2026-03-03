import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VoteButton } from './VoteButton';

// ─── Mocks ───────────────────────────────────────────────────────────────

const mockVote = vi.fn();
const mockUseVote = vi.fn();

vi.mock('@/hooks/useVote', () => ({
  useVote: (...args: unknown[]) => mockUseVote(...args),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderVoteButton(
  props: Partial<React.ComponentProps<typeof VoteButton>> = {},
) {
  const defaultProps = {
    submissionId: 'sub-1',
    serverCounts: { up: 10, down: 3 },
    serverVote: undefined,
  };

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <VoteButton {...defaultProps} {...props} />
    </QueryClientProvider>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('VoteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: null,
      counts: { up: 10, down: 3 },
      isLoading: false,
    });
  });

  it('affiche le score (up - down)', () => {
    renderVoteButton();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('affiche le groupe de vote avec le role "group"', () => {
    renderVoteButton();
    expect(screen.getByRole('group', { name: 'Vote' })).toBeInTheDocument();
  });

  it('affiche les deux boutons de vote avec les bons aria-labels', () => {
    renderVoteButton();
    expect(
      screen.getByRole('button', { name: /Tronçonner: 10 votes/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Garder: 3 votes/ }),
    ).toBeInTheDocument();
  });

  it('appelle vote("up") quand on clique sur le bouton upvote', () => {
    renderVoteButton();
    fireEvent.click(screen.getByRole('button', { name: /Tronçonner/ }));
    expect(mockVote).toHaveBeenCalledWith('up');
  });

  it('appelle vote("down") quand on clique sur le bouton downvote', () => {
    renderVoteButton();
    fireEvent.click(screen.getByRole('button', { name: /Garder/ }));
    expect(mockVote).toHaveBeenCalledWith('down');
  });

  it('desactive les boutons quand isLoading est true', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: null,
      counts: { up: 10, down: 3 },
      isLoading: true,
    });

    renderVoteButton();

    const upButton = screen.getByRole('button', { name: /Tronçonner/ });
    const downButton = screen.getByRole('button', { name: /Garder/ });
    expect(upButton).toBeDisabled();
    expect(downButton).toBeDisabled();
  });

  it('indique aria-pressed=true sur le bouton upvote quand le vote est "up"', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: 'up',
      counts: { up: 11, down: 3 },
      isLoading: false,
    });

    renderVoteButton();

    const upButton = screen.getByRole('button', { name: /Tronçonner/ });
    const downButton = screen.getByRole('button', { name: /Garder/ });
    expect(upButton).toHaveAttribute('aria-pressed', 'true');
    expect(downButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('indique aria-pressed=true sur le bouton downvote quand le vote est "down"', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: 'down',
      counts: { up: 10, down: 4 },
      isLoading: false,
    });

    renderVoteButton();

    const upButton = screen.getByRole('button', { name: /Tronçonner/ });
    const downButton = screen.getByRole('button', { name: /Garder/ });
    expect(upButton).toHaveAttribute('aria-pressed', 'false');
    expect(downButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('utilise le serverVote quand currentVote est null', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: null,
      counts: { up: 10, down: 3 },
      isLoading: false,
    });

    renderVoteButton({ serverVote: 'up' });

    const upButton = screen.getByRole('button', { name: /Tronçonner/ });
    expect(upButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('formate un grand score avec formatScore (ex: 1500 -> 1,5k)', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: null,
      counts: { up: 2000, down: 500 },
      isLoading: false,
    });

    renderVoteButton();

    // formatScore(1500) should output something with k
    expect(screen.getByText(/1,5k/)).toBeInTheDocument();
  });

  it('passe submissionId et serverCounts au hook useVote', () => {
    renderVoteButton({
      submissionId: 'test-id',
      serverCounts: { up: 20, down: 5 },
    });

    expect(mockUseVote).toHaveBeenCalledWith('test-id', { up: 20, down: 5 });
  });

  it('affiche un score de 0 quand up et down sont egaux', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: null,
      counts: { up: 5, down: 5 },
      isLoading: false,
    });

    renderVoteButton();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('affiche un score negatif quand down > up', () => {
    mockUseVote.mockReturnValue({
      vote: mockVote,
      currentVote: null,
      counts: { up: 2, down: 5 },
      isLoading: false,
    });

    renderVoteButton();
    expect(screen.getByText('-3')).toBeInTheDocument();
  });
});
