/**
 * Set benefit icons on the gastronomy Why tempeh block.
 * Does not change titles or text.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-benefit-icons.ts
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
const DEFAULT_ICONS = ['utensils', 'sparkles', 'leaf', 'chefHat'] as const

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

type Blocks = NonNullable<NonNullable<Page['gastronomy']>['gastronomyBlocks']>

function withIcons(blocks: Blocks | null | undefined): Blocks {
  return (blocks ?? []).map((block) => {
    if (block.blockType !== 'gastronomyBenefits') return block
    return {
      ...block,
      items: (block.items ?? []).map((item, i) => ({
        ...item,
        icon: item.icon || DEFAULT_ICONS[i] || 'utensils',
      })),
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
    payload.logger.error('Gastronomy blocks missing.')
    process.exit(1)
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    context: ctx,
    data: { gastronomy: { ...gDe, gastronomyBlocks: withIcons(gDe.gastronomyBlocks) } },
  })

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const gEn = enDoc.gastronomy

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context: ctx,
    data: { gastronomy: { ...gEn, gastronomyBlocks: withIcons(gEn?.gastronomyBlocks) } },
  })

  payload.logger.info('Gastronomy benefit icons saved (DE + EN).')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
