import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

import Providers from '@/components/layout/Providers';
import DesktopNav from '@/components/layout/DesktopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import MobileHeader from '@/components/layout/MobileHeader';
import Footer from '@/components/layout/Footer';
import WelcomePromptWrapper from '@/components/features/auth/WelcomePromptWrapper';
import FlashMessage from '@/components/features/common/FlashMessage';
import { GamificationProvider } from '@/components/features/gamification/GamificationProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport = {
  viewportFit: 'cover' as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'NICOLAS PAYE - La communauté open source pour tronçonner les dépenses publiques',
    template: '%s | NICOLAS PAYE',
  },
  description:
    'Plateforme citoyenne collaborative pour identifier, documenter et voter sur les dépenses publiques à réduire. Transparence, données officielles et participation démocratique.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'NICOLAS PAYE',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'NICOLAS PAYE - La communauté open source pour tronçonner les dépenses publiques',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@NicolasPaye_FR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-body bg-surface-primary text-text-primary antialiased`}
      >
        <Providers>
          {/* Skip navigation link for keyboard users (RGAA AA) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-chainsaw-red focus:px-4 focus:py-2 focus:text-white focus:outline-none"
          >
            Aller au contenu principal
          </a>
          <DesktopNav />
          <MobileHeader />
          <div className="min-h-[calc(100dvh-3rem)] pb-20 md:min-h-screen md:pb-0">{children}</div>
          <Footer />
          <MobileTabBar />
          <WelcomePromptWrapper />
          <FlashMessage />
          <GamificationProvider />
        </Providers>
      </body>
    </html>
  );
}
