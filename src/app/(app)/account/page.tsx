import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/utilities/form/formatters'
import { Card } from '@/components/ui/card'
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard - FermentFreude',
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
      where: {
        customer: {
          equals: userId,
        },
      },
      limit: 5,
      sort: '-createdAt',
    })

    return {
      total: orders.totalDocs || 0,
      pending: orders.docs?.filter((o: any) => o.stripeStatus === 'processing').length || 0,
      completed: orders.docs?.filter((o: any) => o.stripeStatus === 'succeeded').length || 0,
      recent: orders.docs || [],
    }
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return {
      total: 0,
      pending: 0,
      completed: 0,
      recent: [],
    }
  }
}

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return null
  }

  const stats = await getOrderStats(user.id)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-[#f9f0dc] to-[#fffef9] rounded-lg border border-[#e6be68] p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#4b4b4b] mb-2">
          Welcome back, {user.name || 'Valued Customer'}!
        </h1>
        <p className="text-[#4b4f4a] text-sm md:text-base">
          From your dashboard you can view your recent orders, manage your addresses, and edit your account details.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center px-4 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors text-sm font-medium"
          >
            View Orders
          </Link>
          <Link
            href="/account/profile"
            className="inline-flex items-center px-4 py-2 border border-[#e6be68] text-[#4b4b4b] rounded-lg hover:bg-[#f9f0dc] transition-colors text-sm font-medium"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4b4f4a] mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-[#4b4b4b]">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f0ede6] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[#e6be68]" />
            </div>
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4b4f4a] mb-1">Processing</p>
              <p className="text-3xl font-bold text-[#4b4b4b]">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f0ede6] flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#e6be68]" />
            </div>
          </div>
        </Card>

        {/* Completed Orders */}
        <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4b4f4a] mb-1">Completed</p>
              <p className="text-3xl font-bold text-[#4b4b4b]">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f0ede6] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#e6be68]" />
            </div>
          </div>
        </Card>

        {/* Account Status */}
        <Card className="p-6 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4b4f4a] mb-1">Member Since</p>
              <p className="text-sm font-bold text-[#4b4b4b]">
                {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#f0ede6] flex items-center justify-center">
              <Package className="w-6 h-6 text-[#e6be68]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      {stats.recent.length > 0 && (
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-[#4b4b4b]">Recent Orders</h2>
            <Link href="/account/orders" className="text-[#e6be68] hover:text-[#d4a85a] text-sm font-medium">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6be68]">
                  <th className="text-left py-3 px-4 font-semibold text-[#4b4f4a]">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#4b4f4a]">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#4b4f4a]">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#4b4f4a]">Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#4b4f4a]">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((order: any) => (
                  <tr key={order.id} className="border-b border-[#f0ede6] hover:bg-[#fffef9] transition-colors">
                    <td className="py-4 px-4 font-medium text-[#4b4b4b]">{order.id?.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-4 text-[#4b4f4a]">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.stripeStatus === 'succeeded'
                            ? 'bg-green-100 text-green-700'
                            : order.stripeStatus === 'processing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.stripeStatus === 'succeeded'
                          ? 'Completed'
                          : order.stripeStatus === 'processing'
                            ? 'Processing'
                            : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[#4b4b4b] font-semibold">
                      {formatPrice(order.total || 0)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-[#e6be68] hover:text-[#d4a85a] font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
