import { accountI18n, type AccountTranslations } from '@/app/(app)/account/i18n'
import type { Order } from '@/payload-types'
import { formatDate, formatPrice } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { ArrowRight } from 'lucide-react'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Orders — FermentFreude',
  description: 'Your order history',
}

function StatusDot({
  status,
  requiresShipping,
  t,
}: {
  status: string
  requiresShipping: boolean
  t: AccountTranslations
}) {
  if (status === 'completed') {
    const label = requiresShipping ? t.statusDelivered : t.statusConfirmed
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#1a1a1a] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] shrink-0" />
        {label}
      </span>
    )
  }
  if (status === 'processing')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#1a1a1a] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e6be68] shrink-0" />
        {t.statusProcessing}
      </span>
    )
  if (status === 'cancelled' || status === 'refunded')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#626160] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c4bbb3] shrink-0" />
        {status === 'cancelled' ? t.statusCancelled : t.statusRefunded}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#626160] font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#c4bbb3] shrink-0" />
      {t.statusPending}
    </span>
  )
}

function orderRequiresShipping(order: Order): boolean {
  const items = Array.isArray(order.items) ? order.items : []
  if (items.length === 0) return false
  return items.some((item) => {
    const product = item?.product
    if (!product || typeof product !== 'object') return true
    const productType = (product as { productType?: string | null }).productType
    const slug = (product as { slug?: string | null }).slug
    const isDigital = productType === 'digital-course'
    const isWorkshop =
      productType === 'workshop' || (typeof slug === 'string' && slug.startsWith('workshop-'))
    return !isDigital && !isWorkshop
  })
}

export default async function OrdersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(t.loginRequiredOrders)}`)
  }

  let orders: Order[] = []

  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 100,
      depth: 2,
      overrideAccess: true,
      where: { customer: { equals: user.id } },
    })
    orders = result?.docs || []
  } catch (error) {
    console.error('Error fetching orders:', error)
  }

  return (
    <div className="max-w-4xl space-y-10">
      {/* Page header */}
      <div className="pb-8 border-b border-[#e8e4d9]">
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">{t.myAccount}</p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          {t.orders}
        </h1>
        <p className="mt-2 text-sm text-[#626160]">
          {t.ordersSubtitle(orders.length)}
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="bg-white border border-[#1a1a1a]/20 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e4d9]">
                {[t.order, t.date, t.status, t.items, t.total, ''].map((h) => (
                  <th
                    key={h}
                    className={`py-3.5 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#c4bbb3] ${
                      h === t.total || h === '' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order, i: number) => (
                <tr
                  key={order.id}
                  className={`hover:bg-[#faf9f7] transition-colors ${
                    i < orders.length - 1 ? 'border-b border-[#f5f3f0]' : ''
                  }`}
                >
                  <td className="py-4 px-5 font-mono text-[11px] text-[#4b4b4b]">
                    #{order.id?.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-4 px-5 text-[13px] text-[#626160]">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-4 px-5">
                    <StatusDot
                      status={order.status || 'processing'}
                      requiresShipping={orderRequiresShipping(order)}
                      t={t}
                    />
                  </td>
                  <td className="py-4 px-5 text-[13px] text-[#626160]">
                    {Array.isArray(order.items) ? order.items.length : 0}
                  </td>
                  <td className="py-4 px-5 text-right text-[13px] font-semibold text-[#1a1a1a]">
                    {formatPrice(order.amount || 0)}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-[12px] text-[#626160] hover:text-[#1a1a1a] font-medium transition-colors"
                    >
                      {t.view} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
          <p className="text-[13px] text-[#626160] mb-6">{t.noOrders}</p>
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t.exploreWorkshops}
          </Link>
        </div>
      )}
    </div>
  )
}
