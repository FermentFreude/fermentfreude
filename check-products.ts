import { getPayload } from 'payload'
import config from './src/payload.config'

async function check() {
  const payload = await getPayload({ config })
  const products = await payload.find({ collection: 'products', limit: 20, depth: 0, locale: 'en' })
  for (const p of products.docs) {
    console.log('---')
    console.log('title:', p.title)
    console.log('productType:', p.productType)
    console.log('brand:', p.brand ?? '(empty)')
    console.log('flavour:', p.flavour ?? '(empty)')
    console.log('unitSize:', p.unitSize ?? '(empty)')
    console.log('badges:', p.badges?.join(', ') ?? '(none)')
    console.log('benefits count:', p.benefits?.length ?? 0)
    console.log('shortDesc:', p.shortDescription ? 'YES' : '(empty)')
    console.log('description:', p.description ? 'YES' : '(empty)')
    console.log('aboutProduct:', p.aboutProduct ? 'YES' : '(empty)')
    console.log('ingredients:', p.ingredients ? 'YES' : '(empty)')
    console.log('howToUse:', p.howToUse ? 'YES' : '(empty)')
    console.log('storageInstructions:', p.storageInstructions ? 'YES' : '(empty)')
    console.log('gallery:', p.gallery?.length ?? 0, 'images')
  }
  process.exit(0)
}
check()
