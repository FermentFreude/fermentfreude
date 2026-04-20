import { upsertContact } from '@/lib/brevo'
import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const locale = body.locale === 'en' ? 'en' : 'de'

    const result = await upsertContact({
      email,
      attributes: {
        LOCALE: locale,
        SOURCE: 'newsletter_footer',
      },
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Newsletter] Subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
