import type { Config, Field, Plugin } from 'payload'

import { isR2MediaStorageConfigured, publicR2MediaFileURL } from '@/utilities/mediaR2Url'

/**
 * Payload’s default upload `url` field appends an `afterRead` hook that calls
 * `generateFilePathOrURL` → `/api/media/file/...`. That runs *after* the
 * storage plugin hook and overrides direct R2 URLs, which breaks admin previews
 * when using `clientUploads` (those `/api/media/file/*` GETs are not served).
 *
 * This plugin runs **last** in the plugin list and replaces `url` field hooks
 * so only R2 public URLs are emitted when R2 is configured.
 */
export const mediaFixR2UrlAfterReadPlugin: Plugin = (config: Config): Config => {
  if (!isR2MediaStorageConfigured()) return config

  return {
    ...config,
    collections: config.collections?.map((collection) => {
      if (collection.slug !== 'media' || !collection.fields) return collection
      return {
        ...collection,
        fields: patchMediaFields(collection.fields),
      }
    }),
  }
}

function patchMediaFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    const f = field as Record<string, unknown>
    if (f.type === 'group' && Array.isArray(f.fields)) {
      if (f.name === 'sizes') {
        return {
          ...field,
          fields: (f.fields as Field[]).map((sub) => {
            const sg = sub as Record<string, unknown>
            if (sg.type !== 'group' || typeof sg.name !== 'string') return sub
            return {
              ...sub,
              fields: patchSizeGroupUrlHooks(sg.fields as Field[], sg.name),
            }
          }),
        } as Field
      }
      return {
        ...field,
        fields: patchMediaFields(f.fields as Field[]),
      } as Field
    }
    if (f.type === 'text' && f.name === 'url') {
      return {
        ...field,
        hooks: {
          ...((typeof f.hooks === 'object' && f.hooks !== null ? f.hooks : {}) as object),
          afterRead: [rootMediaUrlAfterRead],
        },
      } as Field
    }
    return field
  })
}

function patchSizeGroupUrlHooks(fields: Field[], sizeName: string): Field[] {
  return fields.map((inner) => {
    const i = inner as Record<string, unknown>
    if (i.type === 'text' && i.name === 'url') {
      return {
        ...inner,
        hooks: {
          ...((typeof i.hooks === 'object' && i.hooks !== null ? i.hooks : {}) as object),
          afterRead: [sizeMediaUrlAfterRead(sizeName)],
        },
      } as Field
    }
    return inner
  })
}

async function rootMediaUrlAfterRead({
  data,
  value,
}: {
  data: Record<string, unknown>
  value?: string | null
}): Promise<string | null | undefined> {
  const filename = data?.filename
  const prefix = typeof data?.prefix === 'string' && data.prefix ? data.prefix : 'media'
  if (typeof filename !== 'string' || !filename) return value
  return publicR2MediaFileURL(filename, prefix)
}

function sizeMediaUrlAfterRead(sizeName: string) {
  return async ({
    data,
    value,
  }: {
    data: Record<string, unknown>
    value?: string | null
  }): Promise<string | null | undefined> => {
    const sizes = data?.sizes as Record<string, { filename?: string | null }> | undefined
    const filename = sizes?.[sizeName]?.filename
    const prefix = typeof data?.prefix === 'string' && data.prefix ? data.prefix : 'media'
    if (typeof filename !== 'string' || !filename) return value
    return publicR2MediaFileURL(filename, prefix)
  }
}
