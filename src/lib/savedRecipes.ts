/* ═══════════════════════════════════════════════════════════════
 *  "Gespeicherte Rezepte" for logged-in customers — pure helpers used
 *  by /api/recipes/saved. Recipes are stored on the user as ids,
 *  newest first, at most SAVED_RECIPES_MAX.
 * ═══════════════════════════════════════════════════════════════ */

export const SAVED_RECIPES_MAX = 200

const SLUG = /^[a-z0-9-]{1,120}$/

/** { add?: string[], remove?: string[] } of recipe slugs. Null when anything is off. */
export function parseSavedInput(body: unknown): { add: string[]; remove: string[] } | null {
  if (!body || typeof body !== 'object') return null
  const { add = [], remove = [] } = body as { add?: unknown; remove?: unknown }
  const list = (v: unknown) =>
    Array.isArray(v) && v.length <= SAVED_RECIPES_MAX && v.every((s) => typeof s === 'string' && SLUG.test(s)) ? (v as string[]) : null
  const a = list(add)
  const r = list(remove)
  if (!a || !r || a.length + r.length === 0) return null
  return { add: [...new Set(a)], remove: [...new Set(r)] }
}

/** New list: added first (newest first, in the given order), then the rest; removed ones dropped; no doubles. */
export function mergeSaved<T>(existing: T[], add: T[], remove: T[], max = SAVED_RECIPES_MAX): T[] {
  const drop = new Set(remove)
  const out: T[] = []
  for (const id of [...add, ...existing]) if (!drop.has(id) && !out.includes(id)) out.push(id)
  return out.slice(0, max)
}
