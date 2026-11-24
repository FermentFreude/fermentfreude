import { createHash } from 'crypto'

/* ═══════════════════════════════════════════════════════════════
 *  Recipe star ratings ("Hat's geschmeckt?") — pure helpers used by
 *  POST /api/recipes/rate and the recipe page. No raw IP is ever
 *  stored: only salted SHA-256 hashes (salt = PAYLOAD_SECRET).
 * ═══════════════════════════════════════════════════════════════ */

/** Max. votes (new or changed) one connection may send per hour, across all recipes. */
export const RATING_HOURLY_LIMIT = 30

export type RatingSummary = { count: number; average: number }

/** Validates the request body. Returns null when anything is off. */
export function parseRatingInput(body: unknown): { slug: string; stars: number } | null {
  if (!body || typeof body !== 'object') return null
  const { slug, stars } = body as { slug?: unknown; stars?: unknown }
  if (typeof slug !== 'string' || !/^[a-z0-9-]{1,120}$/.test(slug)) return null
  if (typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 5) return null
  return { slug, stars }
}

function sha(...parts: string[]) {
  return createHash('sha256').update(parts.join('\u0000')).digest('hex')
}

/** First address in x-forwarded-for (Vercel), else x-real-ip, else 'unknown'. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip')?.trim() || 'unknown'
}

/** "Same person, same recipe" (connection + browser + recipe) and "same connection" hashes. */
export function ratingHashes(secret: string, ip: string, userAgent: string, recipeId: string) {
  return {
    voter: sha(secret, 'voter', ip, userAgent, recipeId),
    ipHash: sha(secret, 'ip', ip),
  }
}

/** Count + average (one decimal) of a list of star values. */
export function summarize(stars: number[]): RatingSummary {
  const valid = stars.filter((s) => Number.isInteger(s) && s >= 1 && s <= 5)
  if (!valid.length) return { count: 0, average: 0 }
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length
  return { count: valid.length, average: Math.round(avg * 10) / 10 }
}
