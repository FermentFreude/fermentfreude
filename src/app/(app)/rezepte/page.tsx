import { getRecipeCategory } from '@/collections/Recipes/categories'
import type { Recipe } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { getLocale } from '@/utilities/getLocale'
import { normalizeAppLocale } from '@/utilities/payloadLocaleQuery'
import type { Metadata } from 'next'
import Link from 'next/link'
import { permanentRedirect } from 'next/navigation'

import { Media as MediaComponent } from '@/components/Media'

import { MotionStyles } from './creative'
import { pick } from './data'
import { SMALL_CAPS } from './gallery'
import { RecipeGrid } from './RecipeGrid'
import { categoryPath, loadRecipeLibrary, RecipesClosing } from './load'
import { isResolvedMedia } from './shared'
import { ArrowIcon, H2, Mark, Photo, WRAP } from './ui'

export const dynamic = 'force-dynamic'

/* ═══════════════════════════════════════════════════════════════
 *  /rezepte — recipe library in gallery style (David's brief,
 *  reference: Cooking Catrin). Photography first.
 *
 *  Landing:      recipe of the week as the header (David, ref. Cooking
 *                Catrin) · heading + search + "Beliebt" · all recipes
 *                (filter tabs) · 4 category cards · workshop block
 *  Categories:   /rezepte/<kategorie> (category-view.tsx); old
 *                ?kategorie=x links redirect there permanently
 *  ?q=…:         search results in the same gallery
 *  Texts/photos: /admin → Inhalt → Rezepte-Seite (defaults in labels.ts)
 * ═══════════════════════════════════════════════════════════════ */

type SearchParams = Promise<{ kategorie?: string; q?: string }>

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeAppLocale(await getLocale())
  const { page, labels, d } = await loadRecipeLibrary(locale)
  return {
    title: `${labels.overviewTitle} | Fermentfreude`,
    description: pick(page.hero?.lead, d.hero.lead),
    alternates: { canonical: '/rezepte' },
  }
}

/** Simple, forgiving search over title, summary, keywords and ingredients. */
const norm = (t: string) => t.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
function matches(r: Recipe, query: string) {
  const hay = norm(
    [r.title, r.summary, r.keywords, ...(r.ingredientGroups ?? []).flatMap((g) => (g.items ?? []).map((i) => i.name))]
      .filter(Boolean)
      .join(' '),
  )
  return norm(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w))
}

export default async function RecipesPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = normalizeAppLocale(await getLocale())
  const { kategorie, q } = await searchParams
  // old category links (/rezepte?kategorie=kombucha) → clean address (/rezepte/kombucha)
  const legacy = getRecipeCategory(kategorie)
  if (legacy) permanentRedirect(categoryPath(legacy.value))

  const query = (q ?? '').trim().slice(0, 60)
  const { page, labels, d, recipes, categoryCards } = await loadRecipeLibrary(locale)

  /* ─────────────────────── Landing ─────────────────────── */
  const h = page.hero
  const shown = query ? recipes.filter((r) => matches(r, query)) : recipes
  const popular = recipes.slice(0, 4)
  // Hero photo: "Rezept der Woche" from the CMS, else the first featured recipe with a photo
  const heroId = typeof h?.heroRecipe === 'object' && h?.heroRecipe ? h.heroRecipe.id : h?.heroRecipe
  const heroRecipe =
    recipes.find((r) => r.id === heroId && isResolvedMedia(r.heroImage)) ?? recipes.find((r) => isResolvedMedia(r.heroImage))

  const title = pick(h?.title, d.hero.title)
  const highlight = pick(h?.highlight, d.hero.highlight)

  return (
    <main className="min-h-screen bg-[#FFFEF9]">
      <MotionStyles />

      {/* ─── Header = one recipe (David, ref. Cooking Catrin): full-width photo with a light, slightly
             blurred see-through veil holding the text. Desktop: veil on the right · phones and tablets:
             veil band across the middle of the photo. Hidden on search results. ─── */}
      {heroRecipe && !query && (
        <section>
          <Link
            href={`/rezepte/${heroRecipe.slug}`}
            className="group relative isolate flex min-h-[27rem] overflow-hidden bg-[#2D2F2C] sm:min-h-[28rem] md:min-h-[30rem] lg:min-h-[34rem]"
          >
            {isResolvedMedia(heroRecipe.heroImage) && (
              <div className="absolute inset-0 -z-10">
                <MediaComponent resource={heroRecipe.heroImage} fill priority imgClassName="object-cover object-[50%_40%] md:object-[50%_65%] ff-kenburns" />
              </div>
            )}

            <div className="my-auto flex w-full flex-col items-center justify-center gap-2 bg-[#1D1D1D]/40 px-6 pb-6 pt-5 text-center backdrop-blur-[4px] [text-shadow:0_1px_14px_rgb(0_0_0/45%)] md:my-0 md:ml-auto md:w-[46%] md:gap-4 md:bg-[#1D1D1D]/30 md:px-12 md:py-10 md:backdrop-blur-[2px] lg:w-[44%] lg:px-16">
              <h2 className="font-display text-[clamp(1.55rem,3.6vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#FFFEF9] text-balance">
                {heroRecipe.title}
              </h2>
              <p className={cn(SMALL_CAPS, 'text-[0.66rem] text-[#FAF2E0]/90 md:text-[0.72rem]')}>{labels.recipeOfWeek}</p>
              {heroRecipe.summary && (
                <p className="line-clamp-2 max-w-[30rem] text-[0.92rem] leading-snug text-[#FFFEF9]/95 md:line-clamp-3 md:text-[1.05rem] md:leading-relaxed">
                  {heroRecipe.summary}
                </p>
              )}
              <span className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-[#FFFEF9] px-6 py-2.5 font-display text-[0.9rem] font-bold text-[#1D1D1D] transition-colors [text-shadow:none] group-hover:bg-[#E6BE68] md:mt-3 md:px-8 md:py-3 md:text-[0.95rem]">
                {labels.heroButton}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ─── Directly below: heading, search, "Beliebt", then all recipes ─── */}
      <section id="alle" className={cn(WRAP, 'scroll-mt-20 pb-16 pt-7 md:pb-24 md:pt-16')}>
        <header className="mb-5 flex flex-col items-center gap-2.5 text-center md:mb-12 md:gap-4">
          <p className={cn(SMALL_CAPS, 'text-[#2D2F2C]/55')}>{pick(h?.eyebrow, d.hero.eyebrow)}</p>
          <h1 className="font-display text-[clamp(1.75rem,4.8vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[#1D1D1D] text-balance">
            {title} <Mark>{highlight}</Mark>
          </h1>
          <form action="/rezepte#alle" method="get" role="search" className="mt-1.5 w-full max-w-[32rem] md:mt-3">
            <label htmlFor="rezepte-suche" className="sr-only">
              {labels.searchLabel}
            </label>
            <div className="flex items-center gap-2 rounded-full bg-[#FFFEF9] p-1.5 pl-5 shadow-[0_10px_30px_-18px_rgb(29_29_29/45%)] ring-1 ring-[#1D1D1D]/12 transition-shadow focus-within:ring-2 focus-within:ring-[#1D1D1D]">
              <svg className="size-5 shrink-0 text-[#1D1D1D]/45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="rezepte-suche"
                name="q"
                type="search"
                defaultValue={query}
                placeholder={labels.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-2 font-display text-[1rem] text-[#1D1D1D] outline-none placeholder:text-[#1D1D1D]/40"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#1D1D1D] px-5 py-2.5 font-display text-[0.9rem] font-bold text-[#FFFEF9] transition-colors hover:bg-black"
              >
                {labels.searchButton}
              </button>
            </div>
          </form>
          {query ? (
            <p className="font-display text-[0.95rem] text-[#2D2F2C]/70">
              {labels.resultsFor} „{query}“ ·{' '}
              <Link href="/rezepte#alle" className="font-bold text-[#2D2F2C] underline decoration-[#E6BE68] decoration-2 underline-offset-4">
                {labels.clearSearch}
              </Link>
            </p>
          ) : (
            popular.length > 0 && (
              <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-display text-[0.88rem]">
                <span className={cn(SMALL_CAPS, 'text-[0.66rem] text-[#1D1D1D]/45')}>{labels.popular}</span>
                {popular.slice(0, 3).map((r, i) => (
                  <Link key={r.id} href={`/rezepte/${r.slug}`} className={cn(i > 1 && 'hidden sm:inline', 'text-[#1D1D1D]/70 underline decoration-[#1D1D1D]/20 underline-offset-4 hover:text-[#1D1D1D] hover:decoration-[#E6BE68]')}>
                    {r.title}
                  </Link>
                ))}
              </p>
            )
          )}
        </header>
        <RecipeGrid
          key={query}
          categoryNames={Object.fromEntries(categoryCards.map((c) => [c.value, c.name]))}
          recipes={shown}
          locale={locale}
          labels={labels}
          emptyText={query ? labels.noResults : labels.empty}
          showTabs={!query}
        />
      </section>

      {/* ─── Four categories (photo + centred name), after the recipes ─── */}
      {!query && (
        <section id="kategorien" className={cn(WRAP, 'scroll-mt-24 pb-16 md:pb-20')}>
          <h2 className={cn(H2, 'mb-6 md:mb-8')}>{pick(page.categories?.title, d.categories.title)}</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {categoryCards.map((c) => (
              <Link
                key={c.value}
                href={categoryPath(c.value)}
                className="group flex flex-col overflow-hidden rounded-[1.25rem] bg-[#FAF2E0] transition-transform duration-300 hover:-translate-y-1 md:rounded-[1.5rem]"
              >
                <Photo image={c.image} ratio="aspect-[4/3]" tint="#ECE5DE" />
                <div className="flex flex-1 items-center justify-center px-4 py-3.5 text-center md:px-5 md:py-4">
                  <h3 className="font-display text-[clamp(0.95rem,1.4vw,1.2rem)] font-bold leading-tight tracking-[-0.015em] text-[#2D2F2C] decoration-[#E6BE68] decoration-2 underline-offset-4 group-hover:underline">
                    {c.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <RecipesClosing locale={locale} />
    </main>
  )
}
