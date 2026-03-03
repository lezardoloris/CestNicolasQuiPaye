import { db } from '@/lib/db';
import { aiContexts, submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateTemplateContext } from '@/lib/utils/ai-context-template';
import { enrichWithLlm } from '@/lib/api/ai-enrich';

/**
 * Generate and persist template-based AI context for a submission.
 * Idempotent: if context already exists, returns existing.
 * Call this after submission creation or on first view.
 */
export async function ensureAiContext(submissionId: string): Promise<{
  budgetContext: string | null;
  costComparison: string | null;
  relatedFacts: string[] | null;
  summary: string | null;
  source: string;
}> {
  // Check if already generated
  const [existing] = await db
    .select()
    .from(aiContexts)
    .where(eq(aiContexts.submissionId, submissionId))
    .limit(1);

  if (existing) {
    return {
      budgetContext: existing.budgetContext,
      costComparison: existing.costComparison,
      relatedFacts: existing.relatedFacts,
      summary: existing.summary,
      source: existing.source,
    };
  }

  // Fetch submission data needed for template
  const [submission] = await db
    .select({
      title: submissions.title,
      amount: submissions.amount,
      ministryTag: submissions.ministryTag,
      costPerTaxpayer: submissions.costPerTaxpayer,
    })
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  const amount = parseFloat(submission.amount);
  const costPerTaxpayer = submission.costPerTaxpayer
    ? parseFloat(submission.costPerTaxpayer)
    : null;

  const template = generateTemplateContext({
    title: submission.title,
    amount,
    ministryTag: submission.ministryTag,
    costPerTaxpayer,
  });

  // Also update consequenceText on submission for maturity tracking
  const fullText = [template.budgetContext, template.costComparison].join('\n\n');

  const [inserted] = await db
    .insert(aiContexts)
    .values({
      submissionId,
      budgetContext: template.budgetContext,
      costComparison: template.costComparison,
      relatedFacts: template.relatedFacts,
      source: 'template',
      status: 'approved', // Template-generated is auto-approved
    })
    .returning();

  // Update consequenceText so maturity system detects AI context
  await db
    .update(submissions)
    .set({ consequenceText: fullText })
    .where(eq(submissions.id, submissionId));

  // Fire-and-forget: enrich with LLM if API key configured
  // Summary will appear on next page load
  enrichWithLlm(submissionId, {
    title: submission.title,
    description: fullText,
    amount,
    ministryTag: submission.ministryTag,
    budgetContext: template.budgetContext,
    costComparison: template.costComparison,
  }).catch(() => {});

  return {
    budgetContext: inserted.budgetContext,
    costComparison: inserted.costComparison,
    relatedFacts: inserted.relatedFacts,
    summary: inserted.summary,
    source: inserted.source,
  };
}
