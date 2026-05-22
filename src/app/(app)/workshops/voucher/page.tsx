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
    'The perfect gift for foodies and the health-conscious.\nFor €99 you give one of our workshops.',
  voucherAmounts: [{ amount: '99€' }],
  deliveryOptions: [
    {
      type: 'email-recipient',
      title: 'Send directly to recipient by email',
      icon: 'email' as const,
    },
    {
      type: 'email-self',
      title: 'Send to me — I will forward it',
      icon: 'email' as const,
    },
  ],
  cardLabel: 'GIFT VOUCHER',
  valueLabel: 'Voucher value',
  cardDisclaimer: 'Redeemable for workshops on fermentfreude.at',
  amountSectionLabel: 'VOUCHER VALUE',
  deliverySectionLabel: 'DELIVERY',
  deliveryDisclaimer: null,
  pickupAddress: null,
  addToCartButton: 'Add to cart',
  voucherWhyHeading: 'Why a fermentation voucher is a great gift',
  voucherWhyBody:
    'You\'re not giving "just something", but a workshop that inspires, brings joy, and has a lasting effect. A gift with added value.',
  voucherBenefitsHeading: 'What’s included',
  voucherBenefitsSubtitle: 'All at a glance',
  voucherBenefits: [
    {
      text: 'Valid for all workshops',
      subtext: 'Kombucha, Lacto-vegetables, Tempeh & seasonal',
      icon: 'calendar' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'No expiry date',
      subtext: 'Valid indefinitely',
      icon: 'shield' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'Suitable for beginners & pros',
      subtext: 'All experience levels welcome',
      icon: 'users' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'Small groups',
      subtext: 'Maximum 8 people for intensive support',
      icon: 'usersRound' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'Quickly available',
      subtext: 'Digital via email or pick-up at the store',
      icon: 'zap' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'Starter kits & tastings included',
      subtext: 'Everything to continue at home',
      icon: 'package' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'Hands-on with ferments to take home',
      subtext: 'Your own creations and fermentation vessels',
      icon: 'calendar' as const,
      iconSource: 'preset' as const,
    },
    {
      text: 'Flexible date choice',
      subtext: 'Workshops available year-round',
      icon: 'shield' as const,
      iconSource: 'preset' as const,
    },
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
  ],
}

export default async function VoucherPage() {
  const locale = await getLocale()
  const voucherData = (await getCachedVoucher(locale)()) as Page | null

  const resolve = <T,>(cmsValue: T | null | undefined, defaultValue: T): T =>
    cmsValue ?? defaultValue

  const v = voucherData?.voucher

  const showHero = v?.voucherShowHero ?? true
  const showWhy = v?.voucherShowWhy ?? true
  const showHow = v?.voucherShowHow ?? true
  const showGiftOccasions = v?.voucherShowGiftOccasions ?? true
  const showBenefits = v?.voucherShowBenefits ?? true
  const showFAQ = v?.voucherShowFAQ ?? true
  const showAmounts = v?.voucherShowAmounts ?? true
  const showDeliveryOptions = v?.voucherShowDeliveryOptions ?? true
  const showCTA = v?.voucherShowCTA ?? true

  const heroHeading = resolve(v?.heroHeading, DEFAULTS.heroHeading)
  const heroDescription = resolve(v?.heroDescription, DEFAULTS.heroDescription)
  const voucherAmounts = v?.voucherAmounts ?? null
  const deliveryOptionsData = v?.deliveryOptions ?? null

  const amounts =
    voucherAmounts && voucherAmounts.length > 0
      ? voucherAmounts.map((a) => a.amount)
      : DEFAULTS.voucherAmounts.map((a) => a.amount)

  const deliveryOptions =
    deliveryOptionsData && deliveryOptionsData.length > 0
      ? deliveryOptionsData.map((d) => ({
          type: d.type,
          title: d.title,
          icon: d.icon ?? 'email',
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
  const addToCartButton = resolve(v?.addToCartButton, DEFAULTS.addToCartButton)

  const voucherWhyHeading = resolve(v?.voucherWhyHeading, DEFAULTS.voucherWhyHeading)
  const voucherWhyBody = resolve(v?.voucherWhyBody, DEFAULTS.voucherWhyBody)
  const voucherWhyImage = v?.voucherWhyImage ?? null

  const voucherWhyBenefitsData = v?.voucherWhyBenefits ?? null
  const voucherWhyBenefits =
    voucherWhyBenefitsData && voucherWhyBenefitsData.length >= 4
      ? voucherWhyBenefitsData.map((b) => ({
          icon: b.icon,
          iconSource: b.iconSource ?? null,
          customIcon:
            typeof b.customIcon === 'object' && b.customIcon !== null ? b.customIcon : null,
          title: b.title,
          description: b.description,
        }))
      : null
  const voucherWhyPerfectForVisible = v?.voucherWhyPerfectForVisible ?? null
  const voucherWhyPerfectForHeading = v?.voucherWhyPerfectForHeading ?? null
  const voucherWhyPerfectForTags = v?.voucherWhyPerfectForTags ?? null
  const voucherBenefitsHeading = resolve(v?.voucherBenefitsHeading, DEFAULTS.voucherBenefitsHeading)
  const voucherBenefitsSubtitle = v?.voucherBenefitsSubtitle ?? DEFAULTS.voucherBenefitsSubtitle

  const voucherBenefitsData = v?.voucherBenefits ?? null
  const voucherBenefits =
    voucherBenefitsData && voucherBenefitsData.length > 0
      ? voucherBenefitsData
          .map((b) => ({
            text: b.text,
            subtext: b.subtext ?? null,
            icon: b.icon ?? null,
            iconSource: b.iconSource ?? null,
            customIcon:
              typeof b.customIcon === 'object' && b.customIcon !== null ? b.customIcon : null,
          }))
          .filter((b) => b.text)
      : DEFAULTS.voucherBenefits
  const voucherHowHeading = resolve(v?.voucherHowHeading, DEFAULTS.voucherHowHeading)

  const voucherHowStepsData = v?.voucherHowSteps ?? null
  const voucherHowSteps =
    voucherHowStepsData && voucherHowStepsData.length > 0
      ? voucherHowStepsData
          .map((s) => ({ title: s.text, description: s.description ?? null }))
          .filter((s) => s.title)
      : DEFAULTS.voucherHowSteps

  const giftOccasionsHeading = resolve(v?.giftOccasionsHeading, DEFAULTS.giftOccasionsHeading)

  const giftOccasionsData = v?.giftOccasions ?? null
  const giftOccasions =
    giftOccasionsData && giftOccasionsData.length > 0
      ? giftOccasionsData.map((g) => ({
          image: g.image ?? null,
          caption: g.caption,
        }))
      : DEFAULTS.giftOccasions.map((g) => ({
          image: null,
          caption: g.caption,
        }))

  const faqHeading = resolve(v?.faqHeading, DEFAULTS.faqHeading)

  const faqsData = v?.faqs ?? null
  const faqs =
    faqsData && faqsData.length > 0
      ? faqsData.map((f) => ({ question: f.question, answer: f.answer }))
      : DEFAULTS.faqs

  return (
    <div className="min-h-screen bg-white">
      {showHero && (
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
          addToCartButton={addToCartButton}
          showAmounts={showAmounts}
          showDeliveryOptions={showDeliveryOptions}
          showCTA={showCTA}
        />
      )}
      {showWhy && (
        <VoucherWhySection
          heading={voucherWhyHeading}
          body={voucherWhyBody}
          image={voucherWhyImage}
          benefits={voucherWhyBenefits}
          perfectForVisible={voucherWhyPerfectForVisible}
          perfectForHeading={voucherWhyPerfectForHeading}
          perfectForTags={voucherWhyPerfectForTags}
        />
      )}
      {showHow && <VoucherHowSection heading={voucherHowHeading} steps={voucherHowSteps} />}
      {showGiftOccasions && (
        <GiftOccasionsSection heading={giftOccasionsHeading} occasions={giftOccasions} />
      )}
      {showBenefits && (
        <VoucherBenefitsSection
          heading={voucherBenefitsHeading}
          subtitle={voucherBenefitsSubtitle}
          benefits={voucherBenefits}
        />
      )}
      {showFAQ && <FAQSection heading={faqHeading} faqs={faqs} />}
    </div>
  )
}
