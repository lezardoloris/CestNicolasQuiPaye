import type { Metadata } from 'next';
import LoginForm from '@/components/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Se connecter',
  description:
    'Connectez-vous pour voter, commenter et signaler les gaspillages publics.',
};

export default function LoginPage() {
  return <LoginForm />;
}
