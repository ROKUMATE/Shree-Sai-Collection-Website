import { headers } from "next/headers";

// In-memory sliding-window rate limiter. This app deploys as a single
// long-lived container, so per-process state is sufficient; if you ever run
// multiple replicas, move this to Redis.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  // opportunistic cleanup so the map can't grow unbounded
  if (hits.size > 10_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}

/** Rate-limit key for the calling client: scope + originating IP. */
export async function clientKey(scope: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "local")
    .split(",")[0]
    .trim();
  return `${scope}:${ip}`;
}

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
