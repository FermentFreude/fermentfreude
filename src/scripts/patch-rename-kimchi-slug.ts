/**
 * Rename product slug classic-kimchi → kimchi (staging only).
 * Old URL redirects via redirects.js → /products/kimchi.
 *
 * Run: pnpm exec tsx src/scripts/patch-rename-kimchi-slug.ts
 */
import path from 'path'
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: path.resolve(process.cwd(), '.env') })

const CTX = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

function assertStagingDatabase() {
  const dbUrl = process.env.DATABASE_URL ?? ''
  if (!dbUrl.includes('-staging')) {
    console.error(
      '\n🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.\n',
    )
    process.exit(1)
  }
}

async function main() {
  assertStagingDatabase()

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  const byNew = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'kimchi' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (byNew.docs[0]) {
    payload.logger.info(`✔ Slug already “kimchi” (id ${byNew.docs[0].id}). Nothing to do.`)
    return
  }

  const byOld = await payload.find({
    collection: 'products',
    where: { slug: { equals: 'classic-kimchi' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const doc = byOld.docs[0]
  if (!doc) {
    throw new Error('Neither kimchi nor classic-kimchi found in products')
  }

  await payload.update({
    collection: 'products',
    id: doc.id,
    data: { slug: 'kimchi' },
    context: CTX,
    overrideAccess: true,
  })

  payload.logger.info(`✔ Renamed classic-kimchi → kimchi (id ${doc.id})`)
  payload.logger.info('  URL: /products/kimchi  (old /products/classic-kimchi redirects)')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
