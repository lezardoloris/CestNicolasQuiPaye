import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { registerSchema } from '@/lib/validators/auth';
import { generateAnonymousId } from '@/lib/db/helpers';
import { apiSuccess, apiError } from '@/lib/api/response';
import { checkRateLimit, getClientIp } from '@/lib/api/rate-limit';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers);
    const rateLimitError = await checkRateLimit('registration', ip);
    if (rateLimitError) {
      return apiError('RATE_LIMITED', rateLimitError, 429);
    }

    const body = await request.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Donnees invalides', 400, {
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, parsed.data.email),
    });
    if (existingUser) {
      return apiError(
        'CONFLICT',
        'Un compte avec cet email existe deja',
        409,
      );
    }

    // Hash password with bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    // Generate anonymous ID
    const anonymousId = await generateAnonymousId(db);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        passwordHash,
        anonymousId,
      })
      .returning({ id: users.id, email: users.email, anonymousId: users.anonymousId });

    return apiSuccess(
      {
        id: newUser.id,
        email: newUser.email,
        anonymousId: newUser.anonymousId,
      },
      {},
      201,
    );
  } catch (error) {
    console.error('Registration error:', error);
    return apiError('INTERNAL_ERROR', 'Erreur interne du serveur', 500);
  }
}
