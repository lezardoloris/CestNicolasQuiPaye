import { auth } from '@/lib/auth';

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

export async function requireModerator() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'moderator') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
