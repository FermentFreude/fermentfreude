'use client'

import { FermentKalender } from '@/components/fermentation/FermentKalender'
import { FermentedVegHowTos } from '@/components/fermentation/FermentedVegHowTos'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { BookingModal } from './BookingModal'
import type { WorkshopDate, WorkshopDetailData } from './workshop-data'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop Detail Client Component
 *
 *  Renders the full workshop detail page based on Figma designs:
 *  1. Hero card (image + title + price + highlights + buttons)
 *  2. Expandable "More Information" panel:
 *     - About the Workshop
 *     - Schedule timeline
 *     - Included in price
 *     - Why this workshop
 *  3. Available dates with booking
 *  4. Booking confirmation modal
 * ═══════════════════════════════════════════════════════════════ */

// ─── SVG Icons ──────────────────────────────────────────────

function CalendarIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <path d="M3 8h14" />
      <path d="M7 2v4" />
      <path d="M13 2v4" />
    </svg>
  )
}

function ClockIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l3 2" />
    </svg>
  )
}

function TheoryIcon({ className = 'size-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#f5f1e8" />
      <path
        d="M14 16h20v16H14z"
        stroke="#3c3c3c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M18 22h12M18 26h8" stroke="#3c3c3c" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="14" r="2" fill="#3c3c3c" />
    </svg>
  )
}

function PracticeIcon({ className = 'size-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#f5f1e8" />
      <path
        d="M19 34V20c0-2.2 1.8-4 4-4h2c2.2 0 4 1.8 4 4v14"
        stroke="#3c3c3c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 34h14" stroke="#3c3c3c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 24h10" stroke="#3c3c3c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TastingIcon({ className = 'size-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#f5f1e8" />
      <path
        d="M16 20c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3-1.6 5.6-4 7v5h-8v-5c-2.4-1.4-4-4-4-7z"
        stroke="#3c3c3c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M20 34h8" stroke="#3c3c3c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Map highlight index to icon
const HIGHLIGHT_ICONS = [TheoryIcon, PracticeIcon, TastingIcon]

// ─── Main Component ─────────────────────────────────────────

export function WorkshopDetailClient({ workshop }: { workshop: WorkshopDetailData }) {
  const [showDates, setShowDates] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [bookingDate, setBookingDate] = useState<WorkshopDate | null>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const datesRef = useRef<HTMLDivElement>(null)

  const formattedPrice = `${workshop.currency}${workshop.price}`

  const handleToggleDates = () => {
    setShowDates((prev) => {
      const next = !prev
      if (next) {
        // Scroll to dates after state update
        setTimeout(() => {
          datesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      return next
    })
  }

  const handleMoreInfo = () => {
    setShowInfo((prev) => {
      const next = !prev
      if (next) {
        setTimeout(() => {
          infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      return next
    })
  }

  return (
    <>
      <article className="min-h-screen bg-ff-cream">
        {/* ── Booking Card ─────────────────────────────────── */}
        <section className="container mx-auto container-padding pt-32">
          <div className="overflow-hidden rounded-2xl border border-(--ff-border-light)/50 bg-ff-cream">
            {/* Hero Image */}
            <div className="relative aspect-[2.8/1] w-full overflow-hidden bg-[#ECE5DE]">
              {workshop.heroImage ? (
                <Image
                  src={workshop.heroImage}
                  alt={workshop.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="font-display text-3xl font-semibold text-(--ff-near-black)/20">
                    {workshop.title}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-8 pb-10 pt-10 sm:px-12 lg:px-16">
              {/* Title + Subtitle + Price */}
              <div className="mb-8 space-y-3">
                <h1 className="font-display text-display font-semibold tracking-tight text-ff-near-black">
                  {workshop.title}
                </h1>
                <p className="font-display text-body-lg font-semibold text-ff-gray-text-light">
                  {workshop.subtitle}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[2.25rem] font-medium tracking-wide text-ff-near-black">
                    {formattedPrice}
                  </span>
                  <span className="text-body text-ff-gray-text-light">{workshop.priceSuffix}</span>
                </div>
              </div>

              {/* What's Included */}
              <div className="mb-10 space-y-5">
                <h2 className="font-display text-body-lg font-black uppercase tracking-[0.15em] text-[#3c3c3c]">
                  What&apos;s included
                </h2>
                <div className="space-y-4">
                  {workshop.highlights.map((item, i) => {
                    const Icon = HIGHLIGHT_ICONS[i] ?? TheoryIcon
                    return (
                      <div key={i} className="flex items-start gap-5">
                        <Icon className="size-14 shrink-0" />
                        <div className="pt-1">
                          <h3 className="font-display text-body-lg font-bold tracking-wide text-[#3c3c3c]">
                            {item.title}
                          </h3>
                          <p className="mt-0.5 text-body text-ff-gray-text-light">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleToggleDates}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-(--radius-pill) bg-[#c1c1c1] px-8 py-3.5 font-display text-[1.125rem] font-semibold tracking-tight text-ff-near-black transition-colors hover:bg-[#b3b3b3]"
                >
                  <CalendarIcon className="size-5" />
                  {showDates ? workshop.hideDatesLabel : workshop.viewDatesLabel}
                </button>
                <button
                  onClick={handleMoreInfo}
                  className="inline-flex flex-1 items-center justify-center rounded-(--radius-pill) border border-ff-border-light bg-ff-cream px-8 py-3.5 font-display text-[1.125rem] font-semibold tracking-tight text-ff-near-black transition-colors hover:bg-[#f5f1e8]"
                >
                  {workshop.moreInfoLabel}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Available Dates ────────────────────────────── */}
        {showDates && (
          <section ref={datesRef} className="container mx-auto container-padding pt-10">
            <h2 className="mb-8 font-display text-section-heading font-bold tracking-wide text-[#3c3c3c]">
              {workshop.datesHeading}
            </h2>
            <div className="space-y-4">
              {workshop.dates.map((d) => (
                <DateCard
                  key={d.id}
                  workshopDate={d}
                  bookLabel={workshop.bookLabel}
                  spotsLabel={workshop.spotsLabel}
                  onBook={() => setBookingDate(d)}
                />
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowDates(false)}
                className="rounded-(--radius-pill) border-2 border-ff-border-light bg-ff-cream px-8 py-3 font-display text-body font-semibold text-ff-near-black transition-colors hover:bg-[#f5f1e8]"
              >
                {workshop.closeLabel}
              </button>
            </div>
          </section>
        )}

        {/* ── More Information Panel ─────────────────────── */}
        {showInfo && (
          <section ref={infoRef} className="container mx-auto container-padding pb-20 pt-16">
            {/* About */}
            <div className="mb-20">
              <h2 className="mb-6 font-display text-section-heading font-bold tracking-wide text-[#3c3c3c]">
                {workshop.aboutHeading}
              </h2>
              <p className="max-w-3xl text-body-lg leading-relaxed text-ff-gray-text">
                {workshop.aboutText}
              </p>
            </div>

            {/* Schedule Timeline */}
            <div className="mb-20">
              <h2 className="mb-10 font-display text-section-heading font-bold tracking-wide text-[#3c3c3c]">
                {workshop.scheduleHeading}
              </h2>
              <div className="space-y-10">
                {workshop.schedule.map((step, i) => (
                  <div key={i} className="flex gap-8 sm:gap-12">
                    {/* Duration pill */}
                    <div className="flex h-14 w-32 shrink-0 items-center justify-center rounded-(--radius-pill) bg-[#f5f1e8]">
                      <span className="font-display text-body font-semibold text-ff-near-black">
                        {step.duration}
                      </span>
                    </div>
                    {/* Content with left border */}
                    <div className="border-l-[3px] border-[#c1c1c1] pb-2 pl-8 sm:pl-12">
                      <h3 className="font-display text-subheading font-semibold text-ff-near-black">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-lg text-body text-ff-gray-text-light">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included In Price */}
            <div className="mb-20">
              <h2 className="mb-10 font-display text-section-heading font-bold tracking-wide text-[#3c3c3c]">
                {workshop.includedHeading}
              </h2>
              <div className="grid grid-cols-1 gap-x-16 gap-y-6 sm:grid-cols-2">
                {workshop.includedItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-2 size-3 shrink-0 rounded-full bg-ff-gray-text" />
                    <p className="text-body-lg text-ff-gray-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Workshop */}
            <div className="rounded-2xl bg-[#f5f1e8] px-8 py-16 sm:px-12 lg:px-16">
              <h2 className="mb-10 font-display text-section-heading font-bold tracking-wide text-[#3c3c3c]">
                {workshop.whyHeading}
              </h2>
              <div className="space-y-8">
                {workshop.whyPoints.map((point, i) => (
                  <p key={i} className="max-w-2xl text-body-lg leading-relaxed text-ff-gray-text">
                    <span className="font-bold text-ff-near-black">{point.bold}</span>
                    {point.rest}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Fermentkalender ───────────────────────── */}
        <FermentKalender />

        {/* ── Fermented Vegetables How-Tos ──────────── */}
        <FermentedVegHowTos
          workshopType={workshop.workshopType as 'lakto' | 'tempeh' | 'kombucha'}
        />
      </article>

      {/* ── Booking Confirmation Modal ───────────────────── */}
      {bookingDate && (
        <BookingModal
          workshop={workshop}
          selectedDate={bookingDate}
          maxCapacity={workshop.maxCapacity ?? 12}
          onClose={() => setBookingDate(null)}
          onConfirm={async (guestCount) => {
            // TODO: integrate with Stripe / booking system
            alert(`Booking confirmed for ${bookingDate.date}! Guests: ${guestCount}`)
            setBookingDate(null)
          }}
          onSelectDifferentDate={() => {
            setBookingDate(null)
          }}
        />
      )}
    </>
  )
}

// ─── Date Card ──────────────────────────────────────────────

function DateCard({
  workshopDate,
  bookLabel,
  spotsLabel,
  onBook,
}: {
  workshopDate: WorkshopDate
  bookLabel: string
  spotsLabel: string
  onBook: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#f5f1e8] px-6 py-5 sm:px-8">
      <div className="space-y-1">
        <p className="font-display text-body-lg font-medium text-ff-gray-text">
          {workshopDate.date}
        </p>
        <div className="flex items-center gap-3 text-body-sm text-ff-gray-text-light">
          <ClockIcon className="size-4" />
          <span>{workshopDate.time}</span>
          <span className="text-ff-gray-text-light">•</span>
          <span>
            {workshopDate.spotsLeft} {spotsLabel}
          </span>
        </div>
      </div>
      <button
        onClick={onBook}
        className="rounded-(--radius-pill) bg-ff-gray-text px-6 py-2.5 font-display text-body font-medium text-ff-cream transition-colors hover:bg-ff-charcoal"
      >
        {bookLabel}
      </button>
    </div>
  )
}
