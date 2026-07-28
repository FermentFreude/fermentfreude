import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '@/payload-types'
import { rewriteMediaUrlsForR2 } from '@/utilities/mediaR2Url'

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
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((doc): doc is Post => Boolean(doc))
      .map((doc) => {
        const next = { ...doc }
        if (
          next.heroImage &&
          typeof next.heroImage === 'object' &&
          'filename' in next.heroImage
        ) {
          next.heroImage = rewriteMediaUrlsForR2(
            next.heroImage as unknown as Record<string, unknown>,
          ) as unknown as Post['heroImage']
        }
        return next
      })
  } catch (err) {
    console.error('[getPostsBySlugs] failed', err)
    return []
  }
}
