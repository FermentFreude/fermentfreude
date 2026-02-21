/**
 * Seed the Gastronomy page in the Pages collection with all sections.
 * Seeds both DE and EN locales. Content is under Pages → Gastronomy page.
 * Uploads images to Payload Media (Vercel Blob) for offer cards, workshop cards, collaborate, and contact.
 *
 * Run: pnpm seed gastronomy
 */
import type { Media } from '@/payload-types'
import config from '@payload-config'
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
        children: [{ type: 'text' as const, detail: 0, format: 0, mode: 'normal' as const, style: '', text: '', version: 1 }],
        direction: 'ltr' as const,
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '',
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
  collaborate?: Media
  contact?: Media
}) {
  return {
  gastronomyHeroTitle: 'Heben Sie Ihr Gastronomie-Geschäft auf ein neues Level',
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
  gastronomyQuoteText:
    'Verwandeln Sie Tradition in Innovation. Fermentation ist nicht nur Konservierung — sie ist die Zukunft der Gastronomie.',
  gastronomyQuoteSubtext: 'Partner mit uns, um Ihr Geschäft zu differenzieren.',
  gastronomyWorkshopSectionTitle: 'Nächster Workshop',
  gastronomyWorkshopSectionSubtitle: 'Exklusiv zu fermentierten Zubereitungen',
  gastronomyWorkshopClarification:
    'Köche und Lebensmittelprofis sind herzlich willkommen in unseren regulären Workshops. Marcel bietet außerdem maßgeschneiderte Workshops für Ihr Küchenteam an.',
  gastronomyWorkshopNextDateLabel: 'Nächster Termin:',
  gastronomyWorkshopCards: [
    {
      image: media.workshop1?.id ?? null,
      title: 'Lakto-Gemüse',
      description: 'Gemüse fermentieren, Aromen erleben – jeden Monat anders. Live online Session.',
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
      description: 'Entdecken Sie die Vielseitigkeit von Tempeh und wie Sie es in Ihre Küche integrieren.',
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
      title: 'Marketing-Events',
      description:
        'Fermentations-Events für Ihre Gäste — von Verkostungen bis zu interaktiven Abenden.',
    },
    {
      title: 'Beratungsleistungen',
      description:
        'Strategische Beratung zur Integration fermentierter Produkte in Ihr Konzept.',
    },
    {
      title: 'Tempeh in der Küche',
      description:
        'Viele Köche wissen nicht, wie sie Tempeh einsetzen können. Wir zeigen Ihnen Anwendungen: Marinieren, Braten, Frittieren und kreative Gerichte für Ihre Speisekarte.',
    },
    {
      title: 'Private Verkostungen',
      description: 'Exklusive Verkostungen unserer Produkte für Sie und Ihr Team.',
    },
    {
      title: 'Produktentwicklung',
      description:
        'Gemeinsam entwickeln wir maßgeschneiderte fermentierte Produkte für Ihre Küche.',
    },
    {
      title: 'Langfristige Partnerschaften',
      description:
        'Aufbau von dauerhaften Lieferbeziehungen und kontinuierlicher Unterstützung.',
    },
  ],
  gastronomyCollaborateImage: media.collaborate?.id ?? null,
  gastronomyCollaborateTitle: 'Bereit zur Zusammenarbeit?',
  gastronomyCollaborateSubtitle: 'Wir helfen Ihnen, unvergessliche kulinarische Erlebnisse zu schaffen.',
  gastronomyContactImage: media.contact?.id ?? null,
  gastronomyContactTitle: 'Kontakt',
  gastronomyContactDescription:
    'Du möchtest einen Workshop buchen oder hast Fragen zu Fermentation, Produkten oder B2B-Angeboten? Melde dich gerne bei uns.',
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
  gastronomyCtaBanner: {
    heading: 'Für Köche und Lebensmittelprofis',
    description:
      'Fermentierte, pflanzliche Optionen für professionelle Küchen? Wir liefern Produkte und Wissen für moderne Speisekarten.',
    buttonLabel: 'Mehr erfahren',
    buttonHref: '/contact',
  },
  gastronomyMapEmbedUrl:
    'https://maps.google.com/maps?q=Grabenstra%C3%9Fe+15,+8010+Graz,+Austria&t=&z=17&ie=UTF8&iwloc=&output=embed',
  }
}

function gastronomyDataEN(media: {
  offer1?: Media
  offer2?: Media
  offer3?: Media
  workshop1?: Media
  workshop2?: Media
  workshop3?: Media
  collaborate?: Media
  contact?: Media
}) {
  return {
  gastronomyHeroTitle: 'Elevate Your Gastronomy Business',
  gastronomyHeroCtaLabel: 'Take a look',
  gastronomyHeroCtaUrl: '#offer',
  gastronomyOfferSectionTitle: 'What we offer',
  gastronomyOfferCards: [
    {
      image: media.offer1?.id ?? null,
      title: 'Professional Training',
      description:
        "Elevate your team's culinary skills with tailored fermentation workshops.",
    },
    {
      image: media.offer2?.id ?? null,
      title: 'Corporate Events',
      description:
        'Unique teambuilding experiences around fermentation for your company.',
    },
    {
      image: media.offer3?.id ?? null,
      title: 'Menu Development',
      description:
        'We support you in integrating fermented products into your menu.',
    },
  ],
  gastronomyQuoteText:
    "Transform tradition into innovation. Fermentation is not just preservation it's the future of gastronomy.",
  gastronomyQuoteSubtext: 'Partner with us to differentiate your business.',
  gastronomyWorkshopSectionTitle: 'Next Workshop',
  gastronomyWorkshopSectionSubtitle: 'Exclusively on Fermented Preparations',
  gastronomyWorkshopClarification:
    'Chefs and food professionals are welcome in our regular workshops. Marcel also offers tailor-made workshops for your kitchen team.',
  gastronomyWorkshopNextDateLabel: 'Next Appointment:',
  gastronomyWorkshopCards: [
    {
      image: media.workshop1?.id ?? null,
      title: 'Lakto-Gemüse',
      description: 'Ferment vegetables, experience aromas – different every month. Live online session.',
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
      description: 'Discover the versatility of tempeh and how to incorporate it into your cooking.',
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
      title: 'On-Site Workshops',
      description:
        'We come to you — tailored workshops for your kitchen team at your premises.',
    },
    {
      title: 'Marketing Events',
      description:
        'Fermentation events for your guests — from tastings to interactive evenings.',
    },
    {
      title: 'Consultation Services',
      description:
        'Strategic advice on integrating fermented products into your concept.',
    },
    {
      title: 'Tempeh in Your Kitchen',
      description:
        'Many chefs don\'t know what to do with tempeh. We show you how to use it: marinating, frying, and creative applications for your menu.',
    },
    {
      title: 'Private Tastings',
      description: 'Exclusive tastings of our products for you and your team.',
    },
    {
      title: 'Product Development',
      description:
        'Together we develop custom fermented products for your kitchen.',
    },
    {
      title: 'Long-Term Partnerships',
      description:
        'Building lasting supply relationships and ongoing support.',
    },
  ],
  gastronomyCollaborateImage: media.collaborate?.id ?? null,
  gastronomyCollaborateTitle: 'Ready to collaborate?',
  gastronomyCollaborateSubtitle: 'Let us help you create unforgettable culinary experiences.',
  gastronomyContactImage: media.contact?.id ?? null,
  gastronomyContactTitle: 'Contact',
  gastronomyContactDescription:
    'Would you like to book a workshop or have questions about fermentation, products or B2B offers? We look forward to hearing from you.',
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
  gastronomyCtaBanner: {
    heading: 'For Chefs and Food Professionals',
    description:
      'Looking for fermented, plant-based options that work in professional kitchens? We supply products and knowledge for modern menus.',
    buttonLabel: 'Learn more',
    buttonHref: '/contact',
  },
  gastronomyMapEmbedUrl:
    'https://maps.google.com/maps?q=Grabenstra%C3%9Fe+15,+8010+Graz,+Austria&t=&z=17&ie=UTF8&iwloc=&output=embed',
  }
}

async function seedGastronomy() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Gastronomy page…')

  // ── Upload images to Payload Media (Vercel Blob) — skip if Blob suspended ─
  const imagesDir = path.resolve(process.cwd(), 'public/assets/images/gastronomy')
  const media: {
    offer1?: Media
    offer2?: Media
    offer3?: Media
    workshop1?: Media
    workshop2?: Media
    workshop3?: Media
    collaborate?: Media
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
    offer: ['Professional training – fermentation workshop', 'Corporate events – team fermentation', 'Menu development – fermented products'],
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
    const collaboratePath = path.join(imagesDir, 'gastronomy-cutting-board-fermentation.png')
    if (fs.existsSync(collaboratePath)) {
      const created = await payload.create({
        collection: 'media',
        data: { alt: 'Ready to collaborate – gastronomy banner' },
        file: readLocalFile(collaboratePath),
        context: { skipAutoTranslate: true },
      })
      media.collaborate = created as Media
    } else {
      payload.logger.warn(`Collaborate image not found: ${collaboratePath}`)
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
    const forceRecreate = process.argv.includes('--force')

    if (forceRecreate) {
      await payload.delete({
        collection: 'pages',
        id: pageId,
        context: { skipRevalidate: true, disableRevalidate: true },
      })
      payload.logger.info('Deleted existing Gastronomy page. Recreating…')
      // Fall through to create path
    } else {
      // Update existing page — save DE first to get IDs
      await payload.update({
        collection: 'pages',
        id: pageId,
        locale: 'de',
        context: ctx,
        data: {
          title: 'Gastronomie',
          slug: 'gastronomy',
          _status: 'published',
          hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
          layout: [],
          meta: { title: 'Gastronomie | Fermentfreude', description: 'Fermentierte Produkte für Restaurants, Hotels und Catering.' },
          gastronomy: gastronomyDataDE(media),
        },
      })

      const freshDE = (await payload.findByID({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      depth: 0,
    })) as Record<string, unknown>

    const gastronomyDE = (freshDE.gastronomy ?? {}) as Record<string, unknown>
    const offerCardsDE = (gastronomyDE.gastronomyOfferCards as Array<{ id?: string }>) ?? []
    const workshopCardsDE = (gastronomyDE.gastronomyWorkshopCards as Array<{ id?: string }>) ?? []
    const offerDetailsDE = (gastronomyDE.gastronomyOfferDetails as Array<{ id?: string }>) ?? []
    const subjectOpts = gastronomyDE.gastronomySubjectOptions as { options?: Array<{ id?: string }> }
    const subjectItemsDE = subjectOpts?.options ?? []

    const dataENWithIds = {
      ...gastronomyDataEN(media),
      gastronomyOfferCards: gastronomyDataEN(media).gastronomyOfferCards.map((c, i) => ({
        ...c,
        id: offerCardsDE[i]?.id,
      })),
      gastronomyWorkshopCards: gastronomyDataEN(media).gastronomyWorkshopCards.map((c, i) => ({
        ...c,
        id: workshopCardsDE[i]?.id,
      })),
      gastronomyOfferDetails: gastronomyDataEN(media).gastronomyOfferDetails.map((item, i) => ({
        ...item,
        id: offerDetailsDE[i]?.id,
      })),
      gastronomySubjectOptions: {
        ...gastronomyDataEN(media).gastronomySubjectOptions,
        options: gastronomyDataEN(media).gastronomySubjectOptions.options.map((o, i) => ({
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
          hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
          layout: [],
          meta: { title: 'Gastronomy | Fermentfreude', description: 'Fermented products for restaurants, hotels and catering.' },
          gastronomy: dataENWithIds,
        },
      })
      payload.logger.info('Gastronomy page updated (DE + EN). Edit at /admin/collections/pages')
    } catch (_err) {
      payload.logger.warn('EN locale update failed. DE content saved. Add EN manually in admin.')
      payload.logger.info('Gastronomy page updated (DE only). Edit at /admin/collections/pages')
    }
      process.exit(0)
      return
    }
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
      hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
      layout: [],
      meta: { title: 'Gastronomie | Fermentfreude', description: 'Fermentierte Produkte für Restaurants, Hotels und Catering.' },
      gastronomy: gastronomyDataDE(media),
    },
  })

  const freshDE = (await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    depth: 0,
  })) as Record<string, unknown>

  const gastronomyDE = (freshDE.gastronomy ?? {}) as Record<string, unknown>
  const offerCardsDE = (gastronomyDE.gastronomyOfferCards as Array<{ id?: string }>) ?? []
  const workshopCardsDE = (gastronomyDE.gastronomyWorkshopCards as Array<{ id?: string }>) ?? []
  const offerDetailsDE = (gastronomyDE.gastronomyOfferDetails as Array<{ id?: string }>) ?? []
  const subjectOpts = gastronomyDE.gastronomySubjectOptions as { options?: Array<{ id?: string }> }
  const subjectItemsDE = subjectOpts?.options ?? []

  const dataENWithIds = {
    ...gastronomyDataEN(media),
    gastronomyOfferCards: gastronomyDataEN(media).gastronomyOfferCards.map((c, i) => ({
      ...c,
      id: offerCardsDE[i]?.id,
    })),
    gastronomyWorkshopCards: gastronomyDataEN(media).gastronomyWorkshopCards.map((c, i) => ({
      ...c,
      id: workshopCardsDE[i]?.id,
    })),
    gastronomyOfferDetails: gastronomyDataEN(media).gastronomyOfferDetails.map((item, i) => ({
      ...item,
      id: offerDetailsDE[i]?.id,
    })),
    gastronomySubjectOptions: {
      ...gastronomyDataEN(media).gastronomySubjectOptions,
      options: gastronomyDataEN(media).gastronomySubjectOptions.options.map((o, i) => ({
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
        hero: { type: 'lowImpact' as const, richText: LEXICAL_ROOT_WITH_PARAGRAPH },
        layout: [],
        meta: { title: 'Gastronomy | Fermentfreude', description: 'Fermented products for restaurants, hotels and catering.' },
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
