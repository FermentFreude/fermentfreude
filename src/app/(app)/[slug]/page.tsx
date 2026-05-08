import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { TestimonialsGlobalWrapper } from '@/components/TestimonialsGlobalWrapper'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
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

const WORKSHOP_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha']
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
    hero.type === 'heroGrid' ||
    hero.type === 'heroSplit' ||
    hero.type === 'foodPresentationSlider' ||
    hero.type === 'highImpact'
  const isLegalPage = LEGAL_SLUGS.includes(slug)

  return (
    <article
      className={isFullBleedHero ? 'pb-24' : `pt-16 pb-24${isLegalPage ? ' page-legal' : ''}`}
    >
      <RenderHero {...hero} locale={locale} />
      <RenderBlocks blocks={enrichedLayout} slug={slug} />
      {slug === 'home' && !enrichedLayout.some((b) => b?.blockType === 'testimonials') && (
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

  if (draft) {
    // Draft mode: bypass cache, always fetch live content for editors
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      depth: 5,
      draft: true,
      limit: 1,
      locale,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
        ],
      },
    })
    return result.docs?.[0] || null
  }

  // Regular visitors: use cached query result (busted by revalidatePage hook on CMS save)
  return getCachedPage(slug, locale ?? 'de')
}

const getCachedPage = unstable_cache(
  async (slug: string, locale: TypedLocale) => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      depth: 5,
      draft: false,
      limit: 1,
      locale,
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
