import type { Post } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PostCard } from '@/components/fermentation/FermentedVegHowTos'
import { getLatestPosts } from '@/utilities/getLatestPosts'
import { filterValidObjectIds } from '@/utilities/isValidObjectId'

export function extractHowToArticleIds(detail?: {
  howToArticles?: unknown
  pageSections?: unknown
}): string[] {
  const ids: unknown[] = []

  if (Array.isArray(detail?.howToArticles)) {
    for (const item of detail.howToArticles) {
      if (typeof item === 'string') ids.push(item)
      else if (typeof item === 'object' && item !== null && 'id' in item) {
        ids.push((item as { id: unknown }).id)
      }
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
        if (typeof item === 'string') ids.push(item)
        else if (typeof item === 'object' && item !== null && 'id' in item) {
          ids.push((item as { id: unknown }).id)
        }
      }
    }
  }

  return filterValidObjectIds(ids)
}

/** Plain post cards safe to pass into client components. */
export function toPostCards(posts: Post[]): PostCard[] {
  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    readTime: post.readTime,
    heroImage:
      typeof post.heroImage === 'object' && post.heroImage !== null && 'url' in post.heroImage
        ? post.heroImage
        : null,
  }))
}

/**
 * Resolve how-to articles for a workshop page.
 * Skips invalid relationship IDs that would crash MongoDB population.
 */
export async function resolveHowToArticles(
  locale: 'de' | 'en',
  detail?: { howToArticles?: unknown; pageSections?: unknown },
): Promise<PostCard[]> {
  const validIds = extractHowToArticleIds(detail)

  if (validIds.length === 0) {
    return toPostCards(await getLatestPosts(locale, 6))
  }

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
    const ordered = validIds.map((id) => byId.get(id)).filter((doc): doc is Post => Boolean(doc))

    if (ordered.length === 0) {
      return toPostCards(await getLatestPosts(locale, 6))
    }

    return toPostCards(ordered)
  } catch (error) {
    console.error('[resolveHowToArticles] failed, using latest posts:', error)
    return toPostCards(await getLatestPosts(locale, 6))
  }
}
