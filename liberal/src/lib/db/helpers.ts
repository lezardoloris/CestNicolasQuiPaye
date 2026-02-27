import { sql } from 'drizzle-orm';
import type { db as DbType } from './index';

/**
 * Generates a unique anonymous ID in the format "Nicolas #XXXX"
 * where XXXX is a zero-padded sequential number.
 */
export async function generateAnonymousId(
  database: typeof DbType,
): Promise<string> {
  const result = await database.execute(
    sql`SELECT anonymous_id FROM users ORDER BY created_at DESC LIMIT 1`,
  );

  let nextNumber = 1;

  if (result.length > 0) {
    const lastId = result[0].anonymous_id as string;
    const match = lastId.match(/#(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextNumber).padStart(4, '0');
  return `Nicolas #${padded}`;
}
