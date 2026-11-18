import configPromise from '@payload-config'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { cleanupExpiredHolds, sweepPendingReleases } from '@/lib/workshopHolds'

/**
 * GET /api/cron/release-holds — runs every few minutes (vercel.json).
 *
 * Gives the seats of abandoned baskets back, and finishes any release that an
 * earlier request did not complete. It is awaited here (a page view could stop the
 * function half-way), and safe to run as often as you like: a hold's seats can only
 * be given back once. Vercel sends `Authorization: Bearer $CRON_SECRET`; without the
 * secret the route refuses to run.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const payload = await getPayload({ config: configPromise })
  const expired = await cleanupExpiredHolds(payload, 100)
  const finished = await sweepPendingReleases(payload, 100)
  if (expired > 0 || finished > 0) revalidateTag('workshop-appointments')
  return NextResponse.json({ ok: true, expiredHoldsReleased: expired, unfinishedReleasesCompleted: finished })
}
