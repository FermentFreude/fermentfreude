import { NextRequest, NextResponse } from 'next/server'

import { getAdminRecipients } from '@/lib/adminNotification'
import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'
import { cancelReasonLabel, loadFreshForMutation, logActivityEvent, updateSeat } from '@/lib/manageBooking'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/manage-booking/[token]/cancel-no-refund
 *  body: { seatIndex: number, reason: string }
 *
 *  <14-day tier (or no-show/past): acknowledges the cancellation with
 *  no refund and no rebooking — the only action CANCEL_NO_REFUND
 *  offers. Does NOT set selfRebookingUsed (no entitlement was
 *  available to use in the first place).
 * ═══════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let body: { seatIndex?: unknown; reason?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const seatIndex = typeof body.seatIndex === 'number' ? body.seatIndex : NaN
  const reason = typeof body.reason === 'string' ? body.reason : 'other'

  if (!Number.isInteger(seatIndex) || seatIndex < 0) {
    return NextResponse.json({ success: false, error: 'Invalid seatIndex' }, { status: 400 })
  }

  const loaded = await loadFreshForMutation(token, seatIndex)
  if (loaded.error) {
    const status = loaded.error === 'expired' ? 410 : 404
    return NextResponse.json({ success: false, error: loaded.error }, { status })
  }

  const { payload, booking, bundle } = loaded

  if (!bundle.options.includes('CANCEL_NO_REFUND')) {
    return NextResponse.json(
      { success: false, error: 'action_not_allowed', message: 'This action is no longer available for this seat.' },
      { status: 409 },
    )
  }

  const now = new Date().toISOString()
  await updateSeat(payload, booking, seatIndex, {
    seatStatus: 'cancelled_no_refund',
    cancelledAt: now,
    cancelledReason: reason,
  })

  await logActivityEvent(
    payload,
    'booking_cancelled_no_refund',
    String(booking.id),
    `${booking.firstName ?? 'Gast'} ${booking.lastName ?? ''} — ${booking.workshopTitle}, Platz ${seatIndex + 1}: storniert ohne Erstattung`.trim(),
  )

  // ─── Customer confirmation email (best-effort) ───────────────────
  if (booking.email) {
    await sendTemplateEmail({
      to: [{ email: booking.email, name: booking.firstName ?? undefined }],
      templateId: BREVO_TEMPLATES.CUSTOMER_CANCELLED_NO_REFUND,
      params: {
        FIRST_NAME: booking.firstName || 'Gast',
        WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
        WORKSHOP_DATE: String(booking.date ?? ''),
        WORKSHOP_TIME: String(booking.time ?? ''),
        REASON: cancelReasonLabel(reason),
      },
    })
  }

  // ─── Admin alert (best-effort) ────────────────────────────────────
  try {
    const htmlContent = `
<h2 style="font-family:sans-serif;margin-bottom:16px">Stornierung ohne Erstattung: ${String(booking.workshopTitle ?? '')}</h2>
<table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#555">Kund:in</td><td style="padding:4px 0">${booking.firstName ?? ''} ${booking.lastName ?? ''} ${booking.email ? `&lt;${booking.email}&gt;` : ''}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Workshop</td><td style="padding:4px 0">${booking.workshopTitle} · ${booking.date} ${booking.time}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Platz</td><td style="padding:4px 0">${seatIndex + 1}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Grund</td><td style="padding:4px 0">${cancelReasonLabel(reason)}</td></tr>
</table>`
    await sendTransactionalEmail({
      to: getAdminRecipients(),
      subject: `Stornierung ohne Erstattung: ${String(booking.workshopTitle ?? '')}`,
      htmlContent,
    })
  } catch (err) {
    payload.logger.error(
      `[manage-booking] Failed to send admin alert for cancel-no-refund on booking ${booking.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return NextResponse.json({ success: true })
}
