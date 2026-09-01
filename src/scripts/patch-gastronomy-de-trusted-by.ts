/**
 * Fix DE gastronomy trusted-by section when EN copy was saved or inherited.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-de-trusted-by.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

import {
  hasEnglishTrustBadges,
  isEnglishTrustedByHeading,
} from '../utilities/gastronomyLocaleContent'
import type { Page as PageType } from '../payload-types'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const DE_TRUST_BADGES = [
  'Restaurants',
  'Hotels',
  'Catering',
  'Feinkost',
  'Gemeinschaftsverpflegung',
] as const

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

function mergeArrayByIndex<T extends { id?: string | null }>(
  existing: T[] | null | undefined,
  next: Omit<T, 'id'>[],
): T[] {
  return next.map((item, index) => ({
    ...(existing?.[index] ?? {}),
    ...item,
    id: existing?.[index]?.id,
  })) as T[]
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

  const g = (deDoc.gastronomy ?? {}) as NonNullable<PageType['gastronomy']>
  const updates: Record<string, unknown> = {}

  if (!g.gastronomyTrustedByHeading?.trim() || isEnglishTrustedByHeading(g.gastronomyTrustedByHeading)) {
    updates.gastronomyTrustedByHeading = 'Für Profiküchen'
  }

  const badgeLabels = (g.gastronomyTrustedByBadges ?? [])
    .map((b) => b?.label?.trim())
    .filter((x): x is string => Boolean(x))
  if (badgeLabels.length === 0 || hasEnglishTrustBadges(badgeLabels)) {
    updates.gastronomyTrustedByBadges = mergeArrayByIndex(
      g.gastronomyTrustedByBadges,
      DE_TRUST_BADGES.map((label) => ({ label })),
    )
  }

  if (Object.keys(updates).length === 0) {
    payload.logger.info('DE trusted-by section already looks German — no patch needed')
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    data: {
      gastronomy: {
        ...(g as Record<string, unknown>),
        ...updates,
      },
    },
    context: ctx,
  })

  payload.logger.info(`✅ Updated DE trusted-by: ${Object.keys(updates).join(', ')}`)
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
