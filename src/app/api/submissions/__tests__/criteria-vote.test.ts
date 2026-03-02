import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Hoisted mock variables ─────────────────────────────────────────

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockGroupBy,
  mockLimit,
  mockInsert,
  mockValues,
  mockUpdate,
  mockSet,
  mockDelete,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockGroupBy: vi.fn(),
  mockLimit: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockDelete: vi.fn(),
}));

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
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
  and: vi.fn((...args: unknown[]) => args),
  sql: vi.fn().mockReturnValue('sql-expr'),
}));

vi.mock('@/lib/db/schema', () => ({
  criteriaVotes: {
    id: 'criteriaVotes.id',
    userId: 'criteriaVotes.userId',
    submissionId: 'criteriaVotes.submissionId',
    criterion: 'criteriaVotes.criterion',
    value: 'criteriaVotes.value',
  },
  ipCriteriaVotes: {
    id: 'ipCriteriaVotes.id',
    ipHash: 'ipCriteriaVotes.ipHash',
    submissionId: 'ipCriteriaVotes.submissionId',
    criterion: 'ipCriteriaVotes.criterion',
    value: 'ipCriteriaVotes.value',
  },
}));

// ─── Imports (after mocks) ──────────────────────────────────────────

import { GET, POST } from '@/app/api/submissions/[id]/criteria-vote/route';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockedCheckRateLimit = vi.mocked(checkRateLimit);

// ─── Helpers ────────────────────────────────────────────────────────

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

function makeGetRequest(): NextRequest {
  return new NextRequest(
    `http://localhost/api/submissions/${VALID_UUID}/criteria-vote`,
    { method: 'GET' },
  );
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(
    `http://localhost/api/submissions/${VALID_UUID}/criteria-vote`,
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

// ─── Tests: GET ─────────────────────────────────────────────────────

describe('GET /api/submissions/[id]/criteria-vote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);

    // Default: select chain for aggregate queries + ip user votes
    // The route does 4 selects: 2 aggregates + 1 user votes lookup
    // For anonymous: aggregate(criteria) + aggregate(ipCriteria) + ip votes
    let _selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      _selectCallCount++;
      return { from: mockFrom };
    });
    mockFrom.mockReturnValue({ where: mockWhere });
    // For aggregates: where returns groupBy
    // For user votes: where returns result directly
    mockWhere.mockReturnValue({ groupBy: mockGroupBy });
    mockGroupBy.mockResolvedValue([]);
  });

  it('exports GET handler', () => {
    expect(GET).toBeDefined();
    expect(typeof GET).toBe('function');
  });

  it('returns 400 for invalid UUID', async () => {
    const req = makeGetRequest();
    const res = await GET(req, makeParams('not-a-uuid'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('invalide');
  });

  it('returns criteria data for valid submission (anonymous)', async () => {
    // For the anonymous IP votes query (3rd select), where should return
    // a result directly (not groupBy)
    let _selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      _selectCallCount++;
      return { from: mockFrom };
    });
    mockFrom.mockImplementation(() => {
      return { where: mockWhere };
    });
    // First two calls resolve via groupBy (aggregate), third via direct resolve
    let whereCallCount = 0;
    mockWhere.mockImplementation(() => {
      whereCallCount++;
      if (whereCallCount <= 2) {
        return { groupBy: mockGroupBy };
      }
      // IP user votes query resolves directly
      return Promise.resolve([]);
    });
    mockGroupBy.mockResolvedValue([]);

    const req = makeGetRequest();
    const res = await GET(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.criteria).toBeDefined();
    expect(data.data.criteria).toHaveProperty('proportional');
    expect(data.data.criteria).toHaveProperty('legitimate');
    expect(data.data.criteria).toHaveProperty('alternative');
    expect(data.error).toBeNull();
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

describe('POST /api/submissions/[id]/criteria-vote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
    mockedCheckRateLimit.mockResolvedValue(null);

    // Mock select chain for existing vote check
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]); // No existing vote

    // Mock insert chain
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);

    // Mock delete chain
    mockDelete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    // Mock update chain
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('exports POST handler', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });

  // ─── Validation ─────────────────────────────────────────────────

  it('returns 400 for invalid UUID', async () => {
    const req = makePostRequest({ criterion: 'proportional', value: true });
    const res = await POST(req, makeParams('not-a-uuid'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('invalide');
  });

  it('returns 400 for invalid criterion', async () => {
    const req = makePostRequest({ criterion: 'invalid', value: true });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing criterion', async () => {
    const req = makePostRequest({ value: true });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing value', async () => {
    const req = makePostRequest({ criterion: 'proportional' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for non-boolean value', async () => {
    const req = makePostRequest({ criterion: 'proportional', value: 'yes' });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for empty body', async () => {
    const req = makePostRequest({});
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

    const req = makePostRequest({ criterion: 'proportional', value: true });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error.code).toBe('RATE_LIMITED');
  });

  // ─── Happy path: anonymous IP vote ──────────────────────────────

  it('creates an IP criteria vote for anonymous users', async () => {
    mockLimit.mockResolvedValue([]);

    const req = makePostRequest({ criterion: 'proportional', value: true });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.criterion).toBe('proportional');
    expect(data.data.userVote).toBe(true);
    expect(data.error).toBeNull();
  });

  // ─── Happy path: authenticated vote ────────────────────────────

  it('creates an authenticated criteria vote', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'user-123', name: 'Nicolas', email: 'n@test.fr' },
      expires: '2099-01-01',
    } as never);

    mockLimit.mockResolvedValue([]);

    const req = makePostRequest({ criterion: 'legitimate', value: false });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.criterion).toBe('legitimate');
    expect(data.data.userVote).toBe(false);
  });

  // ─── All three criteria accepted ───────────────────────────────

  it('accepts "proportional" criterion', async () => {
    const req = makePostRequest({ criterion: 'proportional', value: true });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(200);
  });

  it('accepts "legitimate" criterion', async () => {
    const req = makePostRequest({ criterion: 'legitimate', value: true });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(200);
  });

  it('accepts "alternative" criterion', async () => {
    const req = makePostRequest({ criterion: 'alternative', value: false });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(200);
  });

  // ─── Response structure ─────────────────────────────────────────

  it('returns proper API response structure', async () => {
    const req = makePostRequest({ criterion: 'proportional', value: true });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('requestId');
    expect(data.data).toHaveProperty('criterion');
    expect(data.data).toHaveProperty('userVote');
  });

  // ─── Internal error handling ────────────────────────────────────

  it('returns 500 when database throws', async () => {
    mockSelect.mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = makePostRequest({ criterion: 'proportional', value: true });
    const res = await POST(req, makeParams());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});
