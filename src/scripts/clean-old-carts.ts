import config from '@payload-config'
import { getPayload } from 'payload'

async function cleanOldCarts() {
  const payload = await getPayload({ config })

  console.log('\n🗑️  Deleting old/broken carts...\n')

  const currentCartId = '69af6dd1fc690b370e04d86e'

  // Get all carts
  const carts = await payload.find({
    collection: 'carts',
    limit: 1000,
  })

  console.log(`Found ${carts.totalDocs} carts\n`)

  for (const cart of carts.docs) {
    if (cart.id !== currentCartId) {
      console.log(`Deleting cart ${cart.id} (currency: ${cart.currency || 'undefined'})`)
      try {
        await payload.delete({
          collection: 'carts',
          id: cart.id,
        })
        console.log(`  ✅ Deleted`)
      } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`)
      }
    } else {
      console.log(`Keeping current cart ${cart.id} (currency: ${cart.currency})`)
    }
  }

  console.log('\n✅ Done!')
  process.exit(0)
}

cleanOldCarts()
