import type { Media as MediaType, Page as PageType, WorkshopSliderBlock } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { resolveWorkshopItemImages } from '@/utilities/getMediaByIds'

export type WorkshopItem = {
  title: string
  description: string
  features: { text: string }[]
  topics?: { title: string; description?: string | null }[]
  learnList?: { text: string }[]
  image: MediaType | string | null | undefined
  image2?: MediaType | string | null | undefined
  image3?: MediaType | string | null | undefined
  image4?: MediaType | string | null | undefined
  image5?: MediaType | string | null | undefined
  image6?: MediaType | string | null | undefined
  image7?: MediaType | string | null | undefined
  image8?: MediaType | string | null | undefined
  image9?: MediaType | string | null | undefined
  price?: string | null
  duration?: string | null
  format?: string | null
  location?: string | null
  groupSize?: string | null
  dates?: string | null
  ctaLink?: string | null
}

/**
 * Extract workshops from WorkshopSlider blocks and HeroSlider slides.
 * Uses depth: 0 to avoid populating broken howToArticles relationships on workshop pages.
 */
export async function getAllWorkshops(locale: 'de' | 'en'): Promise<WorkshopItem[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    // depth: 0 + omit workshopDetail — some pages have invalid howToArticles
    // IDs that crash Mongoose casting when the field is hydrated/populated.
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 100,
      locale,
      pagination: false,
      select: {
        layout: true,
        hero: true,
        slug: true,
      },
    })

    const workshops: WorkshopItem[] = []
    const seenCtaLinks = new Set<string>()
    let hasWorkshopSlider = false

    type RawSliderItem = NonNullable<WorkshopSliderBlock['workshops']>[number] & {
      topics?: { title: string; description?: string | null }[]
      learnList?: { text: string }[]
      image3?: MediaType | string | null
      image4?: MediaType | string | null
      image5?: MediaType | string | null
      image6?: MediaType | string | null
      image7?: MediaType | string | null
      image8?: MediaType | string | null
      image9?: MediaType | string | null
      price?: string | null
      duration?: string | null
      format?: string | null
      location?: string | null
      groupSize?: string | null
      dates?: string | null
    }

    const sliderItems: RawSliderItem[] = []

    for (const page of pages.docs as PageType[]) {
      const blocks = page.layout ?? []
      for (const block of blocks) {
        if (block.blockType === 'workshopSlider') {
          hasWorkshopSlider = true
          const wsBlock = block as WorkshopSliderBlock
          for (const w of wsBlock.workshops ?? []) {
            sliderItems.push(w as RawSliderItem)
          }
        }
      }
    }

    const resolvedSliderItems = await resolveWorkshopItemImages(sliderItems)

    for (const w of resolvedSliderItems) {
      const cta = w.ctaLink ?? null
      if (cta && !seenCtaLinks.has(cta)) {
        seenCtaLinks.add(cta)
        workshops.push({
          title: w.title ?? '',
          description: w.description ?? '',
          features: (w.features ?? []).map((f) => ({ text: f.text })),
          topics: (w.topics ?? []).map((topic) => ({
            title: topic.title,
            description: topic.description,
          })),
          learnList: (w.learnList ?? []).map((item) => ({ text: item.text })),
          image: w.image ?? null,
          image2: w.image2 ?? null,
          image3: w.image3 ?? null,
          image4: w.image4 ?? null,
          image5: w.image5 ?? null,
          image6: w.image6 ?? null,
          image7: w.image7 ?? null,
          image8: w.image8 ?? null,
          image9: w.image9 ?? null,
          price: w.price ?? null,
          duration: w.duration ?? null,
          format: w.format ?? null,
          location: w.location ?? null,
          groupSize: w.groupSize ?? null,
          dates: w.dates ?? null,
          ctaLink: cta,
        })
      }
    }

    if (hasWorkshopSlider) return workshops

    type HeroSlide = {
      slideId?: string
      title?: string
      description?: string
      ctaHref?: string
      leftImage?: unknown
      rightImage?: unknown
      attributes?: Array<{ text: string }>
    }

    const heroSlides: HeroSlide[] = []
    for (const page of pages.docs as PageType[]) {
      const hero = page.hero as Record<string, unknown> | undefined
      heroSlides.push(...((hero?.heroSlides ?? []) as HeroSlide[]))
    }

    const resolvedHeroSlides = await resolveWorkshopItemImages(heroSlides)

    for (const slide of resolvedHeroSlides) {
      const href = slide.ctaHref
      if (href && href.startsWith('/workshops/') && !seenCtaLinks.has(href)) {
        seenCtaLinks.add(href)
        const slideSlug = href.replace('/workshops/', '').replace(/^\//, '')
        workshops.push({
          title: (slide.title ?? slideSlug).replace(/\\n/g, ' '),
          description: slide.description ?? '',
          features: (slide.attributes ?? []).map((a) => ({ text: a.text })),
          image: (slide.leftImage ?? slide.rightImage) as WorkshopItem['image'],
          price: null,
          duration: '2.5 hours',
          format: null,
          location: 'Berlin-Neukölln',
          groupSize: null,
          dates: null,
          ctaLink: href.startsWith('/') ? href : `/${href}`,
        })
      }
    }

    return workshops
  } catch (error) {
    console.error('[getAllWorkshops] failed:', error)
    return []
  }
}

/**
 * Find workshop by slug (from ctaLink) and return it with full data.
 */
export async function findWorkshopBySlug(
  slug: string,
  locale: 'de' | 'en',
): Promise<WorkshopItem | null> {
  const workshops = await getAllWorkshops(locale)
  const target = `/workshops/${slug}`
  return workshops.find((w) => w.ctaLink === target || w.ctaLink === `/${slug}`) ?? null
}
