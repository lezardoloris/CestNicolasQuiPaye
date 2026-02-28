import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatEUR, formatEURPrecise } from '@/lib/utils/format';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, id),
    });

    if (!submission || submission.moderationStatus !== 'approved') {
      return new Response('Not found', { status: 404 });
    }

    const title =
      submission.title.length > 100
        ? submission.title.slice(0, 100) + '...'
        : submission.title;

    const amount = formatEUR(Number(submission.amount));
    const costPerCitizen = submission.costPerTaxpayer
      ? formatEURPrecise(Number(submission.costPerTaxpayer))
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            backgroundColor: '#0A0A0B',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                color: '#DC2626',
                fontSize: '36px',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
              }}
            >
              NICOLAS PAYE
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              color: '#F5F5F5',
              fontSize: '40px',
              fontWeight: 'bold',
              lineHeight: 1.2,
              marginBottom: '24px',
              maxHeight: '120px',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>

          {/* Cost Amount */}
          <div
            style={{
              color: '#DC2626',
              fontSize: '56px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}
          >
            {amount}
          </div>

          {/* Cost per citizen */}
          {costPerCitizen && (
            <div
              style={{
                color: '#F5F5F5',
                fontSize: '24px',
                marginBottom: '32px',
              }}
            >
              Coute pour chaque Francais : {costPerCitizen}
            </div>
          )}

          {/* Red divider */}
          <div
            style={{
              height: '3px',
              backgroundColor: '#DC2626',
              width: '100%',
              marginTop: 'auto',
              marginBottom: '16px',
            }}
          />

          {/* Footer */}
          <div
            style={{
              color: '#A3A3A3',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>liberal.fr</span>
            <span>Plateforme citoyenne de responsabilite fiscale</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control':
            'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
