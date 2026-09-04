/**
 * Apply David's physical shop product copy (Tempeh + Kimchi) to the CMS.
 *
 * - Updates DE first, then EN (sequential — MongoDB M0)
 * - Sets Kimchi ingredients/allergens placeholders + isGlutenFree: false
 * - Links Tempeh products to the Tempeh category when present
 *
 * Run: pnpm patch:shop-copy
 */

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import config from '@payload-config'
import { getPayload } from 'payload'

import {
  SHOP_PHYSICAL_PRODUCTS,
  KIMCHI_CATEGORY,
  TEMPEH_CATEGORY,
} from './data/shop-physical-products'
import { CTX, findProductBySlug } from './migrations/_helpers'

async function ensureCategory(
  payload: Awaited<ReturnType<typeof getPayload>>,
  category: { slug: string; titleDe: string; titleEn: string },
): Promise<string | null> {
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: category.slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]?.id) {
    return String(existing.docs[0].id)
  }

  const created = await payload.create({
    collection: 'categories',
    locale: 'de',
    data: {
      title: category.titleDe,
      slug: category.slug,
    },
    context: CTX,
    overrideAccess: true,
  })

  await payload.update({
    collection: 'categories',
    id: created.id,
    locale: 'en',
    data: { title: category.titleEn },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`  ✔ Created category "${category.titleDe}"`)
  return String(created.id)
}

async function main() {
  const payload = await getPayload({ config })
  payload.logger.info('📝 Patching shop physical product copy (DE/EN)…')

  const tempehCategoryId = await ensureCategory(payload, TEMPEH_CATEGORY)
  const kimchiCategoryId = await ensureCategory(payload, KIMCHI_CATEGORY)

  for (const product of SHOP_PHYSICAL_PRODUCTS) {
    const id = await findProductBySlug(payload, product.slug, true)
    if (!id) {
      throw new Error(`Product not found: ${product.slug}. Run: pnpm seed products`)
    }

    const categoryId =
      product.slug === 'classic-kimchi' ? kimchiCategoryId : tempehCategoryId

    const sharedFields = {
      productType: product.productType,
      priceInEUR: product.priceInEUR,
      ...(categoryId ? { categories: [categoryId] } : {}),
    }

    await payload.update({
      collection: 'products',
      id,
      locale: 'de',
      data: { ...sharedFields, ...product.de } as never,
      context: CTX,
      overrideAccess: true,
    })

    await payload.update({
      collection: 'products',
      id,
      locale: 'en',
      data: { ...product.en } as never,
      context: CTX,
      overrideAccess: true,
    })

    payload.logger.info(`  ✔ ${product.slug}`)
  }

  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag('pages')
    revalidateTag('shop-page')
    revalidateTag('products')
  } catch {
    payload.logger.info('  ℹ Restart pnpm dev or hard-refresh if pages look cached')
  }

  payload.logger.info('✅ Shop product copy patch complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Shop product copy patch failed:', err)
  process.exit(1)
})
