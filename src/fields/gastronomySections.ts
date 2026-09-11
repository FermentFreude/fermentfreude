export const GASTRONOMY_SECTION_OPTIONS = [
  { label: 'Hero', value: 'hero' },
  { label: 'Food showcase', value: 'showcase' },
  { label: 'Why tempeh', value: 'benefits' },
  { label: 'Audience', value: 'audience' },
  { label: 'Product', value: 'product' },
  { label: 'Proof', value: 'proof' },
  { label: 'Inquiry form', value: 'inquiry' },
] as const

export type GastronomySectionId = (typeof GASTRONOMY_SECTION_OPTIONS)[number]['value']

export const DEFAULT_GASTRONOMY_SECTION_ORDER: GastronomySectionId[] = GASTRONOMY_SECTION_OPTIONS.map(
  (row) => row.value,
)

const SECTION_IDS = new Set<string>(DEFAULT_GASTRONOMY_SECTION_ORDER)

export const GASTRONOMY_SECTION_LABELS: Record<GastronomySectionId, string> = {
  hero: 'Hero',
  showcase: 'Food showcase',
  benefits: 'Why tempeh',
  audience: 'Audience',
  product: 'Product',
  proof: 'Proof',
  inquiry: 'Inquiry form',
}

export function defaultGastronomySectionOrderRows(): Array<{ section: GastronomySectionId }> {
  return DEFAULT_GASTRONOMY_SECTION_ORDER.map((section) => ({ section }))
}

export function resolveGastronomySectionOrder(
  rows: Array<{ section?: string | null } | null> | null | undefined,
): GastronomySectionId[] {
  const unique: GastronomySectionId[] = []
  for (const row of rows ?? []) {
    const id = row?.section
    if (!id || !SECTION_IDS.has(id) || unique.includes(id as GastronomySectionId)) continue
    unique.push(id as GastronomySectionId)
  }
  return unique.length > 0 ? unique : [...DEFAULT_GASTRONOMY_SECTION_ORDER]
}
