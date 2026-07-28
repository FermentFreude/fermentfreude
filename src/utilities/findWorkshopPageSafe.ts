import type { Page } from '@/payload-types'
import type { Payload } from 'payload'

import { isLegacyWorkshopPageSlug, mergeLegacyWorkshopDetail } from '@/utilities/workshopPageUtils'
import { objectIdToString } from '@/utilities/isValidObjectId'

function isHowToArticleRef(item: unknown): boolean {
  if (objectIdToString(item)) return true
  if (typeof item === 'object' && item !== null) {
    const record = item as { id?: unknown; slug?: unknown; title?: unknown }
    if (objectIdToString(record.id)) return true
    if (('slug' in record || 'title' in record) && objectIdToString(record.id)) return true
  }
  return false
}

function filterHowToArticleRefs(items: unknown[]): unknown[] {
  return items.filter((item) => isHowToArticleRef(item))
}

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
    next.howToArticles = filterHowToArticleRefs(next.howToArticles)
  }

  if (Array.isArray(next.pageSections)) {
    next.pageSections = next.pageSections.map((section) => {
      if (!section || typeof section !== 'object') return section
      const block = { ...(section as Record<string, unknown>) }
      if (block.blockType === 'howTo' && Array.isArray(block.howToArticles)) {
        block.howToArticles = filterHowToArticleRefs(block.howToArticles)
      }
      return block
    })
  }

  return next
}

function hasInvalidHowToIds(detail: Record<string, unknown> | null | undefined): boolean {
  if (!detail) return false
  const check = (ids: unknown) =>
    Array.isArray(ids) && ids.some((item) => !isHowToArticleRef(item))

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

function buildPageFromRaw(raw: Record<string, unknown>): Page {
  return {
    id: String(raw.id ?? raw._id),
    slug: raw.slug as string,
    workshopDetail: raw.workshopDetail,
    pageKind: raw.pageKind,
    _status: raw._status,
  } as Page
}

type MongoConnection = {
  collection: (name: string) => {
    findOne: (filter: Record<string, unknown>) => Promise<Record<string, unknown> | null>
    findOneAndUpdate: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
    ) => Promise<unknown>
  }
}

/**
 * Read the page document directly from MongoDB — bypasses Payload schema stripping.
 * Production legacy workshops still store copy in flat workshopDetail keys removed from
 * the current schema (fields now live in pageSections blocks only).
 */
async function findRawMongoPage(
  payload: Payload,
  slug: string,
  draft: boolean,
): Promise<Record<string, unknown> | null> {
  const connection = (payload.db as { connection?: MongoConnection }).connection
  if (!connection) return null

  const filter: Record<string, unknown> = { slug }
  if (!draft) filter._status = 'published'

  const doc = await connection.collection('pages').findOne(filter)
  if (!doc) return null

  return {
    ...doc,
    id: String(doc._id ?? doc.id),
  }
}

async function findPageViaLocalApi(
  payload: Payload,
  opts: {
    slug: string
    locale: 'de' | 'en'
    draft: boolean
    depth: number
  },
): Promise<Page | null> {
  const { slug, locale, draft, depth } = opts
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
  return (result.docs[0] as Page | undefined) ?? null
}

/**
 * Load a workshop page without crashing on invalid howToArticles ObjectIds.
 * 1) Read raw MongoDB doc (keeps legacy flat workshopDetail fields)
 * 2) Clean bad IDs and persist
 * 3) Re-load via Local API (depth 10, fallback depth 0, fallback raw DB)
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
  let rawPage: Record<string, unknown> | null = null
  let rawWorkshopDetail: Record<string, unknown> | undefined

  try {
    rawPage = await findRawMongoPage(payload, slug, draft)

    if (!rawPage?.id) return null

    const cleaned = sanitizeWorkshopDetailHowToArticles(
      rawPage.workshopDetail as Record<string, unknown> | undefined,
    )
    rawWorkshopDetail = cleaned ?? (rawPage.workshopDetail as Record<string, unknown> | undefined)

    if (hasInvalidHowToIds(rawPage.workshopDetail as Record<string, unknown> | undefined)) {
      try {
        const connection = (payload.db as { connection?: MongoConnection }).connection
        const originalHowTo = (rawPage.workshopDetail as Record<string, unknown>)?.howToArticles
        const cleanedHowTo = cleaned?.howToArticles
        const removedInvalid =
          Array.isArray(originalHowTo) &&
          Array.isArray(cleanedHowTo) &&
          cleanedHowTo.length < originalHowTo.length

        if (connection && removedInvalid && !hasInvalidHowToIds(cleaned ?? undefined)) {
          await connection.collection('pages').findOneAndUpdate(
            { slug },
            { $set: { 'workshopDetail.howToArticles': cleanedHowTo } },
          )
          payload.logger.info(
            `[findWorkshopPageSafe] Cleaned invalid howToArticles on page "${slug}"`,
          )
        }
      } catch (err) {
        payload.logger.warn(
          `[findWorkshopPageSafe] Could not persist howToArticles cleanup for "${slug}": ${err}`,
        )
      }
    }
  } catch (error) {
    payload.logger.warn(`[findWorkshopPageSafe] DB read failed for "${slug}": ${error}`)
  }

  if (!rawPage?.id) return null

  const depthsToTry = depth > 0 ? [depth, 0] : [0]

  for (const tryDepth of depthsToTry) {
    try {
      const doc = await findPageViaLocalApi(payload, { slug, locale, draft, depth: tryDepth })
      if (doc) {
        return applyLegacyWorkshopDetailMerge(doc, slug, rawWorkshopDetail)
      }
    } catch (error) {
      payload.logger.warn(
        `[findWorkshopPageSafe] Local API find (depth=${tryDepth}) failed for "${slug}": ${error}`,
      )
    }
  }

  // Last resort: serve raw MongoDB document (production flat fields) without Population
  payload.logger.warn(
    `[findWorkshopPageSafe] Using raw DB fallback for "${slug}" — Local API could not load page`,
  )
  const fallback = buildPageFromRaw({
    ...rawPage,
    workshopDetail: rawWorkshopDetail,
  })
  return applyLegacyWorkshopDetailMerge(fallback, slug, rawWorkshopDetail)
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
