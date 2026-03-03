import type { Metadata } from 'next'

import { RenderBlocks } from '@/blocks/RenderBlocks'

export const dynamic = 'force-dynamic'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import { notFound } from 'next/navigation'

import type { Page as PageType } from '@/payload-types'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const WORKSHOP_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha']
  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home' && !WORKSHOP_SLUGS.includes(doc.slug ?? '')
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

const WORKSHOP_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha']

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

  let { hero, layout } = page
  const payload = await getPayload({ config: configPromise })

  // Resolve hero.media when depth didn't populate it (returns ID instead of object)
  if (hero?.media && typeof hero.media === 'string') {
    try {
      const mediaDoc = await payload.findByID({
        collection: 'media',
        id: hero.media,
        depth: 0,
      })
      hero = { ...hero, media: mediaDoc } as PageType['hero']
    } catch {
      hero = { ...hero, media: undefined } as PageType['hero']
    }
  }

  // Resolve heroCarousel slide images when depth didn't populate them
  if (hero?.type === 'heroCarousel' && hero.slides && hero.slides.length > 0) {
    hero = {
      ...hero,
      slides: await Promise.all(
        hero.slides.map(async (slide) => {
          const img = (slide as { image?: unknown }).image
          if (img && typeof img === 'string') {
            try {
              const mediaDoc = await payload.findByID({
                collection: 'media',
                id: img,
                depth: 0,
              })
              return { ...slide, image: mediaDoc }
            } catch {
              return slide
            }
          }
          return slide
        }),
      ),
    } as PageType['hero']
  }

  const isFullBleedHero =
    hero.type === 'heroSlider' ||
    hero.type === 'heroCarousel' ||
    hero.type === 'foodPresentationSlider' ||
    hero.type === 'highImpact' ||
    hero.type === 'videoBackground'

  return (
    <article className={isFullBleedHero ? 'pb-24' : 'pt-16 pb-24'}>
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout ?? []} />
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

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    depth: 5,
    draft,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
