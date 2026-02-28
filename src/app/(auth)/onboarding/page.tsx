import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import DisplayNameForm from '@/components/features/auth/DisplayNameForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Bienvenue',
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    redirect('/login');
  }

  // If user already has a display name, redirect to feed
  if (user.displayName) {
    redirect('/feed/hot');
  }

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardHeader>
        <CardTitle className="font-display text-xl text-text-primary">
          Bienvenue !
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Choisissez un pseudonyme ou restez anonyme en tant que{' '}
          <strong className="text-chainsaw-red">{user.anonymousId}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DisplayNameForm
          currentDisplayName={user.displayName}
          anonymousId={user.anonymousId}
        />
      </CardContent>
    </Card>
  );
}
