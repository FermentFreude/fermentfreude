/**
 * Puts the real €99 voucher picture into the voucher page's buy panel
 * (Pages "voucher" → Voucher tab → Kauf-Fenster → Gutschein-Bild).
 *
 *   npx tsx src/scripts/seed-voucher-buy-image.ts
 *
 * Image: seed-assets/images/voucher-template.png — public/voucher-template.pdf
 * rendered without a code (render again with:
 *   qlmanage -t -s 2400 -o /tmp public/voucher-template.pdf).
 *
 * Additive and careful:
 *  - an image already chosen in the admin is never replaced
 *  - refuses when the page's newest version is an unpublished admin draft
 *    (saving over it would unpublish the page)
 *  - reuses the media doc if this image was uploaded before
 */
import 'dotenv/config'
import configPromise from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const FILE = path.resolve(process.cwd(), 'seed-assets/images/voucher-template.png')
const ALT_DE = 'Workshop-Geschenkgutschein von Fermentfreude'
const ALT_EN = 'Fermentfreude workshop gift voucher'
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

async function run() {
  const dbName = (process.env.DATABASE_URL ?? '').match(/\/([^/?]+)(\?|$)/)?.[1] ?? 'unknown'
  console.log(`Database: ${dbName}`)
  const payload = await getPayload({ config: configPromise })

  const page = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'voucher' } },
      limit: 1,
      depth: 0,
      draft: false,
      locale: 'de',
      fallbackLocale: false,
      overrideAccess: true,
    })
  ).docs[0]
  if (!page) throw new Error('No page with slug "voucher"')

  const existingImage = page.voucher?.buy?.voucherImage
  if (existingImage) {
    console.log('= Gutschein-Bild is already set in the admin — left unchanged')
    process.exit(0)
  }

  const latest = (
    await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: page.id } },
      sort: '-updatedAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0]
  if (latest?.version?._status === 'draft') {
    console.error('🚫 The voucher page has an unpublished draft in the admin. Publish or discard it first.')
    process.exit(1)
  }

  // ── Media: reuse if uploaded before, else upload ─────────────────
  let media = (
    await payload.find({
      collection: 'media',
      where: { filename: { like: 'voucher-template' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
  ).docs[0]
  if (media) {
    console.log(`= Reusing media ${media.filename}`)
  } else {
    const file = await optimizedFile(FILE, IMAGE_PRESETS.card)
    media = await payload.create({
      collection: 'media',
      locale: 'de',
      data: { alt: ALT_DE },
      file,
      overrideAccess: true,
      context: ctx,
    })
    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'en',
      data: { alt: ALT_EN },
      overrideAccess: true,
      context: ctx,
    })
    console.log(`+ Uploaded ${media.filename}`)
  }

  // The file must really be reachable before the page points at it
  const head = await fetch(String(media.url), { method: 'HEAD' })
  if (!head.ok) throw new Error(`Uploaded image not reachable (${head.status}): ${media.url}`)

  // ── Point the buy panel at it (upload fields aren't localized) ───
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    // Whole tab as stored in German (no fallback), only the image added
    data: { voucher: { ...page.voucher, buy: { ...page.voucher?.buy, voucherImage: media.id } } },
    overrideAccess: true,
    context: ctx,
  })

  const check = await payload.findByID({
    collection: 'pages',
    id: page.id,
    depth: 0,
    draft: false,
    overrideAccess: true,
  })
  console.log(
    check._status === 'published' && check.voucher?.buy?.voucherImage
      ? '✓ Gutschein-Bild set, page still published'
      : `⚠ Check the page: status ${check._status}, image ${String(check.voucher?.buy?.voucherImage)}`,
  )
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
