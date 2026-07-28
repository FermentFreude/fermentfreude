import type { Page } from '@/payload-types'
import type { Payload } from 'payload'

import { isLegacyWorkshopPageSlug, mergeLegacyWorkshopDetail } from '@/utilities/workshopPageUtils'
import { isValidObjectId } from '@/utilities/isValidObjectId'

/**
 * Strip invalid post relationship IDs from workshopDetail.howToArticles.
 * Bad IDs (e.g. Lexical/block ids) make Mongoose throw CastError when
 * Payload hydrates or populates the posts relationship.
 */
export function sanitizeWorkshopDetailHowToArticles(
  detail: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null | undefined {
  if (!detail || typeof detail !== 'object') return detail

  const next = { ...detail }

  if (Array.isArray(next.howToArticles)) {
    next.howToArticles = next.howToArticles.filter((id) => isValidObjectId(id))
  }

  if (Array.isArray(next.pageSections)) {
    next.pageSections = next.pageSections.map((section) => {
      if (!section || typeof section !== 'object') return section
      const block = { ...(section as Record<string, unknown>) }
      if (block.blockType === 'howTo' && Array.isArray(block.howToArticles)) {
        block.howToArticles = block.howToArticles.filter((id) => isValidObjectId(id))
      }
      return block
    })
  }

  return next
}

function hasInvalidHowToIds(detail: Record<string, unknown> | null | undefined): boolean {
  if (!detail) return false
  const check = (ids: unknown) =>
    Array.isArray(ids) && ids.some((id) => typeof id === 'string' && !isValidObjectId(id))

  if (check(detail.howToArticles)) return true
  if (Array.isArray(detail.pageSections)) {
    for (const section of detail.pageSections) {
      if (
        section &&
        typeof section === 'object' &&
        (section as { blockType?: string }).blockType === 'howTo' &&
        check((section as { howToArticles?: unknown }).howToArticles)
      ) {
        return true
      }
    }
  }
  return false
}

/**
 * Load a workshop page without crashing on invalid howToArticles ObjectIds.
 * 1) Read via DB adapter (no relationship casting)
 * 2) Clean bad IDs and persist
 * 3) Re-load via Local API so locale flattening works normally
 */
export async function findWorkshopPageSafe(
  payload: Payload,
  opts: {
    slug: string
    locale: 'de' | 'en'
    draft?: boolean
    /** depth: 10 populates hero/booking/experience/howTo media like production (main branch). */
    depth?: number
  },
): Promise<Page | null> {
  const { slug, locale, draft = false, depth = 0 } = opts
  let rawWorkshopDetail: Record<string, unknown> | undefined

  try {
    const raw = (await payload.db.findOne({
      collection: 'pages',
      where: {
        and: [
          { slug: { equals: slug } },
          ...(draft ? [] : [{ _status: { equals: 'published' } }]),
        ],
      },
      locale,
    })) as Record<string, unknown> | null

    if (!raw?.id) return null

    rawWorkshopDetail = raw.workshopDetail as Record<string, unknown> | undefined
    const detail = rawWorkshopDetail
    if (hasInvalidHowToIds(detail)) {
      const cleaned = sanitizeWorkshopDetailHowToArticles(detail)
      rawWorkshopDetail = cleaned ?? rawWorkshopDetail
      try {
        await payload.db.updateOne({
          collection: 'pages',
          id: String(raw.id),
          data: { workshopDetail: cleaned },
          locale,
        })
        payload.logger.info(
          `[findWorkshopPageSafe] Cleaned invalid howToArticles on page "${slug}"`,
        )
      } catch (err) {
        payload.logger.warn(
          `[findWorkshopPageSafe] Could not persist howToArticles cleanup for "${slug}": ${err}`,
        )
      }
    }
  } catch (error) {
    payload.logger.warn(`[findWorkshopPageSafe] DB read failed for "${slug}": ${error}`)
  }

  // Normal Local API load (locale-aware). Safe after cleanup.
  try {
    const result = await payload.find({
      collection: 'pages',
      draft,
      where: {
        slug: { equals: slug },
        ...(draft ? {} : { _status: { equals: 'published' } }),
      },
      limit: 1,
      depth,
      locale,
      overrideAccess: true,
    })
    const doc = (result.docs[0] as Page | undefined) ?? null
    return applyLegacyWorkshopDetailMerge(doc, slug, rawWorkshopDetail)
  } catch (error) {
    payload.logger.error(`[findWorkshopPageSafe] Local API find failed for "${slug}": ${error}`)
    return null
  }
}

function applyLegacyWorkshopDetailMerge(
  page: Page | null | undefined,
  slug: string,
  rawWorkshopDetail: Record<string, unknown> | undefined,
): Page | null {
  if (!page || !isLegacyWorkshopPageSlug(slug) || !rawWorkshopDetail) return page ?? null

  page.workshopDetail = mergeLegacyWorkshopDetail(
    page.workshopDetail as Record<string, unknown> | undefined,
    rawWorkshopDetail,
    slug,
  ) as Page['workshopDetail']

  return page
}
