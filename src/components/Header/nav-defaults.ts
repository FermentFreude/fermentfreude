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
}

export interface DefaultNavItem {
  label: string
  url: string
  dropdownKey?: string
  dropdownItems?: DropdownItem[]
}

/** Default nav items matching the Figma nav order */
export const defaultNavItems: DefaultNavItem[] = [
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
      },
      {
        label: 'Gift Voucher',
        href: '/shop',
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
  { label: 'Contact', url: '/contact' },
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
    l === 'fermentation' ||
    url === '/about' ||
    url === '/fermentation'
  )
    return 'about'
  return null
}
