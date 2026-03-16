/**
 * Seed the Header global in DE and EN using the same array IDs across locales.
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-header.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import type { Header } from '@/payload-types'

type HeaderNavItem = NonNullable<Header['navItems']>[number]
type HeaderDropdownItem = NonNullable<HeaderNavItem['dropdownItems']>[number]
type HeaderSubmenuItem = NonNullable<HeaderDropdownItem['submenu']>[number]

const ctx = { skipRevalidate: true, skipAutoTranslate: true }

const deNavItems = [
  {
    link: { type: 'custom', label: 'Home', url: '/' },
  },
  {
    link: { type: 'custom', label: 'Workshops', url: '/workshops' },
    dropdownItems: [
      {
        label: 'Alle Workshops',
        href: '/workshops',
        description: 'Alle Präsenz-Workshops entdecken',
        submenu: [
          { label: 'Lakto Gemüse', href: '/workshops/lakto-gemuese' },
          { label: 'Tempeh', href: '/workshops/tempeh' },
          { label: 'Kombucha', href: '/workshops/kombucha' },
        ],
      },
      {
        label: 'Online Kurse',
        href: '/courses',
        description: 'Digitale Lernangebote entdecken',
        submenu: [{ label: 'Fermentation Basics', href: '/courses/basic-fermentation' }],
      },
      {
        label: 'Workshop Gutschein',
        href: '/workshops/voucher',
        description: 'Fermentationsfreude verschenken',
        isDivider: true,
      },
    ],
  },
  {
    link: { type: 'custom', label: 'Shop', url: '/shop' },
  },
  {
    link: { type: 'custom', label: 'Für Köche', url: '/gastronomy' },
  },
  {
    link: { type: 'custom', label: 'Über uns', url: '/about' },
    dropdownItems: [
      { label: 'Über uns', href: '/about', description: 'Unser Team & unsere Mission' },
      { label: 'Fermentation', href: '/fermentation', description: 'Was ist Fermentation?' },
      { label: 'Kontakt', href: '/contact', description: 'Schreib uns' },
    ],
  },
  {
    link: { type: 'custom', label: 'Kontakt', url: '/contact' },
  },
] satisfies Array<Partial<HeaderNavItem>>

const enLabels = {
  announcementText: 'We have digital workshops too, take a look',
  navItems: ['Home', 'Workshops', 'Shop', 'For Chefs', 'About Us', 'Contact'],
  workshops: {
    all: { label: 'All Workshops', description: 'Browse all in-person workshops' },
    lacto: 'Lacto Vegetables',
    tempeh: 'Tempeh',
    kombucha: 'Kombucha',
    online: { label: 'Online Courses', description: 'Preview digital learning options' },
    basics: 'Fermentation Basics',
    voucher: { label: 'Gift Voucher', description: 'Give a workshop voucher' },
  },
  about: {
    about: { label: 'About Us', description: 'Our Team & Mission' },
    fermentation: { label: 'Fermentation', description: 'What is Fermentation?' },
    contact: { label: 'Contact', description: 'Get in touch' },
  },
} as const

function mergeSubmenuEN(
  source: HeaderSubmenuItem[] | null | undefined,
  labels: readonly string[],
): HeaderSubmenuItem[] {
  return (source || []).map((item, index) => ({
    id: item.id,
    href: item.href,
    label: labels[index] || item.label,
  }))
}

function mergeDropdownItemsEN(source: HeaderDropdownItem[] | null | undefined): HeaderDropdownItem[] {
  const items = source || []

  return items.map((item, index) => {
    if (index === 0) {
      return {
        id: item.id,
        isDivider: item.isDivider ?? false,
        href: item.href,
        label: enLabels.workshops.all.label,
        description: enLabels.workshops.all.description,
        submenu: mergeSubmenuEN(item.submenu, [
          enLabels.workshops.lacto,
          enLabels.workshops.tempeh,
          enLabels.workshops.kombucha,
        ]),
      }
    }

    if (index === 1) {
      return {
        id: item.id,
        isDivider: item.isDivider ?? false,
        href: item.href,
        label: enLabels.workshops.online.label,
        description: enLabels.workshops.online.description,
        submenu: mergeSubmenuEN(item.submenu, [enLabels.workshops.basics]),
      }
    }

    return {
      id: item.id,
      isDivider: item.isDivider ?? false,
      href: item.href,
      label: enLabels.workshops.voucher.label,
      description: enLabels.workshops.voucher.description,
    }
  })
}

function buildEnglishNav(savedNavItems: HeaderNavItem[]): HeaderNavItem[] {
  return savedNavItems.map((navItem, index) => {
    const base: HeaderNavItem = {
      id: navItem.id,
      link: {
        ...navItem.link,
        label: enLabels.navItems[index] || navItem.link.label,
      },
    }

    if (index === 1) {
      base.dropdownItems = mergeDropdownItemsEN(navItem.dropdownItems)
    }

    if (index === 4) {
      const aboutItems = navItem.dropdownItems || []
      base.dropdownItems = aboutItems.map((item, aboutIndex) => {
        const englishAbout = [
          enLabels.about.about,
          enLabels.about.fermentation,
          enLabels.about.contact,
        ][aboutIndex]

        return {
          id: item.id,
          isDivider: item.isDivider ?? false,
          href: item.href,
          label: englishAbout?.label || item.label,
          description: englishAbout?.description || item.description,
        }
      })
    }

    return base
  })
}

async function seedHeader() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Header → DE...')

  await payload.updateGlobal({
    slug: 'header',
    locale: 'de',
    context: ctx,
    data: {
      announcementBar: {
        enabled: true,
        text: 'Wir haben auch digitale Workshops, schau mal rein',
        link: '/workshops',
      },
      navItems: deNavItems,
    },
  })

  payload.logger.info('Reading back Header → DE IDs...')

  const freshHeader = (await payload.findGlobal({
    slug: 'header',
    locale: 'de',
    depth: 0,
  })) as Header

  const savedNavItems = freshHeader.navItems || []

  payload.logger.info('Seeding Header → EN...')

  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    context: ctx,
    data: {
      announcementBar: {
        enabled: true,
        text: enLabels.announcementText,
        link: '/workshops',
      },
      navItems: buildEnglishNav(savedNavItems),
    },
  })

  payload.logger.info('✓ Header seeded for DE + EN')
  payload.logger.info('Editors can now manage both languages in /admin → Header.')

  process.exit(0)
}

seedHeader().catch((err) => {
  console.error('Failed to seed header:', err)
  process.exit(1)
})
