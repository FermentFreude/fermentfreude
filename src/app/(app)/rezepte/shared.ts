import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import type { Media, Recipe, RecipesPage } from '@/payload-types'
import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'

import { RECIPE_LABELS, type RecipeLabelKey } from './labels'

/* ═══════════════════════════════════════════════════════════════
 *  /rezepte — shared helpers
 *
 *  UI labels (fixed template words like "Zutaten"), media guard,
 *  time formatting and the schema.org Recipe JSON-LD builder.
 * ═══════════════════════════════════════════════════════════════ */

export { RECIPE_LABELS }

export type Labels = Record<RecipeLabelKey, string>

/** Template words: CMS value if set, else the default for the locale. */
export function resolveLabels(cms: RecipesPage['labels'] | undefined, locale: AppLocale): Labels {
  const base = RECIPE_LABELS[locale] as Labels
  const out = { ...base }
  for (const k of Object.keys(base) as RecipeLabelKey[]) {
    const v = (cms as Record<string, unknown> | undefined)?.[k]
    if (typeof v === 'string' && v.trim()) out[k] = v
  }
  return out
}

/** Category name: Rezepte-Seite → Kategorien → Name, else the standard name. */
export function categoryName(value: string | null | undefined, locale: AppLocale, page?: Partial<RecipesPage>): string {
  const cms = page?.categories?.items?.find((i) => i.category === value)?.name
  if (typeof cms === 'string' && cms.trim()) return cms
  return RECIPE_CATEGORIES.find((c) => c.value === value)?.label[locale] ?? ''
}

const DIFFICULTY_KEY: Record<string, RecipeLabelKey> = { leicht: 'diffEasy', mittel: 'diffMedium', fortgeschritten: 'diffAdvanced' }
const DISCLOSURE_KEY: Record<string, RecipeLabelKey> = {
  kooperation: 'partnerKooperation',
  anzeige: 'partnerAnzeige',
  werbung: 'partnerWerbung',
}

/** "Leicht" / "Easy" … from the template words (editable in the admin). */
export function difficultyName(value: string | null | undefined, l: Labels): string | undefined {
  const k = value ? DIFFICULTY_KEY[value] : undefined
  return k ? l[k] : undefined
}

/** "In Kooperation mit" / "Anzeige" / "Werbung" from the template words. */
export function disclosureName(value: string | null | undefined, l: Labels): string {
  return l[DISCLOSURE_KEY[value ?? ''] ?? 'partnerKooperation']
}

export function isResolvedMedia(img: unknown): img is Media {
  return typeof img === 'object' && img !== null && 'url' in img && Boolean((img as Media).url)
}

export function absoluteMediaUrl(img: unknown, baseUrl: string): string | undefined {
  if (!isResolvedMedia(img) || !img.url) return undefined
  return img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`
}

export function formatDays(days: number, l: Pick<Labels, 'day' | 'days'>) {
  return `${days} ${days === 1 ? l.day : l.days}`
}

/** ISO 8601 duration for schema.org, e.g. P5DT30M */
function isoDuration(minutes?: number | null, days?: number | null) {
  const d = days && days > 0 ? `${days}D` : ''
  const m = minutes && minutes > 0 ? `T${minutes}M` : ''
  return d || m ? `P${d}${m}` : undefined
}

/** schema.org/Recipe — read by Google rich results and Pinterest rich pins. */
export function buildRecipeJsonLd(
  recipe: Recipe,
  opts: { url: string; baseUrl: string; categoryLabel?: string; locale: AppLocale; rating?: { count: number; average: number } },
) {
  const images = [recipe.heroImage, recipe.pinterestImage]
    .map((img) => absoluteMediaUrl(img, opts.baseUrl))
    .filter(Boolean)

  const ingredients = (recipe.ingredientGroups ?? []).flatMap((g) =>
    (g.items ?? []).map((i) =>
      [i.amount, i.name, i.note ? `(${i.note})` : ''].filter(Boolean).join(' '),
    ),
  )

  const steps = (recipe.steps ?? []).map((s, idx) => ({
    '@type': 'HowToStep',
    position: idx + 1,
    text: s.text,
    ...(absoluteMediaUrl(s.image, opts.baseUrl)
      ? { image: absoluteMediaUrl(s.image, opts.baseUrl) }
      : {}),
  }))

  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.meta?.description || recipe.summary || undefined,
    image: images.length ? images : undefined,
    url: opts.url,
    inLanguage: opts.locale,
    author: { '@type': 'Organization', name: 'Fermentfreude' },
    publisher: { '@type': 'Organization', name: 'Fermentfreude' },
    datePublished: recipe.publishedAt || recipe.createdAt,
    dateModified: recipe.updatedAt,
    prepTime: isoDuration(recipe.prepMinutes),
    totalTime: isoDuration(recipe.prepMinutes, recipe.fermentationDays),
    recipeYield: recipe.yield || undefined,
    recipeCategory: opts.categoryLabel,
    keywords: recipe.keywords || undefined,
    recipeIngredient: ingredients.length ? ingredients : undefined,
    recipeInstructions: steps.length ? steps : undefined,
    // Google recipe stars: only real votes, never invented
    aggregateRating:
      opts.rating && opts.rating.count > 0
        ? { '@type': 'AggregateRating', ratingValue: opts.rating.average, ratingCount: opts.rating.count, bestRating: 5, worstRating: 1 }
        : undefined,
  }

  // Drop undefined keys so the output stays clean
  return Object.fromEntries(Object.entries(json).filter(([, v]) => v !== undefined))
}

