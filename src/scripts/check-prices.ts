import config from '@payload-config'
import { getPayload } from 'payload'

async function checkPrices() {
  const payload = await getPayload({ config })

  const products = await payload.find({
    collection: 'products',
    where: { slug: { like: 'workshop' } },
  })

  console.log('\n✅ Workshop Products:\n')
  for (const p of products.docs) {
    console.log(
      `${p.slug}: €${((p.priceInEUR ?? 0) / 100).toFixed(2)} (${p.priceInEUR ?? 0} cents)`,
    )
  }
  console.log()
}

checkPrices()
