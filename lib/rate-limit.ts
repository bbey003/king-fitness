/**
 * In-memory token bucket rate limiter.
 * Resets between server restarts. Replace with Redis in production.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __rateLimiter: Map<string, Bucket> | undefined;
}

const store = globalThis.__rateLimiter ?? (globalThis.__rateLimiter = new Map());

export function rateLimit(
  key: string,
  limit = 100,
  windowMs = 60_000
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? 'unknown';
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
