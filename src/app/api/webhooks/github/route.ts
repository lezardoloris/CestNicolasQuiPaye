import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/response';
import { verifyGitHubWebhookSignature } from '@/lib/utils/github-webhook';
import { handlePullRequest, handleIssue } from '@/lib/api/github-webhook';

/** POST /api/webhooks/github — Receives GitHub webhook events. */
export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[github-webhook] GITHUB_WEBHOOK_SECRET not configured');
    return apiError('INTERNAL_ERROR', 'Webhook not configured', 500);
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifyGitHubWebhookSignature(rawBody, signature, secret)) {
    return apiError('UNAUTHORIZED', 'Invalid webhook signature', 401);
  }

  const event = request.headers.get('x-github-event');
  if (event === 'ping') {
    return apiSuccess({ message: 'pong' });
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    let result = null;

    if (event === 'pull_request') {
      result = await handlePullRequest(payload);
    } else if (event === 'issues') {
      result = await handleIssue(payload);
    }

    return apiSuccess(result ?? { message: `Event '${event}' ignored` });
  } catch (error) {
    console.error('[github-webhook] Processing error:', error);
    return apiError('INTERNAL_ERROR', 'Webhook processing failed', 500);
  }
}
