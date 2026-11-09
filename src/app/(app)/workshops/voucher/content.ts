/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER PAGE — text for the redesigned Gutschein page, both
 *  languages. Phase 1 (design preview on localhost): the page reads
 *  this file directly. Phase 3 moves every line into the "Voucher
 *  Page" admin tab and the seed reuses this file, so nothing is
 *  written twice.
 *
 *  Written for search: the headings carry what people type into
 *  Google (Gutschein, Fermentations-Workshop, Graz, Weihnachts-,
 *  Firmen-, Geburtstagsgeschenk, vegan). Facts only from the
 *  founders' FAQ or tested behaviour. No validity statement
 *  (founders, 2026-11-05).
 * ═══════════════════════════════════════════════════════════════ */

import type { Media as MediaType } from '@/payload-types'

export type VoucherAmount = 99 | 50 | 30 | 20

export const VALUE_AMOUNTS: VoucherAmount[] = [50, 30, 20]
export const ALL_AMOUNTS: VoucherAmount[] = [99, 50, 30, 20]

export type OccasionKey = 'christmas' | 'teams' | 'plant' | 'birthday'

/** What the hero shows on the right: the drawn €99 ticket, a photo, or a photo behind the whole hero */
export type HeroVisual = 'ticket' | 'image' | 'background'
export type HeroBlur = 'none' | 'soft' | 'strong'

/** Media library photos for the occasions: used by the seed, and by the page while the admin has no rows */
export const OCCASION_PHOTOS: Record<OccasionKey, string> = {
  christmas: 'Weihnachtsgeschenk Frau.webp',
  teams: 'diverse-group-of-people-in-cooking-class-2026-03-24-12-54-05-utc.webp',
  plant: 'Käferbohnentempeh gebraten mit Kimchi im Hintergrund_1200x800.webp',
  birthday: 'Andi Wind Geburtstagsfeier Fermentations Workshop.webp',
}

export type OccasionRow = {
  key: OccasionKey | string
  /** Set from the admin (or the fallback photos) by resolveContent */
  image?: MediaType | null
  label: string
  title: string
  text: string
  bullets: string[]
  cta: { kind: 'buy'; amount: VoucherAmount; label: string } | { kind: 'link'; href: string; label: string }
}

const de = {
  sections: { values: true, occasions: true, print: true, faq: true },
  meta: {
    title: 'Gutschein für Fermentations-Workshops in Graz | Fermentfreude',
    description:
      'Geschenkgutschein für einen Fermentations-Workshop in Graz oder unseren Shop: Kombucha, Tempeh & Kimchi selbst machen. Sofort als PDF per E-Mail, mit Grußkarte.',
  },
  ticket: {
    workshop: {
      label: 'Workshop-Geschenkgutschein',
      title: 'Workshop\nGeschenkgutschein',
      text: 'Eine Einladung zu einem besonderen Erlebnis: Kombucha, Tempeh oder Lakto-Gemüse selbst ansetzen, verkosten und mitnehmen.',
    },
    value: {
      label: 'Wertgutschein',
      title: 'Geschenkgutschein',
      text: 'Einlösbar für Workshops und Produkte im Fermentfreude Shop.',
    },
    footer: 'Fermentfreude · Graz',
    stub: 'Für dich',
  },
  card: {
    frontEyebrow: 'Für dich',
    frontWords: 'Von\nHerzen',
    backEyebrow: 'Du bist etwas Besonderes',
    backFor: 'Das hier ist für',
    backFrom: 'Von',
  },
  hero: {
    visual: 'ticket' as HeroVisual,
    image: null as MediaType | null,
    ticketOnBackground: true,
    backgroundBlur: 'soft' as HeroBlur,
    eyebrow: 'Geschenkgutschein · Graz',
    headline: 'Verschenk einen Fermentations-Workshop.',
    text: 'Kombucha, Tempeh oder Lakto-Gemüse selbst ansetzen, verkosten und das eigene Glas mit nach Hause nehmen. Ein Geschenk, das noch Wochen später weiterfermentiert.',
    price: '€99',
    priceNote: 'ein ganzer Workshop nach Wahl, pro Person',
    button: 'Gutschein verschenken',
    secondary: 'Oder einen Betrag schenken',
    points: [
      { icon: 'clock', title: 'Sofort per E-Mail', text: 'Als PDF, in wenigen Minuten' },
      { icon: 'gift', title: 'Grußkarte inklusive', text: 'Zum Ausdrucken und Hineinschreiben' },
      { icon: 'shieldCheck', title: 'Freie Wahl', text: 'Jeder Workshop, jeder Termin' },
    ],
    ticketAlt: 'Workshop-Geschenkgutschein über 99 Euro von Fermentfreude Graz',
  },
  values: {
    eyebrow: 'Wertgutscheine',
    headline: 'Gutscheine für Shop und Workshops.',
    text: 'Für Kimchi, Tempeh und Kombucha aus unserem Shop, oder als Anteil an einem Workshop: Den Rest zahlt man beim Buchen einfach dazu.',
    items: [
      { amount: 50 as const, line: 'Für den großen Einkauf oder den halben Workshop' },
      { amount: 30 as const, line: 'Kimchi, Tempeh und Kombucha zum Probieren' },
      { amount: 20 as const, line: 'Die kleine Geschenkidee mit Geschmack' },
    ] as { amount: 50 | 30 | 20; line: string }[],
    button: 'Verschenken',
    valueName: 'Wertgutschein',
  },
  occasions: {
    eyebrow: 'Geschenkideen',
    headline: 'Ein Geschenk, das man schmeckt.',
    intro: 'Ob unterm Christbaum, fürs ganze Team oder zum Geburtstag: Ein Fermentations-Workshop ist ein Erlebnis, das bleibt. Und das Glas fermentiert zu Hause weiter.',
    rows: [
      {
        key: 'christmas',
        label: 'Weihnachtsgeschenk',
        title: 'Das perfekte Weihnachtsgeschenk: ein Erlebnis statt noch einem Ding.',
        text: 'Statt Socken und Gutscheinkarten von der Stange: ein Workshop, in dem man selbst Kombucha, Tempeh oder Lakto-Gemüse ansetzt. Das eigene Glas kommt mit nach Hause und erinnert noch lange an das Geschenk.',
        bullets: [
          'Sofort per E-Mail, auch noch kurz vor Heiligabend',
          'Mit Grußkarte zum Ausdrucken und Hineinschreiben',
          'Workshop und Termin frei wählbar',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Weihnachtsgeschenk sichern' },
      },
      {
        key: 'teams',
        label: 'Firmengeschenk & Teamevent',
        title: 'Weihnachtsgeschenk für Mitarbeiter:innen, oder ein Tag mit dem ganzen Team.',
        text: 'Schenk deinem Team etwas, das nicht in der Schublade landet. Jede:r löst den Gutschein selbst ein, für einen Workshop oder im Shop. Oder ihr fermentiert gemeinsam: als Teamevent, das man schmeckt.',
        bullets: [
          'Gutscheine für das ganze Team, einzeln einlösbar',
          'Gemeinsamer Workshop als Teamevent',
          'Ab 10 Gutscheinen: schreib uns, wir helfen gern',
        ],
        cta: { kind: 'link', href: '/contact', label: 'Anfrage für Firmen' },
      },
      {
        key: 'plant',
        label: 'Vegan & vegetarisch',
        title: 'Für alle, die pflanzlich genießen, oder es entdecken wollen.',
        text: 'Tempeh, Kimchi und Kombucha sind vegan und voller Geschmack. Ein Workshop zeigt, wie einfach Fermentieren zu Hause geht. Der Wertgutschein passt für alle, die lieber gleich im Shop probieren.',
        bullets: [
          'Handwerklich fermentiert in Graz',
          'Ohne Vorkenntnisse, auch für Einsteiger:innen',
        ],
        cta: { kind: 'buy', amount: 50, label: 'Wertgutschein verschenken' },
      },
      {
        key: 'birthday',
        label: 'Geburtstagsgeschenk',
        title: 'Mach den Geburtstag zu etwas Besonderem.',
        text: 'Für Menschen, die schon alles haben. Außer einem eigenen Glas Kimchi. Ein Workshop-Gutschein ist eine Geschenkidee, die man erlebt, schmeckt und mit nach Hause nimmt.',
        bullets: [
          'Nicht personengebunden, frei übertragbar',
          'Termin wählt die beschenkte Person selbst',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Geburtstagsgeschenk verschenken' },
      },
    ] as OccasionRow[],
  },
  print: {
    eyebrow: 'Zum Ausdrucken',
    headline: 'Die Grußkarte zum Gutschein.',
    text: 'Druck sie aus, schreib ein paar Zeilen hinein und überreich sie zusammen mit dem Gutschein. Den Gutschein selbst bekommst du nach dem Kauf per E-Mail als PDF.',
    button: 'Grußkarte herunterladen (PDF)',
    note: 'A5 quer, Vorder- und Rückseite.',
    file: '/gutschein-karte.pdf',
    cardAlt: 'Grußkarte „Von Herzen“ zum Ausdrucken und Hineinschreiben',
  },
  how: {
    eyebrow: 'So funktioniert’s',
    points: [
      { icon: 'gift', title: 'Gutschein wählen', text: 'Workshop oder Betrag' },
      { icon: 'clock', title: 'Sofort erhalten', text: 'Als PDF per E-Mail' },
      { icon: 'heart', title: 'Grußkarte dazulegen', text: 'Ausdrucken und ein paar Zeilen schreiben' },
      { icon: 'shieldCheck', title: 'Einlösen', text: 'Code beim Bezahlen eingeben' },
    ],
  },
  faq: {
    eyebrow: 'Fragen & Antworten',
    title: 'Häufige Fragen zum Gutschein',
    description: 'Alles zum Kaufen, Verschenken und Einlösen.',
    more: 'Noch Fragen?',
    moreLink: 'Schreib uns',
    items: [
      {
        question: 'Wofür kann ich den Gutschein einlösen?',
        answer:
          'Für alle Fermentations-Workshops bei Fermentfreude in Graz, zum Beispiel Kombucha, Tempeh oder Lakto-Gemüse, und für Produkte in unserem Shop. Der Workshop-Gutschein über 99 € deckt einen ganzen Workshop pro Person.',
      },
      {
        question: 'Wie löse ich den Gutschein ein?',
        answer:
          'Workshop oder Produkte in den Warenkorb legen und beim Bezahlen den Gutschein-Code eingeben. Der Betrag wird sofort abgezogen. Falls etwas nicht klappt, schreib uns einfach.',
      },
      {
        question: 'Was passiert, wenn der Einkauf mehr kostet als der Gutschein?',
        answer:
          'Dann zahlst du den Rest ganz normal online. So lässt sich zum Beispiel auch ein 50-€-Gutschein für einen Workshop verwenden.',
      },
      {
        question: 'Wie bekomme ich den Gutschein?',
        answer:
          'Direkt nach dem Kauf per E-Mail, als PDF zum Ausdrucken oder Weiterleiten. Dazu gibt es unsere Grußkarte zum Ausdrucken und Hineinschreiben.',
      },
      {
        question: 'Muss ich beim Kauf einen Workshop oder Termin auswählen?',
        answer:
          'Nein. Die beschenkte Person wählt Workshop und Termin selbst aus. Wir veröffentlichen regelmäßig neue Termine.',
      },
      {
        question: 'Ist der Gutschein übertragbar?',
        answer: 'Ja, der Gutschein ist nicht personengebunden und kann von jeder Person eingelöst werden.',
      },
      {
        question: 'Braucht man Vorkenntnisse für einen Workshop?',
        answer:
          'Nein, alle Workshops sind so aufgebaut, dass auch Einsteiger:innen ohne Vorkenntnisse mitmachen können.',
      },
      {
        question: 'Gibt es Gutscheine für Firmen und Teams?',
        answer:
          'Ja. Als Weihnachtsgeschenk für Mitarbeiter:innen oder als gemeinsames Teamevent. Für größere Mengen schreib uns an kontakt@fermentfreude.at.',
      },
    ],
  },
  buy: {
    title: 'Gutschein kaufen',
    amountLabel: 'Gutschein',
    workshopChip: 'Workshop',
    deliveryNote:
      'Du bekommst den Gutschein sofort per E-Mail, mit PDF zum Ausdrucken. So kannst du ihn selbst weiterleiten oder persönlich überreichen.',
    submit: 'Weiter zur Zahlung',
    secure: 'Sichere Zahlung über Stripe',
    nameRequired: 'Bitte gib deinen Namen ein.',
    emailRequired: 'Bitte gib deine E-Mail-Adresse ein.',
    invalidEmail: 'Ungültiges E-Mail-Format.',
    checkoutError: 'Fehler beim Checkout.',
    checkoutErrorLater: 'Fehler beim Checkout. Bitte versuche es später.',
    yourName: 'Dein Name *',
    yourNamePlaceholder: 'Vor- und Nachname',
    yourEmail: 'Deine E-Mail-Adresse *',
    processing: 'Wird bearbeitet…',
    close: 'Schließen',
  },
}

export type VoucherContent = typeof de

const en: VoucherContent = {
  sections: { values: true, occasions: true, print: true, faq: true },
  meta: {
    title: 'Gift voucher for fermentation workshops in Graz | Fermentfreude',
    description:
      'Gift voucher for a fermentation workshop in Graz or our shop: make your own kombucha, tempeh and kimchi. Instantly as a PDF by email, with a greeting card.',
  },
  ticket: {
    workshop: {
      label: 'Workshop gift voucher',
      title: 'Workshop\ngift voucher',
      text: 'An invitation to something special: make your own kombucha, tempeh or lacto-fermented vegetables, taste them and take them home.',
    },
    value: {
      label: 'Gift voucher',
      title: 'Gift voucher',
      text: 'Redeemable for workshops and products in the Fermentfreude shop.',
    },
    footer: 'Fermentfreude · Graz',
    stub: 'For you',
  },
  card: {
    frontEyebrow: 'For you',
    frontWords: 'With\nlove',
    backEyebrow: 'You are someone special',
    backFor: 'This is for',
    backFrom: 'From',
  },
  hero: {
    visual: 'ticket',
    image: null,
    ticketOnBackground: true,
    backgroundBlur: 'soft',
    eyebrow: 'Gift voucher · Graz',
    headline: 'Give a fermentation workshop.',
    text: 'Make your own kombucha, tempeh or lacto-fermented vegetables, taste them and take your own jar home. A gift that keeps fermenting for weeks.',
    price: '€99',
    priceNote: 'one full workshop of their choice, per person',
    button: 'Give a voucher',
    secondary: 'Or give an amount',
    points: [
      { icon: 'clock', title: 'Instantly by email', text: 'As a PDF, within minutes' },
      { icon: 'gift', title: 'Greeting card included', text: 'To print and write in' },
      { icon: 'shieldCheck', title: 'Their choice', text: 'Any workshop, any date' },
    ],
    ticketAlt: 'Fermentfreude Graz workshop gift voucher worth 99 euros',
  },
  values: {
    eyebrow: 'Gift vouchers',
    headline: 'Vouchers for the shop and workshops.',
    text: 'For kimchi, tempeh and kombucha from our shop, or towards a workshop: simply pay the rest when booking.',
    items: [
      { amount: 50 as const, line: 'For a big shop, or half a workshop' },
      { amount: 30 as const, line: 'Kimchi, tempeh and kombucha to try' },
      { amount: 20 as const, line: 'The small gift idea full of flavour' },
    ],
    button: 'Give',
    valueName: 'Gift voucher',
  },
  occasions: {
    eyebrow: 'Gift ideas',
    headline: 'A gift you can taste.',
    intro: 'Under the Christmas tree, for the whole team or for a birthday: a fermentation workshop is an experience that stays. And the jar keeps fermenting at home.',
    rows: [
      {
        key: 'christmas',
        label: 'Christmas gift',
        title: 'The perfect Christmas gift: an experience instead of one more thing.',
        text: 'Instead of socks and off-the-shelf gift cards: a workshop where you make your own kombucha, tempeh or lacto-fermented vegetables. The jar comes home with you and keeps the gift in mind for a long time.',
        bullets: [
          'Instantly by email, even just before Christmas Eve',
          'With a greeting card to print and write in',
          'Workshop and date of their choice',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Get the Christmas gift' },
      },
      {
        key: 'teams',
        label: 'Corporate gift & team event',
        title: 'A Christmas gift for your employees, or a day with the whole team.',
        text: 'Give your team something that won’t end up in a drawer. Everyone redeems their voucher themselves, for a workshop or in the shop. Or ferment together: a team event you can taste.',
        bullets: [
          'Vouchers for the whole team, redeemed individually',
          'A shared workshop as a team event',
          'More than 10 vouchers? Write to us, we are happy to help',
        ],
        cta: { kind: 'link', href: '/contact', label: 'Enquiry for companies' },
      },
      {
        key: 'plant',
        label: 'Vegan & vegetarian',
        title: 'For everyone who enjoys plant-based food, or wants to discover it.',
        text: 'Tempeh, kimchi and kombucha are vegan and full of flavour. A workshop shows how easy fermenting at home is. The gift voucher suits everyone who would rather try the shop straight away.',
        bullets: ['Handcrafted and fermented in Graz', 'No experience needed, great for beginners'],
        cta: { kind: 'buy', amount: 50, label: 'Give a gift voucher' },
      },
      {
        key: 'birthday',
        label: 'Birthday gift',
        title: 'Make their birthday something special.',
        text: 'For people who already have everything. Except their own jar of kimchi. A workshop voucher is a gift idea you experience, taste and take home.',
        bullets: ['Not tied to a person, freely transferable', 'They choose the date themselves'],
        cta: { kind: 'buy', amount: 99, label: 'Give a birthday gift' },
      },
    ],
  },
  print: {
    eyebrow: 'Ready to print',
    headline: 'The greeting card for your voucher.',
    text: 'Print it, write a few lines inside and hand it over together with the voucher. You get the voucher itself as a PDF by email after your purchase.',
    button: 'Download the greeting card (PDF)',
    note: 'A5 landscape, front and back.',
    file: '/greeting-card.pdf',
    cardAlt: '“With love” greeting card to print and write in',
  },
  how: {
    eyebrow: 'How it works',
    points: [
      { icon: 'gift', title: 'Choose a voucher', text: 'A workshop or an amount' },
      { icon: 'clock', title: 'Get it instantly', text: 'As a PDF by email' },
      { icon: 'heart', title: 'Add the greeting card', text: 'Print it and write a few lines' },
      { icon: 'shieldCheck', title: 'Redeem', text: 'Enter the code at checkout' },
    ],
  },
  faq: {
    eyebrow: 'Questions & answers',
    title: 'Frequently asked questions about vouchers',
    description: 'Everything about buying, giving and redeeming.',
    more: 'More questions?',
    moreLink: 'Write to us',
    items: [
      {
        question: 'What can I redeem the voucher for?',
        answer:
          'For all fermentation workshops at Fermentfreude in Graz, such as kombucha, tempeh or lacto-fermented vegetables, and for products in our shop. The €99 workshop voucher covers one full workshop per person.',
      },
      {
        question: 'How do I redeem the voucher?',
        answer:
          'Put a workshop or products in the cart and enter the voucher code at checkout. The amount is deducted straight away. If something does not work, just write to us.',
      },
      {
        question: 'What if my purchase costs more than the voucher?',
        answer: 'Then you simply pay the rest online. That way a €50 voucher can also go towards a workshop.',
      },
      {
        question: 'How do I receive the voucher?',
        answer:
          'Straight after your purchase by email, as a PDF to print or forward. You also get our greeting card to print and write in.',
      },
      {
        question: 'Do I have to choose a workshop or date when buying?',
        answer: 'No. The recipient chooses the workshop and date. We publish new dates regularly.',
      },
      {
        question: 'Is the voucher transferable?',
        answer: 'Yes, the voucher is not tied to a person and can be redeemed by anyone.',
      },
      {
        question: 'Do I need any experience for a workshop?',
        answer: 'No, all workshops are designed so that beginners without any experience can join in.',
      },
      {
        question: 'Are there vouchers for companies and teams?',
        answer:
          'Yes. As a Christmas gift for employees or as a shared team event. For larger quantities write to us at kontakt@fermentfreude.at.',
      },
    ],
  },
  buy: {
    title: 'Buy a voucher',
    amountLabel: 'Voucher',
    workshopChip: 'Workshop',
    deliveryNote:
      'You get the voucher straight away by email, with a PDF to print. Forward it yourself or hand it over in person.',
    submit: 'Continue to payment',
    secure: 'Secure payment via Stripe',
    nameRequired: 'Please enter your name.',
    emailRequired: 'Please enter your email address.',
    invalidEmail: 'Invalid email format.',
    checkoutError: 'Checkout error.',
    checkoutErrorLater: 'Checkout error. Please try again later.',
    yourName: 'Your name *',
    yourNamePlaceholder: 'First and last name',
    yourEmail: 'Your email address *',
    processing: 'Processing…',
    close: 'Close',
  },
}

export const VOUCHER_CONTENT = { de, en }

export const getVoucherContent = (locale?: string | null): VoucherContent =>
  locale === 'en' ? en : de
