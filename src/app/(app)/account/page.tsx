import { formatDate, formatPrice } from '@/utilities/form/formatters'
import configPromise from '@payload-config'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Dashboard — FermentFreude',
  description: 'Your account dashboard',
}

interface OrderStats {
  total: number
  pending: number
  completed: number
  recent: any[]
}

async function getOrderStats(userId: string): Promise<OrderStats> {
  try {
    const payload = await getPayload({ config: configPromise })
    const orders = await payload.find({
      collection: 'orders',
      overrideAccess: false,
      where: { customer: { equals: userId } },
      limit: 5,
      sort: '-createdAt',
    })
    return {
      total: orders.totalDocs || 0,
      pending: orders.docs?.filter((o: any) => o.stripeStatus === 'processing').length || 0,
      completed: orders.docs?.filter((o: any) => o.stripeStatus === 'succeeded').length || 0,
      recent: orders.docs || [],
    }
  } catch {
    return { total: 0, pending: 0, completed: 0, recent: [] }
  }
}

function StatusDot({ status }: { status: string }) {
  if (status === 'succeeded')
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

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  const stats = await getOrderStats(user.id)
  const firstName = user.name?.split(' ')[0] ?? 'there'

  // Fetch enrollments for My Learning widget
  const enrollmentResult = await payload.find({
    collection: 'enrollments',
    where: { user: { equals: user.id } },
    limit: 10,
    overrideAccess: true,
  })
  const enrolledCount = enrollmentResult.totalDocs

  return (
    <div className="max-w-4xl space-y-10">
      {/* Page header */}
      <div className="pb-8 border-b border-[#e8e4d9]">
        <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">
          My Account
        </p>
        <h1 className="font-display text-[2rem] font-bold text-[#1a1a1a] tracking-tight leading-tight">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-2 text-sm text-[#626160] max-w-sm">
          View your orders, manage your addresses, and update your account details.
        </p>
        <div className="flex gap-3 mt-5">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Orders
          </Link>
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#e8e4d9] text-[#4b4b4b] hover:bg-[#ece5de] text-sm font-medium rounded-lg transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total },
          { label: 'Processing', value: stats.pending },
          { label: 'Delivered', value: stats.completed },
          {
            label: 'Member Since',
            value: user.createdAt ? formatDate(user.createdAt) : '—',
            small: true,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#1a1a1a]/20 rounded-xl p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c4bbb3] mb-3">
              {stat.label}
            </p>
            <p
              className={
                stat.small
                  ? 'font-display font-bold text-[#1a1a1a] text-base leading-tight'
                  : 'font-display font-bold text-[#1a1a1a] text-4xl leading-none'
              }
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* My Learning widget */}
      {enrolledCount > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display font-bold text-[#1a1a1a] text-lg">My Learning</h2>
            <Link
              href="/account/learning"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#626160] hover:text-[#1a1a1a] transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white border border-[#1a1a1a]/20 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-ff-gold-accent/15 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-ff-gold-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a]">
                {enrolledCount === 1 ? '1 course enrolled' : `${enrolledCount} courses enrolled`}
              </p>
              <p className="text-[12px] text-[#626160] mt-0.5">Pick up where you left off</p>
            </div>
            <Link
              href="/account/learning"
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-white text-[13px] font-medium rounded-lg transition-colors shrink-0"
            >
              Continue
            </Link>
          </div>
        </div>
      )}

      {/* Recent orders */}
      {stats.recent.length > 0 ? (
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display font-bold text-[#1a1a1a] text-lg">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#626160] hover:text-[#1a1a1a] transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white border border-[#1a1a1a]/20 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e4d9]">
                  {['Order', 'Date', 'Status', 'Total', ''].map((h) => (
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
                {stats.recent.map((order: any, i: number) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-[#faf9f7] transition-colors ${
                      i < stats.recent.length - 1 ? 'border-b border-[#f5f3f0]' : ''
                    }`}
                  >
                    <td className="py-4 px-5 font-mono text-[11px] text-[#4b4b4b]">
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-5 text-[13px] text-[#626160]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-5">
                      <StatusDot status={order.stripeStatus || 'pending'} />
                    </td>
                    <td className="py-4 px-5 text-right text-[13px] font-semibold text-[#1a1a1a]">
                      {formatPrice(order.total || 0)}
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
