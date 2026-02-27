# Story 1.2: Email/Password Registration & Login with Auth.js v5

Status: ready-for-dev

## Story

As a visitor (Nicolas),
I want to register with my email and password and then log in,
so that I can participate in voting and submitting waste items.

## Acceptance Criteria (BDD)

**Given** Auth.js v5 is installed and configured with a Credentials provider,
**When** a visitor navigates to `/auth/register`,
**Then** a registration form is displayed with fields: `email` (type email, required), `password` (type password, required, min 8 chars), and `confirmPassword` (type password, required),
**And** every form field has an associated `<label>` element with a visible label text (NFR20),
**And** a CAPTCHA challenge (hCaptcha or Turnstile) is displayed and must be solved before submission (NFR11),
**And** validation errors are displayed inline below the relevant field with `role="alert"` and descriptive text (NFR20).

**Given** a visitor fills in the registration form with valid data,
**When** they submit the form,
**Then** a Drizzle migration creates the `users` table (if not exists) with columns: `id` (UUID, PK), `email` (varchar 255, unique, not null), `password_hash` (varchar 255, not null), `display_name` (varchar 100, nullable), `anonymous_id` (varchar 20, not null, unique, generated as "Nicolas #" + zero-padded sequential number), `role` (enum: 'user' | 'admin', default 'user'), `created_at` (timestamp), `updated_at` (timestamp),
**And** the password is hashed using bcrypt with a cost factor of 12 (NFR7),
**And** a new user row is inserted into the `users` table,
**And** the user is automatically logged in and redirected to `/feed`,
**And** a secure, httpOnly session cookie is set.

**Given** a registered user navigates to `/auth/login`,
**When** the login page renders,
**Then** a login form is displayed with fields: `email` and `password`, each with associated `<label>` elements (NFR20),
**And** a "Forgot password?" link is visible (can be a placeholder for MVP).

**Given** a registered user submits valid credentials on the login form,
**When** the server validates the credentials,
**Then** the user is logged in and redirected to `/feed`,
**And** the session is established via Auth.js v5 with a JWT strategy.

**Given** a visitor or logged-in user attempts to access the registration or login endpoints,
**When** they exceed 10 POST requests per minute from the same IP,
**Then** a `429 Too Many Requests` response is returned (NFR8).

## Tasks / Subtasks

### Phase 1: Database Schema & Migration

- [ ] **Task 1.2.1: Define the `users` table schema in Drizzle ORM** (AC: users table with all columns)
  - Create/update `src/lib/db/schema.ts`
  - Define the `userRole` pgEnum:
    ```typescript
    export const userRole = pgEnum('user_role', ['user', 'moderator', 'admin']);
    ```
  - Define the `users` table:
    ```typescript
    export const users = pgTable('users', {
      id: uuid('id').primaryKey().defaultRandom(),
      email: varchar('email', { length: 255 }).notNull().unique(),
      passwordHash: text('password_hash').notNull(),
      displayName: varchar('display_name', { length: 100 }),
      anonymousId: varchar('anonymous_id', { length: 20 }).notNull().unique(),
      role: userRole('role').notNull().default('user'),
      twitterId: varchar('twitter_id', { length: 255 }).unique(),
      twitterHandle: varchar('twitter_handle', { length: 50 }),
      avatarUrl: text('avatar_url'),
      bio: text('bio'),
      submissionCount: integer('submission_count').notNull().default(0),
      karmaScore: integer('karma_score').notNull().default(0),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
      deletedAt: timestamp('deleted_at'),
    });
    ```
  - Note: `anonymousId` is generated server-side as "Nicolas #XXXX" using a sequence or max+1 query at registration time.

- [ ] **Task 1.2.2: Create the Drizzle database client** (AC: database connection)
  - Create `src/lib/db/index.ts`:
    ```typescript
    import { drizzle } from 'drizzle-orm/postgres-js';
    import postgres from 'postgres';
    import * as schema from './schema';

    const connectionString = process.env.DATABASE_URL!;
    const client = postgres(connectionString);
    export const db = drizzle(client, { schema });
    ```

- [ ] **Task 1.2.3: Generate and run the initial migration** (AC: users table created)
  - Run: `npx drizzle-kit generate` to create the SQL migration file
  - Run: `npx drizzle-kit push` (or `npx drizzle-kit migrate`) to apply to local database
  - Verify the `users` table exists in PostgreSQL with all specified columns
  - Verify the `user_role` enum type is created

- [ ] **Task 1.2.4: Create a sequence or helper for `anonymous_id` generation** (AC: anonymous_id as "Nicolas #XXXX")
  - Create a helper function in `src/lib/db/helpers.ts`:
    ```typescript
    export async function generateAnonymousId(db: DrizzleDB): Promise<string> {
      // Query the max anonymous_id number and increment
      // Format as "Nicolas #" + zero-padded 4-digit number (e.g., "Nicolas #0001")
      // Handle concurrent inserts with retry logic or database sequence
    }
    ```
  - Alternatively, create a PostgreSQL sequence `anonymous_id_seq` and use it in the generation function
  - Ensure uniqueness is enforced at the database level via the UNIQUE constraint on `anonymous_id`

### Phase 2: Auth.js v5 Configuration

- [ ] **Task 1.2.5: Configure Auth.js v5 with Credentials provider** (AC: Auth.js configured with JWT)
  - Create `src/lib/auth/config.ts`:
    ```typescript
    import NextAuth from 'next-auth';
    import Credentials from 'next-auth/providers/credentials';
    import { DrizzleAdapter } from '@auth/drizzle-adapter';
    import { db } from '@/lib/db';
    import { users } from '@/lib/db/schema';
    import { eq } from 'drizzle-orm';
    import bcrypt from 'bcryptjs';
    import { z } from 'zod';

    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    export const { handlers, signIn, signOut, auth } = NextAuth({
      adapter: DrizzleAdapter(db),
      session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
      providers: [
        Credentials({
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Mot de passe', type: 'password' },
          },
          async authorize(credentials) {
            const parsed = loginSchema.safeParse(credentials);
            if (!parsed.success) return null;

            const user = await db.query.users.findFirst({
              where: eq(users.email, parsed.data.email),
            });
            if (!user) return null;

            const passwordMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
            if (!passwordMatch) return null;

            return {
              id: user.id,
              email: user.email,
              name: user.displayName ?? user.anonymousId,
              role: user.role,
              anonymousId: user.anonymousId,
            };
          },
        }),
      ],
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.role = user.role;
            token.anonymousId = user.anonymousId;
          }
          return token;
        },
        async session({ session, token }) {
          session.user.id = token.sub!;
          session.user.role = token.role as string;
          session.user.anonymousId = token.anonymousId as string;
          return session;
        },
      },
      pages: {
        signIn: '/auth/login',
        newUser: '/auth/register',
      },
    });
    ```

- [ ] **Task 1.2.6: Create the Auth.js route handler** (AC: Auth.js route handler)
  - Create `src/app/api/auth/[...nextauth]/route.ts`:
    ```typescript
    import { handlers } from '@/lib/auth/config';
    export const { GET, POST } = handlers;
    ```

- [ ] **Task 1.2.7: Extend Auth.js TypeScript types** (AC: type safety)
  - Create `src/types/next-auth.d.ts`:
    ```typescript
    import 'next-auth';
    import 'next-auth/jwt';

    declare module 'next-auth' {
      interface User {
        role?: string;
        anonymousId?: string;
      }
      interface Session {
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
          anonymousId: string;
        };
      }
    }

    declare module 'next-auth/jwt' {
      interface JWT {
        role?: string;
        anonymousId?: string;
      }
    }
    ```

- [ ] **Task 1.2.8: Create auth helper functions** (AC: session management)
  - Create `src/lib/auth/helpers.ts`:
    ```typescript
    import { auth } from '@/lib/auth/config';

    export async function getUser() {
      const session = await auth();
      return session?.user ?? null;
    }

    export async function requireAuth() {
      const session = await auth();
      if (!session?.user) {
        throw new Error('UNAUTHORIZED');
      }
      return session.user;
    }

    export async function requireAdmin() {
      const user = await requireAuth();
      if (user.role !== 'admin') {
        throw new Error('FORBIDDEN');
      }
      return user;
    }
    ```

- [ ] **Task 1.2.9: Configure middleware for auth route protection** (AC: session management)
  - Create/update `src/middleware.ts`:
    ```typescript
    import { auth } from '@/lib/auth/config';
    import { NextResponse } from 'next/server';

    export default auth((req) => {
      const { pathname } = req.nextUrl;
      const role = req.auth?.user?.role;

      // Admin routes
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/feed/hot', req.url));
      }

      // Protected routes (logged-in users only)
      if (pathname.startsWith('/submit') && !req.auth?.user) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      if (pathname.startsWith('/profile') && !pathname.includes('/profile/') && !req.auth?.user) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      return NextResponse.next();
    });

    export const config = {
      matcher: ['/admin/:path*', '/submit', '/profile', '/profile/settings'],
    };
    ```

### Phase 3: Validation Schemas

- [ ] **Task 1.2.10: Create Zod validation schemas for auth** (AC: validation errors inline)
  - Create `src/lib/validators/auth.ts`:
    ```typescript
    import { z } from 'zod';

    export const registerSchema = z.object({
      email: z
        .string()
        .min(1, 'L\'adresse email est requise')
        .email('Veuillez entrer une adresse email valide'),
      password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
        .max(128, 'Le mot de passe ne peut pas depasser 128 caracteres'),
      confirmPassword: z
        .string()
        .min(1, 'Veuillez confirmer votre mot de passe'),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    });

    export const loginSchema = z.object({
      email: z
        .string()
        .min(1, 'L\'adresse email est requise')
        .email('Veuillez entrer une adresse email valide'),
      password: z
        .string()
        .min(1, 'Le mot de passe est requis'),
    });

    export type RegisterInput = z.infer<typeof registerSchema>;
    export type LoginInput = z.infer<typeof loginSchema>;
    ```

### Phase 4: Server Actions

- [ ] **Task 1.2.11: Create the registration server action** (AC: user creation, bcrypt hashing, auto-login)
  - Create `src/app/(auth)/register/actions.ts`:
    ```typescript
    'use server';

    import { db } from '@/lib/db';
    import { users } from '@/lib/db/schema';
    import { registerSchema } from '@/lib/validators/auth';
    import { signIn } from '@/lib/auth/config';
    import { generateAnonymousId } from '@/lib/db/helpers';
    import bcrypt from 'bcryptjs';
    import { eq } from 'drizzle-orm';

    export async function registerAction(formData: FormData) {
      const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
      };

      // Validate input
      const parsed = registerSchema.safeParse(rawData);
      if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
      }

      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, parsed.data.email),
      });
      if (existingUser) {
        return { error: { email: ['Un compte avec cet email existe deja'] } };
      }

      // Hash password with bcrypt cost factor 12
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);

      // Generate anonymous ID
      const anonymousId = await generateAnonymousId(db);

      // Insert user
      await db.insert(users).values({
        email: parsed.data.email,
        passwordHash,
        anonymousId,
      });

      // Auto-login after registration
      await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirectTo: '/feed/hot',
      });
    }
    ```

- [ ] **Task 1.2.12: Create the login server action** (AC: credential validation, JWT session)
  - Create `src/app/(auth)/login/actions.ts`:
    ```typescript
    'use server';

    import { signIn } from '@/lib/auth/config';
    import { loginSchema } from '@/lib/validators/auth';
    import { AuthError } from 'next-auth';

    export async function loginAction(formData: FormData) {
      const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      };

      const parsed = loginSchema.safeParse(rawData);
      if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
      }

      try {
        await signIn('credentials', {
          email: parsed.data.email,
          password: parsed.data.password,
          redirectTo: '/feed/hot',
        });
      } catch (error) {
        if (error instanceof AuthError) {
          return { error: { _form: ['Email ou mot de passe incorrect'] } };
        }
        throw error;
      }
    }
    ```

### Phase 5: Registration Page UI

- [ ] **Task 1.2.13: Create the registration page** (AC: registration form with all fields)
  - Create `src/app/(auth)/register/page.tsx`:
    - Server Component page with metadata:
      ```typescript
      export const metadata = { title: 'Creer un compte' };
      ```
    - Render `<RegisterForm />` client component

- [ ] **Task 1.2.14: Create `<RegisterForm />` component** (AC: registration form, labels, CAPTCHA, validation)
  - Create `src/components/features/auth/RegisterForm.tsx`
  - Mark as `'use client'`
  - Use shadcn/ui `<Input />`, `<Button />`, and `<Card />` components
  - Fields:
    - `email`: `<Input type="email" required />` with `<label>Adresse email</label>`
    - `password`: `<Input type="password" required />` with `<label>Mot de passe</label>` and helper text "Minimum 8 caracteres"
    - `confirmPassword`: `<Input type="password" required />` with `<label>Confirmer le mot de passe</label>`
  - Every `<label>` has `htmlFor` matching the input `id` (NFR20)
  - CAPTCHA placeholder: render a Cloudflare Turnstile widget area (or placeholder `<div>` with text "CAPTCHA widget here" for MVP if Turnstile is not yet configured) (NFR11)
  - Submit button: `<Button type="submit" className="w-full bg-chainsaw-red">Creer mon compte</Button>`
  - Link to login: "Deja un compte ? Se connecter" linking to `/auth/login`
  - Inline validation errors: below each field, render `{errors.fieldName && <p role="alert" className="text-sm text-chainsaw-red">{errors.fieldName[0]}</p>}` (NFR20)
  - Use `useActionState` or `useFormState` from React to handle server action response
  - Loading state: disable button and show spinner during submission
  - All interactive elements have `:focus-visible` styling (NFR18)

### Phase 6: Login Page UI

- [ ] **Task 1.2.15: Create the login page** (AC: login form with labels)
  - Create `src/app/(auth)/login/page.tsx`:
    - Server Component page with metadata:
      ```typescript
      export const metadata = { title: 'Se connecter' };
      ```
    - Render `<LoginForm />` client component

- [ ] **Task 1.2.16: Create `<LoginForm />` component** (AC: login form, labels, forgot password link)
  - Create `src/components/features/auth/LoginForm.tsx`
  - Mark as `'use client'`
  - Fields:
    - `email`: `<Input type="email" required />` with `<label>Adresse email</label>`
    - `password`: `<Input type="password" required />` with `<label>Mot de passe</label>`
  - Every `<label>` has `htmlFor` matching the input `id` (NFR20)
  - Submit button: `<Button type="submit" className="w-full bg-chainsaw-red">Se connecter</Button>`
  - "Mot de passe oublie ?" placeholder link (non-functional for MVP -- can link to `#` or show a toast "Bientot disponible")
  - Link to register: "Pas encore de compte ? Creer un compte" linking to `/auth/register`
  - Inline validation errors with `role="alert"` (NFR20)
  - Form-level error for invalid credentials: displayed above the submit button
  - Loading state during submission

### Phase 7: Auth Layout

- [ ] **Task 1.2.17: Create the `(auth)` route group layout** (AC: consistent auth page layout)
  - Create `src/app/(auth)/layout.tsx`:
    - Center the auth forms on the page
    - Display the LIBERAL logo at the top
    - Use a max-width container (e.g., `max-w-md mx-auto`)
    - Apply consistent padding and spacing
    - Ensure the auth layout does NOT render the MobileTabBar (or renders it grayed out)

### Phase 8: Rate Limiting

- [ ] **Task 1.2.18: Implement rate limiting for auth endpoints** (AC: 429 on 10 POST/min)
  - Create `src/lib/api/rate-limit.ts`:
    ```typescript
    import { Ratelimit } from '@upstash/ratelimit';
    import { Redis } from '@upstash/redis';

    const redis = Redis.fromEnv();

    export const rateLimiters = {
      registration: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1h'),
        prefix: 'ratelimit:registration',
      }),
      login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '15m'),
        prefix: 'ratelimit:login',
      }),
      submission: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '24h'),
        prefix: 'ratelimit:submission',
      }),
      vote: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1h'),
        prefix: 'ratelimit:vote',
      }),
      comment: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1h'),
        prefix: 'ratelimit:comment',
      }),
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1m'),
        prefix: 'ratelimit:api',
      }),
    };
    ```
  - Integrate rate limiting into the registration and login server actions:
    - Get client IP from request headers (`x-forwarded-for` or `x-real-ip`)
    - Call `rateLimiters.registration.limit(ip)` before processing registration
    - Call `rateLimiters.login.limit(ip)` before processing login
    - If rate limited, return `{ error: { _form: ['Trop de tentatives. Reessayez plus tard.'] } }`
  - Note: For local development without Upstash, add a fallback that skips rate limiting when `UPSTASH_REDIS_REST_URL` is not set

### Phase 9: API Response Utilities

- [ ] **Task 1.2.19: Create API response wrapper utilities** (AC: consistent API responses)
  - Create `src/lib/api/response.ts`:
    ```typescript
    import { NextResponse } from 'next/server';

    type ApiMeta = {
      cursor?: string;
      hasMore?: boolean;
      totalCount?: number;
      requestId?: string;
    };

    type ApiError = {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };

    export function apiSuccess<T>(data: T, meta: ApiMeta = {}, status = 200) {
      return NextResponse.json(
        { data, error: null, meta: { ...meta, requestId: crypto.randomUUID() } },
        { status }
      );
    }

    export function apiError(code: string, message: string, status: number, details?: Record<string, unknown>) {
      return NextResponse.json(
        {
          data: null,
          error: { code, message, details: details ?? {} } satisfies ApiError,
          meta: { requestId: crypto.randomUUID() },
        },
        { status }
      );
    }
    ```

  - Create `src/lib/api/errors.ts`:
    ```typescript
    export class ApiError extends Error {
      constructor(
        public code: string,
        message: string,
        public status: number,
        public details?: Record<string, unknown>
      ) {
        super(message);
        this.name = 'ApiError';
      }

      static validation(message: string, details?: Record<string, unknown>) {
        return new ApiError('VALIDATION_ERROR', message, 400, details);
      }
      static unauthorized(message = 'Non authentifie') {
        return new ApiError('UNAUTHORIZED', message, 401);
      }
      static forbidden(message = 'Acces refuse') {
        return new ApiError('FORBIDDEN', message, 403);
      }
      static notFound(message = 'Ressource introuvable') {
        return new ApiError('NOT_FOUND', message, 404);
      }
      static conflict(message = 'Conflit de ressource') {
        return new ApiError('CONFLICT', message, 409);
      }
      static rateLimited(retryAfter: number) {
        return new ApiError('RATE_LIMITED', `Trop de requetes. Reessayez dans ${Math.ceil(retryAfter / 60)} minutes.`, 429, { retryAfter });
      }
      static internal(message = 'Erreur interne du serveur') {
        return new ApiError('INTERNAL_ERROR', message, 500);
      }
    }
    ```

### Phase 10: Testing

- [ ] **Task 1.2.20: Write unit tests for validation schemas** (AC: validation errors)
  - Create `src/lib/validators/__tests__/auth.test.ts`:
    - Test `registerSchema` with valid data passes
    - Test `registerSchema` rejects empty email
    - Test `registerSchema` rejects invalid email format
    - Test `registerSchema` rejects password < 8 chars
    - Test `registerSchema` rejects mismatched passwords
    - Test `loginSchema` with valid data passes
    - Test `loginSchema` rejects empty fields

- [ ] **Task 1.2.21: Write unit tests for `generateAnonymousId`** (AC: anonymous_id generation)
  - Create `src/lib/db/__tests__/helpers.test.ts`:
    - Test it generates "Nicolas #0001" when no users exist
    - Test it generates sequential IDs
    - Test the format is exactly "Nicolas #XXXX" with zero-padding

- [ ] **Task 1.2.22: Write component tests for RegisterForm** (AC: form rendering, labels, errors)
  - Create `src/components/features/auth/__tests__/RegisterForm.test.tsx`:
    - Test all three form fields are rendered with labels
    - Test labels have correct `htmlFor` attributes
    - Test submit button is present with correct text
    - Test inline validation errors display with `role="alert"`

- [ ] **Task 1.2.23: Write component tests for LoginForm** (AC: form rendering, labels)
  - Create `src/components/features/auth/__tests__/LoginForm.test.tsx`:
    - Test both form fields are rendered with labels
    - Test "Mot de passe oublie ?" link is present
    - Test link to registration page is present

- [ ] **Task 1.2.24: Verify build passes with auth configuration** (AC: build passes)
  - Run `npm run build` -- must succeed
  - Run `npm run lint` -- must pass
  - Run `npm run test` -- all new tests must pass

## Dev Notes

### Architecture & Patterns

- **Auth.js v5 with JWT strategy:** Sessions are stored as JWTs in httpOnly, Secure, SameSite=Lax cookies. No database session table needed for MVP.
- **Credentials provider for email/password:** Auth.js v5 Credentials provider handles the authentication flow. Custom `authorize` function validates against Drizzle-queried user records.
- **DrizzleAdapter:** Used for Auth.js database integration. The adapter expects specific table structures -- the `users` table schema may need adjustments to be compatible with both the adapter and custom fields.
- **Server Actions for mutations:** Registration and login use Next.js Server Actions (not API Route Handlers). This avoids CSRF token management since Server Actions have built-in CSRF protection.
- **Zod validation on both client and server:** Schemas are shared. Client-side validation provides instant feedback; server-side validation is the security boundary.
- **bcrypt with cost factor 12:** As specified in NFR7. Using `bcryptjs` (pure JavaScript) for compatibility without native compilation requirements.

### Technical Requirements

| Library | Version | Purpose |
|---|---|---|
| next-auth | 5.x | Auth.js v5 authentication framework |
| @auth/drizzle-adapter | latest | Drizzle adapter for Auth.js |
| bcryptjs | latest | Password hashing (cost factor 12) |
| zod | 3.x | Input validation schemas |
| @upstash/ratelimit | latest | Rate limiting |
| @upstash/redis | 1.36.x | Redis client for rate limiting |

### Database Schema

**Table: `users`**

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default random | Auth.js compatible |
| `email` | varchar(255) | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | text | NOT NULL | bcrypt with cost 12 |
| `display_name` | varchar(100) | NULLABLE | Set in Story 1.3 |
| `anonymous_id` | varchar(20) | NOT NULL, UNIQUE | "Nicolas #0042" format |
| `role` | user_role enum | NOT NULL, DEFAULT 'user' | 'user', 'moderator', 'admin' |
| `twitter_id` | varchar(255) | UNIQUE, NULLABLE | Future Twitter OAuth |
| `twitter_handle` | varchar(50) | NULLABLE | Future Twitter display |
| `avatar_url` | text | NULLABLE | Future avatar feature |
| `bio` | text | NULLABLE | Future profile bio |
| `submission_count` | integer | NOT NULL, DEFAULT 0 | Denormalized counter |
| `karma_score` | integer | NOT NULL, DEFAULT 0 | Future reputation system |
| `created_at` | timestamp | NOT NULL, DEFAULT now() | Registration date |
| `updated_at` | timestamp | NOT NULL, DEFAULT now() | Last modification |
| `deleted_at` | timestamp | NULLABLE | Soft delete for GDPR |

**Enum: `user_role`**
- Values: `'user'`, `'moderator'`, `'admin'`

### File Structure

Files created or modified by this story:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                    # NEW - Auth page layout
│   │   ├── register/
│   │   │   ├── page.tsx                  # NEW - Registration page
│   │   │   └── actions.ts               # NEW - Register server action
│   │   └── login/
│   │       ├── page.tsx                  # NEW - Login page
│   │       └── actions.ts               # NEW - Login server action
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts             # NEW - Auth.js route handler
├── components/
│   └── features/
│       └── auth/
│           ├── RegisterForm.tsx          # NEW - Registration form component
│           ├── LoginForm.tsx             # NEW - Login form component
│           └── __tests__/
│               ├── RegisterForm.test.tsx # NEW - Registration form tests
│               └── LoginForm.test.tsx    # NEW - Login form tests
├── lib/
│   ├── auth/
│   │   ├── config.ts                    # NEW - Auth.js configuration
│   │   └── helpers.ts                   # NEW - Auth utility functions
│   ├── db/
│   │   ├── index.ts                     # NEW - Drizzle client
│   │   ├── schema.ts                    # NEW/MODIFIED - Users table schema
│   │   ├── helpers.ts                   # NEW - Anonymous ID generator
│   │   └── __tests__/
│   │       └── helpers.test.ts          # NEW - DB helper tests
│   ├── api/
│   │   ├── response.ts                  # NEW - API response wrapper
│   │   ├── errors.ts                    # NEW - API error classes
│   │   └── rate-limit.ts               # NEW - Upstash rate limiters
│   └── validators/
│       ├── auth.ts                      # NEW - Zod auth schemas
│       └── __tests__/
│           └── auth.test.ts             # NEW - Validator tests
├── types/
│   └── next-auth.d.ts                   # NEW - Auth.js type extensions
└── middleware.ts                         # NEW - Route protection middleware
drizzle/
└── migrations/
    └── 0000_initial.sql                 # NEW - Generated migration
```

### Testing Requirements

- **Unit tests (Vitest):**
  - `auth.test.ts`: Zod schema validation -- 7+ test cases covering valid inputs, invalid emails, short passwords, mismatched passwords
  - `helpers.test.ts`: Anonymous ID generation -- 3+ test cases covering format, sequencing, uniqueness
  - `RegisterForm.test.tsx`: Component rendering -- 4+ test cases for field rendering, label association, error display
  - `LoginForm.test.tsx`: Component rendering -- 3+ test cases for field rendering, links, labels
- **Coverage target:** >85% on `src/lib/validators/auth.ts`, >70% on form components
- **Manual testing checklist:**
  - [ ] Registration with valid data creates user and redirects to `/feed/hot`
  - [ ] Registration with existing email shows error
  - [ ] Registration with short password shows inline error
  - [ ] Registration with mismatched passwords shows inline error
  - [ ] Login with valid credentials redirects to `/feed/hot`
  - [ ] Login with invalid credentials shows error message
  - [ ] Rate limiting returns 429 after 10 rapid login attempts
  - [ ] Secure cookie is set with httpOnly flag after login

### UX/Design Notes

- **Registration form layout:** Centered card on dark background. Max width 28rem (448px). Chainsaw Red submit button spans full width.
- **Input styling:** Use shadcn/ui Input with dark theme. Background `bg-surface-secondary`, border `border-border-default`, text `text-text-primary`. On focus: `ring-2 ring-chainsaw-red`.
- **Error styling:** Inline error text below field in `text-chainsaw-red` (14px). Field border turns `border-chainsaw-red` on error.
- **Mobile layout:** Form fills viewport width with 16px padding. Single-column layout.
- **Loading state:** Submit button shows a spinner and text "Creation en cours..." / "Connexion en cours..." while processing.
- **Accessibility:** All form fields have visible labels (not just placeholders). Error messages linked to fields via `aria-describedby`. Required fields marked with asterisk. Error messages have `role="alert"`.
- **French copy:**
  - Registration page title: "Rejoignez le mouvement"
  - Login page title: "Bon retour, Nicolas"
  - Register button: "Creer mon compte"
  - Login button: "Se connecter"
  - Error - existing email: "Un compte avec cet email existe deja"
  - Error - invalid credentials: "Email ou mot de passe incorrect"

### Dependencies

- **Depends on:** Story 1.1 (Project Scaffold) -- requires the project to be initialized with all dependencies installed, design tokens configured, and layout shell in place.
- **Depended on by:** Story 1.3 (Display Name Selection), Story 1.4 (User Profile), Story 1.5 (Account Deletion), and all stories requiring authenticated users.

### References

- [Source: epics.md#Story 1.2] -- Acceptance criteria for registration and login
- [Source: architecture.md#Section 3.1] -- Database schema (users table, Drizzle ORM)
- [Source: architecture.md#Section 3.2] -- Auth.js v5 configuration, JWT, Credentials provider, rate limiting
- [Source: architecture.md#Section 4.4] -- Lazy registration pattern, LazyAuthGate
- [Source: prd.md#FR22] -- Visitors can register with email and password
- [Source: prd.md#NFR7] -- Password hashing with adaptive algorithm, cost factor 12
- [Source: prd.md#NFR8] -- Rate limiting on API endpoints
- [Source: prd.md#NFR11] -- CAPTCHA or anti-bot measure on registration
- [Source: prd.md#NFR20] -- Form labels, error messages, required field indicators
- [Source: ux-design-specification.md#Form Patterns] -- Inline validation, submit button states, error recovery
- [Source: ux-design-specification.md#Lazy Registration] -- Invisible until needed, 20-second signup

## Dev Agent Record

### Agent Model Used
(To be filled by dev agent)

### Completion Notes List
(To be filled during implementation)

### Change Log
(To be filled during implementation)

### File List
(To be filled during implementation)
