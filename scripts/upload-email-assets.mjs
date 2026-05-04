#!/usr/bin/env node
/**
 * Upload all email assets (icons + logo submark) to R2.
 * Path: media/email/<filename>
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')
const ICONS_DIR = path.join(projectRoot, 'public/assets/icons/email')

const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('Missing R2 env vars')
  process.exit(1)
}

const client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

const files = readdirSync(ICONS_DIR).filter((f) => f.endsWith('.png'))
console.log(`Uploading ${files.length} email assets to ${R2_BUCKET}...`)

for (const f of files) {
  const body = readFileSync(path.join(ICONS_DIR, f))
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: `media/email/${f}`,
      Body: body,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
  process.stdout.write(`  ${f} OK\n`)
}
console.log('Done.')
