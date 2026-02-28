export interface TwitterPostResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

/**
 * Post a tweet to the @NicolasPaye_FR account via Twitter/X API v2.
 * In production, this uses OAuth credentials from environment variables.
 * For MVP, this is a placeholder that logs the tweet text.
 */
export async function postTweet(text: string): Promise<TwitterPostResult> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    // Development mode: simulate success
    console.log('[Twitter] Would post tweet:', text);
    return {
      success: true,
      tweetId: 'dev-' + Date.now(),
      tweetUrl: `https://twitter.com/NicolasPaye_FR/status/dev-${Date.now()}`,
    };
  }

  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          (error as { detail?: string }).detail || `Twitter API error: ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      data: { id: string; text: string };
    };
    const tweetId = data.data.id;
    return {
      success: true,
      tweetId,
      tweetUrl: `https://twitter.com/NicolasPaye_FR/status/${tweetId}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur reseau',
    };
  }
}
