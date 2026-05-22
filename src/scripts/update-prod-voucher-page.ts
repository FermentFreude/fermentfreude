/**
 * update-prod-voucher-page.ts
 *
 * One-off: update the production voucher page CMS content to reflect
 * that vouchers are workshop-only (not products/shop) and are delivered
 * by email only (no VERSANDART / postal-shipping section).
 *
 * Changes (DE + EN):
 *   - deliveryOptions: replace old email/pickup types with email-recipient / email-self
 *   - deliverySectionLabel: VERSANDART → ZUSTELLUNG / DELIVERY
 *   - deliveryDisclaimer: remove postal-shipping text
 *   - cardDisclaimer: "Einlösbar in unserem Shop" → workshops only
 *   - heroDescription: remove "Wähle einen Betrag" (only one amount: €99)
 *   - FAQs: remove references to products / online-courses / top-ups
 *
 * Usage:
 *   DATABASE_URL="$(grep '^PROD_DATABASE_URL=' .env | cut -d= -f2-)" \
 *   R2_BUCKET="$(grep '^PROD_R2_BUCKET=' .env | cut -d= -f2-)" \
 *   pnpm tsx src/scripts/update-prod-voucher-page.ts          # dry-run
 *
 *   ... same env ... --force  # apply
 */

import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const DRY_RUN = !process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

async function run() {
  const payload = await getPayload({ config })

  const dbUrl = process.env.DATABASE_URL ?? ''
  const dbName = dbUrl.split('/').pop()?.split('?')[0] ?? '(unknown)'
  console.log(`\n🔌 Connected to MongoDB database: ${dbName}`)

  if (dbName !== 'fermentfreude') {
    console.error(`\n🛑 Expected production database "fermentfreude" but got "${dbName}". Aborting.`)
    process.exit(1)
  }

  console.log(
    DRY_RUN
      ? '\n⚠️  DRY-RUN — no writes. Re-run with --force to apply.\n'
      : '\n🚨 LIVE on PRODUCTION — updating voucher page content.\n',
  )

  // Find the voucher page
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'voucher' } },
    depth: 2,
    limit: 1,
    locale: 'de',
    overrideAccess: true,
  })

  const page = result.docs[0]
  if (!page) {
    console.error('❌ Voucher page not found in production. Aborting.')
    process.exit(1)
  }

  console.log(`Found voucher page: id=${page.id}`)

  const v = page.voucher as Record<string, unknown>
  if (!v) {
    console.error('❌ Voucher page has no voucher group. Aborting.')
    process.exit(1)
  }

  // Show current values
  console.log('\nCurrent DE values:')
  console.log(`  heroDescription:      ${v.heroDescription}`)
  console.log(`  cardDisclaimer:       ${v.cardDisclaimer}`)
  console.log(`  deliverySectionLabel: ${v.deliverySectionLabel}`)
  console.log(`  deliveryDisclaimer:   ${v.deliveryDisclaimer}`)
  console.log(`  deliveryOptions:      ${JSON.stringify(v.deliveryOptions)}`)

  const deUpdates = {
    'voucher.heroDescription':
      'Das perfekte Geschenk für Foodies und Gesundheitsbewusste.\nFür 99 € verschenkst du einen unserer Workshops.',
    'voucher.cardDisclaimer': 'Einlösbar für Workshops auf fermentfreude.at',
    'voucher.deliverySectionLabel': 'ZUSTELLUNG',
    'voucher.deliveryDisclaimer': null,
    'voucher.pickupAddress': null,
  }

  const deFaqs = [
    {
      question: 'Wie lange ist ein Gutschein gültig?',
      answer: 'Unsere Gutscheine sind 12 Monate ab Kaufdatum gültig.',
    },
    {
      question: 'Für welche Workshops kann ich den Gutschein einlösen?',
      answer:
        'Der Gutschein ist für alle unsere Workshops gültig – Kombucha, Lakto-Gemüse, Tempeh und saisonale Workshops.',
    },
    {
      question: 'Wie löse ich den Gutschein ein?',
      answer:
        'Wähle deinen Wunsch-Workshop auf fermentfreude.at, buche deinen Termin und gib beim Bezahlen den Gutscheincode ein. Der Betrag wird vollständig angerechnet.',
    },
    {
      question: 'Wie erhalte ich den Gutschein nach dem Kauf?',
      answer:
        'Du erhältst deinen Gutschein sofort per E-Mail. Du kannst ihn direkt an die beschenkte Person weiterleiten oder uns ihre E-Mail-Adresse angeben, damit wir ihn direkt zustellen.',
    },
  ]

  // Map existing delivery options to new types
  const existingOptions = (v.deliveryOptions as Array<{ id?: string; type: string; title: string; icon: string }>) ?? []
  const deDeliveryOptions: Array<{ id?: string | null; type: string; title: string; icon: 'email' | 'card' | 'pickup' }> = [
    {
      id: existingOptions[0]?.id,
      type: 'email-recipient',
      title: 'Direkt an Empfänger:in senden',
      icon: 'email',
    },
    {
      id: existingOptions[1]?.id,
      type: 'email-self',
      title: 'An mich senden – ich leite weiter',
      icon: 'email',
    },
  ]

  console.log('\nWill update DE to:')
  for (const [k, v2] of Object.entries(deUpdates)) {
    console.log(`  ${k}: ${v2}`)
  }
  console.log(`  voucher.deliveryOptions: ${JSON.stringify(deDeliveryOptions)}`)
  console.log(`  voucher.faqs: ${deFaqs.length} entries (rewritten)`)

  if (DRY_RUN) {
    console.log('\n✅ Dry-run complete. Re-run with --force to apply.')
    process.exit(0)
  }

  // ── Apply DE update ────────────────────────────────────────────────────
  await payload.update({
    collection: 'pages',
    id: page.id as string,
    locale: 'de',
    data: {
      voucher: {
        ...v,
        heroDescription: deUpdates['voucher.heroDescription'],
        cardDisclaimer: deUpdates['voucher.cardDisclaimer'],
        deliverySectionLabel: deUpdates['voucher.deliverySectionLabel'],
        deliveryDisclaimer: null,
        pickupAddress: null,
        deliveryOptions: deDeliveryOptions,
        faqs: deFaqs,
      },
    },
    overrideAccess: true,
    context: ctx,
  })
  console.log('✓ DE updated')

  // ── Apply EN update ────────────────────────────────────────────────────
  const enResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'voucher' } },
    depth: 2,
    limit: 1,
    locale: 'en',
    overrideAccess: true,
  })
  const enPage = enResult.docs[0]
  const vEN = enPage?.voucher as Record<string, unknown> | undefined

  if (vEN) {
    const enDeliveryOptions = [
      { ...deDeliveryOptions[0], title: 'Send directly to recipient by email' },
      { ...deDeliveryOptions[1], title: 'Send to me — I will forward it' },
    ]
    const enFaqs = [
      {
        question: 'How long is a voucher valid?',
        answer: 'Our vouchers are valid for 12 months from the date of purchase.',
      },
      {
        question: 'Which workshops can I redeem the voucher for?',
        answer:
          'The voucher is valid for all our workshops — Kombucha, Lacto-vegetables, Tempeh and seasonal workshops.',
      },
      {
        question: 'How do I redeem the voucher?',
        answer:
          'Choose your workshop on fermentfreude.at, book your date and enter the voucher code at checkout. The full amount will be applied.',
      },
      {
        question: 'How do I receive the voucher after purchase?',
        answer:
          'You will receive your voucher immediately by email. You can forward it directly to the recipient or provide us with their email address so we can send it to them directly.',
      },
    ]

    await payload.update({
      collection: 'pages',
      id: page.id as string,
      locale: 'en',
      data: {
        voucher: {
          ...vEN,
          heroDescription:
            'The perfect gift for foodies and the health-conscious.\nFor €99 you give one of our workshops.',
          cardDisclaimer: 'Redeemable for workshops on fermentfreude.at',
          deliverySectionLabel: 'DELIVERY',
          deliveryDisclaimer: null,
          pickupAddress: null,
          deliveryOptions: enDeliveryOptions,
          faqs: enFaqs,
        },
      },
      overrideAccess: true,
      context: ctx,
    })
    console.log('✓ EN updated')
  } else {
    console.log('⚠️  No EN voucher doc found — skipped EN update')
  }

  console.log('\n✅ Done. Voucher page updated on production.')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Script failed:', err)
  process.exit(1)
})
