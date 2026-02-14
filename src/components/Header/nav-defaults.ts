/**
 * Hardcoded fallback nav items + dropdown sub-items.
 * These render immediately and can be overridden by CMS editors.
 */

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
}

export interface DefaultNavItem {
  label: string
  url: string
  dropdownKey?: string
  dropdownItems?: DropdownItem[]
}

/** Default nav items — order: Home, About, Chefs, Shop, Workshops */
export const defaultNavItems: DefaultNavItem[] = [
  { label: 'Home', url: '/' },
  {
    label: 'About',
    url: '/about',
    dropdownKey: 'about',
    dropdownItems: [
      { label: 'About Us', href: '/about', description: 'Our Team & Mission' },
      { label: 'Fermentation', href: '/fermentation', description: 'What is Fermentation?' },
      { label: 'Contact', href: '/contact', description: 'Get in touch' },
    ],
  },
  { label: 'Chefs', url: '/gastronomy' },
  { label: 'Shop', url: '/shop' },
  {
    label: 'Workshops',
    url: '/workshops',
    dropdownKey: 'workshops',
    dropdownItems: [
      {
        label: 'Lacto Vegetables',
        href: '/workshops/lakto-gemuese',
        description: 'Fermented vegetable workshops',
      },
      { label: 'Tempeh', href: '/workshops/tempeh', description: 'Learn to make tempeh' },
      { label: 'Kombucha', href: '/workshops/kombucha', description: 'Learn to brew kombucha' },
      {
        label: 'Gift Voucher',
        href: '/workshops/voucher',
        description: 'Give a workshop voucher',
      },
    ],
  },
]

/** Default dropdown lookup keyed by identifier */
export const defaultDropdowns: Record<string, DropdownItem[]> = {}
for (const item of defaultNavItems) {
  if (item.dropdownKey && item.dropdownItems) {
    defaultDropdowns[item.dropdownKey] = item.dropdownItems
  }
}

/** Match a CMS nav item to its default dropdown key */
export function getDefaultDropdownKey(label?: string | null, url?: string | null): string | null {
  const l = label?.toLowerCase()
  if (l === 'workshops' || url === '/workshops') return 'workshops'
  if (
    l === 'about us' ||
    l === 'about' ||
    l === 'über uns' ||
    l === 'fermentation' ||
    l === 'contact' ||
    l === 'kontakt' ||
    url === '/about' ||
    url === '/fermentation' ||
    url === '/contact'
  )
    return 'about'
  return null
}
