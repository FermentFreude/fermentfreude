/**
 * Home: show its published/draft status and the latest versions. With
 * `--publish`, publishes the main document as it is (no content change).
 *
 * Run:  npx tsx src/scripts/check-home-status.ts [--publish]   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = found.docs[0]
  if (!home) throw new Error('Home page not found')
  console.log('main doc:', home.id, home._status, home.updatedAt, 'blocks', home.layout?.length)

  const versions = await payload.findVersions({
    collection: 'pages',
    where: { parent: { equals: home.id } },
    sort: '-updatedAt',
    limit: 5,
    depth: 0,
  })
  for (const v of versions.docs)
    console.log(
      'version',
      v.id,
      v.version._status,
      v.updatedAt,
      v.latest ? 'LATEST' : '',
      'blocks',
      v.version.layout?.map((b) => b.blockType).join(','),
    )

  const diffIdx = process.argv.indexOf('--diff')
  if (diffIdx > -1) {
    // --diff <versionA> <versionB>: list the paths whose values differ (all languages)
    const [a, b] = await Promise.all(
      [process.argv[diffIdx + 1], process.argv[diffIdx + 2]].map((id) =>
        payload.findVersionByID({ collection: 'pages', id: id!, locale: 'all', depth: 0 }),
      ),
    )
    const skip = /(^|\.)(updatedAt|createdAt|_status)$/
    const walk = (x: unknown, y: unknown, at: string) => {
      if (skip.test(at)) return
      if (x && y && typeof x === 'object' && typeof y === 'object') {
        for (const k of new Set([...Object.keys(x), ...Object.keys(y)]))
          walk((x as Record<string, unknown>)[k], (y as Record<string, unknown>)[k], at ? `${at}.${k}` : k)
        return
      }
      if (JSON.stringify(x) !== JSON.stringify(y))
        console.log('DIFF', at, '|', JSON.stringify(x)?.slice(0, 120), '→', JSON.stringify(y)?.slice(0, 120))
    }
    // Compare block by block id so the removed carousel doesn't shift everything
    const byId = (l: { id?: string | null }[] = []) => Object.fromEntries(l.map((bl) => [bl.id, bl]))
    const va = { ...a.version, layout: byId(a.version.layout ?? []) }
    const vb = { ...b.version, layout: byId(b.version.layout ?? []) }
    walk(va, vb, '')
  }

  if (process.argv.includes('--publish')) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale: 'de',
      data: { _status: 'published' },
      context: ctx,
    })
    const after = await payload.findByID({ collection: 'pages', id: home.id, depth: 0 })
    console.log('✅ after:', after._status, after.updatedAt)
  }
}

await main()
process.exit(0)
