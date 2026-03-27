/**
 * Seed the workshopDetail tab for the tempeh page.
 *
 * Populates ONLY the sections rendered on tempeh frontend:
 * - Hero (eyebrow, title, description, attributes, image)
 * - Voucher CTA (eyebrow, title, description, pills, primary/secondary labels)
 * - FAQ (eyebrow, title, description, faqItems)
 * - How-To (eyebrow, title, description — articles loaded from Posts collection)
 *
 * ⚠️  IMAGES ARE NOT SEEDED
 * Images (heroImage, voucherBackgroundImage) are managed entirely through the admin UI.
 *
 * Run:  pnpm seed tempeh-detail
 *       pnpm seed tempeh-detail --force   (overwrite existing text content)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const isForce = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════
//  DE — German seed data for Tempeh
// ═══════════════════════════════════════════════════════════════

const workshopDetailDE = {
  // ── Calendar Toggle ────────────────────────────────────
  showSeasonalCalendar: false,

  // ── 1. Hero ────────────────────────────────────────────
  heroEyebrow: 'Workshop Experience',
  heroTitle: 'Die Kunst der\nTempeh-Fermentation',
  heroDescription:
    'Tauche ein in die Welt des Tempehs. Lerne Schritt für Schritt, wie du Tempeh selbst herstellst — vom Ansetzen bis zum fertigen, aromatischen Ferment.',
  heroAttributes: [{ text: '3 Stunden' }, { text: 'Hands-on' }, { text: 'Experience' }],

  // ── 2. Booking Card ────────────────────────────────────
  bookingEyebrow: '3-STUNDEN HANDS-ON WORKSHOP',
  bookingPrice: 85,
  bookingPriceSuffix: 'pro Person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Stunden' },
    { text: 'Hands-on' },
    { text: 'Exklusiv' },
    { text: 'Max. 10 Personen' },
  ],
  bookingViewDatesLabel: 'Termine & Buchen',
  bookingHideDatesLabel: 'Termine ausblenden',
  bookingMoreDetailsLabel: 'Mehr Informationen',
  bookingBookLabel: 'Buchen',
  bookingSpotsLabel: 'Plätze frei',

  // ── 3. Workshop Details (About, Schedule, Included, Why, Experience, Dates) ────
  aboutHeading: 'Über den Workshop',
  aboutText:
    'Tauche ein in die faszinierende Welt des Tempehs — ein indonesisches Fermentationsklassiker mit großem Potenzial für Liebhaber pflanzlicher Proteine. In diesem praxisorientierten Workshop lernst du Schritt für Schritt, wie du Tempeh selbst herstellst, von der Vorbereitung bis zur fertigen Fermentation. Du wirst entdecken, welche Bedingungen Tempeh für optimales Wachstum benötigt — Wissen, das du sofort zu Hause anwenden kannst. Egal ob Anfänger oder neugieriger Feinschmecker, dieser Workshop ist für alle gedacht, die ihre Fermentationsfähigkeiten erweitern und pflanzliche Proteine entdecken möchten.',

  scheduleHeading: 'Ablauf (3 Stunden)',
  schedule: [
    {
      duration: '45 Min',
      title: 'Fermentations-Grundlagen',
      description:
        'Tauche zusammen mit uns in die Welt der Fermentation ein. Lerne, wie Fermentation funktioniert, welche Vorteile sie bietet, und erhalte einen spannenden Überblick über die wichtigsten Techniken.',
    },
    {
      duration: '90 Min',
      title: 'Praxis: Dein eigenes Tempeh ansetzen',
      description:
        'Jetzt wird es praktisch. Unter Anleitung stellst du dein eigenes Tempeh her – komplett mit Starter, Bohnen und Gärgefäß. Wir zeigen dir, wie du die ideale Umgebung zu Hause mit einfachen Mitteln schaffst (Ofen mit Lampenfunktion, Dörrautomat, Wärmekiste oder Heizraum).',
    },
    {
      duration: '45 Min',
      title: 'Verkostung: Tempeh-Burger',
      description:
        'Zum Abschluss wird es köstlich. Wir braten frisch gereiftes Tempeh und kreieren saftige Tempeh-Burger mit verschiedenen fermentierten Beilagen. Ein echtes Geschmackserlebnis — natürlich auch in veganer Form.',
    },
  ],

  includedHeading: 'Im Preis enthalten (€99)',
  includedItems: [
    { text: 'Frisch angesetztes Tempeh im Gärgefäß zum Mitnehmen' },
    { text: 'Komplettes Tempeh-Set für zu Hause (Bohnen, Starter & Gefäß)' },
    { text: 'Umfassendes Skript mit allen Infos & Rezepten' },
    { text: 'Gemeinsame Verkostung (Tempeh-Burger + fermentierte Beilagen) + Getränke' },
    { text: 'Anleitung zur Fermentationsumgebung zu Hause' },
    { text: 'Fehlerbehebbungs-Referenzkarte' },
    { text: 'Digitale Ressourcensammlung' },
    { text: '14-Tage E-Mail-Support' },
  ],

  whyHeading: 'Warum dieser Workshop?',
  whyPoints: [
    {
      bold: 'Pflanzliches Protein:',
      rest: ' Tempeh ist eine vollständige Proteinquelle mit allen essentiellen Aminosäuren — perfekt für Veganer, Vegetarier und alle, die alternative Proteine erforschen.',
    },
    {
      bold: 'Lebende Kulturen:',
      rest: ' Im Gegensatz zu Tofu ist Tempeh ein lebendiges, atmendes Ferment mit einzigartigen Aromen und Nährstoffvorteilen, die sich im Laufe der Zeit entwickeln.',
    },
    {
      bold: 'DIY-Nachhaltigkeit:',
      rest: ' Stelle dein eigenes Tempeh zu Hause mit einfachen, erschwinglichen Zutaten her — keine spezielle Ausrüstung oder komplizierte Prozesse erforderlich.',
    },
    {
      bold: 'Kulinarische Vielseitigkeit:',
      rest: ' Wenn du Tempeh beherrschst, wirst du unzählige Möglichkeiten entdecken, es zuzubereiten — von Burgern bis zu Pfannengerichten, Salaten und Sandwiches.',
    },
  ],

  experienceEyebrow: 'WAS DICH ERWARTET',
  experienceTitle: 'Dein Workshop-Erlebnis',
  experienceCards: [
    {
      eyebrow: 'THEORIE',
      title: 'Fermentations-Mikrobiologie',
      description:
        'Entdecke die Wissenschaft hinter der Tempeh-Fermentation. Lerne, warum Tempeh eine vollständige pflanzliche Proteinquelle mit allen essentiellen Aminosäuren ist, und verstehe die Biologie, die es so besonders macht.',
    },
    {
      eyebrow: 'PRAXIS',
      title: 'Dein eigenes Tempeh ansetzen',
      description:
        'Unter fachkundiger Anleitung stellst du dein eigenes Tempeh mit Starterkultur und Sojabohnen her. Du kreierst ein lebendiges Ferment, das du mit nach Hause nimmst — bereit, in deiner eigenen Küche 24 Stunden zu reifen.',
    },
    {
      eyebrow: 'VERKOSTUNG',
      title: 'Tempeh-Burger',
      description:
        'Brate frisches Tempeh an und kreiere köstliche Burger mit fermentierten Beilagen und handwerklichem Brot. Triff den Unterschied, den frisch hergestelltes Tempeh auf dem Teller macht — vegane Option selbstverständlich enthalten.',
    },
  ],

  datesHeading: 'Nächste Workshops',
  dates: [
    {
      id: 'tempeh-1',
      date: '20. Februar 2026',
      time: '14:00 – 17:00',
      spotsLeft: 6,
    },
    {
      id: 'tempeh-2',
      date: '27. Februar 2026',
      time: '10:00 – 13:00',
      spotsLeft: 4,
    },
    {
      id: 'tempeh-3',
      date: '10. März 2026',
      time: '14:00 – 17:00',
      spotsLeft: 9,
    },
    {
      id: 'tempeh-4',
      date: '20. März 2026',
      time: '10:00 – 13:00',
      spotsLeft: 10,
    },
  ],

  // UI labels (German defaults)
  viewDatesLabel: 'Termine & Buchen',
  hideDatesLabel: 'Termine ausblenden',
  moreInfoLabel: 'Mehr Informationen',
  bookLabel: 'Buchen',
  spotsLabel: 'Plätze verfügbar',
  closeLabel: 'Schließen',

  // Booking modal
  confirmHeading: 'Buchung bestätigen',
  confirmSubheading: 'Überprüfe deine Angaben',
  workshopLabel: 'Workshop',
  dateLabel: 'Datum',
  timeLabel: 'Uhrzeit',
  totalLabel: 'Summe',
  cancelLabel: 'Abbrechen',
  confirmLabel: 'Buchung bestätigen',
  modalConfirmSubheading: 'Bitte überprüfe deine Buchung',
  modalWorkshopLabel: 'Workshop',
  modalDateLabel: 'Datum',
  modalTimeLabel: 'Uhrzeit',
  modalTotalLabel: 'Gesamtbetrag',
  modalCancelLabel: 'Abbrechen',
  modalConfirmLabel: 'Bestätigen',

  // ── 3. How-To Articles ─────────────────────────────────
  howToEyebrow: 'FERMENTATIONS-LEITFADEN',
  howToTitle: 'Schritt-für-Schritt Anleitungen',
  howToDescription: 'Detaillierte Anleitungen für jede Fermentationsmethode.',

  // ── 4. Voucher CTA ─────────────────────────────────────
  voucherEyebrow: 'GEMEINSAM FERMENTIEREN',
  voucherTitle: 'Schenke Tempeh-Abenteuer',
  voucherDescription:
    'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und gesundheitsbewusste Freunde.',
  voucherPrimaryLabel: 'Gutschein kaufen',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Zum Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [
    { text: 'Sofort einlösbar' },
    { text: 'Für alle Workshops' },
    { text: 'Digital oder gedruckt' },
  ],

  // ── 5. FAQ ──────────────────────────────────────────────
  faqEyebrow: 'HÄUFIG GESTELLTE FRAGEN',
  faqTitle: 'Du hast Fragen zu Tempeh?',
  faqItems: [
    {
      question: 'Muss ich den Ofen für 24 Stunden freihalten?',
      answer:
        'Ja, nach dem Workshop solltest du deinen Ofen (oder eine alternative Wärmequelle wie einen Dörrautomat oder eine Thermobox) für etwa 24 Stunden freihalten, damit dein Tempeh richtig fermentieren kann.',
    },
    {
      question: 'Ist der Workshop für Anfänger geeignet?',
      answer:
        'Absolut! Der Workshop ist für jeden konzipiert — ob Anfänger oder neugieriger Genießer. Keine Vorkenntnisse erforderlich.',
    },
    {
      question: 'Kann ich den Workshop verschenken?',
      answer:
        'Ja, wir bieten Gutscheine für alle Workshops an, die jederzeit eingelöst werden können.',
    },
    {
      question: 'Ist der Tempeh vegan?',
      answer:
        'Tempeh ist pflanzlich, wird aber aus Sojabohnen hergestellt. Im Workshop zeigen wir auch Alternativen mit anderen Hülsenfrüchten.',
    },
    {
      question: 'Was passiert nach dem Workshop?',
      answer:
        'Dein frisch angesetzter Tempeh fermentiert zuhause. Nach etwa 24 Stunden ist er bereit zum Kochen. Du erhältst ein komplettes Kit mit Anleitung.',
    },
    {
      question: 'Gibt es Online-Optionen?',
      answer:
        'Derzeit bieten wir den Tempeh-Workshop nur vor Ort an. Aber wir arbeiten an digitalen Ressourcen für Online-Lerner!',
    },
  ],

  // ── 7. Other Workshops Slider ──────────────────────────
  sliderHeading: 'Entdecke weitere Workshops',
  sliderSubtitle:
    'Wähle deinen Weg in die Welt der Mikroorganismen. Jeder Workshop ist für Einsteiger und Enthusiasten konzipiert.',
  sliderPillLabel: 'WORKSHOP-ART',
  sliderBuyLabel: 'Jetzt buchen',
  sliderMoreInfoLabel: 'Mehr erfahren',

  // ── 8. All Dates Section ──────────────────────────────
  allDatesHeading: 'Alle Termine',
  allDatesSubtitle: 'Finde den perfekten Workshop-Termin für dich.',
  allDatesSlotsLabel: 'Plätze frei',
  allDatesFilterAllLabel: 'Alle Workshops',

  // ── 9. Generic Booking Labels ─────────────────────────
  genericDateLabel: 'Datum',
  genericQuantityLabel: 'Anzahl',
  genericDetailsLabel: 'Workshop Details',
  genericReserveLabel: 'Platz reservieren',
  genericTimeLabel: 'Startet um 11:00 Uhr',

  // ── 10. Gift & Online Section ─────────────────────────
  giftTitle: 'Verschenke ein besonderes Geschmackserlebnis',
  giftDescription:
    'Unsere Gutscheine sind das perfekte Geschenk für Feinschmecker, gesundheitsbewusste Freunde und Hobbyköche. Einlösbar für jeden Workshop vor Ort oder online.',
  giftBuyNowLabel: 'Jetzt kaufen',
  giftBuyNowHref: '/shop',
  giftBuyVoucherLabel: 'Gutschein kaufen',
  giftBuyVoucherHref: '/workshops/voucher',
  onlineTitle: 'Fermentation jederzeit und überall lernen',
  onlineDescription:
    'Keine Zeit für Berlin? Unsere digitalen Workshops bringen die Expertise in deine Küche – mit hochwertigen Video-Tutorials und herunterladbaren Anleitungen.',
  onlineButtonLabel: 'Online-Kurse entdecken',
  onlineButtonHref: '/workshops',
  onlineBullets: [
    { text: 'Lebenslanger Zugang zu allen Inhalten' },
    { text: 'Herunterladbare Rezeptbücher' },
    { text: 'Direkte Unterstützung im Schülerforum' },
  ],

  // ── 11. Generic FAQ Section ───────────────────────────
  genericFaqHeading: 'Du hast Fragen zu Fermentieren?',
  genericFaqSubtitle: 'Klicke, um alle Antworten zu sehen!',
  genericFaqItems: [
    { question: 'Wie lange dauert ein Workshop?', answer: 'Unsere Workshops dauern in der Regel 2,5 bis 3 Stunden.' },
    { question: 'Muss ich Vorkenntnisse mitbringen?', answer: 'Nein, alle Workshops sind für Einsteiger konzipiert.' },
    { question: 'Kann ich den Workshop verschenken?', answer: 'Ja, wir bieten Gutscheine für alle Workshops an.' },
    { question: 'Wo finden die Workshops statt?', answer: 'In Berlin-Neukölln. Die genaue Adresse erhältst du nach der Buchung.' },
    { question: 'Was passiert bei Absage?', answer: 'Du kannst bis 48 Stunden vorher kostenlos stornieren.' },
    { question: 'Gibt es Online-Alternativen?', answer: 'Ja, wir bieten auch digitale Workshops und Kurse an.' },
  ],

  // ── 12. Team Building Section ─────────────────────────
  teamEyebrow: 'Firmenveranstaltungen',
  teamHeading: 'Fermentation als Teambuilding',
  teamDescription:
    'Auf der Suche nach einem einzigartigen Team-Erlebnis? Unsere B2B-Workshops fördern die Zusammenarbeit durch den meditativen und bereichernden Prozess des gemeinsamen Fermentierens. Bei uns im Studio oder bei Ihnen im Büro.',
  teamBullets: [
    { text: 'Maßgeschneiderte Workshop-Themen' },
    { text: 'Catering inklusive' },
    { text: 'Mitnahme-Gläser für jeden Teilnehmer' },
  ],
  teamCtaLabel: 'Anfrage senden',
  teamCtaHref: '/contact',

  // ── 13. Learn Online Section ──────────────────────────
  learnOnlineHeading: 'Lerne Fermentation\nJederzeit, überall',
  learnOnlineDescription:
    'Sofortiger Zugang zu allen Online-Video-Workshops. Kein Warten, keine festen Termine. Starte jetzt und lerne in deinem eigenen Tempo.',
  learnOnlineButtonLabel: 'Online-Kurse entdecken',
  learnOnlineButtonHref: '/workshops',

  // ── 14. Why Online Section ────────────────────────────
  whyOnlineHeading: 'Warum unsere Online-Workshops?',
  whyOnlineFeatures: [
    { icon: 'lightning' as const, title: 'Sofortiger Zugang', description: 'Direkter Zugang nach dem Kauf – keine Wartezeit' },
    { icon: 'clock' as const, title: 'Dein Tempo', description: 'Pausieren, wiederholen, wann immer du möchtest' },
    { icon: 'home' as const, title: 'Von Zuhause', description: 'Lerne bequem in deiner eigenen Küche' },
    { icon: 'book' as const, title: 'Rezepte & PDFs', description: 'Alle Rezepte zum Download verfügbar' },
  ],
}

// ═══════════════════════════════════════════════════════════════
//  EN — English seed data for Tempeh
// ═══════════════════════════════════════════════════════════════

const workshopDetailEN = {
  // ── Calendar Toggle ────────────────────────────────────
  showSeasonalCalendar: false,

  heroEyebrow: 'Workshop Experience',
  heroTitle: 'The Art of\nTempeh Fermentation',
  heroDescription:
    'Dive into the fascinating world of tempeh. Learn step by step how to make tempeh yourself — from setup to finished, aromatic ferment.',
  heroAttributes: [{ text: '3 Hours' }, { text: 'Hands-on' }, { text: 'Experience' }],

  // ── 2. Booking Card ────────────────────────────────────
  bookingEyebrow: '3-HOUR HANDS-ON WORKSHOP',
  bookingPrice: 85,
  bookingPriceSuffix: 'per person',
  bookingCurrency: '€',
  bookingAttributes: [
    { text: '3 Hours' },
    { text: 'Hands-on' },
    { text: 'Exclusive' },
    { text: 'Max. 10 people' },
  ],
  bookingViewDatesLabel: 'View Dates & Book',
  bookingHideDatesLabel: 'Hide Dates',
  bookingMoreDetailsLabel: 'More Information',
  bookingBookLabel: 'Book',
  bookingSpotsLabel: 'spots available',

  // ── 3. Workshop Details (About, Schedule, Included, Why, Experience, Dates) ────
  aboutHeading: 'About the Workshop',
  aboutText:
    "Explore the fascinating world of tempeh — an Indonesian fermentation classic with huge potential for plant-based protein lovers. In this hands-on workshop, you will learn step by step how to make tempeh yourself, from setup to finished ferment. You will discover what conditions tempeh needs for optimal growth — knowledge you can apply immediately at home. Whether you're a beginner or a curious food enthusiast, this workshop is designed for everyone interested in expanding their fermentation skills and discovering plant-based proteins.",

  scheduleHeading: 'Schedule (3 Hours)',
  schedule: [
    {
      duration: '45 min',
      title: 'Fermentation Fundamentals',
      description:
        'Dive into the world of fermentation together. Learn how fermentation works, what benefits it offers, and get an exciting overview of the most important techniques.',
    },
    {
      duration: '90 min',
      title: 'Practice: Setting Your Tempeh',
      description:
        'Now it gets practical. Under guidance, you set up your own tempeh - complete with starter, beans, and fermentation vessel. We show you how to create the ideal environment at home using simple means (oven with light function, dehydrator, heat box, or heating room).',
    },
    {
      duration: '45 min',
      title: 'Tasting: Tempeh Burgers',
      description:
        'At the end it gets delicious. We fry freshly ripened tempeh and create juicy tempeh burgers with various fermented side dishes. A real taste experience — of course also available in vegan form.',
    },
  ],

  includedHeading: 'Included in Price (€99)',
  includedItems: [
    { text: 'Fresh, set tempeh in fermentation vessel to take home' },
    { text: 'Complete tempeh kit for home (beans, starter & vessel)' },
    { text: 'Comprehensive script with all info & recipes' },
    { text: 'Joint tasting (tempeh burgers + fermented sides) + drinks' },
    { text: 'Home setup guide for fermentation conditions' },
    { text: 'Troubleshooting reference card' },
    { text: 'Digital resource collection' },
    { text: '14-day email support' },
  ],

  whyHeading: 'Why This Workshop?',
  whyPoints: [
    {
      bold: 'Plant-Based Protein:',
      rest: ' Tempeh is a complete protein source with all essential amino acids — perfect for vegans, vegetarians, and anyone exploring alternative proteins.',
    },
    {
      bold: 'Living Cultures:',
      rest: ' Unlike tofu, tempeh is a living, breathing ferment with unique flavors and nutritional benefits that develop over time.',
    },
    {
      bold: 'DIY Sustainability:',
      rest: ' Make your own tempeh at home using simple, affordable ingredients — no special equipment or complicated processes.',
    },
    {
      bold: 'Culinary Versatility:',
      rest: " Once you master tempeh, you'll discover countless ways to cook it — from burgers to stir-fries, salads, and sandwiches.",
    },
  ],

  experienceEyebrow: 'WHAT TO EXPECT',
  experienceTitle: 'Your Workshop Experience',
  experienceCards: [
    {
      eyebrow: 'THEORY',
      title: 'Fermentation Science',
      description:
        'Discover the science behind tempeh fermentation. Learn why tempeh is a complete plant-based protein with all essential amino acids, and understand the biology that makes it so special.',
    },
    {
      eyebrow: 'PRACTICE',
      title: 'Set Your Own Tempeh',
      description:
        "Under expert guidance, set up your own tempeh with starter culture and soybeans. You'll create a living ferment that goes home with you — ready to mature over 24 hours in your own kitchen.",
    },
    {
      eyebrow: 'TASTING',
      title: 'Tempeh Burgers',
      description:
        'Sauté fresh tempeh and build delicious burgers with fermented sides and artisan bread. Taste the difference freshly made tempeh brings to your plate — vegan option always included.',
    },
  ],

  datesHeading: 'Next Workshops',
  dates: [
    {
      id: 'tempeh-1',
      date: 'February 20, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 6,
    },
    {
      id: 'tempeh-2',
      date: 'February 27, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 4,
    },
    {
      id: 'tempeh-3',
      date: 'March 10, 2026',
      time: '2:00 PM – 5:00 PM',
      spotsLeft: 9,
    },
    {
      id: 'tempeh-4',
      date: 'March 20, 2026',
      time: '10:00 AM – 1:00 PM',
      spotsLeft: 10,
    },
  ],

  // UI labels (English defaults)
  viewDatesLabel: 'View Dates & Book',
  hideDatesLabel: 'Hide Dates',
  moreInfoLabel: 'More Information',
  bookLabel: 'Book',
  spotsLabel: 'spots left',
  closeLabel: 'Close',

  // Booking modal
  confirmHeading: 'Confirm Booking',
  confirmSubheading: 'Review your details',
  workshopLabel: 'Workshop',
  dateLabel: 'Date',
  timeLabel: 'Time',
  totalLabel: 'Total',
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm Booking',

  // ── 3. How-To Articles ─────────────────────────────────
  howToEyebrow: 'FERMENTATION GUIDE',
  howToTitle: 'Step-by-Step Instructions',
  howToDescription: 'Detailed guides for each fermentation method.',

  // ── 4. Voucher CTA ─────────────────────────────────────
  voucherEyebrow: 'FERMENT TOGETHER',
  voucherTitle: 'Give a Tempeh Adventure',
  voucherDescription:
    'Give someone a special experience — our vouchers are the perfect gift for foodies and health-conscious friends.',
  voucherPrimaryLabel: 'Buy Voucher',
  voucherPrimaryHref: '/voucher',
  voucherSecondaryLabel: 'Visit Shop',
  voucherSecondaryHref: '/shop',
  voucherPills: [
    { text: 'Instantly Redeemable' },
    { text: 'For All Workshops' },
    { text: 'Digital or Printed' },
  ],

  faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
  faqTitle: 'Do you have questions about tempeh?',
  faqItems: [
    {
      question: 'Do I need to keep my oven free for 24 hours?',
      answer:
        'Yes, after the workshop you should keep your oven (or an alternative heat source like a dehydrator or heat box) free for about 24 hours so your tempeh can ferment properly.',
    },
    {
      question: 'Is the workshop suitable for beginners?',
      answer:
        'Absolutely! The workshop is designed for everyone — whether beginner or curious food enthusiast. No prior knowledge required.',
    },
    {
      question: 'Can I gift the workshop?',
      answer: 'Yes, we offer vouchers for all workshops that can be redeemed at any time.',
    },
    {
      question: 'Is tempeh vegan?',
      answer:
        'Tempeh is plant-based, made from soybeans. In the workshop we also show alternatives using other legumes.',
    },
    {
      question: 'What happens after the workshop?',
      answer:
        "Your freshly set tempeh ferments at home. After about 24 hours it's ready to cook. You receive a complete kit with instructions.",
    },
    {
      question: 'Are there online options?',
      answer:
        "Currently we only offer the Tempeh workshop on-site. But we're working on digital resources for online learners!",
    },
  ],

  // ── 7. Other Workshops Slider ──────────────────────────
  sliderHeading: 'Discover Other Workshops',
  sliderSubtitle:
    'Choose your path into the world of microorganisms. Each workshop is designed for beginners and enthusiasts alike.',
  sliderPillLabel: 'WORKSHOP TYPE',
  sliderBuyLabel: 'Book now',
  sliderMoreInfoLabel: 'Learn more',

  // ── 8. All Dates Section ──────────────────────────────
  allDatesHeading: 'All Appointments',
  allDatesSubtitle: 'Find the perfect workshop appointment for you.',
  allDatesSlotsLabel: 'spots available',
  allDatesFilterAllLabel: 'All workshops',

  // ── 9. Generic Booking Labels ─────────────────────────
  genericDateLabel: 'Date',
  genericQuantityLabel: 'Quantity',
  genericDetailsLabel: 'Workshop Details',
  genericReserveLabel: 'Reserve Your Spot',
  genericTimeLabel: 'Starts at 11:00 AM',

  // ── 10. Gift & Online Section ─────────────────────────
  giftTitle: 'Gift a special tasty experience',
  giftDescription:
    'Our vouchers are the perfect gift for foodies, health-conscious friends, and hobby chefs. Redeemable for any on-site or online workshop.',
  giftBuyNowLabel: 'Buy Now',
  giftBuyNowHref: '/shop',
  giftBuyVoucherLabel: 'Buy Voucher',
  giftBuyVoucherHref: '/workshops/voucher',
  onlineTitle: 'Learn Fermentation Anytime, Anywhere',
  onlineDescription:
    "Can't make it to Berlin? Our digital workshops bring the expertise to your kitchen with high-quality video tutorials and downloadable guides.",
  onlineButtonLabel: 'Explore Online Courses',
  onlineButtonHref: '/workshops',
  onlineBullets: [
    { text: 'Lifetime access to all content' },
    { text: 'Downloadable recipe books' },
    { text: 'Direct support in the student forum' },
  ],

  // ── 11. Generic FAQ Section ───────────────────────────
  genericFaqHeading: 'Do you have questions about Fermentation?',
  genericFaqSubtitle: 'Click to view all the answers!',
  genericFaqItems: [
    { question: 'How long does a workshop last?', answer: 'Our workshops typically last 2.5 to 3 hours.' },
    { question: 'Do I need prior experience?', answer: 'No, all workshops are designed for beginners.' },
    { question: 'Can I gift a workshop?', answer: 'Yes, we offer vouchers for all workshops.' },
    { question: 'Where do the workshops take place?', answer: "In Berlin-Neukölln. You'll receive the exact address after booking." },
    { question: 'What happens if I cancel?', answer: 'You can cancel free of charge up to 48 hours before.' },
    { question: 'Are there online alternatives?', answer: 'Yes, we also offer digital workshops and courses.' },
  ],

  // ── 12. Team Building Section ─────────────────────────
  teamEyebrow: 'Corporate Events',
  teamHeading: 'Fermentation as Team Building',
  teamDescription:
    'Looking for a unique team experience? Our B2B workshops are designed to foster collaboration through the meditative and rewarding process of fermenting together. Available at our studio or your office.',
  teamBullets: [
    { text: 'Customized workshop themes' },
    { text: 'Catering included' },
    { text: 'Take-home jars for every participant' },
  ],
  teamCtaLabel: 'Request Quote',
  teamCtaHref: '/contact',

  // ── 13. Learn Online Section ──────────────────────────
  learnOnlineHeading: 'Learn Fermentation\nAnytime, Anywhere',
  learnOnlineDescription:
    'Instant access to all online video workshops. No waiting, no scheduled appointments. Start now and learn at your own pace.',
  learnOnlineButtonLabel: 'Explore Online Courses',
  learnOnlineButtonHref: '/workshops',

  // ── 14. Why Online Section ────────────────────────────
  whyOnlineHeading: 'Why Our Online Workshops?',
  whyOnlineFeatures: [
    { icon: 'lightning' as const, title: 'Instant Access', description: 'Direct access after purchase – no waiting time' },
    { icon: 'clock' as const, title: 'Your Pace', description: 'Pause, repeat, whenever you want' },
    { icon: 'home' as const, title: 'From Home', description: 'Learn comfortably in your own kitchen' },
    { icon: 'book' as const, title: 'Recipes & PDFs', description: 'All recipes available for download' },
  ],
}

// ═══════════════════════════════════════════════════════════════
//  Seed Logic
// ═══════════════════════════════════════════════════════════════

async function seedTempehDetail() {
  const payload = await getPayload({ config })
  const pageSlug = 'tempeh'

  try {
    // ── Find the existing page ──────────────────────────────
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageSlug } },
      locale: 'de',
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length === 0) {
      payload.logger.error(`❌ Page "${pageSlug}" not found. Run "pnpm seed workshop-pages" first.`)
      process.exit(1)
    }

    const page = existing.docs[0]
    const pageId = page.id

    // ── Non-destructive check ───────────────────────────────
    const detail = (page as unknown as Record<string, unknown>).workshopDetail as
      | Record<string, unknown>
      | undefined
    if (detail?.aboutText && !isForce) {
      payload.logger.info(
        `⏭️  workshopDetail already has data for "${pageSlug}". Use --force to overwrite.`,
      )
      process.exit(0)
    }

    // STEP 1: Save German content
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" (DE)...`)
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      data: { workshopDetail: workshopDetailDE },
      context: ctx,
    })

    // STEP 2: Read back to capture any generated IDs
    const dePage = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })

    // STEP 3: Merge English data (reuse any IDs from German)
    const mergedEN = {
      ...workshopDetailEN,
      // Preserve any generated IDs from German arrays
      heroAttributes: dePage.workshopDetail?.heroAttributes?.map((attr, i) => ({
        ...workshopDetailEN.heroAttributes?.[i],
        id: attr.id,
      })),
      voucherPills: dePage.workshopDetail?.voucherPills?.map((pill, i) => ({
        ...workshopDetailEN.voucherPills?.[i],
        id: pill.id,
      })),
      faqItems: dePage.workshopDetail?.faqItems?.map((item, i) => ({
        ...workshopDetailEN.faqItems?.[i],
        id: item.id,
      })),
      onlineBullets: (dePage.workshopDetail as Record<string, unknown>)?.onlineBullets
        ? ((dePage.workshopDetail as Record<string, unknown>).onlineBullets as Array<{ id?: string }>).map((item, i) => ({
            ...workshopDetailEN.onlineBullets?.[i],
            id: item.id,
          }))
        : workshopDetailEN.onlineBullets,
      genericFaqItems: (dePage.workshopDetail as Record<string, unknown>)?.genericFaqItems
        ? ((dePage.workshopDetail as Record<string, unknown>).genericFaqItems as Array<{ id?: string }>).map((item, i) => ({
            ...workshopDetailEN.genericFaqItems?.[i],
            id: item.id,
          }))
        : workshopDetailEN.genericFaqItems,
      teamBullets: (dePage.workshopDetail as Record<string, unknown>)?.teamBullets
        ? ((dePage.workshopDetail as Record<string, unknown>).teamBullets as Array<{ id?: string }>).map((item, i) => ({
            ...workshopDetailEN.teamBullets?.[i],
            id: item.id,
          }))
        : workshopDetailEN.teamBullets,
      whyOnlineFeatures: (dePage.workshopDetail as Record<string, unknown>)?.whyOnlineFeatures
        ? ((dePage.workshopDetail as Record<string, unknown>).whyOnlineFeatures as Array<{ id?: string }>).map((item, i) => ({
            ...workshopDetailEN.whyOnlineFeatures?.[i],
            id: item.id,
          }))
        : workshopDetailEN.whyOnlineFeatures,
    }

    // STEP 4: Save English content with preserved IDs
    console.log(`[${new Date().toLocaleTimeString()}] Seeding "${pageSlug}" (EN)...`)
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      data: { workshopDetail: mergedEN },
      context: ctx,
    })

    // STEP 5: Link tempeh posts as howToArticles (if not already linked)
    const currentPage = await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })

    const hasHowToArticles =
      currentPage.workshopDetail?.howToArticles &&
      Array.isArray(currentPage.workshopDetail.howToArticles) &&
      currentPage.workshopDetail.howToArticles.length > 0

    if (!hasHowToArticles) {
      console.log(`[${new Date().toLocaleTimeString()}] Linking tempeh articles...`)

      // Query for tempeh posts
      const tempehPosts = await payload.find({
        collection: 'posts',
        where: { workshopType: { equals: 'tempeh' } },
        limit: 50,
        locale: 'de',
        depth: 0,
      })

      const postIds = tempehPosts.docs.map((post) => post.id)

      if (postIds.length > 0) {
        // Update both locales with post IDs
        await payload.update({
          collection: 'pages',
          id: pageId,
          locale: 'de',
          data: { workshopDetail: { ...workshopDetailDE, howToArticles: postIds } },
          context: ctx,
        })

        await payload.update({
          collection: 'pages',
          id: pageId,
          locale: 'en',
          data: { workshopDetail: { ...mergedEN, howToArticles: postIds } },
          context: ctx,
        })

        console.log(
          `[${new Date().toLocaleTimeString()}] ✅ Linked ${postIds.length} tempeh articles to workshopDetail`,
        )
      }
    }

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ workshopDetail seeded for "${pageSlug}" (DE + EN)`,
    )
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Error seeding "${pageSlug}":`, error)
    process.exit(1)
  }
}

seedTempehDetail()
