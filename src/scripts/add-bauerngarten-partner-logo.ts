/**
 * add-bauerngarten-partner-logo.ts
 *
 * Uploads the "Unser Bauerngarten" partner logo and wires it into the Home
 * page's Special Workshop Banner (Vom Feld ins Glas), replacing the plain
 * text mention of the partner name in the subtitle — per Rafaela's request.
 *
 * Usage:
 *   npx tsx -r dotenv/config src/scripts/add-bauerngarten-partner-logo.ts          ← dry-run
 *   npx tsx -r dotenv/config src/scripts/add-bauerngarten-partner-logo.ts --force  ← actually apply
 */

import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import { IMAGE_PRESETS, optimizedFile } from './seed-image-utils'

const DRY_RUN = !process.argv.includes('--force')
const ctx = { skipRevalidate: true, disableRevalidate: true, skipAutoTranslate: true }

const LOGO_PATH = '/Users/rafaela/Desktop/cropped-cropped-Bauerngarten-Logo-invert-rgb.png'

/**
 * Surgical replace, not a blanket overwrite — the live subtitle text is
 * already-edited marketing copy (richer than the original seed default),
 * so this only removes the quoted partner-name mention per Rafaela's
 * request, leaving the rest of the copy untouched.
 */
function stripPartnerNameMention(text: string, locale: 'de' | 'en'): string {
  if (locale === 'de') {
    return text
      .replace(/Gemeinsam mit\s*['"„“]Unser Bauerngarten\s*['"„“]?\s*ernten/, 'Gemeinsam ernten')
      .replace(/Feld\s*\./, 'Feld.')
  }
  return text.replace(/at Marktgarten\s*[„"“']Unser Bauerngarten[”"“']/, 'at the market garden')
}

async function updateSubtitleAndLogo(
  payload: Awaited<ReturnType<typeof getPayload>>,
  homeId: string,
  locale: 'de' | 'en',
  logoId: string,
) {
  const doc = await payload.findByID({ collection: 'pages', id: homeId, locale, depth: 0 })
  const layout = Array.isArray(doc.layout) ? doc.layout : []
  const block = layout.find((b: any) => b.blockType === 'specialWorkshopBanner') as any
  if (!block) {
    console.log(`[${locale}] No specialWorkshopBanner block found — skipping.`)
    return
  }

  const currentSubtitle: string = block.subtitle ?? ''
  const newSubtitle = stripPartnerNameMention(currentSubtitle, locale)
  console.log(`[${locale}] current subtitle: ${JSON.stringify(currentSubtitle)}`)
  console.log(`[${locale}] new subtitle:     ${JSON.stringify(newSubtitle)}`)
  if (currentSubtitle === newSubtitle) {
    console.log(`[${locale}] ⚠️  No change made by the regex — check it matches this text.`)
  }
  if (DRY_RUN) return

  const nextLayout = layout.map((b: any) =>
    b.blockType === 'specialWorkshopBanner'
      ? { ...b, subtitle: newSubtitle, partnerLogo: logoId }
      : b,
  )
  await payload.update({
    collection: 'pages',
    id: homeId,
    locale,
    context: ctx,
    data: { layout: nextLayout as never },
  })
  console.log(`[${locale}] ✓ updated.`)
}

async function main() {
  const payload = await getPayload({ config })
  console.log(`DB: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//<creds>@')}`)
  console.log(DRY_RUN ? 'DRY RUN — no writes will be made.\n' : 'LIVE RUN — writing changes.\n')

  const home = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    locale: 'de',
  })
  const homeId = home.docs[0]?.id
  if (!homeId) {
    console.error('Home page not found.')
    process.exit(1)
  }

  let logoId: string
  if (DRY_RUN) {
    console.log(`Would upload: ${LOGO_PATH}`)
    logoId = '(dry-run-placeholder)'
  } else {
    const media = await payload.create({
      collection: 'media',
      context: { skipAutoTranslate: true, skipRevalidate: true },
      data: { alt: 'Unser Bauerngarten Logo' },
      file: await optimizedFile(LOGO_PATH, IMAGE_PRESETS.logo),
    })
    logoId = String(media.id)
    console.log(`✓ Uploaded logo as media id ${logoId}\n`)
  }

  await updateSubtitleAndLogo(payload, String(homeId), 'de', logoId)
  await updateSubtitleAndLogo(payload, String(homeId), 'en', logoId)

  if (DRY_RUN) console.log('\nDry run complete. Re-run with --force to apply.')
  process.exit(0)
}

main()
