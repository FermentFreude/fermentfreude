'use client'

import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import type { Recipe } from '@/payload-types'
import { cn } from '@/utilities/cn'
import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import { useState } from 'react'

import { GalleryCard, SMALL_CAPS } from './gallery'
import type { Labels } from './shared'

/* ═══════════════════════════════════════════════════════════════
 *  Recipe gallery with instant category filter (text tabs)
 *  Shows PAGE recipes first, then "Mehr Rezepte zeigen".
 * ═══════════════════════════════════════════════════════════════ */

const PAGE = 6

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

  const list = filter ? recipes.filter((r) => r.category === filter) : recipes
  const visible = list.slice(0, limit)

  const tabs = [
    { value: '', label: labels.all, count: recipes.length },
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
          className="-mx-[clamp(1.25rem,4vw,4rem)] mb-8 flex items-center gap-x-7 overflow-x-auto whitespace-nowrap border-b border-[#2D2F2C]/10 px-[clamp(1.25rem,4vw,4rem)] pb-3 [scrollbar-width:none] md:mx-0 md:mb-10 md:px-0"
        >
          {tabs.map((t) => {
            const on = filter === t.value
            return (
              <button
                key={t.value || 'all'}
                type="button"
                role="tab"
                aria-selected={on}
                disabled={t.count === 0}
                onClick={() => {
                  setFilter(t.value)
                  setLimit(PAGE)
                }}
                className={cn(
                  SMALL_CAPS,
                  'relative shrink-0 py-1 text-[0.78rem] transition-colors disabled:cursor-not-allowed disabled:opacity-35',
                  on ? 'text-[#2D2F2C]' : 'text-[#2D2F2C]/50 hover:text-[#2D2F2C]',
                )}
              >
                {t.label}
                <span
                  aria-hidden
                  className={cn('absolute -bottom-[1px] left-0 h-[2px] bg-[#E6BE68] transition-all duration-300', on ? 'w-full' : 'w-0')}
                />
              </button>
            )
          })}
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-10 text-center text-[1.05rem] text-[#2D2F2C]/70">{emptyText}</p>
      ) : (
        // staggered columns (photo-wall rhythm) from tablet up: the middle column sits lower;
        // phones keep the even 2-column grid. Bottom padding keeps the offset clear
        <div
          key={filter}
          className={cn(
            'ff-fade grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-6 md:gap-y-10',
            visible.length > 1 &&
              'sm:pb-16 sm:[&>*:nth-child(3n+2)]:translate-y-16',
          )}
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
