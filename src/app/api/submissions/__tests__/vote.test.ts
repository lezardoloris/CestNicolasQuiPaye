import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Hoisted mock variables ─────────────────────────────────────────

const { mockSelect, mockFrom, mockWhere, mockLimit } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
}));

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  db: {
    select: mockSelect,
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/api/votes', () => ({
  castVote: vi.fn().mockResolvedValue({ action: 'created', userVote: 'up' }),
  removeVote: vi.fn().mockResolvedValue({ action: 'removed' }),
}));

vi.mock('@/lib/api/ip-votes', () => ({
  castIpVote: vi.fn().mockResolvedValue({ action: 'created', userVote: 'up' }),
  removeIpVote: vi.fn().mockResolvedValue({ action: 'removed' }),
}));

vi.mock('@/lib/utils/ip-hash', () => ({
  getHashedIp: vi.fn().mockReturnValue('hashed-ip-value'),
}));

vi.mock('@/lib/gamification/xp-engine', () => ({
  awardXp: vi.fn().mockResolvedValue({
    awarded: false,
    xpAmount: 0,
    totalXp: 0,
    leveledUp: false,
    newLevel: null,
    newLevelTitle: null,
    currentStreak: 0,
    dailyBonusAwarded: false,
    dailyBonusXp: 0,
    sessionCooldown: false,
  }),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue('eq-condition'),
}));

vi.mock('@/lib/db/schema', () => ({
  submissions: {
    id: 'submissions.id',
    upvoteCount: 'submissions.upvoteCount',
    downvoteCount: 'submissions.downvoteCount',
    authorId: 'submissions.authorId',
  },
}));

// ─── Imports (after mocks) ──────────────────────────────────────────

import { POST, DELETE } from '@/app/api/submissions/[id]/vote/route';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { castVote } from '@/lib/api/votes';
import { castIpVote } from '@/lib/api/ip-votes';

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockedCheckRateLimit = vi.mocked(checkRateLimit);
const mockedCastVote = vi.mocked(castVote);
const mockedCastIpVote = vi.mocked(castIpVote);

// ─── Helpers ────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeRequest(
  body: Record<string, unknown>,
  method = 'POST',
): NextRequest {
  return new NextRequest(
    `http://localhost/api/submissions/${VALID_UUID}/vote`,
    {
      method,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

function makeParams(id: string = VALID_UUID) {
  return { params: Promise.resolve({ id }) };
}

// ─── Tests: POST ────────────────────────────────────────────────────

describe('POST /api/submissions/[id]/vote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
    mockedCheckRateLimit.mockResolvedValue(null);

    // Mock the db.select chain for submission lookup after vote
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([{ upvoteCount: 1, downvoteCount: 0 }]);
  });

  // ─── Module exports ─────────────────────────────────────────────

  it('exports POST and DELETE handlers', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
    expect(DELETE).toBeDefined();
    expect(typeof DELETE).toBe('function');
  });

  // ─── Validation ─────────────────────────────────────────────────

  it('returns 400 for invalid UUID', async () => {
    const req = makeRequest({ voteType: 'up' });
    const res = await POST(req, makeParams('not-a-uuid'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('invalide');
  });

  it('returns 400 for invalid voteType', async () => {
    const req = makeRequest({ voteType: 'left' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing voteType', async () => {
    const req = makeRequest({});
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  // ─── Rate limiting ──────────────────────────────────────────────

  it('returns 429 when rate limited', async () => {
    mockedCheckRateLimit.mockResolvedValue(
      'Trop de tentatives. Reessayez plus tard.',
    );

    const req = makeRequest({ voteType: 'up' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error.code).toBe('RATE_LIMITED');
  });

  // ─── Happy path: anonymous vote (IP-based) ─────────────────────

  it('casts an IP vote for anonymous users', async () => {
    mockedAuth.mockResolvedValue(null);

    const req = makeRequest({ voteType: 'up' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.userVote).toBe('up');
    expect(data.data.upvoteCount).toBeDefined();
    expect(data.data.downvoteCount).toBeDefined();
    expect(mockedCastIpVote).toHaveBeenCalled();
  });

  // ─── Happy path: authenticated vote ────────────────────────────

  it('casts a user vote for authenticated users', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'user-123', name: 'Nicolas', email: 'n@test.fr' },
      expires: '2099-01-01',
    } as never);

    mockedCastVote.mockResolvedValue({ action: 'created', userVote: 'up' });

    const req = makeRequest({ voteType: 'up' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.userVote).toBe('up');
    expect(mockedCastVote).toHaveBeenCalledWith('user-123', VALID_UUID, 'up');
  });

  // ─── Response structure ─────────────────────────────────────────

  it('returns proper response structure', async () => {
    const req = makeRequest({ voteType: 'down' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('meta');
    expect(data.data).toHaveProperty('upvoteCount');
    expect(data.data).toHaveProperty('downvoteCount');
    expect(data.data).toHaveProperty('userVote');
  });

  // ─── Internal error handling ────────────────────────────────────

  it('returns 500 when castIpVote throws', async () => {
    mockedCastIpVote.mockRejectedValue(new Error('DB error'));

    const req = makeRequest({ voteType: 'up' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Tests: DELETE ──────────────────────────────────────────────────

describe('DELETE /api/submissions/[id]/vote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([{ upvoteCount: 0, downvoteCount: 0 }]);
  });

  it('returns 400 for invalid UUID', async () => {
    const req = new NextRequest(
      'http://localhost/api/submissions/not-a-uuid/vote',
      { method: 'DELETE' },
    );
    const res = await DELETE(req, makeParams('not-a-uuid'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns vote counts after deletion', async () => {
    const req = new NextRequest(
      `http://localhost/api/submissions/${VALID_UUID}/vote`,
      { method: 'DELETE' },
    );
    const res = await DELETE(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.userVote).toBeNull();
    expect(data.data.upvoteCount).toBe(0);
    expect(data.data.downvoteCount).toBe(0);
  });
});
