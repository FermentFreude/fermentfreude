import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'

/**
 * Fetch published Posts by slug, preserving the order of `slugs`.
 * Missing slugs are skipped silently.
 */
export async function getPostsBySlugs(
  locale: 'de' | 'en',
  slugs: string[],
): Promise<Post[]> {
  if (slugs.length === 0) return []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      where: { slug: { in: slugs } },
      limit: slugs.length,
      depth: 2,
      locale,
    })

    const bySlug = new Map(result.docs.map((doc) => [doc.slug, doc as Post]))
    return slugs.map((slug) => bySlug.get(slug)).filter((doc): doc is Post => Boolean(doc))
  } catch (err) {
    console.error('[getPostsBySlugs] failed', err)
    return []
  }
}
