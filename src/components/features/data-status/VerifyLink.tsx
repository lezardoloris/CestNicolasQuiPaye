import { ExternalLink } from 'lucide-react';
import { formatFrenchDate } from '@/lib/utils/format';

interface VerifyLinkProps {
  lastUpdated?: string;
  className?: string;
}

/**
 * Small inline "Vérifier" link used next to any Cost to Nicolas value.
 * Links to /data-status for full transparency.
 * Tooltip shows last updated date.
 */
export default function VerifyLink({
  lastUpdated,
  className,
}: VerifyLinkProps) {
  const formattedDate = lastUpdated
    ? formatFrenchDate(lastUpdated)
    : null;

  return (
    <a
      href="/data-status"
      className={`inline-flex items-center gap-1 text-xs text-text-muted hover:text-chainsaw-red transition-colors ${className || ''}`}
      aria-label={
        formattedDate
          ? `Vérifier cette donnée - dernière mise à jour le ${formattedDate}`
          : 'Vérifier cette donnée'
      }
      title={
        formattedDate
          ? `Dernière mise à jour : ${formattedDate}`
          : 'Vérifier cette donnée'
      }
    >
      Vérifier
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
