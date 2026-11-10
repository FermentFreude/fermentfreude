/**
 * Read-only: print a page's DE text fields (strings only) as path = value, plus
 * its publish status and latest versions. Used to diff founders' copy docs
 * against what's in the CMS.
 *
 * Run:  npx tsx src/scripts/dump-page-copy.ts <slug> [locale]   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const slug = process.argv[2] ?? 'home'
const locale = (process.argv[3] ?? 'de') as 'de' | 'en'

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

const payload = await getPayload({ config })
const found = await payload.find({
  collection: 'pages',
  where: { slug: { equals: slug } },
  limit: 1,
  depth: 0,
  locale,
})
const page = found.docs[0]
if (!page) throw new Error(`Page ${slug} not found`)
console.log('# status', page._status, 'updatedAt', page.updatedAt)
const versions = await payload.findVersions({
  collection: 'pages',
  where: { parent: { equals: page.id } },
  sort: '-updatedAt',
  limit: 3,
  depth: 0,
})
for (const v of versions.docs)
  console.log('# version', v.id, v.version._status, v.updatedAt, v.latest ? 'LATEST' : '')

const skip =
  /(^|\.)(id|blockType|blockName|updatedAt|createdAt|_status|slug|url|filename|mimeType)$/
const walk = (x: unknown, at: string) => {
  if (skip.test(at)) return
  if (typeof x === 'string' || typeof x === 'number')
    return console.log(`${at} = ${JSON.stringify(x)}`)
  if (x && typeof x === 'object') {
    // Lexical rich text: print its plain text
    if ('root' in (x as object)) {
      const texts: string[] = []
      const t = (n: { text?: string; children?: unknown[] }) => {
        if (n.text) texts.push(n.text)
        n.children?.forEach((c) => t(c as never))
      }
      t((x as { root: never }).root)
      return console.log(`${at} (rich) = ${JSON.stringify(texts.join(' '))}`)
    }
    for (const [k, v] of Object.entries(x)) {
      const key = Array.isArray(x) ? `${at}[${k}]` : at ? `${at}.${k}` : k
      const tag = (v as { blockType?: string })?.blockType
      walk(v, tag ? `${key}<${tag}>` : key)
    }
  }
}
walk(
  slug === 'voucher'
    ? { voucher: (page as { voucher?: unknown }).voucher }
    : { hero: page.hero, layout: page.layout },
  '',
)
process.exit(0)
