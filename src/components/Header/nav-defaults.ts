/**
 * Hardcoded fallback nav items + dropdown sub-items.
 * These render immediately and can be overridden by CMS editors.
 * Flat structure — no nested submenus. Simple and reliable.
 */

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
  isSmall?: boolean | null
  disabled?: boolean | null
}

export interface DefaultNavItem {
  label: string
  url: string
  dropdownKey?: string
  dropdownItems?: DropdownItem[]
}

/** English defaults (when locale is EN and CMS nav is empty) */
export const defaultNavItemsEn: DefaultNavItem[] = [
  { label: 'Home', url: '/' },
  {
    label: 'Workshops',
    url: '/workshops',
    dropdownKey: 'workshops',
    dropdownItems: [
      {
        label: 'All Workshops',
        href: '/workshops',
        description: 'Browse all in-person workshops',
      },
      { label: 'Lacto Vegetables', href: '/workshops/lakto-gemuese', isSmall: true },
      { label: 'Tempeh', href: '/workshops/tempeh', isSmall: true },
      { label: 'Kombucha', href: '/workshops/kombucha', isSmall: true },
      {
        label: 'Online Courses',
        href: '/courses',
        description: 'Coming soon',
        disabled: true,
      },
      {
        label: 'Gift Voucher',
        href: '/workshops/voucher',
        description: 'Workshop experience vouchers',
      },
    ],
  },
  { label: 'Shop', url: '/shop' },
  { label: 'For Chefs', url: '/gastronomy' },
  {
    label: 'About Us',
    url: '/about',
    dropdownKey: 'about',
    dropdownItems: [
      { label: 'About Us', href: '/about', description: 'Our Team & Mission' },
      { label: 'Fermentation', href: '/fermentation', description: 'What is Fermentation?' },
      { label: 'Contact', href: '/contact', description: 'Get in touch' },
    ],
  },
]

/** German defaults (when locale is DE and CMS nav is empty) */
export const defaultNavItemsDe: DefaultNavItem[] = [
  { label: 'Startseite', url: '/' },
  {
    label: 'Workshops',
    url: '/workshops',
    dropdownKey: 'workshops',
    dropdownItems: [
      {
        label: 'Alle Workshops',
        href: '/workshops',
        description: 'Alle Präsenz-Workshops entdecken',
      },
      { label: 'Lakto-Gemüse', href: '/workshops/lakto-gemuese', isSmall: true },
      { label: 'Tempeh', href: '/workshops/tempeh', isSmall: true },
      { label: 'Kombucha', href: '/workshops/kombucha', isSmall: true },
      {
        label: 'Online-Kurse',
        href: '/courses',
        description: 'Demnächst',
        disabled: true,
      },
      {
        label: 'Gutschein',
        href: '/workshops/voucher',
        description: 'Workshop-Gutscheine',
      },
    ],
  },
  { label: 'Shop', url: '/shop' },
  { label: 'Für Gastronomen', url: '/gastronomy' },
  {
    label: 'Über uns',
    url: '/about',
    dropdownKey: 'about',
    dropdownItems: [
      { label: 'Über uns', href: '/about', description: 'Team & Mission' },
      { label: 'Fermentation', href: '/fermentation', description: 'Was ist Fermentation?' },
      { label: 'Kontakt', href: '/contact', description: 'Kontakt aufnehmen' },
    ],
  },
]

export function getDefaultNavItems(locale: 'de' | 'en'): DefaultNavItem[] {
  return locale === 'de' ? defaultNavItemsDe : defaultNavItemsEn
}

export function getDefaultDropdowns(locale: 'de' | 'en'): Record<string, DropdownItem[]> {
  const map: Record<string, DropdownItem[]> = {}
  for (const item of getDefaultNavItems(locale)) {
    if (item.dropdownKey && item.dropdownItems) {
      map[item.dropdownKey] = item.dropdownItems
    }
  }
  return map
}

/** @deprecated Use getDefaultNavItems(locale) */
export const defaultNavItems = defaultNavItemsEn

/** @deprecated Use getDefaultDropdowns(locale) */
export const defaultDropdowns: Record<string, DropdownItem[]> = {}
for (const item of defaultNavItemsEn) {
  if (item.dropdownKey && item.dropdownItems) {
    defaultDropdowns[item.dropdownKey] = item.dropdownItems
  }
}

/** Hrefs marked `disabled` in default nav — applied when CMS omits `disabled`. */
const defaultInactiveHrefs = new Set<string>()
for (const item of defaultNavItemsEn) {
  if (!item.dropdownItems) continue
  for (const d of item.dropdownItems) {
    if (d.disabled) {
      defaultInactiveHrefs.add(normalizeNavHref(d.href))
    }
  }
}

function normalizeNavHref(href: string): string {
  const t = href.trim()
  if (!t) return '/'
  if (t.includes('://')) {
    try {
      const pathname = new URL(t).pathname
      return normalizeNavHref(pathname)
    } catch {
      /* ignore invalid absolute URLs */
    }
  }
  const noTrailing = t.replace(/\/+$/, '') || '/'
  return noTrailing
}

/**
 * Whether a dropdown row should render as non-navigable.
 * - `disabled: true` forces inactive.
 * - Hrefs listed as inactive in default nav (e.g. /courses “coming soon”) stay non-clickable
 *   even if CMS has “Inactive” unchecked, so the menu cannot accidentally link there early.
 * - `disabled: false` still makes other rows explicitly clickable.
 */
export function dropdownItemIsInactive(item: { href: string; disabled?: boolean | null }): boolean {
  if (item.disabled === true) return true
  if (defaultInactiveHrefs.has(normalizeNavHref(item.href))) return true
  if (item.disabled === false) return false
  return false
}

/** Match a CMS nav item to its default dropdown key */
export function getDefaultDropdownKey(label?: string | null, url?: string | null): string | null {
  const l = label?.toLowerCase().trim()
  if (l === 'workshops' || url === '/workshops') return 'workshops'
  if (
    l === 'about us' ||
    l === 'über uns' ||
    l === 'about' ||
    l === 'fermentation' ||
    url === '/about' ||
    url === '/fermentation'
  )
    return 'about'
  return null
}
