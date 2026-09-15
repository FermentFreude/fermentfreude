import { accountI18n } from '@/app/(app)/account/i18n'
import { CalendarCheck } from 'lucide-react'

/**
 * The pickup booking call to action, sat directly under the success banner.
 *
 * Booking a collection slot is the one thing the customer still has to do
 * after paying, and anyone who leaves without doing it turns into a phone call
 * or an email for the founders — so this is deliberately the loudest element
 * on the page, above the order details rather than below them.
 */
export function PickupBookingCta({
  url,
  locale,
}: {
  url: string
  locale: 'de' | 'en'
}) {
  const t = locale === 'de' ? accountI18n.de : accountI18n.en

  return (
    <div className="rounded-[--radius-lg] border-2 border-ff-gold bg-ff-ivory p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ff-gold">
          <CalendarCheck className="h-7 w-7 text-ff-near-black" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ff-near-black">{t.pickupCtaTitle}</h2>
        <p className="max-w-md text-body-sm text-ff-gray-text">{t.pickupCtaBody}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[--radius-pill] bg-ff-gold px-8 py-4 font-display text-lg font-bold text-ff-near-black transition-opacity hover:opacity-90 sm:w-auto"
        >
          <CalendarCheck className="h-5 w-5" />
          {t.pickupCtaButton}
        </a>
      </div>
    </div>
  )
}
