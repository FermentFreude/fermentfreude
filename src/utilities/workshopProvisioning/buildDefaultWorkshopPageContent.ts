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
  experienceEyebrow: string
  experienceTitle: string
  experienceCards: Array<{
    eyebrow: string
    title: string
    description: string
  }>
  scheduleSteps: Array<{ duration: string; title: string; description: string }>
  includedItemsDefault: string[]
  whyPointsDefault: Array<{ bold: string; rest: string }>
  sliderHeading: string
  sliderSubtitle: string
  sliderPillLabel: string
  sliderBuyLabel: string
  sliderMoreInfoLabel: string
  faqContactPrompt: string
  faqContactLinkLabel: string
  faqContactEmail: string
  soldOutLabel: string
  noDatesMessage: string
  modalGuestCountLabel: string
  modalAvailableSpotsPrefix: string
  modalSpotsUnit: string
  modalCapacityWarning: string
  modalReduceGuestsLabel: string
  modalChooseDifferentDateLabel: string
  modalAddToCartLabel: string
  modalAddingLabel: string
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
  experienceEyebrow: 'WAS DICH ERWARTET',
  experienceTitle: 'Dein Workshop-Erlebnis',
  experienceCards: [
    {
      eyebrow: 'THEORIE',
      title: 'Grundlagen der Fermentation',
      description:
        'Verstehe die Wissenschaft hinter dem Prozess — Mikroorganismen, Sicherheit und warum Fermentation so gut schmeckt.',
    },
    {
      eyebrow: 'PRAXIS',
      title: 'Hands-on am Tisch',
      description:
        'Unter Anleitung stellst du dein eigenes Ferment her und nimmst alles Wissen direkt mit nach Hause.',
    },
    {
      eyebrow: 'VERKOSTUNG',
      title: 'Probieren & Genießen',
      description:
        'Am Ende verkosten wir gemeinsam — du erlebst den Unterschied frisch fermentierter Aromen.',
    },
  ],
  scheduleSteps: [
    {
      duration: '01',
      title: 'Willkommen & Theorie',
      description: 'Kurzer Überblick: Wie funktioniert Fermentation? Welche Utensilien brauchst du?',
    },
    {
      duration: '02',
      title: 'Praxis',
      description: 'Schritt für Schritt stellst du dein Ferment her — mit Tipps von erfahrenen Guides.',
    },
    {
      duration: '03',
      title: 'Verkostung & Abschluss',
      description: 'Gemeinsames Probieren, Fragen beantworten und mit deinem Ferment nach Hause gehen.',
    },
  ],
  includedItemsDefault: [
    'Alle Zutaten & Materialien',
    'Dein Ferment zum Mitnehmen',
    'Ausführliches Skript mit Rezepten',
    'Getränke während des Workshops',
  ],
  whyPointsDefault: [
    {
      bold: 'Für Einsteiger:',
      rest: ' Keine Vorkenntnisse nötig — wir führen dich Schritt für Schritt.',
    },
    {
      bold: 'Hands-on:',
      rest: ' Du arbeitest selbst und nimmst dein Ferment mit nach Hause.',
    },
    {
      bold: 'Kleine Gruppe:',
      rest: ' Maximal 12 Personen — persönliche Betreuung inklusive.',
    },
  ],
  sliderHeading: 'Entdecke weitere Workshops',
  sliderSubtitle:
    'Wähle deinen Weg in die Welt der Mikroorganismen. Jeder Workshop ist für Einsteiger und Enthusiasten konzipiert.',
  sliderPillLabel: 'WORKSHOP-ART',
  sliderBuyLabel: 'Buchen',
  sliderMoreInfoLabel: 'Mehr erfahren',
  faqContactPrompt: 'Noch Fragen?',
  faqContactLinkLabel: 'Schreib uns',
  faqContactEmail: 'kontakt@fermentfreude.at',
  soldOutLabel: 'Ausgebucht',
  noDatesMessage: 'Aktuell keine Termine geplant — schau bald wieder vorbei.',
  modalGuestCountLabel: 'Anzahl Personen',
  modalAvailableSpotsPrefix: 'Verfügbar für dieses Datum:',
  modalSpotsUnit: 'Plätze',
  modalCapacityWarning:
    'Sie möchten {requested} Plätze buchen, aber nur {available} sind verfügbar.',
  modalReduceGuestsLabel: 'Auf {count} reduzieren',
  modalChooseDifferentDateLabel: 'Anderes Datum wählen',
  modalAddToCartLabel: 'In den Warenkorb',
  modalAddingLabel: 'Wird hinzugefügt...',
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
  experienceEyebrow: 'WHAT TO EXPECT',
  experienceTitle: 'Your Workshop Experience',
  experienceCards: [
    {
      eyebrow: 'THEORY',
      title: 'Fermentation fundamentals',
      description:
        'Understand the science behind the process — microorganisms, safety, and why fermentation tastes so good.',
    },
    {
      eyebrow: 'PRACTICE',
      title: 'Hands-on at the table',
      description:
        'Under guidance you make your own ferment and take everything you learn straight home with you.',
    },
    {
      eyebrow: 'TASTING',
      title: 'Taste & enjoy',
      description:
        'We finish with a shared tasting — experience the difference of freshly fermented flavours.',
    },
  ],
  scheduleSteps: [
    {
      duration: '01',
      title: 'Welcome & theory',
      description: 'A quick overview: how does fermentation work? What tools do you need?',
    },
    {
      duration: '02',
      title: 'Hands-on practice',
      description: 'Step by step you make your ferment — with tips from experienced guides.',
    },
    {
      duration: '03',
      title: 'Tasting & wrap-up',
      description: 'Shared tasting, Q&A, and take your ferment home with you.',
    },
  ],
  includedItemsDefault: [
    'All ingredients & materials',
    'Your ferment to take home',
    'Detailed script with recipes',
    'Drinks during the workshop',
  ],
  whyPointsDefault: [
    {
      bold: 'For beginners:',
      rest: ' No prior experience needed — we guide you step by step.',
    },
    {
      bold: 'Hands-on:',
      rest: ' You work yourself and take your ferment home with you.',
    },
    {
      bold: 'Small groups:',
      rest: ' Maximum 12 people — personal guidance included.',
    },
  ],
  sliderHeading: 'Discover Other Workshops',
  sliderSubtitle:
    'Choose your path into the world of microorganisms. Each workshop is designed for beginners and enthusiasts alike.',
  sliderPillLabel: 'WORKSHOP TYPE',
  sliderBuyLabel: 'Book',
  sliderMoreInfoLabel: 'Learn more',
  faqContactPrompt: 'Still have questions?',
  faqContactLinkLabel: 'Get in touch',
  faqContactEmail: 'kontakt@fermentfreude.at',
  soldOutLabel: 'Sold out',
  noDatesMessage: 'No dates scheduled yet — check back soon.',
  modalGuestCountLabel: 'Number of guests',
  modalAvailableSpotsPrefix: 'Available for this date:',
  modalSpotsUnit: 'spots',
  modalCapacityWarning:
    'You want to book {requested} spots but only {available} are available.',
  modalReduceGuestsLabel: 'Reduce to {count}',
  modalChooseDifferentDateLabel: 'Choose a different date',
  modalAddToCartLabel: 'Add to cart',
  modalAddingLabel: 'Adding...',
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
      blockType: 'whatToExpect' as const,
      enabled: true,
      experienceEyebrow: copy.experienceEyebrow,
      experienceTitle: copy.experienceTitle,
      experienceCards: copy.experienceCards,
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
      schedule: copy.scheduleSteps,
      includedHeading: copy.includedHeading(price),
      includedItems: copy.includedItemsDefault.map((text) => ({ text })),
      whyHeading: copy.whyHeading,
      whyPoints: copy.whyPointsDefault,
      datesHeading: copy.datesHeading,
      soldOutLabel: copy.soldOutLabel,
      noDatesMessage: copy.noDatesMessage,
      modalConfirmHeading: copy.modalConfirmHeading,
      modalConfirmSubheading: copy.modalConfirmSubheading,
      modalWorkshopLabel: 'Workshop',
      modalDateLabel: copy.modalDateLabel,
      modalTimeLabel: copy.modalTimeLabel,
      modalTotalLabel: copy.modalTotalLabel,
      modalCancelLabel: copy.modalCancelLabel,
      modalConfirmLabel: copy.modalConfirmLabel,
      modalGuestCountLabel: copy.modalGuestCountLabel,
      modalAvailableSpotsPrefix: copy.modalAvailableSpotsPrefix,
      modalSpotsUnit: copy.modalSpotsUnit,
      modalCapacityWarning: copy.modalCapacityWarning,
      modalReduceGuestsLabel: copy.modalReduceGuestsLabel,
      modalChooseDifferentDateLabel: copy.modalChooseDifferentDateLabel,
      modalAddToCartLabel: copy.modalAddToCartLabel,
      modalAddingLabel: copy.modalAddingLabel,
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
      faqContactEmail: copy.faqContactEmail,
      faqContactPrompt: copy.faqContactPrompt,
      faqContactLinkLabel: copy.faqContactLinkLabel,
      faqContactHref: '/contact',
    },
    {
      blockType: 'moreWorkshops' as const,
      enabled: true,
      sliderHeading: copy.sliderHeading,
      sliderSubtitle: copy.sliderSubtitle,
      sliderPillLabel: copy.sliderPillLabel,
      sliderBuyLabel: copy.sliderBuyLabel,
      sliderMoreInfoLabel: copy.sliderMoreInfoLabel,
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
