/**
 * Upload a single Vom Feld ins Glas drive image slot (isolated process).
 * Called by seed-feld-ins-glas-drive-images.ts — Payload R2 upload only
 * reliably works for one file upload per Node process.
 *
 * Usage: npx tsx src/scripts/seed-feld-ins-glas-drive-upload-one.ts heroImage [--force]
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import fs from 'fs'
import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from '@/scripts/seed-image-utils'

const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const ROOT = process.cwd()
const DRIVE_DIR = path.resolve(ROOT, 'seed-assets/images/feld-ins-glas-drive')
const isForce = process.argv.includes('--force')

const IMAGE_MAP = [
  {
    slot: 'heroImage',
    file: 'Kopie von Marktgarden Graz.jpg',
    altKey: 'feld-ins-glas-hero-v2',
    preset: 'hero' as const,
    altDe: 'feld-ins-glas-hero-v2 – Marktgarten Graz, hero background',
    altEn: 'feld-ins-glas-hero-v2 – Marktgarten Graz, hero background',
  },
  {
    slot: 'conceptImage',
    file: 'Kopie von Marktgarden.jpg',
    altKey: 'feld-ins-glas-konzept',
    preset: 'card' as const,
    altDe: 'feld-ins-glas-konzept – Marktgarten Unser Bauerngarten',
    altEn: 'feld-ins-glas-konzept – Marktgarten market garden',
  },
  {
    slot: 'journeyFeld',
    file: 'Kopie von Gemüsegarten.jpg',
    altKey: 'feld-ins-glas-feld',
    preset: 'card' as const,
    altDe: 'feld-ins-glas-feld – Gemüsegarten Ernte',
    altEn: 'feld-ins-glas-feld – vegetable garden harvest',
  },
  {
    slot: 'journeyKueche',
    file: 'Kopie von Workshop Fermentieren Österreich.jpg',
    altKey: 'feld-ins-glas-kueche',
    preset: 'card' as const,
    altDe: 'feld-ins-glas-kueche – Fermentations-Workshop in der Steiermark',
    altEn: 'feld-ins-glas-kueche – fermentation workshop in Styria',
  },
  {
    slot: 'journeyGlas',
    file: 'Kopie von Einkochen Steiermark.jpg',
    altKey: 'feld-ins-glas-glas',
    preset: 'card' as const,
    altDe: 'feld-ins-glas-glas – Fermente im Glas',
    altEn: 'feld-ins-glas-glas – ferments in jars',
  },
  {
    slot: 'bookingImage',
    file: 'Kopie von Gemüse Österreich.jpg',
    altKey: 'feld-ins-glas-hands-v2',
    preset: 'card' as const,
    altDe: 'feld-ins-glas-hands-v2 – Hands-on Fermentieren im Marktgarten',
    altEn: 'feld-ins-glas-hands-v2 – hands-on fermenting at the market garden',
  },
  {
    slot: 'voucherBackgroundImage',
    file: 'Kopie von Gurken Einmachen.jpg',
    altKey: 'feld-ins-glas-voucher-bg',
    preset: 'hero' as const,
    altDe: 'feld-ins-glas-voucher-bg – Gurken fermentieren',
    altEn: 'feld-ins-glas-voucher-bg – fermenting cucumbers',
  },
] as const

type Slot = (typeof IMAGE_MAP)[number]['slot']

async function verifyR2Url(url: string | null | undefined): Promise<boolean> {
  if (!url) return false
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return true
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  return false
}

async function main() {
  const slot = process.argv.find(
    (a) => !a.startsWith('-') && IMAGE_MAP.some((row) => row.slot === a),
  ) as Slot | undefined

  const entry = IMAGE_MAP.find((row) => row.slot === slot)
  if (!entry) {
    console.error(`Unknown slot "${slot}". Valid: ${IMAGE_MAP.map((r) => r.slot).join(', ')}`)
    process.exit(1)
  }

  const abs = path.join(DRIVE_DIR, entry.file)
  if (!fs.existsSync(abs)) {
    console.error(`Missing drive image: ${abs}`)
    process.exit(1)
  }

  const payload = await getPayload({ config })

  if (isForce) {
    const found = await payload.find({
      collection: 'media',
      where: { alt: { contains: entry.altKey } },
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })
    for (const doc of found.docs) {
      await payload.delete({ collection: 'media', id: doc.id, overrideAccess: true })
    }
  } else {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { contains: entry.altKey } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = existing.docs[0]
    if (doc && (await verifyR2Url(doc.url))) {
      console.log(doc.id)
      process.exit(0)
    }
    if (doc) {
      await payload.delete({ collection: 'media', id: doc.id, overrideAccess: true })
    }
  }

  const stamp = Date.now()
  const file = await optimizedFile(abs, IMAGE_PRESETS[entry.preset])
  file.name = `${entry.altKey}-${stamp}.webp`

  const media = await payload.create({
    collection: 'media',
    locale: 'de',
    data: { alt: entry.altDe },
    file,
    context: ctx,
    overrideAccess: true,
  })

  if (!(await verifyR2Url(media.url))) {
    console.error(`R2 upload failed for ${entry.slot} (${media.filename})`)
    process.exit(1)
  }

  await payload.update({
    collection: 'media',
    id: media.id,
    locale: 'en',
    data: { alt: entry.altEn },
    context: ctx,
    overrideAccess: true,
  })

  console.log(media.id)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
