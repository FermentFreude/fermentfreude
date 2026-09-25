import { accountI18n } from '@/app/(app)/account/i18n'
import { CalendarCheck } from 'lucide-react'

/**
 * The pickup booking call to action, sat directly under the success banner.
 *
 * Booking a collection slot is the one thing the customer still has to do
 * after paying, and anyone who leaves without doing it turns into a phone call
 * or an email for the founders — so this is deliberately the loudest element
 * on the page, above the order details rather than below them.
 *
 * It is the only black panel on the screen. Everything else is a pale card, so
 * this reads as the action without needing a second colour or a border to
 * fight for attention.
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
    <section className="rounded-(--radius-card) bg-ff-near-black px-7 py-9 text-center sm:px-10">
      <CalendarCheck className="mx-auto h-8 w-8 text-ff-gold" strokeWidth={1.5} />

      <h2 className="mt-5 text-balance font-display text-[1.6rem] font-bold leading-tight text-white sm:text-[1.75rem]">
        {t.pickupCtaTitle}
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-body-sm leading-relaxed text-white/60">
        {t.pickupCtaBody}
      </p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-(--radius-pill) bg-ff-gold px-8 py-3.5 font-display text-base font-bold text-ff-near-black transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-gold sm:w-auto sm:px-10"
      >
        <CalendarCheck className="h-4.5 w-4.5" />
        {t.pickupCtaButton}
      </a>
    </section>
  )
}
