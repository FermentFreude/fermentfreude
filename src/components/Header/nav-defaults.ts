/**
 * Hardcoded fallback nav items + dropdown sub-items.
 * These render immediately and can be overridden by CMS editors.
 */

export interface DropdownItem {
  label: string
  href: string
  description?: string | null
  isDivider?: boolean | null
  submenu?: DropdownItem[]
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
        label: 'View All Workshops',
        href: '/workshops',
        submenu: [
          { label: 'Lacto Vegetables', href: '/workshops/lakto-gemuese' },
          { label: 'Tempeh', href: '/workshops/tempeh' },
          { label: 'Kombucha', href: '/workshops/kombucha' },
        ],
      },
      {
        label: 'Upcoming Online Courses',
        href: '/courses',
        submenu: [{ label: 'Fermentation Basics', href: '/courses' }],
      },
      {
        label: 'Workshop Vouchers',
        href: '/workshops/voucher',
      },
    ],
  },
  {
    label: 'Online Courses',
    url: '/courses',
    dropdownKey: 'onlineCourses',
    dropdownItems: [
      {
        label: 'Fermentation Basics',
        href: '/courses',
        description: 'Learn fermentation fundamentals online',
      },
    ],
  },
  { label: 'Produkte', url: '/shop' },
  { label: 'B2B', url: '/gastronomy' },
  {
    label: 'Über uns',
    url: '/about',
    dropdownKey: 'about',
    dropdownItems: [
      { label: 'Über uns', href: '/about', description: 'Our Team & Mission' },
      { label: 'Fermentation', href: '/fermentation', description: 'What is Fermentation?' },
    ],
  },
  { label: 'Kontakt', url: '/contact' },
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
  if (l === 'online courses' || (url === '/courses' && l?.includes('online')))
    return 'onlineCourses'
  if (
    l === 'about us' ||
    l === 'about' ||
    l === 'über uns' ||
    l === 'fermentation' ||
    url === '/about' ||
    url === '/fermentation'
  )
    return 'about'
  return null
}
