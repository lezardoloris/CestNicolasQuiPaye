import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Hoisted mock variables (available inside vi.mock factory) ──────

const { mockDbQuery, mockInsert, mockValues, mockReturning } = vi.hoisted(() => ({
  mockDbQuery: {
    users: { findFirst: vi.fn() },
    submissions: { findFirst: vi.fn() },
    comments: { findFirst: vi.fn() },
  },
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
}));

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  db: {
    query: mockDbQuery,
    insert: mockInsert,
    select: vi.fn(),
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

vi.mock('@/lib/utils/tweet-detector', () => ({
  isTweetUrl: vi.fn().mockReturnValue(false),
  normalizeTweetUrl: vi.fn().mockReturnValue(null),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────

import { POST } from '@/app/api/submissions/route';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/api/rate-limit';

const mockedAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockedCheckRateLimit = vi.mocked(checkRateLimit);

// ─── Helpers ────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/submissions', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validSubmission = {
  title: 'Depense de test',
  description: 'Description de la depense publique',
  estimatedCostEur: 1000000,
  sourceUrl: 'https://example.com/article',
};

const mockSubmissionResult = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Depense de test',
  slug: 'depense-de-test',
  description: 'Description de la depense publique',
  sourceUrl: 'https://example.com/article',
  tweetUrl: null,
  amount: '1000000',
  status: 'published',
  moderationStatus: 'pending',
  authorId: null,
  authorDisplay: 'Citoyen Anonyme',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Tests ──────────────────────────────────────────────────────────

describe('POST /api/submissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: anonymous user
    mockedAuth.mockResolvedValue(null);

    // Default: rate limit allows
    mockedCheckRateLimit.mockResolvedValue(null);

    // Default: insert chain returns a mock submission
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([mockSubmissionResult]);
  });

  // ─── Module exports ─────────────────────────────────────────────────

  it('exports POST handler', () => {
    expect(POST).toBeDefined();
    expect(typeof POST).toBe('function');
  });

  // ─── Validation errors ──────────────────────────────────────────────

  it('returns 400 for empty body', async () => {
    const req = makeRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.data).toBeNull();
  });

  it('returns 400 for missing title', async () => {
    const req = makeRequest({ ...validSubmission, title: '' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing description', async () => {
    const req = makeRequest({ ...validSubmission, description: '' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid sourceUrl', async () => {
    const req = makeRequest({ ...validSubmission, sourceUrl: 'not-a-url' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for zero amount', async () => {
    const req = makeRequest({ ...validSubmission, estimatedCostEur: 0 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for unrealistic amount (> 500 Mds EUR)', async () => {
    const req = makeRequest({ ...validSubmission, estimatedCostEur: 600_000_000_000 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('irréaliste');
  });

  // ─── Content filter ─────────────────────────────────────────────────

  it('returns 400 for inappropriate content in title', async () => {
    const req = makeRequest({ ...validSubmission, title: 'Depense de merde publique' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('inapproprié');
  });

  it('returns 400 for inappropriate content in description', async () => {
    const req = makeRequest({
      ...validSubmission,
      description: 'Cette depense est vraiment putain de scandaleuse',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('inapproprié');
  });

  // ─── Rate limiting ──────────────────────────────────────────────────

  it('returns 429 when rate limited', async () => {
    mockedCheckRateLimit.mockResolvedValue('Trop de tentatives. Reessayez plus tard.');

    const req = makeRequest(validSubmission);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error.code).toBe('RATE_LIMITED');
  });

  // ─── Happy path: anonymous user ─────────────────────────────────────

  it('creates a submission as anonymous user and returns 201', async () => {
    let callCount = 0;
    mockInsert.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { values: mockValues };
      }
      return {
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      };
    });

    const req = makeRequest(validSubmission);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data).toBeTruthy();
    expect(data.data.id).toBe(mockSubmissionResult.id);
    expect(data.error).toBeNull();
    expect(data.meta.requestId).toBeDefined();
  });

  // ─── Happy path: authenticated user ────────────────────────────────

  it('creates a submission as authenticated user', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'user-123', name: 'Nicolas', email: 'nicolas@test.fr' },
      expires: '2099-01-01',
    } as never);

    mockDbQuery.users.findFirst.mockResolvedValue({ role: 'user' });

    let callCount = 0;
    mockInsert.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { values: mockValues };
      }
      return {
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      };
    });

    const req = makeRequest(validSubmission);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data).toBeTruthy();
    expect(data.error).toBeNull();
  });

  // ─── Response structure ─────────────────────────────────────────────

  it('returns proper API response structure', async () => {
    let callCount = 0;
    mockInsert.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { values: mockValues };
      }
      return {
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      };
    });

    const req = makeRequest(validSubmission);
    const res = await POST(req);
    const data = await res.json();

    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('requestId');
  });

  // ─── Error response structure ──────────────────────────────────────

  it('error responses have proper structure', async () => {
    const req = makeRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(data.data).toBeNull();
    expect(data.error).toHaveProperty('code');
    expect(data.error).toHaveProperty('message');
    expect(data.meta).toHaveProperty('requestId');
  });

  // ─── Internal error handling ────────────────────────────────────────

  it('returns 500 when database throws', async () => {
    mockInsert.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const req = makeRequest(validSubmission);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});
