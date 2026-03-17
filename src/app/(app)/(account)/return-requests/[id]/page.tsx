import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Return Request Details - FermentFreude',
  description: 'Return request details',
}

export default async function ReturnRequestDetailPage({
  params,
}: {
  params: Promise<{ [key: string]: string }>
}) {
  const resolvedParams = await params
  const id = resolvedParams.id

  // Mock data - in real app, fetch from database
  const returnRequest = {
    id,
    orderId: 'ORD-001234',
    status: 'approved',
    requestDate: '2024-03-10',
    productName: 'Fermentation Starter Kit',
    quantity: 1,
    reason: 'Not as described',
    description: 'The kit size is much smaller than expected',
    rmaNumber: 'RMA-2024-0567',
    returnAddress: {
      address: '123 Ferment Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97204',
      country: 'USA',
    },
    estimatedRefund: 89.99,
    trackingNumber: 'TRK123456789',
  }

  const statusSteps = [
    { label: 'Return Requested', completed: true },
    { label: 'Approved', completed: true },
    { label: 'Return Shipped', completed: returnRequest.status === 'shipped' || returnRequest.status === 'completed' },
    { label: 'Received', completed: returnRequest.status === 'completed' },
    { label: 'Refunded', completed: returnRequest.status === 'completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/account/return-requests"
        className="inline-flex items-center gap-2 text-[#e6be68] hover:text-[#d4a85a] font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Return Requests
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">
          Return Request #{returnRequest.rmaNumber}
        </h1>
        <p className="text-[#4b4f4a]">Order #{returnRequest.orderId}</p>
      </div>

      {/* Status */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-6">Return Status</h2>
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.completed
                      ? 'bg-[#e6be68] text-white'
                      : 'bg-[#f0ede6] text-[#4b4f4a]'
                  }`}
                >
                  {step.completed ? '✓' : index + 1}
                </div>
                <p className="text-xs text-center text-[#4b4f4a] w-16">{step.label}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#f0ede6]">
            <div
              className="h-full bg-[#e6be68] transition-all"
              style={{
                width: `${((statusSteps.filter((s) => s.completed).length - 1) / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Return Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">Product Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#4b4f4a]">Product</span>
                <span className="font-medium text-[#4b4b4b]">{returnRequest.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b4f4a]">Quantity</span>
                <span className="font-medium text-[#4b4b4b]">{returnRequest.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b4f4a]">Estimated Refund</span>
                <span className="font-bold text-[#e6be68]">${returnRequest.estimatedRefund}</span>
              </div>
            </div>
          </Card>

          {/* Return Reason */}
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">Return Reason</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[#4b4f4a] block mb-1">Reason</label>
                <p className="font-medium text-[#4b4b4b]">{returnRequest.reason}</p>
              </div>
              <div>
                <label className="text-sm text-[#4b4f4a] block mb-1">Description</label>
                <p className="text-[#4b4f4a]">{returnRequest.description}</p>
              </div>
            </div>
          </Card>

          {/* Return Shipping */}
          {returnRequest.status !== 'pending' && (
            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">Return Shipping Address</h2>
              <div className="text-sm text-[#4b4f4a] space-y-1">
                <p className="font-medium text-[#4b4b4b]">FermentFreude Returns Center</p>
                <p>{returnRequest.returnAddress.address}</p>
                <p>
                  {returnRequest.returnAddress.zipCode} {returnRequest.returnAddress.city}
                </p>
                <p>{returnRequest.returnAddress.state}, {returnRequest.returnAddress.country}</p>
              </div>

              {returnRequest.trackingNumber && (
                <div className="mt-4 p-3 bg-[#f9f0dc] rounded-lg">
                  <p className="text-xs text-[#4b4f4a] mb-1">Return Tracking Number</p>
                  <p className="font-mono font-bold text-[#4b4b4b]">{returnRequest.trackingNumber}</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Status Badge */}
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">Status</h2>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
              {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
            </div>
          </Card>

          {/* Important Info */}
          <Card className="p-6 border-0 shadow-sm bg-amber-50">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-2">Important</p>
                <ul className="space-y-1 text-xs">
                  <li>• Use the provided return label for shipping</li>
                  <li>• Include the RMA number in the package</li>
                  <li>• Ship within 30 days of approval</li>
                  <li>• Keep your tracking number until refund is issued</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Actions */}
          {returnRequest.status === 'approved' && (
            <button className="w-full px-4 py-2 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium">
              Download Return Label
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
