# Audit 11 -- Dependency Health

**Date**: 2026-03-02
**Branch**: `feat/simulateur`
**Node**: v20.19.4 / npm 9.2.0
**Total direct dependencies**: 27 (production) + 22 (dev) = 49
**Total packages in lock file**: ~587 top-level resolved entries

---

## Executive Summary

The dependency tree is reasonably lean for a Next.js 16 + Drizzle + Auth full-stack app, but has **4 critical/high findings** and several medium/low issues that collectively affect security posture, bundle size, and maintainability. The most impactful problems are: (1) an unused production dependency that drags in a duplicate `@auth/core`, (2) `drizzle-kit` listed as a production dependency, (3) `pino` and `pino-pretty` installed but never imported, and (4) the `radix-ui` meta-package installing 50+ components when only 10 are used.

---

## Findings

### F-01: `@auth/drizzle-adapter` is installed but completely unused
| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Package** | `@auth/drizzle-adapter@^1.11.1` (production) |
| **Installed** | 1.11.1 |

**Description**: The auth configuration at `src/lib/auth/index.ts` explicitly comments out the DrizzleAdapter:

```typescript
// No DrizzleAdapter here -- we manage users ourselves.
// DrizzleAdapter + JWT strategy + Credentials = "Bad request" error.
```

The package is never imported anywhere in the codebase. It is dead weight, and worse, it pulls in its own `@auth/core@0.41.1` while `next-auth` uses `@auth/core@0.41.0`, creating a **duplicate `@auth/core`** in the dependency tree.

**Fix**: Remove the dependency.
```bash
npm uninstall @auth/drizzle-adapter
```

---

### F-02: `drizzle-kit` is listed as a production dependency
| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Package** | `drizzle-kit@^0.31.9` (production) |
| **Installed** | 0.31.9 |

**Description**: `drizzle-kit` is a CLI-only tool used for migrations (`db:generate`, `db:migrate`, `db:push`, `db:studio`). It is never imported in `src/` and should not be bundled in production. However, the `start` script in `package.json` runs `drizzle-kit push --force --verbose && next start`, which may explain why it is in production deps.

**Risk**: Inflates production `node_modules` significantly. `drizzle-kit` bundles its own copy of various database drivers and build tools.

**Fix**: Move to `devDependencies`. If `drizzle-kit push` is needed at container startup, run it as a separate build step or init container, not as part of `next start`. Alternatively, refactor the `start` script:
```json
"prestart": "drizzle-kit push --force --verbose",
"start": "next start"
```
And install drizzle-kit as devDependency, running the prestart in the build/deploy pipeline where devDependencies are available.

---

### F-03: `pino` and `pino-pretty` are installed but never imported
| Field | Value |
|-------|-------|
| **Severity** | **HIGH** |
| **Package** | `pino@^10.3.1`, `pino-pretty@^13.1.3` (production) |
| **Installed** | 10.3.1, 13.1.3 |

**Description**: A full-text search for `pino` and `logger` across the entire `src/` directory returns zero matches. These packages were likely added for a planned structured logging system that was never implemented. Together, `pino` + `pino-pretty` + their transitive deps (`thread-stream`, `sonic-boom`, `pino-std-serializers`, etc.) add substantial weight.

**Fix**: Either remove both packages or implement the logging system they were intended for.
```bash
npm uninstall pino pino-pretty
```
If structured logging is desired, consider the lighter `consola` (~15 KB) or just use Next.js built-in `console` with a minimal wrapper.

---

### F-04: `radix-ui` meta-package installs 50+ components, only 10 are used
| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Package** | `radix-ui@^1.4.3` (production) |
| **Installed** | 1.4.3 |

**Description**: The `radix-ui` meta-package is a convenience umbrella that re-exports every Radix UI primitive. The codebase only uses:

- `Avatar`
- `Dialog`
- `DropdownMenu`
- `ScrollArea`
- `Separator`
- `Slider`
- `Slot` (used in badge and button)
- `Tabs`
- `Tooltip`

But the meta-package installs: accordion, alert-dialog, aspect-ratio, checkbox, collapsible, context-menu, form, hover-card, label, menubar, navigation-menu, one-time-password-field, password-toggle-field, popover, progress, radio-group, roving-focus, select, switch, toast, toggle, toggle-group, toolbar, and many more -- ~60 sub-packages in the lock file.

While tree-shaking should remove unused code from the client bundle, the meta-package still:
- Bloats `node_modules` size and `npm install` time
- Increases lock file churn on updates
- Makes dependency auditing harder

**Fix**: Replace the `radix-ui` meta-package with only the individual packages actually imported:
```bash
npm uninstall radix-ui
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-tooltip
```
Then update imports in `src/components/ui/` from `from "radix-ui"` to `from "@radix-ui/react-<component>"`.

---

### F-05: `next-auth` is pinned to a beta version
| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Package** | `next-auth@^5.0.0-beta.30` (production) |
| **Installed** | 5.0.0-beta.30 |

**Description**: NextAuth v5 has been in beta for an extended period. Beta versions may have breaking changes between releases, lack LTS guarantees, and may contain undiscovered security issues. The `^` semver range on a beta could accidentally upgrade to a breaking beta when running `npm update`.

**Risk**: API instability, potential security gaps in pre-release code, accidental breaking upgrades.

**Fix**: Pin the exact version to prevent surprise upgrades:
```json
"next-auth": "5.0.0-beta.30"
```
Monitor the Auth.js project for a stable v5 release and upgrade promptly when available.

---

### F-06: `@types/bcryptjs` is unnecessary -- bcryptjs v3 ships its own types
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | `@types/bcryptjs@^2.4.6` (devDependency) |
| **Installed** | 2.4.6 |

**Description**: `bcryptjs@3.0.3` includes built-in TypeScript declarations (`"types": "umd/index.d.ts"` in its package.json, with full ESM and CJS type exports). The DefinitelyTyped `@types/bcryptjs@2.4.6` package was written for the older v2.x API and may have stale or conflicting type definitions.

**Fix**: Remove the DefinitelyTyped types.
```bash
npm uninstall @types/bcryptjs
```
Verify TypeScript still resolves types correctly from `bcryptjs` itself.

---

### F-07: `@tanstack/react-query-devtools` is installed but never imported
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | `@tanstack/react-query-devtools@^5.91.3` (devDependency) |
| **Installed** | 5.91.3 |

**Description**: A search for `ReactQueryDevtools` or `react-query-devtools` across the entire `src/` directory returns zero results. The devtools component is never rendered in `Providers.tsx` or anywhere else. It is installed but unused.

**Fix**: Either remove it or add it to the Providers component (conditionally for development):
```bash
npm uninstall @tanstack/react-query-devtools
```
Or integrate it:
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// Inside Providers, after QueryClientProvider:
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

---

### F-08: `playwright` and `@playwright/test` are both listed as devDependencies
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | `playwright@^1.58.2` + `@playwright/test@^1.58.2` (devDependencies) |

**Description**: `@playwright/test` already depends on `playwright` as a direct dependency (`"playwright": "1.58.2"`). Listing `playwright` separately in `devDependencies` is redundant. While npm deduplication prevents duplicate installation, it creates maintenance noise in `package.json`.

**Fix**: Remove the explicit `playwright` entry.
```bash
npm uninstall playwright
```
The `@playwright/test` package will bring in `playwright` automatically.

---

### F-09: `recharts` brings heavy transitive dependencies
| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Package** | `recharts@^3.7.0` (production) |
| **Installed** | 3.7.0 |

**Description**: `recharts` is used in 11 chart components, so it is legitimately needed. However, its dependency chain is worth noting:

- **11 d3 modules** (`d3-array`, `d3-color`, `d3-ease`, `d3-format`, `d3-interpolate`, `d3-path`, `d3-scale`, `d3-shape`, `d3-time`, `d3-time-format`, `d3-timer`)
- **`@reduxjs/toolkit`** (v2.11.2) + **`redux`** (v5.0.1) + **`immer`** (v10.2.0) -- state management libraries you are NOT using directly (you use Zustand)
- **`clsx`** (already a direct dep, so deduplicated, but still)

This makes `recharts` one of the heaviest dependencies in the tree. For 11 chart components, this is acceptable but worth monitoring.

**Recommendation**: No immediate action required. If bundle size becomes a concern, consider:
- Lazy-loading chart pages with `next/dynamic`
- Evaluating lighter alternatives like `@visx/*` (more tree-shakeable D3 wrappers) or `lightweight-charts` for simpler use cases

---

### F-10: `motion` wraps `framer-motion` with extra indirection
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | `motion@^12.34.3` (production) |
| **Installed** | 12.34.3 |

**Description**: The `motion` package is a thin wrapper that depends on `framer-motion@^12.34.3` plus `tslib`. Imports like `from 'motion/react'` resolve to `framer-motion` underneath. This is the official migration path recommended by the framer-motion maintainers (the package was renamed from `framer-motion` to `motion`). This is fine.

**Assessment**: No issue. The `motion` package is the correct modern import path.

---

### F-11: `class-variance-authority` + `clsx` + `tailwind-merge` -- acceptable utility stack
| Field | Value |
|-------|-------|
| **Severity** | **INFO** |
| **Packages** | `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.5.0` |

**Description**: These three packages work together for the `cn()` utility pattern standard in shadcn/ui projects:
- `clsx`: Conditional class string joining (~330 B)
- `tailwind-merge`: Intelligent Tailwind class deduplication (~10 KB)
- `cva`: Component variant management (~3 KB)

All three are lightweight and well-maintained. No action needed.

---

### F-12: No `engines` field in package.json
| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Package** | N/A (project configuration) |

**Description**: There is no `engines` field in `package.json` and no `.nvmrc` or `.node-version` file. The project runs on Node v20.19.4, but this is not documented or enforced. Next.js 16 requires Node >= 18.18.0. Contributors may attempt to run the project with incompatible Node versions.

**Fix**: Add an `engines` field and a `.nvmrc`:
```json
"engines": {
  "node": ">=20.0.0",
  "npm": ">=9.0.0"
}
```
```bash
echo "20" > .nvmrc
```

---

### F-13: No `.npmrc` to enforce lock file usage
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | N/A (project configuration) |

**Description**: Without `engine-strict=true` or `package-lock=true` in `.npmrc`, contributors could accidentally ignore the lock file or use incompatible engines without warnings.

**Fix**: Create `.npmrc`:
```ini
engine-strict=true
package-lock=true
save-exact=false
```

---

### F-14: `dotenv` is correctly in devDependencies
| Field | Value |
|-------|-------|
| **Severity** | **INFO** |
| **Package** | `dotenv@^17.3.1` (devDependency) |

**Description**: `dotenv` is only used in scripts (`scripts/seed.ts`, `scripts/update-sources.ts`, `scripts/migrate-production.ts`) via `import 'dotenv/config'`. It is correctly placed in devDependencies. No issue.

---

### F-15: Duplicate `@auth/core` versions in the tree
| Field | Value |
|-------|-------|
| **Severity** | **MEDIUM** |
| **Package** | `@auth/core@0.41.0` (via next-auth) + `@auth/core@0.41.1` (via @auth/drizzle-adapter) |

**Description**: Two versions of `@auth/core` are resolved in the dependency tree:
- `node_modules/@auth/core@0.41.1` (hoisted, from `@auth/drizzle-adapter`)
- `node_modules/next-auth/node_modules/@auth/core@0.41.0` (nested, from `next-auth`)

While the version difference is minor (patch), having two instances of a core auth library can cause subtle issues with type mismatches or singleton expectations.

**Fix**: This is fully resolved by F-01 (removing `@auth/drizzle-adapter`). Once removed, only the `next-auth`-required `@auth/core@0.41.0` will remain.

---

### F-16: `zod` v4 is a major version jump
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | `zod@^4.3.6` (production) |
| **Installed** | 4.3.6 |

**Description**: Zod 4 was recently released as a major version with breaking changes from v3 (different error formatting, changed `.transform()` behavior, etc.). The codebase appears to use it correctly with 8 import sites. The `^4.3.6` range is acceptable as Zod follows semver within major versions.

**Assessment**: No issue if all tests pass. Just flagging that this is a recent major version upgrade.

---

### F-17: `@types/node@^20` should be updated for Node v22+ compatibility
| Field | Value |
|-------|-------|
| **Severity** | **LOW** |
| **Package** | `@types/node@^20` (devDependency) |

**Description**: The `@types/node@^20` range will only provide types for Node 20.x APIs. If the project ever upgrades to Node 22 (which includes new APIs like `navigator`, `URL.parse()` improvements, etc.), these types will be stale. The current Node version (v20.19.4) matches, so this is not an immediate concern.

**Fix**: When upgrading Node, align the types:
```json
"@types/node": "^20"  // matches current v20.19.4
```

---

### F-18: `shadcn` CLI is correctly in devDependencies
| Field | Value |
|-------|-------|
| **Severity** | **INFO** |
| **Package** | `shadcn@^3.8.5` (devDependency) |

**Description**: The `shadcn` CLI is used to scaffold UI components (`npx shadcn add ...`). It is never imported at runtime and is correctly placed in devDependencies. The CSS import `@import "shadcn/tailwind.css"` in `globals.css` resolves at build time via the Tailwind/PostCSS pipeline.

---

### F-19: Lock file integrity
| Field | Value |
|-------|-------|
| **Severity** | **INFO** |
| **Package** | `package-lock.json` |

**Description**: The lock file uses `lockfileVersion: 3` (npm v7+ format), which is correct for npm 9.2.0. The lock file exists and appears structurally sound (properly resolved packages with integrity hashes). Without running `npm ci` to verify, a full integrity check cannot be performed, but the structure looks correct.

---

### F-20: `react-tweet` is used via dynamic import -- correctly listed
| Field | Value |
|-------|-------|
| **Severity** | **INFO** |
| **Package** | `react-tweet@^3.3.0` (production) |

**Description**: While `react-tweet` does not appear in static `import` statements, it is correctly used via `lazy()` dynamic import in `TweetEmbed.tsx`:
```typescript
const TweetComponent = lazy(() =>
  import('react-tweet').then((mod) => ({ default: mod.Tweet }))
);
```
This is a correct and optimal pattern for code-splitting. The package must remain in production dependencies.

---

## Summary Table

| ID | Severity | Package | Issue | Action |
|----|----------|---------|-------|--------|
| F-01 | **HIGH** | `@auth/drizzle-adapter` | Installed but never used; creates duplicate `@auth/core` | Remove |
| F-02 | **HIGH** | `drizzle-kit` | CLI tool in production deps | Move to devDependencies; refactor `start` script |
| F-03 | **HIGH** | `pino`, `pino-pretty` | Installed but never imported anywhere | Remove or implement logging |
| F-04 | **MEDIUM** | `radix-ui` | Meta-package installs 50+ components; only 10 used | Replace with individual `@radix-ui/*` packages |
| F-05 | **MEDIUM** | `next-auth` | Pinned to beta; `^` range risks breaking upgrades | Pin exact version; monitor for stable release |
| F-09 | **MEDIUM** | `recharts` | Heavy transitive deps (d3, redux, immer) | Monitor; lazy-load chart pages |
| F-12 | **MEDIUM** | (project) | No `engines` field or `.nvmrc` | Add engine constraints |
| F-15 | **MEDIUM** | `@auth/core` | Duplicate versions (0.41.0 + 0.41.1) | Resolved by F-01 |
| F-06 | **LOW** | `@types/bcryptjs` | Unnecessary; bcryptjs v3 ships own types | Remove |
| F-07 | **LOW** | `@tanstack/react-query-devtools` | Installed but never imported | Remove or integrate |
| F-08 | **LOW** | `playwright` | Redundant with `@playwright/test` | Remove explicit entry |
| F-13 | **LOW** | (project) | No `.npmrc` for strictness | Create `.npmrc` |
| F-16 | **LOW** | `zod` | v4 major version (recent) | Monitor; ensure tests pass |
| F-17 | **LOW** | `@types/node` | v20 range matches current Node | Update when upgrading Node |

---

## Estimated Impact of Fixes

| Action | Packages removed | Est. node_modules reduction |
|--------|------------------|-----------------------------|
| Remove `@auth/drizzle-adapter` | ~3 (+ duplicate @auth/core) | ~2 MB |
| Move `drizzle-kit` to devDeps | 0 (still installed, just not in prod) | ~15 MB in prod image |
| Remove `pino` + `pino-pretty` | ~8 (thread-stream, sonic-boom, etc.) | ~5 MB |
| Replace `radix-ui` with individual pkgs | ~40 unused Radix components | ~8 MB |
| Remove `@types/bcryptjs` | 1 | ~50 KB |
| Remove `playwright` (redundant) | 0 (deduplicated) | Negligible |
| Remove `@tanstack/react-query-devtools` | 1 | ~500 KB |
| **Total** | **~53** | **~30 MB** |

---

## License Audit

All production dependencies use permissive licenses:

| License | Packages |
|---------|----------|
| MIT | next, react, react-dom, motion, recharts, zustand, sonner, lucide-react, clsx, tailwind-merge, class-variance-authority, date-fns, next-themes, radix-ui, zod, postgres |
| Apache-2.0 | drizzle-orm |
| ISC | next-auth, @auth/drizzle-adapter, @auth/core |
| BSD-3-Clause | bcryptjs |

No copyleft (GPL, AGPL) or problematic licenses detected. All are compatible with commercial/proprietary use.

---

## Security Notes

Due to tool access restrictions, `npm audit` could not be run directly. However, based on manual analysis:

1. **next-auth beta**: Pre-release software may have undiscovered vulnerabilities. The Auth.js project has a responsible disclosure process but beta versions receive less scrutiny than stable releases.

2. **bcryptjs**: v3.0.3 is the latest release. No known CVEs. Pure-JS bcrypt is slower than native `bcrypt` but avoids native compilation issues.

3. **@upstash/redis** and **@upstash/ratelimit**: Used for rate limiting with graceful fallback when not configured. No known vulnerabilities.

4. **postgres** (PostgreSQL client): v3.4.8 is maintained. No known CVEs.

**Recommendation**: Run `npm audit` as part of CI and address any advisories:
```bash
npm audit --audit-level=moderate
```

---

## Recommended Priority

1. **Immediate** (F-01, F-02, F-03): Remove unused packages and fix `drizzle-kit` placement
2. **Short-term** (F-04, F-05, F-12): Replace radix-ui meta-package, pin next-auth, add engine constraints
3. **Maintenance** (F-06, F-07, F-08, F-13): Clean up minor redundancies
