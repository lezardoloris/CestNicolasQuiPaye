import { db } from '@/lib/db';
import { submissions, dataImports } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { calculateHotScore } from '@/lib/utils/hot-score';
import type { OpenDataRecord, ImportResult, ImportSource } from '@/types/open-data';

const TAXPAYERS = 18_600_000;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

async function existsInDb(importSource: ImportSource, externalId: string): Promise<boolean> {
  const existing = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.importSource, importSource), eq(submissions.externalId, externalId)))
    .limit(1);
  return existing.length > 0;
}

export async function importRecords(
  records: OpenDataRecord[],
  importId: string,
): Promise<ImportResult> {
  const result: ImportResult = {
    source: records[0]?.importSource ?? 'decp',
    fetched: records.length,
    inserted: 0,
    skipped: 0,
    errors: [],
  };

  for (const record of records) {
    try {
      const alreadyExists = await existsInDb(record.importSource, record.externalId);
      if (alreadyExists) {
        result.skipped++;
        continue;
      }

      const now = new Date();
      const hotScore = calculateHotScore(0, 0, now);
      const costPerTaxpayer = Math.round((record.amount / TAXPAYERS) * 100) / 100;

      await db.insert(submissions).values({
        authorDisplay: 'Données Officielles',
        title: record.title.slice(0, 200),
        slug: generateSlug(record.title),
        description: record.description,
        sourceUrl: record.sourceUrl,
        amount: String(record.amount),
        ministryTag: record.category,
        costPerTaxpayer: String(costPerTaxpayer),
        status: 'published',
        moderationStatus: 'approved',
        hotScore: String(hotScore),
        isSeeded: 2,
        externalId: record.externalId,
        importSource: record.importSource,
        createdAt: now,
        updatedAt: now,
      });

      result.inserted++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Skip unique constraint violations silently (concurrent dedup)
      if (msg.includes('unique') || msg.includes('duplicate')) {
        result.skipped++;
      } else {
        result.errors.push(`${record.externalId}: ${msg}`);
      }
    }
  }

  // Update the import tracking record
  await db
    .update(dataImports)
    .set({
      recordsFetched: result.fetched,
      recordsInserted: result.inserted,
      recordsSkipped: result.skipped,
      errorMessage: result.errors.length > 0 ? result.errors.join('\n') : null,
    })
    .where(eq(dataImports.id, importId));

  return result;
}
