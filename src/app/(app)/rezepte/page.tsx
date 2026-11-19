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
import { GalleryHeading, SMALL_CAPS } from './gallery'
import { RecipeGrid } from './RecipeGrid'
import { categoryPath, loadRecipeLibrary, RecipesClosing } from './load'
import { isResolvedMedia } from './shared'
import { ArrowIcon, H2, Photo, WRAP } from './ui'

export const dynamic = 'force-dynamic'

/* ═══════════════════════════════════════════════════════════════
 *  /rezepte — recipe library in gallery style (David's brief,
 *  reference: Cooking Catrin). Photography first.
 *
 *  Landing:      headline + search · 4 categories (tall photos) ·
 *                all recipes as a photo gallery with text filters ·
 *                Workshop + Shop
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

  return (
    <main className="min-h-screen bg-[#FFFEF9]">
      <MotionStyles />

      {/* ─── Hero: one cinematic recipe photo, dark layer, light text ─── */}
      <section className={cn(WRAP, 'pt-4 md:pt-6')}>
        <div className="relative isolate flex min-h-[34rem] overflow-hidden rounded-[2rem] bg-[#1D1D1D] md:min-h-[38rem] lg:min-h-[40rem]">
          {heroRecipe && isResolvedMedia(heroRecipe.heroImage) && (
            <div className="absolute inset-0 -z-10">
              <MediaComponent resource={heroRecipe.heroImage} fill priority imgClassName="object-cover ff-kenburns" />
            </div>
          )}
          {/* dark layer: strong at the bottom-left where the text sits, lighter top-right so the food shows */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(29_29_29/92%)_0%,rgb(29_29_29/55%)_45%,rgb(29_29_29/15%)_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(29_29_29/55%),transparent_70%)]" />

          <div className="mt-auto flex w-full flex-col gap-5 p-6 pb-8 md:p-12 md:pb-14 lg:p-16">
            <p className={cn(SMALL_CAPS, 'text-[#FAF2E0]/70')}>{pick(h?.eyebrow, d.hero.eyebrow)}</p>
            <h1 className="max-w-[44rem] font-display text-[clamp(2.6rem,6.4vw,5.6rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[#FFFEF9] text-balance">
              {pick(h?.title, d.hero.title)} <span className="text-[#E6BE68]">{pick(h?.highlight, d.hero.highlight)}</span>
            </h1>
            <form action="/rezepte#alle" method="get" role="search" className="mt-2 w-full max-w-[32rem]">
              <label htmlFor="rezepte-suche" className="sr-only">
                {labels.searchLabel}
              </label>
              <div className="flex items-center gap-2 rounded-full bg-[#FFFEF9] p-1.5 pl-5 shadow-[0_18px_40px_-18px_rgb(0_0_0/60%)] transition-shadow focus-within:ring-2 focus-within:ring-[#E6BE68]">
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
            {popular.length > 0 && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[0.88rem]">
                <span className={cn(SMALL_CAPS, 'text-[0.66rem] text-[#FAF2E0]/55')}>{labels.popular}</span>
                {popular.slice(0, 3).map((r) => (
                  <Link key={r.id} href={`/rezepte/${r.slug}`} className="text-[#FAF2E0]/85 underline decoration-[#FAF2E0]/30 underline-offset-4 hover:text-[#FFFEF9] hover:decoration-[#E6BE68]">
                    {r.title}
                  </Link>
                ))}
              </p>
            )}
          </div>

          {/* small caption: which recipe is in the photo */}
          {heroRecipe && (
            <Link
              href={`/rezepte/${heroRecipe.slug}`}
              className="group absolute right-5 top-5 hidden items-center gap-2 rounded-full bg-[#1D1D1D]/50 px-4 py-2 font-display text-[0.82rem] text-[#FFFEF9] ring-1 ring-[#FFFEF9]/25 backdrop-blur-md transition-colors hover:bg-[#FFFEF9] hover:text-[#1D1D1D] sm:inline-flex md:right-8 md:top-8"
            >
              <span className="text-[#E6BE68] group-hover:text-[#1D1D1D]/60">{labels.recipeOfWeek}</span>
              {heroRecipe.title}
              <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </section>

      {/* ─── Four categories: compact cards (photo + centred name) ─── */}
      {!query && (
        <section id="kategorien" className={cn(WRAP, 'scroll-mt-24 pt-16 md:pt-24')}>
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

      {/* ─── All recipes ─── */}
      <section id="alle" className={cn(WRAP, 'scroll-mt-20 pb-16 pt-16 md:pb-24 md:pt-24', query && 'pt-10 md:pt-12')}>
        <GalleryHeading
          title={query ? `${labels.resultsFor} „${query}“` : pick(page.featured?.title, d.featured.title)}
        />
        {query && (
          <p className="-mt-2 mb-8">
            <Link href="/rezepte#alle" className={cn(SMALL_CAPS, 'text-[#2D2F2C] underline decoration-[#E6BE68] decoration-2 underline-offset-4')}>
              {labels.clearSearch}
            </Link>
          </p>
        )}
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

      <RecipesClosing locale={locale} />

    </main>
  )
}
