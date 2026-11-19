'use server'

import { RECIPE_CATEGORIES } from '@/collections/Recipes/categories'
import { slugify } from '@/collections/Recipes'
import { requireAdminUser } from '@/components/admin/roster/requireAdmin'
import { parseRecipeImport, type ImportedRecipe } from '@/lib/recipeImport'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Server actions for /admin/rezepte-import.
 *  Network-callable → both check for an admin first (CLAUDE.md → Security).
 *  Import creates DRAFTS only, one after another (no Promise.all on M0),
 *  and never touches an existing recipe: same URL = skipped.
 * ═══════════════════════════════════════════════════════════════ */

const MAX_CHARS = 2_000_000

export type PreviewRow = {
  row: number
  title: string
  category?: string
  slug?: string
  ingredients: number
  steps: number
  status: 'new' | 'exists' | 'duplicate' | 'error'
  errors: string[]
  warnings: string[]
}

export type PreviewResult = { ok: true; rows: PreviewRow[] } | { ok: false; error: string }

export type ImportResult =
  | { ok: true; created: { title: string; id: string }[]; skipped: number; failed: { title: string; error: string }[] }
  | { ok: false; error: string }

const categoryLabel = (v: string) => RECIPE_CATEGORIES.find((c) => c.value === v)?.label.de ?? v

/** URL for a new recipe: given or from the title; never a category page address. */
function slugFor(r: ImportedRecipe) {
  const s = slugify(r.slug || r.title)
  return RECIPE_CATEGORIES.some((c) => c.value === s) ? `${s}-rezept` : s
}

async function analyse(text: string) {
  if (typeof text !== 'string' || !text.trim()) return { error: 'Keine Datei oder kein Text.' } as const
  if (text.length > MAX_CHARS) return { error: 'Die Datei ist zu groß (max. ca. 2 MB).' } as const

  const parsed = parseRecipeImport(text)
  if (parsed.error) return { error: parsed.error } as const

  const payload = await getPayload({ config: configPromise })
  const user = await requireAdminUser(payload)

  const slugs = parsed.rows.flatMap((r) => (r.recipe ? [slugFor(r.recipe)] : []))
  const { docs } = slugs.length
    ? await payload.find({
        collection: 'recipes',
        where: { slug: { in: slugs } },
        limit: slugs.length,
        depth: 0,
        draft: true,
        pagination: false,
        overrideAccess: false,
        user,
      })
    : { docs: [] }
  const existing = new Set(docs.map((d) => d.slug))
  const seen = new Set<string>()

  const rows = parsed.rows.map((r) => {
    const slug = r.recipe ? slugFor(r.recipe) : undefined
    let status: PreviewRow['status'] = r.errors.length ? 'error' : 'new'
    if (slug && status === 'new') {
      if (existing.has(slug)) status = 'exists'
      else if (seen.has(slug)) status = 'duplicate'
      seen.add(slug)
    }
    return { parsed: r, slug, status }
  })
  return { payload, user, rows } as const
}

export async function previewRecipeImport(text: string): Promise<PreviewResult> {
  try {
    const a = await analyse(text)
    if ('error' in a) return { ok: false, error: a.error ?? 'Unbekannter Fehler' }
    return {
      ok: true,
      rows: a.rows.map(({ parsed, slug, status }) => ({
        row: parsed.row,
        title: parsed.recipe?.title ?? '',
        category: parsed.recipe ? categoryLabel(parsed.recipe.category) : undefined,
        slug,
        ingredients: parsed.recipe?.ingredientGroups.reduce((n, g) => n + g.items.length, 0) ?? 0,
        steps: parsed.recipe?.steps.length ?? 0,
        status,
        errors: parsed.errors,
        warnings: parsed.warnings,
      })),
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return { ok: false, error: 'Nur für Admins.' }
    console.error('[recipe-import] preview failed', error)
    return { ok: false, error: 'Die Datei konnte nicht gelesen werden.' }
  }
}

export async function importRecipes(text: string): Promise<ImportResult> {
  try {
    const a = await analyse(text)
    if ('error' in a) return { ok: false, error: a.error ?? 'Unbekannter Fehler' }
    const { payload, user, rows } = a

    const created: { title: string; id: string }[] = []
    const failed: { title: string; error: string }[] = []
    let skipped = 0
    // sequential on purpose (MongoDB Atlas M0, no transactions)
    for (const { parsed, slug, status } of rows) {
      if (status !== 'new' || !parsed.recipe || !slug) {
        skipped++
        continue
      }
      const r = parsed.recipe
      try {
        const doc = await payload.create({
          collection: 'recipes',
          locale: 'de',
          draft: true,
          overrideAccess: false,
          user,
          data: {
            _status: 'draft',
            title: r.title,
            slug,
            category: r.category as never,
            summary: r.summary,
            prepMinutes: r.prepMinutes,
            fermentationDays: r.fermentationDays,
            yield: r.yield,
            difficulty: r.difficulty as never,
            vessel: r.vessel,
            whyItWorks: r.whyItWorks,
            keywords: r.keywords,
            ingredientGroups: r.ingredientGroups,
            steps: r.steps,
            tips: r.tips,
            fermentLog: r.fermentLog,
          },
        })
        created.push({ title: r.title, id: String(doc.id) })
      } catch (error) {
        console.error('[recipe-import] create failed', r.title, error)
        failed.push({ title: r.title, error: error instanceof Error ? error.message : 'Fehler beim Speichern' })
      }
    }
    return { ok: true, created, skipped, failed }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return { ok: false, error: 'Nur für Admins.' }
    console.error('[recipe-import] import failed', error)
    return { ok: false, error: 'Import fehlgeschlagen.' }
  }
}
