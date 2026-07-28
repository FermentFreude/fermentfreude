import type { Payload } from 'payload'

import { resolveWorkshopPageSlugForDbSlug } from '@/utilities/workshopPageUtils'

import type { Page } from '@/payload-types'

/** Find the CMS page linked to a workshop DB slug (legacy slug mapping included). */
export async function findWorkshopPage(
  payload: Payload,
  dbSlug: string,
): Promise<Page | null> {
  const pagesResult = await payload.find({
    collection: 'pages',
    limit: 200,
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

  const pageSlug = resolveWorkshopPageSlugForDbSlug(pageLinks, dbSlug)
  if (!pageSlug) return null

  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: pageSlug } },
    limit: 1,
    depth: 0,
  })

  return (result.docs[0] as Page | undefined) ?? null
}
