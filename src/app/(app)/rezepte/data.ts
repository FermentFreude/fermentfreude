import type { RecipesPage } from '@/payload-types'
import { strictLocaleQuery, type AppLocale } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/** The "Rezepte-Seite" global (texts + photos). Empty object if unavailable. */
export const getRecipesPage = cache(async (locale: AppLocale): Promise<Partial<RecipesPage>> => {
  try {
    const payload = await getPayload({ config: configPromise })
    return (await payload.findGlobal({
      slug: 'recipes-page',
      depth: 1,
      ...strictLocaleQuery(locale),
    })) as RecipesPage
  } catch (error) {
    console.warn('Failed to fetch recipes-page global:', error)
    return {}
  }
})

/** First non-empty string, so CMS values win over defaults. */
export function pick(...values: Array<string | null | undefined>): string {
  return values.find((v) => typeof v === 'string' && v.trim()) ?? ''
}
