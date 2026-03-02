import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api/response';
import { publicExportQuerySchema } from '@/lib/utils/validation';
import { publicApiGuard, withCacheHeaders } from '@/lib/api/public-api';
import { exportPublicSubmissions } from '@/lib/api/public-submissions';
import { toCSV } from '@/lib/utils/csv';
import type { PublicExportRow } from '@/types/public-api';

const CSV_COLUMNS: { key: keyof PublicExportRow; header: string }[] = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Titre' },
  { key: 'description', header: 'Description' },
  { key: 'amount', header: 'Montant (EUR)' },
  { key: 'category', header: 'Categorie' },
  { key: 'sourceUrl', header: 'Source URL' },
  { key: 'votesUp', header: 'Votes Pour' },
  { key: 'votesDown', header: 'Votes Contre' },
  { key: 'commentCount', header: 'Commentaires' },
  { key: 'costPerTaxpayer', header: 'Cout/Contribuable (EUR)' },
  { key: 'createdAt', header: 'Date de creation' },
];

export async function GET(request: NextRequest): Promise<Response> {
  const guardResult = await publicApiGuard(request);
  if (guardResult) return guardResult;

  const { searchParams } = new URL(request.url);
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = publicExportQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', 'Parametres invalides', 400, {
      errors: parsed.error.flatten(),
    });
  }

  try {
    const rows = await exportPublicSubmissions(parsed.data);

    if (parsed.data.format === 'csv') {
      const csv = toCSV(rows, CSV_COLUMNS);
      const response = new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nicoquipaie-export.csv"',
        },
      });
      return withCacheHeaders(response, 3600);
    }

    const response = NextResponse.json({
      data: rows,
      meta: {
        count: rows.length,
        exportedAt: new Date().toISOString(),
      },
    });
    return withCacheHeaders(response, 3600);
  } catch (error) {
    console.error('[Public API] export error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
