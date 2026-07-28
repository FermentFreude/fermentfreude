type LocaleCopy = {
  heroEyebrow: string
  heroDescription: string
  bookingEyebrow: string
  aboutText: string
  faqTitle: string
  faqDescription: string
  faqItems: Array<{ question: string; answer: string }>
  priceSuffix: string
  attrHours: string
  attrHandsOn: string
  attrExperience: string
  attrMax: string
  viewDates: string
  hideDates: string
  moreDetails: string
  book: string
  spots: string
  aboutHeading: string
  scheduleHeading: string
  includedHeading: (price: number) => string
  whyHeading: string
  datesHeading: string
  modalConfirmHeading: string
  modalConfirmSubheading: string
  modalDateLabel: string
  modalTimeLabel: string
  modalTotalLabel: string
  modalCancelLabel: string
  modalConfirmLabel: string
  howToEyebrow: string
  howToTitle: string
  howToDescription: string
}

const DE: LocaleCopy = {
  heroEyebrow: 'Workshop Experience',
  heroDescription:
    'Hands-on Fermentations-Workshop mit erfahrenen Guides — ideal für Einsteiger und Enthusiasten.',
  bookingEyebrow: '3-STUNDEN HANDS-ON WORKSHOP',
  aboutText:
    'Entdecke die Welt der Fermentation in einem praxisorientierten Workshop. Lerne Schritt für Schritt und nimm dein Wissen direkt mit nach Hause.',
  faqTitle: 'Häufige Fragen',
  faqDescription: 'Antworten auf die wichtigsten Fragen zu diesem Workshop.',
  faqItems: [
    {
      question: 'Wie lange dauert der Workshop?',
      answer: 'In der Regel 2,5 bis 3 Stunden.',
    },
    {
      question: 'Brauche ich Vorkenntnisse?',
      answer: 'Nein — der Workshop ist für Einsteiger konzipiert.',
    },
    {
      question: 'Wo findet der Workshop statt?',
      answer: 'In Berlin-Neukölln. Die genaue Adresse erhältst du nach der Buchung.',
    },
  ],
  priceSuffix: 'pro Person',
  attrHours: '3 Stunden',
  attrHandsOn: 'Hands-on',
  attrExperience: 'Experience',
  attrMax: 'Max. 12 Personen',
  viewDates: 'Termine & Buchen',
  hideDates: 'Termine ausblenden',
  moreDetails: 'Mehr Informationen',
  book: 'Buchen',
  spots: 'Plätze frei',
  aboutHeading: 'Über den Workshop',
  scheduleHeading: 'Ablauf (3 Stunden)',
  includedHeading: (price) => `Im Preis enthalten (€${price})`,
  whyHeading: 'Warum dieser Workshop?',
  datesHeading: 'Nächste Workshops',
  modalConfirmHeading: 'Reservierung bestätigen',
  modalConfirmSubheading: 'Bitte prüfe deine Buchungsdetails vor dem Checkout.',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamtbetrag',
  modalCancelLabel: 'Abbrechen',
  modalConfirmLabel: 'Bestätigen',
  howToEyebrow: 'Anleitungen',
  howToTitle: 'So startest du',
  howToDescription: 'Tipps und Anleitungen rund ums Fermentieren.',
}

const EN: LocaleCopy = {
  heroEyebrow: 'Workshop Experience',
  heroDescription:
    'Hands-on fermentation workshop with experienced guides — perfect for beginners and enthusiasts.',
  bookingEyebrow: '3-HOUR HANDS-ON WORKSHOP',
  aboutText:
    'Discover the world of fermentation in a hands-on workshop. Learn step by step and take your knowledge home with you.',
  faqTitle: 'Frequently Asked Questions',
  faqDescription: 'Answers to the most common questions about this workshop.',
  faqItems: [
    {
      question: 'How long does the workshop last?',
      answer: 'Typically 2.5 to 3 hours.',
    },
    {
      question: 'Do I need prior experience?',
      answer: 'No — the workshop is designed for beginners.',
    },
    {
      question: 'Where does the workshop take place?',
      answer: "In Berlin-Neukölln. You'll receive the exact address after booking.",
    },
  ],
  priceSuffix: 'per person',
  attrHours: '3 hours',
  attrHandsOn: 'Hands-on',
  attrExperience: 'Experience',
  attrMax: 'Max. 12 people',
  viewDates: 'View Dates & Book',
  hideDates: 'Hide Dates',
  moreDetails: 'Learn More',
  book: 'Book',
  spots: 'spots available',
  aboutHeading: 'About this Workshop',
  scheduleHeading: 'Schedule (3 Hours)',
  includedHeading: (price) => `Included in the Price (€${price})`,
  whyHeading: 'Why This Workshop?',
  datesHeading: 'Upcoming Workshops',
  modalConfirmHeading: 'Confirm Reservation',
  modalConfirmSubheading: 'Review your booking details before proceeding to checkout.',
  modalDateLabel: 'Date',
  modalTimeLabel: 'Time',
  modalTotalLabel: 'Total',
  modalCancelLabel: 'Cancel',
  modalConfirmLabel: 'Confirm Booking',
  howToEyebrow: 'Guides',
  howToTitle: 'How to Get Started',
  howToDescription: 'Tips and guides for fermentation at home.',
}

function buildPageSections(title: string, price: number, copy: LocaleCopy) {
  return [
    {
      blockType: 'hero' as const,
      enabled: true,
      heroEyebrow: copy.heroEyebrow,
      heroTitle: title,
      heroDescription: copy.heroDescription,
      heroAttributes: [
        { text: copy.attrHours },
        { text: copy.attrHandsOn },
        { text: copy.attrExperience },
      ],
    },
    {
      blockType: 'booking' as const,
      enabled: true,
      bookingEyebrow: copy.bookingEyebrow,
      bookingTitle: title,
      bookingPrice: price,
      bookingPriceSuffix: copy.priceSuffix,
      bookingCurrency: '€',
      bookingAttributes: [
        { text: copy.attrHours },
        { text: copy.attrHandsOn },
        { text: copy.attrExperience },
        { text: copy.attrMax },
      ],
      bookingViewDatesLabel: copy.viewDates,
      bookingHideDatesLabel: copy.hideDates,
      bookingMoreDetailsLabel: copy.moreDetails,
      bookingBookLabel: copy.book,
      bookingSpotsLabel: copy.spots,
      aboutHeading: copy.aboutHeading,
      aboutText: copy.aboutText,
      scheduleHeading: copy.scheduleHeading,
      schedule: [],
      includedHeading: copy.includedHeading(price),
      includedItems: [],
      whyHeading: copy.whyHeading,
      whyPoints: [],
      datesHeading: copy.datesHeading,
      modalConfirmHeading: copy.modalConfirmHeading,
      modalConfirmSubheading: copy.modalConfirmSubheading,
      modalWorkshopLabel: 'Workshop',
      modalDateLabel: copy.modalDateLabel,
      modalTimeLabel: copy.modalTimeLabel,
      modalTotalLabel: copy.modalTotalLabel,
      modalCancelLabel: copy.modalCancelLabel,
      modalConfirmLabel: copy.modalConfirmLabel,
    },
    {
      blockType: 'howTo' as const,
      enabled: true,
      howToEyebrow: copy.howToEyebrow,
      howToTitle: copy.howToTitle,
      howToDescription: copy.howToDescription,
    },
    {
      blockType: 'faq' as const,
      enabled: true,
      faqEyebrow: 'FAQ',
      faqTitle: copy.faqTitle,
      faqDescription: copy.faqDescription,
      faqItems: copy.faqItems,
    },
    {
      blockType: 'moreWorkshops' as const,
      enabled: true,
    },
    {
      blockType: 'voucher' as const,
      enabled: true,
      useGlobalVoucherData: true,
    },
  ]
}

export function buildDefaultWorkshopPageDE(title: string, price: number) {
  return {
    layoutTemplate: 'standard' as const,
    heroStyle: 'default' as const,
    pageSections: buildPageSections(title, price, DE),
  }
}

export function buildDefaultWorkshopPageEN(title: string, price: number) {
  return {
    pageSections: buildPageSections(title, price, EN),
  }
}

export function buildDefaultPageShellDE(pageSlug: string, title: string) {
  return {
    title,
    slug: pageSlug,
    pageKind: 'workshop-detail' as const,
    _status: 'published' as const,
    hero: { type: 'none' as const },
  }
}

export function buildDefaultPageShellEN(title: string) {
  return { title }
}
