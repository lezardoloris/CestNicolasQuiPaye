'use client';

import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { ConsequenceCard } from './ConsequenceCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ConsequenceLoaderProps {
  submissionId: string;
  amount: string;
}

export function ConsequenceLoader({
  submissionId,
  amount,
}: ConsequenceLoaderProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cost-to-nicolas', submissionId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${submissionId}/cost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountEur: parseFloat(amount) }),
      });
      if (!res.ok) throw new Error('Cost calculation failed');
      const result = await res.json();
      return result.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="mt-6 border-l-4 border-l-chainsaw-red bg-surface-secondary">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mt-6 border-l-4 border-l-border-default bg-surface-secondary">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-text-secondary">
            Calcul en cours... Revenez dans quelques instants.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (data) {
    return <ConsequenceCard data={data} />;
  }

  return null;
}
