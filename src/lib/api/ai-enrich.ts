import { db } from '@/lib/db';
import { aiContexts } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? 'mistral-small-latest';
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT ?? '50', 10);

interface EnrichInput {
  title: string;
  description: string;
  amount: number;
  ministryTag: string | null;
  budgetContext: string;
  costComparison: string;
}

/**
 * Enrich an existing AI context with a cheap LLM summary via Mistral.
 * Requires MISTRAL_API_KEY env var. No-ops gracefully if not configured.
 * Enforces a daily call limit (AI_DAILY_LIMIT, default 50/day).
 */
export async function enrichWithLlm(
  submissionId: string,
  input: EnrichInput,
): Promise<string | null> {
  if (!MISTRAL_API_KEY) {
    return null;
  }

  // Check daily usage limit
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiContexts)
    .where(
      and(
        eq(aiContexts.source, 'llm'),
        gte(aiContexts.updatedAt, todayStart),
      ),
    );

  if (count >= DAILY_LIMIT) {
    console.warn(`AI enrichment daily limit reached (${DAILY_LIMIT}/day)`);
    return null;
  }

  const prompt = `Tu es un analyste budgétaire citoyen. En 2-3 phrases concises, résume l'enjeu de cette dépense publique pour un citoyen français ordinaire. Sois factuel, pas partisan.

Dépense : ${input.title}
Description : ${input.description}
Montant : ${formatAmount(input.amount)}
Catégorie : ${input.ministryTag ?? 'Non catégorisée'}

Contexte budgétaire :
${input.budgetContext}

Comparaisons :
${input.costComparison}

Résumé citoyen (2-3 phrases, factuel, en français) :`;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('LLM enrichment failed:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const summary = (data.choices?.[0]?.message?.content as string | undefined)?.trim() ?? null;

    if (summary) {
      await db
        .update(aiContexts)
        .set({
          summary,
          source: 'llm',
          updatedAt: new Date(),
        })
        .where(eq(aiContexts.submissionId, submissionId));
    }

    return summary;
  } catch (error) {
    console.error('LLM enrichment error:', error);
    return null;
  }
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md€`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M€`;
  return `${Math.round(amount).toLocaleString('fr-FR')} €`;
}
