import { sendTransactionalEmail } from '@/lib/brevo'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  POST /api/contact
 *
 *  Public endpoint behind the website contact forms (/contact, /about,
 *  /gastronomy). Order matters:
 *    1. save the message in `contact-messages` (safety net)
 *    2. email it to the team inbox with Reply-To = the customer
 *    3. email accepted by Brevo → DELETE the saved copy (Rafaela's rule:
 *       messages must not pile up in the free-tier Atlas DB). Only messages
 *       whose email failed stay in the collection, for the founders to see.
 *  The visitor sees success as soon as EITHER step 1 or step 2 worked.
 *
 *  Abuse: the only email goes to our own inbox (no auto-reply to the
 *  address typed in), so this cannot be used to spam third parties.
 *  A honeypot field (`website`) silently drops simple bots.
 * ═══════════════════════════════════════════════════════════════ */

const TEAM_INBOX = process.env.CONTACT_FORM_TO || 'kontakt@fermentfreude.at'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function str(v: unknown, max: number): string {
  return typeof v === 'string'
    ? v
        .replace(/\u0000/g, '')
        .trim()
        .slice(0, max)
    : ''
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    const parsed = await req.json()
    if (typeof parsed !== 'object' || parsed === null) throw new Error('bad body')
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // Honeypot: real visitors never see or fill this field.
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true })
  }

  const source = body.source === 'gastronomy' ? 'gastronomy' : 'contact'
  const name = str(body.name, 120)
  const email = str(body.email, 254).toLowerCase()
  const phone = str(body.phone, 40)
  const company = str(body.company, 160)
  const subject = str(body.subject, 160)
  const message = str(body.message, 5000)
  const pagePath = str(body.pagePath, 200)
  const locale = body.locale === 'en' ? 'en' : 'de'
  const detailsObj =
    typeof body.details === 'object' && body.details !== null
      ? (body.details as Record<string, unknown>)
      : {}
  const details = Object.entries(detailsObj)
    .slice(0, 10)
    .map(([k, v]) => [str(k, 40), str(v, 300)] as const)
    .filter(([k, v]) => k && v)

  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'email_invalid' }, { status: 400 })
  if (source === 'contact' && !message) {
    return NextResponse.json({ error: 'message_required' }, { status: 400 })
  }

  const detailsText = details.map(([k, v]) => `${k}: ${v}`).join('\n')

  // 1. Save first.
  let savedId: string | null = null
  let payload: Awaited<ReturnType<typeof getPayload>> | null = null
  try {
    payload = await getPayload({ config: configPromise })
    const doc = await payload.create({
      collection: 'contact-messages',
      data: {
        source,
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
        subject: subject || undefined,
        message: message || undefined,
        details: detailsText || undefined,
        pagePath: pagePath || undefined,
        locale,
      },
    })
    savedId = String(doc.id)
  } catch (err) {
    console.error('[contact] could not save message:', err instanceof Error ? err.message : err)
  }

  // 2. Email the team.
  const label = source === 'gastronomy' ? 'Gastronomie-Anfrage' : 'Kontaktanfrage'
  const row = (k: string, v: string) =>
    v
      ? `<tr><td style="padding:4px 12px 4px 0;color:#777;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0;color:#1a1a1a">${esc(v)}</td></tr>`
      : ''
  const htmlContent = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
      <p style="font-size:18px;font-weight:700;margin:0 0 4px">Neue ${label} über die Website</p>
      <p style="color:#777;margin:0 0 20px;font-size:14px">Einfach auf „Antworten" klicken – die Antwort geht direkt an ${esc(name)}.</p>
      <table style="border-collapse:collapse;font-size:15px;margin-bottom:20px">
        ${row('Name', name)}
        ${row('E-Mail', email)}
        ${row('Telefon', phone)}
        ${row('Firma', company)}
        ${row('Betreff', subject)}
        ${details.map(([k, v]) => row(k, v)).join('')}
        ${row('Seite', pagePath)}
        ${row('Sprache', locale.toUpperCase())}
      </table>
      ${
        message
          ? `<div style="background:#F6F0E8;border-radius:8px;padding:16px;font-size:15px;line-height:1.6;white-space:pre-wrap">${esc(message)}</div>`
          : ''
      }
    </div>`

  const mail = await sendTransactionalEmail({
    to: [{ email: TEAM_INBOX, name: 'Fermentfreude' }],
    replyTo: { email, name },
    subject: `${label}: ${subject || name}`.slice(0, 180),
    htmlContent,
  })
  const emailed = mail.success && !mail.blocked

  // 3. Email is out → the saved copy is no longer needed.
  if (savedId && payload && emailed) {
    try {
      await payload.delete({ collection: 'contact-messages', id: savedId })
    } catch (err) {
      console.error(
        '[contact] email sent but could not delete saved copy',
        savedId,
        err instanceof Error ? err.message : err,
      )
    }
  }

  if (!savedId && !emailed) {
    console.error('[contact] message LOST — neither saved nor emailed', { source, email })
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }

  if (!emailed)
    console.error('[contact] email to team FAILED — kept in contact-messages', { id: savedId })
  return NextResponse.json({ ok: true })
}
