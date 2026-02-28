import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Generate a short random ID like "citoyen_a3f8b2" */
function generateAnonymousId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `citoyen_${rand}`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // ⚠️ NO DrizzleAdapter here — we manage users ourselves.
  // DrizzleAdapter + JWT strategy + Credentials = "Bad request" error.
  // Our custom signIn callback handles Google user creation manually.
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days

  providers: [
    // ── Google OAuth ─────────────────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // ── Email / Password ─────────────────────────────────────────────
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
        if (user.deletedAt) return null;

        // Google-only accounts have no password → deny credential login
        if (!user.passwordHash) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.anonymousId,
          // custom fields forwarded to JWT callback
          role: user.role,
          anonymousId: user.anonymousId,
          displayName: user.displayName,
        };
      },
    }),
  ],

  callbacks: {
    // ── Sign-in: auto-create user row for Google OAuth ────────────────
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existing) {
          // First Google login → materialise in our users table
          const anonymousId = generateAnonymousId();
          await db.insert(users).values({
            email: user.email,
            passwordHash: '', // OAuth user — no password
            anonymousId,
            displayName: user.name ?? null,
            role: 'user',
          });
        } else if (existing.deletedAt) {
          return false; // banned/deleted account
        }
      }
      return true;
    },

    // ── JWT: embed DB user fields into the token ──────────────────────
    async jwt({ token, user, account, trigger, session }) {
      // user is only populated on the very first sign-in call
      if (user || account) {
        const email = (user?.email ?? token.email) as string | undefined;
        if (email) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.anonymousId = dbUser.anonymousId;
            token.displayName = dbUser.displayName;
          }
        }
      }

      // Allow client-side session.update() to refresh display name
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if ('displayName' in session) token.displayName = session.displayName;
      }

      return token;
    },

    // ── Session: expose token fields to the app ───────────────────────
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = (token.role as string) ?? 'user';
      session.user.anonymousId = (token.anonymousId as string) ?? '';
      session.user.displayName = (token.displayName as string | null) ?? null;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login', // redirect /api/auth/error → /login with ?error=
  },
});
