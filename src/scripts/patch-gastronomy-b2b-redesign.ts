/**
 * Sync the gastronomy page CMS with the current B2B layout (DE + EN).
 * Updates copy and uploads images. Does not delete unused old fields.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-b2b-redesign.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const db = process.env.DATABASE_URL ?? ''
if (!/staging/i.test(db)) {
  console.error('Refusing to run: DATABASE_URL does not look like staging.')
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { uploadLocalMedia } = await import('./migrations/_helpers')

const SHOP = path.resolve(process.cwd(), 'public/shop')

function withId<T extends Record<string, unknown>>(row: T, id?: string): T {
  return id ? ({ ...row, id } as T) : row
}

async function patch() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 0,
  })
  const page = result.docs[0]
  if (!page) {
    payload.logger.error('Gastronomy page not found')
    process.exit(1)
  }

  const heroId = await uploadLocalMedia(
    payload,
    path.join(SHOP, 'hero-kaefer-plate.webp'),
    'Plated fried Käferbohnen tempeh',
    'hero',
  )
  const slideImages = [
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-plate.webp'), 'Tempeh as a main', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-alt.webp'), 'Tempeh burger', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'berglinsen-plated.webp'), 'Tempeh bowl', 'card'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-left.webp'), 'Tempeh salad', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer.webp'), 'Austrian classic', 'hero'),
    await uploadLocalMedia(payload, path.join(SHOP, 'hero-kaefer-v3.webp'), 'Pan-fried tempeh', 'hero'),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'automaten-loc-david-kaefer.webp'),
      'Tempeh as a side',
      'card',
    ),
  ]
  const audienceImages = [
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-restaurants.webp'),
      'Restaurant kitchen',
      'card',
    ),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-hotels.webp'),
      'Hotel dining',
      'card',
    ),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-catering.webp'),
      'Catering service',
      'card',
    ),
    await uploadLocalMedia(
      payload,
      path.join(SHOP, 'gastronomy-audience-feinkost-plain.webp'),
      'Delicatessen counter',
      'card',
    ),
  ]
  const productId = await uploadLocalMedia(
    payload,
    path.join(SHOP, 'kaefer-packaging.webp'),
    'Käferbohnen tempeh packaging',
    'card',
  )
  const proofId = await uploadLocalMedia(
    payload,
    path.join(SHOP, 'hero-kaefer-v3.webp'),
    'Käferbohnen tempeh',
    'hero',
  )

  const deDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const gDe = (deDoc.gastronomy ?? {}) as Record<string, unknown>

  const deUpdates: Record<string, unknown> = {
    gastronomyHeroEyebrow: 'Für Restaurants',
    gastronomyHeroTitle: 'Tempeh für Profiküchen.',
    gastronomyHeroTagline:
      'Käferbohnen-Tempeh mit nussigem Aroma, Umami und einer Textur, die sich vielseitig in moderne Küche integrieren lässt.',
    gastronomyHeroCtaLabel: 'Für Gastronomie anfragen',
    gastronomyHeroCtaUrl: '#contact',
    gastronomyHeroCtaSecondaryLabel: 'Tempeh entdecken',
    gastronomyHeroCtaSecondaryUrl: '/products/kaeferbohnen-tempeh',
    gastronomyShowcaseTitle: 'Was kann man daraus machen?',
    gastronomyUsageBanners: [
      {
        image: slideImages[0],
        title: 'Tempeh als Hauptkomponente',
        text: 'Kräftig angebraten, nussig und voller Umami.',
      },
      {
        image: slideImages[1],
        title: 'Tempeh Burger',
        text: 'Als Patty mit eigenem Biss und Röstaroma.',
      },
      {
        image: slideImages[2],
        title: 'Tempeh Bowl',
        text: 'Als Protein-Komponente in modernen Bowls.',
      },
      {
        image: slideImages[3],
        title: 'Tempeh Salat',
        text: 'In Scheiben, warm oder kalt auf dem Teller.',
      },
      {
        image: slideImages[4],
        title: 'Österreichischer Klassiker',
        text: 'Neu interpretiert — ohne die Karte umzubauen.',
      },
      {
        image: slideImages[5],
        title: 'Gebratener Tempeh',
        text: 'Goldbraun in der Pfanne — eigene Kruste, saftiger Biss.',
      },
      {
        image: slideImages[6],
        title: 'Tempeh als Beilage',
        text: 'Eine Komponente, die bestehende Gerichte trägt.',
      },
    ],
    gastronomyFactsTitle: 'Warum Tempeh für deine Küche?',
    gastronomyFacts: [
      { title: 'Vielseitig', text: 'Braten, marinieren, frittieren oder neu interpretieren.' },
      {
        title: 'Eigener Charakter',
        text: 'Kein Fleischersatz. Ein eigenständiges Lebensmittel mit eigener Textur und Aromatik.',
      },
      { title: 'Pflanzlich', text: 'Vegan, proteinreich und aus regionalen Hülsenfrüchten.' },
      { title: 'Einfach einzusetzen', text: 'Passt in bestehende Küchenabläufe und Gerichte.' },
    ],
    gastronomyTrustedByHeading: 'Für Restaurants, die mehr aus pflanzlicher Küche machen wollen.',
    gastronomyAudienceCards: [
      {
        image: audienceImages[0],
        title: 'Restaurants',
        text: 'Tempeh als eigenständige Komponente auf der Karte.',
      },
      {
        image: audienceImages[1],
        title: 'Hotels',
        text: 'Für Hotelküche und Restaurantbetrieb.',
      },
      { image: audienceImages[2], title: 'Catering', text: 'Charakter in der Menge.' },
      {
        image: audienceImages[3],
        title: 'Feinkost',
        text: 'Theke, Handel und Gemeinschaftsverpflegung.',
      },
    ],
    gastronomyProductCaption: 'Käferbohnen-Tempeh für deine Küche',
    gastronomyProductCtaLabel: 'Jetzt B2B-Anfrage senden',
    gastronomyProductB2bLine: 'B2B / größere Mengen',
    gastronomyProofImage: proofId,
    gastronomyTestimonialsTitle: 'Aus der Küche',
    gastronomyTestimonialsItems: [
      {
        quote:
          'Der Käferbohnen-Tempeh überzeugt durch milde, nussige Aromatik und vielseitige Einsetzbarkeit. Eine echte Bereicherung für die steirische Küche.',
        author: 'Michael Wankerl, Gerüchteküche',
      },
    ],
    gastronomyContactFormHeading: 'B2B-Anfrage',
    gastronomyFormPlaceholders: {
      firstName: 'Name',
      lastName: 'Restaurant / Betrieb',
      email: 'E-Mail',
      phone: 'Telefon (optional)',
      quantity: 'Ungefähre Menge (optional)',
      message: 'Nachricht',
    },
    gastronomyBusinessTypeOptions: {
      default: 'Art des Betriebs',
      options: [
        { label: 'Restaurant' },
        { label: 'Hotel' },
        { label: 'Catering' },
        { label: 'Sonstiges' },
      ],
    },
    gastronomySubjectOptions: {
      default: 'Worum geht es?',
      options: [
        { label: 'Tempeh / B2B-Bestellung' },
        { label: 'Produktinfo' },
        { label: 'Probe / Test' },
        { label: 'Team-Schulung' },
        { label: 'Sonstiges' },
      ],
    },
    gastronomySubmitButtonLabel: 'Anfrage senden',
  }

  deUpdates.gastronomyHeroImage = heroId
  deUpdates.gastronomyProductImage = productId

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    context: ctx,
    data: {
      _status: 'published',
      gastronomy: {
        ...gDe,
        ...deUpdates,
      },
    },
  })

  const freshDe = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const gFresh = (freshDe.gastronomy ?? {}) as Record<string, unknown>
  const bannerIds = (Array.isArray(gFresh.gastronomyUsageBanners)
    ? gFresh.gastronomyUsageBanners
    : []) as Array<{ id?: string }>
  const factIds = (Array.isArray(gFresh.gastronomyFacts) ? gFresh.gastronomyFacts : []) as Array<{
    id?: string
  }>
  const audienceIds = (Array.isArray(gFresh.gastronomyAudienceCards)
    ? gFresh.gastronomyAudienceCards
    : []) as Array<{ id?: string }>
  const quoteIds = (Array.isArray(gFresh.gastronomyTestimonialsItems)
    ? gFresh.gastronomyTestimonialsItems
    : []) as Array<{ id?: string }>
  const businessIds = ((gFresh.gastronomyBusinessTypeOptions as { options?: Array<{ id?: string }> })
    ?.options ?? []) as Array<{ id?: string }>
  const subjectIds = ((gFresh.gastronomySubjectOptions as { options?: Array<{ id?: string }> })
    ?.options ?? []) as Array<{ id?: string }>

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const gEn = (enDoc.gastronomy ?? {}) as Record<string, unknown>

  const enUpdates: Record<string, unknown> = {
    gastronomyHeroEyebrow: 'For restaurants',
    gastronomyHeroTitle: 'Tempeh for professional kitchens.',
    gastronomyHeroTagline:
      'Runner bean tempeh with a nutty aroma, umami, and a texture that belongs in a modern kitchen.',
    gastronomyHeroCtaLabel: 'Enquire for gastronomy',
    gastronomyHeroCtaUrl: '#contact',
    gastronomyHeroCtaSecondaryLabel: 'Discover tempeh',
    gastronomyHeroCtaSecondaryUrl: '/products/kaeferbohnen-tempeh',
    gastronomyShowcaseTitle: 'What can you make with it?',
    gastronomyUsageBanners: [
      withId(
        {
          image: slideImages[0],
          title: 'Tempeh as a main',
          text: 'Seared hard, nutty, full of umami.',
        },
        bannerIds[0]?.id,
      ),
      withId(
        {
          image: slideImages[1],
          title: 'Tempeh burger',
          text: 'As a patty with its own bite and roast aroma.',
        },
        bannerIds[1]?.id,
      ),
      withId(
        { image: slideImages[2], title: 'Tempeh bowl', text: 'A protein component in modern bowls.' },
        bannerIds[2]?.id,
      ),
      withId(
        { image: slideImages[3], title: 'Tempeh salad', text: 'Sliced, warm or cold on the plate.' },
        bannerIds[3]?.id,
      ),
      withId(
        {
          image: slideImages[4],
          title: 'Austrian classic, reworked',
          text: 'Drops into the menu without rewriting it.',
        },
        bannerIds[4]?.id,
      ),
      withId(
        { image: slideImages[5], title: 'Pan-fried tempeh', text: 'Golden crust, juicy bite.' },
        bannerIds[5]?.id,
      ),
      withId(
        {
          image: slideImages[6],
          title: 'As a side',
          text: 'One component that carries existing dishes.',
        },
        bannerIds[6]?.id,
      ),
    ],
    gastronomyFactsTitle: 'Why tempeh for your kitchen?',
    gastronomyFacts: [
      withId({ title: 'Versatile', text: 'Sear, marinate, fry, or rework a classic.' }, factIds[0]?.id),
      withId(
        {
          title: 'Its own character',
          text: 'Not a meat substitute. A food with its own texture and aroma.',
        },
        factIds[1]?.id,
      ),
      withId(
        { title: 'Plant-based', text: 'Vegan, protein-rich, from regional legumes.' },
        factIds[2]?.id,
      ),
      withId({ title: 'Easy to use', text: 'Fits existing kitchen flow and dishes.' }, factIds[3]?.id),
    ],
    gastronomyTrustedByHeading: 'For restaurants that want more from plant-based cooking.',
    gastronomyAudienceCards: [
      withId(
        {
          image: audienceImages[0],
          title: 'Restaurants',
          text: 'Tempeh as a stand-alone component on the menu.',
        },
        audienceIds[0]?.id,
      ),
      withId(
        {
          image: audienceImages[1],
          title: 'Hotels',
          text: 'For the hotel kitchen and the dining room.',
        },
        audienceIds[1]?.id,
      ),
      withId(
        { image: audienceImages[2], title: 'Catering', text: 'Character at scale.' },
        audienceIds[2]?.id,
      ),
      withId(
        {
          image: audienceImages[3],
          title: 'Delis',
          text: 'Counter, retail and institutional catering.',
        },
        audienceIds[3]?.id,
      ),
    ],
    gastronomyProductCaption: 'Runner bean tempeh for your kitchen',
    gastronomyProductCtaLabel: 'Send a B2B enquiry',
    gastronomyProductB2bLine: 'B2B / larger quantities',
    gastronomyProofImage: proofId,
    gastronomyTestimonialsTitle: 'From the kitchen',
    gastronomyTestimonialsItems: [
      withId(
        {
          quote:
            "Fermentfreude's runner bean tempeh impresses with its mild, nutty flavor and versatile applications. A genuine enrichment for Styrian cuisine.",
          author: 'Michael Wankerl, Gerüchteküche',
        },
        quoteIds[0]?.id,
      ),
    ],
    gastronomyContactFormHeading: 'B2B enquiry',
    gastronomyFormPlaceholders: {
      firstName: 'Name',
      lastName: 'Restaurant / company',
      email: 'Email',
      phone: 'Phone (optional)',
      quantity: 'Approximate quantity (optional)',
      message: 'Message',
    },
    gastronomyBusinessTypeOptions: {
      default: 'Type of business',
      options: [
        withId({ label: 'Restaurant' }, businessIds[0]?.id),
        withId({ label: 'Hotel' }, businessIds[1]?.id),
        withId({ label: 'Catering' }, businessIds[2]?.id),
        withId({ label: 'Other' }, businessIds[3]?.id),
      ],
    },
    gastronomySubjectOptions: {
      default: 'What are you interested in?',
      options: [
        withId({ label: 'Tempeh / B2B order' }, subjectIds[0]?.id),
        withId({ label: 'Product information' }, subjectIds[1]?.id),
        withId({ label: 'Samples / testing' }, subjectIds[2]?.id),
        withId({ label: 'Team training' }, subjectIds[3]?.id),
        withId({ label: 'Other' }, subjectIds[4]?.id),
      ],
    },
    gastronomySubmitButtonLabel: 'Send enquiry',
  }

  enUpdates.gastronomyHeroImage = heroId
  enUpdates.gastronomyProductImage = productId

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context: ctx,
    data: {
      _status: 'published',
      gastronomy: {
        ...gEn,
        ...enUpdates,
      },
    },
  })

  payload.logger.info('Gastronomy CMS synced with the B2B layout (DE + EN).')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
