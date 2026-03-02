import type { Metadata } from 'next';
import RegisterForm from '@/components/features/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Rejoignez la communauté citoyenne pour signaler, voter et documenter les dépenses publiques françaises.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
