import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

type Global = keyof Config['globals']
type SupportedLocale = 'de' | 'en'

async function getGlobal<T extends Global>(slug: T, depth = 0, locale?: SupportedLocale) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    ...(locale ? { locale } : {}),
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug.
 * In development, cache is disabled so changes appear immediately.
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale?: SupportedLocale) => {
  if (process.env.NODE_ENV === 'development') {
    return () => getGlobal<T>(slug, depth, locale)
  }

  return unstable_cache(
    async () => getGlobal<T>(slug, depth, locale),
    [slug, locale || 'default'],
    {
      tags: [`global_${slug}`],
    },
  )
}
