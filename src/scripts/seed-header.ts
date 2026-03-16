/**
 * One-time script to seed the Header global with all nav items and dropdown sub-items.
 * Seeds both DE (default) and EN locales.
 * Nav order: Home, About (dropdown: About Us, Fermentation, Contact), Chefs, Shop, Workshops
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-header.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

async function seedHeader() {
  const payload = await getPayload({ config })

  // ----- 1) Seed German (default locale) -----
  payload.logger.info('Seeding Header → DE (default locale)...')

  await payload.updateGlobal({
    slug: 'header',
    locale: 'de',
    context: { skipRevalidate: true, skipAutoTranslate: true },
    data: {
      announcementBar: {
        enabled: true,
        text: 'Wir haben auch digitale Workshops, schau mal rein',
        link: '/courses',
      },
      navItems: [
        {
          link: {
            type: 'custom',
            label: 'Home',
            url: '/',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Über uns',
            url: '/about',
          },
          dropdownItems: [
            {
              label: 'Über uns',
              href: '/about',
              description: 'Unser Team & Mission',
            },
            {
              label: 'Fermentation',
              href: '/fermentation',
              description: 'Was ist Fermentation?',
            },
            {
              label: 'Kontakt',
              href: '/contact',
              description: 'Schreib uns',
            },
          ],
        },
        {
          link: {
            type: 'custom',
            label: 'Für Köche',
            url: '/gastronomy',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Shop',
            url: '/shop',
          },
        },
        {
          link: {
            type: 'custom',
            label: 'Workshops',
            url: '/workshops',
          },
          dropdownItems: [
            {
              label: 'Alle Workshops',
              href: '/workshops',
              submenu: [
                {
                  label: 'Lakto Gemüse',
                  href: '/workshops/lakto-gemuese',
                },
                {
                  label: 'Tempeh',
                  href: '/workshops/tempeh',
                },
                {
                  label: 'Kombucha',
                  href: '/workshops/kombucha',
                },
              ],
            },
            {
              label: 'Online Kurse',
              href: '/courses',
              submenu: [
                {
                  label: 'Fermentation Basics',
                  href: '/courses/fermentation-basics',
                },
              ],
            },
            {
              label: 'Workshop Vouchers',
              href: '/workshops/voucher',
            },
          ],
        },
      ],
    },
  })

  // ----- 2) Read back to capture auto-generated IDs -----
  payload.logger.info('Reading back Header to capture generated IDs...')

  const freshHeader = (await payload.findGlobal({
    slug: 'header',
    locale: 'de',
    depth: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any

  const freshNavItems = freshHeader.navItems || []

  // EN nav data with labels only (reuse IDs from DE)
  const enLabels = ['Home', 'About', 'Chefs', 'Shop', 'Workshops']
  const enDropdowns: Record<
    number,
    Array<{ label: string; description?: string; submenu?: Array<{ label: string }> }>
  > = {
    1: [
      { label: 'About Us', description: 'Our Team & Mission' },
      { label: 'Fermentation', description: 'What is Fermentation?' },
      { label: 'Contact', description: 'Get in touch' },
    ],
    4: [
      {
        label: 'View All Workshops',
        submenu: [{ label: 'Lacto Vegetables' }, { label: 'Tempeh' }, { label: 'Kombucha' }],
      },
      {
        label: 'Online Courses',
        submenu: [{ label: 'Fermentation Basics' }],
      },
      { label: 'Workshop Vouchers' },
    ],
  }

  // Build EN navItems reusing IDs from DE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enNavItems = freshNavItems.map((navItem: any, idx: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {
      id: navItem.id,
      link: {
        ...navItem.link,
        label: enLabels[idx] || navItem.link?.label,
      },
    }
    if (enDropdowns[idx] && navItem.dropdownItems) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.dropdownItems = navItem.dropdownItems.map((dd: any, ddIdx: number) => {
        const enItem: any = {
          id: dd.id,
          isDivider: dd.isDivider || false,
          href: dd.href,
          label: enDropdowns[idx][ddIdx]?.label || dd.label,
          description: enDropdowns[idx][ddIdx]?.description || dd.description,
        }
        // Handle nested submenu - preserve German IDs and apply English labels
        if (dd.submenu && enDropdowns[idx]?.[ddIdx]?.submenu) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          enItem.submenu = dd.submenu.map((sub: any, subIdx: number) => ({
            id: sub.id, // PRESERVE German submenu item ID
            href: sub.href,
            label: enDropdowns[idx]?.[ddIdx]?.submenu?.[subIdx]?.label || sub.label,
          }))
        }
        return enItem
      })
    }
    return result
  })

  // ----- 3) Seed English locale (reusing IDs) -----
  payload.logger.info('Seeding Header → EN locale (with matching IDs)...')

  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    context: { skipRevalidate: true, skipAutoTranslate: true },
    data: {
      announcementBar: {
        enabled: true,
        text: 'We Have Digital Workshops too, take a look',
        link: '/courses',
      },
      navItems: enNavItems,
    },
  })

  payload.logger.info('✓ Header seeded for DE + EN!')
  payload.logger.info('')
  payload.logger.info('Nav items (both locales):')
  payload.logger.info('  • Home → /')
  payload.logger.info('  • About / Über uns → /about (dropdown: About Us, Fermentation, Contact)')
  payload.logger.info('  • Chefs / Für Köche → /gastronomy')
  payload.logger.info('  • Shop → /shop')
  payload.logger.info('  • Workshops → /workshops (6 dropdown items)')
  payload.logger.info('    ├─ Lakto Gemüse / Lacto Vegetables')
  payload.logger.info('    ├─ Tempeh')
  payload.logger.info('    ├─ Kombucha')
  payload.logger.info('    ├─ View All / Alle Workshops → /workshops')
  payload.logger.info('    ├─ Upcoming Online Courses')
  payload.logger.info('    └─ Workshop Vouchers / Workshop Gutschein')
  payload.logger.info(
    '  • Online Courses / Online Kurse → /courses (dropdown: Fermentation Basics)',
  )
  payload.logger.info('')
  payload.logger.info(
    'Editors can manage both languages from /admin → Header (switch locale in top bar)',
  )

  process.exit(0)
}

seedHeader().catch((err) => {
  console.error('Failed to seed header:', err)
  process.exit(1)
})
