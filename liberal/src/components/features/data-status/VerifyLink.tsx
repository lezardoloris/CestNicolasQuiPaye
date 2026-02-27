import { ExternalLink } from 'lucide-react';
import { formatFrenchDate } from '@/lib/utils/format';

interface VerifyLinkProps {
  lastUpdated?: string;
  className?: string;
}

/**
 * Small inline "Verifier" link used next to any Cost to Nicolas value.
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
          ? `Verifier cette donnee - derniere mise a jour le ${formattedDate}`
          : 'Verifier cette donnee'
      }
      title={
        formattedDate
          ? `Derniere mise a jour : ${formattedDate}`
          : 'Verifier cette donnee'
      }
    >
      Verifier
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
