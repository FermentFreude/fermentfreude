import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import { cn } from '@/utilities/cn'
import { strictLocaleQuery, type AppLocale } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { WorkshopBlock } from './closing'
import { getRecipesPage, pick } from './data'
import { CATEGORY_INTRO_DEFAULTS, LANDING_DEFAULTS } from './labels'
import { categoryName, resolveLabels } from './shared'
import { WRAP } from './ui'

/* ═══════════════════════════════════════════════════════════════
 *  Shared data for /rezepte (landing) and /rezepte/<kategorie>:
 *  page global, labels, published recipes and the 4 category cards.
 * ═══════════════════════════════════════════════════════════════ */

type CategoryDef = (typeof RECIPE_CATEGORIES)[number]

/** Clean category address, e.g. /rezepte/kombucha */
export const categoryPath = (value: string) => `/rezepte/${value}`

export const loadRecipeLibrary = cache(async (locale: AppLocale) => {
  const page = await getRecipesPage(locale)
  const labels = resolveLabels(page.labels, locale)
  const d = LANDING_DEFAULTS[locale]

  const payload = await getPayload({ config: configPromise })
  const { docs: recipes } = await payload.find({
    collection: 'recipes',
    where: { _status: { equals: 'published' } },
    sort: ['-featured', '-publishedAt'],
    limit: 300,
    depth: 1,
    ...strictLocaleQuery(locale),
  })

  const categoryCards = RECIPE_CATEGORIES.map((c) => {
    const cms = page.categories?.items?.find((i) => i.category === c.value)
    const fallbackImage = recipes.find((r) => r.category === c.value && r.heroImage)?.heroImage
    return {
      ...c,
      name: categoryName(c.value, locale, page),
      intro: pick(cms?.intro, CATEGORY_INTRO_DEFAULTS[c.value]?.[locale]),
      image: cms?.image ?? fallbackImage,
    }
  })

  return { page, labels, d, recipes, categoryCards }
})

/** Page ending, same on overview and category pages: the workshop invitation. */
export async function RecipesClosing({ locale, category }: { locale: AppLocale; category?: CategoryDef }) {
  const { page, labels, d } = await loadRecipeLibrary(locale)
  const f = page.featured
  return (
    <section className={cn(WRAP, 'flex flex-col gap-5 pb-24 pt-4 md:gap-6')}>
      <WorkshopBlock
        locale={locale}
        labels={labels}
        workshop={{
          eyebrow: pick(f?.bandEyebrow, d.featured.bandEyebrow),
          title: pick(f?.bandTitle, d.featured.bandTitle),
          text: pick(f?.bandText, d.featured.bandText),
          button: pick(f?.bandButton, d.featured.bandButton),
          href: category?.workshopHref ?? pick(f?.bandLink, '/workshops'),
          image: f?.bandImage,
        }}
      />
    </section>
  )
}
