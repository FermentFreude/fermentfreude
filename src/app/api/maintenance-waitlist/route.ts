import { NextRequest, NextResponse } from 'next/server'
import { upsertContact, sendTransactionalEmail } from '@/lib/brevo'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, phone, interest } = body as Record<string, unknown>

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const safeName = name.trim().slice(0, 100)
  const safeEmail = email.trim().toLowerCase().slice(0, 254)
  const safePhone =
    typeof phone === 'string' && phone.trim()
      ? phone.trim().replace(/[^\d\s+\-().]/g, '').slice(0, 30)
      : ''
  const WORKSHOP_LABELS: Record<string, string> = {
    basics: 'Fermentation Basics',
    kombucha: 'Kombucha',
    lakto: 'Laktofermentation',
    tempeh: 'Tempeh',
  }
  const safeInterest =
    typeof interest === 'string' && Object.prototype.hasOwnProperty.call(WORKSHOP_LABELS, interest)
      ? interest
      : ''

  await upsertContact({
    email: safeEmail,
    firstName: safeName,
    attributes: {
      ...(safePhone ? { SMS: safePhone } : {}),
      ...(safeInterest ? { WORKSHOP_INTEREST: safeInterest } : {}),
      SIGNUP_SOURCE: 'maintenance-page',
    },
  })

  const workshopLabel = safeInterest ? WORKSHOP_LABELS[safeInterest] : ''
  const phoneLine = safePhone
    ? `<p style="color:#555;font-size:0.95rem">Telefon: <strong>${safePhone}</strong></p>`
    : ''
  const workshopLine = workshopLabel
    ? `<p style="color:#555;font-size:0.95rem">Workshop-Interesse: <strong>${workshopLabel}</strong></p>`
    : ''

  await sendTransactionalEmail({
    to: [{ email: safeEmail, name: safeName }],
    subject: "Wir melden uns bald bei dir / We'll be in touch shortly",
    htmlContent: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:2rem;color:#1a1a1a">
        <p style="font-size:1.1rem;font-weight:700;margin-bottom:0.25rem">Hallo ${safeName},</p>
        <p style="color:#555;line-height:1.6">
          vielen Dank f&uuml;r deine Nachricht! Wir sind derzeit kurz offline, melden uns aber so
          schnell wie m&ouml;glich bei dir, um deinen Workshop-Platz zu besprechen.
        </p>
        ${phoneLine}
        ${workshopLine}
        <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0"/>
        <p style="color:#888;font-size:0.9rem;line-height:1.6">
          <em>Hi ${safeName}, thanks for reaching out! We are temporarily offline but will
          get back to you shortly to help you book your workshop spot.</em>
        </p>
        <p style="margin-top:2rem;font-size:0.8rem;color:#bbb">
          FermentFreude &middot; Du erh&auml;ltst diese E-Mail, weil du dich auf fermentfreude.at angemeldet hast.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
