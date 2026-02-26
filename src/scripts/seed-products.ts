/**
 * Products seed — creates sample shop products (Kombucha, fermented goods).
 *
 * Uses workshop images from seed-assets when available.
 * Run `pnpm seed:placeholders` first if seed-assets is empty.
 *
 * Run: pnpm seed products
 */

import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

function buildDescription(text: string) {
  return {
    root: {
      type: 'root' as const,
      children: [
        {
          type: 'paragraph' as const,
          children: [
            { type: 'text' as const, detail: 0, format: 0, mode: 'normal' as const, style: '', text, version: 1 },
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

const PRODUCTS: Array<{
  titleDe: string
  titleEn: string
  slug: string
  priceInUSD: number
  imagePath: string
  alt: string
  descriptionDe: string
  descriptionEn: string
}> = [
  // ── Staging products (workshop-based) ──────────────────────────────────────
  {
    titleDe: 'Kombucha Classic',
    titleEn: 'Kombucha Classic',
    slug: 'kombucha-classic',
    priceInUSD: 5,
    imagePath: 'media/workshops/kombucha.png',
    alt: 'Organic Kombucha – Classic',
    descriptionDe: 'Unser klassischer Bio-Kombucha mit sanftem, erfrischendem Geschmack. Natürlich fermentiert, reich an Probiotika.',
    descriptionEn: 'Our classic organic Kombucha with a gentle, refreshing taste. Naturally fermented, rich in probiotics.',
  },
  {
    titleDe: 'Kombucha Vanilla Cream',
    titleEn: 'Kombucha Vanilla Cream',
    slug: 'kombucha-vanilla-cream',
    priceInUSD: 55,
    imagePath: 'media/workshops/kombucha.png',
    alt: 'Organic Kombucha – Vanilla Cream',
    descriptionDe: 'Kombucha mit cremiger Vanillenote. Ein besonderer Genuss für alle, die es mild und aromatisch mögen.',
    descriptionEn: 'Kombucha with a creamy vanilla note. A special treat for those who like it mild and aromatic.',
  },
  {
    titleDe: 'Kombucha Ginger Peach',
    titleEn: 'Kombucha Ginger Peach',
    slug: 'kombucha-ginger-peach',
    priceInUSD: 55,
    imagePath: 'media/workshops/kombucha.png',
    alt: 'Organic Kombucha – Ginger Peach',
    descriptionDe: 'Fruchtig-scharfe Kombination aus Pfirsich und Ingwer. Belebt und erfrischt.',
    descriptionEn: 'Fruity-spicy combination of peach and ginger. Invigorating and refreshing.',
  },
  {
    titleDe: 'Kombucha Green Tea',
    titleEn: 'Kombucha Green Tea',
    slug: 'kombucha-green-tea',
    priceInUSD: 55,
    imagePath: 'media/workshops/kombucha.png',
    alt: 'Organic Kombucha – Green Tea',
    descriptionDe: 'Kombucha auf Basis von grünem Tee. Leicht, bekömmlich und voller Antioxidantien.',
    descriptionEn: 'Kombucha based on green tea. Light, digestible and full of antioxidants.',
  },
  {
    titleDe: 'Lakto-Gemüse',
    titleEn: 'Fermented Vegetables',
    slug: 'lakto-gemuese',
    priceInUSD: 12,
    imagePath: 'media/workshops/lakto.png',
    alt: 'Lakto fermented vegetables',
    descriptionDe: 'Traditionell fermentiertes Gemüse mit Milchsäurebakterien. Knackig, würzig und gut für die Darmgesundheit.',
    descriptionEn: 'Traditionally fermented vegetables with lactic acid bacteria. Crispy, tangy and good for gut health.',
  },
  {
    titleDe: 'Tempeh Starter',
    titleEn: 'Tempeh Starter',
    slug: 'tempeh-starter',
    priceInUSD: 18,
    imagePath: 'media/workshops/tempeh.png',
    alt: 'Tempeh workshop – fermented soy',
    descriptionDe: 'Starterkultur für die Herstellung von Tempeh zu Hause. Einfach anzuwenden, ergibt köstlichen fermentierten Soja.',
    descriptionEn: 'Starter culture for making tempeh at home. Easy to use, yields delicious fermented soy.',
  },
  {
    titleDe: 'Fermentierter Kimchi',
    titleEn: 'Fermented Kimchi',
    slug: 'fermented-kimchi',
    priceInUSD: 14,
    imagePath: 'images/kombucha.png',
    alt: 'Fermented kimchi',
    descriptionDe: 'Authentisches koreanisches Kimchi. Scharf, würzig und voller probiotischer Kulturen.',
    descriptionEn: 'Authentic Korean kimchi. Spicy, tangy and full of probiotic cultures.',
  },
  {
    titleDe: 'Sauerteig-Starter',
    titleEn: 'Sourdough Starter',
    slug: 'sourdough-starter',
    priceInUSD: 8,
    imagePath: 'images/lakto.png',
    alt: 'Sourdough starter',
    descriptionDe: 'Aktiver Sauerteig-Starter für knuspriges Brot. Einfach zu pflegen und zu vermehren.',
    descriptionEn: 'Active sourdough starter for crusty bread. Easy to maintain and propagate.',
  },
  {
    titleDe: 'Kombucha Set',
    titleEn: 'Kombucha Set',
    slug: 'kombucha-set',
    priceInUSD: 45,
    imagePath: 'images/tempeh.png',
    alt: 'Kombucha starter set',
    descriptionDe: 'Komplettes Set zum Kombucha-Brauen: SCOBY, Anleitung und alles für den Einstieg.',
    descriptionEn: 'Complete set for brewing Kombucha: SCOBY, instructions and everything you need to get started.',
  },
  // ── Shop branch products (Figma grid: Apple & Carrot, Coffee, Wald Berry) ─────
  {
    titleDe: 'Organic Kombucha – Apfel & Karotte',
    titleEn: 'Organic Kombucha – Apple & Carrot',
    slug: 'kombucha-apple-carrot',
    priceInUSD: 4.9,
    imagePath: 'images/shop1.png',
    alt: 'Organic Kombucha – Apple & Carrot 250ML',
    descriptionDe: 'Bio-Kombucha mit Apfel und Karotte. Erfrischend und fruchtig.',
    descriptionEn: 'Organic Kombucha with apple and carrot. Refreshing and fruity.',
  },
  {
    titleDe: 'Organic Kombucha – Kaffee Geschmack',
    titleEn: 'Organic Kombucha – Coffee Flavour',
    slug: 'kombucha-coffee',
    priceInUSD: 4.9,
    imagePath: 'images/Shop2.png',
    alt: 'Organic Kombucha – Coffee Flavour 250ML',
    descriptionDe: 'Bio-Kombucha mit Kaffeearoma. Sanft und aromatisch.',
    descriptionEn: 'Organic Kombucha with coffee flavour. Mild and aromatic.',
  },
  {
    titleDe: 'Organic Kombucha – Waldbeere',
    titleEn: 'Organic Kombucha – Wald Berry',
    slug: 'kombucha-waldberry',
    priceInUSD: 4.9,
    imagePath: 'images/Shop3.png',
    alt: 'Organic Kombucha – Wald Berry 250ML',
    descriptionDe: 'Bio-Kombucha mit Waldbeeren. Beerenfruchtig und erfrischend.',
    descriptionEn: 'Organic Kombucha with forest berries. Berry-fruity and refreshing.',
  },
  {
    titleDe: 'Organic Kombucha – Kaffee Geschmack',
    titleEn: 'Organic Kombucha – Coffee Flavour',
    slug: 'kombucha-coffee-2',
    priceInUSD: 4.9,
    imagePath: 'images/Shop4.png',
    alt: 'Organic Kombucha – Coffee Flavour 250ML',
    descriptionDe: 'Bio-Kombucha mit Kaffeearoma. Sanft und aromatisch.',
    descriptionEn: 'Organic Kombucha with coffee flavour. Mild and aromatic.',
  },
  {
    titleDe: 'Organic Kombucha – Kaffee Geschmack',
    titleEn: 'Organic Kombucha – Coffee Flavour',
    slug: 'kombucha-coffee-3',
    priceInUSD: 4.9,
    imagePath: 'images/Shop2.png',
    alt: 'Organic Kombucha – Coffee Flavour 250ML',
    descriptionDe: 'Bio-Kombucha mit Kaffeearoma. Sanft und aromatisch.',
    descriptionEn: 'Organic Kombucha with coffee flavour. Mild and aromatic.',
  },
  {
    titleDe: 'Organic Kombucha – Waldbeere',
    titleEn: 'Organic Kombucha – Wald Berry',
    slug: 'kombucha-waldberry-2',
    priceInUSD: 4.9,
    imagePath: 'images/Shop3.png',
    alt: 'Organic Kombucha – Wald Berry 250ML',
    descriptionDe: 'Bio-Kombucha mit Waldbeeren. Beerenfruchtig und erfrischend.',
    descriptionEn: 'Organic Kombucha with forest berries. Berry-fruity and refreshing.',
  },
  {
    titleDe: 'Organic Kombucha – Kaffee Geschmack',
    titleEn: 'Organic Kombucha – Coffee Flavour',
    slug: 'kombucha-coffee-4',
    priceInUSD: 4.9,
    imagePath: 'images/Shop4.png',
    alt: 'Organic Kombucha – Coffee Flavour 250ML',
    descriptionDe: 'Bio-Kombucha mit Kaffeearoma. Sanft und aromatisch.',
    descriptionEn: 'Organic Kombucha with coffee flavour. Mild and aromatic.',
  },
  {
    titleDe: 'Organic Kombucha – Apfel & Karotte',
    titleEn: 'Organic Kombucha – Apple & Carrot',
    slug: 'kombucha-apple-carrot-2',
    priceInUSD: 4.9,
    imagePath: 'images/shop1.png',
    alt: 'Organic Kombucha – Apple & Carrot 250ML',
    descriptionDe: 'Bio-Kombucha mit Apfel und Karotte. Erfrischend und fruchtig.',
    descriptionEn: 'Organic Kombucha with apple and carrot. Refreshing and fruity.',
  },
]

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

export async function seedProducts(payloadInstance?: PayloadInstance): Promise<string[]> {
  const payload = payloadInstance ?? (await getPayload({ config }))
  const seedAssets = path.resolve(process.cwd(), 'seed-assets')
  const productIds: string[] = []

  // Upload or reuse product images
  const imageIdByPath: Record<string, string> = {}

  for (const product of PRODUCTS) {
    const fullPath = path.join(seedAssets, product.imagePath)
    if (imageIdByPath[product.imagePath]) {
      continue
    }
    if (fs.existsSync(fullPath)) {
      try {
        const media = await payload.create({
          collection: 'media',
          context: ctx,
          data: { alt: product.alt },
          file: await optimizedFile(fullPath, IMAGE_PRESETS.card),
        })
        imageIdByPath[product.imagePath] = String(media.id)
      } catch (err) {
        payload.logger.warn(
          `Product image upload failed: ${product.imagePath} – ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }
  }

  // Fallback: use first existing media if no images were uploaded
  let fallbackImageId: string | null = null
  if (Object.keys(imageIdByPath).length === 0) {
    const existing = await payload.find({
      collection: 'media',
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      fallbackImageId = String(existing.docs[0].id)
      payload.logger.warn('No product images found. Using first media as fallback.')
    }
  }

  const ctxWithLocale = { ...ctx, locale: 'de' as const }

  for (const product of PRODUCTS) {
    const imageId = imageIdByPath[product.imagePath] ?? fallbackImageId
    if (!imageId) {
      payload.logger.warn(`Skipping product ${product.slug} – no image available. Run pnpm seed:placeholders first.`)
      continue
    }

    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      if (doc) {
        productIds.push(String(doc.id))
        await payload.update({
          collection: 'products',
          id: doc.id,
          locale: 'de',
          data: {
            title: product.titleDe,
            description: buildDescription(product.descriptionDe),
          },
          context: ctx,
        })
      }
      continue
    }

    const created = await payload.create({
      collection: 'products',
      context: ctxWithLocale,
      data: {
        title: product.titleDe,
        slug: product.slug,
        description: buildDescription(product.descriptionDe),
        gallery: [{ image: imageId }],
        priceInUSD: product.priceInUSD,
        inventory: 50,
        _status: 'published',
      },
    })
    productIds.push(String(created.id))
  }

  // EN locale for each product (bilingual seeding)
  for (const product of PRODUCTS) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs.length > 0 && existing.docs[0]) {
      const doc = existing.docs[0]
      await payload.update({
        collection: 'products',
        id: doc.id,
        locale: 'en',
        data: {
          title: product.titleEn,
          description: buildDescription(product.descriptionEn),
        },
        context: ctx,
      })
    }
  }

  console.log(`✅ Products seeded. Check /shop`)
  return productIds
}

seedProducts().catch((err) => {
  console.error(err)
  process.exit(1)
})
