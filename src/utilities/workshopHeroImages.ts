import type { Media, Page } from '@/payload-types'
import configPromise from '@payload-config'
import type { Payload } from 'payload'
import { getPayload } from 'payload'

import type { NextWorkshopDateInfo } from '@/utilities/getNextWorkshopDatesByHref'
import { strictLocaleQuery } from '@/utilities/payloadLocaleQuery'

/** Maps workshop card button URLs to Pages collection slugs. */
export const WORKSHOP_HREF_TO_PAGE_SLUG: Record<string, string> = {
  '/workshops/lakto-gemuese': 'lakto-gemuese',
  '/workshops/kombucha': 'kombucha',
  '/workshops/tempeh': 'tempeh',
  '/workshops/vom-feld-ins-glas': 'vom-feld-ins-glas',
}

/** Fixed display order for all four workshop cards. */
export const WORKSHOP_CARD_URLS = [
  '/workshops/lakto-gemuese',
  '/workshops/kombucha',
  '/workshops/tempeh',
  '/workshops/vom-feld-ins-glas',
] as const

export type WorkshopPageCardSync = {
  title: string | null
  description: string | null
  price: string | null
  priceSuffix: string | null
  image: Media | null
}

function hrefForPageSlug(slug: string): string | undefined {
  return Object.entries(WORKSHOP_HREF_TO_PAGE_SLUG).find(([, pageSlug]) => pageSlug === slug)?.[0]
}

function heroImageId(hero: unknown): string | null {
  if (!hero) return null
  if (typeof hero === 'string') return hero
  if (typeof hero === 'object' && hero !== null && 'id' in hero && typeof hero.id === 'string') {
    return hero.id
  }
  return null
}

function isResolvedMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

function formatHeroTitle(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return trimmed.replace(/\s*\n+\s*/g, ' ').trim()
}

function formatWorkshopPrice(
  price: number | null | undefined,
  currency: string | null | undefined,
  suffix: string | null | undefined,
): { price: string | null; priceSuffix: string | null } {
  if (price == null || Number.isNaN(price)) {
    return {
      price: null,
      priceSuffix: suffix?.trim() || null,
    }
  }

  const cur = currency?.trim() || '€'
  const priceStr = cur.endsWith(String(price))
    ? cur
    : cur === '€'
      ? `€${price}`
      : `${cur}${price}`

  return {
    price: priceStr,
    priceSuffix: suffix?.trim() || null,
  }
}

function pageToCardSync(page: Page): WorkshopPageCardSync {
  const detail = page.workshopDetail
  const hero = detail?.heroImage ?? null
  const { price, priceSuffix } = formatWorkshopPrice(
    detail?.bookingPrice,
    detail?.bookingCurrency,
    detail?.bookingPriceSuffix,
  )

  return {
    title: formatHeroTitle(detail?.heroTitle),
    description: detail?.heroDescription?.trim() || null,
    price,
    priceSuffix,
    image: isResolvedMedia(hero) ? hero : null,
  }
}

async function loadWorkshopPages(
  payload: Payload,
  locale: 'de' | 'en',
  depth: 0 | 2,
): Promise<Page[]> {
  const slugs = [...new Set(Object.values(WORKSHOP_HREF_TO_PAGE_SLUG))]

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    ...strictLocaleQuery(locale),
    depth,
  })

  return result.docs as Page[]
}

/** Title, description, price and hero image from each workshop page CMS. */
export async function getWorkshopPageCardDataByHref(
  locale: 'de' | 'en',
): Promise<Record<string, WorkshopPageCardSync>> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await loadWorkshopPages(payload, locale, 2)
    const byHref: Record<string, WorkshopPageCardSync> = {}

    for (const page of pages) {
      if (!page.slug) continue
      const href = hrefForPageSlug(page.slug)
      if (!href) continue
      byHref[href] = pageToCardSync(page)
    }

    return byHref
  } catch (error) {
    console.error('Error fetching workshop page card data by href:', error)
    return {}
  }
}

/** Resolved hero Media keyed by workshop card button URL (for page rendering). */
export async function getWorkshopHeroImagesByHref(): Promise<Record<string, Media | null>> {
  const cardData = await getWorkshopPageCardDataByHref('de')
  const byHref: Record<string, Media | null> = {}

  for (const url of WORKSHOP_CARD_URLS) {
    byHref[url] = cardData[url]?.image ?? null
  }

  return byHref
}

/** Media IDs keyed by workshop card button URL (for seed scripts). */
export async function getWorkshopHeroImageIdsByHref(
  payload: Payload,
): Promise<Record<string, string | null>> {
  const pages = await loadWorkshopPages(payload, 'de', 0)
  const byHref: Record<string, string | null> = {}

  for (const page of pages) {
    if (!page.slug) continue
    const href = hrefForPageSlug(page.slug)
    if (!href) continue
    byHref[href] = heroImageId(page.workshopDetail?.heroImage)
  }

  for (const url of WORKSHOP_CARD_URLS) {
    if (!(url in byHref)) byHref[url] = null
  }

  return byHref
}

export type WorkshopCardWithImage = {
  buttonUrl?: string | null
  image?: unknown
}

/** Prefer each workshop page hero over manually uploaded card images. */
export function applyWorkshopHeroImagesToCards<T extends WorkshopCardWithImage>(
  cards: T[],
  heroImagesByHref: Record<string, Media | null>,
): T[] {
  return cards.map((card) => {
    const href = card.buttonUrl?.trim()
    if (!href) return card

    const hero = heroImagesByHref[href]
    if (hero) {
      return { ...card, image: hero }
    }

    return card
  })
}

export { hrefForPageSlug, isResolvedMedia as isWorkshopHeroMedia }
