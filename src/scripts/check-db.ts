import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (payload.db as any).connection

  console.log('Database name:', conn.name)

  const count = await conn.collection('products').countDocuments()
  console.log('products collection:', count, 'documents')

  const vcount = await conn.collection('_products_versions').countDocuments()
  console.log('_products_versions:', vcount, 'documents')

  const uniqueParents = await conn.collection('_products_versions').distinct('parent')
  console.log('Unique parent IDs in versions:', uniqueParents.length)

  const allProducts = await conn
    .collection('products')
    .find({})
    .project({ _id: 1, title: 1, _status: 1, deletedAt: 1 })
    .toArray()

  console.log('\nAll products in collection:')
  allProducts.forEach((p: Record<string, unknown>, i: number) => {
    const titleObj = p.title as Record<string, string> | string | null
    const t =
      typeof titleObj === 'object' && titleObj !== null
        ? titleObj.de || titleObj.en || JSON.stringify(titleObj)
        : String(titleObj)
    console.log(`  ${i + 1}. ${p._id} - "${t}" [${p._status}] ${p.deletedAt ? 'TRASHED' : ''}`)
  })

  // Check if the Payload API returns more
  console.log('\n--- Payload API find (what admin sees) ---')
  const apiResult = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })
  console.log('Payload API returned:', apiResult.totalDocs, 'products')
  apiResult.docs.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.id} - "${p.title}" [${p._status}]`)
  })

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
