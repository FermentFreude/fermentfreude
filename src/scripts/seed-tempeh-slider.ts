/* eslint-disable */
// @ts-nocheck
/**
 * Seed the TempehTypeSlider block on the tempeh page.
 *
 * Creates a hero-style carousel showcasing tempeh benefits and use cases.
 * 6 slides: What is Tempeh? + Protein Powerhouse + Gut Health Hero +
 *           Stir-Fries & Bowls + Sandwiches & Wraps + Grilled & BBQ
 * Images are uploaded and optimized during seeding.
 * Bilingual: saves DE first (generates block IDs), then EN with same IDs.
 *
 * Run:  pnpm seed tempeh-slider
 *       pnpm seed tempeh-slider --force
 */
import type { Page } from '@/payload-types'
import config from '@payload-config' assert { type: 'json' }
import path, { dirname } from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'
import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

type PageLayoutBlock = NonNullable<Page['layout']>[number]
type TempehTypeSliderBlock = Extract<PageLayoutBlock, { blockType: 'tempehTypeSlider' }>
type TempehTypeSliderItem = NonNullable<TempehTypeSliderBlock['items']>[number]

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const isForce = process.argv.includes('--force')

// ═══════════════════════════════════════════════════════════════
//  Image upload paths
// ═══════════════════════════════════════════════════════════════
const SEED_IMAGES_DIR = path.resolve(__dirname, '../../seed-assets/images')
const TEMPEH_IMAGES = [
  path.join(SEED_IMAGES_DIR, 'tempeh.png'), // What is Tempeh?
  path.join(SEED_IMAGES_DIR, 'tempeh1.png'), // Protein Powerhouse
  path.join(SEED_IMAGES_DIR, 'tempeh.png'), // Gut Health Hero
  path.join(SEED_IMAGES_DIR, 'tempeh1.png'), // Stir-Fries & Bowls
  path.join(SEED_IMAGES_DIR, 'tempeh.png'), // Sandwiches & Wraps
  path.join(SEED_IMAGES_DIR, 'tempeh1.png'), // Grilled & BBQ
]

// ═══════════════════════════════════════════════════════════════
//  DE — German slider data
// ═══════════════════════════════════════════════════════════════

const buildSliderBlockDE = (imageIds: string[]): Omit<TempehTypeSliderBlock, 'id'> => ({
  blockType: 'tempehTypeSlider' as const,
  blockName: 'Tempeh Type Slider — DE',
  eyebrow: 'TEMPEH ENTDECKEN',
  heading: 'Vielseitiger als du denkst',
  description:
    'Von der Pfanne bis zum Grill – Tempeh passt überall hin. Reich an Protein, gut für die Verdauung und unglaublich lecker.',
  items: [
    {
      title: 'Was ist Tempeh?',
      description:
        'Fermentierte Sojabohnen voller Geschmack, Protein und Probiotika. Ein traditionelles indonesisches Superfood.',
      badgeLabel: undefined,
      badgeColor: undefined,
      image: imageIds[0],
    },
    {
      title: 'Protein-Kraftwerk',
      description:
        'Mit bis zu 20g Protein pro Portion ist Tempeh eine komplette pflanzliche Proteinquelle.',
      badgeLabel: 'Vorteil',
      badgeColor: 'benefit' as const,
      image: imageIds[1],
    },
    {
      title: 'Darmgesundheits-Held',
      description: 'Reich an Probiotika für eine gesunde Verdauung und ein starkes Immunsystem.',
      badgeLabel: 'Vorteil',
      badgeColor: 'benefit' as const,
      image: imageIds[2],
    },
    {
      title: 'Stir-Fries & Bowls',
      description: 'Würfeln, anbraten und zu Gemüse-Pfannengerichten oder Buddha-Bowls geben.',
      badgeLabel: 'Anwendung',
      badgeColor: 'default' as const,
      image: imageIds[3],
    },
    {
      title: 'Sandwiches & Wraps',
      description:
        'In Scheiben schneiden, marinieren und als herzhaften Belag für Sandwiches oder Wraps verwenden.',
      badgeLabel: 'Anwendung',
      badgeColor: 'default' as const,
      image: imageIds[4],
    },
    {
      title: 'Gegrilltes & BBQ',
      description:
        'Mariniere dicke Scheiben und grille sie für einen rauchigen, herzhaften Geschmack.',
      badgeLabel: 'Anwendung',
      badgeColor: 'default' as const,
      image: imageIds[5],
    },
  ],
})

// ═══════════════════════════════════════════════════════════════
//  EN — English slider data
// ═══════════════════════════════════════════════════════════════

const buildSliderBlockEN = (imageIds: string[]): Omit<TempehTypeSliderBlock, 'id'> => ({
  blockType: 'tempehTypeSlider' as const,
  blockName: 'Tempeh Type Slider — EN',
  eyebrow: 'DISCOVER TEMPEH',
  heading: 'More versatile than you think',
  description:
    'From pan to grill, tempeh fits everywhere. High in protein, good for digestion, and incredibly delicious.',
  items: [
    {
      title: 'What is Tempeh?',
      description:
        'Fermented soybeans, packed with flavor, protein, and probiotics. A traditional Indonesian superfood.',
      badgeLabel: undefined,
      badgeColor: undefined,
      image: imageIds[0],
    },
    {
      title: 'Protein Powerhouse',
      description:
        'With up to 20g of protein per serving, tempeh is a complete plant-based protein source.',
      badgeLabel: 'Benefit',
      badgeColor: 'benefit' as const,
      image: imageIds[1],
    },
    {
      title: 'Gut Health Hero',
      description: 'Rich in probiotics for a healthy digestive system and a strong immune system.',
      badgeLabel: 'Benefit',
      badgeColor: 'benefit' as const,
      image: imageIds[2],
    },
    {
      title: 'Stir-Fries & Bowls',
      description: 'Cube it, sauté it, and add to veggie stir-fries or Buddha bowls.',
      badgeLabel: 'Use Case',
      badgeColor: 'default' as const,
      image: imageIds[3],
    },
    {
      title: 'Sandwiches & Wraps',
      description: 'Slice it, marinate it, and use as a hearty filling for sandwiches or wraps.',
      badgeLabel: 'Use Case',
      badgeColor: 'default' as const,
      image: imageIds[4],
    },
    {
      title: 'Grilled & BBQ',
      description: 'Marinate thick slices and grill them for a smoky, savory flavor.',
      badgeLabel: 'Use Case',
      badgeColor: 'default' as const,
      image: imageIds[5],
    },
  ],
})

async function seedTempehSlider() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding TempehTypeSlider block for tempeh page...')

  // ── Step 1: Upload all images ──
  payload.logger.info('  Uploading images...')
  const imageIds: string[] = []

  for (let i = 0; i < TEMPEH_IMAGES.length; i++) {
    try {
      const file = await optimizedFile(TEMPEH_IMAGES[i], IMAGE_PRESETS.card)
      const created = await payload.create({
        collection: 'media',
        locale: 'de',
        data: {
          alt: `Tempeh ${i + 1}`,
          caption: null,
        },
        file,
        context: ctx,
      })
      imageIds.push(created.id as string)
      payload.logger.info(`    ✓ Image ${i + 1} uploaded (ID: ${created.id})`)
    } catch (err) {
      payload.logger.error(`❌ Failed to upload image ${i + 1}: ${err}`)
      process.exit(1)
    }
  }

  // ── Step 2: Find the tempeh page ──
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'tempeh' } },
    limit: 1,
    depth: 0,
  })

  if (pages.docs.length === 0) {
    payload.logger.error('❌ Tempeh page not found. Run "pnpm seed workshop-pages" first.')
    process.exit(1)
  }

  const pageId = pages.docs[0].id

  // ── Step 3: Fetch DE locale with FULL depth to preserve all existing data ──
  const existingPageDE = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 10, // Deep read to capture all nested data (images, etc.)
  })

  // Check if slider already exists — if so, SKIP (unless --force)
  const hasSlider =
    Array.isArray(existingPageDE.layout) &&
    existingPageDE.layout.some((block) => block.blockType === 'tempehTypeSlider')

  if (hasSlider && !isForce) {
    payload.logger.info('⏭️  TempehTypeSlider already exists on page. Skipping.')
    payload.logger.info('   To overwrite, run: pnpm seed tempeh-slider --force')
    process.exit(0)
  }

  if (hasSlider && isForce) {
    payload.logger.info('🔄 --force flag detected. Will overwrite existing slider.')
  }

  // ── Step 4: Build layout (remove old slider if exists, add new one) ──
  const currentLayout = Array.isArray(existingPageDE.layout) ? existingPageDE.layout : []

  // Remove existing slider if --force is used
  const filteredLayout = currentLayout.filter((block) => block.blockType !== 'tempehTypeSlider')

  // Add new slider at the START
  const sliderBlockDE = buildSliderBlockDE(imageIds)
  const layoutDE = [sliderBlockDE, ...filteredLayout]

  // ── Step 5: Save DE first ––
  payload.logger.info('  Saving DE locale...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    data: { layout: layoutDE },
    context: ctx,
  })

  // ── Step 6: Read back to capture generated IDs ––
  const deWithIds = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: 'de',
    depth: 10,
  })

  // Find the slider block we just created
  const sliderBlockWithId = deWithIds.layout?.find((b: unknown): b is TempehTypeSliderBlock => {
    if (typeof b !== 'object' || b === null) return false
    const blockType = (b as Record<string, unknown>).blockType
    return blockType === 'tempehTypeSlider'
  })

  if (!sliderBlockWithId) {
    payload.logger.error('❌ Failed to retrieve slider block ID from DE save.')
    process.exit(1)
  }

  // ── Step 7: Merge EN data reusing DE IDs ––
  const sliderBlockEN = buildSliderBlockEN(imageIds)
  const enItems = sliderBlockEN.items || []
  const mergedSliderBlockEN: Omit<TempehTypeSliderBlock, 'id'> & { id?: string } = {
    ...sliderBlockEN,
    id: sliderBlockWithId.id ?? undefined,
    items: enItems.map(
      (enItem: unknown, i: number): TempehTypeSliderItem => ({
        ...(enItem as TempehTypeSliderItem),
        id: sliderBlockWithId.items?.[i]?.id ?? undefined,
      }),
    ),
  }

  // ── Step 8: Build EN layout: keep all existing blocks, replace slider with EN version ––
  const layoutEN = Array.isArray(deWithIds.layout)
    ? deWithIds.layout.map((block) =>
        block.blockType === 'tempehTypeSlider' ? mergedSliderBlockEN : block,
      )
    : [mergedSliderBlockEN]

  // ── Step 9: Save EN ––
  payload.logger.info('  Saving EN locale...')
  await payload.update({
    collection: 'pages',
    id: pageId,
    locale: 'en',
    data: { layout: layoutEN },
    context: ctx,
  })

  payload.logger.info('✅ TempehTypeSlider seeded successfully (DE + EN)!')
  payload.logger.info(`   • 6 slides with images: What is Tempeh + 2 Benefits + 3 Use Cases`)
  payload.logger.info(`   • All images uploaded and linked`)
  payload.logger.info(`   • All existing content PROTECTED`)
  payload.logger.info(`   Tempeh page: /workshops/tempeh`)
  process.exit(0)
}

seedTempehSlider().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
