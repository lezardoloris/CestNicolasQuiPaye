import { ExternalLink, AlertTriangle } from 'lucide-react';

interface TweetFallbackProps {
  url: string;
}

export default function TweetFallback({ url }: TweetFallbackProps) {
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = 'x.com';
  }

  return (
    <div className="mx-auto max-w-[550px] rounded-xl border border-border-default bg-surface-secondary p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-text-primary font-medium mb-2">
            Tweet indisponible - voir le lien original
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-chainsaw-red hover:underline"
            aria-label={`Ouvrir le tweet original sur ${hostname}`}
          >
            <span className="break-all">{url}</span>
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
