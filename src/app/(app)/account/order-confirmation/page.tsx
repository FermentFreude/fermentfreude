import { Card } from '@/components/ui/card'
import { formatDate } from '@/utilities/form/formatters'
import { BookOpen, CheckCircle, Package, Play, Truck } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Order Confirmation - FermentFreude',
  description: 'Order confirmation',
}

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderId?: string
    type?: string
  }>
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { orderId, type } = await searchParams
  const isCourse = type === 'course'

  if (isCourse) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Banner — Course */}
        <Card className="p-8 border-0 shadow-sm bg-linear-to-r from-green-50 to-[#f9f0dc]">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold text-[#1a1a1a] mb-2">
              Welcome to Your Course!
            </h1>
            <p className="text-[#4b4b4b]">
              Your purchase is confirmed and your course is ready to start — no waiting, no
              shipping.
            </p>
          </div>
        </Card>

        {/* Order Info */}
        {orderId && (
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#626160]">Order Number</span>
                <span className="font-semibold text-[#1a1a1a]">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626160]">Order Date</span>
                <span className="font-semibold text-[#1a1a1a]">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626160]">Access</span>
                <span className="font-semibold text-green-700">Lifetime — instant access</span>
              </div>
            </div>
          </Card>
        )}

        {/* What's Next — Course */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-6">What&apos;s Next</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">Payment Confirmed</h3>
                <p className="text-sm text-[#626160]">
                  Your payment was processed successfully. A receipt has been sent to your email.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e6be68] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">You&apos;re Enrolled</h3>
                <p className="text-sm text-[#626160]">
                  Your course has been added to your learning dashboard. All lessons are unlocked.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">Start Learning</h3>
                <p className="text-sm text-[#626160]">
                  Head to your learning dashboard and start with the first lesson. Learn at your own
                  pace.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons — Course */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/learning"
            className="flex-1 px-6 py-3 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333333] transition-colors font-medium text-center"
          >
            Go to My Learning
          </Link>
          <Link
            href="/courses"
            className="flex-1 px-6 py-3 border border-[#1a1a1a]/20 text-[#1a1a1a] rounded-lg hover:bg-[#f5f3f0] transition-colors font-medium text-center"
          >
            Browse More Courses
          </Link>
        </div>

        {/* Support */}
        <Card className="p-6 border-0 shadow-sm bg-[#f5f3f0]">
          <h3 className="font-semibold text-[#1a1a1a] mb-2">Questions?</h3>
          <p className="text-sm text-[#626160] mb-4">
            Need help getting started? Our support team is happy to help.
          </p>
          <a
            href="mailto:support@fermentfreude.com"
            className="text-[#e6be68] hover:text-[#d4a85a] font-medium"
          >
            Contact Support
          </a>
        </Card>
      </div>
    )
  }

  // ─── Physical product confirmation ─────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Banner */}
      <Card className="p-8 border-0 shadow-sm bg-linear-to-r from-green-50 to-[#f9f0dc]">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-[#1a1a1a] mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-[#4b4b4b]">
            Your order has been successfully placed and confirmed. We&apos;re excited to get it to
            you!
          </p>
        </div>
      </Card>

      {/* Order Info */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Order Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#626160]">Order Number</span>
            <span className="font-semibold text-[#1a1a1a]">{orderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#626160]">Order Date</span>
            <span className="font-semibold text-[#1a1a1a]">
              {formatDate(new Date().toISOString())}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#626160]">Email Confirmation</span>
            <span className="font-semibold text-[#1a1a1a]">Sent to your inbox</span>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-6">What&apos;s Next</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e6be68] flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">Order Confirmed</h3>
              <p className="text-sm text-[#626160]">
                Your payment has been processed and your order is confirmed
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#e6be68] flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-[#e6be68]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">Processing & Shipping</h3>
              <p className="text-sm text-[#626160]">
                We&apos;ll prepare your items and ship within 1-2 business days
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#e6be68] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#e6be68]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">On the Way</h3>
              <p className="text-sm text-[#626160]">
                You&apos;ll receive tracking information via email
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">What You Can Do Now</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">&bull;</span>
            <p className="text-sm text-[#626160]">
              Check your email for an order confirmation and receipt
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">&bull;</span>
            <p className="text-sm text-[#626160]">
              Visit your account dashboard to track your order status
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">&bull;</span>
            <p className="text-sm text-[#626160]">
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
        <h3 className="font-semibold text-[#1a1a1a] mb-2">Questions?</h3>
        <p className="text-sm text-[#626160] mb-4">
          Our customer support team is here to help. Reach out anytime.
        </p>
        <a
          href="mailto:support@fermentfreude.com"
          className="text-[#e6be68] hover:text-[#d4a85a] font-medium"
        >
          Contact Support
        </a>
      </Card>
    </div>
  )
}
