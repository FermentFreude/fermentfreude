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
    // Revalidation can fail in non-Next.js contexts (e.g., seed scripts)
    // This is safe - data will be fresh on next deploy
    const err = error as Error
    if (err?.message?.includes('static generation store missing')) {
      payload.logger.warn(`Skipping revalidation in non-Next.js context: ${global.slug}`)
    } else {
      payload.logger.error(`Failed to revalidate ${global.slug}: ${err?.message}`)
    }
  }
  return doc
}
