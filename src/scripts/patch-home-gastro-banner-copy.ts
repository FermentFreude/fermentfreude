/**
 * Home "Gastronomie" banner: copy aimed at restaurants and professional kitchens
 * (tempeh as a product + training for kitchen teams), button → the "Für Köche"
 * page (/gastronomy), based on the founders'
 * Gastro price list 2026. DE first, then EN with the same offer-point IDs.
 *
 * Run:  npx tsx src/scripts/patch-home-gastro-banner-copy.ts   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const copy = {
  de: {
    eyebrow: 'Für Gastronomie & Profiküchen',
    heading: 'Steirischer Tempeh\nfür eure Profiküche.',
    buttonLink: '/gastronomy',
    description:
      'Fermentierte Käferbohnen, handwerklich hergestellt in Graz. Ein eigenständiges Premiumprodukt mit nussigem Aroma und feiner Textur – für Wirtshausküche, Fine Dining und plant-forward Konzepte.',
    buttonLabel: 'Alles für Köche',
    points: [
      { title: 'Tempeh für eure Küche', text: 'Aus nur 3 Zutaten. Vakuumiert, 6 Wochen haltbar.' },
      { title: 'Schulungen fürs Team', text: 'Fermentation praxisnah für eure Köch:innen.' },
      { title: 'Verkostungen & Events', text: 'Wir kommen mit Tempeh und Fermenten zu euch.' },
    ],
  },
  en: {
    eyebrow: 'For restaurants & professional kitchens',
    heading: 'Styrian tempeh\nfor your professional kitchen.',
    buttonLink: '/gastronomy',
    description:
      'Fermented runner beans, handmade in Graz. A premium product in its own right, with a nutty aroma and fine texture – for modern inn cooking, fine dining and plant-forward concepts.',
    buttonLabel: 'Everything for chefs',
    points: [
      { title: 'Tempeh for your kitchen', text: 'Just 3 ingredients. Vacuum-packed, keeps 6 weeks.' },
      { title: 'Training for your team', text: 'Hands-on fermentation for your chefs.' },
      { title: 'Tastings & events', text: 'We come to you with tempeh and ferments.' },
    ],
  },
}

async function main() {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = found.docs[0]
  if (!home) throw new Error('Home page not found')
  console.log('Home updatedAt before this run:', home.updatedAt)

  // 1 · DE — new point rows get their IDs here
  const de = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'de',
    data: {
      layout: (de.layout ?? []).map((b) =>
        b.blockType === 'heroBanner' ? { ...b, ...copy.de } : b,
      ),
    } as never,
    context: ctx,
  })
  console.log('✅ de')

  // 2 · read back the point IDs, 3 · EN with the same IDs
  const deSaved = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
  const ids =
    deSaved.layout?.find((b) => b.blockType === 'heroBanner')?.points?.map((p) => p.id) ?? []
  const en = await payload.findByID({ collection: 'pages', id: home.id, locale: 'en', depth: 0 })
  await payload.update({
    collection: 'pages',
    id: home.id,
    locale: 'en',
    data: {
      layout: (en.layout ?? []).map((b) =>
        b.blockType === 'heroBanner'
          ? { ...b, ...copy.en, points: copy.en.points.map((p, i) => ({ ...p, id: ids[i] })) }
          : b,
      ),
    } as never,
    context: ctx,
  })
  console.log('✅ en (point IDs reused:', ids.length, ')')
}

await main()
process.exit(0)
