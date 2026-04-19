import { accountI18n } from '@/app/(app)/account/i18n'
import type { Product, Review } from '@/payload-types'
import { formatDate } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export async function generateMetadata() {
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  return { title: t.reviews }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-[13px] text-[#e6be68]">
      {'★'.repeat(rating)}
      <span className="text-[#e8e4d9]">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (status === 'approved')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        Genehmigt
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
        Abgelehnt
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#626160] bg-[#f5f3f0] px-2 py-0.5 rounded-full">
      Ausstehend
    </span>
  )
}

export default async function ReviewsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t.loginRequiredReviews)}`)
  }

  const result = await payload.find({
    collection: 'reviews',
    where: { user: { equals: user.id } },
    overrideAccess: true,
    depth: 1,
    sort: '-createdAt',
  })

  const reviews = result.docs as Review[]

  if (reviews.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f3f0]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
              {t.reviews}
            </h1>
            <p className="text-[14px] text-[#626160]">{t.reviewsSubtitle}</p>
          </div>
          <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
            <p className="text-[13px] text-[#626160] mb-6">{t.noReviews}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
            {t.reviews}
          </h1>
          <p className="text-[14px] text-[#626160]">{t.reviewsSubtitle}</p>
        </div>

        <div className="bg-white border border-[#e8e4d9] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4d9]">
                {['Produkt', 'Bewertung', 'Titel', 'Status', 'Verifiziert', 'Datum'].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#c4bbb3] text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((item, i) => {
                const product =
                  typeof item.product === 'object' && item.product !== null
                    ? (item.product as Product)
                    : null

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#faf9f7] transition-colors ${i < reviews.length - 1 ? 'border-b border-[#f5f3f0]' : ''}`}
                  >
                    <td className="py-4 px-5 text-[13px] text-[#1a1a1a] font-medium">
                      {product?.title ?? '—'}
                    </td>
                    <td className="py-4 px-5">
                      <StarRating rating={item.rating} />
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">{item.title ?? '—'}</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">
                      {item.verifiedPurchase ? '✓' : '—'}
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
