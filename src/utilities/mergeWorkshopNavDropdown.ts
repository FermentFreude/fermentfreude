import type { DropdownItem } from '@/components/Header/nav-defaults'

export type NavWorkshopItem = {
  label: string
  href: string
}

function normalizeHref(href: string): string {
  const trimmed = href.trim().replace(/\/+$/, '') || '/'
  return trimmed === '/voucher' ? '/workshops/voucher' : trimmed
}

/** Fixed rows that stay when syncing workshop links from the database. */
function isFixedWorkshopsDropdownItem(item: DropdownItem): boolean {
  const href = normalizeHref(item.href)
  return (
    href === '/workshops' ||
    href === '/workshops/voucher' ||
    href === '/courses' ||
    item.disabled === true
  )
}

/** Per-workshop links — replaced by active workshops from the DB. */
function isWorkshopTypeLink(item: DropdownItem): boolean {
  const href = normalizeHref(item.href)
  return href.startsWith('/workshops/') && !isFixedWorkshopsDropdownItem(item)
}

/**
 * Merge active workshops into the Workshops nav dropdown.
 * Keeps "All Workshops", voucher, online courses; replaces individual workshop links.
 */
export function mergeWorkshopNavDropdown(
  items: DropdownItem[],
  dynamicWorkshops: NavWorkshopItem[],
): DropdownItem[] {
  if (dynamicWorkshops.length === 0) return items

  const fixed = items.filter(isFixedWorkshopsDropdownItem)
  const dynamicItems: DropdownItem[] = dynamicWorkshops.map((w) => ({
    label: w.label,
    href: normalizeHref(w.href),
    isSmall: true,
  }))

  const allWorkshopsIdx = fixed.findIndex((i) => normalizeHref(i.href) === '/workshops')
  if (allWorkshopsIdx >= 0) {
    return [
      ...fixed.slice(0, allWorkshopsIdx + 1),
      ...dynamicItems,
      ...fixed.slice(allWorkshopsIdx + 1),
    ]
  }

  // No "All Workshops" row — prepend dynamics after any leading fixed items
  return [...fixed, ...dynamicItems]
}

/** Apply workshop sync when building a workshops dropdown from CMS or defaults. */
export function withDynamicWorkshopLinks(
  items: DropdownItem[] | null | undefined,
  dynamicWorkshops: NavWorkshopItem[],
  dropdownKey: string | null,
): DropdownItem[] | null {
  if (!items?.length) return items ?? null
  if (dropdownKey !== 'workshops') return items

  const withoutStaleWorkshopLinks = items.filter(
    (item) => isFixedWorkshopsDropdownItem(item) || !isWorkshopTypeLink(item),
  )
  return mergeWorkshopNavDropdown(withoutStaleWorkshopLinks, dynamicWorkshops)
}
