import config from '@payload-config'
import { getPayload } from 'payload'

async function diagnoseCartPrice() {
  const payload = await getPayload({ config })

  console.log('\n💰 CART PRICE DIAGNOSTIC\n')

  // Get all carts
  const carts = await payload.find({
    collection: 'carts',
    depth: 2,
    limit: 10,
  })

  console.log(`Found ${carts.totalDocs} cart(s)\n`)

  for (const cart of carts.docs) {
    console.log(`\n📦 Cart: ${cart.id}`)
    console.log(`   Currency: ${cart.currency}`)
    console.log(`   Subtotal (DB): ${cart.subtotal}`)
    console.log(`   Items count: ${cart.items?.length || 0}\n`)

    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        console.log(`   📍 Item:`)
        console.log(`      Quantity: ${item.quantity}`)

        const product = typeof item.product === 'object' ? item.product : null
        if (product) {
          console.log(`      Product ID: ${product.id}`)
          console.log(`      Product slug: ${product.slug}`)
          console.log(`      Product title: ${product.title}`)
          console.log(`      Product priceInEUR: ${product.priceInEUR}`)
          console.log(`      Product priceInEUREnabled: ${product.priceInEUREnabled}`)
          console.log(`      Product inventory: ${product.inventory}`)

          // Calculate what price should be
          const calculatedPrice = (product.priceInEUR || 0) * item.quantity
          console.log(
            `      CALCULATED: ${item.quantity} × €${product.priceInEUR} = €${calculatedPrice}`,
          )
        } else {
          console.log(`      ❌ Product not populated! Product ID: ${item.product}`)
        }
        console.log()
      }
    }

    // Check what the subtotal should be
    let calculatedSubtotal = 0
    if (cart.items) {
      for (const item of cart.items) {
        const product = typeof item.product === 'object' ? item.product : null
        if (product && product.priceInEUR) {
          calculatedSubtotal += product.priceInEUR * item.quantity
        }
      }
    }
    console.log(`   ✓ Calculated subtotal should be: €${calculatedSubtotal}`)
    console.log(`   ✓ DB subtotal is: €${cart.subtotal}`)
    if (calculatedSubtotal !== cart.subtotal) {
      console.log(`   ⚠️  MISMATCH! DB subtotal is wrong!`)
    }
  }

  console.log('\n' + '='.repeat(70) + '\n')
}

diagnoseCartPrice()
