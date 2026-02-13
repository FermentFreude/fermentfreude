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
    eyebrow: 'Fermentation für alle',
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
                text: 'Gutes Essen',
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
                text: 'Bessere Gesundheit',
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
                text: 'Echte Freude',
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
                text: 'Wir machen Fermentation zugänglich & freudvoll — für bessere Darmgesundheit durch Geschmack, Bildung und handgemachte Lebensmittel.',
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
          label: 'Shop',
          url: '/shop',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          type: 'custom' as const,
          label: 'Workshops',
          url: '/workshops',
          appearance: 'outline' as const,
        },
      },
    ],
  }

  const heroEN = {
    type: 'heroSlider' as const,
    eyebrow: 'Fermentation for everyone',
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
                text: 'Good Food',
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
                text: 'Better Health',
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
                text: 'Real Joy',
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
                text: 'We make fermentation accessible & joyful — for better gut health through taste, education, and handmade food.',
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
          label: 'Shop',
          url: '/shop',
          appearance: 'default' as const,
        },
      },
      {
        link: {
          type: 'custom' as const,
          label: 'Workshops',
          url: '/workshops',
          appearance: 'outline' as const,
        },
      },
    ],
  }

  if (existing.docs.length > 0) {
    const homeId = existing.docs[0].id
    payload.logger.info(`Home page found (id: ${homeId}). Updating hero...`)

    // Update DE (default locale)
    await payload.update({
      collection: 'pages',
      id: homeId,
      locale: 'de',
      draft: true,
      context: { skipRevalidate: true, skipAutoTranslate: true },
      data: {
        hero: heroDE,
        meta: {
          title: 'FermentFreude — Gutes Essen, Bessere Gesundheit, Echte Freude',
          description: 'FermentFreude — Fermentation zugänglich & freudvoll machen.',
        },
      },
    })

    // Update EN locale
    await payload.update({
      collection: 'pages',
      id: homeId,
      locale: 'en',
      draft: true,
      context: { skipRevalidate: true, skipAutoTranslate: true },
      data: {
        hero: heroEN,
        meta: {
          title: 'FermentFreude — Good Food, Better Health, Real Joy',
          description: 'FermentFreude — Making fermentation accessible & joyful.',
        },
      },
    })

    payload.logger.info('✅ Home page hero updated (DE + EN).')
  } else {
    payload.logger.info('No home page found. Creating one...')

    // Create with DE (default locale)
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      draft: true,
      context: { skipRevalidate: true, skipAutoTranslate: true },
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        hero: heroDE,
        layout: [],
        meta: {
          title: 'FermentFreude — Gutes Essen, Bessere Gesundheit, Echte Freude',
          description: 'FermentFreude — Fermentation zugänglich & freudvoll machen.',
        },
      },
    })

    // Seed EN locale
    await payload.update({
      collection: 'pages',
      id: created.id,
      locale: 'en',
      draft: true,
      context: { skipRevalidate: true, skipAutoTranslate: true },
      data: {
        title: 'Home',
        hero: heroEN,
        meta: {
          title: 'FermentFreude — Good Food, Better Health, Real Joy',
          description: 'FermentFreude — Making fermentation accessible & joyful.',
        },
      },
    })

    payload.logger.info(`✅ Home page created (id: ${created.id}) with hero (DE + EN).`)
  }

  payload.logger.info('Done. Exiting.')
  process.exit(0)
}

seedHomeHero().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
