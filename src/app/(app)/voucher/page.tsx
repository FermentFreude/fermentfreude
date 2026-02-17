import type { Metadata } from 'next'

import { getLocale } from '@/utilities/getLocale'
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
    locale,
    where: {
      and: [
        {
          slug: {
            equals: 'voucher',
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })
  return result.docs?.[0] || null
}

const getCachedVoucher = (locale?: 'de' | 'en') =>
  unstable_cache(async () => getVoucherDocument(locale), ['voucher', locale || 'de'], {
    tags: ['voucher'],
  })

export const metadata: Metadata = {
  title: 'Geschenkgutschein | FermentFreude',
  description:
    'Verschenke Fermentation! Das perfekte Geschenk für Foodies und Gesundheitsbewusste.',
}

// Hardcoded defaults (German)
const DEFAULTS = {
  heroHeading: 'Verschenke Fermentation',
  heroDescription:
    'Das perfekte Geschenk für Foodies und Gesundheitsbewusste. Wähle einen Betrag und optional eine Grußnachricht für deinen Gutschein.',
  voucherAmounts: ['99€'],
  deliveryOptions: [
    {
      type: 'email',
      title: 'Per E-Mail zum selber drucken',
      icon: 'email',
    },
    {
      type: 'post',
      title: 'Per Post inkl. hochwertiger Karte',
      icon: 'card',
    },
  ],
  starterSetHeading: 'Kombiniere den Gutschein mit einem Starter-Set',
  starterSetDescription:
    'Miete Mi, wie vorher! E-Mail mit dem Gutschein, fertig im Druck. 1 wochig, 2 wochig, pro tag.',
  starterSetButton: 'Zu den Starter-Sets',
  starterSetImage: '/assets/images/products.png',
  giftOccasionsHeading: 'Ein Geschenk für jeden Anlass',
  giftOccasions: [
    {
      image: '/assets/images/Workshops.png',
      caption: 'Geburtstage',
    },
    {
      image: '/assets/images/hochzeit.png',
      caption: 'Hochzeiten',
    },
    {
      image: '/assets/images/Im Laden.png',
      caption: 'Team Events',
    },
    {
      image: '/assets/images/Weihnachten.png',
      caption: 'Weihnachten',
    },
  ],
  faqHeading: 'Häufige Fragen zu Gutscheinen',
  faqs: [
    {
      question: 'Wie lange ist ein Gutschein gültig?',
      answer:
        'Unsere Gutscheine sind 12 Monate ab Kaufdatum gültig und können für Workshops, Online-Kurse und Produkte eingelöst werden.',
    },
    {
      question: 'Kann der Gutschein in Teilschritten eingelöst werden?',
      answer:
        'Ja, Sie können den Gutschein in mehreren Schritten verwenden. Der Restbetrag bleibt auf dem Gutschein gespeichert.',
    },
    {
      question: 'Wo kann ich den Code eingeben?',
      answer:
        'Bei der Bestellung können Sie den Gutscheincode im Warenkorb eingeben. Der Betrag wird automatisch vom Gesamtpreis abgezogen.',
    },
    {
      question: 'Kann ein Gutschein wieder aufgeladen werden?',
      answer:
        'Ja, Sie können einen bestehenden Gutschein jederzeit mit einem zusätzlichen Betrag aufladen.',
    },
  ],
}

export default async function VoucherPage() {
  const locale = await getLocale()
  const voucherData = await getCachedVoucher(locale)()

  // Helper function to resolve CMS value or use default
  const resolve = <T,>(cmsValue: T | null | undefined, defaultValue: T): T => {
    return cmsValue ?? defaultValue
  }

  // Resolve all values with defaults
  const heroHeading = resolve(voucherData?.storyHeading || voucherData?.title, DEFAULTS.heroHeading)
  const heroDescription = resolve(
    voucherData?.storyDescription?.[0]?.paragraph || voucherData?.meta?.description,
    DEFAULTS.heroDescription,
  )

  const starterSetHeading = resolve(DEFAULTS.starterSetHeading, DEFAULTS.starterSetHeading)
  const starterSetDescription = resolve(
    DEFAULTS.starterSetDescription,
    DEFAULTS.starterSetDescription,
  )
  const starterSetButton = resolve(DEFAULTS.starterSetButton, DEFAULTS.starterSetButton)
  const starterSetImage = resolve(DEFAULTS.starterSetImage, DEFAULTS.starterSetImage)

  const giftOccasionsHeading = resolve(DEFAULTS.giftOccasionsHeading, DEFAULTS.giftOccasionsHeading)
  const giftOccasions = DEFAULTS.giftOccasions

  const faqHeading = resolve(DEFAULTS.faqHeading, DEFAULTS.faqHeading)
  const faqs = DEFAULTS.faqs

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Voucher Preview and Configuration */}
      <VoucherHero
        heading={heroHeading}
        description={heroDescription}
        amounts={DEFAULTS.voucherAmounts}
        deliveryOptions={DEFAULTS.deliveryOptions}
      />

      {/* Starter-Set Section */}
      <StarterSetSection
        heading={starterSetHeading}
        description={starterSetDescription}
        buttonText={starterSetButton}
        image={starterSetImage}
      />

      {/* Gift Occasions Section */}
      <GiftOccasionsSection heading={giftOccasionsHeading} occasions={giftOccasions} />

      {/* FAQ Section */}
      <FAQSection heading={faqHeading} faqs={faqs} />
    </div>
  )
}
