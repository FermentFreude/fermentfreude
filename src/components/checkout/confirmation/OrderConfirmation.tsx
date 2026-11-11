import { accountI18n } from '@/app/(app)/account/i18n'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { ProductItem } from '@/components/ProductItem'
import { Card } from '@/components/ui/card'
import type { OrderConfirmationData } from '@/lib/orderConfirmation'
import { formatDate } from '@/utilities/form/formatters'
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
import Link from 'next/link'
import { PickupBookingCta } from './PickupBookingCta'
import { PickupBookingModal } from './PickupBookingModal'

/**
 * The whole order-confirmation screen, for every order type and for both
 * guests and logged-in customers.
 *
 * This used to live twice — once in checkout/order-confirmation/page.tsx and
 * once in account/order-confirmation/page.tsx — as two ~800-line near-copies.
 * They drifted (the account copy never got product images, workshop images or
 * the manage-booking link when the checkout copy did), and every design change
 * had to be made in both places. Both routes now render this one component and
 * differ only in the `isLoggedIn` they pass.
 */
/**
 * One card treatment and one button treatment for the whole screen. Gold is
 * reserved for the single action the customer still has to take (booking a
 * pickup slot) — everything else is outlined, so nothing competes with it.
 */
const CARD = 'rounded-(--radius-card) border border-ff-border-light bg-ff-cream p-6'
const BUTTON_SECONDARY =
  'flex-1 rounded-(--radius-pill) border border-ff-near-black px-6 py-3 text-center font-display font-medium text-ff-near-black transition-colors hover:bg-ff-near-black hover:text-white'

/** Label/value row inside the single summary card. */
const ROW_LABEL = 'text-ff-text-muted'
const ROW_VALUE = 'font-display font-semibold text-ff-near-black'

type Props = {
  data: OrderConfirmationData
  orderId?: string
  type?: string
  locale: 'de' | 'en'
  isLoggedIn: boolean
}

export function OrderConfirmation({ data, orderId, type, locale, isLoggedIn }: Props) {
  const t = locale === 'de' ? accountI18n.de : accountI18n.en
  const isWorkshop = type === 'workshop'
  const isCourse = type === 'course'

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
    total,
    currency,
  } = data

  // ─── Pickup order confirmation ─────────────────────────────
  if (isPickupOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Booking the collection slot is the only thing left for the customer
            to do, so it opens over the page on arrival. */}
        {pickupBookingUrl && (
          <PickupBookingModal url={pickupBookingUrl} locale={locale} orderId={orderId} />
        )}

        {/* Confirmation */}
        <div className="pt-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ff-near-black">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-ff-near-black">
            {t.orderConfirmed}
          </h1>
          <p className="text-body-sm text-ff-gray-text">{t.orderConfirmedDesc}</p>
        </div>

        {/* The single outstanding action — deliberately the only place on this
            page that offers to book, so it can't be mistaken for one of
            several competing choices. */}
        {pickupBookingUrl && <PickupBookingCta url={pickupBookingUrl} locale={locale} />}

        {/* Everything the customer might want to look up, in one card.
            These were four separate cards — order info, items, pickup address
            and a numbered "what's next" list. The list only restated the
            booking card above it, and splitting the rest into three bordered
            boxes made a short receipt look like a long form. Hairlines
            separate the groups now instead of borders. */}
        <section className={CARD}>
          {orderId && (
            <dl className="space-y-2.5 text-body-sm">
              <div className="flex justify-between gap-4">
                <dt className={ROW_LABEL}>{t.orderNumber}</dt>
                <dd className={ROW_VALUE}>#{orderId.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className={ROW_LABEL}>{t.orderDate}</dt>
                <dd className={ROW_VALUE}>{formatDate(new Date().toISOString())}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className={ROW_LABEL}>{t.emailConfirmation}</dt>
                <dd className={ROW_VALUE}>{t.sentToInbox}</dd>
              </div>
            </dl>
          )}

          {items.length > 0 && (
            <div className="mt-6 border-t border-ff-border-light pt-6">
              <ul className="flex flex-col gap-6">
                {items.map((item) => (
                  <li key={item.id}>
                    <ProductItem
                      product={item.product}
                      quantity={item.quantity}
                      variant={item.variant}
                      currencyCode={currency ?? undefined}
                    />
                  </li>
                ))}
              </ul>

              {/* One total, for the amount actually charged. Taken from the
                  Order rather than summed here, so a voucher or discount can
                  never leave this disagreeing with the card statement. */}
              {typeof total === 'number' && (
                <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-ff-border-light pt-5">
                  <span className="font-display text-body font-bold text-ff-near-black">
                    {t.total}
                  </span>
                  <Price
                    className="font-display text-xl font-bold text-ff-near-black"
                    amount={total}
                    currencyCode={currency ?? undefined}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-start gap-3 border-t border-ff-border-light pt-6">
            <Store className="mt-0.5 h-5 w-5 shrink-0 text-ff-gold" strokeWidth={1.5} />
            <div>
              <p className={ROW_VALUE}>{pickupLocationName}</p>
              <p className="text-body-sm text-ff-gray-text">{pickupLocationAddress}</p>
            </div>
          </div>
        </section>

        {/* Secondary actions — never gold, so nothing competes with booking */}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Link
            href={isLoggedIn ? '/account/orders' : '/create-account'}
            className={BUTTON_SECONDARY}
          >
            {isLoggedIn ? t.viewMyOrders : t.createAccount}
          </Link>
          <Link href="/shop" className={BUTTON_SECONDARY}>
            {t.continueShopping}
          </Link>
        </div>

        <p className="pt-2 text-center text-body-sm text-ff-text-muted">
          {locale === 'de'
            ? 'Hast du Fragen zu deiner Bestellung?'
            : 'Do you have questions about your order?'}{' '}
          <a
            href="mailto:kontakt@fermentfreude.at"
            className="font-display font-semibold text-ff-near-black underline decoration-ff-gold decoration-2 underline-offset-4 transition-colors hover:decoration-ff-near-black"
          >
            {t.contactSupport}
          </a>
        </p>
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
    const LABEL = 'font-display text-[11px] font-bold uppercase tracking-[0.18em]'
    const OUTLINE_BTN =
      'inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-(--radius-pill) border-2 border-ff-near-black px-7 py-4 text-center font-display text-base font-bold text-ff-near-black transition-colors hover:bg-ff-near-black hover:text-white'

    return (
      <div className="mx-auto max-w-4xl space-y-14 px-5 sm:space-y-20 sm:px-8 lg:px-0 [&_h1]:mb-0 [&_h2]:mb-0 [&_h3]:mb-0 [&_p]:mb-0">
        {/* Headline — big, black on white */}
        <header className="pt-6 text-center sm:pt-10">
          <p className={`${LABEL} text-ff-near-black`}>
            {locale === 'de' ? 'Buchung bestätigt' : 'Booking confirmed'}
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance font-display text-[clamp(2.25rem,6.5vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ff-near-black">
            {t.workshopConfirmed}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-[clamp(1rem,1.7vw,1.25rem)] leading-relaxed text-ff-text-muted">
            {t.workshopConfirmDesc}
          </p>
        </header>

        {/* Photo of the booked workshop, with its name */}
        <div className="relative mx-auto aspect-3/2 w-full max-w-3xl overflow-hidden rounded-[28px] bg-ff-near-black sm:aspect-5/2">
          {workshopImage ? (
            <Media resource={workshopImage} fill imgClassName="object-cover" priority />
          ) : null}
          <div
            className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10"
            aria-hidden="true"
          />
          {bookingSummary && (
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <p className={`${LABEL} text-white/75`}>{t.bookingSummaryTitle}</p>
              <h2 className="mt-2 font-display text-[clamp(1.5rem,3.6vw,2.75rem)] font-bold leading-[0.98] tracking-[-0.03em] text-white">
                {bookingSummary.workshopTitle}
              </h2>
            </div>
          )}
        </div>

        {/* The details — black card, big white text */}
        {bookingSummary && (
          <dl className="mx-auto -mt-6 grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 rounded-[28px] bg-ff-near-black p-6 text-white sm:-mt-8 sm:grid-cols-4 sm:p-8">
            <div>
              <dt className={`${LABEL} text-white/60`}>{t.labelDate}</dt>
              <dd className="mt-2 font-display text-lg font-bold leading-tight tracking-tight sm:text-2xl">
                {bookingSummary.date}
              </dd>
            </div>
            <div>
              <dt className={`${LABEL} text-white/60`}>{t.labelTime}</dt>
              <dd className="mt-2 font-display text-lg font-bold leading-tight tracking-tight sm:text-2xl">
                {bookingSummary.time}
              </dd>
            </div>
            {bookingSummary.location && (
              <div className="col-span-2 sm:col-span-1">
                <dt className={`${LABEL} text-white/60`}>{t.labelLocation}</dt>
                <dd className="mt-2 font-display text-base font-bold leading-snug tracking-tight sm:text-lg">
                  {bookingSummary.location}
                </dd>
              </div>
            )}
            <div>
              <dt className={`${LABEL} text-white/60`}>{t.labelGuests}</dt>
              <dd className="mt-2 font-display text-lg font-bold leading-tight tracking-tight sm:text-2xl">
                {bookingSummary.guestCount}
              </dd>
            </div>
          </dl>
        )}

        {/* Actions: manage the booking, download the invoice */}
        {(manageBookingLinks.length > 0 || (orderId && downloadToken)) && (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
            {manageBookingLinks.length > 0 && (
              <Link
                href={manageBookingLinks[0].url}
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-(--radius-pill) bg-ff-gold px-7 py-4 text-center font-display text-base font-bold text-ff-near-black transition-colors hover:bg-ff-gold-accent-dark"
              >
                {t.manageBookingCta}
              </Link>
            )}
            {orderId && downloadToken && (
              <a
                href={`/api/orders/${orderId}/receipt?token=${downloadToken}`}
                download
                className={OUTLINE_BTN}
              >
                <Download className="size-5" aria-hidden="true" />
                {locale === 'de' ? 'Rechnung herunterladen' : 'Download invoice'}
              </a>
            )}
          </div>
        )}

        {/* Order info — one calm line of big values */}
        {orderId && (
          <dl className="grid gap-8 border-y border-ff-near-black/15 py-10 sm:grid-cols-3">
            <div>
              <dt className={`${LABEL} text-ff-text-muted`}>{t.orderNumber}</dt>
              <dd className="mt-2 font-display text-xl font-bold tracking-tight text-ff-near-black sm:text-2xl">
                #{orderId.slice(0, 8).toUpperCase()}
              </dd>
            </div>
            <div>
              <dt className={`${LABEL} text-ff-text-muted`}>{t.orderDate}</dt>
              <dd className="mt-2 font-display text-xl font-bold tracking-tight text-ff-near-black sm:text-2xl">
                {formatDate(new Date().toISOString())}
              </dd>
            </div>
            <div>
              <dt className={`${LABEL} text-ff-text-muted`}>{t.emailConfirmation}</dt>
              <dd className="mt-2 font-display text-xl font-bold tracking-tight text-ff-near-black sm:text-2xl">
                {t.sentToInbox}
              </dd>
            </div>
          </dl>
        )}

        {/* What's next */}
        <section>
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.03em] text-ff-near-black">
            {t.whatsNext}
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {nextSteps.map((step) => (
              <li key={step.title} className="flex flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-ff-near-black">
                  <step.icon className="size-6 text-white" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[clamp(1.125rem,2vw,1.375rem)] font-bold tracking-tight text-ff-near-black">
                  {step.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-ff-text-muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Profile CTA — go to account, or create one as a guest */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-[28px] border border-ff-near-black/15 p-7 text-center sm:flex-row sm:p-10 sm:text-left">
          {isLoggedIn ? (
            <>
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-ff-near-black">
                  {t.viewBookingDetails}
                </p>
                <p className="mt-1.5 text-base text-ff-text-muted">{t.bookingConfirmedDesc}</p>
              </div>
              <Link
                href={orderId ? `/account/orders/${orderId}` : '/account/orders'}
                className="inline-flex shrink-0 items-center gap-2 rounded-(--radius-pill) border-2 border-ff-near-black px-6 py-3 font-display text-sm font-bold text-ff-near-black transition-colors hover:bg-ff-near-black hover:text-white"
              >
                {t.goToProfile}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-ff-near-black">
                  {t.createAccountPrompt}
                </p>
                <p className="mt-1.5 text-base text-ff-text-muted">{t.createAccountDesc}</p>
              </div>
              <Link
                href="/create-account"
                className="inline-flex shrink-0 items-center gap-2 rounded-(--radius-pill) border-2 border-ff-near-black px-6 py-3 font-display text-sm font-bold text-ff-near-black transition-colors hover:bg-ff-near-black hover:text-white"
              >
                {t.createAccountPrompt}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        {/* Explore other workshops */}
        {otherWorkshops.length > 0 && (
          <section>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.03em] text-ff-near-black">
              {t.exploreOtherWorkshops}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {otherWorkshops.map((w) => (
                <Link key={w.slug} href={`/workshops/${w.slug}`} className="group block">
                  <div className="relative mb-4 aspect-4/3 overflow-hidden rounded-[22px] bg-ff-near-black">
                    {w.image && (
                      <Media
                        resource={w.image}
                        fill
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-ff-near-black">
                    {w.title}
                  </h3>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 font-display text-sm font-bold text-ff-near-black underline decoration-ff-gold decoration-2 underline-offset-4">
                    {t.learnMore}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/workshops" className={`${OUTLINE_BTN} flex-none`}>
                {t.browseMoreWorkshops}
              </Link>
            </div>
          </section>
        )}

        {/* Support */}
        <div className="border-t border-ff-near-black/15 pt-10 text-center">
          <h3 className="font-display text-xl font-bold tracking-tight text-ff-near-black">
            {t.questions}
          </h3>
          <p className="mt-1.5 text-base text-ff-text-muted">{t.questionsDescWorkshop}</p>
          <a
            href="mailto:kontakt@fermentfreude.at"
            className="mt-4 inline-block font-display text-base font-bold text-ff-near-black underline decoration-ff-gold decoration-2 underline-offset-4 transition-colors hover:decoration-ff-near-black"
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
          <Card className="p-6 border border-ff-border-light shadow-sm rounded-(--radius-card)">
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
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-(--radius-card)">
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
        <Card className="p-4 border border-ff-border-light shadow-sm rounded-(--radius-card) bg-ff-cream">
          <p className="text-body-sm text-ff-text-muted text-center mb-3">
            {locale === 'de'
              ? 'Deine Rechnung wurde per Mail gesendet.'
              : 'Your receipt has been sent to your email.'}
          </p>
          {orderId && downloadToken && (
            <div className="flex justify-center">
              <a
                href={`/api/orders/${orderId}/receipt?token=${downloadToken}`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-ff-near-black text-white text-sm rounded-(--radius-pill) hover:opacity-90 transition-opacity font-display font-medium"
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
                className="flex-1 px-6 py-3 bg-ff-near-black text-white rounded-(--radius-pill) hover:opacity-90 transition-opacity font-display font-medium text-center"
              >
                {t.goToLearning}
              </Link>
              <Link
                href="/courses"
                className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-(--radius-pill) hover:bg-ff-cream transition-colors font-display font-medium text-center"
              >
                {t.browseMoreCourses}
              </Link>
            </>
          ) : (
            <Link
              href="/courses"
              className="flex-1 px-6 py-3 bg-ff-near-black text-white rounded-(--radius-pill) hover:opacity-90 transition-opacity font-display font-medium text-center"
            >
              {t.browseMoreCourses}
            </Link>
          )}
        </div>

        {/* Support */}
        <Card className="p-6 border-0 shadow-sm bg-ff-cream rounded-(--radius-card)">
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
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-(--radius-card)">
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
        <Card className="p-6 border border-ff-border-light shadow-sm rounded-(--radius-card)">
          <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">{t.items}</h2>
          <ul className="flex flex-col gap-6">
            {items.map((item) => (
              <li key={item.id}>
                <ProductItem
                  product={item.product}
                  quantity={item.quantity}
                  variant={item.variant}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6 border border-ff-border-light shadow-sm rounded-(--radius-card)">
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
      <Card className="p-6 border border-ff-border-light shadow-sm rounded-(--radius-card)">
        <h2 className="text-lg font-display font-semibold text-ff-near-black mb-4">
          {t.whatYouCanDo}
        </h2>
        {/* Plain rows, not filled boxes — inset panels inside a card read as
            form inputs waiting to be filled in. */}
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-ff-gold font-bold leading-6">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">{t.checkEmail}</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-ff-gold font-bold leading-6">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">
              {isLoggedIn ? t.visitDashboard : t.visitDashboardGuest}
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-ff-gold font-bold leading-6">&bull;</span>
            <p className="text-body-sm text-ff-text-muted">{t.contactUs}</p>
          </li>
        </ul>
      </Card>

      {/* Receipt note */}
      <Card className="p-4 border border-ff-border-light shadow-sm rounded-(--radius-card) bg-ff-cream">
        <p className="text-body-sm text-ff-text-muted text-center mb-3">
          {locale === 'de'
            ? 'Deine Rechnung wurde per Mail gesendet.'
            : 'Your receipt has been sent to your email.'}
        </p>
        {orderId && downloadToken && (
          <div className="flex justify-center">
            <a
              href={`/api/orders/${orderId}/receipt?token=${downloadToken}`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-ff-near-black text-white text-sm rounded-(--radius-pill) hover:opacity-90 transition-opacity font-display font-medium"
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
              className="flex-1 px-6 py-3 bg-ff-gold text-white rounded-(--radius-pill) hover:opacity-90 transition-opacity font-display font-medium text-center"
            >
              {t.viewMyOrders}
            </Link>
            <Link
              href="/shop"
              className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-(--radius-pill) hover:bg-ff-cream transition-colors font-display font-medium text-center"
            >
              {t.continueShopping}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/create-account"
              className="flex-1 px-6 py-3 bg-ff-gold text-white rounded-(--radius-pill) hover:opacity-90 transition-opacity font-display font-medium text-center"
            >
              {t.createAccount}
            </Link>
            <Link
              href="/shop"
              className="flex-1 px-6 py-3 border border-ff-border-light text-ff-near-black rounded-(--radius-pill) hover:bg-ff-cream transition-colors font-display font-medium text-center"
            >
              {t.continueShopping}
            </Link>
          </>
        )}
      </div>

      {/* Support */}
      <Card className="p-6 border-0 shadow-sm bg-ff-cream rounded-(--radius-card)">
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
