import { db } from '@/lib/db';
import { badgeDefinitions } from '@/lib/db/schema';
import { MVP_BADGES } from './xp-config';

export async function seedBadgeDefinitions() {
  for (const badge of MVP_BADGES) {
    await db
      .insert(badgeDefinitions)
      .values({
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        criteria: badge.criteria,
      })
      .onConflictDoNothing();
  }
}
