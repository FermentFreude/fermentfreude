import config from '@payload-config'
import { getPayload } from 'payload'

async function checkEURPricing() {
  const payload = await getPayload({ config })

  const products = await payload.find({
    collection: 'products',
    where: {
      slug: {
        in: ['workshop-lakto', 'workshop-kombucha', 'workshop-tempeh'],
      },
    },
    limit: 10,
  })

  console.log('\n📊 Workshop Products - EUR Pricing Check:\n')
  console.log(`Found ${products.docs.length} workshop products\n`)

  products.docs.forEach((p) => {
    console.log(`${p.slug}:`)
    console.log(`  - title: ${p.title}`)
    console.log(`  - priceInEUR: €${p.priceInEUR ?? 0}`)
    console.log(`  - inventory: ${p.inventory ?? 0}`)
    console.log(`  - priceInEUREnabled: ${p.priceInEUREnabled ?? false}\n`)
  })

  process.exit(0)
}

checkEURPricing()
