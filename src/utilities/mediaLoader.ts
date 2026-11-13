import type { ImageLoader } from 'next/image'

/**
 * Own image "loader": instead of asking Vercel to resize images (metered), pick the best copy that
 * Payload already made on upload to R2 (thumbnail 400 / card 800 / hero 1920 / original).
 * Shared by <Media> and by blocks that render with next/image directly.
 */

export type MediaCandidate = { url: string; width: number }

/** Make a Payload url absolute-or-rooted the same way for the original and every pre-made size. */
export function toSrc(url: string): string {
  if (url.startsWith('http') || url.startsWith('/')) return url
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  return base ? `${base}/${url.replace(/^\//, '')}` : `/${url}`
}

type MediaLike = {
  url?: string | null
  width?: number | null
  sizes?: Record<string, { url?: string | null; width?: number | null } | undefined> | null
}

/** Original + every pre-made copy of a Media document (some old images may lack some of them). */
export function mediaCandidates(resource: MediaLike): MediaCandidate[] {
  const candidates: MediaCandidate[] = []
  for (const size of Object.values(resource.sizes ?? {})) {
    if (size?.url && typeof size.width === 'number' && size.width > 0) {
      candidates.push({ url: toSrc(size.url), width: size.width })
    }
  }
  if (resource.url && typeof resource.width === 'number' && resource.width > 0) {
    candidates.push({ url: toSrc(resource.url), width: resource.width })
  }
  return candidates
}

/**
 * For a requested width, returns the smallest copy that is at least that wide, so phones get the
 * small file, tablets the medium one, desktops the large one.
 */
export function makeLoader(candidates: MediaCandidate[], minShare = 0.55): ImageLoader {
  const sorted = [...candidates].sort((a, b) => a.width - b.width)
  // Retina screens ask for 2-3x the CSS width; a copy ~45% narrower still looks sharp there,
  // so phones get the mobile copy instead of the next size up (minShare 0.55).
  // Full-width backgrounds pass 1 and never get a copy narrower than the screen asks for.
  return ({ width }) =>
    (sorted.find((c) => c.width >= width * minShare) ?? sorted[sorted.length - 1]).url
}
