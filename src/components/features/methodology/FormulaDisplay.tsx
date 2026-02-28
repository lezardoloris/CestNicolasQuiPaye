interface FormulaDisplayProps {
  formula: string;
  ariaLabel: string;
}

/**
 * Renders a formula in a visually distinct styled block.
 * Uses <code> element with aria-label for accessibility.
 */
export default function FormulaDisplay({
  formula,
  ariaLabel,
}: FormulaDisplayProps) {
  return (
    <div className="my-3 rounded-lg border border-border-default bg-surface-elevated px-4 py-3">
      <code
        className="font-mono text-base text-chainsaw-red"
        aria-label={ariaLabel}
      >
        {formula}
      </code>
    </div>
  );
}
