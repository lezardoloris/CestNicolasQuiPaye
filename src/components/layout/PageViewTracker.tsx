'use client';

import { usePathname } from 'next/navigation';
import { usePageView } from '@/hooks/use-page-view';

export function PageViewTracker() {
  const pathname = usePathname();
  usePageView(pathname);
  return null;
}
