/**
 * Delete ALL existing objects from Cloudflare R2 storage.
 * Run this BEFORE re-seeding to start fresh with optimized images.
 *
 * Usage:
 *   set -a && source .env && set +a && npx tsx src/scripts/clean-blobs.ts
 *
 * This will:
 *   1. List all objects in the R2 bucket
 *   2. Delete them in batches
 *   3. Report total space reclaimed
 *
 * After running this, run `pnpm seed` to re-upload optimized images.
 */
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'

async function cleanR2() {
  const bucket = process.env.R2_BUCKET
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    console.error('❌ R2 env vars missing. Run: set -a && source .env && set +a')
    process.exit(1)
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })

  console.log('🗑️  Listing all objects in R2…')

  // Collect all objects (paginated)
  let continuationToken: string | undefined
  const allObjects: { key: string; size: number }[] = []
  do {
    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    )
    if (result.Contents) {
      allObjects.push(
        ...result.Contents.map((o: { Key?: string; Size?: number }) => ({ key: o.Key!, size: o.Size ?? 0 })),
      )
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined
  } while (continuationToken)

  if (allObjects.length === 0) {
    console.log('✅ Bucket is already empty.')
    return
  }

  const totalMB = (allObjects.reduce((sum, o) => sum + o.size, 0) / 1024 / 1024).toFixed(2)
  console.log(`  Found ${allObjects.length} objects (${totalMB} MB total)`)

  // Delete in batches of 1000 (S3 API limit)
  const batchSize = 1000
  for (let i = 0; i < allObjects.length; i += batchSize) {
    const batch = allObjects.slice(i, i + batchSize)
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((o) => ({ Key: o.key })) },
      }),
    )
    console.log(`  🗑️  Deleted batch ${Math.floor(i / batchSize) + 1} (${batch.length} objects)`)
  }

  console.log(`\n✅ Deleted ${allObjects.length} objects, reclaimed ~${totalMB} MB`)
  console.log('   Now run: pnpm seed')
}

cleanR2().catch((err) => {
  console.error('❌ Failed:', err.message)
  process.exit(1)
})
