import { revalidateTag } from 'next/cache'

/**
 * The public workshop pages cache the free-seat numbers (tag 'workshop-appointments').
 * Dashboard actions that change seats call this so the website shows the new numbers
 * right away instead of after the 2-minute cache. Best-effort and only for server
 * actions — outside a Next.js request there is nothing to refresh.
 */
export function refreshPublicAvailability(): void {
  try {
    revalidateTag('workshop-appointments')
  } catch {
    /* not inside a Next.js request */
  }
}
