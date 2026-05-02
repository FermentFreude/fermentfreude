import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'

/**
 * Returns the latest published Posts (How-To Articles), newest first.
 *
 * Used as the source of truth for the "Tipps & Guides" section on
 * every workshop detail page so editors can manage articles in
 * /admin/collections/posts and have them appear everywhere
 * automatically — without having to link each post on each
 * workshop page individually.
 *
 * Per-page `workshopDetail.howToArticles` still wins when set,
 * so editors can curate a different list for a specific workshop.
 */
export async function getLatestPosts(
  locale: 'de' | 'en',
  limit = 6,
  workshopType?: 'lakto' | 'tempeh' | 'kombucha',
): Promise<Post[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      limit,
      depth: 2,
      locale,
      sort: '-updatedAt',
      ...(workshopType
        ? { where: { workshopType: { equals: workshopType } } }
        : {}),
    })
    return result.docs as Post[]
  } catch (err) {
    console.error('[getLatestPosts] failed', err)
    return []
  }
}
