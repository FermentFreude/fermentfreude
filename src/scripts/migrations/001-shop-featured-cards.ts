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
// Product slugs for the 3 featured cards (column grid, left → right)
const CARD_SLUGS = [
  'kombucha-classic',    // Card 1 (left)
  'fermented-kimchi',    // Card 2 (middle)
  'lakto-gemuese',       // Card 3 (right)
]
// Product slug for the wide banner below the cards (e.g. Tempeh)
const BANNER_SLUG = 'tempeh-starter'

// Card accent colors (hex). Leave empty string to use defaults.
const CARD_COLORS = [
  '#4b4f4a',  // Card 1 — olive
  '#403c39',  // Card 2 — charcoal
  '#1a1a1a',  // Card 3 — near-black
]
const BANNER_COLOR = '#3a3e3a'  // muted olive
// ─────────────────────────────────────────────────────────────────────────────

export async function migrate(payload: Payload): Promise<void> {
  payload.logger.info('📦 Finding products by slug...')

  // Look up all product IDs by slug (works on any DB — staging or production)
  const [card1Id, card2Id, card3Id] = await Promise.all(
    CARD_SLUGS.map((slug) => findProductBySlug(payload, slug)),
  )
  const bannerId = await findProductBySlug(payload, BANNER_SLUG)

  const cardColorArray = CARD_COLORS.filter(Boolean).map((color) => ({ color }))

  const blockDE = {
    visible: true,
    heading: 'Unsere Bestseller',
    subheading: 'Handgemacht, fermentiert, voller Leben.',
    products: [card1Id, card2Id, card3Id].filter(Boolean),
    cardColors: cardColorArray,
    bannerProduct: bannerId,
    bannerColor: BANNER_COLOR,
    ctaLabel: 'Jetzt bestellen',
  }

  const blockEN = {
    ...blockDE,
    heading: 'Our Bestsellers',
    subheading: 'Handcrafted, fermented, full of life.',
    ctaLabel: 'Order Now',
  }

  const result = await appendBlockToPage(
    payload,
    'shop',
    'featuredProductCards',
    blockDE,
    blockEN,
  )

  if (result === 'skipped') {
    payload.logger.info(
      '  ↩ FeaturedProductCards already on shop page — nothing changed.',
    )
  }
}
