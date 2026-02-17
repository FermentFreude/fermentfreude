import type { Metadata } from 'next'

import { getLocale } from '@/utilities/getLocale'
import type { Media, Page } from '@/payload-types'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { FAQSection } from './FAQSection'
import { GiftOccasionsSection } from './GiftOccasionsSection'
import { StarterSetSection } from './StarterSetSection'
import { VoucherHero } from './VoucherHero'

const configPromise = Promise.resolve(config)

async function getVoucherDocument(locale?: 'de' | 'en') {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    limit: 1,
    locale: locale ?? 'de',
    where: {
      and: [
        { slug: { equals: 'voucher' } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  return result.docs?.[0] ?? null
}

const getCachedVoucher = (locale?: 'de' | 'en') =>
  unstable_cache(
    async () => getVoucherDocument(locale),
    ['voucher', locale ?? 'de'],
    { tags: ['voucher'] },
  )

export const metadata: Metadata = {
  title: 'Geschenkgutschein | FermentFreude',
  description:
    'Verschenke Fermentation! Das perfekte Geschenk für Foodies und Gesundheitsbewusste.',
}

// Hardcoded defaults in English so the site works with an empty database
const DEFAULTS = {
  heroHeading: 'Give the gift of fermentation',
  heroDescription:
    'The perfect gift for foodies and the health-conscious. Choose an amount and optionally a greeting message for your voucher.',
  voucherAmounts: [{ amount: '99€' }],
  deliveryOptions: [
    { type: 'email', title: 'By email to print at home', icon: 'email' as const },
    { type: 'post', title: 'By post with premium card', icon: 'card' as const },
  ],
  cardLabel: 'GIFT VOUCHER',
  valueLabel: 'Voucher value',
  cardDisclaimer: 'Redeemable in our shop',
  amountSectionLabel: 'VOUCHER VALUE',
  deliverySectionLabel: 'DELIVERY METHOD',
  greetingLabel: 'Your greeting message',
  greetingPlaceholder: 'Max. 250 characters',
  addToCartButton: 'Add to cart',
  starterSetHeading: 'Combine the voucher with a starter set',
  starterSetDescription:
    'Rent a jar, same as before! Email with the voucher, ready to print. 1 week, 2 weeks, per day.',
  starterSetButton: 'View starter sets',
  starterSetImage: '/assets/images/products.png',
  giftOccasionsHeading: 'A gift for every occasion',
  giftOccasions: [
    { image: '/assets/images/Workshops.png', caption: 'Birthdays' },
    { image: '/assets/images/hochzeit.png', caption: 'Weddings' },
    { image: '/assets/images/Im Laden.png', caption: 'Team events' },
    { image: '/assets/images/Weihnachten.png', caption: 'Christmas' },
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
      answer:
        'Yes, you can top up an existing voucher with an additional amount at any time.',
    },
  ],
}

function resolveMediaUrl(
  media: string | Media | null | undefined,
  fallback: string,
): string {
  if (!media) return fallback
  if (typeof media === 'object' && media?.url) return media.url
  if (typeof media === 'string') return fallback
  return fallback
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

  const cardLabel = resolve(v?.cardLabel, DEFAULTS.cardLabel)
  const valueLabel = resolve(v?.valueLabel, DEFAULTS.valueLabel)
  const cardDisclaimer = resolve(v?.cardDisclaimer, DEFAULTS.cardDisclaimer)
  const amountSectionLabel = resolve(
    v?.amountSectionLabel,
    DEFAULTS.amountSectionLabel,
  )
  const deliverySectionLabel = resolve(
    v?.deliverySectionLabel,
    DEFAULTS.deliverySectionLabel,
  )
  const greetingLabel = resolve(v?.greetingLabel, DEFAULTS.greetingLabel)
  const greetingPlaceholder = resolve(
    v?.greetingPlaceholder,
    DEFAULTS.greetingPlaceholder,
  )
  const addToCartButton = resolve(
    v?.addToCartButton,
    DEFAULTS.addToCartButton,
  )

  const starterSetHeading = resolve(
    v?.starterSetHeading,
    DEFAULTS.starterSetHeading,
  )
  const starterSetDescription = resolve(
    v?.starterSetDescription,
    DEFAULTS.starterSetDescription,
  )
  const starterSetButton = resolve(
    v?.starterSetButton,
    DEFAULTS.starterSetButton,
  )
  const starterSetImage = resolveMediaUrl(
    v?.starterSetImage,
    DEFAULTS.starterSetImage,
  )

  const giftOccasionsHeading = resolve(
    v?.giftOccasionsHeading,
    DEFAULTS.giftOccasionsHeading,
  )
  const defaultOccasionImages = DEFAULTS.giftOccasions.map((o) => o.image)
  const giftOccasions =
    (v?.giftOccasions?.length ?? 0) > 0
      ? v!.giftOccasions.map((g, i) => ({
          image: resolveMediaUrl(
            g.image,
            defaultOccasionImages[i] ?? defaultOccasionImages[0] ?? '',
          ),
          caption: g.caption,
        }))
      : DEFAULTS.giftOccasions

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
        cardLabel={cardLabel}
        valueLabel={valueLabel}
        cardDisclaimer={cardDisclaimer}
        amountSectionLabel={amountSectionLabel}
        deliverySectionLabel={deliverySectionLabel}
        greetingLabel={greetingLabel}
        greetingPlaceholder={greetingPlaceholder}
        addToCartButton={addToCartButton}
      />
      <StarterSetSection
        heading={starterSetHeading}
        description={starterSetDescription}
        buttonText={starterSetButton}
        image={starterSetImage}
      />
      <GiftOccasionsSection
        heading={giftOccasionsHeading}
        occasions={giftOccasions}
      />
      <FAQSection heading={faqHeading} faqs={faqs} />
    </div>
  )
}
