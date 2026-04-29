import path from 'path'

/** Same checks as `r2Enabled` in `src/plugins/index.ts`. */
export function isR2MediaStorageConfigured(): boolean {
  return (
    !!process.env.R2_BUCKET &&
    !!process.env.R2_ENDPOINT &&
    !!process.env.R2_PUBLIC_URL &&
    !process.env.R2_ENDPOINT.includes('<account-id>')
  )
}

/** Public CDN URL for an object under the `media/` prefix (or doc.prefix). */
export function publicR2MediaFileURL(filename: string, prefix?: string | null): string {
  const r2Base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  const pref = prefix && prefix.length > 0 ? prefix : 'media'
  const joined = path.posix.join(pref, filename)
  const encodedPath = joined.split('/').map((segment) => encodeURIComponent(segment)).join('/')
  return `${r2Base}/${encodedPath}`
}

type MediaLike = {
  filename?: string | null
  prefix?: string | null
  url?: string | null
  sizes?: Record<string, { url?: string | null; filename?: string | null } | null> | null
}

/**
 * Forces `url` and `sizes.*.url` to point at R2 so admin previews work with
 * `clientUploads` (where `/api/media/file/*` is not usable for browser GET).
 */
export function rewriteMediaUrlsForR2<T extends Record<string, unknown>>(doc: T): T {
  if (!isR2MediaStorageConfigured()) return doc

  const d = doc as MediaLike
  if (!d.filename || typeof d.filename !== 'string') return doc

  const prefix = typeof d.prefix === 'string' ? d.prefix : 'media'
  const next: MediaLike = { ...(d as MediaLike), url: publicR2MediaFileURL(d.filename, prefix) }

  if (d.sizes && typeof d.sizes === 'object') {
    const sizes = { ...d.sizes }
    for (const key of Object.keys(sizes)) {
      const size = sizes[key]
      if (size && typeof size === 'object' && size.filename) {
        sizes[key] = {
          ...size,
          url: publicR2MediaFileURL(size.filename, prefix),
        }
      }
    }
    next.sizes = sizes
  }

  return next as T
}
