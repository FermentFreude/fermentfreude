import { NextRequest, NextResponse } from 'next/server'
import { upsertContact, sendTransactionalEmail } from '@/lib/brevo'

const WORKSHOP_LABELS: Record<string, string> = {
  basics: 'Fermentation Basics',
  kombucha: 'Kombucha',
  lakto: 'Laktofermentation',
  tempeh: 'Tempeh',
  produkte: 'Produkte / Shop',
  alles: 'Alles / Everything',
}

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

  const { name, email, interest } = body as Record<string, unknown>

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const safeName = name.trim().slice(0, 100)
  const safeEmail = email.trim().toLowerCase().slice(0, 254)
  const safeInterest =
    typeof interest === 'string' && Object.prototype.hasOwnProperty.call(WORKSHOP_LABELS, interest)
      ? interest
      : ''

  // Upsert contact into Brevo (adds to general list; WAITLIST_ID optional)
  await upsertContact({
    email: safeEmail,
    firstName: safeName,
    attributes: {
      ...(safeInterest ? { WORKSHOP_INTEREST: safeInterest } : {}),
      SIGNUP_SOURCE: 'maintenance-page',
    },
  })

  // Send a friendly confirmation email
  const workshopLabel = safeInterest ? WORKSHOP_LABELS[safeInterest] : null
  const workshopLine = workshopLabel
    ? `<p style="color:#555;font-size:0.95rem">Dein Workshop-Interesse: <strong>${workshopLabel}</strong></p>`
    : ''

  await sendTransactionalEmail({
    to: [{ email: safeEmail, name: safeName }],
    subject: "Wir melden uns, wenn wir \u00f6ffnen \uD83C\uDF31 / We'll notify you when we launch",
    htmlContent: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:2rem;color:#1a1a1a">
        <p style="font-size:1.1rem;font-weight:700;margin-bottom:0.25rem">Hallo ${safeName},</p>
        <p style="color:#555;line-height:1.6">
          danke für dein Interesse an FermentFreude! Wir öffnen bald unseren Shop und
          unser Workshop-Programm — du bekommst eine Nachricht, sobald es soweit ist.
        </p>
        ${workshopLine}
        <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0"/>
        <p style="color:#888;font-size:0.9rem;line-height:1.6">
          <em>Hi ${safeName}, thanks for signing up! We'll notify you the moment FermentFreude launches.
          ${workshopLabel ? `Workshop interest noted: ${workshopLabel}.` : ''}</em>
        </p>
        <p style="margin-top:2rem;font-size:0.8rem;color:#bbb">
          FermentFreude · Du erhältst diese E-Mail, weil du dich auf fermentfreude.at angemeldet hast.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
