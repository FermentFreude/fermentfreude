/**
 * Voucher page (/workshops/voucher): David's copy from the founders' doc
 * "Voucher Page Content_Fermentfreude Website 06-11-2026_edited" (2026-11-10).
 * The text itself lives in src/app/(app)/workshops/voucher/content.ts (also the
 * page's fallback + the seed's source); this script writes it into the existing
 * "Voucher Page" tab without touching photos, ticket texts or the buy panel:
 *  - hero, gift ideas, greeting card, how it works, FAQ: new copy
 *  - value vouchers (€50/€30/€20) switched off ("don't include for now")
 *  - the "Vegan & vegetarisch" gift idea removed ("Diese Karte streichen!")
 * DE first, then EN with the same row IDs (rows are shared between languages).
 *
 * Run:  npx tsx src/scripts/patch-voucher-page-copy-2026-11.ts   (staging DB only)
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
const { getVoucherContent } = await import('../app/(app)/workshops/voucher/content')

type Row = { id?: string | null; [k: string]: unknown }
const rowsOf = (x: unknown) => (Array.isArray(x) ? (x as Row[]) : [])
/** Keep the row IDs of `ids` by position (new rows get none, so Payload makes one) */
const idAt = (ids: Row[], i: number) => (ids[i]?.id ? { id: ids[i]!.id } : {})

const REMOVED_LABEL_DE = 'Vegan & vegetarisch'

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

  // An admin autosave draft newer than the published doc would get published by this write (Home, 2026-11-04)
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
  console.log('Voucher page updatedAt before this run:', page.updatedAt)

  const de0 = await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })
  const removedId =
    rowsOf(de0.voucher?.occasions?.rows).find((r) => r.label === REMOVED_LABEL_DE)?.id ?? null
  if (!removedId) console.log(`ℹ️  No "${REMOVED_LABEL_DE}" row found (already removed?)`)

  let savedDe: typeof de0 | null = null
  for (const locale of ['de', 'en'] as const) {
    const c = getVoucherContent(locale)
    const doc =
      locale === 'de'
        ? de0
        : await payload.findByID({ collection: 'pages', id: page.id, locale, depth: 0 })
    const v = (doc.voucher ?? {}) as NonNullable<typeof doc.voucher>
    // Row IDs: DE keeps its own; EN must use exactly the ones DE just saved
    const ids = (locale === 'de' ? v : savedDe!.voucher) as NonNullable<typeof doc.voucher>

    const keptRows = rowsOf(v.occasions?.rows).filter((r) => r.id !== removedId)
    const idRows = rowsOf(ids.occasions?.rows).filter((r) => r.id !== removedId)
    if (keptRows.length !== c.occasions.rows.length)
      throw new Error(
        `Expected ${c.occasions.rows.length} gift ideas after removal, found ${keptRows.length}`,
      )

    const voucher = {
      ...v,
      hero: {
        ...v.hero,
        eyebrow: c.hero.eyebrow,
        headline: c.hero.headline,
        text: c.hero.text,
        priceNote: c.hero.priceNote,
        ticketAlt: c.hero.ticketAlt,
        points: c.hero.points.map((p, i) => ({
          ...rowsOf(v.hero?.points)[i],
          ...p,
          ...idAt(rowsOf(ids.hero?.points), i),
        })),
      },
      values: { ...v.values, show: c.sections.values },
      occasions: {
        ...v.occasions,
        intro: c.occasions.intro,
        rows: c.occasions.rows.map((r, i) => ({
          ...keptRows[i], // photo, link, amount stay as they are
          label: r.label,
          title: r.title,
          text: r.text,
          ctaLabel: r.cta.label,
          bullets: r.bullets.map((text, j) => ({ text, ...idAt(rowsOf(idRows[i]?.bullets), j) })),
          id: idRows[i]!.id,
        })),
      },
      print: {
        ...v.print,
        headline: c.print.headline,
        text: c.print.text,
        card: { ...v.print?.card, backEyebrow: c.card.backEyebrow },
      },
      how: {
        ...v.how,
        points: c.how.points.map((p, i) => ({
          ...rowsOf(v.how?.points)[i],
          ...p,
          ...idAt(rowsOf(ids.how?.points), i),
        })),
      },
      faq: {
        ...v.faq,
        items: c.faq.items.map((item, i) => ({ ...item, ...idAt(rowsOf(ids.faq?.items), i) })),
      },
    }

    await payload.update({
      collection: 'pages',
      id: page.id,
      locale,
      data: { voucher, _status: 'published' } as never,
      context: ctx,
    })
    if (locale === 'de')
      savedDe = await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })
    console.log(`✅ ${locale}`)
  }

  const check = await payload.findByID({ collection: 'pages', id: page.id, locale: 'en', depth: 0 })
  console.log(
    'status:',
    check._status,
    '| gift ideas:',
    check.voucher?.occasions?.rows?.map((r) => r.label).join(' / '),
  )
}

await main()
process.exit(0)
