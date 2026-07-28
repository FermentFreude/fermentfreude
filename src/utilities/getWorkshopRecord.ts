import configPromise from '@payload-config'
import type { Workshop } from '@/payload-types'
import { getPayload } from 'payload'

/**
 * Load workshop metadata from the `workshops` collection by DB slug.
 * Used for dynamic workshop pages (booking price, title, hero image).
 */
export async function getWorkshopRecordBySlug(
  dbSlug: string,
  locale: 'de' | 'en',
): Promise<Workshop | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'workshops',
      where: {
        and: [{ slug: { equals: dbSlug } }, { isActive: { equals: true } }],
      },
      limit: 1,
      locale,
      depth: 1,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}
