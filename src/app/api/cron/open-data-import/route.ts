import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { dataImports } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { openDataCronSchema } from '@/lib/utils/validation';
import { OPEN_DATA_SOURCES } from '@/lib/open-data/sources';
import { importRecords } from '@/lib/open-data/importer';
import { fetchDecpRecords } from '@/lib/open-data/decp';
import { fetchPlfRecords } from '@/lib/open-data/plf-budget';
import { fetchSubventionRecords } from '@/lib/open-data/subventions';
import type { ImportResult, ImportSource, OpenDataRecord } from '@/types/open-data';

const FETCHERS: Record<ImportSource, () => Promise<OpenDataRecord[]>> = {
  decp: fetchDecpRecords,
  plf_budget: fetchPlfRecords,
  subventions: fetchSubventionRecords,
};

/**
 * POST /api/cron/open-data-import?source=all
 *
 * Imports open data from French government APIs into submissions.
 * Protected by CRON_SECRET bearer token.
 * Called by Railway cron daily at 03:00 Europe/Paris.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return apiError('UNAUTHORIZED', 'Invalid cron secret', 401);
  }

  const url = new URL(request.url);
  const parsed = openDataCronSchema.safeParse({
    source: url.searchParams.get('source') ?? 'all',
  });

  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Invalid source parameter', 400);
  }

  const { source } = parsed.data;
  const sourcesToRun =
    source === 'all'
      ? OPEN_DATA_SOURCES.filter((s) => s.enabled).map((s) => s.key)
      : [source as ImportSource];

  const results: ImportResult[] = [];

  for (const sourceKey of sourcesToRun) {
    // Create tracking record
    const [importRecord] = await db
      .insert(dataImports)
      .values({ source: sourceKey, status: 'running' })
      .returning({ id: dataImports.id });

    try {
      const fetcher = FETCHERS[sourceKey];
      const records = await fetcher();

      let result: ImportResult;
      if (records.length > 0) {
        result = await importRecords(records, importRecord.id);
      } else {
        result = { source: sourceKey, fetched: 0, inserted: 0, skipped: 0, errors: [] };
      }

      await db
        .update(dataImports)
        .set({
          status: 'completed',
          recordsFetched: result.fetched,
          recordsInserted: result.inserted,
          recordsSkipped: result.skipped,
          errorMessage: result.errors.length > 0 ? result.errors.slice(0, 20).join('\n') : null,
          completedAt: new Date(),
        })
        .where(eq(dataImports.id, importRecord.id));

      results.push(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[open-data-import] ${sourceKey} failed:`, msg);

      await db
        .update(dataImports)
        .set({
          status: 'failed',
          errorMessage: msg,
          completedAt: new Date(),
        })
        .where(eq(dataImports.id, importRecord.id));

      results.push({
        source: sourceKey,
        fetched: 0,
        inserted: 0,
        skipped: 0,
        errors: [msg],
      });
    }
  }

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  return apiSuccess({
    results,
    summary: {
      sources: results.length,
      totalInserted,
      totalSkipped,
      completedAt: new Date().toISOString(),
    },
  });
}
