import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateGlobal: GlobalAfterChangeHook = ({
  doc,
  global,
  req: { payload, context },
}) => {
  if (context?.skipRevalidate) return doc
  try {
    payload.logger.info(`Revalidating global: ${global.slug}`)
    revalidateTag(`global_${global.slug}`)
  } catch (error: unknown) {
    // Revalidation can fail in non-Next.js contexts (e.g., seed scripts) —
    // revalidateTag() needs a live Next.js request store that doesn't exist
    // there. This is NOT automatically fixed by the next deploy — Vercel's
    // Data Cache persists across deployments, so a global edited this way
    // stays stale until it's either re-saved through a live request (e.g.
    // /admin) or the bounded revalidate time in getGlobals.ts's
    // getCachedGlobal() (5 min) naturally expires it. See that file for
    // the full explanation — confirmed in production, not hypothetical.
    const err = error as Error
    if (err?.message?.includes('static generation store missing')) {
      payload.logger.warn(`Skipping revalidation in non-Next.js context: ${global.slug}`)
    } else {
      payload.logger.error(`Failed to revalidate ${global.slug}: ${err?.message}`)
    }
  }
  return doc
}
