'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useEffect, useRef, useState } from 'react'
import { BookingModal } from './BookingModal'
import type { WorkshopDate, WorkshopDetailData } from './workshop-data'

/* ═══════════════════════════════════════════════════════════════
 *  KombuchaBookingCard — Modern booking experience
 *
 *  CMS-driven via `cms` prop (workshopDetail tab in admin).
 *  Falls back to `workshop` prop (kombucha-data.ts defaults).
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS Props Type ─────────────────────────────────────────

export type KombuchaBookingCMS = {
  bookingEyebrow?: string | null
  bookingPrice?: number | null
  bookingPriceSuffix?: string | null
  bookingCurrency?: string | null
  bookingImage?: unknown
  bookingAttributes?: Array<{ text?: string | null }> | null
  bookingViewDatesLabel?: string | null
  bookingHideDatesLabel?: string | null
  bookingMoreDetailsLabel?: string | null
  bookingBookLabel?: string | null
  bookingSpotsLabel?: string | null
  aboutHeading?: string | null
  aboutText?: string | null
  scheduleHeading?: string | null
  schedule?: Array<{
    duration?: string | null
    title?: string | null
    description?: string | null
  }> | null
  includedHeading?: string | null
  includedItems?: Array<{ text?: string | null }> | null
  whyHeading?: string | null
  whyPoints?: Array<{ bold?: string | null; rest?: string | null }> | null
  experienceEyebrow?: string | null
  experienceTitle?: string | null
  experienceCards?: Array<{
    image?: unknown
    eyebrow?: string | null
    title?: string | null
    description?: string | null
  }> | null
  datesHeading?: string | null
  dates?: Array<{
    date?: string | null
    time?: string | null
    spotsLeft?: number | null
    id?: string
  }> | null
  modalConfirmHeading?: string | null
  modalConfirmSubheading?: string | null
  modalWorkshopLabel?: string | null
  modalDateLabel?: string | null
  modalTimeLabel?: string | null
  modalTotalLabel?: string | null
  modalCancelLabel?: string | null
  modalConfirmLabel?: string | null
}

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

// ─── Inline Icons ───────────────────────────────────────────

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
      <path d="M3 8h14M7 2v4M13 2v4" />
    </svg>
  )
}

function ClockIcon({ className = 'size-4' }: { className?: string }) {
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

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7l5 5 5-5" />
    </svg>
  )
}

// ─── Experience Cards Data ──────────────────────────────────

const EXPERIENCE_CARDS = [
  {
    eyebrow: 'THEORY',
    title: 'Kombucha Fundamentals',
    description:
      'Discover the science behind kombucha fermentation. Learn about SCOBYs, probiotics, and the biology that transforms sweet tea into a fizzy, healthy beverage everyone loves.',
  },
  {
    eyebrow: 'PRACTICE',
    title: 'Brew Your Own Batch',
    description:
      "Under expert guidance, brew your first batch of kombucha with our SCOBY and premium tea. You'll create a living culture that you take home — ready to ferment over 7-10 days.",
  },
  {
    eyebrow: 'TASTING',
    title: 'Flavored Kombucha',
    description:
      'Bottle and flavor your kombucha with fruits, spices, and botanicals. Taste the magic of fermentation and explore endless flavor possibilities — all vegan and naturally energizing.',
  },
]

// ─── Main Component ─────────────────────────────────────────

export function KombuchaBookingCard({
  workshop,
  cms,
}: {
  workshop?: WorkshopDetailData
  cms?: KombuchaBookingCMS
}) {
  // CMS values with English defaults (no workshop fallback for Kombucha)
  const bookingEyebrow = cms?.bookingEyebrow ?? '3-HOUR HANDS-ON WORKSHOP'
  const bookingPrice = cms?.bookingPrice ?? 79
  const bookingPriceSuffix = cms?.bookingPriceSuffix ?? 'per person'
  const bookingCurrency = cms?.bookingCurrency ?? '€'
  const bookingAttributes = (cms?.bookingAttributes?.length ?? 0) > 0 ? cms?.bookingAttributes : undefined
  const bookingViewDatesLabel = cms?.bookingViewDatesLabel ?? 'View Dates & Book'
  const bookingHideDatesLabel = cms?.bookingHideDatesLabel ?? 'Hide Dates'
  const bookingMoreDetailsLabel = cms?.bookingMoreDetailsLabel ?? 'More Information'
  const bookingBookLabel = cms?.bookingBookLabel ?? 'Book'
  const bookingSpotsLabel = cms?.bookingSpotsLabel ?? 'spots available'

  const aboutHeading = cms?.aboutHeading ?? 'About This Workshop'
  const aboutText =
    cms?.aboutText ??
    'Craft your own kombucha in this hands-on 3-hour workshop. We guide you through every step — from preparing the sweet tea to nurturing your SCOBY starter culture, and finally bottling your unique flavors.'

  const scheduleHeading = cms?.scheduleHeading ?? 'What Happens Step-by-Step'
  const schedule = cms?.schedule ?? [
    {
      duration: '45 min',
      title: 'Welcome + Tea Time',
      description: 'Learn the science of kombucha fermentation and meet your SCOBY.',
    },
    {
      duration: '45 min',
      title: 'Brewing',
      description: 'Prepare your batch with fresh spring water, organic black tea, and your starter culture.',
    },
    {
      duration: '45 min',
      title: 'Flavoring + Tasting',
      description: 'Bottle previous batches with fruit, spices, or botanicals. Taste the fizzy magic you created.',
    },
  ]

  const includedHeading = cms?.includedHeading ?? 'What\'s Included'
  const includedItems = cms?.includedItems ?? [
    { text: 'Premium black tea & spring water' },
    { text: 'SCOBY starter culture to take home' },
    { text: 'All brewing equipment & bottles' },
    { text: 'Recipe cards & care guide' },
    { text: 'Tasting of finished kombucha' },
    { text: 'Lifetime support via email' },
  ]

  const whyHeading = cms?.whyHeading ?? 'Why Join This Workshop?'
  const whyPoints = cms?.whyPoints ?? [
    { bold: 'Health-conscious living', rest: 'Create your own probiotics instead of buying expensive bottled kombucha.' },
    { bold: 'Cost-effective', rest: 'A SCOBY batch costs €0.30 after the initial investment — far cheaper than store brands.' },
    { bold: 'DIY confidence', rest: 'Fermentation becomes second nature. You\'ll never look at lunch boxes the same way.' },
    {
      bold: 'Flavor freedom',
      rest: 'Create your dream kombucha — passion fruit hibiscus, spiced lemon, whatever you love.',
    },
  ]

  const experienceEyebrow = cms?.experienceEyebrow ?? 'The Experience'
  const experienceTitle = cms?.experienceTitle ?? '3 Hours to Fermentation Mastery'
  const experienceCards = cms?.experienceCards ?? EXPERIENCE_CARDS

  const datesHeading = cms?.datesHeading ?? 'Reserve Your Spot'
  const dates = cms?.dates ?? workshop?.dates ?? []

  const modalConfirmHeading = cms?.modalConfirmHeading ?? 'Booking Confirmed'
  const modalConfirmSubheading = cms?.modalConfirmSubheading ?? 'You are registered for:'
  const modalWorkshopLabel = cms?.modalWorkshopLabel ?? 'Workshop'
  const modalDateLabel = cms?.modalDateLabel ?? 'Date'
  const modalTimeLabel = cms?.modalTimeLabel ?? 'Time'
  const modalTotalLabel = cms?.modalTotalLabel ?? 'Total'
  const modalCancelLabel = cms?.modalCancelLabel ?? 'Back'
  const modalConfirmLabel = cms?.modalConfirmLabel ?? 'Confirm Booking'

  const bookingImage = isResolvedMedia(cms?.bookingImage) ? (cms.bookingImage as MediaType) : null

  // Build merged workshop object for BookingModal (like TempehBookingCard)
  // Map arrays to ensure required properties are present
  const mappedSchedule = (schedule || []).map((item) => ({
    duration: item.duration || '',
    title: item.title || '',
    description: item.description || '',
  }))
  const mappedIncludedItems = (includedItems || []).map((item) => ({
    text: item.text || '',
  }))
  const mappedWhyPoints = (whyPoints || []).map((point) => ({
    bold: point.bold || '',
    rest: point.rest || '',
  }))
  const mappedDates = (dates || []).map((d: any) => ({
    id: d.id || '',
    date: d.date || '',
    time: d.time || '',
    spotsLeft: d.spotsLeft ?? 0,
  }))

  const mergedWorkshop: WorkshopDetailData = {
    slug: 'kombucha',
    title: 'Kombucha',
    subtitle: bookingEyebrow,
    description: aboutText,
    price: bookingPrice,
    priceSuffix: bookingPriceSuffix,
    currency: bookingCurrency,
    heroImage: null,
    highlights: [],
    aboutHeading,
    aboutText,
    scheduleHeading,
    schedule: mappedSchedule,
    includedHeading,
    includedItems: mappedIncludedItems,
    whyHeading,
    whyPoints: mappedWhyPoints,
    datesHeading,
    dates: mappedDates,
    viewDatesLabel: bookingViewDatesLabel,
    hideDatesLabel: bookingHideDatesLabel,
    moreInfoLabel: bookingMoreDetailsLabel,
    bookLabel: bookingBookLabel,
    spotsLabel: bookingSpotsLabel,
    closeLabel: 'Close',
    confirmHeading: modalConfirmHeading,
    confirmSubheading: modalConfirmSubheading,
    workshopLabel: modalWorkshopLabel,
    dateLabel: modalDateLabel,
    timeLabel: modalTimeLabel,
    totalLabel: modalTotalLabel,
    cancelLabel: modalCancelLabel,
    confirmLabel: modalConfirmLabel,
  }

  const [showDates, setShowDates] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<WorkshopDate | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to dates section when toggled
  useEffect(() => {
    if (showDates && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [showDates])

  return (
    <div ref={contentRef} className="section-padding-lg bg-white">
      <div className="mx-auto max-w-6xl">
        {/* ─── Header Row ──────────────────────────────────────── */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Text + CTA */}
          <div>
            <p className="mb-3 font-display text-caption font-bold uppercase tracking-[0.25em] text-[#9fc9d9]">
              {bookingEyebrow}
            </p>
            <div className="mb-6 flex items-baseline gap-4">
              <span className="font-display text-5xl font-black tracking-tight text-ff-near-black">
                {bookingCurrency}
                {bookingPrice}
              </span>
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-[#555954]/60">
                {bookingPriceSuffix}
              </span>
            </div>

            {bookingAttributes && bookingAttributes.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {bookingAttributes.map((attr) => (
                  <span
                    key={attr.text}
                    className="rounded-full bg-[#E8F3F8] px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest text-[#555954]"
                  >
                    {attr.text}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowDates(!showDates)}
              className="inline-flex items-center justify-center rounded-full bg-[#555954] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#3d3933]"
            >
              {showDates ? bookingHideDatesLabel : bookingViewDatesLabel}
            </button>
          </div>

          {/* Right: Image or placeholder */}
          {bookingImage ? (
            <div className="relative h-80 w-full overflow-hidden rounded-lg">
              <Media resource={bookingImage} fill imgClassName="object-cover" />
            </div>
          ) : (
            <div className="h-80 w-full rounded-lg bg-linear-to-br from-[#E8F3F8] to-[#d0e5f0]" />
          )}
        </div>

        {/* ─── About Section ───────────────────────────────── */}
        <div className="mb-12 rounded-lg bg-[#f7f5f2] px-8 py-12 lg:px-12">
          <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-ff-near-black lg:text-3xl">
            {aboutHeading}
          </h2>
          <p className="text-justify text-body-lg leading-relaxed text-[#555954] max-w-2xl">
            {aboutText}
          </p>
        </div>

        {/* ─── Schedule Section ────────────────────────────── */}
        <div className="mb-12">
          <h2 className="mb-10 font-display text-2xl font-bold tracking-tight text-ff-near-black lg:text-3xl">
            {scheduleHeading}
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {schedule && schedule.length > 0 ? (
              schedule.map((item, i) => (
                <div key={i} className="rounded-lg border border-[#e6e4e0] bg-white px-6 py-8">
                  <div className="mb-4 flex items-baseline gap-3">
                    <span className="font-display text-2xl font-bold text-[#9fc9d9]">{item.duration}</span>
                  </div>
                  <h3 className="mb-3 font-display text-lg font-bold tracking-tight text-ff-near-black">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#555954]">{item.description}</p>
                </div>
              ))
            ) : (
              <p className="text-[#555954]">No schedule available</p>
            )}
          </div>
        </div>

        {/* ─── Included Section ────────────────────────────── */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-6 font-display text-2xl font-bold tracking-tight text-ff-near-black">
              {includedHeading}
            </h3>
            <ul className="space-y-3">
              {includedItems && includedItems.length > 0 ? (
                includedItems.map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#9fc9d9]" />
                    <span className="text-body-sm leading-relaxed text-[#555954]">{item.text}</span>
                  </li>
                ))
              ) : (
                <p className="text-[#555954]">Nothing listed</p>
              )}
            </ul>
          </div>

          {/* Why Join */}
          <div>
            <h3 className="mb-6 font-display text-2xl font-bold tracking-tight text-ff-near-black">
              {whyHeading}
            </h3>
            <ul className="space-y-4">
              {whyPoints && whyPoints.length > 0 ? (
                whyPoints.map((point, i) => (
                  <li key={i} className="text-body-sm leading-relaxed text-[#555954]">
                    <strong className="font-bold text-ff-near-black">{point.bold}</strong> — {point.rest}
                  </li>
                ))
              ) : (
                <p className="text-[#555954]">No points available</p>
              )}
            </ul>
          </div>
        </div>

        {/* ─── Experience Cards Section ────────────────────── */}
        <div className="mb-12">
          <p className="mb-3 font-display text-caption font-bold uppercase tracking-[0.25em] text-[#9fc9d9]">
            {experienceEyebrow}
          </p>
          <h2 className="mb-10 font-display text-2xl font-bold tracking-tight text-ff-near-black lg:text-3xl">
            {experienceTitle}
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {experienceCards && experienceCards.length > 0 ? (
              experienceCards.map((card, i) => (
                <div key={i} className="rounded-lg bg-[#f7f5f2] p-8">
                  <p className="mb-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-[#9fc9d9]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mb-4 font-display text-lg font-bold tracking-tight text-ff-near-black">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#555954]">{card.description}</p>
                </div>
              ))
            ) : (
              <p className="text-[#555954]">No experience cards available</p>
            )}
          </div>
        </div>

        {/* ─── Dates Section ───────────────────────────────── */}
        {showDates && (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold tracking-tight text-ff-near-black">
              {datesHeading}
            </h3>
            {dates && dates.length > 0 ? (
              <div className="space-y-4">
                {dates.map((date: any) => {
                  const typedDate: WorkshopDate = {
                    id: date.id || '',
                    date: date.date || '',
                    time: date.time || '',
                    spotsLeft: date.spotsLeft ?? 0,
                  }
                  return (
                    <button
                      key={typedDate.id}
                      onClick={() => setSelectedBooking(typedDate)}
                      className="w-full rounded-lg border border-[#e6e4e0] bg-white px-6 py-4 text-left transition-all hover:border-[#9fc9d9] hover:bg-[#E8F3F8]/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[#555954]">
                            <CalendarIcon className="size-5" />
                            <span className="font-display font-semibold">{typedDate.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#555954]">
                            <ClockIcon className="size-4" />
                            <span className="text-sm">{typedDate.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#9fc9d9]">
                            {bookingSpotsLabel}
                          </p>
                          <p className="text-lg font-bold text-ff-near-black">{typedDate.spotsLeft}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-[#555954]">No dates available at this time</p>
            )}
          </div>
        )}
      </div>

      {/* ─── Booking Modal ───────────────────────────────── */}
      {selectedBooking && (
        <BookingModal
          workshop={mergedWorkshop}
          selectedDate={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={() => {
            alert(`Booking confirmed for ${selectedBooking.date}!`)
            setSelectedBooking(null)
          }}
        />
      )}
    </div>
  )
}
