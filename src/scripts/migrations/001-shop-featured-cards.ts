/**
 * Migration 001 — Add FeaturedProductCards block to the shop page.
 *
 * WHAT IT TOUCHES:
 *   - pages → slug: 'shop' → layout (appends ONE new block)
 *   - Nothing else is modified (other blocks, other pages, products, media)
 *
 * IDEMPOTENT: Yes — checks if featuredProductCards already exists before adding.
 *
 * MEDIA NEEDED: None (uses existing product gallery images via relationships).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CONFIGURE before running:
 *   Fill in the slugs below. Find them in /admin → Products → slug column.
 *   If a slug doesn't exist in the target DB, the migration will fail clearly.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { Payload } from 'payload'
import { appendBlockToPage, findProductBySlug } from './_helpers'

// ── CONFIGURE THESE ───────────────────────────────────────────────────────────
// Hero product (Käferbohnentempeh) — shown first / largest
const BANNER_SLUG = 'kaeferbohnen-tempeh'
// Supporting products only (Berglinsentempeh + seasonal Kimchi)
const CARD_SLUGS = [
  'berglinsen-tempeh', // supporting 1
  'classic-kimchi', // supporting 2 — title/ingredients stay editable in admin
]

const CARD_COLORS = [
  '#4b4f4a', // olive
  '#555954', // muted olive
]
const BANNER_COLOR = '#403c39'
// ─────────────────────────────────────────────────────────────────────────────

export async function migrate(payload: Payload): Promise<void> {
  payload.logger.info('📦 Finding products by slug...')

  const [card1Id, card2Id] = await Promise.all(
    CARD_SLUGS.map((slug) => findProductBySlug(payload, slug)),
  )
  const bannerId = await findProductBySlug(payload, BANNER_SLUG)

  const cardColorArray = CARD_COLORS.filter(Boolean).map((color) => ({ color }))

  const blockDE = {
    visible: true,
    heading: 'Unsere Produkte',
    subheading: 'Drei handgemachte Fermente — frisch aus Graz.',
    products: [card1Id, card2Id].filter(Boolean),
    cardColors: cardColorArray,
    bannerProduct: bannerId,
    bannerColor: BANNER_COLOR,
    ctaLabel: 'Jetzt bestellen',
  }

  const blockEN = {
    ...blockDE,
    heading: 'Our Products',
    subheading: 'Three handcrafted ferments — fresh from Graz.',
    ctaLabel: 'Order Now',
  }

  const result = await appendBlockToPage(payload, 'shop', 'featuredProductCards', blockDE, blockEN)

  if (result === 'skipped') {
    payload.logger.info('  ↩ FeaturedProductCards already on shop page — nothing changed.')
  }
}
