import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/response';
import { publicApiGuard, withCacheHeaders } from '@/lib/api/public-api';
import { CATEGORIES } from '@/lib/constants/categories';

export async function GET(request: NextRequest): Promise<Response> {
  const guardResult = await publicApiGuard(request);
  if (guardResult) return guardResult;

  const categories = CATEGORIES.map(({ slug, label }) => ({ slug, label }));
  const response = apiSuccess(categories);
  return withCacheHeaders(response, 86400);
}
