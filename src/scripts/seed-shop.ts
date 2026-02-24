/**
 * Shop page seed — Shop global (hero, product section, gift, featured, workshop CTA).
 *
 * Strategy:
 *   1. Upload images sequentially (MongoDB M0 = no transactions)
 *   2. Save DE locale first
 *   3. Read back to capture auto-generated array IDs
 *   4. Save EN locale reusing those exact IDs
 *
 * Run: pnpm seed shop
 * Or: set -a && source .env && set +a && npx tsx src/scripts/seed-shop.ts
 */

import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, skipAutoTranslate: true }

async function seedShop() {
  const payload = await getPayload({ config })

  // Clean up stale shop media (avoid duplicates on re-run)
  for (const alt of ['Shop hero', 'Workshop CTA – fermentation', 'Featured – Kombucha', 'Featured – Lakto', 'Featured – Tempeh']) {
    await payload
      .delete({
        collection: 'media',
        where: { alt: { contains: alt } },
        context: { skipAutoTranslate: true },
      })
      .catch(() => {})
  }

  const heroDir = path.resolve(process.cwd(), 'seed-assets/media/hero')
  const workshopsDir = path.resolve(process.cwd(), 'seed-assets/media/workshops')
  const imagesDir = path.resolve(process.cwd(), 'seed-assets/images')

  // ── Upload images (reuse or create) ───────────────────────────────────────
  let heroImageId: string | null = null
  let workshopCtaImageId: string | null = null
  let featuredImage1Id: string | null = null
  let featuredImage2Id: string | null = null
  let featuredImage3Id: string | null = null

  if (fs.existsSync(path.join(heroDir, 'hero-slide-1.png'))) {
    const heroMedia = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Shop hero – fermented jars and products background' },
      file: await optimizedFile(path.join(heroDir, 'hero-slide-1.png'), IMAGE_PRESETS.hero),
    })
    heroImageId = String(heroMedia.id)
  }

  if (fs.existsSync(path.join(imagesDir, 'Banner.png'))) {
    const workshopMedia = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Workshop CTA – fermentation vats industrial scene' },
      file: await optimizedFile(path.join(imagesDir, 'Banner.png'), IMAGE_PRESETS.hero),
    })
    workshopCtaImageId = String(workshopMedia.id)
  }

  if (fs.existsSync(path.join(workshopsDir, 'kombucha.png'))) {
    const f1 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Featured – Kombucha workshop' },
      file: await optimizedFile(path.join(workshopsDir, 'kombucha.png'), IMAGE_PRESETS.card),
    })
    featuredImage1Id = String(f1.id)
  }
  if (fs.existsSync(path.join(workshopsDir, 'lakto.png'))) {
    const f2 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Featured – Lakto fermented vegetables' },
      file: await optimizedFile(path.join(workshopsDir, 'lakto.png'), IMAGE_PRESETS.card),
    })
    featuredImage2Id = String(f2.id)
  }
  if (fs.existsSync(path.join(workshopsDir, 'tempeh.png'))) {
    const f3 = await payload.create({
      collection: 'media',
      context: ctx,
      data: { alt: 'Featured – Tempeh workshop' },
      file: await optimizedFile(path.join(workshopsDir, 'tempeh.png'), IMAGE_PRESETS.card),
    })
    featuredImage3Id = String(f3.id)
  }

  // ── DE: Save first (Payload generates IDs for featuredItems) ─────────────
  await payload.updateGlobal({
    slug: 'shop',
    locale: 'de',
    data: {
      heroTitleLine1: 'Entdecke',
      heroTitleLine2: 'EINZIGARTIGE Aromen.',
      heroTitleHighlight: 'EINZIGARTIGE',
      heroDescription:
        'Erkunde unsere handgefertigten Fermente und entdecke Aromen, die du noch nie gekannt hast.',
      heroBackgroundImage: heroImageId,
      heroCtaPrimaryLabel: 'Jetzt entdecken',
      heroCtaPrimaryUrl: '#products',
      heroCtaSecondaryLabel: 'Mehr erfahren',
      heroCtaSecondaryUrl: '/workshops',

      productSectionHeading: 'Entdecke EINZIGARTIG.',
      productSectionSubheading: 'AROMEN',
      productSectionIntro:
        'Tauche ein in eine Welt unglaublicher handgefertigter Fermente. Unsere sorgfältig kuratierte Kollektion bietet eine Vielzahl guter und gesunder Produkte für jeden Anlass.',
      viewAllButtonLabel: 'Alle Produkte anzeigen',
      viewAllButtonUrl: '/shop',
      loadMoreLabel: 'Mehr laden',
      addToCartLabel: 'In den Warenkorb',

      giftHeading: 'Verschenke ein besonderes Geschmackserlebnis',
      giftDescription:
        'Teile die Freude der Fermentation mit jemand Besonderem. Unsere Gutscheine ermöglichen die freie Wahl von Workshop oder Produkt.',
      giftButtonLabel: 'Mehr erfahren',
      giftButtonUrl: '/voucher',

      featuredHeading: 'Lerne EINZIGARTIGE Aromen',
      featuredViewAllLabel: 'Alle anzeigen',
      featuredViewAllUrl: '/workshops',
      featuredItems: [
        {
          image: featuredImage1Id,
          title: 'Kombucha Geschichte',
          description: 'Erfahre mehr über die Ursprünge und Tradition des Kombucha.',
          readMoreLabel: 'Mehr lesen',
          url: '/workshops',
        },
        {
          image: featuredImage2Id,
          title: 'Kombucha Chemie',
          description: 'Verstehe die Wissenschaft hinter der Fermentation.',
          readMoreLabel: 'Mehr lesen',
          url: '/workshops',
        },
        {
          image: featuredImage3Id,
          title: 'Lakto-Fermentation',
          description: 'Lerne die Kunst der fermentierten Gemüse.',
          readMoreLabel: 'Mehr lesen',
          url: '/workshops',
        },
      ],

      workshopCtaHeading: 'Lerne Fermentation jederzeit und überall.',
      workshopCtaDescription:
        'Unsere Online-Kurse ermöglichen dir, in deinem eigenen Tempo zu lernen. Entdecke die Kunst der Fermentation bequem von zu Hause.',
      workshopCtaBackgroundImage: workshopCtaImageId,
      workshopCtaButtonLabel: 'Jetzt lernen',
      workshopCtaButtonUrl: '/workshops',
    },
    context: ctx,
  })

  // ── Read back DE to capture generated IDs ─────────────────────────────────
  const shopDE = await payload.findGlobal({
    slug: 'shop',
    locale: 'de',
    depth: 0,
  })

  const featuredItemsWithIds = (shopDE?.featuredItems ?? []).map((item: { id?: string }) => ({
    id: item.id,
  }))

  // ── EN: Save reusing same IDs ─────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'shop',
    locale: 'en',
    data: {
      heroTitleLine1: 'Discover',
      heroTitleLine2: 'UNIQUE Flavours.',
      heroTitleHighlight: 'UNIQUE',
      heroDescription:
        'Explore our handcrafted ferments and discover flavours you never knew existed.',
      heroBackgroundImage: heroImageId,
      heroCtaPrimaryLabel: 'Explore Now',
      heroCtaPrimaryUrl: '#products',
      heroCtaSecondaryLabel: 'Learn More',
      heroCtaSecondaryUrl: '/workshops',

      productSectionHeading: 'Discover UNIQUE.',
      productSectionSubheading: 'FLAVOURS',
      productSectionIntro:
        'Dive into a world of incredible handcrafted Ferments. Our carefully curated collection features an array of good and healthy products for every occasion.',
      viewAllButtonLabel: 'View All Products',
      viewAllButtonUrl: '/shop',
      loadMoreLabel: 'Load More',
      addToCartLabel: 'Add to cart',

      giftHeading: 'Gift a special tasty experience',
      giftDescription:
        'Share the joy of fermentation with someone special. Our gift vouchers let them choose their own workshop or product.',
      giftButtonLabel: 'Find Out More',
      giftButtonUrl: '/voucher',

      featuredHeading: 'Learn UNIQUE Flavours',
      featuredViewAllLabel: 'View all',
      featuredViewAllUrl: '/workshops',
      featuredItems: [
        {
          id: featuredItemsWithIds[0]?.id,
          image: featuredImage1Id,
          title: 'Kombucha History',
          description: 'Learn about the origins and tradition of Kombucha.',
          readMoreLabel: 'Read More',
          url: '/workshops',
        },
        {
          id: featuredItemsWithIds[1]?.id,
          image: featuredImage2Id,
          title: 'Kombucha Chemistry',
          description: 'Understand the science behind fermentation.',
          readMoreLabel: 'Read More',
          url: '/workshops',
        },
        {
          id: featuredItemsWithIds[2]?.id,
          image: featuredImage3Id,
          title: 'Lakto Fermentation',
          description: 'Learn the art of fermented vegetables.',
          readMoreLabel: 'Read More',
          url: '/workshops',
        },
      ],

      workshopCtaHeading: 'Learn Fermentation Anytime, Anywhere.',
      workshopCtaDescription:
        'Our online courses let you learn at your own pace. Discover the art of fermentation from the comfort of your home.',
      workshopCtaBackgroundImage: workshopCtaImageId,
      workshopCtaButtonLabel: 'Start Learning',
      workshopCtaButtonUrl: '/workshops',
    },
    context: ctx,
  })

  payload.logger.info('✓ Shop global seeded (DE + EN)!')
  process.exit(0)
}

seedShop().catch((err) => {
  console.error(err)
  process.exit(1)
})
