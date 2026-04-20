/**
 * Seed the Gastronomy page in the Pages collection with all sections.
 * Seeds both DE and EN locales. Content is under Pages → Gastronomy page.
 * Uploads images to Payload Media (R2) for offer cards, workshop cards, and contact section when seed-assets exist.
 *
 * Run: pnpm seed gastronomy
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import type { Media } from '@/payload-types'
import config from '@payload-config'

loadEnv()
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

function readLocalFile(filePath: string) {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1).toLowerCase()
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  }
  return {
    name: path.basename(filePath),
    data,
    mimetype: mimeMap[ext] || 'application/octet-stream',
    size: data.byteLength,
  }
}

/** Lexical root must have at least one child — empty root causes "editor state is empty" error */
const LEXICAL_ROOT_WITH_PARAGRAPH = {
  root: {
    type: 'root' as const,
    children: [
      {
        type: 'paragraph' as const,
        children: [
          {
            type: 'text' as const,
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text: '',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

function gastronomyDataDE(media: {
  offer1?: Media
  offer2?: Media
  offer3?: Media
  workshop1?: Media
  workshop2?: Media
  workshop3?: Media
  contact?: Media
}) {
  return {
    gastronomyHeroCtaLabel: 'Entdecken',
    gastronomyHeroCtaUrl: '#offer',
    gastronomyOfferSectionTitle: 'Was wir anbieten',
    gastronomyOfferCards: [
      {
        image: media.offer1?.id ?? null,
        title: 'Professionelles Training',
        description:
          'Heben Sie die kulinarischen Fähigkeiten Ihres Teams mit maßgeschneiderten Fermentations-Workshops.',
      },
      {
        image: media.offer2?.id ?? null,
        title: 'Firmenveranstaltungen',
        description:
          'Einzigartige Teambuilding-Erlebnisse rund um Fermentation für Ihr Unternehmen.',
      },
      {
        image: media.offer3?.id ?? null,
        title: 'Menüentwicklung',
        description:
          'Wir unterstützen Sie bei der Integration fermentierter Produkte in Ihre Speisekarte.',
      },
    ],
    gastronomyHeroSliderPrevLabel: 'ZURÜCK',
    gastronomyHeroSliderNextLabel: 'WEITER',
    gastronomyHeroSliderAutoplayMs: 12000,
    gastronomyTrustedByHeading: 'Für Profiküchen',
    gastronomyTrustedByBadges: [
      { label: 'Restaurants' },
      { label: 'Hotels' },
      { label: 'Catering' },
      { label: 'Feinkost' },
      { label: 'Food Concept Stores' },
    ],
    gastronomyCtaBanner: {
      heading:
        'Verwandeln Sie Tradition in Innovation. Fermentation ist nicht nur Konservierung — sie ist die Zukunft der Gastronomie.',
      description: 'Partner mit uns, um Ihr Geschäft zu differenzieren.',
      buttonLabel: 'Anfrage senden',
      buttonHref: '#contact',
    },
    gastronomyWorkshopSectionTitle: 'Nächster Workshop',
    gastronomyWorkshopSectionSubtitle: 'Exklusiv zu fermentierten Zubereitungen',
    gastronomyWorkshopClarification:
      'Köche und Lebensmittelprofis sind herzlich willkommen in unseren regulären Workshops. Marcel bietet außerdem maßgeschneiderte Workshops für Ihr Küchenteam an.',
    gastronomyWorkshopNextDateLabel: 'Nächster Termin:',
    gastronomyWorkshopCards: [
      {
        image: media.workshop1?.id ?? null,
        title: 'Lakto-Gemüse',
        description:
          'Gemüse fermentieren, Aromen erleben – jeden Monat anders. Live online Session.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/lakto-gemuese',
        duration: '2-tägiger Workshop',
        nextDate: '15. Februar 2026',
      },
      {
        image: media.workshop2?.id ?? null,
        title: 'Kombucha',
        description: 'Lernen Sie, zu Hause köstlichen und gesunden Kombucha zu brauen.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/kombucha',
        duration: '2-tägiger Workshop',
        nextDate: '22. Februar 2026',
      },
      {
        image: media.workshop3?.id ?? null,
        title: 'Tempeh',
        description:
          'Entdecken Sie die Vielseitigkeit von Tempeh und wie Sie es in Ihre Küche integrieren.',
        price: '€99',
        priceSuffix: 'pro Person',
        buttonLabel: 'Mehr Infos & Buchen',
        buttonUrl: '/workshops/tempeh',
        duration: '2-tägiger Workshop',
        nextDate: '1. März 2026',
      },
    ],
    gastronomyOfferDetailsTitle: 'Was wir anbieten',
    gastronomyOfferDetails: [
      {
        title: 'Workshops vor Ort',
        description:
          'Wir kommen zu Ihnen — maßgeschneiderte Workshops für Ihr Küchenteam in Ihrem Betrieb.',
      },
      {
        title: 'Masterclasses',
        description:
          'Vertiefende Formate für Ihr Team, um Fermentation sicher und effizient in den Alltag zu bringen.',
      },
      {
        title: 'Beratungsleistungen',
        description: 'Strategische Beratung zur Integration fermentierter Produkte in Ihr Konzept.',
      },
    ],
    gastronomyOutcomesEyebrow: 'ERGEBNISSE',
    gastronomyOutcomesTitle: 'Vorher / Nachher in der Küche',
    gastronomyOutcomesBeforeLabel: 'VORHER',
    gastronomyOutcomesAfterLabel: 'NACHHER',
    gastronomyOutcomesItems: [
      {
        before: 'Kein klares Ferment-Angebot',
        after: 'Signature-Komponenten mit Wiedererkennungswert',
      },
      {
        before: 'Unsichere Team-Abläufe',
        after: 'Klare Standards für Produktion und Service',
      },
      {
        before: 'Standard-Menüs ohne Differenzierung',
        after: 'Markante Aromen mit eigener Handschrift',
      },
    ],
    gastronomyProcessEyebrow: 'ABLAUF',
    gastronomyProcessTitle: 'So arbeiten wir mit Ihrem Team',
    gastronomyProcessSteps: [
      {
        title: 'Analyse',
        description:
          'Wir prüfen Ihr Konzept, Ihre Küche und Ihr Team-Setup, um die beste Ferment-Strategie zu definieren.',
      },
      {
        title: 'Team Workshop',
        description:
          'Praxisnahes Training vor Ort oder hybrid, mit sofort einsetzbaren Techniken für Ihren Alltag.',
      },
      {
        title: 'Menu Integration',
        description:
          'Wir begleiten die Umsetzung in Ihre Karte, inklusive Prozesse, Qualität und geschmacklicher Linie.',
      },
    ],
    gastronomyTestimonialsEyebrow: 'REFERENZEN',
    gastronomyTestimonialsTitle: 'Was Gastronomie-Profis sagen',
    gastronomyTestimonialsItems: [
      {
        quote:
          'Die Zusammenarbeit hat unsere Speisekarte klar aufgewertet. Die Fermentfreude-Ideen waren sofort umsetzbar.',
        author: 'Küchenleitung, Boutique-Hotel',
      },
      {
        quote:
          'Das Teamtraining war strukturiert, praxisnah und inspirierend. Genau das, was wir für unsere Küche gebraucht haben.',
        author: 'Head Chef, Fine Dining Restaurant',
      },
      {
        quote:
          'Unsere Gäste reagieren begeistert auf die neuen Ferment-Komponenten. Geschmacklich ein echter Unterschied.',
        author: 'Operations Lead, Catering Company',
      },
    ],
    gastronomyFaqEyebrow: 'B2B FAQ',
    gastronomyFaqTitle: 'Häufige Fragen von Gastronomiebetrieben',
    gastronomyFaqItems: [
      {
        question: 'Für welche Teamgröße ist das geeignet?',
        answer:
          'Unsere Formate funktionieren für kleine Küchen-Teams ebenso wie für größere Hotel- oder Catering-Strukturen.',
      },
      {
        question: 'Wie schnell können wir starten?',
        answer:
          'Je nach Verfügbarkeit meist innerhalb weniger Wochen, inklusive klarer Vorbereitungsschritte.',
      },
      {
        question: 'Geht das auch bei uns vor Ort?',
        answer:
          'Ja, wir bieten On-Site Workshops und begleiten die Implementierung direkt in Ihrer Küche.',
      },
    ],
    gastronomyContactImage: media.contact?.id ?? null,
    gastronomyContactTitle: 'Kontakt',
    gastronomyContactDescription:
      'Du möchtest einen Workshop buchen oder hast Fragen zu Fermentation, Produkten oder B2B-Angeboten? Melde dich gerne bei uns.',
    gastronomyContactFormHeading: 'Frag uns alles',
    gastronomyContactAddress: 'Grabenstraße 15, 8010 Graz, Österreich',
    gastronomyContactPhone: '+43 660 4943577',
    gastronomyContactEmail: 'fermentfreude@gmail.com',
    gastronomyFormPlaceholders: {
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      message: 'Nachricht',
    },
    gastronomySubjectOptions: {
      default: 'Betreff',
      options: [
        { label: 'Allgemeine Anfrage' },
        { label: 'Workshop-Information' },
        { label: 'Produktfrage' },
        { label: 'Partnerschaft' },
      ],
    },
    gastronomySubmitButtonLabel: 'Nachricht senden',
  }
}

function gastronomyDataEN(media: {
  offer1?: Media
  offer2?: Media
  offer3?: Media
  workshop1?: Media
  workshop2?: Media
  workshop3?: Media
  contact?: Media
}) {
  return {
    gastronomyHeroCtaLabel: 'Take a look',
    gastronomyHeroCtaUrl: '#offer',
    gastronomyOfferSectionTitle: 'What we offer',
    gastronomyOfferCards: [
      {
        image: media.offer1?.id ?? null,
        title: 'Professional Training',
        description: "Elevate your team's culinary skills with tailored fermentation workshops.",
      },
      {
        image: media.offer2?.id ?? null,
        title: 'Corporate Events',
        description: 'Unique teambuilding experiences around fermentation for your company.',
      },
      {
        image: media.offer3?.id ?? null,
        title: 'Menu Development',
        description: 'We support you in integrating fermented products into your menu.',
      },
    ],
    gastronomyHeroSliderPrevLabel: 'PREV',
    gastronomyHeroSliderNextLabel: 'NEXT',
    gastronomyHeroSliderAutoplayMs: 12000,
    gastronomyTrustedByHeading: 'Trusted by',
    gastronomyTrustedByBadges: [
      { label: 'Restaurants' },
      { label: 'Hotels' },
      { label: 'Catering' },
      { label: 'Delis' },
      { label: 'Food Concept Stores' },
    ],
    gastronomyCtaBanner: {
      heading:
        "Transform tradition into innovation. Fermentation is not just preservation it's the future of gastronomy.",
      description: 'Partner with us to differentiate your business.',
      buttonLabel: 'Send Inquiry',
      buttonHref: '#contact',
    },
    gastronomyWorkshopSectionTitle: 'Next Workshop',
    gastronomyWorkshopSectionSubtitle: 'Exclusively on Fermented Preparations',
    gastronomyWorkshopClarification:
      'Chefs and food professionals are welcome in our regular workshops. Marcel also offers tailor-made workshops for your kitchen team.',
    gastronomyWorkshopNextDateLabel: 'Next Appointment:',
    gastronomyWorkshopCards: [
      {
        image: media.workshop1?.id ?? null,
        title: 'Lakto-Gemüse',
        description:
          'Ferment vegetables, experience aromas – different every month. Live online session.',
        price: '€99',
        priceSuffix: 'per Person',
        buttonLabel: 'More Info & Book',
        buttonUrl: '/workshops/lakto-gemuese',
        duration: '2-day workshop',
        nextDate: 'February 15, 2026',
      },
      {
        image: media.workshop2?.id ?? null,
        title: 'Kombucha',
        description: 'Learn to brew delicious and healthy kombucha at home.',
        price: '€99',
        priceSuffix: 'per Person',
        buttonLabel: 'More Info & Book',
        buttonUrl: '/workshops/kombucha',
        duration: '2-day workshop',
        nextDate: 'February 22, 2026',
      },
      {
        image: media.workshop3?.id ?? null,
        title: 'Tempeh',
        description:
          'Discover the versatility of tempeh and how to incorporate it into your cooking.',
        price: '€99',
        priceSuffix: 'per Person',
        buttonLabel: 'More Info & Book',
        buttonUrl: '/workshops/tempeh',
        duration: '2-day workshop',
        nextDate: 'March 1, 2026',
      },
    ],
    gastronomyOfferDetailsTitle: 'What We Offer',
    gastronomyOfferDetails: [
      {
        title: 'On-Site Fermentation',
        description:
          'We come to you with tailored fermentation workshops built around your kitchen’s workflow.',
      },
      {
        title: 'Masterclasses',
        description:
          'Focused sessions that help your team level up techniques and repeat them with confidence.',
      },
      {
        title: 'Consultancy Services',
        description:
          'Strategic guidance to integrate fermented components into your menu and operations.',
      },
    ],
    gastronomyOutcomesEyebrow: 'OUTCOMES',
    gastronomyOutcomesTitle: 'Before / After In The Kitchen',
    gastronomyOutcomesBeforeLabel: 'BEFORE',
    gastronomyOutcomesAfterLabel: 'AFTER',
    gastronomyOutcomesItems: [
      {
        before: 'No clear fermentation offer',
        after: 'Signature components with strong identity',
      },
      {
        before: 'Inconsistent team workflows',
        after: 'Clear standards for production and service',
      },
      {
        before: 'Standard menus with little differentiation',
        after: 'Distinctive flavors with a unique point of view',
      },
    ],
    gastronomyProcessEyebrow: 'PROCESS',
    gastronomyProcessTitle: 'How We Work With Your Team',
    gastronomyProcessSteps: [
      {
        title: 'Assessment',
        description:
          'We review your concept, kitchen setup, and team workflow to define the right fermentation strategy.',
      },
      {
        title: 'Team Workshop',
        description:
          'Hands-on training on-site or hybrid, with techniques your team can use immediately.',
      },
      {
        title: 'Menu Integration',
        description:
          'We support implementation into your menu, including process, quality, and flavor direction.',
      },
    ],
    gastronomyTestimonialsEyebrow: 'TESTIMONIALS',
    gastronomyTestimonialsTitle: 'What Culinary Teams Say',
    gastronomyTestimonialsItems: [
      {
        quote:
          'The collaboration elevated our menu immediately. Fermentfreude delivered practical ideas we could execute fast.',
        author: 'Kitchen Lead, Boutique Hotel',
      },
      {
        quote:
          'The team workshop was clear, hands-on, and inspiring. Exactly what we needed for our kitchen operations.',
        author: 'Head Chef, Fine Dining Restaurant',
      },
      {
        quote:
          'Our guests love the new fermented elements. It made a visible difference in flavor and identity.',
        author: 'Operations Lead, Catering Company',
      },
    ],
    gastronomyFaqEyebrow: 'B2B FAQ',
    gastronomyFaqTitle: 'Common Questions From Hospitality Teams',
    gastronomyFaqItems: [
      {
        question: 'What team size is this suitable for?',
        answer:
          'Our formats work for small kitchen teams as well as larger hotel and catering operations.',
      },
      {
        question: 'How quickly can we start?',
        answer:
          'Depending on availability, usually within a few weeks including clear preparation steps.',
      },
      {
        question: 'Can this be delivered on-site?',
        answer:
          'Yes. We offer on-site workshops and support implementation directly in your kitchen.',
      },
    ],
    gastronomyContactImage: media.contact?.id ?? null,
    gastronomyContactTitle: 'Contact',
    gastronomyContactDescription:
      'Would you like to book a workshop or have questions about fermentation, products or B2B offers? We look forward to hearing from you.',
    gastronomyContactFormHeading: 'Ask About Anything',
    gastronomyContactAddress: 'Grabenstraße 15, 8010 Graz, Austria',
    gastronomyContactPhone: '+43 660 4943577',
    gastronomyContactEmail: 'fermentfreude@gmail.com',
    gastronomyFormPlaceholders: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      message: 'Message',
    },
    gastronomySubjectOptions: {
      default: 'Subject',
      options: [
        { label: 'General Inquiry' },
        { label: 'Workshop Information' },
        { label: 'Product Question' },
        { label: 'Partnership' },
      ],
    },
    gastronomySubmitButtonLabel: 'Send Message',
  }
}

async function seedGastronomy() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Gastronomy page…')

  // ── Upload images to Payload Media (Vercel Blob) — skip if Blob suspended ─
  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images/gastronomy')
  const media: {
    offer1?: Media
    offer2?: Media
    offer3?: Media
    workshop1?: Media
    workshop2?: Media
    workshop3?: Media
    contact?: Media
  } = {}

  const offerPaths = [
    'gastronomy-slide-professional-training.png',
    'gastronomy-slide-corporate-events.png',
    'gastronomy-slide-menu-development.png',
  ]
  const workshopPaths = [
    'gastronomy-slide-fermentation-jars.png',
    'gastronomy-slide-flatlay-fermentation.png',
    'gastronomy-slide-01-cutting-board.png',
  ]
  const altTexts = {
    offer: [
      'Professional training – fermentation workshop',
      'Corporate events – team fermentation',
      'Menu development – fermented products',
    ],
    workshop: ['Lakto fermentation workshop', 'Kombucha workshop', 'Tempeh workshop'],
  }

  try {
    for (let i = 0; i < 3; i++) {
      const p = path.join(imagesDir, offerPaths[i])
      if (fs.existsSync(p)) {
        const created = await payload.create({
          collection: 'media',
          data: { alt: altTexts.offer[i] },
          file: readLocalFile(p),
          context: { skipAutoTranslate: true },
        })
        ;(media as Record<string, Media>)[`offer${i + 1}`] = created as Media
      } else {
        payload.logger.warn(`Offer image not found: ${p}`)
      }
    }
    for (let i = 0; i < 3; i++) {
      const p = path.join(imagesDir, workshopPaths[i])
      if (fs.existsSync(p)) {
        const created = await payload.create({
          collection: 'media',
          data: { alt: altTexts.workshop[i] },
          file: readLocalFile(p),
          context: { skipAutoTranslate: true },
        })
        ;(media as Record<string, Media>)[`workshop${i + 1}`] = created as Media
      } else {
        payload.logger.warn(`Workshop image not found: ${p}`)
      }
    }
    const contactPath = path.join(imagesDir, 'gastronomy-slide-01-cutting-board.png')
    if (fs.existsSync(contactPath)) {
      const created = await payload.create({
        collection: 'media',
        data: { alt: 'Contact – FermentFreude team at workshop' },
        file: readLocalFile(contactPath),
        context: { skipAutoTranslate: true },
      })
      media.contact = created as Media
    } else {
      payload.logger.warn(`Contact image not found: ${contactPath}`)
    }
  } catch (_err) {
    payload.logger.warn('Image upload skipped (e.g. Vercel Blob suspended). Seeding text only.')
  }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 0,
  })

  const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

  if (existing.docs.length > 0) {
    const pageId = existing.docs[0].id
    const _forceRecreate = process.argv.includes('--force')

    // Always update existing page (whether forceRecreate or not)
    // Images are preserved by updating instead of deleting
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      context: ctx,
      data: {
        title: 'Gastronomie',
        slug: 'gastronomy',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT_WITH_PARAGRAPH },
        layout: [],
        meta: {
          title: 'Gastronomie | Fermentfreude',
          description: 'Fermentierte Produkte für Restaurants, Hotels und Catering.',
        },
        gastronomy: gastronomyDataDE(media),
      },
    })

    const freshDE = (await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })) as unknown as Record<string, unknown>

    const gastronomyDE = (freshDE.gastronomy ?? {}) as Record<string, unknown>
    const offerCardsDE = (gastronomyDE.gastronomyOfferCards as Array<{ id?: string }>) ?? []
    const workshopCardsDE = (gastronomyDE.gastronomyWorkshopCards as Array<{ id?: string }>) ?? []
    const offerDetailsDE = (gastronomyDE.gastronomyOfferDetails as Array<{ id?: string }>) ?? []
    const outcomesItemsDE =
      (gastronomyDE.gastronomyOutcomesItems as Array<{ id?: string }>) ?? []
    const processStepsDE =
      (gastronomyDE.gastronomyProcessSteps as Array<{ id?: string }>) ?? []
    const testimonialsItemsDE =
      (gastronomyDE.gastronomyTestimonialsItems as Array<{ id?: string }>) ?? []
    const faqItemsDE = (gastronomyDE.gastronomyFaqItems as Array<{ id?: string }>) ?? []
    const subjectOpts = gastronomyDE.gastronomySubjectOptions as {
      options?: Array<{ id?: string }>
    }
    const subjectItemsDE = subjectOpts?.options ?? []
    const trustedByBadgesDE =
      (gastronomyDE.gastronomyTrustedByBadges as Array<{ id?: string }>) ?? []

    const enGastronomy = gastronomyDataEN(media)
    const dataENWithIds = {
      ...enGastronomy,
      gastronomyOfferCards: enGastronomy.gastronomyOfferCards.map((c, i) => ({
        ...c,
        id: offerCardsDE[i]?.id,
      })),
      gastronomyWorkshopCards: enGastronomy.gastronomyWorkshopCards.map((c, i) => ({
        ...c,
        id: workshopCardsDE[i]?.id,
      })),
      gastronomyOfferDetails: enGastronomy.gastronomyOfferDetails.map((item, i) => ({
        ...item,
        id: offerDetailsDE[i]?.id,
      })),
      gastronomyOutcomesItems: enGastronomy.gastronomyOutcomesItems.map((item, i) => ({
        ...item,
        id: outcomesItemsDE[i]?.id,
      })),
      gastronomyProcessSteps: enGastronomy.gastronomyProcessSteps.map((item, i) => ({
        ...item,
        id: processStepsDE[i]?.id,
      })),
      gastronomyTestimonialsItems: enGastronomy.gastronomyTestimonialsItems.map((item, i) => ({
        ...item,
        id: testimonialsItemsDE[i]?.id,
      })),
      gastronomyFaqItems: enGastronomy.gastronomyFaqItems.map((item, i) => ({
        ...item,
        id: faqItemsDE[i]?.id,
      })),
      gastronomyTrustedByBadges: enGastronomy.gastronomyTrustedByBadges.map((b, i) => ({
        ...b,
        id: trustedByBadgesDE[i]?.id,
      })),
      gastronomySubjectOptions: {
        ...enGastronomy.gastronomySubjectOptions,
        options: enGastronomy.gastronomySubjectOptions.options.map((o, i) => ({
          ...o,
          id: subjectItemsDE[i]?.id,
        })),
      },
    }

    try {
      await payload.update({
        collection: 'pages',
        id: pageId,
        locale: 'en',
        context: ctx,
        data: {
          title: 'Gastronomy',
          slug: 'gastronomy',
          _status: 'published',
          hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT_WITH_PARAGRAPH },
          layout: [],
          meta: {
            title: 'Gastronomy | Fermentfreude',
            description: 'Fermented products for restaurants, hotels and catering.',
          },
          gastronomy: dataENWithIds,
        },
      })
      payload.logger.info('Gastronomy page updated (DE + EN). Edit at /admin/collections/pages')
    } catch (_err) {
      payload.logger.warn('EN locale update failed. DE content saved. Edit EN in admin.')
      payload.logger.info('Gastronomy page updated (DE only). Edit at /admin/collections/pages')
    }
    process.exit(0)
    return
  }

  // Create new page
  const page = await payload.create({
    collection: 'pages',
    locale: 'de',
    context: ctx,
    data: {
      title: 'Gastronomie',
      slug: 'gastronomy',
      _status: 'published',
      hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT_WITH_PARAGRAPH },
      layout: [],
      meta: {
        title: 'Gastronomie | Fermentfreude',
        description: 'Fermentierte Produkte für Restaurants, Hotels und Catering.',
      },
      gastronomy: gastronomyDataDE(media),
    },
  })

  const freshDE = (await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    depth: 0,
  })) as unknown as Record<string, unknown>

  const gastronomyDE = (freshDE.gastronomy ?? {}) as Record<string, unknown>
  const offerCardsDE = (gastronomyDE.gastronomyOfferCards as Array<{ id?: string }>) ?? []
  const workshopCardsDE = (gastronomyDE.gastronomyWorkshopCards as Array<{ id?: string }>) ?? []
  const offerDetailsDE = (gastronomyDE.gastronomyOfferDetails as Array<{ id?: string }>) ?? []
  const outcomesItemsDE =
    (gastronomyDE.gastronomyOutcomesItems as Array<{ id?: string }>) ?? []
  const processStepsDE = (gastronomyDE.gastronomyProcessSteps as Array<{ id?: string }>) ?? []
  const testimonialsItemsDE =
    (gastronomyDE.gastronomyTestimonialsItems as Array<{ id?: string }>) ?? []
  const faqItemsDE = (gastronomyDE.gastronomyFaqItems as Array<{ id?: string }>) ?? []
  const subjectOpts = gastronomyDE.gastronomySubjectOptions as { options?: Array<{ id?: string }> }
  const subjectItemsDE = subjectOpts?.options ?? []
  const trustedByBadgesDE =
    (gastronomyDE.gastronomyTrustedByBadges as Array<{ id?: string }>) ?? []

  const enGastronomy = gastronomyDataEN(media)
  const dataENWithIds = {
    ...enGastronomy,
    gastronomyOfferCards: enGastronomy.gastronomyOfferCards.map((c, i) => ({
      ...c,
      id: offerCardsDE[i]?.id,
    })),
    gastronomyWorkshopCards: enGastronomy.gastronomyWorkshopCards.map((c, i) => ({
      ...c,
      id: workshopCardsDE[i]?.id,
    })),
    gastronomyOfferDetails: enGastronomy.gastronomyOfferDetails.map((item, i) => ({
      ...item,
      id: offerDetailsDE[i]?.id,
    })),
    gastronomyOutcomesItems: enGastronomy.gastronomyOutcomesItems.map((item, i) => ({
      ...item,
      id: outcomesItemsDE[i]?.id,
    })),
    gastronomyProcessSteps: enGastronomy.gastronomyProcessSteps.map((item, i) => ({
      ...item,
      id: processStepsDE[i]?.id,
    })),
    gastronomyTestimonialsItems: enGastronomy.gastronomyTestimonialsItems.map((item, i) => ({
      ...item,
      id: testimonialsItemsDE[i]?.id,
    })),
    gastronomyFaqItems: enGastronomy.gastronomyFaqItems.map((item, i) => ({
      ...item,
      id: faqItemsDE[i]?.id,
    })),
    gastronomyTrustedByBadges: enGastronomy.gastronomyTrustedByBadges.map((b, i) => ({
      ...b,
      id: trustedByBadgesDE[i]?.id,
    })),
    gastronomySubjectOptions: {
      ...enGastronomy.gastronomySubjectOptions,
      options: enGastronomy.gastronomySubjectOptions.options.map((o, i) => ({
        ...o,
        id: subjectItemsDE[i]?.id,
      })),
    },
  }

  try {
    await payload.update({
      collection: 'pages',
      id: page.id,
      locale: 'en',
      context: ctx,
      data: {
        title: 'Gastronomy',
        slug: 'gastronomy',
        _status: 'published',
        hero: { type: 'lowImpact' as const, richTextLowImpact: LEXICAL_ROOT_WITH_PARAGRAPH },
        layout: [],
        meta: {
          title: 'Gastronomy | Fermentfreude',
          description: 'Fermented products for restaurants, hotels and catering.',
        },
        gastronomy: dataENWithIds,
      },
    })
    payload.logger.info('Gastronomy page seeded (DE + EN). Edit at /admin/collections/pages')
  } catch (_err) {
    payload.logger.warn('EN locale update failed. DE content saved. Add EN manually in admin.')
    payload.logger.info('Gastronomy page seeded (DE only). Edit at /admin/collections/pages')
  }
  process.exit(0)
}

seedGastronomy().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
