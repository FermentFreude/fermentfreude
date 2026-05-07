import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Preview Brevo template with mock data
 * GET /api/brevo-templates/[id]/preview
 *
 * Renders the email template HTML as-is from the database with variable substitution
 * so admins can see what the email will look like
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const localeParam = request.nextUrl.searchParams.get('locale')
    const locale = (localeParam === 'en' ? 'en' : 'de') as 'de' | 'en'

    // Fetch the template
    const template = await payload.findByID({
      collection: 'brevo-templates',
      id,
      locale,
      depth: 2,
    })

    if (!template) {
      return new Response('Template not found', { status: 404 })
    }

    // Build HTML from structured fields
    let renderedHtml = buildEmailHTML(template as BrevoTemplateDoc)

    // Mock data for different template types
    const mockVariables: Record<string, string> = {
      FIRST_NAME: 'Max',
      ORDER_NUMBER: '12345',
      ITEMS: 'Tempeh Starter Kit (1x €24,99)',
      SUBTOTAL: '€24,99',
      SHIPPING: '€5,00',
      TOTAL: '€29,99',
      SHIPPING_ADDRESS: 'Max Mustermann, Musterstraße 1, 8010 Graz, Österreich',
      ORDER_URL: 'https://fermentfreude.at/orders/12345',
      TRACKING_NUMBER: 'DHL123456789',
      CARRIER: 'DHL',
      ESTIMATED_DELIVERY: locale === 'de' ? 'Ab 18:00 Uhr' : 'By 6:00 PM',
      TRACKING_URL: 'https://tracking.dhl.com/123456789',
      WORKSHOP_NAME: locale === 'de' ? 'Tempeh Workshop' : 'Tempeh Workshop',
      WORKSHOP_DATE: '25. April 2026',
      WORKSHOP_TIME: '18:00',
      LOCATION: 'Wien, Österreich',
      WORKSHOP_URL: 'https://fermentfreude.at/workshops/tempeh',
      CONTACT_URL: 'https://fermentfreude.at/contact',
      PREFERENCES_URL: 'https://fermentfreude.at/preferences',
      PRODUCT_NAME: locale === 'de' ? 'Tempeh Starter Kit' : 'Tempeh Starter Kit',
      REVIEW_URL: 'https://fermentfreude.at/reviews/tempeh-starter',
      CART_ITEMS: 'Tempeh Starter Kit (1x €24,99)',
      CART_TOTAL: '€24,99',
      CART_URL: 'https://fermentfreude.at/cart',
      LOYALTY_POINTS: '250',
      REWARDS_URL: 'https://fermentfreude.at/loyalty',
      OFFER_NAME: locale === 'de' ? '20% Rabatt auf alles' : '20% Off Everything',
      DISCOUNT_PERCENTAGE: '20',
      OFFER_EXPIRES: '30. April 2026',
      COUPON_CODE: 'SAVE20',
      OFFER_URL: 'https://fermentfreude.at/offers',
      REFUND_AMOUNT: '€29,99',
      REFUND_STATUS: locale === 'de' ? 'Verarbeitet' : 'Processed',
      MESSAGE:
        locale === 'de'
          ? 'Ich hätte gerne mehr Informationen...'
          : 'I would like more information...',
    }

    // Replace all {{ VARIABLE_NAME }} with mock data
    Object.entries(mockVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      renderedHtml = renderedHtml.replace(regex, value)
    })

    // Extract subject from title tag
    let subject = 'Email Preview'
    const titleMatch = renderedHtml.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      subject = titleMatch[1].replace('FermentFreude — ', '').trim()
    }

    // Wrap in a full page for display
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .preview-info {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #1565c0;
    }
    .email-preview {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="preview-info">
      <strong>📧 Template Preview:</strong> ${subject}
    </div>
    <div class="email-preview">
      ${renderedHtml}
    </div>
  </div>
</body>
</html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(`Error: ${message}`, { status: 500 })
  }
}

type BrevoTemplateDoc = {
  subject?: string
  heroIcon?: string
  heroHeading?: string
  heroSubheading?: string
  greeting?: string
  bodySection1?: string
  bodySection2?: string
  bodySection3?: string
  bodySection4?: string
  ctaHeading?: string
  ctaText?: string
  ctaUrl?: string
  ctaDescription?: string
  footerContent?: string
}

/**
 * Build HTML from structured email template fields
 */
function buildEmailHTML(doc: BrevoTemplateDoc): string {
  const subject = doc.subject || ''
  const heroIcon = doc.heroIcon || '📧'
  const heading = doc.heroHeading || ''
  const subheading = doc.heroSubheading || ''
  const greeting = doc.greeting || ''
  const body1 = doc.bodySection1 || ''
  const body2 = doc.bodySection2 || ''
  const body3 = doc.bodySection3 || ''
  const body4 = doc.bodySection4 || ''
  const ctaHeading = doc.ctaHeading || ''
  const ctaText = doc.ctaText || 'Ansehen'
  const ctaUrl = doc.ctaUrl || '#'
  const ctaDesc = doc.ctaDescription || ''
  const footer = doc.footerContent || ''

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>FermentFreude — ${subject}</title>
  <style>
    * { margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; }
    body { background-color: #f9f0dc; padding: 40px 0; }
    table { border-collapse: collapse; }
    td { padding: 0; }
    a { color: #e5b765; text-decoration: none; }
  </style>
</head>
<body>
  <center style="width: 100%;">
    <div style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden;">
      <table width="100%">
        <tr>
          <td style="padding: 32px 40px; background: #1a1a1a; text-align: center;">
            <img src="https://pub-0cf8a1c18a9a4cde9e56a0a34e600307.r2.dev/media/fermentfreude-logo-light.png" 
                 alt="FermentFreude" width="180" style="width: 180px; max-width: 100%; height: auto;" />
          </td>
        </tr>
      </table>

      <table width="100%">
        <tr>
          <td style="padding: 48px 40px 16px; text-align: center;">
            <div style="width: 64px; height: 64px; background: #f9f0dc; border-radius: 50%; line-height: 64px; font-size: 28px; margin: 0 auto 24px;">${heroIcon}</div>
            <h1 style="font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px;">${heading}</h1>
            ${subheading ? `<p style="color: #595959; font-size: 16px; line-height: 1.6; margin: 0;">${subheading}</p>` : ''}
          </td>
        </tr>
      </table>

      <table width="100%">
        <tr>
          <td style="padding: 24px 40px; color: #595959; font-size: 16px; line-height: 1.6;">
            ${greeting ? `<p style="margin: 0 0 16px;">${greeting}</p>` : ''}
            ${body1 ? `<p style="margin: 0 0 16px;">${body1}</p>` : ''}
            ${body2 ? `<p style="margin: 0 0 16px;">${body2}</p>` : ''}
            ${body3 ? `<p style="margin: 0 0 16px;">${body3}</p>` : ''}
            ${body4 ? `<p style="margin: 0 0 16px;">${body4}</p>` : ''}
          </td>
        </tr>
      </table>

      <table width="100%">
        <tr>
          <td style="padding: 24px 40px; text-align: center;">
            ${ctaHeading ? `<h2 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px;">${ctaHeading}</h2>` : ''}
            <a href="${ctaUrl}" 
               style="background: #e5b765; color: #ffffff; padding: 14px 36px; border-radius: 40px; font-weight: 700; font-size: 15px; display: inline-block; text-decoration: none;">
              ${ctaText}
            </a>
            ${ctaDesc ? `<p style="color: #595959; font-size: 13px; margin: 12px 0 0;">${ctaDesc}</p>` : ''}
          </td>
        </tr>
      </table>

      <table width="100%">
        <tr>
          <td style="padding: 32px 40px; background: #f5f5f5; text-align: center; color: #595959; font-size: 13px; line-height: 1.6;">
            ${footer}
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>`
}
