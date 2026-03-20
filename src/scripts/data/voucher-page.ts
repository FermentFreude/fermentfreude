import type { Media, Page } from '@/payload-types'

type VoucherPageArgs = {
  /** Logo displayed on the voucher card */
  cardLogo?: Media | null
  /** Starter set image */
  starterSetImage?: Media | null
  /** Gift occasion images - array matching the order: Birthdays, Weddings, Team events, Christmas */
  giftOccasionImages: (Media | null)[]
}

const seedContext = {
  skipRevalidate: true,
  disableRevalidate: true,
  skipAutoTranslate: true,
} as const

/**
 * German (DE) voucher page data. Save this first so Payload generates IDs for arrays/blocks.
 */
export function voucherPageDataDE({
  cardLogo,
  starterSetImage,
  giftOccasionImages,
}: VoucherPageArgs): Required<Pick<Page, 'slug' | 'title' | '_status' | 'voucher'>> & {
  hero: Page['hero']
  layout: Page['layout']
} {
  return {
    slug: 'voucher',
    title: 'Geschenkgutschein',
    _status: 'published',
    hero: {
      type: 'none',
    },
    layout: [],
    voucher: {
      heroHeading: 'Verschenke Fermentation',
      heroDescription:
        'Das perfekte Geschenk für Foodies und Gesundheitsbewusste.\nWähle einen Betrag und optional eine Grußnachricht für deinen Gutschein.',
      voucherAmounts: [{ amount: '99€' }],
      deliveryOptions: [
        { type: 'email', title: 'Per E-Mail zum selber drucken', icon: 'email' },
        { type: 'pickup', title: 'Abholung im Laden', icon: 'pickup' },
      ],
      cardLabel: 'GESCHENK GUTSCHEIN',
      valueLabel: 'Wertgutschein',
      cardDisclaimer: 'Einlösbar in unserem Shop',
      amountSectionLabel: 'WERTGUTSCHEIN',
      deliverySectionLabel: 'VERSANDART',
      deliveryDisclaimer:
        'Wir versenden keine Produkte per Post, damit alles frisch bleibt.',
      pickupAddress: 'Grabenstraße 15\n8010 Graz',
      greetingLabel: 'Deine Grußnachricht',
      greetingPlaceholder: 'Max. 250 Zeichen',
      addToCartButton: 'In den Warenkorb',
      voucherWhyHeading: 'Warum ein Fermentations-Workshop:',
      voucherWhyBody:
        'Du schenkst nicht „irgendetwas“, sondern einen Workshop, der inspiriert, Freude macht und nachhaltig wirkt. Ein Geschenk mit Mehrwert.',
      voucherWhyBenefits: [
        {
          icon: 'sparkle',
          title: 'Unvergessliches Erlebnis',
          description:
            'Mehr als ein Geschenk – eine Erfahrung, die begeistert und lange in Erinnerung bleibt.',
        },
        {
          icon: 'heart',
          title: 'Gesundheit & Genuss',
          description:
            'Entdecke probiotikreiche Lebensmittel, die Darmgesundheit und Wohlbefinden fördern.',
        },
        {
          icon: 'graduation',
          title: 'Wissen fürs Leben',
          description:
            'Lerne traditionelle Techniken, die du immer wieder anwenden kannst – zuhause und kreativ.',
        },
        {
          icon: 'leaf',
          title: 'Nachhaltig & natürlich',
          description:
            'Verbinde dich mit natürlichen Lebensmittelprozessen und nachhaltigen Praktiken.',
        },
      ],
      voucherBenefitsHeading: 'Was im Gutschein enthalten ist',
      voucherBenefitsSubtitle: 'Alles auf einen Blick',
      voucherBenefits: [
        { text: 'Für alle Workshops gültig', subtext: 'Kombucha, Lakto-Gemüse, Tempeh & Saisonales' },
        { text: 'Ohne Ablaufdatum', subtext: 'Zeitlich unbegrenzt gültig' },
        { text: 'Für Einsteiger & Profis geeignet', subtext: 'Alle Erfahrungsstufen willkommen' },
        { text: 'Kleine Gruppen', subtext: 'Maximal 8 Personen für intensive Betreuung' },
        { text: 'Schnell verfügbar', subtext: 'Digital per E-Mail oder Abholung im Geschäftslokal' },
        { text: 'Starterkits & Verkostungen inklusive', subtext: 'Alles, um zuhause weiterzumachen' },
        { text: 'Praxis mit Fermente für zuhause', subtext: 'Eigene Kreationen und Gärgefäße mitnehmen' },
        { text: 'Flexible Terminwahl', subtext: 'Ganzjährig verfügbare Workshops' },
      ],
      voucherWhyPerfectForHeading: 'Perfekt für',
      voucherWhyPerfectForTags: [
        { label: 'Foodies' },
        { label: 'Gesundheitsbewusste' },
        { label: 'Hobby-Köche' },
        { label: 'Profi-Köche' },
        { label: 'Neugierige' },
        { label: 'Geschenk-Suchende' },
      ],
      voucherHowHeading: 'So funktioniert\'s',
      voucherHowSteps: [
        { text: 'Kaufen', description: 'Online für €99 bestellen' },
        { text: 'Erhalten', description: 'Digital oder Abholung in Graz' },
        { text: 'Wählen', description: 'Workshop & Termin aussuchen' },
        { text: 'Genießen', description: 'Lernen & weiterfermentieren' },
      ],
      starterSetHeading: 'Kombiniere den Gutschein mit einem Starter-Set',
      starterSetDescription:
        'Miete Mi, wie vorher! E-Mail mit dem Gutschein, fertig im Druck. 1 wochig, 2 wochig, pro Tag.',
      starterSetButton: 'Zu den Starter-Sets',
      cardLogo: cardLogo?.id ?? null,
      starterSetImage: starterSetImage?.id ?? null,
      giftOccasionsHeading: 'Ein Geschenk für jeden Anlass',
      giftOccasions: ['Geburtstage', 'Hochzeiten', 'Team Events', 'Weihnachten'].map(
        (caption, i) => ({
          image: giftOccasionImages[i]?.id ?? null,
          caption,
        }),
      ),
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
    },
  }
}

/**
 * English (EN) voucher page data. Reuses IDs from the saved DE document so localized array fields stay in sync.
 */
export function voucherPageDataEN(
  savedDoc: Page,
  { cardLogo, starterSetImage, giftOccasionImages }: VoucherPageArgs,
): Required<Pick<Page, 'slug' | 'title' | '_status' | 'voucher'>> & {
  hero: Page['hero']
  layout: Page['layout']
} {
  const v = savedDoc.voucher
  if (!v) throw new Error('Voucher page DE doc has no voucher group')

  return {
    slug: 'voucher',
    title: 'Gift Voucher',
    _status: 'published',
    hero: {
      type: 'none',
    },
    layout: [],
    voucher: {
      heroHeading: 'Give the gift of fermentation',
      heroDescription:
        'The perfect gift for foodies and the health-conscious.\nChoose an amount and optionally a greeting message for your voucher.',
      voucherAmounts: (v.voucherAmounts ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        amount: ['99€'][i] ?? item.amount,
      })),
      deliveryOptions: (v.deliveryOptions ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        type: item.type,
        title: item.type === 'pickup' ? 'Pick up from store' : 'By email to print at home',
        icon: item.icon,
      })),
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
      voucherWhyBenefits: (v.voucherWhyBenefits ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        icon: item.icon,
        title: [
          'Unforgettable experience',
          'Health & pleasure',
          'Knowledge for life',
          'Sustainable & natural',
        ][i] ?? item.title,
        description: [
          'More than a gift – an experience that inspires and stays long in memory.',
          'Discover probiotic-rich foods that promote gut health and well-being.',
          'Learn traditional techniques that you can always apply – at home and creatively.',
          'Connect with natural food processes and sustainable practices.',
        ][i] ?? item.description,
      })),
      voucherWhyPerfectForHeading: 'Perfect for',
      voucherWhyPerfectForTags: (v.voucherWhyPerfectForTags ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        label: ['Foodies', 'Health-conscious', 'Hobby cooks', 'Professional cooks', 'Curious people', 'Gift seekers'][i] ?? item.label,
      })),
      voucherBenefitsHeading: "What's included in the voucher",
      voucherBenefitsSubtitle: 'All at a glance',
      voucherBenefits: (v.voucherBenefits ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        text: [
          'Valid for all workshops',
          'No expiry date',
          'Suitable for beginners & pros',
          'Small groups',
          'Quickly available',
          'Starter kits & tastings included',
          'Hands-on with ferments to take home',
          'Flexible date choice',
        ][i] ?? item.text,
        subtext: [
          'Kombucha, Lacto-vegetables, Tempeh & seasonal',
          'Valid indefinitely',
          'All experience levels welcome',
          'Maximum 8 people for intensive support',
          'Digital via email or pick-up at the store',
          'Everything to continue at home',
          'Your own creations and fermentation vessels',
          'Workshops available year-round',
        ][i] ?? item.subtext ?? null,
      })),
      voucherHowHeading: 'How it works',
      voucherHowSteps: (v.voucherHowSteps ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        text: ['Kaufen', 'Erhalten', 'Wählen', 'Genießen'][i] ?? item.text,
        description: [
          'Order online for €99',
          'Digital or pickup in Graz',
          'Select workshop & date',
          'Learn & keep fermenting',
        ][i] ?? item.description ?? null,
      })),
      starterSetHeading: 'Combine the voucher with a starter set',
      starterSetDescription:
        'Rent a jar, same as before! Email with the voucher, ready to print. 1 week, 2 weeks, per day.',
      starterSetButton: 'View starter sets',
      cardLogo: cardLogo?.id ?? null,
      starterSetImage: starterSetImage?.id ?? null,
      giftOccasionsHeading: 'A gift for every occasion',
      giftOccasions: (v.giftOccasions ?? []).map((item, i) => {
        const occasionImage = giftOccasionImages[i]
        const imageId =
          occasionImage?.id ?? (typeof item.image === 'string' ? item.image : item.image?.id)
        return {
          id: item.id ?? undefined,
          image: imageId ?? null,
          caption: ['Birthdays', 'Weddings', 'Team events', 'Christmas'][i] ?? item.caption,
        }
      }),
      faqHeading: 'Frequently asked questions about vouchers',
      faqs: (v.faqs ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        question:
          [
            'How long is a voucher valid?',
            'Can the voucher be redeemed in instalments?',
            'Where can I enter the code?',
            'Can a voucher be topped up?',
          ][i] ?? item.question,
        answer:
          [
            'Our vouchers are valid for 12 months from the date of purchase and can be redeemed for workshops, online courses and products.',
            'Yes, you can use the voucher in several steps. The remaining balance stays on the voucher.',
            'During checkout you can enter the voucher code in the cart. The amount is automatically deducted from the total.',
            'Yes, you can top up an existing voucher with an additional amount at any time.',
          ][i] ?? item.answer,
      })),
    },
  }
}

export { seedContext }
