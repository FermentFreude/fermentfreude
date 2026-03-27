import { accountI18n } from '@/app/(app)/account/i18n'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
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
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  if (isCourse) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Banner — Course */}
        <Card className="p-8 border-0 shadow-sm bg-linear-to-r from-green-50 to-[#f9f0dc]">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold text-[#1a1a1a] mb-2">
              {t.welcomeToCourse}
            </h1>
            <p className="text-[#4b4b4b]">{t.courseConfirmDesc}</p>
          </div>
        </Card>

        {/* Order Info */}
        {orderId && (
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">{t.orderInfo}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#626160]">{t.orderNumber}</span>
                <span className="font-semibold text-[#1a1a1a]">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626160]">{t.orderDate}</span>
                <span className="font-semibold text-[#1a1a1a]">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626160]">{t.access}</span>
                <span className="font-semibold text-green-700">{t.lifetimeAccess}</span>
              </div>
            </div>
          </Card>
        )}

        {/* What's Next — Course */}
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-6">{t.whatsNext}</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">{t.paymentConfirmed}</h3>
                <p className="text-sm text-[#626160]">{t.paymentConfirmedDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e6be68] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">{t.youreEnrolled}</h3>
                <p className="text-sm text-[#626160]">{t.enrolledDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">{t.startLearning}</h3>
                <p className="text-sm text-[#626160]">{t.startLearningDesc}</p>
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
            {t.goToLearning}
          </Link>
          <Link
            href="/courses"
            className="flex-1 px-6 py-3 border border-[#1a1a1a]/20 text-[#1a1a1a] rounded-lg hover:bg-[#f5f3f0] transition-colors font-medium text-center"
          >
            {t.browseMoreCourses}
          </Link>
        </div>

        {/* Support */}
        <Card className="p-6 border-0 shadow-sm bg-[#f5f3f0]">
          <h3 className="font-semibold text-[#1a1a1a] mb-2">{t.questions}</h3>
          <p className="text-sm text-[#626160] mb-4">{t.questionsDescCourse}</p>
          <a
            href="mailto:fermentfreude@gmail.com"
            className="text-[#e6be68] hover:text-[#d4a85a] font-medium"
          >
            {t.contactSupport}
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
            {t.thankYouOrder}
          </h1>
          <p className="text-[#4b4b4b]">{t.orderPlacedDesc}</p>
        </div>
      </Card>

      {/* Order Info */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">{t.orderInfo}</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#626160]">{t.orderNumber}</span>
            <span className="font-semibold text-[#1a1a1a]">{orderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#626160]">{t.orderDate}</span>
            <span className="font-semibold text-[#1a1a1a]">
              {formatDate(new Date().toISOString())}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#626160]">{t.emailConfirmation}</span>
            <span className="font-semibold text-[#1a1a1a]">{t.sentToInbox}</span>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-6">{t.whatsNext}</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e6be68] flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">{t.orderConfirmed}</h3>
              <p className="text-sm text-[#626160]">{t.orderConfirmedDesc}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#e6be68] flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-[#e6be68]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">{t.processingShipping}</h3>
              <p className="text-sm text-[#626160]">{t.processingShippingDesc}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#e6be68] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#e6be68]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">{t.onTheWay}</h3>
              <p className="text-sm text-[#626160]">{t.onTheWayDesc}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">{t.whatYouCanDo}</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">&bull;</span>
            <p className="text-sm text-[#626160]">{t.checkEmail}</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">&bull;</span>
            <p className="text-sm text-[#626160]">{t.visitDashboard}</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#f9f0dc] rounded-lg">
            <span className="text-[#e6be68] font-bold">&bull;</span>
            <p className="text-sm text-[#626160]">{t.contactUs}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account/orders"
          className="flex-1 px-6 py-3 bg-[#e6be68] text-white rounded-lg hover:bg-[#d4a85a] transition-colors font-medium text-center"
        >
          {t.viewMyOrders}
        </Link>
        <Link
          href="/shop"
          className="flex-1 px-6 py-3 border border-[#e6be68] text-[#4b4b4b] rounded-lg hover:bg-[#f9f0dc] transition-colors font-medium text-center"
        >
          {t.continueShopping}
        </Link>
      </div>

      {/* Support */}
      <Card className="p-6 border-0 shadow-sm bg-[#f9f0dc]">
        <h3 className="font-semibold text-[#1a1a1a] mb-2">{t.questions}</h3>
        <p className="text-sm text-[#626160] mb-4">{t.questionsDescOrder}</p>
        <a
          href="mailto:fermentfreude@gmail.com"
          className="text-[#e6be68] hover:text-[#d4a85a] font-medium"
        >
          {t.contactSupport}
        </a>
      </Card>
    </div>
  )
}
