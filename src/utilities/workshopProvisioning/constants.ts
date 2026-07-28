/** Skip auto page creation — already has a custom editorial layout. */
export const SPECIAL_WORKSHOP_DB_SLUGS = new Set(['vom-feld-ins-glas'])

export const PROVISION_CTX = {
  skipRevalidate: true,
  disableRevalidate: true,
  skipAutoTranslate: true,
  skipWorkshopProvision: true,
} as const

export function productSlugForWorkshop(dbSlug: string): string {
  return `workshop-${dbSlug}`
}
