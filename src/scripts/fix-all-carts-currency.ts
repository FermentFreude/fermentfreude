import config from '@payload-config'
import { getPayload } from 'payload'

async function fixAllCarts() {
  const payload = await getPayload({ config })

  console.log('\n🔧 Fixing all cart currencies to EUR...\n')

  // Get all carts
  const carts = await payload.find({
    collection: 'carts',
    limit: 1000,
  })

  console.log(`Found ${carts.totalDocs} carts\n`)

  let fixed = 0
  let alreadyEUR = 0

  for (const cart of carts.docs) {
    if (cart.currency !== 'EUR') {
      console.log(`Fixing cart ${cart.id}: ${cart.currency || 'undefined'} → EUR`)
      await payload.update({
        collection: 'carts',
        id: cart.id,
        data: {
          currency: 'EUR',
        },
      })
      fixed++
    } else {
      alreadyEUR++
    }
  }

  console.log(`\n✅ Done!`)
  console.log(`   Fixed: ${fixed}`)
  console.log(`   Already EUR: ${alreadyEUR}`)

  process.exit(0)
}

fixAllCarts()
