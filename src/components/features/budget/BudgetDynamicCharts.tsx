'use client';

import dynamic from 'next/dynamic';

export const PublicSpendingChart = dynamic(
  () => import('./PublicSpendingChart').then((m) => m.PublicSpendingChart),
  { ssr: false },
);

export const MissionBarChart = dynamic(
  () => import('./MissionBarChart').then((m) => m.MissionBarChart),
  { ssr: false },
);

export const RevenueBreakdownChart = dynamic(
  () => import('./RevenueBreakdownChart').then((m) => m.RevenueBreakdownChart),
  { ssr: false },
);

export const DebtProjectionChart = dynamic(
  () => import('./DebtProjectionChart').then((m) => m.DebtProjectionChart),
  { ssr: false },
);

export const SocialSpendingSection = dynamic(
  () => import('./SocialSpendingSection').then((m) => m.SocialSpendingSection),
  { ssr: false },
);

export const IncomeTaxSection = dynamic(
  () => import('./IncomeTaxSection').then((m) => m.IncomeTaxSection),
  { ssr: false },
);

export const EUComparisonSection = dynamic(
  () => import('./EUComparisonSection').then((m) => m.EUComparisonSection),
  { ssr: false },
);
