/**
 * Seed the Voucher page (/workshops/voucher) — the "Voucher Page" tab.
 *
 * Fills every section from src/app/(app)/workshops/voucher/content.ts:
 * hero, ticket texts, value vouchers, gift ideas (with photos from the
 * media library), greeting card, how it works, FAQ, buy panel, plus the
 * SEO title/description.
 *
 * Rules followed:
 * - Non-destructive: skips when the tab already has content. --force rewrites
 *   the text, but a photo already chosen in the admin is never replaced.
 * - Refuses when the page has an unpublished admin draft (a write would build
 *   on it and take the page offline — Home, 2026-11-04).
 * - DE first → read back the row IDs → EN with the same IDs. Sequential writes.
 * - Context: skipRevalidate, disableRevalidate, skipAutoTranslate.
 *
 * Run:  pnpm seed voucher [--force]
 * Then on staging: GET /api/revalidate-pages, and check the page answers 200.
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const force = process.argv.includes('--force')

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')
const { OCCASION_PHOTOS, VOUCHER_CONTENT } = await import('../app/(app)/workshops/voucher/content')

type Content = (typeof VOUCHER_CONTENT)['de']
type Page = import('@/payload-types').Page
type Id = string | null | undefined
type WithIds = { id?: string | null }

const idAt = (rows: WithIds[] | null | undefined, i: number): Id => rows?.[i]?.id ?? undefined

/** The tab's data for one language. `ids` = the DE rows, so EN reuses their IDs. */
function buildTab(c: Content, photos: Record<string, string | null>, ids?: NonNullable<Page['voucher']>) {
  const points = (list: { icon: string; title: string; text: string }[], rows?: WithIds[] | null) =>
    list.map((p, i) => ({ id: idAt(rows, i), icon: p.icon, title: p.title, text: p.text }))

  return {
    hero: {
      eyebrow: c.hero.eyebrow,
      headline: c.hero.headline,
      text: c.hero.text,
      price: c.hero.price,
      priceNote: c.hero.priceNote,
      button: c.hero.button,
      secondary: c.hero.secondary,
      points: points(c.hero.points, ids?.hero?.points),
      ticketAlt: c.hero.ticketAlt,
    },
    ticket: {
      workshopLabel: c.ticket.workshop.label,
      workshopTitle: c.ticket.workshop.title,
      workshopText: c.ticket.workshop.text,
      valueLabel: c.ticket.value.label,
      valueTitle: c.ticket.value.title,
      valueText: c.ticket.value.text,
      footer: c.ticket.footer,
      stub: c.ticket.stub,
    },
    values: {
      show: true,
      eyebrow: c.values.eyebrow,
      headline: c.values.headline,
      text: c.values.text,
      items: c.values.items.map((item, i) => ({
        id: idAt(ids?.values?.items, i),
        amount: String(item.amount),
        line: item.line,
      })),
      button: c.values.button,
      valueName: c.values.valueName,
    },
    occasions: {
      show: true,
      eyebrow: c.occasions.eyebrow,
      headline: c.occasions.headline,
      intro: c.occasions.intro,
      rows: c.occasions.rows.map((row, i) => {
        const existing = ids?.occasions?.rows?.[i]
        return {
          id: existing?.id ?? undefined,
          image: photos[row.key] ?? null,
          label: row.label,
          title: row.title,
          text: row.text,
          bullets: row.bullets.map((text, j) => ({ id: idAt(existing?.bullets, j), text })),
          ctaKind: row.cta.kind,
          ...(row.cta.kind === 'buy'
            ? { ctaAmount: String(row.cta.amount) }
            : { ctaHref: row.cta.href }),
          ctaLabel: row.cta.label,
        }
      }),
    },
    print: {
      show: true,
      eyebrow: c.print.eyebrow,
      headline: c.print.headline,
      text: c.print.text,
      button: c.print.button,
      note: c.print.note,
      cardAlt: c.print.cardAlt,
      card: { ...c.card },
    },
    how: { eyebrow: c.how.eyebrow, points: points(c.how.points, ids?.how?.points) },
    faq: {
      show: true,
      eyebrow: c.faq.eyebrow,
      title: c.faq.title,
      description: c.faq.description,
      more: c.faq.more,
      moreLink: c.faq.moreLink,
      items: c.faq.items.map((item, i) => ({ id: idAt(ids?.faq?.items, i), ...item })),
    },
    buy: {
      title: c.buy.title,
      amountLabel: c.buy.amountLabel,
      workshopChip: c.buy.workshopChip,
      deliveryNote: c.buy.deliveryNote,
      yourName: c.buy.yourName,
      yourNamePlaceholder: c.buy.yourNamePlaceholder,
      yourEmail: c.buy.yourEmail,
      submit: c.buy.submit,
      secure: c.buy.secure,
    },
  }
}

async function main() {
  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'voucher' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  let page = found.docs[0]

  if (!page) {
    page = await payload.create({
      collection: 'pages',
      locale: 'de',
      data: { title: 'Gutschein', slug: 'voucher', _status: 'published' } as never,
      context: ctx,
    })
    console.log(`  ➕ Created the voucher page ${page.id}`)
  } else {
    // An admin autosave draft newer than the published page: a write would build on it and unpublish the page
    const latest = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: page.id }, latest: { equals: true } },
      limit: 1,
      depth: 0,
    })
    if (latest.docs[0]?.version._status === 'draft') {
      console.error('🚫 The voucher page has an unpublished draft from the admin — publish or discard it first.')
      process.exit(1)
    }
    if (page.voucher?.hero?.headline && !force) {
      console.log('  ⏭️  Voucher page already has content — skipped (use --force to overwrite the text).')
      return
    }
  }

  // Photos: keep the ones already chosen in the admin, else the library photos by filename
  const media = await payload.find({
    collection: 'media',
    where: { filename: { in: Object.values(OCCASION_PHOTOS) } },
    limit: 10,
    depth: 0,
  })
  const current = page.voucher?.occasions?.rows ?? []
  const photos: Record<string, string | null> = {}
  VOUCHER_CONTENT.de.occasions.rows.forEach((row, i) => {
    const kept = current[i]?.image
    const keptId = typeof kept === 'object' && kept !== null ? kept.id : kept
    const library = media.docs.find((m) => m.filename === OCCASION_PHOTOS[row.key as keyof typeof OCCASION_PHOTOS])
    photos[row.key] = keptId ?? library?.id ?? null
    if (!photos[row.key]) console.warn(`  ⚠️  No photo for "${row.key}" — the page shows the beige placeholder.`)
  })

  const metaDe = { title: VOUCHER_CONTENT.de.meta.title, description: VOUCHER_CONTENT.de.meta.description }
  const metaEn = { title: VOUCHER_CONTENT.en.meta.title, description: VOUCHER_CONTENT.en.meta.description }

  // 1. German
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    data: { voucher: buildTab(VOUCHER_CONTENT.de, photos), meta: metaDe, _status: 'published' } as never,
    context: ctx,
  })
  console.log('  ✅ DE saved')

  // 2. Read back the row IDs
  const saved = await payload.findByID({ collection: 'pages', id: page.id, locale: 'de', depth: 0 })

  // 3. English with the same IDs
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: {
      voucher: buildTab(VOUCHER_CONTENT.en, photos, saved.voucher ?? undefined),
      meta: metaEn,
      _status: 'published',
    } as never,
    context: ctx,
  })
  console.log('  ✅ EN saved')

  // 4. Check: still published, both languages filled
  const check = await payload.findVersions({
    collection: 'pages',
    where: { parent: { equals: page.id }, latest: { equals: true } },
    limit: 1,
    depth: 0,
  })
  const en = await payload.findByID({ collection: 'pages', id: page.id, locale: 'en', depth: 0 })
  console.log(
    `  🔎 status: ${check.docs[0]?.version._status} · DE headline: "${saved.voucher?.hero?.headline}" · EN headline: "${en.voucher?.hero?.headline}" · rows: ${en.voucher?.occasions?.rows?.length}`,
  )
}

await main()
process.exit(0)
