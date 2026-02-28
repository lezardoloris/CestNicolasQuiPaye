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

// Google SVG icon (no external dep)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h12.4c-.5 2.8-2.1 5.1-4.5 6.7v5.5h7.3c4.3-3.9 6.9-9.7 6.9-16.3z" />
      <path fill="#34A853" d="M24 47c6.2 0 11.4-2 15.2-5.5l-7.3-5.5c-2.1 1.4-4.7 2.2-7.9 2.2-6.1 0-11.2-4.1-13-9.6H3.4v5.7C7.2 41.7 15 47 24 47z" />
      <path fill="#FBBC04" d="M11 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6v-5.7H3.4C1.2 17.7 0 20.7 0 24s1.2 6.3 3.4 8.3l7.6-5.7z" />
      <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.4 2.6 30.2 0 24 0 15 0 7.2 5.3 3.4 12.9l7.6 5.7c1.8-5.5 6.9-9.1 13-9.1z" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/feed/hot' });
    } catch {
      toast.error('Erreur lors de la connexion Google. Réessayez.');
      setIsGoogleLoading(false);
    }
  }

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
        // Could be wrong password OR a Google-only account trying credentials
        setFormError(
          'Email ou mot de passe incorrect. Si vous avez créé votre compte via Google, utilisez le bouton « Continuer avec Google ».'
        );
        setIsLoading(false);
        return;
      }

      router.push('/feed/hot');
      router.refresh();
    } catch {
      setFormError('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  }

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    toast.info('Bientôt disponible', {
      description: 'La réinitialisation du mot de passe sera disponible prochainement.',
    });
  }

  return (
    <Card className="border-border-default bg-surface-secondary">
      <CardHeader>
        <CardTitle className="font-display text-xl text-text-primary">
          Bon retour, citoyen
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Connectez-vous pour signaler et voter
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* ── Google SSO ── */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full gap-3 border-border-default bg-surface-primary hover:bg-surface-elevated"
          id="btn-google-signin"
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continuer avec Google
        </Button>

        {/* ── Divider ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-default" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-secondary px-2 text-text-muted">ou par email</span>
          </div>
        </div>

        {/* ── Credentials form ── */}
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
                Mot de passe oublié ?
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
            disabled={isLoading || isGoogleLoading}
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
          <Link href="/register" className="text-chainsaw-red hover:underline">
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
