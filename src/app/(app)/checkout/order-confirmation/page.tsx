import { accountI18n } from '@/app/(app)/account/i18n'
import { Media } from '@/components/Media'
import { ProductItem } from '@/components/ProductItem'
import { Card } from '@/components/ui/card'
import { getOrderConfirmationData } from '@/lib/orderConfirmation'
import { formatDate } from '@/utilities/form/formatters'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Download,
  Mail,
  Package,
  Play,
  Store,
  Truck,
} from 'lucide-react'
import { headers as getHeaders } from 'next/headers.js'
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

  // Detect authenticated user — guests get different CTAs (no /account/* links)
  const reqHeaders = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: reqHeaders })
  const isLoggedIn = !!user

  const {
    downloadToken,
    isPickupOrder,
    pickupLocationName,
    pickupLocationAddress,
    pickupBookingUrl,
    bookingSummary,
    workshopImage,
    otherWorkshops,
    manageBookingLinks,
    items,
  } = await getOrderConfirmationData({ payload, orderId, type, locale })


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
              {t.orderConfirmed}
            </h1>
            <p className="text-body-sm text-ff-text-muted">{t.orderConfirmedDesc}</p>
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

        {/* Items */}
        {items.length > 0 && (
          <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
            <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
              {t.items}
            </h2>
            <ul className="flex flex-col gap-6">
              {items.map((item) => (
                <li key={item.id}>
                  <ProductItem product={item.product} quantity={item.quantity} variant={item.variant} />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Pickup Details */}
        <Card className="p-6 border border-blue-200 shadow-sm rounded-[--radius-lg] bg-blue-50">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
            {t.pickupDetails}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-[#555954] mt-1 shrink-0" />
              <div>
                <p className="text-body-sm font-semibold text-ff-near-black">
                  {pickupLocationName}
                </p>
                <p className="text-body-sm text-ff-text-muted">{pickupLocationAddress}</p>
              </div>
            </div>
          </div>
          {pickupBookingUrl && (
            <a
              href={pickupBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-[--radius-pill] bg-[#555954] px-5 py-2.5 font-display font-medium text-white transition-opacity hover:opacity-90"
            >
              <CalendarCheck className="h-4 w-4" />
              {locale === 'de' ? 'Abholzeit buchen' : 'Book your pickup time'}
            </a>
          )}
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
                  {t.preparationPickup}
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
                  {t.readyForPickup}
                </h3>
                <p className="text-body-sm text-ff-text-muted">
                  {locale === 'de'
                    ? 'Buche über den Link oben deine Abholzeit und hole deine Artikel dann ab.'
                    : 'Book your pickup time using the link above, then collect your items.'}
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
                {isLoggedIn ? t.visitDashboard : t.visitDashboardGuest}
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
            href={isLoggedIn ? '/account/orders' : '/create-account'}
            className="flex-1 px-6 py-3 bg-ff-gold text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
          >
            {isLoggedIn ? t.viewMyOrders : t.createAccount}
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
    const nextSteps = [
      { icon: CheckCircle, title: t.bookingConfirmed, desc: t.bookingConfirmedDesc },
      { icon: Mail, title: t.confirmationEmail, desc: t.confirmationEmailDesc },
      { icon: CalendarCheck, title: t.workshopDay, desc: t.workshopDayDesc },
    ]

    return (
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Hero */}
        <div className="space-y-6">
          {workshopImage ? (
            <div className="relative w-full aspect-21/9 rounded-[--radius-lg] overflow-hidden bg-ff-cream">
              <Media resource={workshopImage} fill imgClassName="object-cover" priority />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0" />
              <span className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-display font-bold uppercase tracking-wider text-ff-near-black">
                <CheckCircle className="w-3.5 h-3.5" />
                {locale === 'de' ? 'Bestätigt' : 'Confirmed'}
              </span>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-ff-near-black flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="text-center space-y-3">
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-ff-near-black tracking-tight text-balance">
              {t.workshopConfirmed}
            </h1>
            <p className="text-body text-ff-text-muted max-w-md mx-auto">
              {t.workshopConfirmDesc}
            </p>
          </div>
        </div>

        {/* Booking summary */}
        {bookingSummary && (
          <div className="border border-ff-border-light rounded-[--radius-lg] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-ff-text-muted mb-1.5">
                  {t.bookingSummaryTitle}
                </p>
                <h2 className="font-display font-bold text-2xl text-ff-near-black">
                  {bookingSummary.workshopTitle}
                </h2>
              </div>
              {orderId && (
                <span className="shrink-0 font-mono text-xs text-ff-text-muted pt-1">
                  #{orderId.slice(0, 8).toUpperCase()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
              <div>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-ff-text-muted mb-1">
                  {t.labelDate}
                </p>
                <p className="font-display font-semibold text-ff-near-black">
                  {bookingSummary.date}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-ff-text-muted mb-1">
                  {t.labelTime}
                </p>
                <p className="font-display font-semibold text-ff-near-black">
                  {bookingSummary.time}
                </p>
              </div>
              {bookingSummary.location && (
                <div>
                  <p className="text-[11px] font-display font-bold uppercase tracking-wider text-ff-text-muted mb-1">
                    {t.labelLocation}
                  </p>
                  <p className="font-display font-semibold text-ff-near-black">
                    {bookingSummary.location}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-ff-text-muted mb-1">
                  {t.labelGuests}
                </p>
                <p className="font-display font-semibold text-ff-near-black">
                  {bookingSummary.guestCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {downloadToken && orderId && (
            <Link
              href={`/orders/${orderId}/tickets?token=${downloadToken}`}
              className="flex-1 px-6 py-4 bg-ff-near-black text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-bold text-center"
            >
              {t.viewTickets}
            </Link>
          )}
          {manageBookingLinks.length > 0 && (
            <Link
              href={manageBookingLinks[0].url}
              className="flex-1 px-6 py-4 bg-ff-gold text-ff-near-black rounded-[--radius-pill] hover:bg-ff-gold-accent-dark transition-colors font-display font-bold text-center"
            >
              {t.manageBookingCta}
            </Link>
          )}
        </div>

        {/* Profile CTA — go to account, or create one as a guest */}
        <div className="border border-ff-border-light rounded-[--radius-lg] p-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          {isLoggedIn ? (
            <>
              <div>
                <p className="font-display font-bold text-ff-near-black mb-1">
                  {t.viewBookingDetails}
                </p>
                <p className="text-body-sm text-ff-text-muted">{t.bookingConfirmedDesc}</p>
              </div>
              <Link
                href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-ff-near-black text-ff-near-black rounded-[--radius-pill] hover:bg-ff-near-black hover:text-white transition-colors font-display font-bold text-sm"
              >
                {t.goToProfile}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="font-display font-bold text-ff-near-black mb-1">
                  {t.createAccountPrompt}
                </p>
                <p className="text-body-sm text-ff-text-muted">{t.createAccountDesc}</p>
              </div>
              <Link
                href="/create-account"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-ff-near-black text-ff-near-black rounded-[--radius-pill] hover:bg-ff-near-black hover:text-white transition-colors font-display font-bold text-sm"
              >
                {t.createAccountPrompt}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* What's next — one consistent icon treatment throughout */}
        <div>
          <h2 className="font-display font-bold text-xl text-ff-near-black mb-6">
            {t.whatsNext}
          </h2>
          <div className="space-y-5">
            {nextSteps.map((step) => (
              <div key={step.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-ff-near-black flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ff-near-black mb-0.5">
                    {step.title}
                  </h3>
                  <p className="text-body-sm text-ff-text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice download */}
        {orderId && downloadToken && (
          <div className="text-center">
            <a
              href={`/api/orders/${orderId}/receipt?token=${downloadToken}`}
              download
              className="inline-flex items-center gap-2 text-ff-near-black font-display font-semibold underline decoration-ff-gold decoration-2 underline-offset-4 hover:decoration-ff-near-black transition-colors"
            >
              <Download className="w-4 h-4" />
              {locale === 'de' ? 'Rechnung herunterladen' : 'Download Invoice'}
            </a>
          </div>
        )}

        {/* Explore other workshops */}
        {otherWorkshops.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-ff-near-black mb-6">
              {t.exploreOtherWorkshops}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {otherWorkshops.map((w) => (
                <Link key={w.slug} href={`/workshops/${w.slug}`} className="group block">
                  <div className="relative aspect-4/3 rounded-[--radius-lg] overflow-hidden mb-3 bg-ff-cream">
                    {w.image && (
                      <Media
                        resource={w.image}
                        fill
                        imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-ff-near-black mb-1">{w.title}</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-display font-semibold text-ff-near-black underline decoration-ff-gold decoration-2 underline-offset-4">
                    {t.learnMore}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-[--radius-pill] hover:bg-ff-cream transition-colors font-display font-medium"
          >
            {t.browseMoreWorkshops}
          </Link>
        </div>

        {/* Support */}
        <div className="border-t border-ff-border-light pt-8 text-center">
          <h3 className="font-display font-semibold text-ff-near-black mb-1">{t.questions}</h3>
          <p className="text-body-sm text-ff-text-muted mb-3">{t.questionsDescWorkshop}</p>
          <a
            href="mailto:kontakt@fermentfreude.at"
            className="text-ff-near-black font-display font-semibold underline decoration-ff-gold decoration-2 underline-offset-4 hover:decoration-ff-near-black transition-colors"
          >
            {t.contactSupport}
          </a>
        </div>
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

        {/* Receipt note */}
        <Card className="p-4 border border-ff-border-light shadow-sm rounded-[--radius-lg] bg-ff-cream">
          <p className="text-body-sm text-ff-text-muted text-center mb-3">
            {locale === 'de'
              ? 'Deine Rechnung wurde per E-Mail gesendet.'
              : 'Your receipt has been sent to your email.'}
          </p>
          {orderId && downloadToken && (
            <div className="flex justify-center">
              <a
                href={`/api/orders/${orderId}/receipt?token=${downloadToken}`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-ff-near-black text-white text-sm rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium"
              >
                <Download className="w-4 h-4" />
                {locale === 'de' ? 'Rechnung herunterladen' : 'Download Receipt'}
              </a>
            </div>
          )}
        </Card>

        {/* Action Buttons — Course */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isLoggedIn ? (
            <>
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
            </>
          ) : (
            <Link
              href="/courses"
              className="flex-1 px-6 py-3 bg-ff-near-black text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
            >
              {t.browseMoreCourses}
            </Link>
          )}
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

      {/* Items */}
      {items.length > 0 && (
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-[--radius-lg]">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
            {t.items}
          </h2>
          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.id}>
                <ProductItem product={item.product} quantity={item.quantity} variant={item.variant} />
              </li>
            ))}
          </ul>
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
              <h3 className="font-display font-semibold text-ff-near-black mb-1">{t.onTheWay}</h3>
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
            <p className="text-body-sm text-ff-text-muted">
              {isLoggedIn ? t.visitDashboard : t.visitDashboardGuest}
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-ff-cream rounded-[--radius-lg]">
            <span className="text-ff-gold font-bold">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">{t.contactUs}</p>
          </div>
        </div>
      </Card>

      {/* Receipt note */}
      <Card className="p-4 border border-ff-border-light shadow-sm rounded-[--radius-lg] bg-ff-cream">
        <p className="text-body-sm text-ff-text-muted text-center mb-3">
          {locale === 'de'
            ? 'Deine Rechnung wurde per E-Mail gesendet.'
            : 'Your receipt has been sent to your email.'}
        </p>
        {orderId && downloadToken && (
          <div className="flex justify-center">
            <a
              href={`/api/orders/${orderId}/receipt?token=${downloadToken}`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-ff-near-black text-white text-sm rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium"
            >
              <Download className="w-4 h-4" />
              {locale === 'de' ? 'Rechnung herunterladen' : 'Download Receipt'}
            </a>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isLoggedIn ? (
          <>
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
          </>
        ) : (
          <>
            <Link
              href="/create-account"
              className="flex-1 px-6 py-3 bg-ff-gold text-white rounded-[--radius-pill] hover:opacity-90 transition-opacity font-display font-medium text-center"
            >
              {t.createAccount}
            </Link>
            <Link
              href="/shop"
              className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-[--radius-pill] hover:bg-ff-cream transition-colors font-display font-medium text-center"
            >
              {t.continueShopping}
            </Link>
          </>
        )}
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
