import config from '@payload-config'
import { getPayload } from 'payload'

async function fixCartCurrency() {
  const payload = await getPayload({ config })

  const cartId = '69af6dd1fc690b370e04d86e'

  console.log('\n🔧 Fixing cart currency...\n')

  // Get current cart
  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId,
  })

  console.log(`Current cart currency: ${cart.currency || 'UNDEFINED'}`)

  // Update cart to EUR
  const updated = await payload.update({
    collection: 'carts',
    id: cartId,
    data: {
      currency: 'EUR',
    },
  })

  console.log(`✅ Cart currency updated to: ${updated.currency}`)
  console.log(`   Cart ID: ${updated.id}`)

  process.exit(0)
}

fixCartCurrency()
