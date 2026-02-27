import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { pageViews } from '@/lib/db/schema';
import { apiSuccess, apiError } from '@/lib/api/response';
import { pageViewSchema } from '@/lib/utils/validation';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { sanitizeReferrer } from '@/lib/utils/share';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rateLimited = await checkRateLimit('api', ip);
  if (rateLimited) {
    return apiError('RATE_LIMITED', rateLimited, 429);
  }

  try {
    const body = await request.json();
    const parsed = pageViewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400);
    }

    await db.insert(pageViews).values({
      pagePath: parsed.data.pagePath,
      utmSource: parsed.data.utmSource ?? null,
      utmMedium: parsed.data.utmMedium ?? null,
      utmCampaign: parsed.data.utmCampaign ?? null,
      referrer: parsed.data.referrer ? sanitizeReferrer(parsed.data.referrer) : null,
    });

    return apiSuccess({ ok: true }, {}, 201);
  } catch {
    return apiError('INTERNAL_ERROR', 'Erreur interne', 500);
  }
}
