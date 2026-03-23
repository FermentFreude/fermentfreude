/**
 * Delete duplicate/unwanted products from the database.
 *
 * Usage:
 *   npx dotenv -- npx tsx src/scripts/delete-products.ts           # List all products (dry run)
 *   npx dotenv -- npx tsx src/scripts/delete-products.ts --delete   # Delete ALL products
 *   npx dotenv -- npx tsx src/scripts/delete-products.ts --delete <id1> <id2>  # Delete specific IDs
 */
import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const args = process.argv.slice(2)
  const shouldDelete = args.includes('--delete')
  const keepOnly = args.includes('--keep-valid')
  const specificIds = args.filter((a) => a !== '--delete' && a !== '--keep-valid')

  const payload = await getPayload({ config })

  // Use the MongoDB adapter directly to find ALL documents including trashed ones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = payload.db as any
  const collection = db.connection.collection('products')
  const allDocs = await collection
    .find({})
    .project({ _id: 1, title: 1, _status: 1, deletedAt: 1, createdAt: 1 })
    .toArray()

  console.log(`\n📦 Found ${allDocs.length} total products (including trashed):\n`)
  console.log(`   Database: ${db.connection.name}\n`)
  allDocs.forEach((p: Record<string, unknown>, i: number) => {
    const trashed = p.deletedAt ? `🗑️ TRASHED` : '✅ Active'
    // title is localized — stored as { de: "...", en: "..." }
    const title =
      typeof p.title === 'object' && p.title !== null
        ? (p.title as Record<string, string>).de ||
          (p.title as Record<string, string>).en ||
          JSON.stringify(p.title)
        : String(p.title)
    console.log(`  ${i + 1}. [${p._id}] "${title}" — ${p._status ?? 'n/a'} — ${trashed}`)
  })

  if (!shouldDelete) {
    console.log('\n💡 Dry run. Options:')
    console.log('   --delete              Delete ALL products')
    console.log(
      '   --delete --keep-valid Delete only trashed/duplicate products, keep the 8 valid ones',
    )
    console.log('   --delete <id1> <id2>  Delete specific IDs\n')
    process.exit(0)
  }

  let toDelete: Array<Record<string, unknown>>

  if (keepOnly) {
    // Keep only the 8 valid active products, delete everything else (trashed + duplicates)
    const validProducts = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 200,
    })
    const validIds = new Set(validProducts.docs.map((p) => String(p.id)))
    toDelete = allDocs.filter((p: Record<string, unknown>) => !validIds.has(String(p._id)))
    console.log(
      `\n🔒 Keeping ${validIds.size} valid products, deleting ${toDelete.length} trashed/duplicate ones...\n`,
    )
  } else if (specificIds.length > 0) {
    toDelete = allDocs.filter((p: Record<string, unknown>) => specificIds.includes(String(p._id)))
  } else {
    toDelete = allDocs
  }

  console.log(`\n🗑️  Deleting ${toDelete.length} product(s) directly from MongoDB...\n`)

  for (const product of toDelete) {
    try {
      // Hard-delete directly from MongoDB to bypass Payload's trash system
      await collection.deleteOne({ _id: product._id })
      // Also delete any associated versions
      const versionsCollection = db.connection.collection('_products_versions')
      await versionsCollection.deleteMany({ parent: product._id })
      console.log(`  ✅ Deleted: "${product.title}" (${product._id})`)
    } catch (err) {
      console.error(`  ❌ Failed to delete "${product.title}" (${product._id}):`, err)
    }
  }

  console.log('\n✅ Done.\n')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
