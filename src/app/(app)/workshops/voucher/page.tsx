import type { Metadata } from 'next'

import type { Media as MediaType, Page } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { ALL_AMOUNTS, getVoucherContent, OCCASION_PHOTOS, type OccasionKey } from './content'
import { OccasionsSection } from './OccasionsSection'
import { PrintSection } from './PrintSection'
import { resolveVoucherContent } from './resolveContent'
import { ValueVouchersSection } from './ValueVouchersSection'
import { VoucherBuyProvider } from './VoucherBuy'
import { VoucherFAQ } from './VoucherFAQ'
import { VoucherPageHero } from './VoucherPageHero'

/* ═══════════════════════════════════════════════════════════════
 *  GUTSCHEIN PAGE (/workshops/voucher) — reads the "Voucher Page"
 *  tab of the Pages doc with slug "voucher". Every field falls back
 *  to ./content.ts, so the page is complete even with an empty tab.
 *  Google title/description: the page's SEO tab, else content.ts.
 * ═══════════════════════════════════════════════════════════════ */

const configPromise = Promise.resolve(config)

async function getVoucherData(locale?: 'de' | 'en') {
  const payload = await getPayload({ config: configPromise })
  const cmsLocale = normalizeAppLocale(locale)
  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    limit: 1,
    ...strictLocaleQuery(cmsLocale),
    where: {
      and: [{ slug: { equals: 'voucher' } }, { _status: { equals: 'published' } }],
    },
  })
  const page = (result.docs?.[0] as Page | undefined) ?? null

  const fallbackImages: Partial<Record<OccasionKey, MediaType | null>> = {}
  if (!page?.voucher?.occasions?.rows?.length) {
    const media = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 4,
      where: { filename: { in: Object.values(OCCASION_PHOTOS) } },
    })
    for (const [key, filename] of Object.entries(OCCASION_PHOTOS) as [OccasionKey, string][]) {
      fallbackImages[key] = (media.docs.find((m) => m.filename === filename) as MediaType | undefined) ?? null
    }
  }
  return { page, fallbackImages }
}

const getCachedVoucher = (locale?: 'de' | 'en') =>
  process.env.NODE_ENV === 'development'
    ? () => getVoucherData(locale)
    : unstable_cache(async () => getVoucherData(locale), ['voucher', locale ?? 'de'], {
        tags: ['voucher'],
        revalidate: 60,
      })

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const c = getVoucherContent(locale)
  const { page } = await getCachedVoucher(locale)()
  const title = page?.meta?.title?.trim() || c.meta.title
  const description = page?.meta?.description?.trim() || c.meta.description
  return {
    title,
    description,
    alternates: { canonical: '/workshops/voucher' },
    openGraph: { title, description, url: '/workshops/voucher' },
  }
}

export default async function VoucherPage() {
  const locale = await getLocale()
  const { page, fallbackImages } = await getCachedVoucher(locale)()
  const c = resolveVoucherContent(page?.voucher, getVoucherContent(locale), fallbackImages)

  // Search markup: the FAQ (shown as questions in Google) and the four vouchers with their prices
  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/$/, '')
  const jsonLd = [
    ...(c.sections.faq
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: c.faq.items.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
        ]
      : []),
    ...ALL_AMOUNTS.map((amount) => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: amount === 99 ? c.ticket.workshop.label : `${c.ticket.value.label} €${amount}`,
      description: amount === 99 ? c.ticket.workshop.text : c.ticket.value.text,
      brand: { '@type': 'Brand', name: 'FermentFreude' },
      offers: {
        '@type': 'Offer',
        price: amount.toFixed(2),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: `${baseUrl}/workshops/voucher`,
      },
    })),
  ]

  return (
    <VoucherBuyProvider c={c}>
      <VoucherPageHero c={c} />
      {c.sections.values && <ValueVouchersSection c={c} />}
      {c.sections.occasions && <OccasionsSection c={c} />}
      {c.sections.print && <PrintSection c={c} />}
      {c.sections.faq && <VoucherFAQ f={c.faq} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </VoucherBuyProvider>
  )
}
