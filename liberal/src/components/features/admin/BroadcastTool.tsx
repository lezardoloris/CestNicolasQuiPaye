'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buildShareText, buildSubmissionUrl } from '@/lib/utils/share';

interface BroadcastHistoryItem {
  id: string;
  tweetText: string;
  tweetUrl: string | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
  submissionTitle: string;
}

export function BroadcastTool() {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionId] = useState('');
  const [tweetText, setTweetText] = useState('');

  // Fetch broadcast history
  const { data: history, isLoading } = useQuery({
    queryKey: ['broadcast-history'],
    queryFn: async () => {
      const res = await fetch('/api/admin/broadcast');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      return json.data as BroadcastHistoryItem[];
    },
  });

  // Generate tweet text from submission
  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/feed?limit=1&submissionId=${id}`);
      if (!res.ok) throw new Error('Soumission introuvable');
      const json = await res.json();
      const submission = json.data?.[0];
      if (!submission) throw new Error('Soumission introuvable');
      return submission;
    },
    onSuccess: (submission: { title: string; costPerTaxpayer: string | null; id: string }) => {
      const cost = submission.costPerTaxpayer ? parseFloat(submission.costPerTaxpayer) : 0;
      const text = buildShareText(submission.title, cost);
      const url = buildSubmissionUrl(submission.id, 'twitter', 'broadcast');
      setTweetText(`${text}\n\n${url}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Send broadcast
  const broadcastMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          tweetText,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Echec de la diffusion');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Tweet publie avec succes');
      setSubmissionId('');
      setTweetText('');
      queryClient.invalidateQueries({ queryKey: ['broadcast-history'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const charCount = tweetText.length;
  const isValid = submissionId.trim().length > 0 && charCount > 0 && charCount <= 280;

  return (
    <div className="space-y-6">
      {/* Composer */}
      <Card className="bg-surface-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Composer un tweet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="submission-id"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              ID de la soumission
            </label>
            <div className="flex gap-2">
              <Input
                id="submission-id"
                value={submissionId}
                onChange={(e) => setSubmissionId(e.target.value)}
                placeholder="UUID de la soumission"
                aria-label="Identifiant de la soumission"
              />
              <Button
                variant="outline"
                onClick={() => generateMutation.mutate(submissionId)}
                disabled={!submissionId.trim() || generateMutation.isPending}
                className="min-h-10 shrink-0"
                aria-label="Generer le texte du tweet"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Generer'
                )}
              </Button>
            </div>
          </div>

          <div>
            <label
              htmlFor="tweet-text"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Texte du tweet
            </label>
            <div className="relative">
              <Textarea
                id="tweet-text"
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="Redigez le tweet..."
                rows={4}
                maxLength={280}
                aria-label="Texte du tweet"
                aria-describedby="tweet-char-count"
              />
              <span
                id="tweet-char-count"
                className={cn(
                  'absolute bottom-2 right-2 text-xs',
                  charCount > 260 ? 'text-warning' : 'text-text-muted',
                  charCount > 280 && 'text-destructive',
                )}
              >
                {charCount}/280
              </span>
            </div>
          </div>

          <Button
            onClick={() => broadcastMutation.mutate()}
            disabled={!isValid || broadcastMutation.isPending}
            className="min-h-12 gap-2"
            aria-label="Publier le tweet"
          >
            {broadcastMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Publier sur Twitter/X
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-surface-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Historique des diffusions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (history ?? []).length === 0 ? (
            <p className="text-sm text-text-muted">
              Aucune diffusion pour l&apos;instant.
            </p>
          ) : (
            <ul className="space-y-3" role="list" aria-label="Historique des tweets">
              {(history ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border border-border/30 p-3"
                >
                  <div className="mt-0.5">
                    {item.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.status === 'sent' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {item.status === 'sent' ? 'Envoye' : 'Echoue'}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(item.sentAt || item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary line-clamp-2">
                      {item.tweetText}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.submissionTitle}
                    </p>
                    {item.tweetUrl && (
                      <a
                        href={item.tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-info hover:underline"
                        aria-label="Voir le tweet"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        Voir le tweet
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
