/**
 * Fix EN gastronomy fields that were saved with German copy (locale bleed).
 *
 * Run: npx tsx src/scripts/patch-gastronomy-en-locale.ts
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

import {
  GASTRONOMY_FAQ_EN,
  GASTRONOMY_OUTCOMES_EN,
  GASTRONOMY_PROCESS_STEPS_EN,
  GASTRONOMY_TESTIMONIALS_EN,
  GASTRONOMY_TRUST_BADGES_EN,
  hasGermanTrustBadges,
  isGermanBeforeAfterLabel,
  looksGerman,
} from '../utilities/gastronomyLocaleContent'

import type { Page as PageType } from '../payload-types'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

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

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })

  const g = (enDoc.gastronomy ?? {}) as NonNullable<PageType['gastronomy']>
  const updates: Record<string, unknown> = {}

  if (!g.gastronomyTrustedByHeading?.trim() || looksGerman(g.gastronomyTrustedByHeading)) {
    updates.gastronomyTrustedByHeading = 'Trusted by'
  }

  const badgeLabels = (g.gastronomyTrustedByBadges ?? [])
    .map((b) => b?.label?.trim())
    .filter((x): x is string => Boolean(x))
  if (badgeLabels.length === 0 || hasGermanTrustBadges(badgeLabels)) {
    updates.gastronomyTrustedByBadges = GASTRONOMY_TRUST_BADGES_EN.map((label) => ({ label }))
  }

  if (!g.gastronomyOutcomesEyebrow?.trim() || looksGerman(g.gastronomyOutcomesEyebrow)) {
    updates.gastronomyOutcomesEyebrow = 'The situation in many kitchens'
  }
  if (!g.gastronomyOutcomesTitle?.trim() || looksGerman(g.gastronomyOutcomesTitle)) {
    updates.gastronomyOutcomesTitle = 'How fermentation transforms your kitchen'
  }
  if (
    !g.gastronomyOutcomesBeforeLabel?.trim() ||
    isGermanBeforeAfterLabel(g.gastronomyOutcomesBeforeLabel) ||
    looksGerman(g.gastronomyOutcomesBeforeLabel)
  ) {
    updates.gastronomyOutcomesBeforeLabel = 'Before'
  }
  if (
    !g.gastronomyOutcomesAfterLabel?.trim() ||
    isGermanBeforeAfterLabel(g.gastronomyOutcomesAfterLabel) ||
    looksGerman(g.gastronomyOutcomesAfterLabel)
  ) {
    updates.gastronomyOutcomesAfterLabel = 'After'
  }

  const outcomeText = (g.gastronomyOutcomesItems ?? [])
    .map((row) => `${row?.before ?? ''} ${row?.after ?? ''}`)
    .join(' ')
  if (!outcomeText.trim() || looksGerman(outcomeText)) {
    updates.gastronomyOutcomesItems = mergeArrayByIndex(
      g.gastronomyOutcomesItems,
      GASTRONOMY_OUTCOMES_EN,
    )
  }

  if (!g.gastronomyProcessEyebrow?.trim() || looksGerman(g.gastronomyProcessEyebrow)) {
    updates.gastronomyProcessEyebrow = 'Interested?'
  }
  if (!g.gastronomyProcessTitle?.trim() || looksGerman(g.gastronomyProcessTitle)) {
    updates.gastronomyProcessTitle = 'Just ask and give it a try'
  }

  const processText = (g.gastronomyProcessSteps ?? [])
    .map((row) => `${row?.title ?? ''} ${row?.description ?? ''}`)
    .join(' ')
  if (!processText.trim() || looksGerman(processText)) {
    updates.gastronomyProcessSteps = mergeArrayByIndex(
      g.gastronomyProcessSteps,
      GASTRONOMY_PROCESS_STEPS_EN,
    )
  }

  if (!g.gastronomyTestimonialsEyebrow?.trim() || looksGerman(g.gastronomyTestimonialsEyebrow)) {
    updates.gastronomyTestimonialsEyebrow = 'References'
  }
  if (!g.gastronomyTestimonialsTitle?.trim() || looksGerman(g.gastronomyTestimonialsTitle)) {
    updates.gastronomyTestimonialsTitle =
      'What gastro professionals, businesses and entrepreneurs say'
  }

  const testimonialText = (g.gastronomyTestimonialsItems ?? [])
    .map((row) => `${row?.quote ?? ''} ${row?.author ?? ''}`)
    .join(' ')
  if (!testimonialText.trim() || looksGerman(testimonialText)) {
    updates.gastronomyTestimonialsItems = mergeArrayByIndex(
      g.gastronomyTestimonialsItems,
      GASTRONOMY_TESTIMONIALS_EN,
    )
  }

  if (!g.gastronomyFaqEyebrow?.trim() || looksGerman(g.gastronomyFaqEyebrow)) {
    updates.gastronomyFaqEyebrow = 'FAQ'
  }
  if (!g.gastronomyFaqTitle?.trim() || looksGerman(g.gastronomyFaqTitle)) {
    updates.gastronomyFaqTitle = 'Common questions'
  }

  const faqText = (g.gastronomyFaqItems ?? [])
    .map((row) => `${row?.question ?? ''} ${row?.answer ?? ''}`)
    .join(' ')
  if (!faqText.trim() || looksGerman(faqText)) {
    updates.gastronomyFaqItems = mergeArrayByIndex(
      g.gastronomyFaqItems,
      GASTRONOMY_FAQ_EN.map((row) => ({ question: row.q, answer: row.a })),
    )
  }

  if (Object.keys(updates).length === 0) {
    payload.logger.info('EN gastronomy locale already looks English — no patch needed')
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: {
      gastronomy: {
        ...(g as Record<string, unknown>),
        ...updates,
      },
    },
    context: ctx,
  })

  payload.logger.info(`✅ Updated EN gastronomy fields: ${Object.keys(updates).join(', ')}`)
}

patch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
