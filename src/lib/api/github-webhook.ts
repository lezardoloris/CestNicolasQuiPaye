import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { awardXp } from '@/lib/gamification/xp-engine';
import { githubEntityToUuid } from '@/lib/utils/github-webhook';
import type { xpActionType } from '@/lib/db/schema';

type GitHubXpAction = Extract<
  (typeof xpActionType.enumValues)[number],
  'github_pr_opened' | 'github_pr_merged' | 'github_issue_opened'
>;

interface WebhookResult {
  action: string;
  awarded: boolean;
}

/** Handle pull_request webhook events. */
export async function handlePullRequest(
  payload: Record<string, unknown>,
): Promise<WebhookResult | null> {
  const action = payload.action as string;
  const pr = payload.pull_request as {
    number: number;
    user: { login: string };
    merged?: boolean;
  };
  const repo = payload.repository as { full_name: string };
  const entityKey = `github:pr:${repo.full_name}:${pr.number}`;

  if (action === 'opened') {
    const awarded = await awardXpToGitHubUser(pr.user.login, 'github_pr_opened', entityKey);
    return { action: 'github_pr_opened', awarded };
  }

  if (action === 'closed' && pr.merged) {
    const awarded = await awardXpToGitHubUser(pr.user.login, 'github_pr_merged', entityKey);
    return { action: 'github_pr_merged', awarded };
  }

  return null;
}

/** Handle issues webhook events. */
export async function handleIssue(
  payload: Record<string, unknown>,
): Promise<WebhookResult | null> {
  const action = payload.action as string;
  if (action !== 'opened') return null;

  const issue = payload.issue as { number: number; user: { login: string } };
  const repo = payload.repository as { full_name: string };
  const entityKey = `github:issue:${repo.full_name}:${issue.number}`;

  const awarded = await awardXpToGitHubUser(issue.user.login, 'github_issue_opened', entityKey);
  return { action: 'github_issue_opened', awarded };
}

/** Look up a platform user by GitHub username and award XP. */
async function awardXpToGitHubUser(
  githubUsername: string,
  actionType: GitHubXpAction,
  entityKey: string,
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.githubUsername, githubUsername),
    columns: { id: true },
  });
  if (!user) return false;

  const relatedEntityId = githubEntityToUuid(entityKey);
  await awardXp(user.id, actionType, relatedEntityId, 'github_contribution', undefined, {
    githubUsername,
    entityKey,
  });
  return true;
}
