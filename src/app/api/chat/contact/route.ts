import { NextRequest, NextResponse } from 'next/server'

import { getAdminRecipients } from '@/lib/adminNotification'
import { sendTransactionalEmail } from '@/lib/brevo'
import { contactLimited } from '@/lib/chat-assistant/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/chat/contact — "Ask our team" form inside the chat window.
 *
 * Body: { name, email, message, locale?, transcript?: { role, content }[], website?: '' }
 * Sends one email to the admin recipients (ADMIN_NOTIFICATION_EMAIL) with
 * Reply-To set to the visitor, so the team can answer straight from their inbox.
 * Nothing is stored. `website` is a honeypot: bots fill it, people don't see it.
 */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await contactLimited(ip)) {
    return NextResponse.json({ error: 'Too many messages', code: 'RATE_LIMITED' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    const parsed: unknown = await request.json()
    if (!parsed || typeof parsed !== 'object') throw new Error('not an object')
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot filled → pretend success so bots don't retry.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true })
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : ''
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
  const locale = body.locale === 'en' ? 'en' : 'de'

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Valid email is required', code: 'INVALID_EMAIL' }, { status: 400 })
  }
  if (!message) {
    return NextResponse.json({ error: 'Message is required', code: 'INVALID_MESSAGE' }, { status: 400 })
  }

  // The last few chat messages, so the team sees what the visitor already asked.
  const transcript = Array.isArray(body.transcript)
    ? body.transcript
        .slice(-8)
        .filter(
          (m): m is { role: 'user' | 'assistant'; content: string } =>
            !!m &&
            typeof m === 'object' &&
            ((m as { role?: unknown }).role === 'user' || (m as { role?: unknown }).role === 'assistant') &&
            typeof (m as { content?: unknown }).content === 'string',
        )
        .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }))
    : []

  const transcriptHtml = transcript.length
    ? `<hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0"/>
       <p style="font-weight:700;margin:0 0 0.5rem">Chat-Verlauf</p>
       ${transcript
         .map(
           (m) =>
             `<p style="margin:0 0 0.5rem;color:${m.role === 'user' ? '#1a1a1a' : '#777'}"><strong>${
               m.role === 'user' ? 'Besucher:in' : 'Assistent'
             }:</strong> ${escapeHtml(m.content).replace(/\n/g, '<br/>')}</p>`,
         )
         .join('')}`
    : ''

  const result = await sendTransactionalEmail({
    to: getAdminRecipients(),
    replyTo: { email, ...(name ? { name } : {}) },
    subject: `Chat-Frage von ${name || email}`,
    htmlContent: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:2rem;color:#1a1a1a;line-height:1.6">
        <p style="font-size:1.1rem;font-weight:700;margin:0 0 1rem">Neue Frage aus dem Website-Chat</p>
        <p style="margin:0">Name: <strong>${escapeHtml(name || '–')}</strong></p>
        <p style="margin:0">E-Mail: <strong>${escapeHtml(email)}</strong></p>
        <p style="margin:0 0 1rem">Sprache: ${locale.toUpperCase()}</p>
        <p style="white-space:pre-wrap;background:#f6f3f0;border-radius:8px;padding:1rem;margin:0">${escapeHtml(message)}</p>
        ${transcriptHtml}
        <p style="margin-top:2rem;font-size:0.85rem;color:#999">Einfach auf diese E-Mail antworten, die Antwort geht direkt an ${escapeHtml(email)}.</p>
      </div>`,
  })

  if (!result.success) {
    return NextResponse.json({ error: 'Could not send', code: 'SEND_FAILED' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
