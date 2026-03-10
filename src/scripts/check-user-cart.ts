import config from '@payload-config'
import { getPayload } from 'payload'

async function checkUserCart() {
  const payload = await getPayload({ config })

  const cartId = '69af6dd1fc690b370e04d86e'

  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId,
    depth: 2,
  })

  console.log('\n📊 Current User Cart:\n')
  console.log(`Cart ID: ${cart.id}`)
  console.log(`Currency: ${cart.currency}`)
  console.log(`Subtotal (cents): ${cart.subtotal ?? 0}`)
  console.log(`Subtotal (display): €${((cart.subtotal ?? 0) / 100).toFixed(2)}`)
  console.log(`Items: ${cart.items?.length || 0}\n`)

  if (cart.items && cart.items.length > 0) {
    cart.items.forEach((item, i) => {
      const product = typeof item.product === 'object' ? item.product : null
      if (product) {
        console.log(`Item ${i + 1}:`)
        console.log(`  Product: ${product.title}`)
        console.log(`  Slug: ${product.slug}`)
        console.log(`  Quantity: ${item.quantity}`)
        console.log(
          `  Price per unit: €${((product.priceInEUR ?? 0) / 100).toFixed(2)} (${product.priceInEUR ?? 0} cents)`,
        )
        console.log(
          `  Line total: €${(((product.priceInEUR ?? 0) * item.quantity) / 100).toFixed(2)}`,
        )
        console.log()
      }
    })

    const calculatedTotal = cart.items.reduce((sum, item) => {
      const product = typeof item.product === 'object' ? item.product : null
      if (product && product.priceInEUR) {
        return sum + product.priceInEUR * item.quantity
      }
      return sum
    }, 0)

    console.log(
      `Calculated total should be: €${(calculatedTotal / 100).toFixed(2)} (${calculatedTotal} cents)`,
    )
    console.log(
      `Actual DB subtotal: €${((cart.subtotal ?? 0) / 100).toFixed(2)} (${cart.subtotal ?? 0} cents)`,
    )

    if (calculatedTotal !== (cart.subtotal ?? 0)) {
      console.log(`\n⚠️  MISMATCH! Cart subtotal needs recalculation!`)
    } else {
      console.log(`\n✅ Subtotal matches!`)
    }
  }

  console.log()
}

checkUserCart()
