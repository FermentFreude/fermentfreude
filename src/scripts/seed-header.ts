/**
 * Seed the Header global in DE and EN using the same array IDs across locales.
 * Simple flat dropdown structure (no nested submenus).
 * Run: pnpm seed header
 */
import type { Header } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

type HeaderNavItem = NonNullable<Header['navItems']>[number]

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
        isSmall: false,
      },
      {
        label: 'Lakto Gemüse',
        href: '/workshops/lakto-gemuese',
        isSmall: true,
      },
      {
        label: 'Tempeh',
        href: '/workshops/tempeh',
        isSmall: true,
      },
      {
        label: 'Kombucha',
        href: '/workshops/kombucha',
        isSmall: true,
      },
      {
        label: 'Online Kurse',
        href: '/courses',
        description: 'Demnächst verfügbar',
        isSmall: false,
      },
      {
        label: 'Workshop Gutschein',
        href: '/shop',
        isSmall: false,
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
] satisfies Array<Partial<HeaderNavItem>>

const enDropdownRemap: Record<number, string[]> = {
  1: ['All Workshops', 'Lacto Vegetables', 'Tempeh', 'Kombucha', 'Online Courses', 'Gift Voucher'],
  4: ['About Us', 'Fermentation', 'Contact'],
}

const enDescriptions: Record<number, Record<number, string>> = {
  1: {
    0: 'Browse all in-person workshops',
    4: 'Coming soon',
  },
  4: {
    0: 'Our Team & Mission',
    1: 'What is Fermentation?',
    2: 'Get in touch',
  },
}

function buildEnglishNav(savedNavItems: HeaderNavItem[]): HeaderNavItem[] {
  return savedNavItems.map((navItem, navIndex) => {
    const base: HeaderNavItem = {
      id: navItem.id,
      link: {
        ...navItem.link,
        label:
          navIndex === 1
            ? 'Workshops'
            : navIndex === 2
              ? 'Shop'
              : navIndex === 3
                ? 'For Chefs'
                : navIndex === 4
                  ? 'About Us'
                  : 'Home',
      },
    }

    // Remap dropdown items for Workshops and About
    if (navIndex === 1 || navIndex === 4) {
      const dropdownItems = navItem.dropdownItems || []
      const enLabels = enDropdownRemap[navIndex] || []

      base.dropdownItems = dropdownItems.map((item, itemIndex) => ({
        id: item.id,
        label: enLabels[itemIndex] || item.label,
        href: item.href,
        description: enDescriptions[navIndex]?.[itemIndex] || item.description || undefined,
        isSmall: item.isSmall ?? false,
      }))
    }

    return base
  })
}

async function seedHeader() {
  const payload = await getPayload({ config })

  payload.logger.info('📝 Seeding Header → DE (German)...')

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

  payload.logger.info('✓ DE saved. Reading back IDs...')

  const freshHeader = (await payload.findGlobal({
    slug: 'header',
    locale: 'de',
    depth: 0,
  })) as Header

  const savedNavItems = freshHeader.navItems || []

  payload.logger.info('📝 Seeding Header → EN (English) using same IDs...')

  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    context: ctx,
    data: {
      announcementBar: {
        enabled: true,
        text: 'We have digital workshops too, take a look',
        link: '/workshops',
      },
      navItems: buildEnglishNav(savedNavItems),
    },
  })

  payload.logger.info('✓ EN saved.')
  payload.logger.info('')
  payload.logger.info('✅ Header seeded successfully!')
  payload.logger.info('   • DE (German) - German labels & descriptions')
  payload.logger.info('   • EN (English) - English labels & descriptions')
  payload.logger.info('   • Both locales use the same structure')
  payload.logger.info('')
  payload.logger.info('🎯 Next: Edit at /admin → Header (toggle DE/EN in top-right)')

  process.exit(0)
}

seedHeader().catch((err) => {
  console.error('❌ Failed to seed header:', err)
  process.exit(1)
})
