/**
 * Inspect Kimchi gallery media on staging (filenames/URLs).
 * Run: pnpm exec tsx src/scripts/inspect-kimchi-gallery.ts
 */
import path from 'path'
// @ts-expect-error — dotenv
import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (!dbUrl.includes('-staging')) {
    console.error('staging only')
    process.exit(1)
  }
  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'products',
    where: { or: [{ slug: { equals: 'kimchi' } }, { slug: { equals: 'classic-kimchi' } }] },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })
  const p = found.docs[0]
  if (!p) throw new Error('not found')
  console.log('product', p.id, p.slug, p.title)
  for (const [i, g] of (p.gallery ?? []).entries()) {
    const img = g?.image
    if (typeof img === 'object' && img) {
      console.log(JSON.stringify({ i, id: img.id, filename: img.filename, url: img.url, w: img.width, h: img.height }, null, 0))
    }
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
