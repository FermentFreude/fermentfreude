/**
 * Quick script to list media documents and their filename field.
 * Usage: npx tsx src/scripts/list-media.ts
 * Optional: pass "Untitled Project" to filter by filename containing that string.
 */
import 'dotenv/config'

import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const filter = process.argv[2] || ''
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'media',
    limit: 500,
    ...(filter && {
      where: {
        filename: { like: `%${filter}%` },
      },
    }),
  })
  console.log(`Media documents (${result.docs.length} total):\n`)
  for (const doc of result.docs) {
    console.log(`  id: ${doc.id}  filename: ${(doc as { filename?: string }).filename ?? '(none)'}`)
  }
  if (payload.db.destroy) await payload.db.destroy()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
