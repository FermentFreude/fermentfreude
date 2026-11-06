/**
 * Home copy pass (2026-11-04): short storytelling texts for the hero and the two
 * showcase slides, DE + EN. Staging DB only, idempotent.
 * Run:  npx tsx src/scripts/patch-home-copy.ts
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
    hero: {
      eyebrow: 'Marcel & David · Graz',
      title: 'Wir sind FermentFreude.',
      titleAccent: '',
      description:
        'Marcel bringt die Küche mit, David die Wissenschaft. In Graz machen wir Tempeh aus steirischen Käferbohnen und zeigen dir, wie Fermentieren zu Hause einfach und sicher gelingt.',
    },
    tempeh: {
      text: 'Nussig, herzhaft, voller Umami – aus steirischen Käferbohnen. Beim Anbraten außen goldbraun, innen saftig.',
    },
    workshops: {
      text: 'Lerne Schritt für Schritt, wie du Fermente selbst herstellst. Alles inklusive, dein Ferment nimmst du mit nach Hause.',
    },
  },
  en: {
    hero: {
      eyebrow: 'Marcel & David · Graz',
      title: 'We are FermentFreude.',
      titleAccent: '',
      description:
        'Marcel brings the kitchen, David the science. In Graz we make tempeh from Styrian runner beans and show you how fermenting at home works – simply and safely.',
    },
    tempeh: {
      text: 'Nutty, savoury, full of umami – made from Styrian runner beans. Golden outside, juicy inside when pan-fried.',
    },
    workshops: {
      text: 'Learn step by step how to make ferments yourself. Everything included, and you take your ferment home.',
    },
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

  for (const locale of ['de', 'en'] as const) {
    const c = copy[locale]
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
    const h = doc.hero as { cinematicSlides?: Record<string, unknown>[] } & Record<string, unknown>
    const [first, ...rest] = h.cinematicSlides ?? []
    const heroData = first ? { ...h, cinematicSlides: [{ ...first, ...c.hero }, ...rest] } : h
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'productShowcase') return b
      return {
        ...b,
        slides: (b.slides ?? []).map((s, i) =>
          s.slideType === 'workshops'
            ? { ...s, ...c.workshops }
            : i === 0
              ? { ...s, ...c.tempeh }
              : s,
        ),
      }
    })
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { hero: heroData, layout } as never,
      context: ctx,
    })
    console.log(`✅ ${locale}`)
  }
}

await main()
process.exit(0)
