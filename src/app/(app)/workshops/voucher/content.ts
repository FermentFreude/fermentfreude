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
  sections: { values: false, occasions: true, print: true, faq: true },
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
    backEyebrow: 'Für einen besonderen Menschen',
    backFor: 'Das hier ist für',
    backFrom: 'Von',
  },
  hero: {
    visual: 'ticket' as HeroVisual,
    image: null as MediaType | null,
    ticketOnBackground: true,
    backgroundBlur: 'soft' as HeroBlur,
    eyebrow: 'Geschenkgutschein',
    headline: 'Verschenke einen Workshop voller Geschmack.',
    text: 'Ob Kombucha, Tempeh oder fermentiertes Gemüse wie Kimchi – gemeinsam fermentieren, verkosten und genießen. Die selbstgemachten Fermente dürfen natürlich mit nach Hause!',
    price: '€99',
    priceNote: 'Ein Workshop nach Wahl für eine Person',
    button: 'Gutschein verschenken',
    secondary: 'Oder einen Betrag schenken',
    points: [
      { icon: 'clock', title: 'Sofort per E-Mail', text: 'Als PDF direkt nach dem Kauf' },
      { icon: 'gift', title: 'Grußkarte inklusive', text: 'Zum Ausdrucken und Beschriften' },
      { icon: 'shieldCheck', title: 'Freie Wahl', text: 'Workshop und Termin selbst auswählen' },
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
    intro: 'Ob zu Weihnachten, zum Geburtstag oder einfach als besondere Überraschung: Verschenke gemeinsame Genussmomente, neue Erfahrungen und die Freude am Selbermachen.',
    rows: [
      {
        key: 'christmas',
        label: 'Weihnachtsgeschenk',
        title: 'Ein Erlebnis, das in Erinnerung bleibt.',
        text: 'Statt noch einem Geschenk von der Stange: Überrasche deine Liebsten mit einem besonderen Erlebnis. Gemeinsam fermentieren, Neues entdecken und genießen – mit selbstgemachten Fermenten für zu Hause.',
        bullets: [
          'Sofort per E-Mail, auch kurz vor Heiligabend',
          'Mit Grußkarte zum Ausdrucken und Beschriften',
          'Workshop und Termin frei wählbar',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Gutschein kaufen' },
      },
      {
        key: 'teams',
        label: 'Firmengeschenke & Teamevents',
        title: 'Ein Erlebnis, das verbindet.',
        text: 'Ob als besonderes Dankeschön für Mitarbeiter:innen oder als gemeinsames Teamevent: Verschenke ein Erlebnis voller Geschmack! Bei uns wird fermentiert, verkostet und Neues entdeckt. Eine genussvolle Abwechslung abseits des Arbeitsalltags.',
        bullets: [
          'Workshop-Gutscheine für Mitarbeiter:innen – frei einlösbar',
          'Einfach & unkompliziert – Gutscheine zum Ausdrucken, ohne Terminabstimmung',
          'Gemeinsame Fermentations-Workshops als Teamevent',
        ],
        cta: { kind: 'link', href: '/contact', label: 'Anfrage für Firmen' },
      },
      {
        key: 'birthday',
        label: 'Geburtstagsgeschenk',
        title: 'Für alle, die schon alles haben. Fast.',
        text: 'Überrasche das Geburtstagskind mit einem besonderen Erlebnis voller Geschmack, neuer Entdeckungen und Spaß am Selbermachen. Oder feiert gleich gemeinsam bei uns!',
        bullets: [
          'Ein besonderes Geschenk statt noch mehr Dinge',
          'Workshop und Termin frei wählbar',
          'Geburtstagsfeier als Fermentations-Workshop auf Anfrage',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Gutschein kaufen' },
      },
    ] as OccasionRow[],
  },
  print: {
    eyebrow: 'Zum Ausdrucken',
    headline: 'Eine persönliche Grußkarte zum Gutschein.',
    text: 'Ein paar persönliche Worte machen dein Geschenk noch besonderer. Lade unsere Grußkarte kostenlos herunter, druck sie aus und ergänze deine eigene Botschaft. Den Gutschein selbst erhältst du nach dem Kauf als PDF per E-Mail.',
    button: 'Grußkarte herunterladen (PDF)',
    note: 'A5 quer, Vorder- und Rückseite.',
    file: '/gutschein-karte.pdf',
    cardAlt: 'Grußkarte „Von Herzen“ zum Ausdrucken und Hineinschreiben',
  },
  how: {
    eyebrow: 'So funktioniert’s',
    points: [
      { icon: 'gift', title: 'Gutschein kaufen', text: '99 € für einen Workshop nach Wahl' },
      { icon: 'clock', title: 'Sofort erhalten', text: 'Als PDF per E-Mail' },
      { icon: 'heart', title: 'Persönlich verschenken', text: 'Grußkarte ausdrucken und beschriften' },
      { icon: 'shieldCheck', title: 'Workshop buchen', text: 'Workshop und Termin wählen, Gutscheincode einlösen' },
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
          'Für alle unsere Fermentations-Workshops in Graz – ob Kombucha, Tempeh oder fermentiertes Gemüse. Der 99-€-Gutschein beinhaltet einen Workshop nach Wahl für eine Person.',
      },
      {
        question: 'Wie löse ich den Gutschein ein?',
        answer:
          'Workshop oder Produkte in den Warenkorb legen und beim Bezahlen den Gutscheincode eingeben. Der Betrag wird sofort abgezogen. Falls etwas nicht klappt, schreib uns einfach.',
      },
      {
        question: 'Was passiert, wenn der Einkauf mehr kostet als der Gutschein?',
        answer:
          'Dann bezahlst du einfach die Differenz. Der Gutscheinbetrag wird beim Bezahlen automatisch abgezogen.',
      },
      {
        question: 'Wie bekomme ich den Gutschein?',
        answer:
          'Direkt nach dem Kauf per E-Mail als PDF zum Ausdrucken oder Weiterleiten. Unsere Grußkarte kannst du zusätzlich kostenlos herunterladen.',
      },
      {
        question: 'Muss ich beim Kauf einen Workshop oder Termin auswählen?',
        answer:
          'Nein. Die beschenkte Person wählt Workshop und Termin selbst aus. Wir veröffentlichen regelmäßig neue Termine.',
      },
      {
        question: 'Ist der Gutschein übertragbar?',
        answer: 'Ja, der Gutschein ist nicht personengebunden und kann von jeder Person mit dem Gutscheincode eingelöst werden.',
      },
      {
        question: 'Braucht man Vorkenntnisse für einen Workshop?',
        answer:
          'Nein, alle Workshops sind so aufgebaut, dass auch Einsteiger:innen ohne Vorkenntnisse mitmachen können.',
      },
      {
        question: 'Gibt es Gutscheine für Firmen und Teams?',
        answer:
          'Ja! Ob als Mitarbeitergeschenk, Weihnachtsgeschenk oder gemeinsames Teamevent – schreib uns einfach an kontakt@fermentfreude.at.',
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
  sections: { values: false, occasions: true, print: true, faq: true },
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
    backEyebrow: 'For someone special',
    backFor: 'This is for',
    backFrom: 'From',
  },
  hero: {
    visual: 'ticket',
    image: null,
    ticketOnBackground: true,
    backgroundBlur: 'soft',
    eyebrow: 'Gift voucher',
    headline: 'Give a workshop full of flavour.',
    text: 'Kombucha, tempeh or fermented vegetables like kimchi – ferment, taste and enjoy together. And of course the homemade ferments go home with you!',
    price: '€99',
    priceNote: 'One workshop of their choice for one person',
    button: 'Give a voucher',
    secondary: 'Or give an amount',
    points: [
      { icon: 'clock', title: 'Instantly by email', text: 'As a PDF right after purchase' },
      { icon: 'gift', title: 'Greeting card included', text: 'To print and write on' },
      { icon: 'shieldCheck', title: 'Their choice', text: 'They pick the workshop and date' },
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
    intro: 'For Christmas, a birthday or simply as a special surprise: give shared moments of enjoyment, new experiences and the joy of making things yourself.',
    rows: [
      {
        key: 'christmas',
        label: 'Christmas gift',
        title: 'An experience to remember.',
        text: 'Instead of yet another off-the-shelf present: surprise your loved ones with a special experience. Ferment together, discover something new and enjoy – with homemade ferments to take home.',
        bullets: [
          'Instantly by email, even just before Christmas Eve',
          'With a greeting card to print and write on',
          'Workshop and date of their choice',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Buy a voucher' },
      },
      {
        key: 'teams',
        label: 'Corporate gifts & team events',
        title: 'An experience that brings people together.',
        text: 'As a special thank-you for your employees or as a shared team event: give an experience full of flavour! With us you ferment, taste and discover something new – an enjoyable change from everyday work.',
        bullets: [
          'Workshop vouchers for employees – redeem any time',
          'Simple & easy – printable vouchers, no scheduling needed',
          'Fermentation workshops together as a team event',
        ],
        cta: { kind: 'link', href: '/contact', label: 'Enquiry for companies' },
      },
      {
        key: 'birthday',
        label: 'Birthday gift',
        title: 'For people who have everything. Almost.',
        text: 'Surprise the birthday person with a special experience full of flavour, new discoveries and the fun of making things yourself. Or celebrate together with us!',
        bullets: [
          'A special gift instead of more stuff',
          'Workshop and date of their choice',
          'Birthday party as a fermentation workshop on request',
        ],
        cta: { kind: 'buy', amount: 99, label: 'Buy a voucher' },
      },
    ],
  },
  print: {
    eyebrow: 'Ready to print',
    headline: 'A personal greeting card for your voucher.',
    text: 'A few personal words make your gift even more special. Download our greeting card for free, print it and add your own message. You get the voucher itself as a PDF by email after your purchase.',
    button: 'Download the greeting card (PDF)',
    note: 'A5 landscape, front and back.',
    file: '/greeting-card.pdf',
    cardAlt: '“With love” greeting card to print and write in',
  },
  how: {
    eyebrow: 'How it works',
    points: [
      { icon: 'gift', title: 'Buy a voucher', text: '€99 for a workshop of their choice' },
      { icon: 'clock', title: 'Get it instantly', text: 'As a PDF by email' },
      { icon: 'heart', title: 'Give it personally', text: 'Print the greeting card and write on it' },
      { icon: 'shieldCheck', title: 'Book a workshop', text: 'Choose workshop and date, redeem the voucher code' },
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
          'For all our fermentation workshops in Graz – kombucha, tempeh or fermented vegetables. The €99 voucher covers one workshop of their choice for one person.',
      },
      {
        question: 'How do I redeem the voucher?',
        answer:
          'Put a workshop or products in the cart and enter the voucher code at checkout. The amount is deducted straight away. If something does not work, just write to us.',
      },
      {
        question: 'What if my purchase costs more than the voucher?',
        answer: 'Then you simply pay the difference. The voucher amount is deducted automatically at checkout.',
      },
      {
        question: 'How do I receive the voucher?',
        answer:
          'Straight after your purchase by email as a PDF to print or forward. You can also download our greeting card for free.',
      },
      {
        question: 'Do I have to choose a workshop or date when buying?',
        answer: 'No. The recipient chooses the workshop and date. We publish new dates regularly.',
      },
      {
        question: 'Is the voucher transferable?',
        answer: 'Yes, the voucher is not tied to a person and can be redeemed by anyone with the voucher code.',
      },
      {
        question: 'Do I need any experience for a workshop?',
        answer: 'No, all workshops are designed so that beginners without any experience can join in.',
      },
      {
        question: 'Are there vouchers for companies and teams?',
        answer:
          'Yes! As a gift for employees, a Christmas present or a shared team event – just write to us at kontakt@fermentfreude.at.',
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
