import { accountI18n } from '@/app/(app)/account/i18n'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import {
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Mail,
  Package,
  Play,
  Store,
  Truck,
} from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Order Confirmation - FermentFreude',
  description: 'Order confirmation',
}

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderId?: string
    type?: string
    email?: string
  }>
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { orderId, type, email: _email } = await searchParams
  const isWorkshop = type === 'workshop'
  const isCourse = type === 'course'
  const locale = await getLocale()
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  // Fetch order data to check if it's a pickup order
  let isPickupOrder = false
  let pickupInfo: { date?: string; time?: string } = {}

  if (orderId && type === 'order') {
    try {
      const payload = await getPayload({ config: configPromise })
      const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
      })

      // Check if order has pickupDate and pickupTime (physical products for pickup)
      if (order && typeof order === 'object') {
        const orderData = order as unknown as Record<string, unknown>
        if (orderData.pickupDate || orderData.pickupTime) {
          isPickupOrder = true
          pickupInfo = {
            date: orderData.pickupDate as string | undefined,
            time: orderData.pickupTime as string | undefined,
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    }
  }

  // ─── Pickup order confirmation ─────────────────────────────
  if (isPickupOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Banner */}
        <Card className="p-8 border-0 shadow-sm bg-linear-to-br from-[#f6f3f0] to-[#ECE5DE]">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#555954] flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-subheading font-display text-ff-near-black mb-2">
              {locale === 'de' ? 'Bestellung bestätigt' : 'Order confirmed'}
            </h1>
            <p className="text-body-sm text-ff-text-muted">
              {locale === 'de'
                ? 'Ihre Zahlung wurde verarbeitet. Ihre Bestellung ist bestätigt.'
                : 'Your payment has been processed and your order is confirmed.'}
            </p>
          </div>
        </Card>

        {/* Order Info */}
        {orderId && (
          <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
            <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
              {t.orderInfo}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.orderNumber}</span>
                <span className="font-semibold text-ff-near-black">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.orderDate}</span>
                <span className="font-semibold text-ff-near-black">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.emailConfirmation}</span>
                <span className="font-semibold text-[#555954]">{t.sentToInbox}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Pickup Details */}
        <Card className="p-6 border border-blue-200 shadow-sm rounded-[--radius-lg] bg-blue-50">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
            {locale === 'de' ? 'Abholdetails' : 'Pickup Details'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-[#555954] mt-1 shrink-0" />
              <div>
                <p className="text-body-sm font-semibold text-ff-near-black">
                  {locale === 'de' ? 'The Ginery' : 'The Ginery'}
                </p>
                <p className="text-body-sm text-ff-text-muted">
                  Grabenstraße 15, 8010 Graz, Austria
                </p>
              </div>
            </div>
            {pickupInfo.date && (
              <div className="flex items-start gap-3">
                <CalendarCheck className="w-5 h-5 text-[#555954] mt-1 shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-ff-near-black">
                    {locale === 'de' ? 'Abholdatum' : 'Pickup Date'}
                  </p>
                  <p className="text-body-sm text-ff-text-muted">{pickupInfo.date}</p>
                </div>
              </div>
            )}
            {pickupInfo.time && (
              <div className="flex items-start gap-3">
                <CalendarCheck className="w-5 h-5 text-[#555954] mt-1 shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-ff-near-black">
                    {locale === 'de' ? 'Abholzeit' : 'Pickup Time'}
                  </p>
                  <p className="text-body-sm text-ff-text-muted">{pickupInfo.time}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-6">
            {t.whatsNext}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#555954] flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {locale === 'de' ? 'Bestellung bestätigt' : 'Order confirmed'}
                </h3>
                <p className="text-body-sm text-ff-text-muted">
                  {locale === 'de'
                    ? 'Deine Zahlung wurde verarbeitet und deine Bestellung ist bestätigt.'
                    : 'Your payment has been processed and your order is confirmed.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-ff-gold flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-ff-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {locale === 'de' ? 'Vorbereitung und Abholung' : 'Preparation & Pickup'}
                </h3>
                <p className="text-body-sm text-ff-text-muted">
                  {locale === 'de'
                    ? 'Wir bereiten deine Artikel vor und halten sie zur Abholung bereit.'
                    : 'We will prepare your items and have them ready for pickup.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-ff-gold flex items-center justify-center shrink-0">
                <Store className="w-6 h-6 text-ff-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {locale === 'de' ? 'Abholen' : 'Ready for Pickup'}
                </h3>
                <p className="text-body-sm text-ff-text-muted">
                  {locale === 'de'
                    ? 'Hole deine Artikel zu deiner gewählten Zeit und am gewählten Datum ab.'
                    : 'Pick up your items at your selected time and date.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
            {t.whatYouCanDo}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
              <span className="text-ff-gold font-bold">&bull;</span>
              <p className="text-body-sm text-ff-text-muted">{t.checkEmail}</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
              <span className="text-ff-gold font-bold">&bull;</span>
              <p className="text-body-sm text-ff-text-muted">
                {locale === 'de'
                  ? 'Überprüfe dein Konto-Dashboard, um den Bestellstatus zu verfolgen.'
                  : 'Visit your account dashboard to track your order status.'}
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
              <span className="text-ff-gold font-bold">&bull;</span>
              <p className="text-body-sm text-ff-text-muted">{t.contactUs}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 px-6 py-3 bg-ff-gold text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
          >
            {locale === 'de' ? 'Meine Bestellungen anzeigen' : 'View My Orders'}
          </Link>
          <Link
            href="/shop"
            className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-[--radius-pill] hover:bg-ff-cream transition-colors font-display font-medium text-center"
          >
            {t.continueShopping}
          </Link>
        </div>

        {/* Support */}
        <Card className="p-6 border-0 shadow-sm bg-ff-cream rounded-[--radius-lg]">
          <h3 className="font-display font-semibold text-ff-near-black mb-2">{t.questions}</h3>
          <p className="text-body-sm text-ff-text-muted mb-4">
            {locale === 'de'
              ? 'Hast du Fragen zu deiner Bestellung?'
              : 'Do you have questions about your order?'}
          </p>
          <a
            href="mailto:kontakt@fermentfreude.at"
            className="text-ff-gold hover:opacity-80 font-display font-medium"
          >
            {t.contactSupport}
          </a>
        </Card>
      </div>
    )
  }

  // ─── Workshop confirmation ─────────────────────────────
  if (isWorkshop) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Banner — Workshop */}
        <Card className="p-8 border-0 shadow-sm bg-linear-to-br from-[#f6f3f0] to-[#ECE5DE]">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#555954] flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-subheading font-display text-ff-near-black mb-2">
              {t.workshopConfirmed}
            </h1>
            <p className="text-body-sm text-ff-text-muted">{t.workshopConfirmDesc}</p>
          </div>
        </Card>

        {/* Order Info */}
        {orderId && (
          <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
            <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
              {t.orderInfo}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.orderNumber}</span>
                <span className="font-semibold text-ff-near-black">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.orderDate}</span>
                <span className="font-semibold text-ff-near-black">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.emailConfirmation}</span>
                <span className="font-semibold text-[#555954]">{t.sentToInbox}</span>
              </div>
            </div>
          </Card>
        )}

        {/* What's Next — Workshop */}
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-6">
            {t.whatsNext}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#555954] flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {t.bookingConfirmed}
                </h3>
                <p className="text-body-sm text-ff-text-muted">{t.bookingConfirmedDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-ff-gold flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {t.confirmationEmail}
                </h3>
                <p className="text-body-sm text-ff-text-muted">{t.confirmationEmailDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-ff-near-black flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {t.workshopDay}
                </h3>
                <p className="text-body-sm text-ff-text-muted">{t.workshopDayDesc}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons — Workshop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
            className="flex-1 px-6 py-3 bg-ff-near-black text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
          >
            {t.viewBookingDetails}
          </Link>
          <Link
            href="/workshops"
            className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-[--radius-pill] hover:bg-ff-cream transition-colors font-display font-medium text-center"
          >
            {t.browseMoreWorkshops}
          </Link>
        </div>

        {/* Support */}
        <Card className="p-6 border-0 shadow-sm bg-ff-cream rounded-[--radius-lg]">
          <h3 className="font-display font-semibold text-ff-near-black mb-2">{t.questions}</h3>
          <p className="text-body-sm text-ff-text-muted mb-4">{t.questionsDescWorkshop}</p>
          <a
            href="mailto:kontakt@fermentfreude.at"
            className="text-ff-gold hover:opacity-80 font-display font-medium"
          >
            {t.contactSupport}
          </a>
        </Card>
      </div>
    )
  }

  // ─── Course confirmation ─────────────────────────────
  if (isCourse) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Banner — Course */}
        <Card className="p-8 border-0 shadow-sm bg-linear-to-br from-[#f6f3f0] to-[#ECE5DE]">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#555954] flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-subheading font-display text-ff-near-black mb-2">
              {t.welcomeToCourse}
            </h1>
            <p className="text-body-sm text-ff-text-muted">{t.courseConfirmDesc}</p>
          </div>
        </Card>

        {/* Order Info */}
        {orderId && (
          <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
            <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
              {t.orderInfo}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.orderNumber}</span>
                <span className="font-semibold text-ff-near-black">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.orderDate}</span>
                <span className="font-semibold text-ff-near-black">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ff-text-muted">{t.access}</span>
                <span className="font-semibold text-[#555954]">{t.lifetimeAccess}</span>
              </div>
            </div>
          </Card>
        )}

        {/* What's Next — Course */}
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-6">
            {t.whatsNext}
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#555954] flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {t.paymentConfirmed}
                </h3>
                <p className="text-body-sm text-ff-text-muted">{t.paymentConfirmedDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-ff-gold flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {t.youreEnrolled}
                </h3>
                <p className="text-body-sm text-ff-text-muted">{t.enrolledDesc}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-ff-near-black flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-ff-near-black mb-1">
                  {t.startLearning}
                </h3>
                <p className="text-body-sm text-ff-text-muted">{t.startLearningDesc}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons — Course */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/learning"
            className="flex-1 px-6 py-3 bg-ff-near-black text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
          >
            {t.goToLearning}
          </Link>
          <Link
            href="/courses"
            className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-[--radius-pill] hover:bg-ff-cream transition-colors font-display font-medium text-center"
          >
            {t.browseMoreCourses}
          </Link>
        </div>

        {/* Support */}
        <Card className="p-6 border-0 shadow-sm bg-ff-cream rounded-[--radius-lg]">
          <h3 className="font-display font-semibold text-ff-near-black mb-2">{t.questions}</h3>
          <p className="text-body-sm text-ff-text-muted mb-4">{t.questionsDescCourse}</p>
          <a
            href="mailto:kontakt@fermentfreude.at"
            className="text-ff-gold hover:opacity-80 font-display font-medium"
          >
            {t.contactSupport}
          </a>
        </Card>
      </div>
    )
  }

  // ─── Physical product / general order confirmation ─────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Success Banner */}
      <Card className="p-8 border-0 shadow-sm bg-linear-to-br from-[#f6f3f0] to-[#ECE5DE]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#555954] flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-subheading font-display text-ff-near-black mb-2">
            {t.thankYouOrder}
          </h1>
          <p className="text-body-sm text-ff-text-muted">{t.orderPlacedDesc}</p>
        </div>
      </Card>

      {/* Order Info */}
      {orderId && (
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
            {t.orderInfo}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-ff-text-muted">{t.orderNumber}</span>
              <span className="font-semibold text-ff-near-black">
                #{orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ff-text-muted">{t.orderDate}</span>
              <span className="font-semibold text-ff-near-black">
                {formatDate(new Date().toISOString())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ff-text-muted">{t.emailConfirmation}</span>
              <span className="font-semibold text-[#555954]">{t.sentToInbox}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
        <h2 className="text-lg font-display font-semibold text-ff-near-black mb-6">
          {t.whatsNext}
        </h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#555954] flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ff-near-black mb-1">
                {t.orderConfirmed}
              </h3>
              <p className="text-body-sm text-ff-text-muted">{t.orderConfirmedDesc}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-ff-gold flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-ff-gold" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ff-near-black mb-1">
                {t.processingShipping}
              </h3>
              <p className="text-body-sm text-ff-text-muted">{t.processingShippingDesc}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-ff-gold flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-ff-gold" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-ff-near-black mb-1">
                {t.onTheWay}
              </h3>
              <p className="text-body-sm text-ff-text-muted">{t.onTheWayDesc}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
        <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
          {t.whatYouCanDo}
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
            <span className="text-ff-gold font-bold">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">{t.checkEmail}</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
            <span className="text-ff-gold font-bold">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">{t.visitDashboard}</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
            <span className="text-ff-gold font-bold">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">{t.contactUs}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account/orders"
          className="flex-1 px-6 py-3 bg-ff-gold text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
        >
          {t.viewMyOrders}
        </Link>
        <Link
          href="/shop"
          className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-[--radius-pill] hover:bg-ff-cream transition-colors font-display font-medium text-center"
        >
          {t.continueShopping}
        </Link>
      </div>

      {/* Support */}
      <Card className="p-6 border-0 shadow-sm bg-ff-cream rounded-[--radius-lg]">
        <h3 className="font-display font-semibold text-ff-near-black mb-2">{t.questions}</h3>
        <p className="text-body-sm text-ff-text-muted mb-4">{t.questionsDescOrder}</p>
        <a
          href="mailto:kontakt@fermentfreude.at"
          className="text-ff-gold hover:opacity-80 font-display font-medium"
        >
          {t.contactSupport}
        </a>
      </Card>
    </div>
  )
}
