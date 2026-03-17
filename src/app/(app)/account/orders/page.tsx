import Link from 'next/link'
import type { Order } from '@/payload-types'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { formatDate, formatPrice } from '@/utilities/form/formatters'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Orders - FermentFreude',
  description: 'View your orders',
}

export default async function OrdersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  let orders: Order[] = []

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 100,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {
    console.error('Error fetching orders:', error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Your Orders</h1>
        <p className="text-[#4b4f4a]">View and manage all your orders</p>
      </div>

      {/* Orders Table */}
      {orders && orders.length > 0 ? (
        <Card className="p-6 border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6be68] bg-[#f9f0dc]">
                  <th className="text-left py-4 px-4 font-semibold text-[#4b4b4b]">Order ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#4b4b4b]">Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#4b4b4b]">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-[#4b4b4b]">Items</th>
                  <th className="text-right py-4 px-4 font-semibold text-[#4b4b4b]">Total</th>
                  <th className="text-right py-4 px-4 font-semibold text-[#4b4b4b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-[#f0ede6] hover:bg-[#fffef9] transition-colors">
                    <td className="py-4 px-4 font-medium text-[#e6be68]">
                      {order.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 text-[#4b4f4a]">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          order.stripePaymentIntentStatus === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : order.stripePaymentIntentStatus === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.stripePaymentIntentStatus === 'succeeded'
                          ? 'Completed'
                          : order.stripePaymentIntentStatus === 'processing'
                            ? 'Processing'
                            : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#4b4f4a]">
                      {Array.isArray(order.items) ? order.items.length : 0}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-[#4b4b4b]">
                      {formatPrice(order.total || 0)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-1 text-[#e6be68] hover:text-[#d4a85a] font-medium text-xs rounded hover:bg-[#f9f0dc] transition-colors"
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
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <p className="text-[#4b4f4a] mb-4">No orders found yet</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </Card>
      )}
    </div>
  )
}
