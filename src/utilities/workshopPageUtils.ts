/** Page URL slug → workshops collection slug (when they differ). */
export const PAGE_TO_DB_SLUG: Record<string, string> = {
  'lakto-gemuese': 'lakto',
  'vom-feld-ins-glas': 'vom-feld-ins-glas',
  kombucha: 'kombucha',
  tempeh: 'tempeh',
}

/** Workshops collection slug → public page slug (when they differ). */
export const DB_TO_PAGE_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_DB_SLUG).map(([pageSlug, dbSlug]) => [dbSlug, pageSlug]),
)

export function resolvePageSlugForDbSlug(dbSlug: string): string {
  return DB_TO_PAGE_SLUG[dbSlug] ?? dbSlug
}

type WorkshopPageLink = {
  slug: string
  workshopDetail?: { workshopDbSlug?: string | null } | null
  pageKind?: string | null
}

/** How strongly a CMS page owns a workshop DB slug (higher = preferred). */
export function scoreWorkshopPageLink(page: WorkshopPageLink, dbSlug: string): number {
  if (!page.slug) return 0

  const detail = page.workshopDetail
  const explicitDbSlug = detail?.workshopDbSlug?.trim()
  const implicitDbSlug = PAGE_TO_DB_SLUG[page.slug] ?? page.slug

  if (explicitDbSlug) {
    if (explicitDbSlug !== dbSlug) return 0
    if (implicitDbSlug === dbSlug || page.slug === dbSlug) return 80
    return 20
  }

  if (implicitDbSlug !== dbSlug) return 0
  if (page.slug in PAGE_TO_DB_SLUG) return 100
  if (page.pageKind === 'workshop-detail' || page.pageKind === 'special-workshop') return 60
  if (page.slug === dbSlug) return 50
  return 0
}

/** Pick the best public page slug for a workshop DB slug (nav, provisioning checks). */
export function resolveWorkshopPageSlugForDbSlug(
  pages: WorkshopPageLink[],
  dbSlug: string,
): string | undefined {
  let best: { slug: string; score: number } | undefined

  for (const page of pages) {
    if (!page.slug) continue
    const score = scoreWorkshopPageLink(page, dbSlug)
    if (score <= 0) continue
    if (!best || score > best.score || (score === best.score && page.slug.length < best.slug.length)) {
      best = { slug: page.slug, score }
    }
  }

  return best?.slug
}
