/**
 * Add product fact lines to the gastronomy Product block.
 * Does not change other section copy.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-product-facts.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

import type { Page } from '@/payload-types'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const db = process.env.DATABASE_URL ?? ''
if (!/staging/i.test(db)) {
  console.error('Refusing to run: DATABASE_URL does not look like staging.')
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const FACTS_DE = [
  '185 g · 1 Packung',
  'Vegan',
  'Glutenfrei',
  'Regionale Zutaten · Österreich · Graz',
  'B2B / größere Mengen',
]
const FACTS_EN = [
  '185 g · 1 pack',
  'Vegan',
  'Gluten-Free',
  'Regional ingredients · Austria · Graz',
  'B2B / larger quantities',
]

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

type Blocks = NonNullable<NonNullable<Page['gastronomy']>['gastronomyBlocks']>

function withFacts(blocks: Blocks | null | undefined, facts: string[]): Blocks {
  return (blocks ?? []).map((block) => {
    if (block.blockType !== 'gastronomyProduct') return block
    const existing = (block.facts ?? [])
      .map((row) => row?.text?.trim())
      .filter(Boolean)
    if (existing.length > 0) return block
    return {
      ...block,
      ctaUrl: block.ctaUrl?.trim() || '#contact',
      facts: facts.map((text) => ({ text })),
    }
  })
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

  const deDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const gDe = deDoc.gastronomy
  if (!gDe?.gastronomyBlocks?.length) {
    payload.logger.error('Gastronomy blocks missing — run patch-gastronomy-blocks.ts first.')
    process.exit(1)
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    context: ctx,
    data: {
      gastronomy: {
        ...gDe,
        gastronomyBlocks: withFacts(gDe.gastronomyBlocks, FACTS_DE),
      },
    },
  })

  const savedDE = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const deFactIds =
    savedDE.gastronomy?.gastronomyBlocks?.find((b) => b.blockType === 'gastronomyProduct')?.facts?.map(
      (row) => row.id,
    ) ?? []

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const gEn = enDoc.gastronomy
  const enBlocks = withFacts(gEn?.gastronomyBlocks, FACTS_EN).map((block) => {
    if (block.blockType !== 'gastronomyProduct') return block
    return {
      ...block,
      facts: (block.facts ?? []).map((row, i) => ({
        ...row,
        id: deFactIds[i] ?? row.id,
      })),
    }
  })

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context: ctx,
    data: {
      gastronomy: {
        ...gEn,
        gastronomyBlocks: enBlocks,
      },
    },
  })

  payload.logger.info('Gastronomy product facts saved (DE + EN).')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
