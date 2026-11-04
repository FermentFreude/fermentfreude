/**
 * Home, gift (Gutschein) slide — redesigned like the Tempeh slide: uploads the
 * GUTSCHEIN illustration as the picture (new media doc, HEAD-checked), clears
 * the big word (the picture shows it), sets name, headline, text, price,
 * button and the three points with icons. DE first, then EN with the same
 * point IDs.
 *
 * Run:  npx tsx src/scripts/patch-home-voucher-slide.ts   (staging DB only)
 */
process.env.PAYLOAD_SEED = 'true'

// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'
import os from 'os'
import path from 'path'

loadEnv({ path: path.resolve(process.cwd(), '.env') })

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

if (!(process.env.DATABASE_URL ?? '').includes('-staging')) {
  console.error('🚫 REFUSING TO RUN: DATABASE_URL does not look like the staging database.')
  process.exit(1)
}

const IMAGE = {
  file: path.join(os.homedir(), 'Downloads', 'voucher_FermentFreude - Artboard 2.jpg'),
  name: 'home-gift-slide-gutschein.webp',
  altDe: 'Illustration: zwei Gutscheinkarten mit der Aufschrift GUTSCHEIN, davor ein Koch mit einer Pfanne Tempeh',
  altEn: 'Illustration: two voucher cards reading GUTSCHEIN, a chef with a pan of tempeh in front',
}

const COPY = {
  de: {
    label: 'Gutschein · Fermentations-Workshop',
    headline: 'Ein Erlebnis zum Verschenken.',
    text: 'Verschenke einen Fermentations-Workshop in Graz – Kombucha, Tempeh oder Lakto-Gemüse. Sofort per E-Mail & als PDF, bereit zum Verschenken.',
    priceText: '99 €',
    buttonLabel: 'Gutschein kaufen',
    points: [
      { icon: 'shieldCheck', title: 'Für alle Workshops gültig', text: 'Kombucha, Gemüse oder Tempeh – frei wählbar' },
      { icon: 'box', title: 'Verkostung & Starterkits inklusive', text: 'Alles, was du brauchst, um zuhause weiter zu fermentieren' },
      { icon: 'clock', title: 'Sofort verfügbar', text: 'Digital per E-Mail oder zur Abholung vor Ort' },
    ],
  },
  en: {
    label: 'Voucher · Fermentation workshop',
    headline: 'An experience to give.',
    text: 'Give a fermentation workshop in Graz – kombucha, tempeh or lacto-fermented vegetables. Sent right away by e-mail and as a PDF, ready to give.',
    priceText: '99 €',
    buttonLabel: 'Buy voucher',
    points: [
      { icon: 'shieldCheck', title: 'Valid for every workshop', text: 'Kombucha, vegetables or tempeh – your choice' },
      { icon: 'box', title: 'Tasting & starter kits included', text: 'Everything you need to keep fermenting at home' },
      { icon: 'clock', title: 'Available right away', text: 'Digitally by e-mail or for pick-up in Graz' },
    ],
  },
}

const { IMAGE_PRESETS, optimizedFile } = await import('@/scripts/seed-image-utils')
const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })

  // Picture: reuse if this run already uploaded it, otherwise a NEW media doc
  let imageId: string
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: IMAGE.altDe } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  if (existing.docs[0]) {
    imageId = existing.docs[0].id
    console.log('Picture already uploaded:', imageId)
  } else {
    const file = await optimizedFile(IMAGE.file, IMAGE_PRESETS.hero)
    const doc = await payload.create({
      collection: 'media',
      locale: 'de',
      context: ctx,
      data: { alt: IMAGE.altDe },
      file: { ...file, name: IMAGE.name },
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'en',
      data: { alt: IMAGE.altEn },
      context: ctx,
    })
    // Don't trust the exit code: check the file is really being served
    const url = (doc as { url?: string }).url
    if (url) {
      const res = await fetch(url, { method: 'HEAD' })
      console.log(`${IMAGE.name}: HEAD ${res.status}`)
      if (!res.ok) throw new Error(`Upload not reachable: ${url}`)
    }
    imageId = doc.id
  }

  const found = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
  })
  const home = found.docs[0]
  if (!home) throw new Error('Home page not found')
  console.log('Home updatedAt before this run:', home.updatedAt)

  let pointIds: (string | null | undefined)[] = []
  for (const locale of ['de', 'en'] as const) {
    const c = COPY[locale]
    const doc = await payload.findByID({ collection: 'pages', id: home.id, locale, depth: 0 })
    const layout = (doc.layout ?? []).map((b) => {
      if (b.blockType !== 'voucherCta') return b
      const points =
        locale === 'de' ? c.points : c.points.map((p, i) => ({ ...p, id: pointIds[i] }))
      if (locale === 'en' && pointIds.length !== c.points.length) throw new Error('DE point IDs missing')
      return {
        ...b,
        giftSlide: {
          ...b.giftSlide,
          enabled: true,
          backgroundImage: imageId,
          bigWord: '',
          label: c.label,
          headline: c.headline,
          text: c.text,
          priceText: c.priceText,
          buttonLabel: c.buttonLabel,
          buttonNote: '',
          points,
        },
      }
    })
    await payload.update({
      collection: 'pages',
      id: home.id,
      locale,
      data: { layout } as never,
      context: ctx,
    })
    if (locale === 'de') {
      const saved = await payload.findByID({ collection: 'pages', id: home.id, locale: 'de', depth: 0 })
      const block = (saved.layout ?? []).find((b) => b.blockType === 'voucherCta')
      pointIds =
        block && block.blockType === 'voucherCta' ? (block.giftSlide?.points ?? []).map((p) => p.id) : []
    }
    console.log(`✅ ${locale}`)
  }
}

await main()
process.exit(0)
