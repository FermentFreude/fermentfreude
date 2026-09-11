/**
 * Copy current gastronomy field values into drag-and-drop blocks.
 * Does not change the live wording — it only moves the same content into blocks.
 *
 * Run: npx tsx src/scripts/patch-gastronomy-blocks.ts
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

import type { Page } from '@/payload-types'

type Gastronomy = NonNullable<Page['gastronomy']>
type GastronomyBlocks = NonNullable<Gastronomy['gastronomyBlocks']>

function mediaId(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string }).id)
  }
  return undefined
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function rows(value: unknown): Array<{
  id?: string
  image?: string
  title: string
  text: string
}> {
  if (!Array.isArray(value)) return []
  return value.map((row: Record<string, unknown>) => {
    const image = mediaId(row.image)
    return {
      ...(typeof row.id === 'string' ? { id: row.id } : {}),
      ...(image ? { image } : {}),
      title: text(row.title),
      text: text(row.text),
    }
  })
}

function optionGroup(value: unknown) {
  const group = (value ?? {}) as {
    default?: string
    options?: Array<{ id?: string; label?: string }>
  }
  return {
    default: text(group.default),
    options: (group.options ?? []).map((opt) => ({
      ...(opt.id ? { id: opt.id } : {}),
      label: text(opt.label),
    })),
  }
}

function buildBlocks(g: Record<string, unknown>): GastronomyBlocks {
  const placeholders = (g.gastronomyFormPlaceholders ?? {}) as Record<string, unknown>
  return [
    {
      blockType: 'gastronomyHero',
      visible: g.gastronomyShowHero !== false,
      image: mediaId(g.gastronomyHeroImage),
      eyebrow: text(g.gastronomyHeroEyebrow),
      title: text(g.gastronomyHeroTitle),
      tagline: text(g.gastronomyHeroTagline),
      ctaLabel: text(g.gastronomyHeroCtaLabel),
      ctaUrl: text(g.gastronomyHeroCtaUrl) || '#contact',
      secondaryLabel: text(g.gastronomyHeroCtaSecondaryLabel),
      secondaryUrl: text(g.gastronomyHeroCtaSecondaryUrl),
    },
    {
      blockType: 'gastronomyShowcase',
      visible: g.gastronomyShowShowcase !== false,
      title: text(g.gastronomyShowcaseTitle),
      slides: rows(g.gastronomyUsageBanners),
    },
    {
      blockType: 'gastronomyBenefits',
      visible: g.gastronomyShowBenefits !== false,
      title: text(g.gastronomyFactsTitle),
      items: rows(g.gastronomyFacts).map(({ title, text: body, id }, i) => ({
        ...(id ? { id } : {}),
        icon: (['utensils', 'sparkles', 'leaf', 'chefHat'] as const)[i] ?? 'utensils',
        title,
        text: body,
      })),
    },
    {
      blockType: 'gastronomyAudience',
      visible: g.gastronomyShowAudience !== false,
      title: text(g.gastronomyTrustedByHeading),
      cards: rows(g.gastronomyAudienceCards),
    },
    {
      blockType: 'gastronomyProduct',
      visible: g.gastronomyShowProduct !== false,
      image: mediaId(g.gastronomyProductImage),
      title: text(g.gastronomyProductCaption),
      ctaLabel: text(g.gastronomyProductCtaLabel),
      b2bLine: text(g.gastronomyProductB2bLine),
    },
    {
      blockType: 'gastronomyProof',
      visible: g.gastronomyShowProof !== false,
      image: mediaId(g.gastronomyProofImage),
      title: text(g.gastronomyTestimonialsTitle),
      items: Array.isArray(g.gastronomyTestimonialsItems)
        ? (g.gastronomyTestimonialsItems as Array<Record<string, unknown>>).map((row) => ({
            ...(typeof row.id === 'string' ? { id: row.id } : {}),
            quote: text(row.quote),
            author: text(row.author),
          }))
        : [],
    },
    {
      blockType: 'gastronomyInquiry',
      visible: g.gastronomyShowInquiry !== false,
      heading: text(g.gastronomyContactFormHeading),
      email: text(g.gastronomyContactEmail),
      phone: text(g.gastronomyContactPhone),
      placeholders: {
        firstName: text(placeholders.firstName),
        lastName: text(placeholders.lastName),
        email: text(placeholders.email),
        phone: text(placeholders.phone),
        quantity: text(placeholders.quantity),
        message: text(placeholders.message),
      },
      businessType: optionGroup(g.gastronomyBusinessTypeOptions),
      interest: optionGroup(g.gastronomySubjectOptions),
      submitLabel: text(g.gastronomySubmitButtonLabel),
    },
  ]
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
  const gDe = (deDoc.gastronomy ?? {}) as Record<string, unknown>
  if (Array.isArray(gDe.gastronomyBlocks) && gDe.gastronomyBlocks.length > 0) {
    payload.logger.info('Gastronomy blocks already exist — leaving them as is.')
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
        gastronomyBlocks: buildBlocks(gDe),
      } as Gastronomy,
    },
  })

  const savedDE = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    fallbackLocale: false,
    depth: 0,
  })
  const deBlocks = savedDE.gastronomy?.gastronomyBlocks ?? []

  const enDoc = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const gEn = (enDoc.gastronomy ?? {}) as Record<string, unknown>
  const enBlocks = buildBlocks(gEn).map((block, i) => ({
    ...block,
    id: deBlocks[i]?.id ?? undefined,
  }))

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    context: ctx,
    data: {
      gastronomy: {
        ...gEn,
        gastronomyBlocks: enBlocks,
      } as Gastronomy,
    },
  })

  payload.logger.info('Gastronomy sections copied into drag-and-drop blocks (DE + EN).')
  process.exit(0)
}

patch().catch((err) => {
  console.error(err)
  process.exit(1)
})
