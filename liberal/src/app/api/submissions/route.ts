import { NextRequest, NextResponse } from 'next/server';
import { submissionFormSchema } from '@/lib/utils/validation';
import { isTweetUrl, normalizeTweetUrl } from '@/lib/utils/tweet-detector';

// ─── API Envelope Helper ───────────────────────────────────────────

function jsonResponse(
  data: unknown,
  error: unknown = null,
  meta: Record<string, unknown> = {},
  status = 200
) {
  return NextResponse.json({ data, error, meta }, { status });
}

// ─── POST /api/submissions ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const result = submissionFormSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return jsonResponse(
        null,
        {
          code: 'VALIDATION_ERROR',
          message: 'Donnees invalides',
          fieldErrors,
        },
        {},
        400
      );
    }

    const { title, description, estimatedCostEur, sourceUrl } = result.data;

    // Detect tweet URL
    const tweetUrl = isTweetUrl(sourceUrl)
      ? normalizeTweetUrl(sourceUrl)
      : null;

    // Generate a slug from title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);

    // Create submission ID (in production this would use DB)
    const id = crypto.randomUUID();

    // Note: In production, this would insert into the database using Drizzle ORM.
    // The actual DB insert is shown here as the intended query structure.
    // When the database connection is configured, uncomment and use:
    //
    // import { db } from '@/lib/db';
    // import { submissions } from '@/lib/db/schema';
    //
    // const [submission] = await db.insert(submissions).values({
    //   authorId: session.user.id,
    //   authorDisplay: session.user.displayName || session.user.anonymousId,
    //   title,
    //   slug,
    //   description,
    //   sourceUrl,
    //   tweetUrl,
    //   amount: String(estimatedCostEur),
    //   status: 'pending',
    // }).returning();

    const submission = {
      id,
      title,
      slug,
      description,
      sourceUrl,
      tweetUrl,
      amount: String(estimatedCostEur),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    return jsonResponse(submission, null, {}, 201);
  } catch (error) {
    console.error('Submission creation error:', error);
    return jsonResponse(
      null,
      {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue. Veuillez reessayer.',
      },
      {},
      500
    );
  }
}
