import type { Metadata } from 'next';
import LoginForm from '@/components/features/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Se connecter',
};

export default function LoginPage() {
  return <LoginForm />;
}
