/**
 * Diagnose shop page CMS state — run: pnpm tsx src/scripts/diagnose-shop.ts
 */
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })

  console.log('\n=== PRODUCTS ===')
  for (const slug of ['kaeferbohnen-tempeh', 'berglinsen-tempeh', 'classic-kimchi']) {
    const r = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })
    const p = r.docs[0]
    if (!p) {
      console.log(slug, 'MISSING')
      continue
    }
    const img = p.gallery?.[0]?.image
    const imgInfo =
      typeof img === 'object' && img
        ? { filename: img.filename, url: img.url }
        : img
    console.log({
      slug,
      id: p.id,
      title: p.title,
      galleryLen: p.gallery?.length ?? 0,
      img: imgInfo,
      isSeasonal: p.isSeasonal,
    })
  }

  console.log('\n=== SHOP PAGE BLOCKS ===')
  const page = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'shop' } },
    limit: 1,
    depth: 2,
    locale: 'de',
    overrideAccess: true,
  })
  const doc = page.docs[0]
  if (!doc) {
    console.log('NO SHOP PAGE')
    process.exit(1)
  }
  console.log('page id', doc.id, 'layout length', doc.layout?.length)

  for (const b of doc.layout || []) {
    const block = b as Record<string, unknown>
    if (!['shopHero', 'featuredProductCards', 'shopProductList'].includes(String(block.blockType))) {
      continue
    }
    console.log('\n---', block.blockType, '---')
    console.log('visible:', block.visible)
    console.log('heading:', block.heading)
    if (block.blockType === 'shopHero') {
      const hp = block.heroProduct
      console.log(
        'heroProduct:',
        typeof hp === 'object' && hp
          ? {
              id: (hp as { id: string }).id,
              title: (hp as { title?: string }).title,
              slug: (hp as { slug?: string }).slug,
              gallery: (hp as { gallery?: unknown[] }).gallery?.length,
            }
          : hp,
      )
      console.log('heroTitle:', block.heroTitle)
      console.log('slides:', Array.isArray(block.slides) ? block.slides.length : block.slides)
    }
    if (block.blockType === 'featuredProductCards') {
      const banner = block.bannerProduct
      const products = block.products as unknown[]
      console.log(
        'bannerProduct:',
        typeof banner === 'object' && banner
          ? { title: (banner as { title?: string }).title, gallery: (banner as { gallery?: unknown[] }).gallery?.length }
          : banner,
      )
      console.log(
        'products:',
        Array.isArray(products)
          ? products.map((p) =>
              typeof p === 'object' && p
                ? {
                    title: (p as { title?: string }).title,
                    slug: (p as { slug?: string }).slug,
                    gallery: (p as { gallery?: unknown[] }).gallery?.length,
                  }
                : p,
            )
          : products,
      )
    }
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
