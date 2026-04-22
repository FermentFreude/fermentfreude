#!/usr/bin/env node

/**
 * Upload Email Social Icons to R2
 *
 * Usage: pnpm run upload-email-icons
 *
 * Uploads the Instagram and Facebook icons to R2 storage
 * so they display correctly in email templates.
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Get R2 credentials from environment
const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('❌ Missing R2 environment variables:')
  console.error('   Required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET')
  process.exit(1)
}

// Initialize S3 client for R2
const client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const ICONS = [
  {
    local: path.join(projectRoot, 'public/assets/icons/email/instagram.png'),
    r2: 'media/email/instagram.png',
    name: 'Instagram Icon',
  },
  {
    local: path.join(projectRoot, 'public/assets/icons/email/facebook.png'),
    r2: 'media/email/facebook.png',
    name: 'Facebook Icon',
  },
]

async function uploadIcons() {
  console.log('🚀 Uploading email social media icons to R2...\n')

  let successCount = 0
  let failureCount = 0

  for (const icon of ICONS) {
    process.stdout.write(`  Uploading ${icon.name}... `)

    try {
      const fileContent = readFileSync(icon.local)

      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: icon.r2,
          Body: fileContent,
          ContentType: 'image/png',
        }),
      )

      console.log(`✅`)
      successCount++
    } catch (error) {
      console.log(`❌ ${error.message}`)
      failureCount++
    }
  }

  console.log()
  console.log('─'.repeat(50))
  console.log(`Summary: ${successCount} uploaded, ${failureCount} failed`)
  console.log()

  if (failureCount === 0) {
    console.log(
      '✅ All email icons uploaded successfully! Footer icons will now display in emails.',
    )
    process.exit(0)
  } else {
    console.log('⚠️  Some icons failed to upload. Check R2 credentials.')
    process.exit(1)
  }
}

uploadIcons().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
