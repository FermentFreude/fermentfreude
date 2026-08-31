/**
 * Full shop CMS sync — products + page blocks (DE/EN).
 *
 * - Berglinsen: pack cutout (no studio/kitchen bg)
 * - Kimchi: jar cutout, title "Kimchi", seasonal
 * - Käfer: packaging in gallery (hero image stays plated CMS field)
 * - ShopHero trust + copy, Featured cards, Automaten, hide catalog
 *
 * Run: pnpm patch:shop-sync
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import fs from 'fs'
import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  CTX,
  appendBlockToPage,
  findProductBySlug,
  patchBlockInPage,
} from './migrations/_helpers'

const ROOT = process.cwd()

async function uploadMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  localPath: string,
  filename: string,
  altDe: string,
  altEn: string,
): Promise<string> {
  const abs = path.resolve(ROOT, localPath)
  if (!fs.existsSync(abs)) throw new Error(`Missing file: ${localPath}`)
  const buf = fs.readFileSync(abs)

  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: altDe },
    file: {
      data: buf,
      mimetype: 'image/webp',
      name: filename,
      size: buf.length,
    },
    context: CTX,
    overrideAccess: true,
  })

  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: altEn },
    context: CTX,
    overrideAccess: true,
  })

  await new Promise((r) => setTimeout(r, 2000))
  const fresh = await payload.findByID({
    collection: 'media',
    id: media.id,
    overrideAccess: true,
  })
  const url = (fresh as { url?: string }).url
  if (url) {
    let ok = false
    for (let attempt = 0; attempt < 4; attempt++) {
      const head = await fetch(url, { method: 'HEAD' })
      if (head.ok) {
        ok = true
        break
      }
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    }
    if (!ok) {
      payload.logger.warn(`  ⚠ R2 HEAD not ready yet for ${filename} — continuing`)
    }
  }

  payload.logger.info(`  ✔ media ${filename}`)
  return String(media.id)
}

function galleryIds(doc: { gallery?: Array<{ image?: unknown }> | null }): string[] {
  return (Array.isArray(doc.gallery) ? doc.gallery : [])
    .map((g) => {
      const img = g?.image
      if (typeof img === 'string') return img
      if (typeof img === 'object' && img !== null && 'id' in img) {
        return String((img as { id: string }).id)
      }
      return null
    })
    .filter(Boolean) as string[]
}

async function setGalleryPrimary(
  payload: Awaited<ReturnType<typeof getPayload>>,
  productId: string,
  primaryId: string,
  keep = 2,
) {
  const existing = await payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
    overrideAccess: true,
  })
  const rest = galleryIds(existing).filter((id) => id !== primaryId).slice(0, keep)
  await payload.update({
    collection: 'products',
    id: productId,
    data: {
      gallery: [{ image: primaryId }, ...rest.map((image) => ({ image }))],
    } as never,
    context: CTX,
    overrideAccess: true,
  })
}

async function main() {
  const payload = await getPayload({ config })
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
  payload.logger.info('🛒 Syncing shop CMS (products + page DE/EN)…')

  const kaferId = await findProductBySlug(payload, 'kaeferbohnen-tempeh', true)
  const bergId = await findProductBySlug(payload, 'berglinsen-tempeh', true)
  const kimchiId = await findProductBySlug(payload, 'classic-kimchi', true)
  if (!kaferId || !bergId || !kimchiId) {
    throw new Error('Missing product(s). Need kaeferbohnen-tempeh, berglinsen-tempeh, classic-kimchi.')
  }

  // ── Images ──────────────────────────────────────────────────────────
  const bergMedia = await uploadMedia(
    payload,
    'public/shop/berglinsen-packaging-nobg.webp',
    `berglinsen-pack-sync-${stamp}.webp`,
    'Berglinsen-Tempeh Verpackung',
    'Mountain lentil tempeh packaging',
  )
  const kimchiMedia = await uploadMedia(
    payload,
    fs.existsSync(path.resolve(ROOT, 'public/shop/kimchi-packaging-nobg.webp'))
      ? 'public/shop/kimchi-packaging-nobg.webp'
      : 'public/shop/kimchi-david-jar.webp',
    `kimchi-jar-sync-${stamp}.webp`,
    'Kimchi im Glas',
    'Kimchi in a jar',
  )
  const kaferPackMedia = await uploadMedia(
    payload,
    fs.existsSync(path.resolve(ROOT, 'public/shop/kaefer-packaging-nobg.webp'))
      ? 'public/shop/kaefer-packaging-nobg.webp'
      : 'public/shop/kaefer-packaging.webp',
    `kaefer-pack-sync-${stamp}.webp`,
    'Käferbohnen-Tempeh Verpackung',
    'Runner bean tempeh packaging',
  )

  await setGalleryPrimary(payload, bergId, bergMedia, 2)
  await setGalleryPrimary(payload, kimchiId, kimchiMedia, 2)

  // Käfer: keep existing first (plated/round) if any; insert pack as second
  {
    const existing = await payload.findByID({
      collection: 'products',
      id: kaferId,
      depth: 0,
      overrideAccess: true,
    })
    const prev = galleryIds(existing).filter((id) => id !== kaferPackMedia)
    const gallery =
      prev.length === 0
        ? [{ image: kaferPackMedia }]
        : [{ image: prev[0] }, { image: kaferPackMedia }, ...prev.slice(1, 2).map((image) => ({ image }))]
    await payload.update({
      collection: 'products',
      id: kaferId,
      data: { gallery } as never,
      context: CTX,
      overrideAccess: true,
    })
  }
  payload.logger.info('  ✔ product galleries updated')

  // ── Product text ─────────────────────────────────────────────────────
  await payload.update({
    collection: 'products',
    id: kimchiId,
    locale: 'de',
    data: {
      title: 'Kimchi',
      isSeasonal: true,
    } as never,
    context: CTX,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'products',
    id: kimchiId,
    locale: 'en',
    data: {
      title: 'Kimchi',
    } as never,
    context: CTX,
    overrideAccess: true,
  })
  payload.logger.info('  ✔ Kimchi title DE/EN + seasonal')

  // ── ShopHero ─────────────────────────────────────────────────────────
  await patchBlockInPage(
    payload,
    'shop',
    'shopHero',
    {
      visible: true,
      heroProduct: kaferId,
      heroPanelColor: '#403c39',
      heroTitle: 'Unsere handgemachten Produkte aus unserem Pick-Up Shop.',
      ctaPrimaryLabel: 'Jetzt bestellen',
      ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
      slides: [],
      bottomTagline: 'Fermentierte Lebensmittel, mit Sorgfalt hergestellt.',
      bottomSubtitle: 'Abholung in Graz, jede Woche frisch.',
      bottomDisclaimer: 'Wir arbeiten an einem Lieferservice für garantierte Frische.',
      trustItems: [
        { icon: 'hand', label: 'Handgemacht in Graz' },
        { icon: 'mapPin', label: 'Abholung vor Ort' },
        { icon: 'leaf', label: 'Jede Woche frisch' },
      ],
    },
    {
      visible: true,
      heroProduct: kaferId,
      heroPanelColor: '#403c39',
      heroTitle: 'Our handmade products from our pick-up shop.',
      ctaPrimaryLabel: 'Order Now',
      ctaPrimaryUrl: '/products/kaeferbohnen-tempeh',
      slides: [],
      bottomTagline: 'Fermented foods, crafted with care.',
      bottomSubtitle: 'Pickup in Graz, freshly made every week.',
      bottomDisclaimer: 'Delivery coming soon to ensure the freshest quality.',
      trustItems: [
        { icon: 'hand', label: 'Handmade in Graz' },
        { icon: 'mapPin', label: 'Local pickup' },
        { icon: 'leaf', label: 'Fresh every week' },
      ],
    },
  )

  // ── Featured cards ───────────────────────────────────────────────────
  const featuredDE = {
    visible: true,
    heading: 'Weitere Produkte',
    subheading: 'Handgemachte Fermente – natürlich, voller Leben und Geschmack',
    products: [bergId, kimchiId],
    cardColors: [{ color: '#5C6B54' }, { color: '#403c39' }],
    bannerProduct: null,
    bannerColor: null,
    ctaLabel: 'Jetzt bestellen',
  }
  const featuredEN = {
    ...featuredDE,
    heading: 'More products',
    subheading: 'Handmade ferments – natural, full of life and flavour',
    ctaLabel: 'Order Now',
  }
  const featured = await patchBlockInPage(
    payload,
    'shop',
    'featuredProductCards',
    featuredDE,
    featuredEN,
  )
  if (featured === 'not-found') {
    await appendBlockToPage(payload, 'shop', 'featuredProductCards', featuredDE, featuredEN)
  }

  // ── Automaten ────────────────────────────────────────────────────────
  const automatenLocations = [
    {
      kind: 'automat',
      name: 'Leonhardplatz',
      address: 'Leonhardplatz 12, 8010 Graz',
      description: 'Käferbohnen-Tempeh im Automaten bei Pölzl Gemüse & Freunde.',
      accessInfo: 'Rund um die Uhr geöffnet',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Leonhardplatz+12+8010+Graz+P%C3%B6lzl+Automat',
    },
    {
      kind: 'restaurant',
      name: 'Wildmoser',
      address: 'Grüne Gasse 17, 8020 Graz',
      description: 'Hier steht unser Käferbohnen-Tempeh regelmäßig auf der Speisekarte.',
      accessInfo: 'Restaurant · regelmäßig im Angebot',
      mapsUrl: 'https://maps.app.goo.gl/yrLi4rHiVozjCbzo6',
    },
  ]
  const automatenDE = {
    visible: true,
    eyebrow: 'Graz · Entdecken',
    heading: 'Tempeh, wann immer du Lust hast',
    body: 'Zwei versteckte Spots in Graz: Automaten-Abholung rund um die Uhr und Käferbohnen-Tempeh auf dem Teller.',
    pullQuote: null,
    mapsLabel: 'Route öffnen',
    locations: automatenLocations,
    locationName: null,
    locationAddress: null,
    mapsUrl: null,
  }
  const automatenEN = {
    ...automatenDE,
    eyebrow: 'Graz · Discover',
    heading: 'Tempeh, whenever you need it',
    body: 'Two hidden spots in Graz: around-the-clock Automat pickup and Käferbohnen tempeh on the plate.',
    mapsLabel: 'Get Directions',
    locations: [
      {
        ...automatenLocations[0],
        description: 'Runner bean tempeh in the Automat at Pölzl Gemüse & Freunde.',
        accessInfo: 'Open around the clock',
      },
      {
        ...automatenLocations[1],
        description: 'Our runner bean tempeh is served here regularly.',
        accessInfo: 'Restaurant · regularly on the menu',
      },
    ],
  }
  const automaten = await patchBlockInPage(
    payload,
    'shop',
    'shopAutomaten',
    automatenDE,
    automatenEN,
  )
  if (automaten === 'not-found') {
    await appendBlockToPage(payload, 'shop', 'shopAutomaten', automatenDE, automatenEN)
  }

  await patchBlockInPage(payload, 'shop', 'shopProductList', { visible: false }, { visible: false })

  payload.logger.info('✅ Shop CMS sync complete. Hard-refresh /shop and check /admin.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Shop CMS sync failed:', err)
  process.exit(1)
})
