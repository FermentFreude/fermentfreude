import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import { cn } from '@/utilities/cn'
import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import type { Metadata } from 'next'
import Link from 'next/link'

import { MotionStyles } from './creative'
import { SMALL_CAPS } from './gallery'
import { categoryPath, loadRecipeLibrary, RecipesClosing } from './load'
import { RecipeGrid } from './RecipeGrid'
import { H1, LEAD, WRAP } from './ui'

/* ═══════════════════════════════════════════════════════════════
 *  Category page: /rezepte/fermentieren · /einlegen · /tempeh · /kombucha
 *  Title + short intro · quiet links to the other categories ·
 *  its recipes · workshop block. Rendered by /rezepte/[slug] when the
 *  slug is a category (recipes may not use these slugs).
 * ═══════════════════════════════════════════════════════════════ */

type CategoryDef = (typeof RECIPE_CATEGORIES)[number]

export async function categoryMetadata(category: CategoryDef, locale: AppLocale): Promise<Metadata> {
  const { labels, categoryCards } = await loadRecipeLibrary(locale)
  const card = categoryCards.find((c) => c.value === category.value)
  return {
    title: `${card?.name ?? category.label[locale]} — ${labels.overviewTitle} | Fermentfreude`,
    description: card?.intro,
    alternates: { canonical: categoryPath(category.value) },
  }
}

export async function CategoryView({ category, locale }: { category: CategoryDef; locale: AppLocale }) {
  const { labels, recipes, categoryCards } = await loadRecipeLibrary(locale)
  const card = categoryCards.find((c) => c.value === category.value)
  const list = recipes.filter((r) => r.category === category.value)
  const name = card?.name ?? category.label[locale]

  return (
    <main className="min-h-screen bg-[#FFFEF9]">
      <MotionStyles />
      <header className={cn(WRAP, 'flex flex-col items-center gap-5 pb-14 pt-14 text-center md:pb-20 md:pt-20')}>
        <nav aria-label="Breadcrumb" className={cn(SMALL_CAPS, 'flex items-center gap-3 text-[#2D2F2C]/50')}>
          <Link href="/rezepte" className="hover:text-[#2D2F2C]">
            {labels.overviewTitle}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[#2D2F2C]">{name}</span>
        </nav>
        <h1 className={H1}>{name}</h1>
        <span aria-hidden className="h-[3px] w-12 bg-[#E6BE68]" />
        {card?.intro && <p className={cn(LEAD, 'mx-auto')}>{card.intro}</p>}
      </header>

      {/* other categories as quiet links */}
      <nav
        aria-label={labels.filterLabel}
        className={cn(WRAP, 'mb-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-[#2D2F2C]/10 py-5 md:mb-16')}
      >
        <Link href="/rezepte#alle" className={cn(SMALL_CAPS, 'text-[0.78rem] text-[#2D2F2C]/50 hover:text-[#2D2F2C]')}>
          {labels.all}
        </Link>
        {RECIPE_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={categoryPath(c.value)}
            aria-current={c.value === category.value ? 'page' : undefined}
            className={cn(
              SMALL_CAPS,
              'relative py-1 text-[0.78rem]',
              c.value === category.value
                ? 'text-[#2D2F2C] after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:bg-[#E6BE68]'
                : 'text-[#2D2F2C]/50 hover:text-[#2D2F2C]',
            )}
          >
            {categoryCards.find((x) => x.value === c.value)?.name}
          </Link>
        ))}
      </nav>

      <section className={cn(WRAP, 'pb-20')}>
        <RecipeGrid
          categoryNames={Object.fromEntries(categoryCards.map((c) => [c.value, c.name]))}
          recipes={list} locale={locale} labels={labels} emptyText={labels.empty} showTabs={false} />
      </section>
      <RecipesClosing locale={locale} category={category} />
    </main>
  )
}
