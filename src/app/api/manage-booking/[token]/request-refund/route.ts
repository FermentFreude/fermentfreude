import { NextRequest, NextResponse } from 'next/server'

import { getAdminRecipients } from '@/lib/adminNotification'
import { BREVO_TEMPLATES, sendTemplateEmail, sendTransactionalEmail } from '@/lib/brevo'
import { cancelReasonLabel, loadFreshForMutation, logActivityEvent, updateSeat } from '@/lib/manageBooking'
import { policyResultForAction, type SeatAction } from '@/lib/policyEngine'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/manage-booking/[token]/request-refund
 *  body: { seatIndex: number, reason: string }
 *
 *  ≥30-day tier only. Creates a refund-requests row (status: 'requested')
 *  — this is notify-and-reconcile (plan §8): NO Stripe API refund call
 *  happens here. A founder actions it manually in Stripe's dashboard;
 *  Stage 3's extended charge.refunded webhook reconciles this row to
 *  'completed' once they do.
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

  const action: SeatAction = bundle.options.includes('REQUEST_ORGANISER_CANCELLATION_REFUND')
    ? 'REQUEST_ORGANISER_CANCELLATION_REFUND'
    : 'REQUEST_FULL_REFUND'

  if (!bundle.options.includes(action)) {
    return NextResponse.json(
      { success: false, error: 'action_not_allowed', message: 'A refund is no longer available for this seat.' },
      { status: 409 },
    )
  }

  // Resolve the Stripe PaymentIntent ID (best-effort — founders can still
  // find the charge in Stripe by customer email/amount if this is empty).
  let stripePaymentIntentId = ''
  if (booking.cartSlug) {
    try {
      const transactions = await payload.find({
        collection: 'transactions',
        where: { cart: { equals: booking.cartSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const tx = transactions.docs[0] as unknown as { stripe?: { paymentIntentID?: string } } | undefined
      stripePaymentIntentId = tx?.stripe?.paymentIntentID ?? ''
    } catch {
      // best-effort — leave empty
    }
  }

  const pricePerPerson = typeof booking.pricePerPerson === 'number' ? booking.pricePerPerson : 0
  const requestedAmountCents = Math.round(pricePerPerson * 100)

  const refundRequest = await payload.create({
    collection: 'refund-requests',
    data: {
      booking: booking.id,
      seatIndex,
      seatId: booking.seats?.[seatIndex]?.id ?? undefined,
      policyResult: policyResultForAction(action) ?? 'full_refund',
      requestedAmount: requestedAmountCents,
      status: 'requested',
      initiatedBy: 'customer',
      stripePaymentIntentId,
      notes: `Grund: ${cancelReasonLabel(reason)}`,
    },
    overrideAccess: true,
  })

  const now = new Date().toISOString()
  await updateSeat(payload, booking, seatIndex, {
    seatStatus: 'refund_requested',
    cancelledAt: now,
    cancelledReason: reason,
    linkedRefundRequestId: refundRequest.id,
  })

  await logActivityEvent(
    payload,
    'refund_requested',
    String(refundRequest.id),
    `${booking.firstName ?? 'Gast'} ${booking.lastName ?? ''} — ${booking.workshopTitle}, €${(requestedAmountCents / 100).toFixed(2)} Erstattung angefragt`.trim(),
  )

  // ─── Customer confirmation email (best-effort) ───────────────────
  if (booking.email) {
    await sendTemplateEmail({
      to: [{ email: booking.email, name: booking.firstName ?? undefined }],
      templateId: BREVO_TEMPLATES.REFUND_INITIATED,
      params: {
        FIRST_NAME: booking.firstName || 'Gast',
        WORKSHOP_TITLE: String(booking.workshopTitle ?? ''),
        AMOUNT: `€${(requestedAmountCents / 100).toFixed(2).replace('.', ',')}`,
      },
    })
  }

  // ─── Admin alert — "action needed" (best-effort) ──────────────────
  try {
    const htmlContent = `
<p style="font-family:sans-serif;background:#FEF3C7;color:#92400E;padding:12px 16px;border-radius:8px;margin:0 0 16px">
  ⚠️ Aktion erforderlich — Rückerstattung manuell im Stripe-Dashboard ausführen.
</p>
<h2 style="font-family:sans-serif;margin-bottom:16px">Rückerstattung angefragt: €${(requestedAmountCents / 100).toFixed(2)}</h2>
<table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0;color:#555">Kund:in</td><td style="padding:4px 0">${booking.firstName ?? ''} ${booking.lastName ?? ''} ${booking.email ? `&lt;${booking.email}&gt;` : ''}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Workshop</td><td style="padding:4px 0">${booking.workshopTitle} · ${booking.date} ${booking.time}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Platz</td><td style="padding:4px 0">${seatIndex + 1}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#555">Stripe PaymentIntent</td><td style="padding:4px 0;font-family:monospace">${stripePaymentIntentId || '— nicht gefunden, bitte manuell suchen —'}</td></tr>
  <tr><td style="padding:16px 12px 4px 0;color:#555;border-top:1px solid #eee">Refund-Request-ID</td><td style="padding:16px 0 4px;border-top:1px solid #eee;font-family:monospace">${refundRequest.id}</td></tr>
</table>`
    await sendTransactionalEmail({
      to: getAdminRecipients(),
      subject: `⚠️ Rückerstattung angefragt: €${(requestedAmountCents / 100).toFixed(2)} · ${String(booking.workshopTitle ?? '')}`,
      htmlContent,
    })
  } catch (err) {
    payload.logger.error(
      `[manage-booking] Failed to send admin alert for refund request ${refundRequest.id}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  return NextResponse.json({ success: true, refundRequestId: refundRequest.id })
}
