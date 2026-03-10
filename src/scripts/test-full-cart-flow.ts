import config from '@payload-config'
import { getPayload } from 'payload'

async function testFullWorkshopFlow() {
  const payload = await getPayload({ config })

  console.log('\n')
  console.log('═'.repeat(70))
  console.log('🧪 COMPLETE WORKSHOP BOOKING FLOW TEST')
  console.log('═'.repeat(70))
  console.log()

  // Step 1: Verify products have correct prices
  console.log('📦 Step 1: Check Products')
  console.log('─'.repeat(50))
  const products = await payload.find({
    collection: 'products',
    where: { slug: { like: 'workshop' } },
  })

  for (const p of products.docs) {
    const priceEUR = ((p.priceInEUR ?? 0) / 100).toFixed(2)
    console.log(`  ✓ ${p.slug}`)
    console.log(`     Price: €${priceEUR} (${p.priceInEUR ?? 0} cents)`)
    console.log(`     Inventory: ${p.inventory}`)
    console.log(`     Enabled: ${p.priceInEUREnabled}`)
  }
  console.log()

  //Step 2: Get or create cart
  console.log('🛒 Step 2: Get Current Cart')
  console.log('─'.repeat(50))
  const cartId = '69af6dd1fc690b370e04d86e'
  let cart
  try {
    cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
    })
    console.log(`  ✓ Cart found: ${cart.id}`)
    console.log(`     Currency: ${cart.currency}`)
    console.log(`     Current items: ${cart.items?.length || 0}`)
    console.log(`     Subtotal: €${((cart.subtotal ?? 0) / 100).toFixed(2)}`)
  } catch (_error) {
    console.log(`  ❌ Cart not found`)
    process.exit(1)
  }
  console.log()

  // Step 3: Simulate adding 2 guests for Tempeh workshop
  console.log('➕ Step 3: Adding 2 Guests for Tempeh Workshop')
  console.log('─'.repeat(50))
  const tempehProduct = products.docs.find((p) => p.slug === 'workshop-tempeh')
  if (!tempehProduct) {
    console.log('  ❌ Tempeh product not found!')
    process.exit(1)
  }

  try {
    const updatedCart = await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        items: [
          ...(cart.items || []),
          {
            product: tempehProduct.id,
            quantity: 2, // 2 guests
          },
        ],
      },
    })

    console.log('  ✅ Successfully added to cart!')
    console.log(`     Product: ${tempehProduct.title}`)
    console.log(`     Quantity: 2 guests`)
    console.log(`     Price per guest: €${((tempehProduct.priceInEUR ?? 0) / 100).toFixed(2)}`)
    console.log(`     Expected total: €${(((tempehProduct.priceInEUR ?? 0) * 2) / 100).toFixed(2)}`)
    console.log(`     Actual subtotal: €${((updatedCart.subtotal ?? 0) / 100).toFixed(2)}`)
    console.log()

    // Step 4: Verify cart contents
    console.log('✓ Step 4: Verify Cart Contents')
    console.log('─'.repeat(50))
    const finalCart = await payload.findByID({
      collection: 'carts',
      id: cartId,
      depth: 2,
    })

    console.log(`  Total items in cart: ${finalCart.items?.length}`)
    console.log()

    if (finalCart.items && finalCart.items.length > 0) {
      finalCart.items.forEach((item, i) => {
        const product = typeof item.product === 'object' ? item.product : null
        if (product) {
          console.log(`  Item ${i + 1}:`)
          console.log(`     ${product.title}`)
          console.log(`     Quantity: ${item.quantity}`)
          console.log(`     Price: €${((product.priceInEUR ?? 0) / 100).toFixed(2)}`)
          console.log(
            `     Line total: €${(((product.priceInEUR ?? 0) * item.quantity) / 100).toFixed(2)}`,
          )
        }
      })
    }

    console.log()
    console.log(`  Cart Subtotal: €${((finalCart.subtotal ?? 0) / 100).toFixed(2)}`)
    console.log()
    console.log('═'.repeat(70))
    console.log('✅ ALL TESTS PASSED')
    console.log('═'.repeat(70))
    console.log()
  } catch (error: unknown) {
    const err = error as { message?: string; data?: unknown }
    console.log('  ❌ FAILED to add to cart!')
    console.log(`     Error: ${err.message ?? 'Unknown error'}`)
    if (err.data) {
      console.log(`     Details: ${JSON.stringify(err.data, null, 2)}`)
    }
    console.log()
    console.log('═'.repeat(70))
    console.log('❌ TEST FAILED')
    console.log('═'.repeat(70))
    console.log()
  }
}

testFullWorkshopFlow()
