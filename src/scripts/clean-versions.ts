import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (payload.db as any).connection

  // Get all product IDs
  const products = await conn.collection('products').find({}).project({ _id: 1 }).toArray()
  const validIds = new Set(products.map((p: Record<string, unknown>) => String(p._id)))
  console.log('Valid product IDs:', validIds.size)

  // Get all unique parent IDs from versions
  const allParentIds = await conn.collection('_products_versions').distinct('parent')
  console.log('Unique parent IDs in versions:', allParentIds.length)

  // Find orphaned parent IDs (versions whose parent product no longer exists)
  const orphanedParents = allParentIds.filter((id: unknown) => !validIds.has(String(id)))
  console.log('Orphaned parent IDs (product deleted, versions remain):', orphanedParents.length)

  // Show orphaned version titles
  for (const parentId of orphanedParents) {
    const sample = await conn
      .collection('_products_versions')
      .findOne({ parent: parentId }, { projection: { 'version.title': 1, parent: 1 } })
    const title = sample?.version?.title
    const t =
      typeof title === 'object' && title !== null
        ? title.de || title.en || JSON.stringify(title)
        : String(title)
    const count = await conn.collection('_products_versions').countDocuments({ parent: parentId })
    console.log(`  ${parentId} -> "${t}" (${count} versions)`)
  }

  // Delete orphaned versions
  const args = process.argv.slice(2)
  if (args.includes('--clean')) {
    console.log('\nDeleting orphaned versions...')
    for (const parentId of orphanedParents) {
      const result = await conn.collection('_products_versions').deleteMany({ parent: parentId })
      console.log(`  Deleted ${result.deletedCount} versions for parent ${parentId}`)
    }
    const remaining = await conn.collection('_products_versions').countDocuments()
    console.log(`\nDone. Remaining versions: ${remaining}`)
  } else {
    console.log('\nDry run. Use --clean to delete orphaned versions.')
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
