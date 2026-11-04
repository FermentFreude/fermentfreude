/**
 * Home, Tempeh slide (founders' copy, 2026-11-04): eyebrow, editorial headline, the
 * paragraph, "Zubereitung" steps as the points row, and the note under the
 * button. DE first, then EN with the same point IDs.
 *
 * Run:  npx tsx src/scripts/patch-home-tempeh-slide-copy.ts   (staging DB only)
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

const COPY = {
  de: {
    eyebrow: 'Fermentierte steirische Käferbohnen',
    label: 'Regional. Innovativ. Vielseitig.',
    subline: null,
    text: 'Wir fermentieren Käferbohnen zu steirischem Tempeh. Ein eigenständiges Premiumprodukt mit nussigem Aroma, feiner Textur und vielseitiger Einsetzbarkeit für moderne Wirtshausküche, Fine Dining und plant-forward Konzepte.',
    buttonNote: 'Vakuumiert & gekühlt\n6 Wochen haltbar',
    trustPointsTitle: 'Zubereitung',
    points: [
      { icon: 'slice', text: 'Schneiden', detail: 'In Scheiben oder Würfel schneiden.' },
      { icon: 'flame', text: 'Anbraten', detail: 'Bei hoher Hitze in ausreichend Öl goldbraun anbraten.' },
      { icon: 'droplets', text: 'Würzen', detail: 'Vorab marinieren oder nach dem Braten würzen.' },
    ],
  },
  en: {
    eyebrow: 'Fermented Styrian runner beans',
    label: 'Regional. Innovative. Versatile.',
    subline: null,
    text: 'We ferment runner beans into Styrian tempeh. A premium product in its own right, with a nutty aroma, fine texture and many uses – for modern tavern cooking, fine dining and plant-forward concepts.',
    buttonNote: 'Vacuum-packed & chilled\nKeeps for 6 weeks',
    trustPointsTitle: 'Preparation',
    points: [
      { icon: 'slice', text: 'Slice', detail: 'Cut into slices or cubes.' },
      { icon: 'flame', text: 'Sear', detail: 'Fry in plenty of oil over high heat until golden brown.' },
      { icon: 'droplets', text: 'Season', detail: 'Marinate beforehand or season after frying.' },
    ],
  },
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

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

  let pointIds: (string | null | undefined)[] = []
  for (const locale of ['de', 'en'] as const) {
    const c = COPY[locale]
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'productShowcase') return b
      if (locale === 'de') {
        return {
          ...b,
          trustPointsTitle: c.trustPointsTitle,
          trustPoints: c.points,
          slides: (b.slides ?? []).map((s) =>
            s.slideType === 'workshops'
              ? s
              : { ...s, eyebrow: c.eyebrow, label: c.label, subline: c.subline, text: c.text, buttonNote: c.buttonNote },
          ),
        }
      }
      if (pointIds.length !== c.points.length) throw new Error('DE point IDs missing')
      return {
        ...b,
        trustPointsTitle: c.trustPointsTitle,
        trustPoints: c.points.map((p, i) => ({ ...p, id: pointIds[i] })),
        slides: (b.slides ?? []).map((s) =>
          s.slideType === 'workshops'
            ? s
            : { ...s, eyebrow: c.eyebrow, label: c.label, subline: c.subline, text: c.text, buttonNote: c.buttonNote },
        ),
      }
    })
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { layout } as never,
      context: ctx,
    })
    if (locale === 'de') {
      // Read back the IDs Payload gave the new DE rows, so EN reuses them
      const saved = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
      const block = (saved.layout ?? []).find((b) => b.blockType === 'productShowcase')
      pointIds = block && block.blockType === 'productShowcase' ? (block.trustPoints ?? []).map((t) => t.id) : []
    }
    console.log(`✅ ${locale}`)
  }
}

await main()
process.exit(0)
