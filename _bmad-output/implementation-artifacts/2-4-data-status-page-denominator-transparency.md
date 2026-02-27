# Story 2.4: Data Status Page & Denominator Transparency

Status: ready-for-dev

## Story

As a visitor (Nicolas),
I want to see a public data status page showing the freshness and sources of all denominators used in calculations,
so that I can trust the platform's numbers and verify them myself.

## Acceptance Criteria (BDD)

**Given** a visitor navigates to `/data-status`,
**When** the page renders,
**Then** a table is displayed with columns: "Donnee" (denominator name in French), "Valeur actuelle" (current value, formatted with French number formatting), "Source" (clickable link to `source_url`), "Derniere mise a jour" (last_updated date in `DD/MM/YYYY` format), "Prochaine mise a jour" (next expected update based on `update_frequency`),
**And** the page title is "Statut des donnees - LIBERAL" (FR35).

**Given** a denominator was last updated more than 6 months ago,
**When** the table renders,
**Then** that row displays a yellow warning badge with text "Donnee potentiellement obsolete".

**Given** a denominator was last updated within the expected frequency window,
**When** the table renders,
**Then** that row displays a green checkmark badge with text "A jour".

**Given** any Cost to Nicolas calculation is displayed anywhere on the platform (submission detail page, feed card, share image),
**When** the calculation values are rendered,
**Then** each denominator-dependent value has a "Verifier" (Verify this) link next to it that navigates to `/data-status` (NFR21),
**And** the last-updated date for the denominator is displayed in a tooltip or subtitle (FR34).

## Tasks / Subtasks

### Task 1: Next.js API Proxy for Denominators (AC1)
- [ ] Create `src/app/api/v1/denominators/route.ts` as a proxy to the Python FastAPI service:
  ```typescript
  import { NextResponse } from 'next/server';

  const COST_ENGINE_URL = process.env.COST_ENGINE_URL!;

  export async function GET() {
    try {
      const response = await fetch(`${COST_ENGINE_URL}/api/denominators`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Cost engine error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json({ data, error: null, meta: {} });
    } catch (error) {
      return NextResponse.json(
        { data: null, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch denominators' }, meta: {} },
        { status: 500 }
      );
    }
  }
  ```

### Task 2: Denominator French Labels Mapping (AC1)
- [ ] Create `src/lib/utils/denominator-labels.ts` with French display names and metadata:
  ```typescript
  export const DENOMINATOR_LABELS: Record<string, {
    label: string;
    unit: string;
    formatType: 'integer' | 'currency' | 'decimal';
  }> = {
    france_population: {
      label: 'Population francaise',
      unit: 'habitants',
      formatType: 'integer',
    },
    income_tax_payers: {
      label: "Contribuables a l'impot sur le revenu",
      unit: 'foyers fiscaux',
      formatType: 'integer',
    },
    france_households: {
      label: 'Nombre de menages',
      unit: 'menages',
      formatType: 'integer',
    },
    daily_median_net_income: {
      label: 'Revenu net median journalier',
      unit: 'EUR/jour',
      formatType: 'currency',
    },
    school_lunch_cost: {
      label: 'Cout moyen repas cantine scolaire',
      unit: 'EUR/repas',
      formatType: 'currency',
    },
    hospital_bed_day_cost: {
      label: "Cout moyen journee d'hospitalisation",
      unit: 'EUR/jour',
      formatType: 'currency',
    },
  };
  ```

### Task 3: French Number Formatting Utilities (AC1)
- [ ] Add French number formatting functions to `src/lib/utils/format.ts`:
  ```typescript
  /**
   * Format a number with French locale (space as thousands separator, comma as decimal).
   * Examples: 68373433 -> "68 373 433", 62.47 -> "62,47"
   */
  export function formatFrenchNumber(value: number, decimals?: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 0,
    }).format(value);
  }

  /**
   * Format a EUR amount with French locale.
   * Example: 62.47 -> "62,47 EUR"
   */
  export function formatFrenchCurrency(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format a date as DD/MM/YYYY.
   */
  export function formatFrenchDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
  ```

### Task 4: Freshness Calculation Utility (AC2, AC3)
- [ ] Create `src/lib/utils/denominator-freshness.ts`:
  ```typescript
  export type FreshnessStatus = 'fresh' | 'stale';

  export interface FreshnessInfo {
    status: FreshnessStatus;
    label: string;
    nextUpdate: string; // DD/MM/YYYY
  }

  const FREQUENCY_MONTHS: Record<string, number> = {
    quarterly: 3,
    yearly: 12,
    monthly: 1,
  };

  /**
   * Determine if a denominator is fresh or stale.
   * Stale = last_updated > 6 months ago (AC2).
   * Fresh = within expected frequency window (AC3).
   */
  export function getDenominatorFreshness(
    lastUpdated: string,
    updateFrequency: string,
  ): FreshnessInfo {
    const lastDate = new Date(lastUpdated);
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const isStale = lastDate < sixMonthsAgo;

    const frequencyMonths = FREQUENCY_MONTHS[updateFrequency] || 3;
    const nextUpdate = new Date(lastDate);
    nextUpdate.setMonth(nextUpdate.getMonth() + frequencyMonths);

    const nextUpdateFormatted = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(nextUpdate);

    return {
      status: isStale ? 'stale' : 'fresh',
      label: isStale ? 'Donnee potentiellement obsolete' : 'A jour',
      nextUpdate: nextUpdateFormatted,
    };
  }
  ```

### Task 5: DataStatusTable Component (AC1, AC2, AC3)
- [ ] Create `src/components/features/data-status/DataStatusTable.tsx` as a Server Component:
  ```
  - Fetch denominators from `/api/v1/denominators`
  - Render an HTML <table> with proper <thead> and <tbody>
  - Columns: Donnee, Valeur actuelle, Source, Derniere mise a jour, Prochaine mise a jour, Statut
  - For each denominator row:
    - Map key to French label using DENOMINATOR_LABELS
    - Format value using formatFrenchNumber or formatFrenchCurrency based on formatType
    - Source column: clickable <a> tag with external link icon, opens in new tab
    - Last updated: formatFrenchDate(last_updated)
    - Next update: calculated from last_updated + update_frequency
    - Statut: Green badge "A jour" or Yellow badge "Donnee potentiellement obsolete"
  - Table is responsive: horizontal scroll on mobile
  - Accessible: <caption>, scope attributes on headers, proper semantics
  ```

### Task 6: FreshnessBadge Component (AC2, AC3)
- [ ] Create `src/components/features/data-status/FreshnessBadge.tsx`:
  ```typescript
  // Uses shadcn/ui Badge component
  // status: 'fresh' -> green badge with checkmark icon, text "A jour"
  // status: 'stale' -> yellow/amber badge with warning icon, text "Donnee potentiellement obsolete"
  ```

### Task 7: Data Status Page Route (AC1)
- [ ] Create `src/app/data-status/page.tsx`:
  - Server Component with ISR (revalidate every 3600 seconds / 1 hour)
  - Page metadata: `title: "Statut des donnees - LIBERAL"`, `description: "Transparence des donnees utilisees pour les calculs Cout pour Nicolas"`
  - Render page title: "Statut des donnees"
  - Render introductory paragraph explaining what this page shows
  - Render `<DataStatusTable />` component
  - Include a "Methodologie" link to `/methodologie` (Story 2.5)
  - Include a "Retour au fil" link to `/feed/hot`

### Task 8: VerifyLink Component (AC4)
- [ ] Create `src/components/features/data-status/VerifyLink.tsx`:
  ```typescript
  // Small inline link component used next to any Cost to Nicolas value
  // Renders: "Verifier" text with small external-link icon
  // Links to /data-status
  // Tooltip shows: "Derniere mise a jour: {date}" (FR34)
  // Accessible: aria-label="Verifier cette donnee - derniere mise a jour le {date}"
  ```

### Task 9: Integration with Cost to Nicolas Display (AC4)
- [ ] Modify the `ConsequenceCard` component (or create if not yet exists) at `src/components/features/consequences/ConsequenceCard.tsx`:
  - Each cost metric (cost per citizen, cost per taxpayer, etc.) should include:
    - The calculated value
    - A `<VerifyLink />` component linking to `/data-status`
    - A subtitle or tooltip showing `last_updated` date of the relevant denominator (FR34)
  - This is a **preparation** -- the full ConsequenceCard rendering is done in Epic 3 Story 3.2, but the VerifyLink integration pattern is established here

### Task 10: Tests
- [ ] Write `src/lib/utils/denominator-freshness.test.ts`:
  - `test_fresh_denominator`: Updated 1 month ago with quarterly frequency -> "A jour"
  - `test_stale_denominator`: Updated 7 months ago -> "Donnee potentiellement obsolete"
  - `test_borderline_6_months`: Updated exactly 6 months ago -> "A jour"
  - `test_next_update_calculation`: Quarterly frequency calculates correct next date
  - `test_yearly_frequency`: Yearly frequency calculates correct next date

- [ ] Write `src/lib/utils/format.test.ts`:
  - `test_formatFrenchNumber_integer`: 68373433 -> "68 373 433"
  - `test_formatFrenchNumber_decimal`: 62.4658 -> "62,4658"
  - `test_formatFrenchCurrency`: 3.50 -> "3,50 EUR"
  - `test_formatFrenchDate`: "2025-01-15T00:00:00Z" -> "15/01/2025"

- [ ] Write `src/components/features/data-status/DataStatusTable.test.tsx`:
  - Table renders with correct column headers
  - All 6 denominators displayed with French labels
  - Source URLs render as clickable links
  - Fresh denominators show green badge
  - Stale denominators show yellow badge
  - Table is responsive (wrapped in overflow container)

- [ ] Write `src/components/features/data-status/VerifyLink.test.tsx`:
  - Renders "Verifier" text
  - Links to /data-status
  - Displays last-updated date in tooltip
  - Has appropriate aria-label

## Dev Notes

### Architecture & Patterns
- The Data Status Page is a **React Server Component** with ISR (revalidate every hour). Denominator data changes infrequently (quarterly), so aggressive caching is appropriate.
- The page fetches data from the Next.js API proxy (`/api/v1/denominators`), which in turn fetches from the Python FastAPI service. This keeps the FastAPI service internal.
- The `VerifyLink` component is a reusable pattern used across the platform wherever Cost to Nicolas figures are displayed, fulfilling NFR21 ("every Cost to Nicolas calculation displays a 'verify this' link").

### Technical Requirements
- **Next.js 16.1.6**: Server Components with ISR for the data status page
- **Intl.NumberFormat('fr-FR')**: Native French number formatting
- **Intl.DateTimeFormat('fr-FR')**: Native French date formatting
- **shadcn/ui Badge**: For freshness status badges
- **shadcn/ui Tooltip**: For last-updated date display on VerifyLink

### File Structure
```
src/
  app/
    data-status/
      page.tsx                                    # NEW - Data status page route
    api/
      v1/
        denominators/
          route.ts                                # NEW - Proxy to Python FastAPI
  components/
    features/
      data-status/
        DataStatusTable.tsx                       # NEW - Denominator table component
        DataStatusTable.test.tsx                  # NEW - Component tests
        FreshnessBadge.tsx                        # NEW - Fresh/stale badge
        VerifyLink.tsx                            # NEW - "Verifier" link component
        VerifyLink.test.tsx                       # NEW - VerifyLink tests
      consequences/
        ConsequenceCard.tsx                       # MODIFIED - Add VerifyLink integration
  lib/
    utils/
      denominator-labels.ts                      # NEW - French labels mapping
      denominator-freshness.ts                   # NEW - Freshness calculation
      denominator-freshness.test.ts              # NEW - Freshness tests
      format.ts                                  # MODIFIED - Add French formatting utils
      format.test.ts                             # NEW - Format utility tests
```

### Testing Requirements
- **Vitest**: Unit tests for freshness logic, formatting utilities
- **Vitest + Testing Library**: Component tests for DataStatusTable and VerifyLink
- **Coverage target**: >90% for utility functions, >70% for components
- Test French number formatting edge cases (large numbers, zero, decimals)
- Test freshness boundary conditions (exactly 6 months)

### UX/Design Notes
- **Table layout**: On mobile (< 768px), the table should horizontally scroll. Use a wrapper `div` with `overflow-x-auto`.
- **Color coding**: Fresh = green (`text-success` / `bg-success/10`), Stale = amber/yellow (`text-warning` / `bg-warning/10`).
- **Source links**: Open in new tab with `target="_blank"` and `rel="noopener noreferrer"`. Include an external link icon (Lucide `ExternalLink`).
- **Page title**: Use `font-display` (Space Grotesk) for the page heading. Body text in `font-body` (Inter).
- **Dark mode**: Table uses `bg-surface-secondary` for alternating rows, `border-border-default` for borders.
- **Accessibility**:
  - Table has a `<caption>` element describing its purpose
  - Column headers use `scope="col"`
  - Badge text is accessible (not icon-only)
  - External links have `aria-label` including the source name
  - VerifyLink has descriptive `aria-label`

### Dependencies
- **Story 2.2** (Denominator Data Pipeline): Provides the `/api/denominators` endpoint and seeded data
- **Story 2.3** (Cost to Nicolas Engine): Provides the `denominators_used` data structure for VerifyLink integration
- No dependency on Epic 1 (authentication not required -- page is public)

### References
- [Source: epics.md#Epic 2, Story 2.4]
- [Source: prd.md#FR34, FR35, NFR21]
- [Source: architecture.md#Section 3.4 - Frontend Architecture]
- [Source: ux-design-specification.md#Trust through transparency]

## Dev Agent Record

### Agent Model Used
### Completion Notes List
### Change Log
### File List
