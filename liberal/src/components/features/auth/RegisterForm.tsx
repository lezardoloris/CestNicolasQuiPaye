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
import { registerSchema } from '@/lib/validators/auth';
import { Loader2 } from 'lucide-react';

export default function RegisterForm() {
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
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Client-side validation
    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      setIsLoading(false);
      return;
    }

    try {
      // Call register API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.details?.fields) {
          setErrors(data.error.details.fields as Record<string, string[]>);
        } else {
          setFormError(data.error?.message ?? 'Une erreur est survenue');
        }
        setIsLoading(false);
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn('credentials', {
        email: rawData.email,
        password: rawData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setFormError('Compte cree mais erreur de connexion. Veuillez vous connecter.');
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

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardHeader>
        <CardTitle className="font-display text-xl text-text-primary">
          Rejoignez le mouvement
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Creez votre compte pour participer
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
              Adresse email <span className="text-chainsaw-red">*</span>
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
            <label htmlFor="password" className="text-sm font-medium text-text-primary">
              Mot de passe <span className="text-chainsaw-red">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Minimum 8 caracteres"
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              aria-invalid={!!errors.password}
              className="bg-surface-primary border-border-default text-text-primary"
            />
            {errors.password ? (
              <p id="password-error" role="alert" className="text-sm text-chainsaw-red">
                {errors.password[0]}
              </p>
            ) : (
              <p id="password-hint" className="text-xs text-text-muted">
                Minimum 8 caracteres
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
              Confirmer le mot de passe <span className="text-chainsaw-red">*</span>
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Retapez votre mot de passe"
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              aria-invalid={!!errors.confirmPassword}
              className="bg-surface-primary border-border-default text-text-primary"
            />
            {errors.confirmPassword && (
              <p id="confirm-error" role="alert" className="text-sm text-chainsaw-red">
                {errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* CAPTCHA placeholder */}
          <div className="rounded-md border border-border-default bg-surface-primary p-3 text-center text-xs text-text-muted">
            CAPTCHA (Turnstile) - bientot disponible
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-chainsaw-red text-white hover:bg-chainsaw-red-hover"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creation en cours...
              </>
            ) : (
              'Creer mon compte'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-text-secondary">
          Deja un compte ?{' '}
          <Link href="/auth/login" className="text-chainsaw-red hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
