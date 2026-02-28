import { NextRequest, NextResponse } from 'next/server';
import { getCachedDenominators } from '@/lib/api/cost-cache';
import { calculateCostToNicolas } from '@/lib/utils/cost-calculator';

// ─── API Envelope Helper ───────────────────────────────────────────

function jsonResponse(
  data: unknown,
  error: unknown = null,
  meta: Record<string, unknown> = {},
  status = 200
) {
  return NextResponse.json({ data, error, meta }, { status });
}

// ─── GET /api/submissions/[id]/cost ────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate submission ID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return jsonResponse(
        null,
        { code: 'INVALID_ID', message: 'ID de soumission invalide' },
        {},
        400
      );
    }

    // In production, fetch submission from database:
    // const submission = await db.query.submissions.findFirst({
    //   where: eq(submissions.id, id),
    // });
    //
    // if (!submission) {
    //   return jsonResponse(null, { code: 'NOT_FOUND', message: 'Soumission introuvable' }, {}, 404);
    // }
    //
    // // Check if we have cached results
    // if (submission.costToNicolasResults) {
    //   return jsonResponse(submission.costToNicolasResults);
    // }

    // Get amount from query param (used when DB is not available)
    const amountParam = request.nextUrl.searchParams.get('amount');
    const amount = amountParam ? parseFloat(amountParam) : null;

    if (!amount || amount <= 0) {
      return jsonResponse(
        null,
        {
          code: 'INVALID_AMOUNT',
          message: 'Le montant doit etre un nombre positif',
        },
        {},
        400
      );
    }

    // Get denominators from cache
    const denominators = await getCachedDenominators();

    // Calculate Cost to Nicolas
    const result = calculateCostToNicolas(amount, denominators);

    // In production, cache the result in the submission:
    // await db.update(submissions)
    //   .set({ costToNicolasResults: result })
    //   .where(eq(submissions.id, id));
    //
    // Also insert into cost_calculations table:
    // await db.insert(costCalculations).values({
    //   submissionId: id,
    //   amountEur: String(amount),
    //   costPerCitizen: result.cost_per_citizen != null ? String(result.cost_per_citizen) : null,
    //   costPerTaxpayer: result.cost_per_taxpayer != null ? String(result.cost_per_taxpayer) : null,
    //   costPerHousehold: result.cost_per_household != null ? String(result.cost_per_household) : null,
    //   daysOfWorkEquivalent: result.days_of_work_equivalent != null ? String(result.days_of_work_equivalent) : null,
    //   equivalences: result.equivalences,
    //   denominatorsUsed: result.denominators_used,
    // });

    return jsonResponse(result, null, {
      submissionId: id,
      cached: false,
    });
  } catch (error) {
    console.error('Cost calculation error:', error);
    return jsonResponse(
      null,
      {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors du calcul du cout.',
      },
      {},
      500
    );
  }
}
