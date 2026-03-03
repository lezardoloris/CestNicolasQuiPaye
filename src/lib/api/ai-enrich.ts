import { db } from '@/lib/db';
import { aiContexts } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? 'mistral-small-latest';
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT ?? '500', 10);

interface EnrichInput {
  title: string;
  description: string;
  amount: number;
  ministryTag: string | null;
  budgetContext: string;
  costComparison: string;
}

interface VoteData {
  essentiel: number;
  justifie_ameliorable: number;
  discutable: number;
  injustifie: number;
  total: number;
  consensusType: string;
}

interface SolutionData {
  body: string;
  authorDisplay: string;
  upvoteCount: number;
}

/** Check daily LLM usage and return true if under limit. */
async function checkDailyLimit(): Promise<boolean> {
  if (!MISTRAL_API_KEY) return false;

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
    return false;
  }
  return true;
}

/** Call Mistral API with a prompt, return response text or null. */
async function callMistral(prompt: string, maxTokens = 200): Promise<string | null> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error('LLM call failed:', response.status, await response.text());
    return null;
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content as string | undefined)?.trim() ?? null;
}

/**
 * Enrich an existing AI context with a cheap LLM summary via Mistral.
 * Requires MISTRAL_API_KEY env var. No-ops gracefully if not configured.
 */
export async function enrichWithLlm(
  submissionId: string,
  input: EnrichInput,
): Promise<string | null> {
  if (!(await checkDailyLimit())) return null;

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
    const summary = await callMistral(prompt);

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

/**
 * Generate a vote summary when enough votes accumulate.
 * Describes the distribution and consensus in 2-3 sentences.
 */
export async function enrichVoteSummary(
  submissionId: string,
  title: string,
  voteData: VoteData,
): Promise<string | null> {
  if (!(await checkDailyLimit())) return null;

  const pct = (n: number): string =>
    voteData.total > 0 ? `${Math.round((n / voteData.total) * 100)}%` : '0%';

  const prompt = `Tu es un analyste citoyen. Résume en 2-3 phrases la tendance du vote citoyen sur cette dépense publique. Sois factuel et neutre.

Dépense : ${title}
Nombre de votes : ${voteData.total}

Distribution :
- Essentiel : ${voteData.essentiel} (${pct(voteData.essentiel)})
- Justifié mais améliorable : ${voteData.justifie_ameliorable} (${pct(voteData.justifie_ameliorable)})
- Discutable : ${voteData.discutable} (${pct(voteData.discutable)})
- Injustifié : ${voteData.injustifie} (${pct(voteData.injustifie)})

Consensus : ${voteData.consensusType}

Résumé de la tendance (2-3 phrases, factuel, en français) :`;

  try {
    const voteSummary = await callMistral(prompt, 150);

    if (voteSummary) {
      await db
        .update(aiContexts)
        .set({ voteSummary, source: 'llm', updatedAt: new Date() })
        .where(eq(aiContexts.submissionId, submissionId));
    }

    return voteSummary;
  } catch (error) {
    console.error('Vote summary enrichment error:', error);
    return null;
  }
}

/**
 * Generate a solution summary when enough solutions are proposed.
 * Describes the main ideas in 2-3 sentences.
 */
export async function enrichSolutionSummary(
  submissionId: string,
  title: string,
  solutions: SolutionData[],
): Promise<string | null> {
  if (!(await checkDailyLimit())) return null;

  const solutionList = solutions
    .slice(0, 10)
    .map((s, i) => `${i + 1}. "${s.body}" (par ${s.authorDisplay}, ${s.upvoteCount} soutiens)`)
    .join('\n');

  const prompt = `Tu es un analyste citoyen. Résume en 2-3 phrases les solutions proposées par les citoyens pour cette dépense publique. Identifie les thèmes communs. Sois factuel et neutre.

Dépense : ${title}
Nombre de solutions : ${solutions.length}

Solutions proposées :
${solutionList}

Résumé des solutions (2-3 phrases, factuel, en français) :`;

  try {
    const solutionSummary = await callMistral(prompt, 150);

    if (solutionSummary) {
      await db
        .update(aiContexts)
        .set({ solutionSummary, source: 'llm', updatedAt: new Date() })
        .where(eq(aiContexts.submissionId, submissionId));
    }

    return solutionSummary;
  } catch (error) {
    console.error('Solution summary enrichment error:', error);
    return null;
  }
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md€`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M€`;
  return `${Math.round(amount).toLocaleString('fr-FR')} €`;
}
