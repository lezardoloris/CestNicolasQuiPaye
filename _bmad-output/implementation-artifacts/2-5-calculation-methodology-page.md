# Story 2.5: Calculation Methodology Page

Status: ready-for-dev

## Story

As a visitor (Nicolas),
I want to read a clear explanation of every formula and data source used in Cost to Nicolas calculations,
so that I can understand and trust the methodology.

## Acceptance Criteria (BDD)

**Given** a visitor navigates to `/methodologie`,
**When** the page renders,
**Then** the page displays the following sections in order:
  1. "Cout par citoyen" with the formula: `montant / population_france`, the current population value, and a link to the INSEE source
  2. "Cout par contribuable" with the formula: `montant / nombre_contribuables`, the current taxpayer count, and a link to the DGFIP/INSEE source
  3. "Cout par menage" with the formula: `montant / nombre_menages`, the current household count, and a link to the INSEE source
  4. "Jours de travail equivalents" with the formula: `cout_par_contribuable / revenu_net_median_journalier`, the current daily median income, and a link to the INSEE source
  5. "Equivalences concretes" with the formula for each equivalence (e.g., `cout_par_citoyen / cout_repas_cantine`), the current unit cost, and a link to the source
**And** each section displays the current denominator value, the source institution name, and a clickable link to the official source URL (FR17),
**And** the page includes a "Derniere mise a jour des donnees" section showing when each denominator was last refreshed.

**Given** the methodology page is rendered,
**When** a screen reader traverses the page,
**Then** all mathematical formulas are wrapped in `<code>` elements with `aria-label` attributes describing the formula in plain French (NFR17).

## Tasks / Subtasks

### Task 1: Methodology Page Data Fetching (AC1)
- [ ] Create a server-side data fetching function in `src/lib/api/denominators.ts`:
  ```typescript
  export interface DenominatorData {
    key: string;
    value: number;
    source_name: string;
    source_url: string;
    last_updated: string;
    update_frequency: string;
  }

  export async function getDenominators(): Promise<DenominatorData[]> {
    const COST_ENGINE_URL = process.env.COST_ENGINE_URL!;
    const response = await fetch(`${COST_ENGINE_URL}/api/denominators`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch denominators');
    }

    return response.json();
  }
  ```

### Task 2: FormulaSection Component (AC1, AC2)
- [ ] Create `src/components/features/methodology/FormulaSection.tsx`:
  ```
  Props:
    - title: string (French section title)
    - formula: string (mathematical formula text)
    - formulaAriaLabel: string (plain French description for screen readers)
    - denominatorKey: string
    - denominatorValue: number
    - denominatorUnit: string
    - sourceName: string
    - sourceUrl: string
    - lastUpdated: string
    - description: string (optional explanation paragraph)

  Renders:
    - <h2> with section title
    - <p> with descriptive explanation
    - <div> styled formula block:
      - <code aria-label="{formulaAriaLabel}"> with the formula text
      - Current denominator value formatted with French number formatting
      - Source name as text + clickable link to source_url (opens in new tab)
    - Last updated date in DD/MM/YYYY format
    - "Verifier" link to /data-status for transparency
  ```

### Task 3: FormulaDisplay Component (AC2)
- [ ] Create `src/components/features/methodology/FormulaDisplay.tsx`:
  ```typescript
  // Renders a formula in a visually distinct styled block
  // Uses <code> element with aria-label for accessibility (AC2)
  // Visual: monospace font, surface-elevated background, rounded border
  // Example: montant / population_france
  // The aria-label provides: "montant divise par la population francaise"
  ```

### Task 4: LastUpdatedSection Component (AC1)
- [ ] Create `src/components/features/methodology/LastUpdatedSection.tsx`:
  ```
  - Renders "Derniere mise a jour des donnees" section
  - Lists all denominators with their last_updated date in DD/MM/YYYY format
  - Each entry shows: French label, date, and freshness badge (reuse from Story 2.4)
  - Links to /data-status for full transparency
  ```

### Task 5: Methodology Page Route (AC1, AC2)
- [ ] Create `src/app/methodologie/page.tsx` as a Server Component with ISR:
  ```typescript
  import { getDenominators } from '@/lib/api/denominators';
  import { FormulaSection } from '@/components/features/methodology/FormulaSection';
  import { LastUpdatedSection } from '@/components/features/methodology/LastUpdatedSection';
  import { formatFrenchNumber, formatFrenchCurrency } from '@/lib/utils/format';
  import { DENOMINATOR_LABELS } from '@/lib/utils/denominator-labels';
  import { Metadata } from 'next';

  export const metadata: Metadata = {
    title: 'Methodologie de calcul - LIBERAL',
    description: 'Explication detaillee de chaque formule et source de donnees utilisee dans les calculs Cout pour Nicolas.',
  };

  export const revalidate = 3600; // ISR: 1 hour

  export default async function MethodologiePage() {
    const denominators = await getDenominators();

    // Build lookup map
    const denomMap = Object.fromEntries(denominators.map(d => [d.key, d]));

    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Methodologie de calcul
        </h1>
        <p className="text-text-secondary mb-8">
          Chaque chiffre affiche sur LIBERAL est calculable, verifiable et contestable.
          Voici les formules exactes et les sources officielles utilisees.
        </p>

        {/* Section 1: Cout par citoyen */}
        <FormulaSection
          title="Cout par citoyen"
          formula="montant / population_france"
          formulaAriaLabel="montant divise par la population francaise"
          denominatorKey="france_population"
          denominatorValue={denomMap.france_population?.value}
          denominatorUnit="habitants"
          sourceName={denomMap.france_population?.source_name}
          sourceUrl={denomMap.france_population?.source_url}
          lastUpdated={denomMap.france_population?.last_updated}
          description="Le cout total est divise par le nombre d'habitants en France pour obtenir le cout par citoyen."
        />

        {/* Section 2: Cout par contribuable */}
        <FormulaSection
          title="Cout par contribuable"
          formula="montant / nombre_contribuables"
          formulaAriaLabel="montant divise par le nombre de contribuables a l'impot sur le revenu"
          denominatorKey="income_tax_payers"
          denominatorValue={denomMap.income_tax_payers?.value}
          denominatorUnit="foyers fiscaux"
          sourceName={denomMap.income_tax_payers?.source_name}
          sourceUrl={denomMap.income_tax_payers?.source_url}
          lastUpdated={denomMap.income_tax_payers?.last_updated}
          description="Le cout total est divise par le nombre de foyers fiscaux imposables a l'impot sur le revenu."
        />

        {/* Section 3: Cout par menage */}
        <FormulaSection
          title="Cout par menage"
          formula="montant / nombre_menages"
          formulaAriaLabel="montant divise par le nombre de menages francais"
          denominatorKey="france_households"
          denominatorValue={denomMap.france_households?.value}
          denominatorUnit="menages"
          sourceName={denomMap.france_households?.source_name}
          sourceUrl={denomMap.france_households?.source_url}
          lastUpdated={denomMap.france_households?.last_updated}
          description="Le cout total est divise par le nombre de menages en France."
        />

        {/* Section 4: Jours de travail equivalents */}
        <FormulaSection
          title="Jours de travail equivalents"
          formula="cout_par_contribuable / revenu_net_median_journalier"
          formulaAriaLabel="cout par contribuable divise par le revenu net median journalier"
          denominatorKey="daily_median_net_income"
          denominatorValue={denomMap.daily_median_net_income?.value}
          denominatorUnit="EUR/jour"
          sourceName={denomMap.daily_median_net_income?.source_name}
          sourceUrl={denomMap.daily_median_net_income?.source_url}
          lastUpdated={denomMap.daily_median_net_income?.last_updated}
          description="Le cout par contribuable est divise par le revenu net median journalier pour exprimer le cout en nombre de jours de travail."
        />

        {/* Section 5: Equivalences concretes */}
        <h2 className="font-display text-2xl font-bold text-text-primary mt-12 mb-4">
          Equivalences concretes
        </h2>
        <p className="text-text-secondary mb-6">
          Pour rendre les montants tangibles, nous les convertissons en objets du quotidien.
        </p>

        <FormulaSection
          title="Repas de cantine scolaire"
          formula="cout_par_citoyen / cout_repas_cantine"
          formulaAriaLabel="cout par citoyen divise par le cout moyen d'un repas de cantine scolaire"
          denominatorKey="school_lunch_cost"
          denominatorValue={denomMap.school_lunch_cost?.value}
          denominatorUnit="EUR/repas"
          sourceName={denomMap.school_lunch_cost?.source_name}
          sourceUrl={denomMap.school_lunch_cost?.source_url}
          lastUpdated={denomMap.school_lunch_cost?.last_updated}
          description="Le cout par citoyen exprime en nombre de repas de cantine scolaire au tarif moyen national."
        />

        <FormulaSection
          title="Journees d'hospitalisation"
          formula="cout_par_citoyen / cout_journee_hospitalisation"
          formulaAriaLabel="cout par citoyen divise par le cout moyen d'une journee d'hospitalisation"
          denominatorKey="hospital_bed_day_cost"
          denominatorValue={denomMap.hospital_bed_day_cost?.value}
          denominatorUnit="EUR/jour"
          sourceName={denomMap.hospital_bed_day_cost?.source_name}
          sourceUrl={denomMap.hospital_bed_day_cost?.source_url}
          lastUpdated={denomMap.hospital_bed_day_cost?.last_updated}
          description="Le cout par citoyen exprime en nombre de journees d'hospitalisation au cout moyen national."
        />

        {/* Section: Derniere mise a jour */}
        <LastUpdatedSection denominators={denominators} />

        {/* Navigation */}
        <div className="mt-12 flex gap-4">
          <a href="/data-status" className="text-chainsaw-red hover:underline">
            Statut des donnees
          </a>
          <a href="/feed/hot" className="text-text-secondary hover:underline">
            Retour au fil
          </a>
        </div>
      </main>
    );
  }
  ```

### Task 6: Accessibility Audit (AC2)
- [ ] Ensure all `<code>` elements in formula displays have `aria-label` attributes with plain French descriptions:
  | Formula | aria-label |
  |---------|-----------|
  | `montant / population_france` | "montant divise par la population francaise" |
  | `montant / nombre_contribuables` | "montant divise par le nombre de contribuables a l'impot sur le revenu" |
  | `montant / nombre_menages` | "montant divise par le nombre de menages francais" |
  | `cout_par_contribuable / revenu_net_median_journalier` | "cout par contribuable divise par le revenu net median journalier" |
  | `cout_par_citoyen / cout_repas_cantine` | "cout par citoyen divise par le cout moyen d'un repas de cantine scolaire" |
  | `cout_par_citoyen / cout_journee_hospitalisation` | "cout par citoyen divise par le cout moyen d'une journee d'hospitalisation" |

- [ ] Verify heading hierarchy: `<h1>` for page title, `<h2>` for each formula section
- [ ] Ensure all external links have `aria-label` including destination name
- [ ] Test with screen reader simulation (VoiceOver or NVDA)

### Task 7: Tests
- [ ] Write `src/components/features/methodology/FormulaSection.test.tsx`:
  - Renders section title as `<h2>`
  - Renders formula in `<code>` element
  - `<code>` element has `aria-label` attribute
  - Displays denominator value with French formatting
  - Renders source link with correct href
  - Displays last updated date in DD/MM/YYYY format
  - Includes "Verifier" link to /data-status

- [ ] Write `src/components/features/methodology/FormulaDisplay.test.tsx`:
  - Renders formula text inside `<code>` element
  - Has correct `aria-label` for screen readers
  - Uses monospace font styling

- [ ] Write `src/app/methodologie/page.test.tsx` (integration):
  - Page renders with title "Methodologie de calcul"
  - All 6 formula sections present in correct order
  - Current denominator values displayed
  - Source links are clickable
  - "Derniere mise a jour des donnees" section present
  - Page metadata is correct

## Dev Notes

### Architecture & Patterns
- The Methodology Page is a **React Server Component** with ISR, fetching denominator data at build/revalidation time. It does not require client-side interactivity.
- The page reuses the denominator data from the Python FastAPI service (same endpoint as Story 2.4's Data Status Page).
- The `FormulaSection` component is designed to be reusable for future formula additions (Phase 2 equivalences).

### Technical Requirements
- **Next.js 16.1.6**: Server Component with ISR (revalidate: 3600)
- **Tailwind CSS 4.2.0**: Utility classes for formula block styling
- **Intl.NumberFormat('fr-FR')**: French number formatting for denominator values
- **Semantic HTML**: `<code>` for formulas, `<h2>` for sections, `<a>` for source links
- **RGAA AA**: All formulas accessible to screen readers via `aria-label` (NFR17)

### File Structure
```
src/
  app/
    methodologie/
      page.tsx                                  # NEW - Methodology page route
      page.test.tsx                             # NEW - Page integration test
  components/
    features/
      methodology/
        FormulaSection.tsx                      # NEW - Formula section component
        FormulaSection.test.tsx                 # NEW - Component tests
        FormulaDisplay.tsx                      # NEW - Formula visual display
        FormulaDisplay.test.tsx                 # NEW - Component tests
        LastUpdatedSection.tsx                  # NEW - Data freshness summary
  lib/
    api/
      denominators.ts                           # NEW - Server-side data fetching
```

### Testing Requirements
- **Vitest + Testing Library**: Component tests for FormulaSection and FormulaDisplay
- **Vitest**: Page integration test (mock fetch for denominators)
- **Accessibility testing**: Verify `aria-label` on all `<code>` elements
- **Coverage target**: >80% for methodology components

### UX/Design Notes
- **Visual hierarchy**: Page title in `font-display` 3xl bold. Section titles in `font-display` 2xl bold. Body text in `font-body` base.
- **Formula blocks**: Styled with `bg-surface-elevated` background, `border-border-default` border, `font-mono` text, rounded corners. Visually distinct from body text.
- **Denominator values**: Displayed inline with the formula explanation. Large enough to be scannable. Formatted with French locale.
- **Source links**: Chainsaw-red text with external link icon. Opens in new tab.
- **Mobile layout**: Single column, full width. Formula blocks take full width with horizontal padding. No horizontal scroll needed.
- **Dark mode**: Formula blocks use `bg-surface-elevated` (darker card background). Text is `text-text-primary` on dark.
- **Tone**: Factual, transparent, and unapologetic. The methodology page is LIBERAL's credibility backbone. Every sentence should reinforce: "These are official numbers. Verify them yourself."

### Dependencies
- **Story 2.2** (Denominator Data Pipeline): Provides the `/api/denominators` endpoint with current values
- **Story 2.4** (Data Status Page): Provides shared utilities (denominator-labels, format, freshness), FreshnessBadge component, and VerifyLink component
- No dependency on Epic 1 (authentication not required -- page is public)

### References
- [Source: epics.md#Epic 2, Story 2.5]
- [Source: prd.md#FR17, NFR17]
- [Source: architecture.md#Section 3.4 - Frontend Architecture]
- [Source: ux-design-specification.md#Trust through transparency]

## Dev Agent Record

### Agent Model Used
### Completion Notes List
### Change Log
### File List
