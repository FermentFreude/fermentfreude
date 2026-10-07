import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { sendDueWorkshopReminders } from '@/lib/workshopReminders'
import config from '@/payload.config'

/**
 * GET /api/emails/workshop-reminders
 *
 * Called once a day by Vercel Cron (vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is set
 * on the project — without it this route refuses to run, so nobody else can
 * trigger email sends. See src/lib/workshopReminders.ts for who gets what.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  try {
    const summary = await sendDueWorkshopReminders(payload)
    payload.logger.info(
      `[Workshop reminders] appointments=${summary.appointments} bookings=${summary.bookings} sent=${summary.sent} failed=${summary.failed}`,
    )
    if (summary.errors.length > 0) {
      payload.logger.error(`[Workshop reminders] ${summary.errors.join(' | ')}`)
    }
    return NextResponse.json(summary)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    payload.logger.error(`[Workshop reminders] Failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
