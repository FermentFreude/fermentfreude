/**
 * Add the drag-and-drop gastronomy section order (current live order).
 * Does not change copy or images.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-section-order.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

import type { Page } from '@/payload-types'
import { defaultGastronomySectionOrderRows } from '@/fields/gastronomySections'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const db = process.env.DATABASE_URL ?? ''
if (!/staging/i.test(db)) {
  console.error('Refusing to run: DATABASE_URL does not look like staging.')
  process.exit(1)
}

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

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
  const gDe = (deDoc.gastronomy ?? {}) as Record<string, unknown>
  const existing = Array.isArray(gDe.gastronomySectionOrder) ? gDe.gastronomySectionOrder : []
  if (existing.length > 0) {
    payload.logger.info('Section order already set — leaving it as is.')
    process.exit(0)
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    context: ctx,
    data: {
      gastronomy: {
        ...gDe,
        gastronomySectionOrder: defaultGastronomySectionOrderRows(),
      } as unknown as Page['gastronomy'],
    },
  })

  const savedDE = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const ids =
    ((savedDE.gastronomy as { gastronomySectionOrder?: Array<{ id?: string }> } | undefined)
      ?.gastronomySectionOrder ?? [])
      .map((row) => row.id)

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const gEn = (enDoc.gastronomy ?? {}) as Record<string, unknown>
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context: ctx,
    data: {
      gastronomy: {
        ...gEn,
        gastronomySectionOrder: defaultGastronomySectionOrderRows().map((row, i) => ({
          ...row,
          id: ids[i],
        })),
      } as unknown as Page['gastronomy'],
    },
  })

  payload.logger.info('Gastronomy section order saved (current live order).')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
