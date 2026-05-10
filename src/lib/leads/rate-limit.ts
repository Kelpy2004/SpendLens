export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult =
  | {
      allowed: true;
      remaining: number;
      resetAt: number;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
      resetAt: number;
    };

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  now = Date.now(),
): RateLimitResult {
  clearExpiredBuckets(now);

  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : {
          count: 0,
          resetAt: now + options.windowMs,
        };

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      resetAt: bucket.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function createLeadRateLimitKeys({
  email,
  ipAddress,
}: {
  email: string;
  ipAddress: string;
}) {
  return [`lead:ip:${ipAddress}`, `lead:email:${email.toLowerCase()}`];
}

export function resetRateLimitBucketsForTests() {
  buckets.clear();
}

function clearExpiredBuckets(now: number) {
  Array.from(buckets.entries()).forEach(([key, bucket]) => {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  });
}
