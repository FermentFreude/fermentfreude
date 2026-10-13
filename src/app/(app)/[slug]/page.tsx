import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { TestimonialsGlobalWrapper } from '@/components/TestimonialsGlobalWrapper'
import { RenderHero } from '@/heros/RenderHero'
import { StackPanel } from '@/components/StackPanel'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import { strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload, type TypedLocale } from 'payload'

import { notFound } from 'next/navigation'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

const WORKSHOP_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha', 'vom-feld-ins-glas']
const LEGAL_SLUGS = ['agb', 'datenschutz', 'impressum']

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params
  const locale = await getLocale()

  if (WORKSHOP_SLUGS.includes(slug)) {
    return notFound()
  }

  const page = await queryPageBySlug({
    slug,
    locale,
  })

  if (!page) {
    return notFound()
  }

  const { hero, layout } = page
  const nextWorkshopDatesByHref = await getNextWorkshopDatesByHref(locale)

  const enrichedLayout = (layout ?? []).map((block) => {
    if (block?.blockType !== 'workshopSlider') return block

    return {
      ...block,
      upcomingLabel: locale === 'de' ? 'Nächster Termin' : 'Next date',
      upcomingDatesByHref: nextWorkshopDatesByHref,
    }
  })

  const isFullBleedHero =
    hero.type === 'heroSlider' ||
    hero.type === 'heroCarousel' ||
    hero.type === 'heroCinematic' ||
    hero.type === 'heroGrid' ||
    hero.type === 'heroSplit' ||
    hero.type === 'heroPress' ||
    hero.type === 'foodPresentationSlider' ||
    hero.type === 'highImpact'
  const isLegalPage = LEGAL_SLUGS.includes(slug)
  // Home: the product showcase directly under the hero slides over it like a stacked card
  const STACKED_BLOCKS = new Set(['productShowcase'])
  // Experimental: on Home the new product showcase replaces the old Tempeh & Kimchi
  // carousel. The old block stays saved in the CMS (and keeps showing wherever
  // this code isn't deployed) — it's only skipped here.
  const pageLayout =
    slug === 'home' && enrichedLayout.some((b) => b?.blockType === 'productShowcase')
      ? enrichedLayout.filter((b) => b?.blockType !== 'homeTempehStory')
      : enrichedLayout
  const stackBlocks: typeof enrichedLayout = []
  if (slug === 'home') {
    for (const block of pageLayout) {
      if (!block || !STACKED_BLOCKS.has(block.blockType) || block.visible === false) break
      stackBlocks.push(block)
    }
  }
  const skipTopPadding = isFullBleedHero || slug === 'help'

  return (
    <article
      className={
        slug === 'help'
          ? 'bg-[#F9F0DC] pb-0'
          : skipTopPadding
            ? 'pb-24'
            : `pt-16 pb-24${isLegalPage ? ' page-legal' : ''}`
      }
    >
      {stackBlocks.length ? (
        // Home: hero and the product sections right after it stack like cards.
        // Dark backdrop shows around a panel as it sinks back.
        <div className="relative bg-[#0b0b0b]">
          <StackPanel index={0}>
            <RenderHero {...hero} locale={locale} />
          </StackPanel>
          {stackBlocks.map((block, i) => (
            <StackPanel key={block.id ?? i} index={i + 1} last={i === stackBlocks.length - 1}>
              <RenderBlocks blocks={[block]} slug={slug} locale={locale} />
            </StackPanel>
          ))}
        </div>
      ) : (
        <RenderHero {...hero} locale={locale} />
      )}
      <RenderBlocks blocks={pageLayout.slice(stackBlocks.length)} slug={slug} locale={locale} />
      {slug === 'home' && !pageLayout.some((b) => b?.blockType === 'testimonials') && (
        <TestimonialsGlobalWrapper id="testimonials" />
      )}
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params
  const locale = await getLocale()

  const page = await queryPageBySlug({
    slug,
    locale,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = async ({ slug, locale }: { slug: string; locale?: 'de' | 'en' }) => {
  const { isEnabled: draft } = await draftMode()
  const resolvedLocale = locale ?? 'de'

  const fetchLivePage = async () => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      depth: 5,
      draft: draft,
      limit: 1,
      ...strictLocaleQuery(resolvedLocale),
      overrideAccess: draft,
      pagination: false,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
        ],
      },
    })
    return result.docs?.[0] || null
  }

  // Dev + draft: always fetch live (avoids stale 404 after seeding)
  if (draft || process.env.NODE_ENV === 'development') {
    return fetchLivePage()
  }

  return getCachedPage(slug, resolvedLocale)
}

const getCachedPage = unstable_cache(
  async (slug: string, locale: TypedLocale) => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      depth: 5,
      draft: false,
      limit: 1,
      ...strictLocaleQuery(locale),
      overrideAccess: false,
      pagination: false,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          { _status: { equals: 'published' } },
        ],
      },
    })
    return result.docs?.[0] || null
  },
  ['page-by-slug'],
  { revalidate: 3600, tags: ['pages'] },
)
