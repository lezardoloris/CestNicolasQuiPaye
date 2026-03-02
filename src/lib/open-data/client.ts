const USER_AGENT = 'NicoQuiPaye/1.0 (contact@nicoquipaie.co)';
const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 3;

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
        await sleep(waitMs);
        continue;
      }

      if (response.status >= 500) {
        lastError = new FetchError(`Server error ${response.status}`, response.status);
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      if (!response.ok) {
        throw new FetchError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      return response;
    } catch (error) {
      if (error instanceof FetchError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries`);
}
