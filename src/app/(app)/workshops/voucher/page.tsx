import type { Metadata } from 'next'

import type { Page } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { FAQSection } from './FAQSection'
import { GiftOccasionsSection } from './GiftOccasionsSection'
import { VoucherBenefitsSection } from './VoucherBenefitsSection'
import { VoucherHero } from './VoucherHero'
import { VoucherHowSection } from './VoucherHowSection'
import { VoucherWhySection } from './VoucherWhySection'

const configPromise = Promise.resolve(config)

async function getVoucherDocument(locale?: 'de' | 'en') {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    depth: 4,
    limit: 1,
    locale: locale ?? 'de',
    where: {
      and: [{ slug: { equals: 'voucher' } }, { _status: { equals: 'published' } }],
    },
  })
  return result.docs?.[0] ?? null
}

const getCachedVoucher = (locale?: 'de' | 'en') =>
  process.env.NODE_ENV === 'development'
    ? () => getVoucherDocument(locale)
    : unstable_cache(async () => getVoucherDocument(locale), ['voucher', locale ?? 'de'], {
        tags: ['voucher'],
        revalidate: 60,
      })

export const metadata: Metadata = {
  title: 'Geschenkgutschein | FermentFreude',
  description:
    'Verschenke Fermentation! Das perfekte Geschenk für Foodies und Gesundheitsbewusste.',
}

// Hardcoded defaults in English so the site works with an empty database
const DEFAULTS = {
  heroHeading: 'Give the gift of fermentation',
  heroDescription:
    'The perfect gift for foodies and the health-conscious.\nChoose an amount and optionally a greeting message for your voucher.',
  voucherAmounts: [{ amount: '99€' }],
  deliveryOptions: [
    { type: 'email', title: 'By email to print at home', icon: 'email' as const },
    { type: 'pickup', title: 'Pick up from store', icon: 'pickup' as const },
  ],
  cardLabel: 'GIFT VOUCHER',
  valueLabel: 'Voucher value',
  cardDisclaimer: 'Redeemable in our shop',
  amountSectionLabel: 'VOUCHER VALUE',
  deliverySectionLabel: 'DELIVERY METHOD',
  deliveryDisclaimer: 'We cannot ship products by post to ensure freshness.',
  pickupAddress: 'Grabenstraße 15\n8010 Graz',
  greetingLabel: 'Your greeting message',
  greetingPlaceholder: 'Max. 250 characters',
  addToCartButton: 'Add to cart',
  voucherWhyHeading: 'Why a fermentation voucher is a great gift',
  voucherWhyBody:
    "You're not giving \"just something\", but a workshop that inspires, brings joy, and has a lasting effect. A gift with added value.",
  voucherBenefitsHeading: 'What’s included',
  voucherBenefitsSubtitle: 'All at a glance',
  voucherBenefits: [
    { text: 'Valid for all workshops', subtext: 'Kombucha, Lacto-vegetables, Tempeh & seasonal' },
    { text: 'No expiry date', subtext: 'Valid indefinitely' },
    { text: 'Suitable for beginners & pros', subtext: 'All experience levels welcome' },
    { text: 'Small groups', subtext: 'Maximum 8 people for intensive support' },
    { text: 'Quickly available', subtext: 'Digital via email or pick-up at the store' },
    { text: 'Starter kits & tastings included', subtext: 'Everything to continue at home' },
    { text: 'Hands-on with ferments to take home', subtext: 'Your own creations and fermentation vessels' },
    { text: 'Flexible date choice', subtext: 'Workshops available year-round' },
  ],
  voucherHowHeading: 'How it works',
  voucherHowSteps: [
    { title: 'Kaufen', description: 'Online für €99 bestellen' },
    { title: 'Erhalten', description: 'Digital oder Abholung in Graz' },
    { title: 'Wählen', description: 'Workshop & Termin aussuchen' },
    { title: 'Genießen', description: 'Lernen & weiterfermentieren' },
  ],
  giftOccasionsHeading: 'A gift for every occasion',
  giftOccasions: [
    { image: null, caption: 'Birthdays' },
    { image: null, caption: 'Weddings' },
    { image: null, caption: 'Team events' },
    { image: null, caption: 'Christmas' },
  ],
  faqHeading: 'Frequently asked questions about vouchers',
  faqs: [
    {
      question: 'How long is a voucher valid?',
      answer:
        'Our vouchers are valid for 12 months from the date of purchase and can be redeemed for workshops, online courses and products.',
    },
    {
      question: 'Can the voucher be redeemed in instalments?',
      answer:
        'Yes, you can use the voucher in several steps. The remaining balance stays on the voucher.',
    },
    {
      question: 'Where can I enter the code?',
      answer:
        'During checkout you can enter the voucher code in the cart. The amount is automatically deducted from the total.',
    },
    {
      question: 'Can a voucher be topped up?',
      answer: 'Yes, you can top up an existing voucher with an additional amount at any time.',
    },
  ],
}

export default async function VoucherPage() {
  const locale = await getLocale()
  const voucherData = (await getCachedVoucher(locale)()) as Page | null

  const resolve = <T,>(cmsValue: T | null | undefined, defaultValue: T): T =>
    cmsValue ?? defaultValue

  const v = voucherData?.voucher

  const heroHeading = resolve(v?.heroHeading, DEFAULTS.heroHeading)
  const heroDescription = resolve(v?.heroDescription, DEFAULTS.heroDescription)
  const amounts =
    (v?.voucherAmounts?.length ?? 0) > 0
      ? v!.voucherAmounts.map((a) => a.amount)
      : DEFAULTS.voucherAmounts.map((a) => a.amount)
  const deliveryOptions =
    (v?.deliveryOptions?.length ?? 0) > 0
      ? v!.deliveryOptions.map((d) => ({
          type: d.type,
          title: d.title,
          icon: d.icon,
        }))
      : DEFAULTS.deliveryOptions

  const cardLogo = v?.cardLogo ?? null
  const cardLabel = resolve(v?.cardLabel, DEFAULTS.cardLabel)
  const valueLabel = resolve(v?.valueLabel, DEFAULTS.valueLabel)
  const cardDisclaimer = resolve(v?.cardDisclaimer, DEFAULTS.cardDisclaimer)
  const amountSectionLabel = resolve(v?.amountSectionLabel, DEFAULTS.amountSectionLabel)
  const deliverySectionLabel = resolve(v?.deliverySectionLabel, DEFAULTS.deliverySectionLabel)
  const deliveryDisclaimer = v?.deliveryDisclaimer ?? DEFAULTS.deliveryDisclaimer
  const pickupAddress = v?.pickupAddress ?? DEFAULTS.pickupAddress
  const greetingLabel = resolve(v?.greetingLabel, DEFAULTS.greetingLabel)
  const greetingPlaceholder = resolve(v?.greetingPlaceholder, DEFAULTS.greetingPlaceholder)
  const addToCartButton = resolve(v?.addToCartButton, DEFAULTS.addToCartButton)

  const voucherWhyHeading = resolve(v?.voucherWhyHeading, DEFAULTS.voucherWhyHeading)
  const voucherWhyBody = resolve(v?.voucherWhyBody, DEFAULTS.voucherWhyBody)
  const voucherWhyImage = v?.voucherWhyImage ?? null
  const voucherWhyBenefits =
    (v?.voucherWhyBenefits?.length ?? 0) >= 4
      ? v!.voucherWhyBenefits!.map((b) => ({
          icon: b.icon,
          title: b.title,
          description: b.description,
        }))
      : null
  const voucherBenefitsHeading = resolve(
    v?.voucherBenefitsHeading,
    DEFAULTS.voucherBenefitsHeading,
  )
  const voucherBenefitsSubtitle = v?.voucherBenefitsSubtitle ?? DEFAULTS.voucherBenefitsSubtitle
  const voucherBenefits =
    (v?.voucherBenefits?.length ?? 0) > 0
      ? v!.voucherBenefits.map((b) => ({ text: b.text, subtext: b.subtext ?? null })).filter((b) => b.text)
      : DEFAULTS.voucherBenefits
  const voucherHowHeading = resolve(v?.voucherHowHeading, DEFAULTS.voucherHowHeading)
  const voucherHowSteps =
    (v?.voucherHowSteps?.length ?? 0) > 0
      ? v!.voucherHowSteps.map((s) => ({ title: s.text, description: s.description ?? null })).filter((s) => s.title)
      : DEFAULTS.voucherHowSteps

  const giftOccasionsHeading = resolve(v?.giftOccasionsHeading, DEFAULTS.giftOccasionsHeading)
  const giftOccasions =
    (v?.giftOccasions?.length ?? 0) > 0
      ? v!.giftOccasions.map((g) => ({
          image: g.image ?? null,
          caption: g.caption,
        }))
      : DEFAULTS.giftOccasions.map((g) => ({
          image: null,
          caption: g.caption,
        }))

  const faqHeading = resolve(v?.faqHeading, DEFAULTS.faqHeading)
  const faqs =
    (v?.faqs?.length ?? 0) > 0
      ? v!.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : DEFAULTS.faqs

  return (
    <div className="min-h-screen bg-white">
      <VoucherHero
        heading={heroHeading}
        description={heroDescription}
        amounts={amounts}
        deliveryOptions={deliveryOptions}
        cardLogo={cardLogo}
        cardLabel={cardLabel}
        valueLabel={valueLabel}
        cardDisclaimer={cardDisclaimer}
        amountSectionLabel={amountSectionLabel}
        deliverySectionLabel={deliverySectionLabel}
        deliveryDisclaimer={deliveryDisclaimer}
        pickupAddress={pickupAddress}
        greetingLabel={greetingLabel}
        greetingPlaceholder={greetingPlaceholder}
        addToCartButton={addToCartButton}
      />
      <VoucherWhySection
        heading={voucherWhyHeading}
        body={voucherWhyBody}
        image={voucherWhyImage}
        benefits={voucherWhyBenefits}
      />
      <VoucherHowSection heading={voucherHowHeading} steps={voucherHowSteps} />
      <GiftOccasionsSection heading={giftOccasionsHeading} occasions={giftOccasions} />
      <VoucherBenefitsSection
        heading={voucherBenefitsHeading}
        subtitle={voucherBenefitsSubtitle}
        benefits={voucherBenefits}
      />
      <FAQSection heading={faqHeading} faqs={faqs} />
    </div>
  )
}
