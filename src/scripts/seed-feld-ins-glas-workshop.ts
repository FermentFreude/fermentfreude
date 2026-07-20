/**
 * Seed Vom Feld ins Glas as its own workshop (not shared with Lakto).
 *
 * Creates:
 * - workshop slug: vom-feld-ins-glas
 * - product slug: workshop-vom-feld-ins-glas
 * - location: Marktgarten „Unser Bauerngarten“
 * - a few test appointments (distinct from Lakto studio dates)
 *
 * Run:  pnpm seed feld-ins-glas-workshop
 *       pnpm seed feld-ins-glas-workshop --force
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import { IMAGE_PRESETS, optimizedFile } from '@/scripts/seed-image-utils'
import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

const isForce = process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const WORKSHOP_SLUG = 'vom-feld-ins-glas'
const PRODUCT_SLUG = 'workshop-vom-feld-ins-glas'
const LOCATION_NAME_DE = 'Marktgarten „Unser Bauerngarten“'
const LOCATION_NAME_EN = 'Marktgarten “Unser Bauerngarten”'
const LOCATION_ADDRESS = 'Hochfeldweg, Graz'

/** Marktgarten appointments (must be future — hook rejects past dates) */
const TEST_APPOINTMENTS = [
  { date: '2026-08-01', time: '10:00', spots: 12 },
  { date: '2026-08-22', time: '10:00', spots: 12 },
  { date: '2026-09-12', time: '10:00', spots: 12 },
  { date: '2026-09-20', time: '10:00', spots: 12 },
]

function buildRichText(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [
            {
              type: 'text' as const,
              detail: 0,
              format: 0,
              mode: 'normal' as const,
              style: '',
              text,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
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
  }
}

function toViennaISO(date: string, time: string): string {
  // Summer 2026 = CEST (UTC+2)
  return new Date(`${date}T${time}:00+02:00`).toISOString()
}

async function seedFeldInsGlasWorkshop() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Vom Feld ins Glas workshop infrastructure...')

  // ── 1. Location ────────────────────────────────────────────
  let locationId: string
  const existingLoc = await payload.find({
    collection: 'workshop-locations',
    where: { address: { equals: LOCATION_ADDRESS } },
    limit: 1,
  })

  if (existingLoc.docs[0] && !isForce) {
    locationId = existingLoc.docs[0].id
    payload.logger.info(`  · reuse location ${locationId}`)
  } else if (existingLoc.docs[0] && isForce) {
    locationId = existingLoc.docs[0].id
    await payload.update({
      collection: 'workshop-locations',
      id: locationId,
      locale: 'de',
      data: {
        name: LOCATION_NAME_DE,
        address: LOCATION_ADDRESS,
        timezone: 'Europe/Vienna',
        isActive: true,
      },
      context: ctx,
    })
    await payload.update({
      collection: 'workshop-locations',
      id: locationId,
      locale: 'en',
      data: { name: LOCATION_NAME_EN },
      context: ctx,
    })
    payload.logger.info(`  ✓ updated location ${locationId}`)
  } else {
    const loc = await payload.create({
      collection: 'workshop-locations',
      locale: 'de',
      data: {
        name: LOCATION_NAME_DE,
        address: LOCATION_ADDRESS,
        timezone: 'Europe/Vienna',
        isActive: true,
      },
      context: ctx,
    })
    locationId = loc.id
    await payload.update({
      collection: 'workshop-locations',
      id: locationId,
      locale: 'en',
      data: { name: LOCATION_NAME_EN },
      context: ctx,
    })
    payload.logger.info(`  ✓ created location ${locationId}`)
  }

  // ── 2. Workshop ────────────────────────────────────────────
  let workshopId: string
  const existingWs = await payload.find({
    collection: 'workshops',
    where: { slug: { equals: WORKSHOP_SLUG } },
    limit: 1,
  })

  if (existingWs.docs[0] && !isForce) {
    workshopId = existingWs.docs[0].id
    payload.logger.info(`  · reuse workshop ${workshopId}`)
  } else if (existingWs.docs[0] && isForce) {
    workshopId = existingWs.docs[0].id
    await payload.update({
      collection: 'workshops',
      id: workshopId,
      locale: 'de',
      data: {
        title: 'Vom Feld ins Glas',
        description: buildRichText(
          'Spezial-Workshop im Marktgarten: Ernte, Lakto-Fermentation und drei Fermente zum Mitnehmen.',
        ),
        basePrice: 99,
        maxCapacityPerSlot: 12,
        isActive: true,
      },
      context: ctx,
    })
    await payload.update({
      collection: 'workshops',
      id: workshopId,
      locale: 'en',
      data: {
        title: 'From Field to Jar',
        description: buildRichText(
          'Special workshop at the market garden: harvest, lacto-fermentation and three ferments to take home.',
        ),
      },
      context: ctx,
    })
    payload.logger.info(`  ✓ updated workshop ${workshopId}`)
  } else {
    const ws = await payload.create({
      collection: 'workshops',
      locale: 'de',
      data: {
        slug: WORKSHOP_SLUG,
        title: 'Vom Feld ins Glas',
        description: buildRichText(
          'Spezial-Workshop im Marktgarten: Ernte, Lakto-Fermentation und drei Fermente zum Mitnehmen.',
        ),
        basePrice: 99,
        maxCapacityPerSlot: 12,
        isActive: true,
      },
      context: ctx,
    })
    workshopId = ws.id
    await payload.update({
      collection: 'workshops',
      id: workshopId,
      locale: 'en',
      data: {
        title: 'From Field to Jar',
        description: buildRichText(
          'Special workshop at the market garden: harvest, lacto-fermentation and three ferments to take home.',
        ),
      },
      context: ctx,
    })
    payload.logger.info(`  ✓ created workshop ${workshopId}`)
  }

  // ── 3. Product (for cart) ──────────────────────────────────
  const existingProduct = await payload.find({
    collection: 'products',
    where: { slug: { equals: PRODUCT_SLUG } },
    limit: 1,
  })

  let productImageId: string | undefined
  try {
    const heroPath = path.resolve(
      process.cwd(),
      'seed-assets/images/feld-ins-glas/feld-ins-glas-jars.png',
    )
    const existingImg = await payload.find({
      collection: 'media',
      where: { alt: { contains: 'feld-ins-glas-jars-v2' } },
      limit: 1,
    })
    if (existingImg.docs[0]) {
      productImageId = existingImg.docs[0].id
    } else {
      const media = await payload.create({
        collection: 'media',
        locale: 'de',
        data: { alt: 'feld-ins-glas-jars-v2 – fermentation jars for cart product' },
        file: await optimizedFile(heroPath, IMAGE_PRESETS.card),
        context: ctx,
      })
      productImageId = media.id
    }
  } catch (err) {
    payload.logger.warn(`  ⚠️  product image skipped: ${(err as Error).message}`)
  }

  if (existingProduct.docs[0] && !isForce) {
    payload.logger.info(`  · reuse product ${existingProduct.docs[0].id}`)
  } else if (existingProduct.docs[0] && isForce) {
    const id = existingProduct.docs[0].id
    await payload.update({
      collection: 'products',
      id,
      locale: 'de',
      data: {
        title: 'Vom Feld ins Glas Workshop',
        priceInEUR: 9900,
        priceInEUREnabled: true,
        inventory: 999,
        _status: 'published',
        ...(productImageId
          ? {
              meta: {
                title: 'Vom Feld ins Glas Workshop',
                description: 'Marktgarten-Workshop (Details siehe Warenkorb)',
                image: productImageId,
              },
              gallery: [{ image: productImageId }],
            }
          : {}),
      },
      context: ctx,
    })
    await payload.update({
      collection: 'products',
      id,
      locale: 'en',
      data: {
        title: 'From Field to Jar Workshop',
        meta: {
          title: 'From Field to Jar Workshop',
          description: 'Market garden workshop (see cart for details)',
        },
      },
      context: ctx,
    })
    payload.logger.info(`  ✓ updated product ${id}`)
  } else {
    const product = await payload.create({
      collection: 'products',
      locale: 'de',
      draft: false,
      data: {
        title: 'Vom Feld ins Glas Workshop',
        slug: PRODUCT_SLUG,
        productType: 'workshop' as const,
        priceInEUR: 9900,
        priceInEUREnabled: true,
        inventory: 999,
        description: buildRichText('Marktgarten-Workshop (Details siehe Warenkorb)'),
        _status: 'published',
        ...(productImageId
          ? {
              meta: {
                title: 'Vom Feld ins Glas Workshop',
                description: 'Marktgarten-Workshop (Details siehe Warenkorb)',
                image: productImageId,
              },
              gallery: [{ image: productImageId }],
            }
          : {
              meta: {
                title: 'Vom Feld ins Glas Workshop',
                description: 'Marktgarten-Workshop (Details siehe Warenkorb)',
              },
            }),
      },
      context: ctx,
    })
    await payload.update({
      collection: 'products',
      id: product.id,
      locale: 'en',
      data: {
        title: 'From Field to Jar Workshop',
        description: buildRichText('Market garden workshop (see cart for details)'),
        meta: {
          title: 'From Field to Jar Workshop',
          description: 'Market garden workshop (see cart for details)',
        },
      },
      context: ctx,
    })
    payload.logger.info(`  ✓ created product ${product.id}`)
  }

  // ── 4. Test appointments ───────────────────────────────────
  // Remove existing Feld appointments when forcing, then recreate
  if (isForce) {
    const old = await payload.find({
      collection: 'workshop-appointments',
      where: { workshop: { equals: workshopId } },
      limit: 50,
    })
    for (const doc of old.docs) {
      await payload.delete({
        collection: 'workshop-appointments',
        id: doc.id,
        context: ctx,
      })
    }
    if (old.docs.length) {
      payload.logger.info(`  ✓ removed ${old.docs.length} old Feld appointments`)
    }
  }

  for (const slot of TEST_APPOINTMENTS) {
    const dateTime = toViennaISO(slot.date, slot.time)

    const existingAppt = await payload.find({
      collection: 'workshop-appointments',
      where: {
        and: [{ workshop: { equals: workshopId } }, { dateTime: { equals: dateTime } }],
      },
      limit: 1,
    })

    if (existingAppt.docs[0] && !isForce) {
      payload.logger.info(`  · reuse appointment ${slot.date} ${slot.time}`)
      continue
    }

    await payload.create({
      collection: 'workshop-appointments',
      data: {
        workshop: workshopId,
        location: locationId,
        dateTime,
        availableSpots: slot.spots,
        isPublished: true,
        notes: 'Test appointment — Vom Feld ins Glas (Marktgarten)',
      },
      context: ctx,
    })
    payload.logger.info(`  ✓ appointment ${slot.date} ${slot.time}`)
  }

  payload.logger.info('✅ Vom Feld ins Glas workshop ready for booking tests')
  payload.logger.info('   Dates: 1 Aug, 22 Aug, 12 Sep, 20 Sep 2026 · 10:00 · Marktgarten')
  process.exit(0)
}

seedFeldInsGlasWorkshop().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
