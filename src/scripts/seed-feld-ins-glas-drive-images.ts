/**
 * Upload Vom Feld ins Glas images from the founders' Google Drive folder
 * and attach them to pages → vom-feld-ins-glas → Workshop Detail.
 *
 * Source folder (download once):
 *   seed-assets/images/feld-ins-glas-drive/
 *   https://drive.google.com/drive/folders/1aVEZ4j5bxwmr9KONiT2km2C9SaZFSQ0v
 *
 * Run:  pnpm seed feld-ins-glas-drive-images
 *       pnpm seed feld-ins-glas-drive-images --force
 */
// @ts-expect-error — dotenv types not resolved via package.json exports
import { config as loadEnv } from 'dotenv'

loadEnv()

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import config from '@payload-config'
import { getPayload } from 'payload'

const SLUG = 'vom-feld-ins-glas'
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }
const isForce = process.argv.includes('--force')
const ROOT = process.cwd()
const DRIVE_DIR = path.resolve(ROOT, 'seed-assets/images/feld-ins-glas-drive')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_ONE_SCRIPT = path.join(__dirname, 'seed-feld-ins-glas-drive-upload-one.ts')

const SLOTS = [
  'heroImage',
  'conceptImage',
  'journeyFeld',
  'journeyKueche',
  'journeyGlas',
  'bookingImage',
  'voucherBackgroundImage',
] as const

type Slot = (typeof SLOTS)[number]
type Uploaded = Record<Slot, string>

const SLOT_LABELS: Record<Slot, string> = {
  heroImage: 'heroImage',
  conceptImage: 'conceptImage',
  journeyFeld: 'journeyFeld',
  journeyKueche: 'journeyKueche',
  journeyGlas: 'journeyGlas',
  bookingImage: 'bookingImage',
  voucherBackgroundImage: 'voucherBackgroundImage',
}

function uploadSlotInSubprocess(slot: Slot): string {
  const args = ['tsx', UPLOAD_ONE_SCRIPT, slot]
  if (isForce) args.push('--force')

  const result = spawnSync('npx', args, {
    cwd: ROOT,
    env: process.env,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const stdout = (result.stdout ?? '').trim()
  const stderr = (result.stderr ?? '').trim()
  if (stderr) process.stderr.write(stderr + '\n')

  if (result.status !== 0) {
    throw new Error(`Upload failed for ${slot}${stderr ? `: ${stderr}` : ''}`)
  }

  const mediaId = stdout.split('\n').pop()?.trim()
  if (!mediaId) {
    throw new Error(`Upload for ${slot} returned no media ID`)
  }
  return mediaId
}

async function main() {
  if (!fs.existsSync(DRIVE_DIR)) {
    throw new Error(
      `Drive folder not found: ${DRIVE_DIR}\n` +
        'Download: python3 -m gdown --folder "https://drive.google.com/drive/folders/1aVEZ4j5bxwmr9KONiT2km2C9SaZFSQ0v" ' +
        `-O "${DRIVE_DIR}"`,
    )
  }

  const payload = await getPayload({ config })
  payload.logger.info('📷 Uploading Vom Feld ins Glas drive images…')

  const ids = {} as Uploaded
  for (const slot of SLOTS) {
    payload.logger.info(`  · ${SLOT_LABELS[slot]}…`)
    ids[slot] = uploadSlotInSubprocess(slot)
    payload.logger.info(`  ✔ ${slot} → ${ids[slot]}`)
  }

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: SLUG } },
    locale: 'de',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const page = pageResult.docs[0]
  if (!page) {
    throw new Error(`Page "${SLUG}" not found. Run: pnpm seed feld-ins-glas-page`)
  }

  const current = (page.workshopDetail ?? {}) as Record<string, unknown>
  const journey = Array.isArray(current.journeySections)
    ? [...(current.journeySections as Array<Record<string, unknown>>)]
    : [{ label: '01' }, { label: '02' }, { label: '03' }]

  while (journey.length < 3) journey.push({ label: String(journey.length + 1).padStart(2, '0') })

  journey[0] = { ...journey[0], image: ids.journeyFeld }
  journey[1] = { ...journey[1], image: ids.journeyKueche }
  journey[2] = { ...journey[2], image: ids.journeyGlas }

  const patch = {
    ...current,
    heroImage: ids.heroImage,
    conceptImage: ids.conceptImage,
    bookingImage: ids.bookingImage,
    voucherBackgroundImage: ids.voucherBackgroundImage,
    useGlobalVoucherData: false,
    journeySections: journey,
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    data: { workshopDetail: patch } as never,
    context: ctx,
    overrideAccess: true,
  })

  const saved = await payload.findByID({
    collection: 'pages',
    id: page.id,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })
  const savedJourney =
    (saved.workshopDetail as { journeySections?: Array<{ id?: string }> })?.journeySections ?? []
  const enJourney = journey.map((row, i) => ({
    ...row,
    ...(savedJourney[i]?.id ? { id: savedJourney[i].id } : {}),
  }))

  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    data: {
      workshopDetail: {
        ...((
          await payload.findByID({
            collection: 'pages',
            id: page.id,
            locale: 'en',
            depth: 0,
            overrideAccess: true,
          })
        ).workshopDetail as Record<string, unknown> | undefined),
        heroImage: ids.heroImage,
        conceptImage: ids.conceptImage,
        bookingImage: ids.bookingImage,
        voucherBackgroundImage: ids.voucherBackgroundImage,
        useGlobalVoucherData: false,
        journeySections: enJourney,
      },
    } as never,
    context: ctx,
    overrideAccess: true,
  })

  payload.logger.info('✅ Drive images linked to vom-feld-ins-glas → Workshop Detail')
  payload.logger.info('   Hard-refresh: /workshops/vom-feld-ins-glas')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
