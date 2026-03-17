import { Card } from '@/components/ui/card'
import { AlertCircle, X } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Cancellation Requests - FermentFreude',
  description: 'Manage your cancellation requests',
}

export default function CancellationsPage() {
  const cancellations: unknown[] = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">Cancellation Requests</h1>
        <p className="text-[#4b4f4a]">Track and manage your order cancellations</p>
      </div>

      {/* Info Box */}
      <Card className="p-4 border-0 shadow-sm bg-amber-50 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-medium">Cancellation Policy</p>
          <p className="mt-1">Orders can be cancelled within 24 hours of purchase. After that, they may not be eligible for cancellation.</p>
        </div>
      </Card>

      {/* Cancellations */}
      {cancellations.length > 0 ? (
        <div className="space-y-4">
          {cancellations.map((cancellation: any) => (
            <Card key={cancellation.id} className="p-6 border-0 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#4b4b4b]">Order #{cancellation.orderId}</h3>
                  <p className="text-sm text-[#4b4f4a]">Requested on {cancellation.requestDate}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  {cancellation.status}
                </span>
              </div>

              <div className="p-4 bg-[#f9f0dc] rounded-lg mb-4">
                <p className="text-sm text-[#4b4f4a]">Reason: <span className="font-medium text-[#4b4b4b]">{cancellation.reason}</span></p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/account/orders/${cancellation.orderId}`}
                  className="text-sm text-[#e6be68] hover:text-[#d4a85a]"
                >
                  View Order
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-sm">
          <X className="w-12 h-12 text-[#e6be68] mx-auto mb-4 opacity-50" />
          <p className="text-[#4b4f4a] mb-4">No cancellation requests</p>
          <p className="text-sm text-[#4b4f4a] mb-6">All your orders are active or completed</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center px-6 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium"
          >
            View Your Orders
          </Link>
        </Card>
      )}

      {/* Cancellation Instructions */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">How to Cancel an Order</h2>
        <div className="space-y-3 text-sm text-[#4b4f4a]">
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">1.</span>
            <p>Go to your Orders page and select the order you wish to cancel</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">2.</span>
            <p>Click the &quot;Cancel Order&quot; button (available only within 24 hours of purchase)</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">3.</span>
            <p>Provide a reason for your cancellation</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-[#e6be68]">4.</span>
            <p>Your request will be reviewed and processed within 24 hours</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
