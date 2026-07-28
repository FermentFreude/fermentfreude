import type { Page as PageType, Post } from '@/payload-types'

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

export type HeroStyle = 'default' | 'lakto' | 'tempeh' | 'kombucha'
export type LayoutTemplate = 'standard' | 'special'

type WorkshopDetailBase = NonNullable<PageType['workshopDetail']>

/**
 * Runtime-flattened workshop detail — `pageSections` block fields merged to top level
 * so components can read `detail.heroTitle`, `detail.bookingTitle`, etc.
 */
export type FlattenedWorkshopDetail = WorkshopDetailBase & {
  heroEyebrow?: string | null
  heroTitle?: string | null
  heroDescription?: string | null
  heroImage?: unknown
  heroAttributes?: Array<{ text?: string | null }> | null
  sealRingText?: string | null
  sealCenterText?: string | null
  bookingEyebrow?: string | null
  bookingTitle?: string | null
  bookingPrice?: number | null
  bookingPriceSuffix?: string | null
  bookingCurrency?: string | null
  bookingImage?: unknown
  bookingAttributes?: Array<{ text?: string | null }> | null
  bookingViewDatesLabel?: string | null
  bookingHideDatesLabel?: string | null
  bookingMoreDetailsLabel?: string | null
  bookingBookLabel?: string | null
  bookingSpotsLabel?: string | null
  aboutHeading?: string | null
  aboutText?: string | null
  scheduleHeading?: string | null
  schedule?: Array<{
    duration?: string | null
    title?: string | null
    description?: string | null
  }> | null
  includedHeading?: string | null
  includedItems?: Array<{ text?: string | null }> | null
  whyHeading?: string | null
  whyPoints?: Array<{ bold?: string | null; rest?: string | null }> | null
  experienceEyebrow?: string | null
  experienceTitle?: string | null
  experienceCards?: Array<unknown> | null
  datesHeading?: string | null
  modalConfirmHeading?: string | null
  modalConfirmSubheading?: string | null
  modalWorkshopLabel?: string | null
  modalDateLabel?: string | null
  modalTimeLabel?: string | null
  modalTotalLabel?: string | null
  modalCancelLabel?: string | null
  modalConfirmLabel?: string | null
  howToEyebrow?: string | null
  howToTitle?: string | null
  howToDescription?: string | null
  howToArticles?: Array<Post | string> | null
  faqEyebrow?: string | null
  faqTitle?: string | null
  faqDescription?: string | null
  faqItems?: Array<{ question?: string | null; answer?: string | null }> | null
  faqContactEmail?: string | null
  useGlobalVoucherData?: boolean | null
  voucherEyebrow?: string | null
  voucherTitle?: string | null
  voucherDescription?: string | null
  voucherPrimaryLabel?: string | null
  voucherPrimaryHref?: string | null
  voucherSecondaryLabel?: string | null
  voucherSecondaryHref?: string | null
  voucherPills?: Array<{ text?: string | null }> | null
  voucherBackgroundImage?: unknown
  sliderHeading?: string | null
  sliderSubtitle?: string | null
  sliderPillLabel?: string | null
  sliderBuyLabel?: string | null
  sliderMoreInfoLabel?: string | null
  recipePlanEyebrow?: string | null
  recipePlanTitle?: string | null
  recipePlanDescription?: string | null
  recipePlanRecipes?: Array<{ name?: string | null }> | null
}

export type StandardSectionId =
  | 'hero'
  | 'booking'
  | 'calendar'
  | 'howTo'
  | 'faq'
  | 'moreWorkshops'
  | 'voucher'

const VALID_STANDARD_SECTIONS: StandardSectionId[] = [
  'hero',
  'booking',
  'calendar',
  'howTo',
  'faq',
  'moreWorkshops',
  'voucher',
]

type WorkshopPageLink = {
  slug: string
  workshopDetail?: { workshopDbSlug?: string | null } | null
  pageKind?: string | null
}

/**
 * Canonical booking slug for a public workshop page URL.
 * Legacy pages (lakto-gemuese, tempeh, …) always use fixed mapping — CMS override cannot repoint them.
 */
export function resolveWorkshopDbSlug(
  pageSlug: string,
  detail?: { workshopDbSlug?: string | null } | null,
): string {
  if (pageSlug in PAGE_TO_DB_SLUG) {
    return PAGE_TO_DB_SLUG[pageSlug]
  }

  const override = detail?.workshopDbSlug?.trim()
  if (override) return override
  return pageSlug
}

/** How strongly a CMS page owns a workshop DB slug (higher = preferred). */
export function scoreWorkshopPageLink(page: WorkshopPageLink, dbSlug: string): number {
  if (!page.slug) return 0

  const detail = page.workshopDetail
  const explicitDbSlug = detail?.workshopDbSlug?.trim()
  const implicitDbSlug = PAGE_TO_DB_SLUG[page.slug] ?? page.slug

  if (explicitDbSlug) {
    if (explicitDbSlug !== dbSlug) return 0
    // Explicit alias (e.g. test page → tst workshop): lower priority than canonical owner
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

export function resolveLayoutTemplate(
  pageSlug: string,
  detail?: { layoutTemplate?: string | null } | null,
): LayoutTemplate {
  if (detail?.layoutTemplate === 'special') return 'special'
  if (pageSlug === 'vom-feld-ins-glas') return 'special'
  return 'standard'
}

export function resolveHeroStyle(
  pageSlug: string,
  detail?: { heroStyle?: string | null } | null,
): HeroStyle {
  const fromCms = detail?.heroStyle
  if (fromCms === 'lakto' || fromCms === 'tempeh' || fromCms === 'kombucha' || fromCms === 'default') {
    return fromCms
  }
  if (pageSlug === 'lakto-gemuese') return 'lakto'
  if (pageSlug === 'tempeh') return 'tempeh'
  if (pageSlug === 'kombucha') return 'kombucha'
  return 'default'
}

/**
 * Legacy pages (lakto, tempeh, kombucha) store content in flat workshopDetail fields
 * on production — same as main branch. Never let pageSections blocks override flat images.
 */
export function isLegacyWorkshopPageSlug(pageSlug: string): boolean {
  return pageSlug in PAGE_TO_DB_SLUG
}

const WORKSHOP_DETAIL_META_KEYS = new Set([
  'pageSections',
  'layoutTemplate',
  'heroStyle',
  'workshopDbSlug',
])

/** Production (main) stored copy in flat workshopDetail keys — not in pageSections blocks. */
function pickLegacyFlatFields(
  detail: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!detail) return {}
  const picked: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(detail)) {
    if (WORKSHOP_DETAIL_META_KEYS.has(key)) continue
    if (isMeaningfulWorkshopValue(value)) picked[key] = value
  }
  return picked
}

const LEGACY_IMAGE_FIELD_KEYS = ['heroImage', 'bookingImage', 'voucherBackgroundImage'] as const

function mergeExperienceCardsField(raw: unknown, blocks: unknown): unknown {
  const rawArr = Array.isArray(raw) ? raw : null
  const blockArr = Array.isArray(blocks) ? blocks : null

  if (!rawArr?.length) return blockArr ?? raw
  if (!blockArr?.length) return rawArr

  return rawArr.map((rawCard, i) => {
    if (!rawCard || typeof rawCard !== 'object') return rawCard
    const blockCard =
      blockArr[i] && typeof blockArr[i] === 'object'
        ? (blockArr[i] as Record<string, unknown>)
        : {}

    return {
      ...blockCard,
      ...rawCard,
      image: resolveImageFieldValue(
        (rawCard as { image?: unknown }).image,
        blockCard.image,
        true,
      ),
    }
  })
}

/**
 * Legacy pages: flatten pageSections for the new schema, then overlay raw DB flat
 * fields from production (main). Flat CMS copy always wins over block defaults.
 */
export function mergeLegacyWorkshopDetail(
  apiDetail: Record<string, unknown> | undefined,
  rawDbDetail: Record<string, unknown> | undefined,
  pageSlug: string,
): Record<string, unknown> {
  const fromBlocks = flattenWorkshopDetail(apiDetail, pageSlug) ?? apiDetail ?? {}
  const fromRawFlat = pickLegacyFlatFields(rawDbDetail)

  const merged: Record<string, unknown> = { ...fromBlocks }

  // Text & arrays from production flat fields — never blind-spread image IDs over populated media.
  for (const [key, value] of Object.entries(fromRawFlat)) {
    if (WORKSHOP_DETAIL_META_KEYS.has(key)) continue
    if ((LEGACY_IMAGE_FIELD_KEYS as readonly string[]).includes(key)) continue
    if (key === 'experienceCards') continue
    if (isMeaningfulWorkshopValue(value)) merged[key] = value
  }

  for (const key of LEGACY_IMAGE_FIELD_KEYS) {
    const resolved = resolveImageFieldValue(fromRawFlat[key], fromBlocks[key], true)
    if (isMeaningfulWorkshopValue(resolved)) merged[key] = resolved
  }

  const mergedCards = mergeExperienceCardsField(
    fromRawFlat.experienceCards,
    fromBlocks.experienceCards,
  )
  if (mergedCards != null) merged.experienceCards = mergedCards

  merged.pageSections = apiDetail?.pageSections ?? rawDbDetail?.pageSections
  merged.layoutTemplate = apiDetail?.layoutTemplate ?? rawDbDetail?.layoutTemplate
  merged.heroStyle = apiDetail?.heroStyle ?? rawDbDetail?.heroStyle
  merged.workshopDbSlug = apiDetail?.workshopDbSlug ?? rawDbDetail?.workshopDbSlug

  return merged
}

/** After populate: use depth-10 block images when flat production IDs are missing on staging. */
export function finalizeLegacyWorkshopImages(
  detail: Record<string, unknown> | undefined,
  blockFallback: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!detail || !blockFallback) return detail

  for (const key of LEGACY_IMAGE_FIELD_KEYS) {
    if (!isResolvedMediaValue(detail[key]) && isResolvedMediaValue(blockFallback[key])) {
      detail[key] = blockFallback[key]
    }
  }

  if (Array.isArray(detail.experienceCards) && Array.isArray(blockFallback.experienceCards)) {
    detail.experienceCards = (detail.experienceCards as Array<Record<string, unknown>>).map(
      (card, i) => {
        const blockCard = (blockFallback.experienceCards as Array<Record<string, unknown>>)[i]
        if (
          blockCard &&
          !isResolvedMediaValue(card.image) &&
          isResolvedMediaValue(blockCard.image)
        ) {
          return { ...card, image: blockCard.image }
        }
        return card
      },
    )
  }

  return detail
}

export function resolveWorkshopDetailForPage(
  detailRaw: Record<string, unknown> | undefined,
  pageSlug: string,
  rawDbDetail?: Record<string, unknown> | undefined,
): FlattenedWorkshopDetail | undefined {
  if (!detailRaw && !rawDbDetail) return undefined
  if (isLegacyWorkshopPageSlug(pageSlug)) {
    return mergeLegacyWorkshopDetail(detailRaw, rawDbDetail, pageSlug) as FlattenedWorkshopDetail
  }
  return flattenWorkshopDetail(detailRaw, pageSlug)
}

export function flattenWorkshopDetail(
  detailRaw: Record<string, unknown> | undefined,
  pageSlug?: string,
): FlattenedWorkshopDetail | undefined {
  if (!detailRaw) return undefined

  const preferLegacyTopLevel = Boolean(pageSlug && pageSlug in PAGE_TO_DB_SLUG)

  const sectionBlock = (type: string) =>
    (Array.isArray(detailRaw.pageSections)
      ? (detailRaw.pageSections as Array<Record<string, unknown>>).find(
          (b) => b.blockType === type,
        )
      : undefined) ?? {}

  const mergeFields = (block: Record<string, unknown>) =>
    mergeWorkshopSectionFields(detailRaw, block, preferLegacyTopLevel)

  const heroFields = mergeFields(sectionBlock('hero'))
  const bookingFields = mergeFields(sectionBlock('booking'))
  const recipePlanFields = mergeFields(sectionBlock('recipePlan'))
  const howToFields = mergeFields(sectionBlock('howTo'))
  const faqFields = mergeFields(sectionBlock('faq'))
  const voucherFields = mergeFields(sectionBlock('voucher'))
  const moreWorkshopsFields = mergeFields(sectionBlock('moreWorkshops'))

  return {
    ...detailRaw,
    ...heroFields,
    ...bookingFields,
    ...recipePlanFields,
    ...howToFields,
    ...faqFields,
    ...voucherFields,
    ...moreWorkshopsFields,
    pageSections: detailRaw.pageSections,
    showSeasonalCalendar: detailRaw.showSeasonalCalendar,
    showHowToGuides: detailRaw.showHowToGuides,
    calendarEyebrow: detailRaw.calendarEyebrow,
    calendarTitle: detailRaw.calendarTitle,
    calendarDescription: detailRaw.calendarDescription,
    calendarMonths: detailRaw.calendarMonths,
    layoutTemplate: detailRaw.layoutTemplate,
    heroStyle: detailRaw.heroStyle,
    workshopDbSlug: detailRaw.workshopDbSlug,
  } as FlattenedWorkshopDetail
}

export function getOrderedStandardSections(
  pageSections: Array<{ blockType?: string; enabled?: boolean | null }> | undefined,
  heroStyle: HeroStyle,
  showSeasonalCalendar?: boolean | null,
): Array<{ section: StandardSectionId; enabled: boolean }> {
  if (pageSections && pageSections.length > 0) {
    const ordered = pageSections
      .map((row) => ({
        section: (row.blockType ?? '') as StandardSectionId,
        enabled: row.enabled !== false,
      }))
      .filter((row) => VALID_STANDARD_SECTIONS.includes(row.section))

    if (
      showSeasonalCalendar &&
      !ordered.some((row) => row.section === 'calendar')
    ) {
      const bookingIdx = ordered.findIndex((row) => row.section === 'booking')
      const calendarRow = { section: 'calendar' as const, enabled: true }
      if (bookingIdx >= 0) {
        ordered.splice(bookingIdx + 1, 0, calendarRow)
      } else {
        ordered.push(calendarRow)
      }
    }

    return ordered
  }

  if (heroStyle === 'lakto' || showSeasonalCalendar) {
    return [
      { section: 'hero', enabled: true },
      { section: 'booking', enabled: true },
      { section: 'calendar', enabled: Boolean(showSeasonalCalendar) },
      { section: 'howTo', enabled: true },
      { section: 'faq', enabled: true },
      { section: 'moreWorkshops', enabled: true },
      { section: 'voucher', enabled: true },
    ]
  }

  return [
    { section: 'hero', enabled: true },
    { section: 'booking', enabled: true },
    { section: 'moreWorkshops', enabled: true },
    { section: 'voucher', enabled: true },
    { section: 'howTo', enabled: true },
    { section: 'faq', enabled: true },
  ]
}

export function isWorkshopDetailPageKind(pageKind?: string | null): boolean {
  return pageKind === 'workshop-detail' || pageKind === 'special-workshop'
}

function isMeaningfulWorkshopValue(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') {
    if (!value.trim()) return false
    // Bare media ID counts as meaningful — populateWorkshopDetailMedia resolves it later.
    return true
  }
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if ('url' in record && record.url) return true
    if ('id' in record && record.id) return true
    return Object.keys(record).length > 0
  }
  return false
}

function isImageFieldKey(key: string): boolean {
  return key.toLowerCase().includes('image')
}

function isResolvedMediaValue(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    Boolean((value as { url?: string | null }).url)
  )
}

function resolveImageFieldValue(
  topValue: unknown,
  blockValue: unknown,
  preferLegacyTopLevel: boolean,
): unknown {
  const topResolved = isResolvedMediaValue(topValue)
  const blockResolved = isResolvedMediaValue(blockValue)
  if (topResolved) return topValue
  if (blockResolved) return blockValue
  if (preferLegacyTopLevel && isMeaningfulWorkshopValue(topValue)) return topValue
  return isMeaningfulWorkshopValue(blockValue) ? blockValue : topValue
}

function experienceCardsHaveImages(value: unknown): boolean {
  if (!Array.isArray(value)) return false
  return value.some((card) => {
    if (!card || typeof card !== 'object') return false
    return isMeaningfulWorkshopValue((card as { image?: unknown }).image)
  })
}

/** Merge block fields over legacy top-level fields only when the block has real content. */
function mergeWorkshopSectionFields(
  detailRaw: Record<string, unknown>,
  block: Record<string, unknown>,
  preferLegacyTopLevel = false,
): Record<string, unknown> {
  const merged: Record<string, unknown> = {}
  const skipKeys = new Set(['blockType', 'enabled', 'id'])

  for (const [key, topValue] of Object.entries(detailRaw)) {
    if (skipKeys.has(key)) continue
    merged[key] = topValue
  }

  for (const [key, blockValue] of Object.entries(block)) {
    if (skipKeys.has(key)) continue
    const topValue = merged[key]

    // Prefer fully populated media (url) over bare IDs or stale block defaults.
    if (isImageFieldKey(key)) {
      merged[key] = resolveImageFieldValue(topValue, blockValue, preferLegacyTopLevel)
      continue
    }

    if (key === 'experienceCards') {
      const topHasImages = experienceCardsHaveImages(topValue)
      const blockHasImages = experienceCardsHaveImages(blockValue)
      if (preferLegacyTopLevel && topHasImages) {
        merged[key] = topValue
      } else if (topHasImages && !blockHasImages) {
        merged[key] = topValue
      } else if (blockHasImages) {
        merged[key] = blockValue
      } else {
        merged[key] = isMeaningfulWorkshopValue(blockValue) ? blockValue : topValue
      }
      continue
    }

    if (preferLegacyTopLevel && isMeaningfulWorkshopValue(topValue)) {
      merged[key] = topValue
    } else {
      merged[key] = isMeaningfulWorkshopValue(blockValue) ? blockValue : topValue
    }
  }

  return merged
}
