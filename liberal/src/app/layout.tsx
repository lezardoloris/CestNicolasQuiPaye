import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

import Providers from '@/components/layout/Providers';
import DesktopNav from '@/components/layout/DesktopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import Footer from '@/components/layout/Footer';
import WelcomePromptWrapper from '@/components/features/auth/WelcomePromptWrapper';
import FlashMessage from '@/components/features/common/FlashMessage';

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'LIBERAL - La tronconneuse citoyenne',
    template: '%s | LIBERAL',
  },
  description:
    'Plateforme citoyenne collaborative pour identifier, documenter et voter sur les depenses publiques a reduire. Transparence, donnees officielles et participation democratique.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'LIBERAL',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'LIBERAL - La tronconneuse citoyenne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@LIBERAL_FR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
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
          <div className="min-h-screen pb-20 md:pb-0">{children}</div>
          <Footer />
          <MobileTabBar />
          <WelcomePromptWrapper />
          <FlashMessage />
        </Providers>
      </body>
    </html>
  );
}
