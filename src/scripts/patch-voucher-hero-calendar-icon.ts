/**
 * Voucher page hero: the "Freie Wahl" point gets the new calendar icon (was the
 * shield, which didn't say "choose workshop and date"). Icons are shared by both
 * languages, so one save covers DE and EN.
 *
 * Run:  npx tsx src/scripts/patch-voucher-hero-calendar-icon.ts   (staging DB only)
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
    where: { slug: { equals: 'voucher' } },
    limit: 1,
    depth: 0,
  })
  const page = found.docs[0]
  if (!page) throw new Error('Voucher page not found')

  const latest = await payload.findVersions({
    collection: 'pages',
    where: { parent: { equals: page.id } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
  })
  if (latest.docs[0]?.version._status === 'draft') {
    console.error(
      '🚫 The voucher page has an unpublished admin draft. Publish or discard it in /admin first.',
    )
    process.exit(1)
  }

  const doc = await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })
  const points = doc.voucher?.hero?.points ?? []
  const target = points.find((p) => p.title === 'Freie Wahl')
  if (!target) throw new Error('"Freie Wahl" point not found')
  if (target.icon === 'calendar') return console.log('Already the calendar icon.')

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    data: {
      voucher: {
        ...doc.voucher,
        hero: {
          ...doc.voucher?.hero,
          points: points.map((p) => (p.id === target.id ? { ...p, icon: 'calendar' } : p)),
        },
      },
      _status: 'published',
    } as never,
    context: ctx,
  })
  const en = await payload.findByID({ collection: 'pages', id: page.id, locale: 'en', depth: 0 })
  console.log(
    '✅ icons now:',
    en.voucher?.hero?.points?.map((p) => `${p.title}=${p.icon}`).join(' | '),
  )
}

await main()
process.exit(0)
