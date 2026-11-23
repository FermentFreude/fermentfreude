/**
 * Fermentation page: write the revised copy into the CMS so it actually shows.
 *
 * Why: Alaa's revised text (FERMENTATION_RETOUCH_DE / _EN) only lived in code as a fallback
 * for EMPTY fields. The CMS still held the older text, and CMS text always wins — so the
 * revised copy never appeared on the site.
 *
 * What it writes (DE + EN, same row IDs, images/icons/links untouched):
 *   - Alaa's revised copy for: benefits title, "Was ist" title + motto, Grundlagen/Warum section,
 *     danger section, practice section, CTA text, FAQ section.
 *   - KEEPS the founders' own German text typed in the admin on 22 Apr 2026 (hero title,
 *     hero intro, the 4 hero boxes, guide title + text, "Was ist" body) and adds the missing
 *     English translation for those fields (English was never updated).
 *
 * Refuses to run if the page's latest version is an unpublished draft (a script write
 * would publish over it).
 *
 * Run:  npx tsx src/scripts/patch-fermentation-revised-copy.ts                 (staging DB, dry run)
 *       npx tsx src/scripts/patch-fermentation-revised-copy.ts --write         (staging DB)
 *       npx tsx src/scripts/patch-fermentation-revised-copy.ts --production --write   (production, explicit)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const PRODUCTION = process.argv.includes('--production')
const WRITE = process.argv.includes('--write')
const dbName = (uri: string) =>
  (uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1] ?? '').trim()
if (PRODUCTION) process.env.DATABASE_URL = process.env.PROD_DATABASE_URL ?? ''
const expected = PRODUCTION ? 'fermentfreude' : 'fermentfreude-staging'
if (dbName(process.env.DATABASE_URL ?? '') !== expected) {
  console.error(`🚫 REFUSING TO RUN: the database must be ${expected}.`)
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const { FERMENTATION_RETOUCH_DE: DE, FERMENTATION_RETOUCH_EN: EN } = await import(
  '@/utilities/fermentationLocaleContent'
)

/** English for the founders' 22 Apr 2026 German text (DE stays exactly as they typed it). */
const FOUNDERS_EN = {
  heroTitle: 'Fermentation – used for thousands of years, more relevant today than ever',
  heroDescription:
    'Fermentation is far more than sauerkraut or yogurt. It is in many foods we eat every day – from bread and cheese to cocoa, vinegar or olives. Behind it lies a natural process that changes flavor, makes food last longer and easier to digest, and opens up new possibilities in cooking and nutrition. That is exactly where the potential of fermentation lies – and why it is gaining importance again today.',
  heroBlocks: [
    {
      title: 'NUTRITION',
      description:
        'Fermentation breaks down certain plant compounds and makes some nutrients more available. As a result, many fermented foods are easier to digest and can supply the body with nutrients more efficiently.',
    },
    {
      title: 'GUT HEALTH & MICROBIOME',
      description:
        'Depending on the product, fermented foods contain living microorganisms as well as metabolic products such as organic acids. Combined with dietary fiber, they can make a positive contribution to gut health.',
    },
    {
      title: 'FLAVOR & AROMA',
      description:
        'Fermentation fundamentally changes food: complex, often slightly tangy and layered aromas develop. This opens up new possibilities in the kitchen and makes even simple ingredients more exciting.',
    },
    {
      title: 'SUSTAINABILITY',
      description:
        'Fermentation makes food last longer and helps put vegetables or leftovers to good use. At the same time, it opens up new paths to a plant-based, resource-friendly diet.',
    },
  ],
  guideTitle: 'Is fermentation only for experts?',
  guideBody:
    'No – quite the opposite: with a basic understanding, fermentation is a controlled and safe method that has been used for thousands of years to deliberately transform food and make it last.',
  whatBody:
    'Fermentation is a natural metabolic process in which microorganisms such as bacteria, yeasts or molds convert components of food – such as sugar or other carbohydrates – into new compounds. Among other things, this creates organic acids, gases and aroma compounds that deliberately change the flavor, shelf life and properties of food.',
}

type Copy = typeof DE
type Row = Record<string, unknown> & { id?: string | null }
type Ferm = Record<string, unknown>

/** Overwrite the text keys of each row by index, keeping row IDs and every other key. */
function rows(current: unknown, next: Array<Record<string, string>>): Row[] {
  const cur = Array.isArray(current) ? (current as Row[]) : []
  return next.map((n, i) => ({ ...(cur[i] ?? {}), ...n }))
}

/** Fields taken from Alaa's revised copy, for one locale. */
function revised(copy: Copy, f: Ferm): Ferm {
  return {
    fermentationHeroBenefitsTitle: copy.heroBenefitsTitle,
    fermentationWhatTitle: copy.whatTitle,
    fermentationWhatMotto: copy.whatMotto,
    fermentationWhyEyebrow: copy.whyEyebrow,
    fermentationWhyTitle: copy.whyTitle,
    fermentationWhyItems: rows(f.fermentationWhyItems, copy.whyItems),
    fermentationDangerTitle: copy.dangerTitle,
    fermentationDangerIntro: copy.dangerIntro,
    fermentationDangerConcernsHeading: copy.dangerConcernsHeading,
    fermentationDangerConcerns: rows(f.fermentationDangerConcerns, copy.dangerConcerns),
    fermentationDangerClosing: copy.dangerClosing,
    fermentationPracticeTitle: copy.practiceTitle,
    fermentationPracticeBody: copy.practiceParagraphs.join('\n\n'),
    fermentationCtaTitle: copy.ctaTitle,
    fermentationCtaDescription: copy.ctaDescription,
    fermentationFaqTitle: copy.faqTitle,
    fermentationFaqSubtitle: copy.faqSubtitle,
    fermentationFaqItems: rows(f.fermentationFaqItems, copy.faqItems),
    fermentationFaqCtaTitle: copy.faqCtaTitle,
    fermentationFaqCtaBody: copy.faqCtaBody,
  }
}

/** English for the fields the founders wrote themselves in German. */
function foundersEn(f: Ferm): Ferm {
  return {
    fermentationHeroTitle: FOUNDERS_EN.heroTitle,
    fermentationHeroDescription: FOUNDERS_EN.heroDescription,
    fermentationHeroBlocks: rows(f.fermentationHeroBlocks, FOUNDERS_EN.heroBlocks),
    fermentationGuideTitle: FOUNDERS_EN.guideTitle,
    fermentationGuideBody: FOUNDERS_EN.guideBody,
    fermentationWhatBody: FOUNDERS_EN.whatBody,
  }
}

const short = (v: unknown) =>
  JSON.stringify(typeof v === 'string' ? v : Array.isArray(v) ? `${v.length} rows` : v)?.slice(0, 80)

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const found = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'fermentation' } },
  limit: 1,
  depth: 0,
})
const page = found.docs[0]
if (!page) {
  console.error('Fermentation page not found')
  process.exit(1)
}

const latest = await payload.findVersions({
  collection: 'pages',
  where: { parent: { equals: page.id } },
  sort: '-updatedAt',
  limit: 1,
  depth: 0,
})
const latestStatus = latest.docs[0]?.version?._status
if (latestStatus === 'draft') {
  console.error(
    '🚫 REFUSING: the newest version of the Fermentation page is an unpublished draft. Publish or discard it in /admin first.',
  )
  process.exit(1)
}

console.log(`Fermentation page on ${expected} (${WRITE ? 'WRITE' : 'dry run — add --write to save'})`)

const read = async (locale: 'de' | 'en') =>
  ((
    await payload.findByID({
      collection: 'pages',
      id: page.id,
      locale,
      fallbackLocale: false,
      depth: 0,
    })
  ).fermentation ?? {}) as Ferm

for (const locale of ['de', 'en'] as const) {
  const f = await read(locale)
  const changes =
    locale === 'de' ? revised(DE, f) : { ...revised(EN as unknown as Copy, f), ...foundersEn(f) }
  console.log(`\n── ${locale.toUpperCase()}`)
  for (const [k, v] of Object.entries(changes)) {
    if (JSON.stringify(f[k]) === JSON.stringify(v)) continue
    console.log(`  ${k}\n     before: ${short(f[k])}\n     after:  ${short(v)}`)
  }
  if (!WRITE) continue
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale,
    data: { fermentation: { ...f, ...changes } } as never,
    context: ctx,
  })
  console.log(`  ✅ ${locale} saved`)
}

process.exit(0)
