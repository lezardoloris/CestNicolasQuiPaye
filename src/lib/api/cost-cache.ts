import type { DenominatorData, DenominatorCache } from '@/types/cost-engine';
import { fetchDenominators } from './cost-engine';

// ─── In-Memory Cache (fallback when Redis unavailable) ─────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let memoryCache: DenominatorCache | null = null;

/**
 * Get denominator data with caching.
 *
 * In production with Redis:
 *   - First checks Redis for cached data
 *   - Falls back to Python FastAPI if cache miss
 *   - Stores result in Redis with 24h TTL
 *
 * Without Redis (development):
 *   - Uses in-memory cache with 24h TTL
 *   - Falls back to hardcoded seed data if cost engine unavailable
 */
export async function getCachedDenominators(): Promise<DenominatorData[]> {
  // Check in-memory cache first
  if (memoryCache) {
    const cacheAge = Date.now() - new Date(memoryCache.cachedAt).getTime();
    if (cacheAge < CACHE_TTL_MS) {
      return memoryCache.data;
    }
  }

  // Try Redis cache if available
  try {
    const redisData = await getFromRedis('denominators:all');
    if (redisData) {
      const parsed: DenominatorCache = JSON.parse(redisData);
      memoryCache = parsed;
      return parsed.data;
    }
  } catch {
    // Redis unavailable, continue to fetch
  }

  // Fetch from cost engine
  try {
    const data = await fetchDenominators();
    const cache: DenominatorCache = {
      data,
      cachedAt: new Date().toISOString(),
      ttl: CACHE_TTL_MS,
    };

    // Update caches
    memoryCache = cache;
    await setInRedis(
      'denominators:all',
      JSON.stringify(cache),
      CACHE_TTL_MS / 1000
    );

    return data;
  } catch {
    // If cost engine is unavailable, return seed data
    return getSeedDenominators();
  }
}

/**
 * Invalidate the denominator cache.
 * Called after a manual refresh.
 */
export async function invalidateDenominatorCache(): Promise<void> {
  memoryCache = null;
  try {
    await deleteFromRedis('denominators:all');
  } catch {
    // Redis unavailable, memory cache already cleared
  }
}

// ─── Redis Helpers ─────────────────────────────────────────────────
// These use Upstash Redis when configured, otherwise no-op.

async function getFromRedis(key: string): Promise<string | null> {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function setInRedis(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Redis unavailable
  }
}

async function deleteFromRedis(key: string): Promise<void> {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    await redis.del(key);
  } catch {
    // Redis unavailable
  }
}

// ─── Seed Data (fallback) ──────────────────────────────────────────

function getSeedDenominators(): DenominatorData[] {
  return [
    {
      key: 'france_population',
      value: 68373433,
      source_name: 'INSEE - Population totale au 1er janvier 2025',
      source_url: 'https://www.insee.fr/fr/statistiques/5894851',
      last_updated: '2025-01-01T00:00:00Z',
      update_frequency: 'quarterly',
    },
    {
      key: 'income_tax_payers',
      value: 18600000,
      source_name:
        "DGFIP - Foyers fiscaux imposables a l'impot sur le revenu 2024",
      source_url:
        'https://www.impots.gouv.fr/www2/fichiers/statistiques/base_statistiques.htm',
      last_updated: '2024-09-01T00:00:00Z',
      update_frequency: 'yearly',
    },
    {
      key: 'france_households',
      value: 30400000,
      source_name: 'INSEE - Nombre de menages en France 2024',
      source_url: 'https://www.insee.fr/fr/statistiques/2381486',
      last_updated: '2024-01-01T00:00:00Z',
      update_frequency: 'yearly',
    },
    {
      key: 'daily_median_net_income',
      value: 62.4658,
      source_name:
        'INSEE - Revenu salarial median net annuel 2023 (22 800 EUR / 365)',
      source_url: 'https://www.insee.fr/fr/statistiques/6436313',
      last_updated: '2024-06-01T00:00:00Z',
      update_frequency: 'yearly',
    },
    {
      key: 'school_lunch_cost',
      value: 3.5,
      source_name:
        'Cout moyen d\'un repas de cantine scolaire en France 2024',
      source_url:
        'https://www.education.gouv.fr/la-restauration-scolaire-12340',
      last_updated: '2024-09-01T00:00:00Z',
      update_frequency: 'yearly',
    },
    {
      key: 'hospital_bed_day_cost',
      value: 1400.0,
      source_name:
        "Cout moyen d'une journee d'hospitalisation en France 2024",
      source_url:
        'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/panoramas-de-la-drees',
      last_updated: '2024-06-01T00:00:00Z',
      update_frequency: 'yearly',
    },
  ];
}
