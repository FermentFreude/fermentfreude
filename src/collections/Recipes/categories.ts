/* ═══════════════════════════════════════════════════════════════
 *  Recipe categories — the four fixed groups on /rezepte.
 *
 *  Shared by the Payload schema (select options) and the frontend
 *  (filter chips, labels, matching workshop link). Kept in code on
 *  purpose: four stable categories don't need their own collection.
 * ═══════════════════════════════════════════════════════════════ */

/** Brand palette (Cream / Charcoal / Sage / Mustard). */
export const PALETTE = {
  cream: '#FAF2E0',
  charcoal: '#2D2F2C',
  sage: '#B0C7B8',
  mustard: '#E6BE68',
} as const

export const RECIPE_CATEGORIES = [
  {
    value: 'fermentieren',
    label: { de: 'Gemüse fermentieren', en: 'Fermenting Vegetables' },
    workshopHref: '/workshops/lakto-gemuese',
    theme: { bg: PALETTE.sage, fg: PALETTE.charcoal },
  },
  {
    value: 'einlegen',
    label: { de: 'Einlegen & Haltbarmachen', en: 'Pickling & Preserving' },
    workshopHref: '/workshops/lakto-gemuese',
    theme: { bg: PALETTE.cream, fg: PALETTE.charcoal },
  },
  {
    value: 'tempeh',
    label: { de: 'Tempeh & Kochen', en: 'Tempeh & Cooking' },
    workshopHref: '/workshops/tempeh',
    theme: { bg: PALETTE.charcoal, fg: PALETTE.cream },
  },
  {
    value: 'kombucha',
    label: { de: 'Kombucha & Drinks', en: 'Kombucha & Drinks' },
    workshopHref: '/workshops/kombucha',
    theme: { bg: PALETTE.mustard, fg: PALETTE.charcoal },
  },
] as const

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]['value']

export function getRecipeCategory(value: string | null | undefined) {
  return RECIPE_CATEGORIES.find((c) => c.value === value)
}

export const RECIPE_DIFFICULTIES = [
  { value: 'leicht', label: { de: 'Leicht', en: 'Easy' } },
  { value: 'mittel', label: { de: 'Mittel', en: 'Medium' } },
  { value: 'fortgeschritten', label: { de: 'Fortgeschritten', en: 'Advanced' } },
] as const

export const PARTNER_DISCLOSURES = [
  { value: 'kooperation', label: { de: 'In Kooperation mit', en: 'In partnership with' } },
  { value: 'anzeige', label: { de: 'Anzeige', en: 'Advertisement' } },
  { value: 'werbung', label: { de: 'Werbung', en: 'Sponsored' } },
] as const
