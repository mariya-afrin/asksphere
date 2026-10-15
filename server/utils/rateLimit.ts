// server/utils/rateLimit.ts
// Simple in-memory rate limiter.
// Works for a single server instance. For multi-instance deployments,
// replace the Map with Redis or MongoDB.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

/**
 * Increment the counter for `key`. Returns ok=false when the limit
 * has been reached. Buckets expire after `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt }
  }
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}

/**
 * Periodically clear expired buckets so the Map does not grow forever.
 * Runs every 10 minutes.
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, 10 * 60 * 1000).unref?.()