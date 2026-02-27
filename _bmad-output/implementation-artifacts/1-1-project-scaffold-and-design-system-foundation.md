# Story 1.1: Project Scaffold & Design System Foundation

Status: ready-for-dev

## Story

As a developer,
I want the Next.js project initialized from `create-next-app` with the full base configuration, design tokens, and layout shell,
so that all subsequent stories can build on a consistent, accessible, and deployment-ready foundation.

## Acceptance Criteria (BDD)

**Given** a new project is needed,
**When** the scaffold is generated,
**Then** the project is created using `create-next-app@latest` with the following flags: `--typescript`, `--tailwind`, `--app`, `--src-dir`, `--eslint`,
**And** the project structure contains `src/app/`, `src/components/`, `src/lib/`, and `src/styles/` directories,
**And** `tailwind.config.ts` extends the default theme with the LIBERAL brand colors:
  - `chainsaw-red: #DC2626`
  - `bg-dark: #0A0A0A`
  - `surface-dark: #141414`
  - `text-primary: #F5F5F5`
  - `text-secondary: #A3A3A3`
**And** `shadcn/ui` is initialized with the "new-york" style and dark theme default,
**And** the root layout (`src/app/layout.tsx`) sets `<html lang="fr" className="dark">` with the Inter font loaded via `next/font`,
**And** a `<MobileTabBar />` shell component is rendered at the bottom of the viewport on screens below `md` breakpoint with three placeholder tabs: Feed, Submit, Profile,
**And** a `<DesktopNav />` shell component is rendered at the top on screens `md` and above,
**And** CSP headers are configured in `next.config.ts` via the `headers()` function with `default-src 'self'`, `script-src 'self' 'unsafe-inline'`, and `style-src 'self' 'unsafe-inline'` (NFR10),
**And** HSTS is configured with `max-age=63072000; includeSubDomains; preload` (NFR6),
**And** a `<SkeletonCard />` placeholder component exists in `src/components/ui/skeleton-card.tsx` for use in loading states,
**And** all interactive elements (buttons, links, tabs) have a visible `ring-2 ring-chainsaw-red` focus indicator on `:focus-visible` (NFR18),
**And** all text elements meet a 4.5:1 contrast ratio against their background color (NFR19),
**And** `npm run build` completes without errors,
**And** `npm run lint` completes without warnings.

## Tasks / Subtasks

### Phase 1: Project Initialization

- [ ] **Task 1.1.1: Run `create-next-app` scaffold** (AC: project scaffold)
  - Run: `npx create-next-app@latest liberal --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - Verify generated directories: `src/app/`, `src/components/`, `src/lib/`
  - Verify files: `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `package.json`
  - Verify `npm run build` succeeds on vanilla scaffold

- [ ] **Task 1.1.2: Create additional directory structure** (AC: project structure)
  - Create `src/styles/` directory
  - Create `src/hooks/` directory
  - Create `src/stores/` directory
  - Create `src/types/` directory
  - Create `src/lib/db/` directory
  - Create `src/lib/auth/` directory
  - Create `src/lib/api/` directory
  - Create `src/lib/utils/` directory
  - Create `src/components/layout/` directory
  - Create `src/components/features/` directory
  - Create `src/components/features/auth/` directory
  - Create `src/components/features/submissions/` directory
  - Create `src/components/features/voting/` directory
  - Create `src/components/features/comments/` directory
  - Create `src/components/features/feed/` directory
  - Create `src/components/features/sharing/` directory
  - Create `src/components/features/admin/` directory
  - Create `public/fonts/` directory
  - Create `e2e/` directory
  - Create `__tests__/` directory

### Phase 2: Core Dependencies Installation

- [ ] **Task 1.1.3: Install shadcn/ui** (AC: shadcn/ui initialized)
  - Run: `npx shadcn@latest init --style new-york --base-color neutral --css-variables`
  - Verify `components.json` is created with `"style": "new-york"`

- [ ] **Task 1.1.4: Install shadcn/ui components** (AC: shadcn/ui initialized)
  - Run: `npx shadcn@latest add button input textarea toast dialog dropdown-menu avatar badge tabs skeleton card separator scroll-area`
  - Verify all component files exist under `src/components/ui/`

- [ ] **Task 1.1.5: Install production dependencies** (AC: project scaffold)
  - Run: `npm install drizzle-orm postgres`
  - Run: `npm install next-auth@5`
  - Run: `npm install zustand @tanstack/react-query`
  - Run: `npm install motion`
  - Run: `npm install zod`
  - Run: `npm install @upstash/redis @upstash/ratelimit`
  - Run: `npm install pino pino-pretty`
  - Run: `npm install date-fns`
  - Run: `npm install bcryptjs`
  - Run: `npm install @auth/drizzle-adapter`
  - Verify all appear in `package.json` dependencies

- [ ] **Task 1.1.6: Install dev dependencies** (AC: project scaffold)
  - Run: `npm install -D drizzle-kit`
  - Run: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom`
  - Run: `npm install -D playwright @playwright/test`
  - Run: `npm install -D prettier prettier-plugin-tailwindcss`
  - Run: `npm install -D @tanstack/react-query-devtools`
  - Run: `npm install -D @types/bcryptjs`
  - Verify all appear in `package.json` devDependencies

### Phase 3: Design System Configuration

- [ ] **Task 1.1.7: Configure `src/app/globals.css` with design tokens** (AC: brand colors, contrast ratios)
  - Replace the generated `globals.css` with the full LIBERAL design token system
  - Define all color tokens under `@theme {}`:
    - `--color-chainsaw-red: #DC2626`
    - `--color-chainsaw-red-hover: #B91C1C`
    - `--color-chainsaw-red-light: #FEE2E2`
    - `--color-surface-primary: #0F0F0F`
    - `--color-surface-secondary: #1A1A1A`
    - `--color-surface-elevated: #262626`
    - `--color-border-default: #333333`
    - `--color-text-primary: #F5F5F5`
    - `--color-text-secondary: #A3A3A3`
    - `--color-text-muted: #737373`
    - `--color-success: #22C55E`
    - `--color-warning: #F59E0B`
    - `--color-info: #3B82F6`
  - Define typography tokens:
    - `--font-display: 'Space Grotesk', system-ui, sans-serif`
    - `--font-body: 'Inter', system-ui, sans-serif`
    - `--font-mono: 'JetBrains Mono', monospace`
  - Define spacing tokens (8px grid): `--spacing-1` through `--spacing-16`
  - Define border radius tokens: `--radius-sm` through `--radius-full`
  - Add global focus-visible styles:
    ```css
    *:focus-visible {
      outline: none;
      ring: 2px;
      ring-color: var(--color-chainsaw-red);
      ring-offset: 2px;
      ring-offset-color: var(--color-surface-primary);
    }
    ```
  - Verify all text/background color combos meet 4.5:1 contrast ratio (NFR19)

- [ ] **Task 1.1.8: Configure fonts with `next/font`** (AC: Inter font loaded)
  - In `src/app/layout.tsx`, import Inter from `next/font/google`
  - Import Space Grotesk from `next/font/google` for the display font
  - Apply Inter as the default body font via className on `<body>`
  - Export Space Grotesk variable for use in components
  - Place `SpaceGrotesk-Variable.woff2` and `Inter-Variable.woff2` in `public/fonts/` if self-hosting is preferred

### Phase 4: Root Layout & Shell Components

- [ ] **Task 1.1.9: Configure root layout `src/app/layout.tsx`** (AC: `<html lang="fr" className="dark">`)
  - Set `<html lang="fr" className="dark">` on the root html element
  - Apply Inter font className to `<body>`
  - Set `<body className="bg-surface-primary text-text-primary antialiased">`
  - Add metadata export:
    ```typescript
    export const metadata: Metadata = {
      title: { default: 'LIBERAL - La tronconneuse citoyenne', template: '%s | LIBERAL' },
      description: 'Plateforme communautaire de responsabilite fiscale. Soumettez, votez, partagez les gaspillages.',
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    };
    ```
  - Render `<DesktopNav />` (hidden below `md`) and `<MobileTabBar />` (hidden at `md` and above) as part of the layout
  - Wrap children in a `<Providers />` component for future QueryClient and Zustand providers

- [ ] **Task 1.1.10: Create `<Providers />` wrapper component** (AC: project scaffold)
  - Create `src/components/layout/Providers.tsx`
  - Mark as `'use client'`
  - Set up `QueryClientProvider` from `@tanstack/react-query`
  - Include `<Toaster />` from shadcn/ui for toast notifications
  - Export as default for use in root layout

- [ ] **Task 1.1.11: Create `<DesktopNav />` component** (AC: DesktopNav rendered on md+)
  - Create `src/components/layout/DesktopNav.tsx`
  - Mark as `'use client'` (will need auth state later)
  - Render a `<header>` with `className="hidden md:flex"` so it is only visible on `md` and above
  - Include: LIBERAL logo/text (left), placeholder navigation links for Feed/Submit/Profile (center), and a placeholder user menu area (right)
  - Use `sticky top-0 z-50 bg-surface-primary/80 backdrop-blur-sm border-b border-border-default`
  - All interactive elements must have `:focus-visible` ring styling (NFR18)

- [ ] **Task 1.1.12: Create `<MobileTabBar />` component** (AC: MobileTabBar with 3 tabs)
  - Create `src/components/layout/MobileTabBar.tsx`
  - Mark as `'use client'`
  - Render a `<nav>` with `className="fixed bottom-0 left-0 right-0 z-50 md:hidden"`
  - Include three tab buttons: Feed (home icon), Submit (chainsaw/plus icon, center), Profile (user icon)
  - Use `bg-surface-primary/80 backdrop-blur-sm border-t border-border-default`
  - Each tab: `min-h-[48px] min-w-[48px]` for touch target accessibility
  - Active tab highlighted with `text-chainsaw-red`, inactive with `text-text-secondary`
  - Placeholder: tabs navigate to `/feed/hot`, `/submit`, `/profile` (pages do not need to exist yet)
  - All tabs must have `:focus-visible` ring styling (NFR18)
  - Include aria-labels on each tab button

- [ ] **Task 1.1.13: Create `<Footer />` component** (AC: project scaffold)
  - Create `src/components/layout/Footer.tsx`
  - Include AGPL-3.0 notice, methodology link placeholder, and "Donnees officielles" disclaimer
  - Hidden on mobile when MobileTabBar is present (add `pb-20 md:pb-0` on main content area)

### Phase 5: Skeleton & Loading Components

- [ ] **Task 1.1.14: Create `<SkeletonCard />` component** (AC: SkeletonCard exists)
  - Create `src/components/ui/skeleton-card.tsx`
  - Render an animated placeholder matching the SubmissionCard layout dimensions:
    - Title area: `h-5 w-3/4 rounded bg-surface-elevated animate-pulse`
    - Meta area: `h-4 w-1/2 rounded bg-surface-elevated animate-pulse`
    - Actions area: two `h-8 w-16 rounded bg-surface-elevated animate-pulse` blocks
  - Wrap in a `<div className="rounded-lg bg-surface-secondary p-4">`
  - Accept a `count` prop (default 5) to render multiple skeleton cards

- [ ] **Task 1.1.15: Create root `loading.tsx`** (AC: project scaffold)
  - Create `src/app/loading.tsx`
  - Import and render `<SkeletonCard count={5} />` as the root loading state

- [ ] **Task 1.1.16: Create root `error.tsx`** (AC: project scaffold)
  - Create `src/app/error.tsx`
  - Mark as `'use client'`
  - Display error message with a "Reessayer" (Retry) button styled with `bg-chainsaw-red`
  - French copy: "Quelque chose s'est casse. La tronconneuse a rencontre un probleme."

- [ ] **Task 1.1.17: Create `not-found.tsx`** (AC: project scaffold)
  - Create `src/app/not-found.tsx`
  - French copy: "Cette page coute 0 EUR. Contrairement a la plupart des projets du gouvernement."
  - Link back to `/feed/hot`

### Phase 6: Configuration Files

- [ ] **Task 1.1.18: Configure `next.config.ts` with security headers** (AC: CSP and HSTS headers)
  - Add `headers()` async function returning:
    - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';`
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - Apply headers to `source: '/(.*)'`

- [ ] **Task 1.1.19: Configure `drizzle.config.ts`** (AC: project scaffold)
  - Create `drizzle.config.ts` at project root:
    ```typescript
    import { defineConfig } from 'drizzle-kit';

    export default defineConfig({
      schema: './src/lib/db/schema.ts',
      out: './drizzle/migrations',
      dialect: 'postgresql',
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    });
    ```

- [ ] **Task 1.1.20: Configure `vitest.config.ts`** (AC: project scaffold)
  - Create `vitest.config.ts` at project root:
    ```typescript
    import { defineConfig } from 'vitest/config';
    import react from '@vitejs/plugin-react';
    import path from 'path';

    export default defineConfig({
      plugins: [react()],
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test-setup.ts'],
        include: ['src/**/*.test.{ts,tsx}', '__tests__/**/*.test.{ts,tsx}'],
        coverage: {
          reporter: ['text', 'json', 'html'],
          exclude: ['node_modules/', 'src/test-setup.ts'],
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    });
    ```
  - Create `src/test-setup.ts` with `import '@testing-library/jest-dom';`

- [ ] **Task 1.1.21: Configure Prettier** (AC: project scaffold)
  - Create `.prettierrc` at project root:
    ```json
    {
      "singleQuote": true,
      "semi": true,
      "printWidth": 100,
      "trailingComma": "all",
      "tabWidth": 2,
      "plugins": ["prettier-plugin-tailwindcss"]
    }
    ```

- [ ] **Task 1.1.22: Create `.env.example`** (AC: project scaffold)
  - Create `.env.example` with all required environment variables:
    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/liberal
    AUTH_SECRET=generate-with-openssl-rand-base64-32
    AUTH_URL=http://localhost:3000
    TWITTER_CLIENT_ID=
    TWITTER_CLIENT_SECRET=
    UPSTASH_REDIS_REST_URL=
    UPSTASH_REDIS_REST_TOKEN=
    COST_ENGINE_URL=http://localhost:8000
    COST_ENGINE_KEY=internal-api-key
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME=LIBERAL
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN=liberal.fr
    SENTRY_DSN=
    SENTRY_AUTH_TOKEN=
    ```

- [ ] **Task 1.1.23: Update `package.json` scripts** (AC: build and lint pass)
  - Add/update scripts:
    ```json
    {
      "dev": "next dev --turbopack",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "type-check": "tsc --noEmit",
      "test": "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage",
      "test:e2e": "playwright test",
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:push": "drizzle-kit push",
      "db:studio": "drizzle-kit studio",
      "format": "prettier --write .",
      "format:check": "prettier --check ."
    }
    ```

### Phase 7: Placeholder Pages & Verification

- [ ] **Task 1.1.24: Create placeholder home page** (AC: project scaffold)
  - Update `src/app/page.tsx` to redirect to `/feed/hot` (or display a temporary landing page)
  - Ensure the page renders without errors

- [ ] **Task 1.1.25: Create placeholder feed page** (AC: project scaffold)
  - Create `src/app/feed/[sort]/page.tsx` with a simple "Feed coming soon" placeholder
  - Create `src/app/feed/[sort]/loading.tsx` using `<SkeletonCard />`

- [ ] **Task 1.1.26: Final build and lint verification** (AC: build and lint pass)
  - Run `npm run build` -- must complete without errors
  - Run `npm run lint` -- must complete without warnings
  - Run `npm run type-check` -- must pass TypeScript strict checks
  - Run `npm run test` -- must pass (even if no tests yet, should exit cleanly)

## Dev Notes

### Architecture & Patterns

- **Rendering strategy:** Default to React Server Components (RSC). Only use `'use client'` when the component needs event handlers, hooks, or browser APIs.
- **Feature-based component organization:** Components are organized by feature domain under `src/components/features/`, not by type. Business logic lives in `src/lib/`, hooks in `src/hooks/`, stores in `src/stores/`.
- **Import alias:** Use `@/*` for all imports (e.g., `@/components/ui/button`, `@/lib/utils`).
- **File naming:** React components use PascalCase (`DesktopNav.tsx`), non-component files use kebab-case (`rate-limit.ts`).
- **Dark mode default:** The platform uses `className="dark"` on `<html>` as the default. Light mode toggle is not in MVP scope.

### Technical Requirements

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24.13.1 LTS | Runtime |
| Next.js | 16.1.6 | Framework (App Router) |
| React | 19.x | UI library |
| TypeScript | 5.7.x | Type safety |
| Tailwind CSS | 4.2.0 | Utility CSS |
| shadcn/ui | 2026-02 (CLI 3.0) | Component library (new-york style) |
| Drizzle ORM | 0.45.1 | ORM (installed, not configured with DB yet) |
| Auth.js (NextAuth v5) | 5.x | Auth (installed, not configured yet) |
| Zustand | 5.0.11 | Client state |
| TanStack Query | 5.90.x | Server state |
| Motion | 12.34.x | Animations |
| Vitest | 4.0.18 | Test runner |
| Zod | 3.x | Validation |

### File Structure

Files created or modified by this story:

```
liberal/
├── .env.example                          # NEW
├── .prettierrc                           # NEW
├── drizzle.config.ts                     # NEW
├── vitest.config.ts                      # NEW
├── next.config.ts                        # MODIFIED (security headers)
├── package.json                          # MODIFIED (scripts, dependencies)
├── src/
│   ├── test-setup.ts                     # NEW
│   ├── app/
│   │   ├── globals.css                   # MODIFIED (design tokens)
│   │   ├── layout.tsx                    # MODIFIED (lang="fr", dark mode, fonts, shell)
│   │   ├── page.tsx                      # MODIFIED (redirect to /feed/hot)
│   │   ├── loading.tsx                   # NEW
│   │   ├── error.tsx                     # NEW
│   │   ├── not-found.tsx                 # NEW
│   │   └── feed/
│   │       └── [sort]/
│   │           ├── page.tsx              # NEW (placeholder)
│   │           └── loading.tsx           # NEW
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DesktopNav.tsx            # NEW
│   │   │   ├── MobileTabBar.tsx          # NEW
│   │   │   ├── Footer.tsx               # NEW
│   │   │   └── Providers.tsx             # NEW
│   │   └── ui/
│   │       ├── skeleton-card.tsx         # NEW
│   │       ├── button.tsx               # FROM shadcn/ui
│   │       ├── input.tsx                # FROM shadcn/ui
│   │       ├── textarea.tsx             # FROM shadcn/ui
│   │       ├── toast.tsx                # FROM shadcn/ui
│   │       ├── dialog.tsx               # FROM shadcn/ui
│   │       ├── dropdown-menu.tsx        # FROM shadcn/ui
│   │       ├── avatar.tsx               # FROM shadcn/ui
│   │       ├── badge.tsx                # FROM shadcn/ui
│   │       ├── tabs.tsx                 # FROM shadcn/ui
│   │       ├── skeleton.tsx             # FROM shadcn/ui
│   │       ├── card.tsx                 # FROM shadcn/ui
│   │       ├── separator.tsx            # FROM shadcn/ui
│   │       └── scroll-area.tsx          # FROM shadcn/ui
│   ├── lib/
│   │   ├── db/                           # NEW (empty, ready for schema)
│   │   ├── auth/                         # NEW (empty, ready for config)
│   │   ├── api/                          # NEW (empty, ready for response/errors)
│   │   └── utils/                        # NEW (empty, ready for utilities)
│   ├── hooks/                            # NEW (empty)
│   ├── stores/                           # NEW (empty)
│   └── types/                            # NEW (empty)
├── e2e/                                  # NEW (empty)
├── __tests__/                            # NEW (empty)
└── public/
    └── fonts/                            # NEW (empty, for self-hosted fonts)
```

### Testing Requirements

- **This story has minimal testing** since it is a scaffold/configuration story.
- Verify `npm run build` exits with code 0.
- Verify `npm run lint` exits with code 0 and no warnings.
- Verify `npm run type-check` exits with code 0.
- Verify `npm run test` runs without fatal error (it may report "no tests found" which is acceptable).
- Manual verification: open `http://localhost:3000` in a browser, confirm dark theme renders, DesktopNav shows on wide viewport, MobileTabBar shows on narrow viewport.
- Use axe-core browser extension or Lighthouse to verify:
  - All text meets 4.5:1 contrast ratio (NFR19)
  - All interactive elements have visible focus indicators (NFR18)

### UX/Design Notes

- **Color palette "Chainsaw Revolution":** Dark backgrounds (#0A0A0A, #0F0F0F, #1A1A1A) with Chainsaw Red (#DC2626) as the primary accent. All text on dark backgrounds uses #F5F5F5 (primary) or #A3A3A3 (secondary).
- **Typography:** Space Grotesk (display/headings/numbers) + Inter (body text). Both loaded via `next/font/google`.
- **Mobile-first:** Design for 375px first, enhance for larger screens. Bottom tab bar on mobile, top nav on desktop.
- **Touch targets:** Minimum 44x44px for all interactive elements, 48x48px for vote buttons.
- **Focus indicators:** `ring-2 ring-chainsaw-red ring-offset-2 ring-offset-surface-primary` on `:focus-visible` for all interactive elements.
- **Spacing:** 8px grid system. Standard card padding is 16px (`p-4`).
- **Dark mode is the only mode for MVP.** The `className="dark"` is hardcoded on `<html>`.

### Dependencies

- **Depends on:** Nothing -- this is the first story in the project.
- **Depended on by:** Every subsequent story (1.2, 1.3, 1.4, 1.5, and all other epics). This story must be completed before any other implementation work.

### References

- [Source: epics.md#Story 1.1] -- Acceptance criteria
- [Source: architecture.md#Section 2.2] -- `create-next-app` command and flags
- [Source: architecture.md#Section 2.4] -- Post-scaffold setup commands
- [Source: architecture.md#Section 3.4] -- Frontend architecture, design tokens, globals.css
- [Source: architecture.md#Section 4.1] -- Naming conventions
- [Source: architecture.md#Section 4.2] -- Code organization patterns
- [Source: architecture.md#Section 5.1] -- Complete directory tree
- [Source: ux-design-specification.md#Visual Design Foundation] -- Color system, typography, spacing
- [Source: ux-design-specification.md#Accessibility Considerations] -- RGAA AA requirements
- [Source: ux-design-specification.md#Navigation Patterns] -- Bottom tab bar, top header
- [Source: prd.md#NFR6] -- HSTS configuration
- [Source: prd.md#NFR10] -- CSP headers
- [Source: prd.md#NFR17-NFR20] -- Accessibility requirements

## Dev Agent Record

### Agent Model Used
(To be filled by dev agent)

### Completion Notes List
(To be filled during implementation)

### Change Log
(To be filled during implementation)

### File List
(To be filled during implementation)
