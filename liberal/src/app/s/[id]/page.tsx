import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getSubmissionById } from '@/lib/api/submission-detail';
import { SubmissionDetail } from '@/components/features/submissions/SubmissionDetail';
import { ConsequenceCard } from '@/components/features/consequences/ConsequenceCard';
import { ConsequenceLoader } from '@/components/features/consequences/ConsequenceLoader';
import { ShareButton } from '@/components/features/sharing/ShareButton';
import { CommentSection } from '@/components/features/comments/CommentSection';
import { FlagButton } from '@/components/features/submissions/FlagButton';
import { SolutionSection } from '@/components/features/solutions/SolutionSection';
import { auth } from '@/lib/auth';
import { isValidUUID } from '@/lib/utils/validation';
import { hashIp } from '@/lib/utils/ip-hash';
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { CostToNicolasResults } from '@/types/submission';

export const revalidate = 300; // 5 minutes ISR

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!isValidUUID(id)) {
    return { title: 'Signalement introuvable' };
  }

  const submission = await getSubmissionById(id);
  if (!submission) {
    return { title: 'Signalement introuvable' };
  }

  const costText = submission.costPerTaxpayer
    ? `Ce gaspillage coute ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(parseFloat(submission.costPerTaxpayer))} a chaque Francais. `
    : '';

  const description = `${costText}${submission.description.slice(0, 200)}`;
  const ogImageUrl = `${SITE_URL}/api/og/${id}`;

  return {
    title: `${submission.title} - ${SITE_NAME}`,
    description,
    openGraph: {
      title: submission.title,
      description,
      type: 'article',
      locale: 'fr_FR',
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: submission.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: submission.title,
      description,
      site: TWITTER_HANDLE,
      images: [ogImageUrl],
    },
  };
}

interface SubmissionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const { id } = await params;

  if (!isValidUUID(id)) {
    notFound();
  }

  const session = await auth();
  const headersList = await headers();
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headersList.get('x-real-ip')
    ?? '127.0.0.1';
  const ipHash = !session?.user?.id ? hashIp(clientIp) : undefined;
  const submission = await getSubmissionById(
    id,
    session?.user?.id,
    ipHash,
    (session?.user as { role?: string } | undefined)?.role,
  );

  if (!submission) {
    notFound();
  }

  // Parse costToNicolasResults JSONB
  const costToNicolasResults = submission.costToNicolasResults as CostToNicolasResults | null;

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 pb-20 md:pb-8">
      <SubmissionDetail
        submission={submission}
        currentUserId={session?.user?.id}
      />

      {/* Share and Flag actions */}
      <div className="mt-6 flex items-center gap-3">
        <ShareButton
          submissionId={submission.id}
          title={submission.title}
          costPerTaxpayer={submission.costPerTaxpayer ? parseFloat(submission.costPerTaxpayer) : undefined}
        />
        <FlagButton submissionId={submission.id} />
      </div>

      {/* Cost to Nicolas section */}
      {submission.costCalculation ? (
        <ConsequenceCard data={submission.costCalculation} />
      ) : costToNicolasResults ? (
        <ConsequenceCard jsonData={costToNicolasResults} />
      ) : (
        <ConsequenceLoader
          submissionId={submission.id}
          amount={submission.amount}
        />
      )}

      {/* Solutions section */}
      <SolutionSection submissionId={submission.id} />

      {/* Comments section */}
      <section className="mt-8" aria-label="Commentaires">
        <CommentSection
          submissionId={submission.id}
          commentCount={submission.commentCount}
        />
      </section>
    </main>
  );
}
