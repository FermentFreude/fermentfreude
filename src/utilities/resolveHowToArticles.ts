import type { Post } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PostCard } from '@/components/fermentation/FermentedVegHowTos'
import { getPostsBySlugs } from '@/utilities/getPostsBySlugs'
import { LEGACY_WORKSHOP_HOWTO_SLUGS } from '@/utilities/legacyWorkshopHowToSlugs'
import { rewriteMediaUrlsForR2 } from '@/utilities/mediaR2Url'
import { filterValidObjectIds, objectIdToString } from '@/utilities/isValidObjectId'

export function extractHowToArticleIds(detail?: {
  howToArticles?: unknown
  pageSections?: unknown
}): string[] {
  const ids: unknown[] = []

  if (Array.isArray(detail?.howToArticles)) {
    for (const item of detail.howToArticles) {
      ids.push(item)
    }
  }

  const sections = detail?.pageSections
  if (Array.isArray(sections)) {
    const howToBlock = sections.find(
      (row) =>
        typeof row === 'object' &&
        row !== null &&
        (row as { blockType?: string }).blockType === 'howTo',
    ) as { howToArticles?: unknown } | undefined

    if (Array.isArray(howToBlock?.howToArticles)) {
      for (const item of howToBlock.howToArticles) {
        ids.push(item)
      }
    }
  }

  return filterValidObjectIds(
    ids.map((item) => objectIdToString(item) ?? (typeof item === 'string' ? item : null)),
  )
}

/** Plain post cards safe to pass into client components. */
export function toPostCards(posts: Post[]): PostCard[] {
  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    readTime: post.readTime,
    heroImage: (() => {
      const img = post.heroImage
      if (typeof img === 'object' && img !== null && 'url' in img) {
        return rewriteMediaUrlsForR2(
          img as unknown as Record<string, unknown>,
        ) as unknown as PostCard['heroImage']
      }
      return null
    })(),
  }))
}

/**
 * Resolve how-to articles for a workshop page.
 * Skips invalid relationship IDs that would crash MongoDB population.
 */
export async function resolveHowToArticles(
  locale: 'de' | 'en',
  detail?: { howToArticles?: unknown; pageSections?: unknown },
  pageSlug?: string,
): Promise<PostCard[]> {
  const validIds = extractHowToArticleIds(detail)
  let posts: Post[] = []

  if (validIds.length > 0) {
    try {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'posts',
        where: { id: { in: validIds } },
        limit: validIds.length,
        depth: 1,
        locale,
      })

      const byId = new Map(result.docs.map((doc) => [doc.id, doc as Post]))
      posts = validIds.map((id) => byId.get(id)).filter((doc): doc is Post => Boolean(doc))
    } catch (error) {
      console.error('[resolveHowToArticles] ID lookup failed:', error)
    }
  }

  const legacySlugs = pageSlug ? LEGACY_WORKSHOP_HOWTO_SLUGS[pageSlug] : undefined
  if (posts.length === 0 && legacySlugs?.length) {
    posts = await getPostsBySlugs(locale, [...legacySlugs])
  }

  if (posts.length === 0) {
    return []
  }

  return toPostCards(posts)
}
