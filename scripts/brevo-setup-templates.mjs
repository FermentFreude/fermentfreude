#!/usr/bin/env node

/**
 * Setup Brevo Email Templates Programmatically
 * 
 * Usage: pnpm brevo-setup-templates
 * or: node scripts/brevo-setup-templates.mjs
 * 
 * This script creates all 19 email templates in your Brevo account
 * using the Brevo API. All templates are set to Active status.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Template configuration - All 19 templates
const TEMPLATES = [
  // Transactional (4)
  {
    id: 1,
    name: 'ACCOUNT_CREATION',
    templateName: 'Account Creation',
    htmlFile: 'public/email-templates/01-account-creation.html',
    subject: 'Willkommen bei FermentFreude — {{params.CUSTOMER_NAME}}',
    category: 'Transactional',
  },
  {
    id: 2,
    name: 'EMAIL_VERIFICATION',
    templateName: 'Email Verification',
    htmlFile: 'public/email-templates/02-email-verification.html',
    subject: 'Verifiziere deine E-Mail Adresse',
    category: 'Transactional',
  },
  {
    id: 3,
    name: 'PASSWORD_RESET',
    templateName: 'Password Reset',
    htmlFile: 'public/email-templates/03-password-reset.html',
    subject: 'Passwort zurücksetzen — FermentFreude',
    category: 'Transactional',
  },
  {
    id: 4,
    name: 'LOGIN_NOTIFICATION',
    templateName: 'Login Notification',
    htmlFile: 'public/email-templates/04-login-notification.html',
    subject: 'Neue Anmeldung in deinem FermentFreude Konto',
    category: 'Transactional',
  },
  // Workshop (5)
  {
    id: 5,
    name: 'WORKSHOP_BOOKING_CONFIRMATION',
    templateName: 'Workshop Booking Confirmation',
    htmlFile: 'public/email-templates/05-workshop-booking-confirmation.html',
    subject: 'Workshop Buchung bestätigt — {{params.BOOKING_ID}}',
    category: 'Workshop',
  },
  {
    id: 6,
    name: 'WORKSHOP_7DAY_REMINDER',
    templateName: 'Workshop 7-Day Reminder',
    htmlFile: 'public/email-templates/06-workshop-7day-reminder.html',
    subject: 'Erinnerung: Dein Workshop in 7 Tagen — {{params.WORKSHOP_TITLE}}',
    category: 'Workshop',
  },
  {
    id: 7,
    name: 'WORKSHOP_1DAY_REMINDER',
    templateName: 'Workshop 1-Day Reminder',
    htmlFile: 'public/email-templates/07-workshop-1day-reminder.html',
    subject: 'Erinnerung: Dein Workshop morgen — {{params.WORKSHOP_TITLE}}',
    category: 'Workshop',
  },
  {
    id: 8,
    name: 'POST_WORKSHOP_FOLLOWUP',
    templateName: 'Post-Workshop Follow-up',
    htmlFile: 'public/email-templates/08-post-workshop-followup.html',
    subject: 'Danke für deine Teilnahme — {{params.WORKSHOP_TITLE}}',
    category: 'Workshop',
  },
  {
    id: 9,
    name: 'FEEDBACK_REQUEST',
    templateName: 'Feedback Request',
    htmlFile: 'public/email-templates/09-feedback-request.html',
    subject: 'Deine Meinung zählt — Feedback zu {{params.WORKSHOP_TITLE}}',
    category: 'Workshop',
  },
  // E-commerce (4)
  {
    id: 10,
    name: 'ORDER_CONFIRMATION',
    templateName: 'Order Confirmation',
    htmlFile: 'public/email-templates/10-order-confirmation.html',
    subject: 'Deine Bestellung bei FermentFreude — {{params.ORDER_ID}}',
    category: 'E-commerce',
  },
  {
    id: 11,
    name: 'SHIPPING_NOTIFICATION',
    templateName: 'Shipping Notification',
    htmlFile: 'public/email-templates/11-shipping-notification.html',
    subject: 'Deine Bestellung ist unterwegs — {{params.ORDER_ID}}',
    category: 'E-commerce',
  },
  {
    id: 12,
    name: 'REVIEW_REQUEST',
    templateName: 'Review Request',
    htmlFile: 'public/email-templates/12-review-request.html',
    subject: 'Bewerte deine Bestellung — {{params.ORDER_ID}}',
    category: 'E-commerce',
  },
  {
    id: 13,
    name: 'ABANDONED_CART',
    templateName: 'Abandoned Cart',
    htmlFile: 'public/email-templates/13-abandoned-cart.html',
    subject: 'Du hast etwas in deinem Warenkorb — {{params.PRODUCT_COUNT}} Artikel warten',
    category: 'E-commerce',
  },
  // Marketing (5)
  {
    id: 14,
    name: 'NEWSLETTER_WELCOME',
    templateName: 'Newsletter Welcome',
    htmlFile: 'public/email-templates/14-newsletter-welcome.html',
    subject: 'Willkommen zu unserem Newsletter',
    category: 'Marketing',
  },
  {
    id: 15,
    name: 'COURSE_ENROLLMENT',
    templateName: 'Course Enrollment',
    htmlFile: 'public/email-templates/15-course-enrollment.html',
    subject: 'Kurs-Registrierung erfolgreich — {{params.COURSE_SLUG}}',
    category: 'Marketing',
  },
  {
    id: 16,
    name: 'B2B_INQUIRY',
    templateName: 'B2B Inquiry',
    htmlFile: 'public/email-templates/16-b2b-inquiry.html',
    subject: 'B2B Anfrage erhalten — {{params.COMPANY_NAME}}',
    category: 'Marketing',
  },
  {
    id: 17,
    name: 'RE_ENGAGEMENT',
    templateName: 'Re-Engagement',
    htmlFile: 'public/email-templates/17-re-engagement.html',
    subject: 'Wir vermissen dich — Komm zurück zu FermentFreude',
    category: 'Marketing',
  },
  {
    id: 18,
    name: 'REFERRAL_PROGRAM',
    templateName: 'Referral Program',
    htmlFile: 'public/email-templates/18-referral-program.html',
    subject: 'Empfehle FermentFreude und verdiene {{params.REWARD_AMOUNT}}',
    category: 'Marketing',
  },
  // Custom
  {
    id: 19,
    name: 'VOUCHER_PURCHASED',
    templateName: 'Voucher Purchased',
    htmlFile: 'public/email-templates/19-voucher-purchased.html',
    subject: 'Dein Gutschein — {{params.VOUCHER_CODE}}',
    category: 'Custom',
  },
]

/**
 * Get Brevo API key from .env files
 */
function getBrevoApiKey() {
  const envFile = path.join(projectRoot, '.env')
  try {
    const content = readFileSync(envFile, 'utf8')
    const match = content.match(/BREVO_API_KEY=(.+)/)
    if (match) {
      return match[1].trim()
    }
  } catch (e) {
    // Continue if file doesn't exist
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error(
      'BREVO_API_KEY not found in .env file or environment variables. ' +
      'Add it to .env: BREVO_API_KEY=xkeysib-...',
    )
  }
  return apiKey
}

/**
 * Read HTML file content
 */
function readTemplateHTML(htmlFile) {
  const filePath = path.join(projectRoot, htmlFile)
  try {
    return readFileSync(filePath, 'utf8')
  } catch (error) {
    throw new Error(`Failed to read template file ${htmlFile}: ${error.message}`)
  }
}

/**
 * Create a template via Brevo API
 */
async function createTemplate(apiKey, template) {
  const htmlContent = readTemplateHTML(template.htmlFile)

  if (htmlContent.length < 10) {
    throw new Error(`Template HTML too short (< 10 chars): ${template.htmlFile}`)
  }

  const payload = {
    templateName: template.templateName,
    subject: template.subject,
    sender: {
      email: process.env.BREVO_SENDER_EMAIL || 'kontakt@fermentfreude.at',
      name: process.env.BREVO_SENDER_NAME || 'Fermentfreude',
    },
    htmlContent,
    isActive: true, // Set to active immediately
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(
      `Brevo API error (${response.status}): ${errorData}`,
    )
  }

  const data = await response.json()
  return data.id
}

/**
 * Main setup function
 */
async function setupTemplates() {
  console.log('🚀 FermentFreude Brevo Templates Setup')
  console.log('━'.repeat(50))

  const apiKey = getBrevoApiKey()
  console.log(`✓ API key found: ${apiKey.slice(0, 20)}...`)
  console.log()

  const results = []

  for (const template of TEMPLATES) {
    process.stdout.write(`[${template.id}/${TEMPLATES.length}] Creating template: ${template.templateName}... `)

    try {
      const templateId = await createTemplate(apiKey, template)
      console.log(`✅ Created (ID: ${templateId})`)
      results.push({
        name: template.name,
        templateName: template.templateName,
        brevoId: templateId,
        status: 'success',
      })
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)
      results.push({
        name: template.name,
        templateName: template.templateName,
        status: 'failed',
        error: error.message,
      })
    }

    // Small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log()
  console.log('━'.repeat(50))
  console.log('📊 Summary')
  console.log('━'.repeat(50))

  const successful = results.filter((r) => r.status === 'success')
  const failed = results.filter((r) => r.status === 'failed')

  console.log(`✅ Successful: ${successful.length}/${TEMPLATES.length}`)
  if (successful.length > 0) {
    // Group by category for better visualization
    const categories = {}
    successful.forEach((r) => {
      const template = TEMPLATES.find((t) => t.name === r.name)
      if (!categories[template.category]) {
        categories[template.category] = []
      }
      categories[template.category].push(`   • ${r.templateName} (Brevo ID: ${r.brevoId})`)
    })

    Object.entries(categories).forEach(([category, items]) => {
      console.log(`\n${category}:`)
      items.forEach((item) => console.log(item))
    })
  }
      console.log(`   • ${r.name} (Brevo ID: ${r.brevoId})`)
    })
  }

  if (failed.length > 0) {
    console.log()
    console.log(`❌ Failed: ${failed.length}/${TEMPLATES.length}`)
    failed.forEach((r) => {
      console.log(`   • ${r.name}: ${r.error}`)
    })
  }

  console.log()
  if (failed.length === 0) {
    console.log('✨ All templates created successfully!')
    console.log()
    console.log('Next steps:')
    console.log('1. Test an order: go to http://localhost:3001/workshops/tempeh')
    console.log('2. Add to cart and complete checkout')
    console.log('3. Check your email for confirmation emails')
    console.log('4. View delivery logs: https://app.brevo.com/transactional/logs')
  } else {
    console.log('⚠️  Some templates failed. Check errors above.')
    process.exit(1)
  }
}

// Run setup
setupTemplates().catch((error) => {
  console.error('❌ Fatal error:', error.message)
  process.exit(1)
})
