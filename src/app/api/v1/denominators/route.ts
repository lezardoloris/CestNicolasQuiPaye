import { NextResponse } from 'next/server';
import { getCachedDenominators } from '@/lib/api/cost-cache';

// ─── GET /api/v1/denominators ──────────────────────────────────────

export async function GET() {
  try {
    const data = await getCachedDenominators();

    return NextResponse.json({
      data,
      error: null,
      meta: {
        count: data.length,
        cachedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Denominator fetch error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch denominators',
        },
        meta: {},
      },
      { status: 500 }
    );
  }
}
