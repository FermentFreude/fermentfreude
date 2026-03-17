import { Card } from '@/components/ui/card'
import { CheckCircle, Package, Truck } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatPrice } from '@/utilities/form/formatters'

export const metadata = {
  title: 'Order Confirmation - FermentFreude',
  description: 'Order confirmation',
}

interface OrderConfirmationPageProps {
  searchParams: {
    orderId?: string
  }
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { orderId } = searchParams

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Banner */}
      <Card className="p-8 border-0 shadow-sm bg-gradient-to-r from-green-50 to-[#f9f0dc]">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-[#4b4b4b] mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-[#4b4f4a]">
            Your order has been successfully placed and confirmed. We're excited to get it to you!
          </p>
        </div>
      </Card>

      {/* Order Info */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">Order Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#4b4f4a]">Order Number</span>
            <span className="font-semibold text-[#4b4b4b]">{orderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4b4f4a]">Order Date</span>
            <span className="font-semibold text-[#4b4b4b]">{formatDate(new Date().toISOString())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4b4f4a]">Email Confirmation</span>
            <span className="font-semibold text-[#4b4b4b]">Sent to your inbox</span>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-6">What's Next</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e6be68] flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#4b4b4b] mb-1">Order Confirmed</h3>
              <p className="text-sm text-[#4b4f4a]">Your payment has been processed and your order is confirmed</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#e6be68] flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-[#e6be68]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#4b4b4b] mb-1">Processing & Shipping</h3>
              <p className="text-sm text-[#4b4f4a]">We'll prepare your items and ship within 1-2 business days</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#e6be68] flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6 text-[#e6be68]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#4b4b4b] mb-1">On the Way</h3>
              <p className="text-sm text-[#4b4f4a]">You'll receive tracking information via email</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#4b4b4b] mb-4">What You Can Do Now</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">•</span>
            <p className="text-sm text-[#4b4f4a]">
              Check your email for an order confirmation and receipt
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">•</span>
            <p className="text-sm text-[#4b4f4a]">
              Visit your account dashboard to track your order status
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">•</span>
            <p className="text-sm text-[#4b4f4a]">
              Contact us if you have any questions about your order
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account/orders"
          className="flex-1 px-6 py-3 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium text-center"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="flex-1 px-6 py-3 border border-[#e6be68] text-[#4b4b4b] rounded-lg hover:bg-[#f9f0dc] transition-colors font-medium text-center"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Support */}
      <Card className="p-6 border-0 shadow-sm bg-[#f9f0dc]">
        <h3 className="font-semibold text-[#4b4b4b] mb-2">Questions?</h3>
        <p className="text-sm text-[#4b4f4a] mb-4">
          Our customer support team is here to help. Reach out anytime.
        </p>
        <a href="mailto:support@fermentfreude.com" className="text-[#e6be68] hover:text-[#d4a85a] font-medium">
          Contact Support
        </a>
      </Card>
    </div>
  )
}
