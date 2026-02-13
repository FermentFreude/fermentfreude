/**
 * One-time script to seed the Header global with all nav items and dropdown sub-items.
 * Seeds both DE (default) and EN locales.
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
    context: { skipRevalidate: true },
    data: {
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
          ],
        },
        {
          link: {
            type: 'custom',
            label: 'Gastronomie',
            url: '/gastronomy',
          },
        },
      ],
    },
  })

  // ----- 2) Seed English locale -----
  payload.logger.info('Seeding Header → EN locale...')

  // For localized fields we need to update each locale separately.
  // The nav item structure (array positions) stays the same — only localized text fields change.
  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    context: { skipRevalidate: true },
    data: {
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
              label: 'Lacto Vegetables',
              href: '/workshops/lakto-gemuese',
              description: 'Fermented vegetable workshops',
            },
            {
              label: 'Tempeh',
              href: '/workshops/tempeh',
              description: 'Learn to make tempeh',
            },
            {
              label: 'Kombucha',
              href: '/workshops/kombucha',
              description: 'Learn to brew kombucha',
            },
            {
              label: 'Gift Voucher',
              href: '/workshops/voucher',
              description: 'Give a workshop voucher',
            },
          ],
        },
        {
          link: {
            type: 'custom',
            label: 'About',
            url: '/about',
          },
          dropdownItems: [
            {
              label: 'About Us',
              href: '/about',
              description: 'Our Team & Mission',
            },
            {
              label: 'Fermentation',
              href: '/fermentation',
              description: 'What is Fermentation?',
            },
          ],
        },
        {
          link: {
            type: 'custom',
            label: 'Gastronomy',
            url: '/gastronomy',
          },
        },
      ],
    },
  })

  payload.logger.info('✓ Header seeded for DE + EN!')
  payload.logger.info('')
  payload.logger.info('Nav items (both locales):')
  payload.logger.info('  • Home → /')
  payload.logger.info('  • Shop → /shop')
  payload.logger.info('  • Workshops → /workshops (4 dropdown sub-items)')
  payload.logger.info('  • Über uns / About → /about (2 dropdown sub-items)')
  payload.logger.info('  • Gastronomie / Gastronomy → /gastronomy')
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
