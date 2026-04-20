import { accountI18n, type AccountTranslations } from '@/app/(app)/account/i18n'
import type { Order, ReturnRequest } from '@/payload-types'
import { formatDate } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export async function generateMetadata() {
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  return { title: t.returnRequests }
}

function StatusDot({ status, t }: { status: string | null | undefined; t: AccountTranslations }) {
  if (status === 'approved' || status === 'completed')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-green-700 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        {t.statusDelivered}
      </span>
    )
  if (status === 'rejected')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-red-700 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        Abgelehnt
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#626160] font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#c4bbb3] shrink-0" />
      {t.statusPending}
    </span>
  )
}

export default async function ReturnRequestsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t.loginRequiredReturnRequests)}`)
  }

  const result = await payload.find({
    collection: 'return-requests',
    where: { user: { equals: user.id } },
    overrideAccess: true,
    depth: 1,
    sort: '-createdAt',
  })

  const requests = result.docs as ReturnRequest[]

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f3f0]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">
              {t.returnRequests}
            </h1>
            <p className="text-[14px] text-[#626160]">{t.returnRequestsSubtitle}</p>
          </div>
          <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
            <p className="text-[13px] text-[#626160] mb-6">{t.noReturnRequests}</p>
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
            {t.returnRequests}
          </h1>
          <p className="text-[14px] text-[#626160]">{t.returnRequestsSubtitle}</p>
        </div>

        <div className="bg-white border border-[#e8e4d9] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e4d9]">
                {['Bestell-ID', 'Grund', 'Status', 'Datum'].map((h) => (
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
              {requests.map((item, i) => {
                const order =
                  typeof item.order === 'object' && item.order !== null
                    ? (item.order as Order)
                    : null
                const reason = item.reason
                  ? item.reason.length > 60
                    ? item.reason.slice(0, 60) + '…'
                    : item.reason
                  : '—'

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#faf9f7] transition-colors ${i < requests.length - 1 ? 'border-b border-[#f5f3f0]' : ''}`}
                  >
                    <td className="py-4 px-5 text-[13px] text-[#1a1a1a] font-mono">
                      {order ? `#${String(order.id).slice(-8).toUpperCase()}` : '—'}
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">{reason}</td>
                    <td className="py-4 px-5">
                      <StatusDot status={item.status} t={t} />
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
