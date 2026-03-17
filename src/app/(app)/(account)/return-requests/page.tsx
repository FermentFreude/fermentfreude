import { Card } from '@/components/ui/card'
import { RotateCcw, Plus } from 'lucide-react'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { formatDate } from '@/utilities/form/formatters'

export const metadata = {
  title: 'Return Requests - FermentFreude',
  description: 'Manage your return requests',
}

export default async function ReturnRequestsPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to view return requests.')}`)
  }

  const returnRequests: Record<string, unknown>[] = []

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Return Requests</h1>
          <p className="text-[#4b4f4a]">Track and manage your product returns</p>
        </div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Return
        </Link>
      </div>

      {/* Return Requests */}
      {returnRequests.length > 0 ? (
        <div className="space-y-4">
          {returnRequests.map((request: any) => (
            <Card key={request.id} className="p-6 border-0 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#4b4b4b]">Return #{request.id?.slice(0, 6)}</h3>
                  <p className="text-sm text-[#4b4f4a]">Requested on {formatDate(request.createdAt)}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    statusColors[request.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-[#f9f0dc] rounded-lg">
                <div>
                  <p className="text-xs text-[#4b4f4a]">Product</p>
                  <p className="font-medium text-[#4b4b4b]">{request.productName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4b4f4a]">Reason</p>
                  <p className="font-medium text-[#4b4b4b]">{request.reason}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/account/return-requests/${request.id}`}
                  className="text-sm text-[#e6be68] hover:text-[#d4a85a]"
                >
                  View Details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <RotateCcw className="w-12 h-12 text-[#e6be68] mx-auto mb-4 opacity-50" />
          <p className="text-[#4b4f4a] mb-4">No return requests yet</p>
          <p className="text-sm text-[#4b4f4a] mb-6">Need to return something? Create a return request from your completed orders</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium"
          >
            View Orders
          </Link>
        </Card>
      )}

      {/* Return Instructions */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">How Returns Work</h2>
        <div className="space-y-3 text-sm text-[#4b4f4a]">
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">1.</span>
            <p>Request a return from your completed orders within 30 days of purchase</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">2.</span>
            <p>We&apos;ll approve your request and provide a prepaid return label</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">3.</span>
            <p>Ship the item back in its original packaging</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">4.</span>
            <p>Once received and inspected, we&apos;ll process your refund</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
