import type { Media } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { filterValidObjectIds, objectIdToString } from '@/utilities/isValidObjectId'
import { rewriteMediaUrlsForR2 } from '@/utilities/mediaR2Url'

/** Batch-fetch media docs by ID (invalid IDs are skipped). */
export async function getMediaByIds(ids: string[]): Promise<Map<string, Media>> {
  const validIds = filterValidObjectIds(ids)
  if (validIds.length === 0) return new Map()

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'media',
      where: { id: { in: validIds } },
      limit: validIds.length,
      depth: 0,
    })
    return new Map(
      result.docs.map((doc) => [
        doc.id,
        rewriteMediaUrlsForR2(doc as unknown as Record<string, unknown>) as unknown as Media,
      ]),
    )
  } catch (error) {
    console.error('[getMediaByIds] failed:', error)
    return new Map()
  }
}

function resolveMediaRef(
  value: unknown,
  mediaById: Map<string, Media>,
): Media | string | null | undefined {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'url' in value) {
    return value as Media
  }
  if (typeof value === 'string' && mediaById.has(value)) {
    return mediaById.get(value)
  }
  return typeof value === 'string' ? value : null
}

/** Resolve upload field IDs on workshop slider / hero items to media objects. */
export async function resolveWorkshopItemImages<
  T extends {
    image?: unknown
    image2?: unknown
    image3?: unknown
    image4?: unknown
    image5?: unknown
    image6?: unknown
    image7?: unknown
    image8?: unknown
    image9?: unknown
    leftImage?: unknown
    rightImage?: unknown
  },
>(items: T[]): Promise<T[]> {
  const idSet = new Set<string>()
  for (const item of items) {
    for (const key of [
      'image',
      'image2',
      'image3',
      'image4',
      'image5',
      'image6',
      'image7',
      'image8',
      'image9',
      'leftImage',
      'rightImage',
    ] as const) {
      const val = item[key]
      if (typeof val === 'string') idSet.add(val)
    }
  }

  const mediaById = await getMediaByIds([...idSet])

  return items.map((item) => ({
    ...item,
    ...(item.image !== undefined && {
      image: resolveMediaRef(item.image, mediaById),
    }),
    ...(item.image2 !== undefined && {
      image2: resolveMediaRef(item.image2, mediaById),
    }),
    ...(item.image3 !== undefined && {
      image3: resolveMediaRef(item.image3, mediaById),
    }),
    ...(item.image4 !== undefined && {
      image4: resolveMediaRef(item.image4, mediaById),
    }),
    ...(item.image5 !== undefined && {
      image5: resolveMediaRef(item.image5, mediaById),
    }),
    ...(item.image6 !== undefined && {
      image6: resolveMediaRef(item.image6, mediaById),
    }),
    ...(item.image7 !== undefined && {
      image7: resolveMediaRef(item.image7, mediaById),
    }),
    ...(item.image8 !== undefined && {
      image8: resolveMediaRef(item.image8, mediaById),
    }),
    ...(item.image9 !== undefined && {
      image9: resolveMediaRef(item.image9, mediaById),
    }),
    ...(item.leftImage !== undefined && {
      leftImage: resolveMediaRef(item.leftImage, mediaById),
    }),
    ...(item.rightImage !== undefined && {
      rightImage: resolveMediaRef(item.rightImage, mediaById),
    }),
  }))
}
