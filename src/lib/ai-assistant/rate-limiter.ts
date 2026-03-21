import type { RateLimitResult } from './types'

/** In-memory rate limiter. Use Redis if running multiple instances. */
const requestCounts = new Map<string, { count: number; resetAt: number }>()

const LIMITS = {
  perMinute: 10,
  perHour: 100,
}

export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now()
  const minuteKey = `${userId}:minute`
  const hourKey = `${userId}:hour`

  // Per-minute check
  const minuteData = requestCounts.get(minuteKey)
  if (minuteData) {
    if (now < minuteData.resetAt) {
      if (minuteData.count >= LIMITS.perMinute) {
        return { allowed: false, retryAfter: Math.ceil((minuteData.resetAt - now) / 1000) }
      }
      minuteData.count++
    } else {
      requestCounts.set(minuteKey, { count: 1, resetAt: now + 60_000 })
    }
  } else {
    requestCounts.set(minuteKey, { count: 1, resetAt: now + 60_000 })
  }

  // Per-hour check
  const hourData = requestCounts.get(hourKey)
  if (hourData) {
    if (now < hourData.resetAt) {
      if (hourData.count >= LIMITS.perHour) {
        return { allowed: false, retryAfter: Math.ceil((hourData.resetAt - now) / 1000) }
      }
      hourData.count++
    } else {
      requestCounts.set(hourKey, { count: 1, resetAt: now + 3_600_000 })
    }
  } else {
    requestCounts.set(hourKey, { count: 1, resetAt: now + 3_600_000 })
  }

  return { allowed: true }
}

// Periodic cleanup of expired entries (every 10 minutes)
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now()
    for (const [key, data] of requestCounts.entries()) {
      if (now > data.resetAt) requestCounts.delete(key)
    }
  }
  // Only set interval in Node.js runtime (not at import time in Edge)
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, 600_000)
  }
}
