'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { loginSchema } from '@/lib/validators/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Client-side validation
    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: rawData.email,
        password: rawData.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError('Email ou mot de passe incorrect');
        setIsLoading(false);
        return;
      }

      router.push('/feed/hot');
      router.refresh();
    } catch {
      setFormError('Une erreur est survenue. Veuillez reessayer.');
      setIsLoading(false);
    }
  }

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    toast.info('Bientot disponible', {
      description: 'La reinitialisation du mot de passe sera disponible prochainement.',
    });
  }

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardHeader>
        <CardTitle className="font-display text-xl text-text-primary">
          Bon retour, Nicolas
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Connectez-vous a votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div role="alert" className="rounded-md bg-chainsaw-red/10 p-3 text-sm text-chainsaw-red">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-text-primary">
              Adresse email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="vous@exemple.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              className="bg-surface-primary border-border-default text-text-primary"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-chainsaw-red">
                {errors.email[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-text-muted hover:text-chainsaw-red transition-colors"
              >
                Mot de passe oublie ?
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Votre mot de passe"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              className="bg-surface-primary border-border-default text-text-primary"
            />
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-chainsaw-red">
                {errors.password[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-text-secondary">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-chainsaw-red hover:underline">
            Creer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
