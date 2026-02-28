import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiSuccess, apiError } from '@/lib/api/response';
import { z } from 'zod';

const editSchema = z.object({
    title: z.string().min(10).max(200).optional(),
    description: z.string().min(20).max(2000).optional(),
    estimatedCostEur: z.coerce.number().positive().optional(),
    sourceUrl: z.string().url().optional(),
    ministryTag: z.string().max(100).nullable().optional(),
});

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return apiError('UNAUTHORIZED', 'Non authentifié', 401);
    }

    const { id } = await params;

    // Fetch existing submission
    const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, id))
        .limit(1);

    if (!submission) {
        return apiError('NOT_FOUND', 'Signalement introuvable', 404);
    }

    // Only the author or an admin can edit
    const isAdmin = (session.user as { role?: string }).role === 'admin'
        || (session.user as { role?: string }).role === 'moderator';
    if (submission.authorId !== session.user.id && !isAdmin) {
        return apiError('FORBIDDEN', 'Non autorisé', 403);
    }

    // Parse body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return apiError('BAD_REQUEST', 'Corps de requête invalide', 400);
    }

    const result = editSchema.safeParse(body);
    if (!result.success) {
        return apiError('VALIDATION_ERROR', 'Données invalides', 400, {
            fieldErrors: result.error.flatten().fieldErrors,
        });
    }

    const patch = result.data;

    // Build update object
    const update: Partial<typeof submissions.$inferInsert> = {
        updatedAt: new Date(),
    };

    if (patch.title !== undefined) {
        update.title = patch.title;
        update.slug = `${slugify(patch.title)}-${id.slice(0, 8)}`;
    }
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.sourceUrl !== undefined) update.sourceUrl = patch.sourceUrl;
    if (patch.ministryTag !== undefined) update.ministryTag = patch.ministryTag;
    if (patch.estimatedCostEur !== undefined) {
        update.amount = String(patch.estimatedCostEur);
        // Reset cost per taxpayer so it recalculates on next page load
        update.costPerTaxpayer = null;
        update.costToNicolasResults = null;
    }

    const [updated] = await db
        .update(submissions)
        .set(update)
        .where(eq(submissions.id, id))
        .returning();

    return apiSuccess({ id: updated.id, updatedAt: updated.updatedAt });
}
