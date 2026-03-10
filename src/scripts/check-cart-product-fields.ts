import config from '@payload-config'
import { getPayload } from 'payload'

async function checkCartProductFields() {
  const payload = await getPayload({ config })

  const cartId = '69af6dd1fc690b370e04d86e'

  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId,
    depth: 2,
  })

  console.log('\n📊 Cart Product Fields Check:\n')
  console.log(`Cart ID: ${cart.id}`)
  console.log(`Currency: ${cart.currency}`)
  console.log(`Total items: ${cart.items?.length || 0}\n`)

  if (cart.items && cart.items.length > 0) {
    cart.items.forEach((item, i) => {
      console.log(`Item ${i + 1}:`)
      console.log(`  Item ID: ${item.id}`)
      console.log(`  Quantity: ${item.quantity}`)

      if (typeof item.product === 'object' && item.product !== null) {
        const product = item.product
        console.log(`  Product ID: ${product.id}`)
        console.log(`  Product Slug: ${product.slug}`)
        console.log(`  Product Title: ${product.title}`)
        console.log(`  Product priceInEUR: ${product.priceInEUR}`)
        console.log(`  Product priceInEUREnabled: ${product.priceInEUREnabled}`)
        console.log(`  Has priceInEUR field: ${product.hasOwnProperty('priceInEUR')}`)
        console.log(`  priceInEUR type: ${typeof product.priceInEUR}`)
        console.log(`  priceInEUR value: ${product.priceInEUR}`)

        if (product.priceInEUR) {
          console.log(`  ✅ Price in euros: €${(product.priceInEUR / 100).toFixed(2)}`)
        } else {
          console.log(`  ❌ priceInEUR is ${product.priceInEUR}`)
        }
      } else {
        console.log(`  ❌ Product is not populated (got string ID: ${item.product})`)
      }
      console.log()
    })
  }

  console.log('\n════════════════════════════════════════\n')
}

checkCartProductFields()
