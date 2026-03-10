import config from '@payload-config'
import { getPayload } from 'payload'

async function checkProductFields() {
  const payload = await getPayload({ config })

  const products = await payload.find({
    collection: 'products',
    where: {
      slug: { in: ['workshop-lakto', 'workshop-kombucha', 'workshop-tempeh'] },
    },
    limit: 10,
  })

  console.log('\n🔍 Workshop Products - Full Field Check:\n')

  products.docs.forEach((p) => {
    console.log(`\n${p.slug}:`)
    console.log(`  id: ${p.id}`)
    console.log(`  title: ${p.title}`)
    console.log(`  priceInEUR: ${p.priceInEUR}`)
    console.log(`  priceInEUREnabled: ${p.priceInEUREnabled}`)
    console.log(`  inventory: ${p.inventory}`)
    console.log(`  _status: ${p._status}`)
    console.log(`  enableVariants: ${p.enableVariants}`)
    console.log(`  skipSync: ${(p as unknown as Record<string, unknown>).skipSync ?? 'undefined'}`)

    // Check all price-related fields
    const allFields = Object.keys(p).filter(
      (key) =>
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('inventory') ||
        key.toLowerCase().includes('status'),
    )
    console.log(`  All price/inventory/status fields: ${allFields.join(', ')}`)
  })

  process.exit(0)
}

checkProductFields()
