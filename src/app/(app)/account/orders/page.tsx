import type { Order } from '@/payload-types'
import { formatDate, formatPrice } from '@/utilities/form/formatters'
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

function StatusDot({ status }: { status: string }) {
  if (status === 'completed')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-green-700 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        Delivered
      </span>
    )
  if (status === 'processing')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-blue-700 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        Processing
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#626160] font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#c4bbb3] shrink-0" />
      Pending
    </span>
  )
}

export default async function OrdersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please log in to view your orders.')}`)
  }

  let orders: Order[] = []

  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 100,
      user,
      overrideAccess: false,
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
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">My Account</p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          Orders
        </h1>
        <p className="mt-2 text-sm text-[#626160]">
          {orders.length > 0
            ? `${orders.length} order${orders.length !== 1 ? 's' : ''} in your history`
            : 'Your order history will appear here.'}
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="bg-white border border-[#1a1a1a]/20 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e4d9]">
                {['Order', 'Date', 'Status', 'Items', 'Total', ''].map((h) => (
                  <th
                    key={h}
                    className={`py-3.5 px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#c4bbb3] ${
                      h === 'Total' || h === '' ? 'text-right' : 'text-left'
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
                    <StatusDot status={order.status || 'processing'} />
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
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-16 text-center">
          <p className="text-[13px] text-[#626160] mb-6">No orders yet.</p>
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Explore Workshops
          </Link>
        </div>
      )}
    </div>
  )
}
