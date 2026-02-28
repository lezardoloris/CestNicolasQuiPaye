'use client';

import { Suspense, lazy } from 'react';
import { extractTweetId } from '@/lib/utils/tweet-detector';
import TweetFallback from './TweetFallback';
import { TweetErrorBoundary } from './TweetErrorBoundary';

// Lazy load the tweet component to avoid blocking LCP
const TweetComponent = lazy(() =>
  import('react-tweet').then((mod) => ({ default: mod.Tweet }))
);

interface TweetEmbedProps {
  sourceUrl: string;
}

export default function TweetEmbed({ sourceUrl }: TweetEmbedProps) {
  const tweetId = extractTweetId(sourceUrl);

  if (!tweetId) return null;

  return (
    <div className="my-6">
      <Suspense fallback={<TweetEmbedSkeleton />}>
        <TweetErrorBoundary fallback={<TweetFallback url={sourceUrl} />}>
          <div className="mx-auto max-w-[550px]">
            <TweetComponent id={tweetId} />
          </div>
        </TweetErrorBoundary>
      </Suspense>
    </div>
  );
}

function TweetEmbedSkeleton() {
  return (
    <div className="mx-auto max-w-[550px] animate-pulse rounded-xl border border-border-default bg-surface-secondary p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-surface-elevated" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-surface-elevated mb-2" />
          <div className="h-3 w-24 rounded bg-surface-elevated" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-surface-elevated" />
        <div className="h-4 w-3/4 rounded bg-surface-elevated" />
        <div className="h-4 w-1/2 rounded bg-surface-elevated" />
      </div>
    </div>
  );
}
