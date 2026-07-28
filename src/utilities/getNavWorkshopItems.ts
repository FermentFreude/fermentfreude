import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type TypedLocale } from 'payload'

import type { NavWorkshopItem } from '@/utilities/mergeWorkshopNavDropdown'
import { resolveWorkshopPageSlugForDbSlug } from '@/utilities/workshopPageUtils'

async function fetchNavWorkshopItems(locale: TypedLocale): Promise<NavWorkshopItem[]> {
  const payload = await getPayload({ config: configPromise })

  const workshopsResult = await payload.find({
    collection: 'workshops',
    where: { isActive: { equals: true } },
    sort: 'title',
    limit: 50,
    locale,
    depth: 0,
  })

  const pagesResult = await payload.find({
    collection: 'pages',
    limit: 200,
    locale,
    depth: 0,
    select: {
      slug: true,
      pageKind: true,
      workshopDetail: true,
    },
  })

  const pageLinks = pagesResult.docs.map((page) => ({
    slug: page.slug ?? '',
    pageKind: page.pageKind,
    workshopDetail: page.workshopDetail as { workshopDbSlug?: string | null } | undefined,
  }))

  return workshopsResult.docs.map((workshop) => {
    const dbSlug = workshop.slug
    const pageSlug = resolveWorkshopPageSlugForDbSlug(pageLinks, dbSlug) ?? dbSlug
    const title = typeof workshop.title === 'string' ? workshop.title : dbSlug
    return {
      label: title,
      href: `/workshops/${pageSlug}`,
    }
  })
}

/** Active workshops for the Header → Workshops dropdown (auto-synced from DB). */
export async function getNavWorkshopItems(locale: 'de' | 'en'): Promise<NavWorkshopItem[]> {
  try {
    const getCached = unstable_cache(
      () => fetchNavWorkshopItems(locale),
      ['nav-workshop-items', locale],
      { revalidate: 120, tags: ['workshops', 'pages'] },
    )
    return await getCached()
  } catch (error) {
    console.error('[getNavWorkshopItems] Failed:', error)
    return []
  }
}
