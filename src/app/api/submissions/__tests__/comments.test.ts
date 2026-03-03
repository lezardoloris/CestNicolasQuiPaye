import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Hoisted mock variables ─────────────────────────────────────────

const {
  mockDbQuery,
  mockSelect,
  mockFrom,
  mockWhere,
  mockOrderBy,
  mockLimitChain,
  mockInsert,
  mockValues,
  mockReturning,
  mockUpdate,
  mockSet,
} = vi.hoisted(() => ({
  mockDbQuery: {
    submissions: { findFirst: vi.fn() },
    comments: { findFirst: vi.fn() },
  },
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockLimitChain: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
}));

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  db: {
    query: mockDbQuery,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue('eq-condition'),
  and: vi.fn((...args: unknown[]) => args),
  desc: vi.fn().mockReturnValue('desc'),
  asc: vi.fn().mockReturnValue('asc'),
  sql: vi.fn().mockReturnValue('sql'),
}));

vi.mock('@/lib/db/schema', () => ({
  comments: {
    id: 'comments.id',
    submissionId: 'comments.submissionId',
    parentCommentId: 'comments.parentCommentId',
    depth: 'comments.depth',
    score: 'comments.score',
    createdAt: 'comments.createdAt',
  },
  submissions: {
    id: 'submissions.id',
    commentCount: 'submissions.commentCount',
  },
}));

vi.mock('@/lib/gamification/xp-engine', () => ({
  awardXp: vi.fn().mockResolvedValue({
    awarded: true,
    xpAmount: 5,
    totalXp: 100,
    leveledUp: false,
    newLevel: null,
    newLevelTitle: null,
    currentStreak: 1,
    dailyBonusAwarded: false,
    dailyBonusXp: 0,
    sessionCooldown: false,
  }),
}));

vi.mock('@/lib/gamification/xp-response', () => ({
  formatXpResponse: vi.fn().mockReturnValue({
    amount: 5,
    total: 100,
    leveledUp: false,
    newLevel: null,
    newLevelTitle: null,
    streak: 1,
    sessionCooldown: false,
  }),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────

import { GET, POST } from '@/app/api/submissions/[id]/comments/route';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockedCheckRateLimit = vi.mocked(checkRateLimit);

// ─── Helpers ────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeGetRequest(queryParams: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost/api/submissions/${VALID_UUID}/comments`);
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, { method: 'GET' });
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(
    `http://localhost/api/submissions/${VALID_UUID}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

function makeParams(id: string = VALID_UUID) {
  return { params: Promise.resolve({ id }) };
}

const mockComment = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  submissionId: VALID_UUID,
  authorId: 'user-123',
  authorDisplay: 'Nicolas',
  body: 'Un commentaire pertinent',
  depth: 0,
  parentCommentId: null,
  solutionId: null,
  upvoteCount: 0,
  downvoteCount: 0,
  score: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ─── Tests: GET ─────────────────────────────────────────────────────

describe('GET /api/submissions/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: set up the select chain for fetching comments
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimitChain });
    mockLimitChain.mockResolvedValue([]);
  });

  it('exports GET handler', () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
  });

  it('returns 400 for invalid sort parameter', async () => {
    const req = makeGetRequest({ sort: 'invalid' });
    const res = await GET(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid limit parameter', async () => {
    const req = makeGetRequest({ limit: '0' });
    const res = await GET(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for limit exceeding max', async () => {
    const req = makeGetRequest({ limit: '51' });
    const res = await GET(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid cursor (non-UUID)', async () => {
    const req = makeGetRequest({ cursor: 'not-a-uuid' });
    const res = await GET(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 when database throws', async () => {
    mockSelect.mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = makeGetRequest();
    const res = await GET(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Tests: POST ────────────────────────────────────────────────────

describe('POST /api/submissions/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    mockedAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        name: 'Nicolas',
        email: 'n@test.fr',
        displayName: 'Nicolas',
        anonymousId: 'citoyen_abc123',
      },
      expires: '2099-01-01',
    } as never);

    mockedCheckRateLimit.mockResolvedValue(null);

    // Submission exists
    mockDbQuery.submissions.findFirst.mockResolvedValue({ id: VALID_UUID });

    // Insert chain
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([mockComment]);

    // Update chain for commentCount increment
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('exports POST handler', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });

  // ─── Auth check ─────────────────────────────────────────────────

  it('returns 401 for unauthenticated users', async () => {
    mockedAuth.mockResolvedValue(null);

    const req = makePostRequest({ body: 'Un commentaire' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when session has no user', async () => {
    mockedAuth.mockResolvedValue({ user: undefined, expires: '2099-01-01' } as never);

    const req = makePostRequest({ body: 'Un commentaire' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  // ─── Rate limiting ──────────────────────────────────────────────

  it('returns 429 when rate limited', async () => {
    mockedCheckRateLimit.mockResolvedValue('Trop de tentatives.');

    const req = makePostRequest({ body: 'Un commentaire' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error.code).toBe('RATE_LIMITED');
  });

  // ─── Validation ─────────────────────────────────────────────────

  it('returns 400 for empty body text', async () => {
    const req = makePostRequest({ body: '' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for body exceeding 2000 characters', async () => {
    const req = makePostRequest({ body: 'A'.repeat(2001) });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid parentCommentId', async () => {
    const req = makePostRequest({
      body: 'Un commentaire',
      parentCommentId: 'not-a-uuid',
    });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  // ─── Submission existence ───────────────────────────────────────

  it('returns 404 when submission does not exist', async () => {
    mockDbQuery.submissions.findFirst.mockResolvedValue(null);

    const req = makePostRequest({ body: 'Un commentaire' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  // ─── Happy path ────────────────────────────────────────────────

  it('creates a comment and returns 201', async () => {
    const req = makePostRequest({ body: 'Un commentaire pertinent' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data.body).toBe('Un commentaire pertinent');
    expect(data.data.id).toBeDefined();
    expect(data.error).toBeNull();
  });

  // ─── Response structure ─────────────────────────────────────────

  it('returns proper API response structure', async () => {
    const req = makePostRequest({ body: 'Un commentaire' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('requestId');
  });

  // ─── Internal error ─────────────────────────────────────────────

  it('returns 500 when database insert throws', async () => {
    mockInsert.mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = makePostRequest({ body: 'Un commentaire' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});
