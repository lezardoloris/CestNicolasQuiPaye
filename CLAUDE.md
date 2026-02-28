# CLAUDE.md — C'est Nicolas Qui Paye

## Project Overview

French civic platform where citizens submit, vote on, and discuss public spending items. Built with Next.js 16 (App Router), React 19, TypeScript 5.9, Drizzle ORM, PostgreSQL, and Tailwind 4.

## Commands

```bash
npm run dev              # Dev server (Turbopack)
npm run build            # DB push + Next.js build
npm run lint             # ESLint
npm run type-check       # tsc --noEmit
npm run test             # Vitest (unit)
npm run test:e2e         # Playwright (e2e)
npm run format:check     # Prettier check
```

**After every code change, run `npm run type-check && npm run test && npm run build` to verify nothing is broken.**

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, shadcn/ui (New York), Radix UI, Tailwind 4, Lucide icons
- **State**: React Query (server), Zustand (client vote cache)
- **DB**: PostgreSQL 16 + Drizzle ORM
- **Auth**: NextAuth v5 (JWT strategy, Google + Credentials)
- **Validation**: Zod 4
- **Testing**: Vitest + Testing Library (unit), Playwright (e2e)
- **Styling**: Tailwind 4 + custom design tokens in `globals.css`

## Project Structure

```
src/
├── app/                        # Next.js App Router pages & API routes
│   ├── (auth)/                 # Route group: login, register
│   ├── api/                    # API routes (REST)
│   ├── feed/[sort]/            # Feed with dynamic sort param
│   ├── s/[slug]/               # Submission detail
│   └── layout.tsx, page.tsx
├── components/
│   ├── ui/                     # shadcn/ui primitives (don't modify directly)
│   ├── features/               # Feature-scoped components (auth/, feed/, voting/, stats/, etc.)
│   └── layout/                 # Shared layout (DesktopNav, MobileTabBar, Footer, Providers)
├── hooks/                      # Custom React hooks (useVote, useAuth, useInfiniteScroll, etc.)
├── lib/
│   ├── api/                    # API helpers (response.ts, rate-limit.ts, errors.ts)
│   ├── auth/                   # NextAuth config & helpers
│   ├── db/                     # Drizzle schema, client, helpers
│   ├── constants/              # App constants (categories.ts)
│   └── utils/                  # Pure utilities (format.ts, validation.ts, karma.ts, etc.)
├── stores/                     # Zustand stores (vote-store.ts)
├── types/                      # TypeScript interfaces (submission.ts, user.ts, stats.ts)
└── middleware.ts               # Auth/route protection
```

## File & Folder Conventions

### Naming

- **Components**: `PascalCase.tsx` (e.g., `SubmissionCard.tsx`, `CategoryFilter.tsx`)
- **Hooks**: `camelCase.ts` prefixed with `use` (e.g., `useVote.ts`, `useAuth.ts`)
- **Utils/lib**: `kebab-case.ts` (e.g., `rate-limit.ts`, `cost-calculator.ts`)
- **Types**: `kebab-case.ts` in `src/types/` (e.g., `submission.ts`, `cost-engine.ts`)
- **API routes**: `route.ts` inside folder matching the endpoint (e.g., `api/submissions/route.ts`)
- **Pages**: `page.tsx` inside route folders
- **Layouts**: `layout.tsx` inside route folders
- **Route groups**: parentheses prefix `(groupName)/` for logical grouping without URL segment

### Where to put new files

| Type | Location |
|------|----------|
| Page | `src/app/<route>/page.tsx` |
| API route | `src/app/api/<resource>/route.ts` |
| Feature component | `src/components/features/<domain>/ComponentName.tsx` |
| UI primitive | `src/components/ui/` (use `npx shadcn add`) |
| Layout component | `src/components/layout/` |
| React hook | `src/hooks/useHookName.ts` |
| Zustand store | `src/stores/<name>-store.ts` |
| Type definitions | `src/types/<domain>.ts` |
| Zod schemas | `src/lib/utils/validation.ts` |
| API helper | `src/lib/api/<resource>.ts` |
| Pure utility | `src/lib/utils/<name>.ts` |
| DB schema | `src/lib/db/schema.ts` |
| Constants | `src/lib/constants/` |

## Anti-Patterns to Avoid

### Next.js

- **Never use `"use client"` unnecessarily.** Default to Server Components. Only add `"use client"` when the component uses hooks, event handlers, browser APIs, or client-only libraries.
- **Never fetch data in client components when a Server Component can do it.** Pass server-fetched data as props instead.
- **Never use `useEffect` for data fetching.** Use React Query hooks or server-side fetching.
- **Never put business logic in API route handlers.** Extract to `src/lib/api/` or `src/lib/utils/` and call from the route.
- **Never import server-only modules in client components** (e.g., `drizzle`, `auth()`, `db`). These must stay in Server Components or API routes.
- **Never use `router.push()` when `<Link>` works.** Prefer `<Link href="...">` for navigation.
- **Never put metadata in client components.** Use `generateMetadata()` or `export const metadata` in `page.tsx` or `layout.tsx`.
- **Never create API routes for data that Server Components can fetch directly.**
- **Never ignore loading/error states.** Use `loading.tsx`, `error.tsx`, or React Suspense boundaries.

### TypeScript

- **Never use `any`.** Use `unknown` and narrow with type guards, or define proper types in `src/types/`.
- **Never use `as` type assertions** unless absolutely necessary and documented with a comment.
- **Never use `// @ts-ignore` or `// @ts-expect-error`** without a clear explanation.
- **Never leave unused imports or variables.** ESLint will warn; fix them immediately.
- **Always define return types for exported functions and API responses.**
- **Always use `interface` for object shapes and `type` for unions/intersections.**

### React

- **Never mutate state directly.** Always use setter functions or immutable updates.
- **Never use `index` as a key** in lists where items can be reordered, added, or removed.
- **Never define components inside other components.** Extract to separate files or module-level functions.
- **Never use inline function definitions in JSX for complex logic.** Extract to named handlers.

## Code Quality Rules

### File Size

- **Components should not exceed ~200 lines.** Split large components into smaller, focused sub-components in the same feature folder.
- **Hooks should not exceed ~100 lines.** Extract complex logic into helper functions in `src/lib/utils/`.
- **API routes should not exceed ~80 lines.** Extract business logic to `src/lib/api/`.

### DRY (Don't Repeat Yourself)

- **Shared UI patterns** → Extract to `src/components/features/<domain>/` or `src/components/ui/`.
- **Shared data fetching logic** → Extract to a custom hook in `src/hooks/`.
- **Shared validation** → Add to `src/lib/utils/validation.ts` as a Zod schema.
- **Shared formatting** → Add to `src/lib/utils/format.ts`.
- **Shared API response handling** → Use `apiSuccess()` / `apiError()` from `src/lib/api/response.ts`.
- **Shared types** → Define once in `src/types/` and import everywhere.
- **Never duplicate Zod schemas.** Infer TypeScript types with `z.infer<typeof schema>`.
- **If you copy-paste code more than twice, extract it.**

### Imports

- **Always use the `@/` path alias** (maps to `src/`). Never use relative paths like `../../`.
- **Group imports**: externals first, then `@/` imports, then relative imports (if any).

## Existing Patterns to Follow

### API Responses

```typescript
import { apiSuccess, apiError } from '@/lib/api/response';
// Always return: { data, error, meta: { requestId } }
```

### Data Fetching Hooks (React Query)

```typescript
export function useResource() {
  return useQuery({ queryKey: ['resource'], queryFn: fetchResource });
}
```

### Component Props

```typescript
interface ComponentProps {
  data: SubmissionCardData;
  onAction?: () => void;
}
export function Component({ data, onAction }: ComponentProps) { ... }
```

### Styling

- Use `cn()` from `@/lib/utils` to merge Tailwind classes
- Use custom design tokens from `globals.css` (e.g., `text-text-primary`, `bg-surface-primary`)
- Prettier plugin auto-sorts Tailwind classes

### Database Queries

```typescript
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';
```

## Formatting

- Single quotes, semicolons, trailing commas, 100 char print width
- Tailwind classes auto-sorted by Prettier plugin
