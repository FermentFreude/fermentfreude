import config from '@payload-config'
import { getPayload } from 'payload'

async function clearCart() {
  const payload = await getPayload({ config })

  const cartId = '69af6dd1fc690b370e04d86e'

  console.log('\n🧹 Clearing cart...\n')

  await payload.update({
    collection: 'carts',
    id: cartId,
    data: {
      items: [],
      subtotal: 0,
    },
  })

  console.log('✅ Cart cleared! Ready for fresh workshop booking.\n')
  process.exit(0)
}

clearCart()
