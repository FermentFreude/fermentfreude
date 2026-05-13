#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

dotenv.config()

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run') || args.includes('-n')
const prefixArg = args.find(a => a.startsWith('--prefix='))
const destPrefix = prefixArg ? prefixArg.split('=')[1] : 'media/email/'
const localDir = path.join(process.cwd(), 'public', 'assets', 'icons', 'email')

function normalizePrefix(p) {
  if (!p) return ''
  return p.replace(/^\/+|\/+$/g, '')
}

function contentTypeFromExt(filename) {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.svg':
      return 'image/svg+xml'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

async function listFiles(dir) {
  const names = await fs.readdir(dir, { withFileTypes: true })
  return names.filter(n => n.isFile()).map(n => n.name)
}

async function main() {
  let files
  try {
    files = await listFiles(localDir)
  } catch (err) {
    console.error(`Cannot read local dir ${localDir}:`, err.message)
    process.exit(1)
  }

  if (!files || files.length === 0) {
    console.log('No files found in', localDir)
    return
  }

  const prefix = normalizePrefix(destPrefix)
  const fileInfos = files.map(f => ({ name: f, localPath: path.join(localDir, f), key: prefix ? `${prefix}/${f}` : f }))

  if (dryRun) {
    console.log('Dry run — files that would be uploaded:')
    fileInfos.forEach(info => console.log('-', info.name, '->', info.key))
    return
  }

  const R2_ENDPOINT = process.env.R2_ENDPOINT
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
  const R2_BUCKET = process.env.R2_BUCKET
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL

  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    console.error('Missing one or more R2 env vars. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET')
    process.exit(1)
  }

  const s3 = new S3Client({
    endpoint: R2_ENDPOINT,
    region: 'auto',
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })

  for (const info of fileInfos) {
    try {
      const data = await fs.readFile(info.localPath)
      const contentType = contentTypeFromExt(info.name)
      const putParams = {
        Bucket: R2_BUCKET,
        Key: info.key,
        Body: data,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }

      await s3.send(new PutObjectCommand(putParams))
      const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL.replace(/\/+$/, '')}/${info.key}` : `${R2_ENDPOINT.replace(/\/+$/, '')}/${R2_BUCKET}/${info.key}`
      console.log('Uploaded', info.name, '->', info.key)
      console.log('Public URL:', publicUrl)
    } catch (err) {
      console.error('Failed to upload', info.name, err.message || err)
    }
  }

  console.log('Upload complete.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
