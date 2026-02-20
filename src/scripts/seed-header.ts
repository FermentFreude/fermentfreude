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
        link: '/workshops',
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
              label: 'Lakto Gemüse',
              href: '/workshops/lakto-gemuese',
              description: 'Fermentierte Gemüse-Workshops',
            },
            {
              label: 'Tempeh',
              href: '/workshops/tempeh',
              description: 'Tempeh selber machen',
            },
            {
              label: 'Kombucha',
              href: '/workshops/kombucha',
              description: 'Kombucha brauen lernen',
            },
            {
              label: 'Gutschein',
              href: '/workshops/voucher',
              description: 'Workshop-Gutschein verschenken',
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
  const enDropdowns: Record<number, Array<{ label: string; description: string }>> = {
    1: [
      { label: 'About Us', description: 'Our Team & Mission' },
      { label: 'Fermentation', description: 'What is Fermentation?' },
      { label: 'Contact', description: 'Get in touch' },
    ],
    4: [
      { label: 'Lacto Vegetables', description: 'Fermented vegetable workshops' },
      { label: 'Tempeh', description: 'Learn to make tempeh' },
      { label: 'Kombucha', description: 'Learn to brew kombucha' },
      { label: 'Gift Voucher', description: 'Give a workshop voucher' },
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
      result.dropdownItems = navItem.dropdownItems.map((dd: any, ddIdx: number) => ({
        id: dd.id,
        href: dd.href,
        label: enDropdowns[idx][ddIdx]?.label || dd.label,
        description: enDropdowns[idx][ddIdx]?.description || dd.description,
      }))
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
        link: '/workshops',
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
  payload.logger.info('  • Workshops → /workshops (4 dropdown sub-items)')
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
