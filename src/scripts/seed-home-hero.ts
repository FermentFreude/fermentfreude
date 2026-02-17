/**
 * Seed the Home page with the heroSlider hero.
 * Deletes any existing home page (template boilerplate) and creates a clean one.
 * Seeds both DE (default) and EN locales, reusing array IDs.
 *
 * Following the rules:
 * - Schema first: all hero fields are in the CMS schema
 * - Seed both languages: DE first, read back IDs, then EN with same IDs
 * - Context flags: skipRevalidate, disableRevalidate, skipAutoTranslate
 * - Sequential DB writes (no Promise.all) for MongoDB Atlas M0
 *
 * Run: set -a && source .env && set +a && npx tsx src/scripts/seed-home-hero.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

async function seedHomeHero() {
  const payload = await getPayload({ config })

  // ── Helper: Lexical richText node ──────────────────────────
  function makeRichText(nodes: Array<{ tag?: string; text: string }>) {
    return {
      root: {
        type: 'root',
        children: nodes.map((n) =>
          n.tag
            ? {
                type: 'heading',
                tag: n.tag,
                children: [
                  { type: 'text', text: n.text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
                ],
                direction: 'ltr' as const,
                format: '' as const,
                indent: 0,
                version: 1,
              }
            : {
                type: 'paragraph',
                children: [
                  { type: 'text', text: n.text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' },
                ],
                direction: 'ltr' as const,
                format: '' as const,
                indent: 0,
                textFormat: 0,
                version: 1,
              },
        ),
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  DE DATA (default locale)
  // ══════════════════════════════════════════════════════════════
  const heroDE = {
    type: 'heroSlider' as const,
    showWordmark: true,
    richText: makeRichText([
      { tag: 'h1', text: 'Lerne mit uns' },
      { tag: 'h1', text: 'Kreiere deinen eigenen Geschmack zu Hause' },
      {
        text: 'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter. Durch Workshops, Produkte und Bildung machen wir Fermentation zugänglich und genussvoll.',
      },
    ]),
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

  // ══════════════════════════════════════════════════════════════
  //  EN DATA
  // ══════════════════════════════════════════════════════════════
  const heroEN = {
    type: 'heroSlider' as const,
    showWordmark: true,
    richText: makeRichText([
      { tag: 'h1', text: 'Learn with us' },
      { tag: 'h1', text: 'Create your own flavour at home' },
      {
        text: 'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
      },
    ]),
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

  // ── Step 0: Delete any existing home page (template boilerplate) ──
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 10,
    depth: 0,
  })

  for (const doc of existing.docs) {
    payload.logger.info(`Deleting old home page (id: ${doc.id})...`)
    await payload.delete({
      collection: 'pages',
      id: doc.id,
      context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    })
  }

  // ── Step 1: Create with DE (default locale) ──────────────────
  // Saves hero + empty layout + meta. Payload generates IDs for arrays/blocks.
  payload.logger.info('Creating Home page → DE (default locale)...')

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
        description:
          'Wir stellen fermentierte Lebensmittel her und teilen das Wissen dahinter.',
      },
    },
  })

  const homeId = created.id
  payload.logger.info(`Home page created (id: ${homeId}).`)

  // ── Step 2: Read back to capture auto-generated IDs ──────────
  // Arrays (links, socialLinks) are NOT localized — only text fields inside them are.
  // We MUST reuse the same IDs for EN, otherwise the DE labels get orphaned.
  payload.logger.info('Reading back to capture generated IDs...')

  const freshDoc = await payload.findByID({
    collection: 'pages',
    id: homeId,
    locale: 'de',
    depth: 0,
  })

  const freshHero = (freshDoc as any).hero || {}
  const freshLinks = freshHero.links || []
  const freshSocialLinks = freshHero.socialLinks || []

  // ── Step 3: Build EN hero with same IDs ──────────────────────
  const heroEN_withIds = {
    ...heroEN,
    links: heroEN.links.map((l, i) => ({
      ...l,
      id: freshLinks[i]?.id,
    })),
    socialLinks: heroEN.socialLinks.map((s, i) => ({
      ...s,
      id: freshSocialLinks[i]?.id,
    })),
  }

  // ── Step 4: Update EN locale with matching IDs ───────────────
  payload.logger.info('Seeding Home page → EN locale (with matching IDs)...')

  await payload.update({
    collection: 'pages',
    id: homeId,
    locale: 'en',
    context: { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true },
    data: {
      title: 'Home',
      _status: 'published',
      hero: heroEN_withIds,
      layout: [],
      meta: {
        title: 'FermentFreude — Learn with us, create your own flavour at home',
        description:
          'We create fermented foods and share the knowledge behind them.',
      },
    },
  })

  // ── Done ─────────────────────────────────────────────────────
  payload.logger.info('')
  payload.logger.info('✅ Home page seeded (DE + EN):')
  payload.logger.info('  Hero: heroSlider with richText, CTA link, social links, wordmark')
  payload.logger.info('  Layout: empty (add blocks from /admin)')
  payload.logger.info('  Meta: bilingual SEO titles & descriptions')
  payload.logger.info('')
  payload.logger.info('Editors can manage all hero content from /admin → Pages → Home')
  payload.logger.info('  • Switch locale in the top bar to edit DE / EN separately')
  payload.logger.info('  • Hero tab: heading, body text, CTA button, social links, wordmark toggle')

  process.exit(0)
}

seedHomeHero().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
