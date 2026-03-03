/**
 * Seed workshop pages (tempeh, lakto-gemuese, kombucha) in the Pages collection.
 * Each page has the Workshop Page Sections tab with Gift & Online, Learn Online, FAQ, Why Online, Team Building.
 *
 * Run: pnpm seed workshop-pages
 * Or with skip condition: PAYLOAD_SKIP_WORKSHOP_CONDITION=1 pnpm seed workshop-pages
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const WORKSHOP_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha'] as const

const workshopGiftOnlineDE = {
  giftTitle: 'Verschenke ein besonderes Geschmackserlebnis',
  giftDescription:
    'Unsere Gutscheine sind das perfekte Geschenk für Feinschmecker, gesundheitsbewusste Freunde und Hobbyköche. Einlösbar für jeden Workshop vor Ort oder online.',
  giftBuyNowLabel: 'Jetzt kaufen',
  giftBuyVoucherLabel: 'Gutschein kaufen',
  giftBuyNowHref: '/shop',
  giftBuyVoucherHref: '/workshops/voucher',
  onlineTitle: 'Fermentation jederzeit und überall lernen',
  onlineDescription:
    'Keine Zeit für Berlin? Unsere digitalen Workshops bringen die Expertise in deine Küche – mit hochwertigen Video-Tutorials und herunterladbaren Anleitungen.',
  onlineBullets: [
    { text: 'Lebenslanger Zugang zu allen Inhalten' },
    { text: 'Herunterladbare Rezeptbücher' },
    { text: 'Direkte Unterstützung im Schülerforum' },
  ],
  onlineButtonLabel: 'Online-Kurse entdecken',
  onlineButtonHref: '/workshops',
}

const workshopGiftOnlineEN = {
  giftTitle: 'Gift a special tasty experience',
  giftDescription:
    'Our vouchers are the perfect gift for foodies, health-conscious friends, and hobby chefs. Redeemable for any on-site or online workshop.',
  giftBuyNowLabel: 'Buy Now',
  giftBuyVoucherLabel: 'Buy Voucher',
  giftBuyNowHref: '/shop',
  giftBuyVoucherHref: '/workshops/voucher',
  onlineTitle: 'Learn Fermentation Anytime, Anywhere',
  onlineDescription:
    "Can't make it to Berlin? Our digital workshops bring the expertise to your kitchen with high-quality video tutorials and downloadable guides.",
  onlineBullets: [
    { text: 'Lifetime access to all content' },
    { text: 'Downloadable recipe books' },
    { text: 'Direct support in the student forum' },
  ],
  onlineButtonLabel: 'Explore Online Courses',
  onlineButtonHref: '/workshops',
}

const workshopLearnOnlineDE = {
  learnOnlineHeading: 'Lerne Fermentation\nJederzeit, überall',
  learnOnlineDescription:
    'Sofortiger Zugang zu allen Online-Video-Workshops. Kein Warten, keine festen Termine. Starte jetzt und lerne in deinem eigenen Tempo.',
  learnOnlineButtonLabel: 'Online-Kurse entdecken',
  learnOnlineButtonHref: '/workshops',
}

const workshopLearnOnlineEN = {
  learnOnlineHeading: 'Learn Fermentation\nAnytime, Anywhere',
  learnOnlineDescription:
    'Instant access to all online video workshops. No waiting, no scheduled appointments. Start now and learn at your own pace.',
  learnOnlineButtonLabel: 'Explore Online Courses',
  learnOnlineButtonHref: '/workshops',
}

const workshopFaqDE = {
  faqHeading: 'Du hast Fragen zu Fermentieren?',
  faqSubtitle: 'Klicke, um alle Antworten zu sehen!',
  faqItems: [
    { question: 'Wie lange dauert ein Workshop?', answer: 'Unsere Workshops dauern in der Regel 2,5 bis 3 Stunden.' },
    { question: 'Muss ich Vorkenntnisse mitbringen?', answer: 'Nein, alle Workshops sind für Einsteiger konzipiert.' },
    { question: 'Kann ich den Workshop verschenken?', answer: 'Ja, wir bieten Gutscheine für alle Workshops an.' },
    { question: 'Wo finden die Workshops statt?', answer: 'In Berlin-Neukölln. Die genaue Adresse erhältst du nach der Buchung.' },
    { question: 'Was passiert bei Absage?', answer: 'Du kannst bis 48 Stunden vorher kostenlos stornieren.' },
    { question: 'Gibt es Online-Alternativen?', answer: 'Ja, wir bieten auch digitale Workshops und Kurse an.' },
  ],
}

const workshopFaqEN = {
  faqHeading: 'Do you have questions about Fermentation?',
  faqSubtitle: 'Click to view all the answers!',
  faqItems: [
    { question: 'How long does a workshop last?', answer: 'Our workshops typically last 2.5 to 3 hours.' },
    { question: 'Do I need prior experience?', answer: 'No, all workshops are designed for beginners.' },
    { question: 'Can I gift a workshop?', answer: 'Yes, we offer vouchers for all workshops.' },
    { question: 'Where do the workshops take place?', answer: "In Berlin-Neukölln. You'll receive the exact address after booking." },
    { question: 'What happens if I cancel?', answer: 'You can cancel free of charge up to 48 hours before.' },
    { question: 'Are there online alternatives?', answer: 'Yes, we also offer digital workshops and courses.' },
  ],
}

const whyOnlineFeaturesDE = [
  { icon: 'lightning' as const, title: 'Sofortiger Zugang', description: 'Direkter Zugang nach dem Kauf – keine Wartezeit' },
  { icon: 'clock' as const, title: 'Dein Tempo', description: 'Pausieren, wiederholen, wann immer du möchtest' },
  { icon: 'home' as const, title: 'Von Zuhause', description: 'Lerne bequem in deiner eigenen Küche' },
  { icon: 'book' as const, title: 'Rezepte & PDFs', description: 'Alle Rezepte zum Download verfügbar' },
]

const workshopWhyOnlineDE = {
  whyOnlineHeading: 'Warum unsere Online-Workshops?',
  whyOnlineFeatures: whyOnlineFeaturesDE,
}

const whyOnlineFeaturesEN = [
  { icon: 'lightning' as const, title: 'Instant Access', description: 'Direct access after purchase – no waiting time' },
  { icon: 'clock' as const, title: 'Your Pace', description: 'Pause, repeat, whenever you want' },
  { icon: 'home' as const, title: 'From Home', description: 'Learn comfortably in your own kitchen' },
  { icon: 'book' as const, title: 'Recipes & PDFs', description: 'All recipes available for download' },
]

const workshopWhyOnlineEN = {
  whyOnlineHeading: 'Why Our Online Workshops?',
  whyOnlineFeatures: whyOnlineFeaturesEN,
}

const workshopTeamBuildingDE = {
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
}

const workshopTeamBuildingEN = {
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
}

const TITLES: Record<(typeof WORKSHOP_SLUGS)[number], { de: string; en: string }> = {
  tempeh: { de: 'Tempeh', en: 'Tempeh' },
  'lakto-gemuese': { de: 'Lakto-Gemüse', en: 'Lacto-Vegetables' },
  kombucha: { de: 'Kombucha', en: 'Kombucha' },
}

async function seedWorkshopPages() {
  const payload = await getPayload({ config })
  const env = { ...process.env, PAYLOAD_SKIP_WORKSHOP_CONDITION: '1' }

  for (const slug of WORKSHOP_SLUGS) {
    const titles = TITLES[slug]
    payload.logger.info(`Seeding workshop page: ${slug}`)

    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    const pageData = {
      title: titles.de,
      slug,
      _status: 'published' as const,
      workshopGiftOnline: workshopGiftOnlineDE,
      workshopLearnOnline: workshopLearnOnlineDE,
      workshopFaq: workshopFaqDE,
      workshopWhyOnline: workshopWhyOnlineDE,
      workshopTeamBuilding: workshopTeamBuildingDE,
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        locale: 'de',
        data: pageData as never,
        context: ctx,
      })
    } else {
      await payload.create({
        collection: 'pages',
        locale: 'de',
        data: pageData as never,
        context: ctx,
      })
    }

    const enData = {
      title: titles.en,
      workshopGiftOnline: workshopGiftOnlineEN,
      workshopLearnOnline: workshopLearnOnlineEN,
      workshopFaq: workshopFaqEN,
      workshopWhyOnline: workshopWhyOnlineEN,
      workshopTeamBuilding: workshopTeamBuildingEN,
    }

    const doc = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (doc.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: doc.docs[0].id,
        locale: 'en',
        data: enData as never,
        context: ctx,
      })
    }
  }

  payload.logger.info('✅ Workshop pages seeded (tempeh, lakto-gemuese, kombucha)')
  payload.logger.info('   Edit at: /admin/collections/pages')
}

seedWorkshopPages().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
