/**
 * Footer social icons → the public pages (staging QA, 2026-11-10):
 *  - LinkedIn pointed to the company ADMIN dashboard (403 for visitors)
 *  - Facebook went through a share.google redirect
 *  - Instagram carried QR tracking parameters
 * Same values for every language (the fields aren't localized).
 *
 * Run:  npx tsx src/scripts/patch-footer-social-links.ts   (staging DB only)
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

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/fermentfreude/',
  facebook: 'https://www.facebook.com/p/Ferment-Freude-100087329564765/',
  linkedin: 'https://www.linkedin.com/company/fermentfreude-og/',
}

const { default: config } = await import('@payload-config')
const { getPayload } = await import('payload')

async function main() {
  const payload = await getPayload({ config })
  const footer = await payload.findGlobal({ slug: 'footer', locale: 'de', depth: 0 })
  console.log('before:', JSON.stringify(footer.socialMedia))
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'de',
    data: { socialMedia: { ...footer.socialMedia, ...SOCIAL_LINKS } } as never,
    context: ctx,
  })
  const en = await payload.findGlobal({ slug: 'footer', locale: 'en', depth: 0 })
  console.log('after (en):', JSON.stringify(en.socialMedia))
}

await main()
process.exit(0)
