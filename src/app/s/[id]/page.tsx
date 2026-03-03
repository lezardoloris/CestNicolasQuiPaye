import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSubmissionById } from '@/lib/api/submission-detail';
import { SubmissionFullContent } from '@/components/features/submissions/SubmissionFullContent';
import { isValidUUID } from '@/lib/utils/validation';
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { SubmissionCardData, CostToNicolasResults } from '@/types/submission';

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

  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  // Map server data to SubmissionCardData shape for the shared content component
  const cardData: SubmissionCardData = {
    id: submission.id,
    title: submission.title,
    slug: submission.slug,
    description: submission.description,
    sourceUrl: submission.sourceUrl,
    amount: submission.amount,
    costPerTaxpayer: submission.costPerTaxpayer,
    upvoteCount: submission.upvoteCount,
    downvoteCount: submission.downvoteCount,
    commentCount: submission.commentCount,
    hotScore: submission.hotScore,
    status: submission.status,
    authorId: submission.authorId,
    authorDisplay: submission.authorDisplay,
    createdAt: submission.createdAt,
    costToNicolasResults: submission.costToNicolasResults as CostToNicolasResults | null,
    ministryTag: submission.ministryTag,
    sourceCount: submission.sourceCount,
    noteCount: submission.noteCount,
    solutionCount: submission.solutionCount,
    maturityLevel: submission.maturityLevel,
  };

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 pb-20 md:pb-8">
      <Link
        href="/feed/hot"
        className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au fil
      </Link>
      <SubmissionFullContent submission={cardData} />
    </main>
  );
}
