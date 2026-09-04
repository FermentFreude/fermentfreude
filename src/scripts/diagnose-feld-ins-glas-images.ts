// @ts-expect-error — dotenv
import { config as loadEnv } from 'dotenv'
loadEnv()
import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  const page = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'vom-feld-ins-glas' } },
    locale: 'de',
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  const d = page.docs[0]?.workshopDetail
  const fmt = (img: unknown) =>
    typeof img === 'object' && img && img !== null && 'url' in img
      ? { alt: (img as { alt?: string }).alt, url: String((img as { url?: string }).url).slice(0, 80) }
      : img
  console.log(JSON.stringify({
    heroTitle: d?.heroTitle,
    heroImage: fmt(d?.heroImage),
    conceptImage: fmt(d?.conceptImage),
    bookingImage: fmt(d?.bookingImage),
    voucherBackgroundImage: fmt(d?.voucherBackgroundImage),
    journey: (d?.journeySections ?? []).map((s) => ({
      label: s.label,
      image: fmt(s.image),
    })),
  }, null, 2))
  process.exit(0)
}
main()
