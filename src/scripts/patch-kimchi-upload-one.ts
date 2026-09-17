/**
 * Upload one Kimchi image and print live URL. Staging only.
 * Usage: pnpm exec tsx src/scripts/patch-kimchi-upload-one.ts stone
 */
import fs from 'fs'
import path from 'path'
// @ts-expect-error — dotenv
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const FILES: Record<string, string> = {
  wood: 'tmp/kimchi-prod/wood-clean.webp',
  stone: 'tmp/kimchi-prod/stone-clean.webp',
  bowl: 'tmp/kimchi-prod/2.webp',
  life: 'tmp/kimchi-prod/3.webp',
  'v3-pack': 'tmp/kimchi-prod/gallery-v3/01-pack.webp',
  'v3-wood': 'tmp/kimchi-prod/gallery-v3/02-wood.webp',
  'v3-stone': 'tmp/kimchi-prod/gallery-v3/03-stone.webp',
  'v3-pack-nobg': 'tmp/kimchi-prod/gallery-v3/01-pack-nobg.webp',
}

function assertStaging() {
  if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
    console.error('🚫 staging only')
    process.exit(1)
  }
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

async function urlOk(url: string) {
  try {
    const head = await fetch(url, { method: 'HEAD' })
    if (head.ok) return true
    const get = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } })
    return get.ok || get.status === 206
  } catch {
    return false
  }
}

async function main() {
  assertStaging()
  const key = process.argv[2] || 'stone'
  const rel = FILES[key]
  if (!rel) throw new Error(`unknown key ${key}`)
  const abs = path.resolve(process.cwd(), rel)
  if (!fs.existsSync(abs)) throw new Error(`missing ${abs}`)

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const buf = fs.readFileSync(abs)
  const filename = `kimchi-${key}-${Date.now()}.webp`
  console.log('upload', filename, buf.byteLength)

  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: 'Kimchi' },
    file: { name: filename, data: buf, mimetype: 'image/webp', size: buf.byteLength },
    context: CTX,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: 'Kimchi' },
    context: CTX,
    overrideAccess: true,
  })
  const fresh = await payload.findByID({
    collection: 'media',
    id: media.id,
    depth: 0,
    overrideAccess: true,
  })
  console.log('id', media.id)
  console.log('url', fresh.url)
  console.log('filename', fresh.filename)

  for (let i = 0; i < 40; i++) {
    const ok = await urlOk(String(fresh.url))
    console.log(`check ${i}`, ok)
    if (ok) {
      console.log('OK', media.id, fresh.url)
      return
    }
    await sleep(2000)
  }
  throw new Error(`404 ${fresh.url}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
