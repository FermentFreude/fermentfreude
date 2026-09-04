import configPromise from '@payload-config'
import { strictLocaleQuery, type AppLocale } from '@/utilities/payloadLocaleQuery'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

type SupportedLocale = AppLocale

async function getGlobal(slug: string, depth = 0, locale?: SupportedLocale) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    // Payload expects a known global slug; we trust callers to pass a valid one.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slug: slug as any,
    depth,
    ...(locale ? strictLocaleQuery(locale) : {}),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return global as any
}

/**
 * Returns an unstable_cache function mapped with the cache tag for the slug.
 * In development, cache is disabled so changes appear immediately.
 *
 * `revalidate: 300` is a safety net, not the primary invalidation path. The
 * primary path is tag-based (`global_${slug}`, busted instantly by
 * revalidateGlobal.ts whenever the global is saved through a live Next.js
 * request — i.e. every real /admin edit). That tag-based call silently
 * no-ops when a global is updated from outside a Next.js request context
 * (a seed script, for example) — Next's `revalidateTag` requires a live
 * request store that doesn't exist there. Confirmed in production: a
 * global edited via a seed script stayed stale across multiple later
 * deployments, since Vercel's Data Cache is NOT automatically cleared by a
 * fresh deployment. Without a bounded revalidate time, that staleness has
 * no expiry — a bounded one guarantees it self-heals within 5 minutes
 * instead of indefinitely, without slowing down the common /admin-edit
 * case (which still updates instantly via the tag).
 */
export const getCachedGlobal = <T = unknown>(slug: string, depth = 0, locale?: SupportedLocale) => {
  if (process.env.NODE_ENV === 'development') {
    return () => getGlobal(slug, depth, locale) as Promise<T>
  }

  return unstable_cache(
    async () => getGlobal(slug, depth, locale) as Promise<T>,
    [slug, locale || 'default'],
    {
      tags: [`global_${slug}`],
      revalidate: 300,
    },
  )
}
