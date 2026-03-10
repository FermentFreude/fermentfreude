import config from '@payload-config'
import { getPayload } from 'payload'

async function testAddToCart() {
  const payload = await getPayload({ config })

  console.log('\n🧪 Testing Add to Cart\n')

  // Get a workshop product
  const products = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'workshop-kombucha' } },
    limit: 1,
  })

  if (!products.docs[0]) {
    console.error('❌ Product not found')
    process.exit(1)
  }

  const product = products.docs[0]
  console.log(`✓ Product found: ${product.slug}`)
  console.log(`  ID: ${product.id}`)
  console.log(`  priceInEUR: ${product.priceInEUR}`)
  console.log(`  priceInEUREnabled: ${product.priceInEUREnabled}`)
  console.log(`  inventory: ${product.inventory}`)

  // Get cart
  const cartId = '69af6dd1fc690b370e04d86e'
  let cart
  try {
    cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
    })
    console.log(`\n✓ Cart found: ${cart.id}`)
    console.log(`  Current items: ${cart.items?.length || 0}`)
  } catch (error) {
    console.error('❌ Cart not found:', error)
    process.exit(1)
  }

  // Try to add item
  console.log('\n🔄 Attempting to add item to cart...')
  try {
    const updatedCart = await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        items: [
          ...(cart.items || []),
          {
            product: product.id,
            quantity: 4,
          },
        ],
      },
    })
    console.log('✅ SUCCESS! Item added to cart')
    console.log(`  Total items: ${updatedCart.items?.length}`)
    console.log(`  Subtotal: ${updatedCart.subtotal}`)
  } catch (error: unknown) {
    const err = error as { message?: string; data?: unknown }
    console.error('\n❌ FAILED to add item:')
    console.error(err.message ?? 'Unknown error')
    if (err.data) {
      console.error('Error details:', JSON.stringify(err.data, null, 2))
    }
  }

  process.exit(0)
}

testAddToCart()
