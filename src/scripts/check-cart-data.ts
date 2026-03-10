import config from '@payload-config'
import { getPayload } from 'payload'

async function checkCartData() {
  const payload = await getPayload({ config })

  // Find the most recent cart
  const carts = await payload.find({
    collection: 'carts',
    sort: '-updatedAt',
    limit: 5,
  })

  console.log('\n🛒 Recent Carts:\n')

  carts.docs.forEach((cart, index) => {
    console.log(`\nCart ${index + 1}:`)
    console.log(`  ID: ${cart.id}`)
    console.log(`  Items: ${cart.items?.length || 0}`)
    console.log(`  Subtotal: ${cart.subtotal}`)
    console.log(`  Updated: ${new Date(cart.updatedAt).toLocaleString()}`)

    if (cart.items && cart.items.length > 0) {
      console.log(`  Cart items:`)
      cart.items.forEach((item, i) => {
        const product = typeof item.product === 'object' ? item.product : null
        console.log(`    ${i + 1}. ${product?.title || item.product}`)
        console.log(`       Quantity: ${item.quantity}`)
        console.log(
          `       Product ID: ${typeof item.product === 'string' ? item.product : product?.id}`,
        )
      })
    }
  })

  process.exit(0)
}

checkCartData()
