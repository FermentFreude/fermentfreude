import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

type SupportedLocale = 'de' | 'en'

async function getGlobal(slug: string, depth = 0, locale?: SupportedLocale) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    // Payload expects a known global slug; we trust callers to pass a valid one.
    slug: slug as any,
    depth,
    ...(locale ? { locale } : {}),
  })

  return global as any
}

/**
 * Returns an unstable_cache function mapped with the cache tag for the slug.
 * In development, cache is disabled so changes appear immediately.
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
    },
  )
}
