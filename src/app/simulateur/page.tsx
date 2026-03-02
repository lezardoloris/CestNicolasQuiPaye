import type { Metadata } from 'next';
import { SimulatorPageClient } from '@/components/features/simulator/SimulatorPageClient';

export const metadata: Metadata = {
  title: 'Simulateur fiscal — Combien Nicolas paie ?',
  description:
    'Calculez votre contribution fiscale réelle : IR par tranche, cotisations sociales, TVA estimée. Découvrez où va votre argent dans le budget de l\'État.',
  openGraph: {
    title: 'Simulateur fiscal — C\'est Nicolas qui paie',
    description:
      'Simulez vos impôts et découvrez comment votre argent est réparti dans le budget de l\'État.',
  },
};

export default function SimulateurPage() {
  return <SimulatorPageClient />;
}
