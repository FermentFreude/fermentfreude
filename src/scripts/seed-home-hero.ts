/**
 * Seed the Home page with the heroSlider hero.
 * Creates a new page if none exists, otherwise updates the existing one.
 * Seeds both DE (default) and EN locales.
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-home-hero.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

async function seedHomeHero() {
  const payload = await getPayload({ config })

  // ---------- Check if home page already exists ----------
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })

  const heroDE = {
    type: 'heroSlider' as const,
    showWordmark: true,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Lerne mit uns',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Kreiere deinen eigenen Geschmack zu Hause',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter. Durch Workshops, Produkte und Bildung machen wir Fermentation zugänglich und genussvoll.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          label: 'Mehr entdecken',
          url: '/about',
          appearance: 'default' as const,
        },
      },
    ],
    socialLinks: [
      { platform: 'facebook' as const, url: 'https://facebook.com/fermentfreude' },
      { platform: 'twitter' as const, url: 'https://twitter.com/fermentfreude' },
      { platform: 'pinterest' as const, url: 'https://pinterest.com/fermentfreude' },
      { platform: 'youtube' as const, url: 'https://youtube.com/@fermentfreude' },
    ],
  }

  const heroEN = {
    type: 'heroSlider' as const,
    showWordmark: true,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Learn with us',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Create your own flavour at home',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    },
    links: [
      {
        link: {
          type: 'custom' as const,
          label: 'Discover More',
          url: '/about',
          appearance: 'default' as const,
        },
      },
    ],
    socialLinks: [
      { platform: 'facebook' as const, url: 'https://facebook.com/fermentfreude' },
      { platform: 'twitter' as const, url: 'https://twitter.com/fermentfreude' },
      { platform: 'pinterest' as const, url: 'https://pinterest.com/fermentfreude' },
      { platform: 'youtube' as const, url: 'https://youtube.com/@fermentfreude' },
    ],
  }

  if (existing.docs.length > 0) {
    const homeId = existing.docs[0].id
    payload.logger.info(`Home page found (id: ${homeId}). Updating hero...`)

    // 1. Update DE (default locale) — creates array items with auto-generated IDs
    await payload.update({
      collection: 'pages',
      id: homeId,
      locale: 'de',
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: {
        _status: 'published',
        hero: heroDE,
        meta: {
          title: 'FermentFreude — Lerne mit uns, kreiere deinen eigenen Geschmack',
          description: 'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter.',
        },
      },
    })

    // 2. Read back to capture auto-generated IDs for links & socialLinks arrays
    // These arrays are NOT localized, so they share IDs across locales.
    // We MUST reuse the same IDs for EN, otherwise the DE label text gets orphaned.
    const freshDoc = await payload.findByID({
      collection: 'pages',
      id: homeId,
      locale: 'de',
      depth: 0,
    })

    const freshHero = (freshDoc as any).hero || {}
    const freshLinks = freshHero.links || []
    const freshSocialLinks = freshHero.socialLinks || []

    // 3. Inject IDs from DE into EN hero data
    const heroEN_withIds = {
      ...heroEN,
      links: heroEN.links.map((l: any, i: number) => ({
        ...l,
        id: freshLinks[i]?.id,
      })),
      socialLinks: heroEN.socialLinks.map((s: any, i: number) => ({
        ...s,
        id: freshSocialLinks[i]?.id,
      })),
    }

    // 4. Update EN locale with same IDs
    await payload.update({
      collection: 'pages',
      id: homeId,
      locale: 'en',
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: {
        _status: 'published',
        hero: heroEN_withIds,
        meta: {
          title: 'FermentFreude — Learn with us, create your own flavour at home',
          description: 'We create fermented foods and share the knowledge behind them.',
        },
      },
    })

    payload.logger.info('✅ Home page hero updated (DE + EN, reusing array IDs).')
  } else {
    payload.logger.info('No home page found. Creating one...')

    // 1. Create with DE (default locale) — creates array items with auto-generated IDs
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        hero: heroDE,
        layout: [],
        meta: {
          title: 'FermentFreude — Lerne mit uns, kreiere deinen eigenen Geschmack',
          description: 'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter.',
        },
      },
    })

    // 2. Read back to capture auto-generated IDs for links & socialLinks arrays
    const freshDoc = await payload.findByID({
      collection: 'pages',
      id: created.id,
      locale: 'de',
      depth: 0,
    })

    const freshHero = (freshDoc as any).hero || {}
    const freshLinks = freshHero.links || []
    const freshSocialLinks = freshHero.socialLinks || []

    // 3. Inject IDs from DE into EN hero data
    const heroEN_withIds = {
      ...heroEN,
      links: heroEN.links.map((l: any, i: number) => ({
        ...l,
        id: freshLinks[i]?.id,
      })),
      socialLinks: heroEN.socialLinks.map((s: any, i: number) => ({
        ...s,
        id: freshSocialLinks[i]?.id,
      })),
    }

    // 4. Seed EN locale with same IDs
    await payload.update({
      collection: 'pages',
      id: created.id,
      locale: 'en',
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
      data: {
        title: 'Home',
        hero: heroEN_withIds,
        meta: {
          title: 'FermentFreude — Learn with us, create your own flavour at home',
          description: 'We create fermented foods and share the knowledge behind them.',
        },
      },
    })

    payload.logger.info(`✅ Home page created (id: ${created.id}) with hero (DE + EN, reusing array IDs).`)
  }

  payload.logger.info('Done. Exiting.')
  process.exit(0)
}

seedHomeHero().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
