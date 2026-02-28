import { ExternalLink } from 'lucide-react';
import { isTweetUrl } from '@/lib/utils/tweet-detector';
import TweetEmbed from '@/components/features/tweets/TweetEmbed';

interface SourceUrlDisplayProps {
  sourceUrl: string;
}

export default function SourceUrlDisplay({
  sourceUrl,
}: SourceUrlDisplayProps) {
  const isTweet = isTweetUrl(sourceUrl);

  let hostname = '';
  try {
    hostname = new URL(sourceUrl).hostname.replace('www.', '');
  } catch {
    hostname = sourceUrl;
  }

  return (
    <div>
      {/* Always show the source URL as a clickable link (FR5) */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-text-secondary text-sm">Source :</span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-chainsaw-red hover:underline font-medium"
          aria-label={`Ouvrir la source sur ${hostname}`}
        >
          <span className="truncate max-w-[300px]">{hostname}</span>
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
        </a>
      </div>

      {/* Show tweet embed if source is a tweet URL */}
      {isTweet && <TweetEmbed sourceUrl={sourceUrl} />}
    </div>
  );
}
