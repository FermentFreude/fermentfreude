'use client'

import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import type { Recipe } from '@/payload-types'
import { cn } from '@/utilities/cn'
import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import Link from 'next/link'
import { useState } from 'react'

import { GalleryCard, SMALL_CAPS } from './gallery'
import { HeartIcon, useSavedRecipes } from './saved'
import type { Labels } from './shared'

/* ═══════════════════════════════════════════════════════════════
 *  Recipe gallery with instant category filter (text tabs)
 *  Shows PAGE recipes first, then "Mehr Rezepte zeigen".
 * ═══════════════════════════════════════════════════════════════ */

const PAGE = 12

export function RecipeGrid({
  recipes,
  locale,
  labels,
  emptyText,
  initialFilter = '',
  showTabs = true,
  categoryNames,
}: {
  recipes: Recipe[]
  locale: AppLocale
  labels: Labels
  emptyText: string
  initialFilter?: string
  showTabs?: boolean
  /** Category names from the CMS (Rezepte-Seite → Kategorien); falls back to the standard names. */
  categoryNames?: Record<string, string>
}) {
  const [filter, setFilter] = useState(initialFilter)
  const [limit, setLimit] = useState(PAGE)

  const { saved, loggedIn } = useSavedRecipes()
  const savedRecipes = saved.map((slug) => recipes.find((r) => r.slug === slug)).filter((r): r is Recipe => Boolean(r))
  const SAVED = '__saved'

  const list = filter === SAVED ? savedRecipes : filter ? recipes.filter((r) => r.category === filter) : recipes
  const visible = list.slice(0, limit)

  const tabs = [
    { value: '', label: labels.all, count: recipes.length },
    // only once something is saved (or while the tab is open)
    ...(savedRecipes.length > 0 || filter === SAVED ? [{ value: SAVED, label: labels.savedTab, count: savedRecipes.length, heart: true }] : []),
    ...RECIPE_CATEGORIES.map((c) => ({
      value: c.value as string,
      label: categoryNames?.[c.value] || c.label[locale],
      count: recipes.filter((r) => r.category === c.value).length,
    })),
  ]

  return (
    <div>
      {showTabs && (
        <div
          role="tablist"
          aria-label={labels.filterLabel}
          className="-mx-[clamp(1.25rem,4vw,4rem)] mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap px-[clamp(1.25rem,4vw,4rem)] pb-1 [scrollbar-width:none] md:mx-0 md:mb-10 md:flex-wrap md:justify-center md:px-0"
        >
          {tabs.map((t) => {
            const on = filter === t.value
            return (
              <button
                key={t.value || 'all'}
                type="button"
                role="tab"
                aria-selected={on}
                disabled={t.count === 0 && t.value !== SAVED}
                onClick={() => {
                  setFilter(t.value)
                  setLimit(PAGE)
                }}
                // pill buttons (clearly tappable): active = charcoal, others = outlined
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 font-display text-[0.88rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35 md:px-5',
                  on
                    ? 'border-[#2D2F2C] bg-[#2D2F2C] text-[#FAF2E0]'
                    : 'border-[#2D2F2C]/15 bg-[#FFFEF9] text-[#2D2F2C] hover:border-[#2D2F2C]/50',
                )}
              >
                {'heart' in t ? (
                  <span className="inline-flex items-center gap-1.5">
                    <HeartIcon className="size-4 text-[#D93A3A]" />
                    {t.label} <span className={on ? 'opacity-70' : 'opacity-55'}>({t.count})</span>
                  </span>
                ) : (
                  t.label
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* where the hearts live: account (all devices) or this browser + login link */}
      {filter === SAVED && loggedIn !== undefined && (
        <p className="-mt-2 mb-6 text-center text-[0.9rem] leading-relaxed text-[#2D2F2C]/65 md:-mt-5 md:mb-8">
          {loggedIn ? (
            labels.savedAccountHint
          ) : (
            <>
              {labels.savedHint}{' '}
              <Link
                href={`/login?redirect=${encodeURIComponent('/rezepte')}`}
                className="font-display font-bold text-[#2D2F2C] underline decoration-[#E6BE68] decoration-2 underline-offset-4 hover:decoration-[#2D2F2C]"
              >
                {labels.savedLoginLink}
              </Link>
            </>
          )}
        </p>
      )}
      {list.length === 0 ? (
        <p className="py-10 text-center text-[1.05rem] text-[#2D2F2C]/70">{filter === SAVED ? labels.savedEmpty : emptyText}</p>
      ) : (
        // even grid like Cooking Catrin: 2 per row on phones, 3 on tablets, 4 on desktop
        <div
          key={filter}
          className="ff-fade grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:grid-cols-4"
        >
          {visible.map((r, i) => (
            <GalleryCard key={r.id} recipe={r} locale={locale} labels={labels} priority={i < 3} />
          ))}
        </div>
      )}

      {list.length > limit && (
        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className={cn(
              SMALL_CAPS,
              'rounded-full border border-[#2D2F2C] px-8 py-4 text-[0.78rem] text-[#2D2F2C] transition-colors hover:bg-[#2D2F2C] hover:text-[#FFFEF9]',
            )}
          >
            {labels.showMore}
          </button>
        </div>
      )}
    </div>
  )
}
