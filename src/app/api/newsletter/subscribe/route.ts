import { BREVO_TEMPLATES, getBrevoApiKey, sendTemplateEmail, upsertContact } from '@/lib/brevo'
import { NextRequest, NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    if (!getBrevoApiKey()) {
      return NextResponse.json(
        {
          error:
            'Newsletter service is not configured yet. Please add BREVO_API_KEY (or SENDINBLUE_API_KEY).',
          code: 'NEWSLETTER_NOT_CONFIGURED',
        },
        { status: 503 },
      )
    }

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
      return NextResponse.json(
        { error: 'Could not subscribe. Please try again.', code: 'NEWSLETTER_PROVIDER_ERROR' },
        { status: 502 },
      )
    }

    // Fire-and-forget welcome email — failure must not break the subscribe response.
    sendTemplateEmail({
      to: [{ email }],
      templateId: BREVO_TEMPLATES.NEWSLETTER_WELCOME,
      params: { LOCALE: locale, EMAIL: email },
    }).catch((err) => {
      console.error('[Newsletter] Welcome email failed:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Newsletter] Subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
