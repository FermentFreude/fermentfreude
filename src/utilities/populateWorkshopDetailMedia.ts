import type { Media } from '@/payload-types'

import { getMediaByIds } from '@/utilities/getMediaByIds'
import { filterValidObjectIds, isValidObjectId } from '@/utilities/isValidObjectId'

function getMediaId(value: unknown): string | null {
  if (isValidObjectId(value)) return value
  if (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    isValidObjectId((value as { id: unknown }).id)
  ) {
    return (value as { id: string }).id
  }
  return null
}

function isImageFieldKey(key: string): boolean {
  return (
    (UPLOAD_FIELDS as readonly string[]).includes(key) || key.toLowerCase().includes('image')
  )
}

const UPLOAD_FIELDS = ['heroImage', 'bookingImage', 'voucherBackgroundImage'] as const

function collectMediaIds(value: unknown, ids: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, ids)
    return
  }

  if (!value || typeof value !== 'object') return

  const record = value as Record<string, unknown>
  for (const [key, fieldValue] of Object.entries(record)) {
    if (isImageFieldKey(key)) {
      const mediaId = getMediaId(fieldValue)
      if (mediaId) ids.add(mediaId)
    }

    if (key === 'pageSections' || key === 'experienceCards' || Array.isArray(fieldValue)) {
      collectMediaIds(fieldValue, ids)
    }
  }
}

function injectMedia(value: unknown, mediaById: Map<string, Media>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => injectMedia(item, mediaById))
  }

  if (!value || typeof value !== 'object') return value

  const record = { ...(value as Record<string, unknown>) }
  for (const [key, fieldValue] of Object.entries(record)) {
    if (isImageFieldKey(key)) {
      const mediaId = getMediaId(fieldValue)
      if (mediaId) {
        const media = mediaById.get(mediaId)
        if (media) {
          record[key] = media
        } else if (
          typeof fieldValue === 'string' ||
          (typeof fieldValue === 'object' &&
            fieldValue !== null &&
            'id' in fieldValue &&
            !('url' in fieldValue))
        ) {
          // Stale / missing media ID (e.g. production ID not in staging) — drop so
          // components fall back to placeholders instead of rendering nothing.
          record[key] = null
        }
      }
    } else if (key === 'pageSections' || key === 'experienceCards' || Array.isArray(fieldValue)) {
      record[key] = injectMedia(fieldValue, mediaById)
    }
  }

  return record
}

/** Load media for workshop detail upload fields without deep population (avoids bad post IDs). */
export async function populateWorkshopDetailMedia(
  detailRaw: Record<string, unknown> | undefined,
): Promise<Record<string, unknown> | undefined> {
  if (!detailRaw) return detailRaw

  const idSet = new Set<string>()
  collectMediaIds(detailRaw, idSet)
  const ids = filterValidObjectIds([...idSet])
  if (ids.length === 0) return detailRaw

  try {
    const mediaById = await getMediaByIds(ids)
    return injectMedia(detailRaw, mediaById) as Record<string, unknown>
  } catch (error) {
    console.error('[populateWorkshopDetailMedia] failed:', error)
    return detailRaw
  }
}
