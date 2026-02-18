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
export function voucherPageDataDE({ cardLogo, starterSetImage, giftOccasionImages }: VoucherPageArgs): Required<
  Pick<Page, 'slug' | 'title' | '_status' | 'voucher'>
> & { hero: Page['hero'] } {
  return {
    slug: 'voucher',
    title: 'Geschenkgutschein',
    _status: 'published',
    hero: {
      type: 'none',
    },
    voucher: {
      heroHeading: 'Verschenke Fermentation',
      heroDescription:
        'Das perfekte Geschenk für Foodies und Gesundheitsbewusste. Wähle einen Betrag und optional eine Grußnachricht für deinen Gutschein.',
      voucherAmounts: [
        { amount: '99€' },
      ],
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
      cardLabel: 'GESCHENK GUTSCHEIN',
      valueLabel: 'Wertgutschein',
      cardDisclaimer: 'Einlösbar in unserem Shop',
      amountSectionLabel: 'WERTGUTSCHEIN',
      deliverySectionLabel: 'VERSANDART',
      greetingLabel: 'Deine Grußnachricht',
      greetingPlaceholder: 'Max. 250 Zeichen',
      addToCartButton: 'In den Warenkorb',
      starterSetHeading: 'Kombiniere den Gutschein mit einem Starter-Set',
      starterSetDescription:
        'Miete Mi, wie vorher! E-Mail mit dem Gutschein, fertig im Druck. 1 wochig, 2 wochig, pro Tag.',
      starterSetButton: 'Zu den Starter-Sets',
      cardLogo: cardLogo?.id ?? null,
      starterSetImage: starterSetImage?.id ?? null,
      giftOccasionsHeading: 'Ein Geschenk für jeden Anlass',
      giftOccasions: giftOccasionImages
        .filter((img): img is Media => img !== null)
        .slice(0, 4)
        .map((img, i) => ({
          image: img.id,
          caption: ['Geburtstage', 'Hochzeiten', 'Team Events', 'Weihnachten'][i] ?? 'Occasion',
        })),
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
): Required<
  Pick<Page, 'slug' | 'title' | '_status' | 'voucher'>
> & { hero: Page['hero'] } {
  const v = savedDoc.voucher
  if (!v) throw new Error('Voucher page DE doc has no voucher group')

  return {
    slug: 'voucher',
    title: 'Gift Voucher',
    _status: 'published',
    hero: {
      type: 'none',
    },
    voucher: {
      heroHeading: 'Give the gift of fermentation',
      heroDescription:
        'The perfect gift for foodies and the health-conscious. Choose an amount and optionally a greeting message for your voucher.',
      voucherAmounts: (v.voucherAmounts ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        amount: ['99€'][i] ?? item.amount,
      })),
      deliveryOptions: (v.deliveryOptions ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        type: item.type,
        title:
          i === 0
            ? 'By email to print at home'
            : 'By post with premium card',
        icon: item.icon,
      })),
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
      cardLogo: cardLogo?.id ?? null,
      starterSetImage: starterSetImage?.id ?? null,
      giftOccasionsHeading: 'A gift for every occasion',
      giftOccasions: (v.giftOccasions ?? []).map((item, i) => {
        const occasionImage = giftOccasionImages[i]
        const imageId = occasionImage?.id ?? (typeof item.image === 'string' ? item.image : item.image?.id)
        if (!imageId) return null
        return {
          id: item.id ?? undefined,
          image: imageId,
          caption: ['Birthdays', 'Weddings', 'Team events', 'Christmas'][i] ?? item.caption,
        }
      }).filter((item): item is NonNullable<typeof item> => item !== null),
      faqHeading: 'Frequently asked questions about vouchers',
      faqs: (v.faqs ?? []).map((item, i) => ({
        id: item.id ?? undefined,
        question: [
          'How long is a voucher valid?',
          'Can the voucher be redeemed in instalments?',
          'Where can I enter the code?',
          'Can a voucher be topped up?',
        ][i] ?? item.question,
        answer: [
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
