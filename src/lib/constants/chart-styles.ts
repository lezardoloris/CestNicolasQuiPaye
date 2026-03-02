/**
 * Shared Recharts tooltip and axis styles.
 * Used across all budget chart components to avoid duplication (H6).
 */

import type { CSSProperties } from 'react';

export const CHART_TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: 'var(--color-surface-secondary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: '8px',
  color: 'var(--color-text-primary)',
  fontSize: '12px',
};

export const CHART_TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: 'var(--color-text-primary)',
};

export const CHART_TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: 'var(--color-text-primary)',
};

export const CHART_TOOLTIP_WRAPPER_STYLE: CSSProperties = {
  zIndex: 40,
};
