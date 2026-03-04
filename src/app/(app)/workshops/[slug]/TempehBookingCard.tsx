'use client'

import { useState, useRef, useEffect } from 'react'
import type { WorkshopDetailData, WorkshopDate } from './workshop-data'
import { BookingModal } from './BookingModal'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  TempehBookingCard — Modern booking experience
 *
 *  CMS-driven via `cms` prop (workshopDetail tab in admin).
 *  Falls back to `workshop` prop (tempeh-data.ts defaults).
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS Props Type ─────────────────────────────────────────

export type TempehBookingCMS = {
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
  schedule?: Array<{ duration?: string | null; title?: string | null; description?: string | null }> | null
  includedHeading?: string | null
  includedItems?: Array<{ text?: string | null }> | null
  whyHeading?: string | null
  whyPoints?: Array<{ bold?: string | null; rest?: string | null }> | null
  experienceEyebrow?: string | null
  experienceTitle?: string | null
  experienceCards?: Array<{ image?: unknown; eyebrow?: string | null; title?: string | null; description?: string | null }> | null
  datesHeading?: string | null
  dates?: Array<{ date?: string | null; time?: string | null; spotsLeft?: number | null; id?: string }> | null
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
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <path d="M3 8h14M7 2v4M13 2v4" />
    </svg>
  )
}

function ClockIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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
    title: 'Fermentation Fundamentals',
    description:
      'Discover the science behind tempeh fermentation. Learn why tempeh is a complete plant-based protein with all essential amino acids, and understand the biology that makes it so special.',
  },
  {
    eyebrow: 'PRACTICE',
    title: 'Set Your Own Tempeh',
    description:
      "Under expert guidance, set up your own tempeh with starter culture and soybeans. You'll create a living ferment that goes home with you — ready to mature over 24 hours in your own kitchen.",
  },
  {
    eyebrow: 'TASTING',
    title: 'Tempeh Burgers',
    description:
      'Sauté fresh tempeh and build delicious burgers with fermented sides and artisan bread. Taste the difference freshly made tempeh brings to your plate — vegan option included.',
  },
]

// ─── Main Component ─────────────────────────────────────────

export function TempehBookingCard({ workshop, cms }: { workshop: WorkshopDetailData; cms?: TempehBookingCMS }) {
  // ── CMS values → fallback to workshop-data.ts defaults ──
  const bookingEyebrow = cms?.bookingEyebrow ?? workshop.subtitle.toUpperCase()
  const price = cms?.bookingPrice ?? workshop.price
  const priceSuffix = cms?.bookingPriceSuffix ?? workshop.priceSuffix
  const currency = cms?.bookingCurrency ?? workshop.currency
  const bookingImage = cms?.bookingImage
  const bookingAttributes = (cms?.bookingAttributes?.length ?? 0) > 0
    ? cms!.bookingAttributes!.map((a) => a.text ?? '').filter(Boolean)
    : ['3 Stunden', 'Hands-on', 'Experience', 'Max. 12 Personen']
  const viewDatesLabel = cms?.bookingViewDatesLabel ?? workshop.viewDatesLabel
  const hideDatesLabel = cms?.bookingHideDatesLabel ?? workshop.hideDatesLabel
  const moreDetailsLabel = cms?.bookingMoreDetailsLabel ?? workshop.moreInfoLabel
  const bookLabel = cms?.bookingBookLabel ?? workshop.bookLabel
  const spotsLabel = cms?.bookingSpotsLabel ?? workshop.spotsLabel

  const aboutHeading = cms?.aboutHeading ?? workshop.aboutHeading
  const aboutText = cms?.aboutText ?? workshop.aboutText
  const scheduleHeading = cms?.scheduleHeading ?? workshop.scheduleHeading
  const scheduleItems = (cms?.schedule?.length ?? 0) > 0
    ? cms!.schedule!.map((s) => ({ duration: s.duration ?? '', title: s.title ?? '', description: s.description ?? '' }))
    : workshop.schedule
  const includedHeading = cms?.includedHeading ?? workshop.includedHeading
  const includedItems = (cms?.includedItems?.length ?? 0) > 0
    ? cms!.includedItems!.map((item) => ({ text: item.text ?? '' }))
    : workshop.includedItems
  const whyHeading = cms?.whyHeading ?? workshop.whyHeading
  const whyPoints = (cms?.whyPoints?.length ?? 0) > 0
    ? cms!.whyPoints!.map((p) => ({ bold: p.bold ?? '', rest: p.rest ?? '' }))
    : workshop.whyPoints

  const experienceEyebrow = cms?.experienceEyebrow ?? 'WAS DICH ERWARTET'
  const experienceTitle = cms?.experienceTitle ?? 'Dein Workshop-Erlebnis'
  const experienceCardsData = (cms?.experienceCards?.length ?? 0) > 0
    ? cms!.experienceCards!.map((c) => ({
        image: c.image,
        eyebrow: c.eyebrow ?? '',
        title: c.title ?? '',
        description: c.description ?? '',
      }))
    : EXPERIENCE_CARDS.map((c) => ({ ...c, image: undefined as unknown }))

  const datesHeading = cms?.datesHeading ?? workshop.datesHeading
  const cmsDates: WorkshopDate[] = (cms?.dates?.length ?? 0) > 0
    ? cms!.dates!.map((d, i) => ({
        id: d.id ?? `cms-${i}`,
        date: d.date ?? '',
        time: d.time ?? '',
        spotsLeft: d.spotsLeft ?? 0,
      }))
    : workshop.dates

  // Build merged workshop for BookingModal
  const mergedWorkshop: WorkshopDetailData = {
    ...workshop,
    title: workshop.title,
    price,
    currency,
    confirmHeading: cms?.modalConfirmHeading ?? workshop.confirmHeading,
    confirmSubheading: cms?.modalConfirmSubheading ?? workshop.confirmSubheading,
    workshopLabel: cms?.modalWorkshopLabel ?? workshop.workshopLabel,
    dateLabel: cms?.modalDateLabel ?? workshop.dateLabel,
    timeLabel: cms?.modalTimeLabel ?? workshop.timeLabel,
    totalLabel: cms?.modalTotalLabel ?? workshop.totalLabel,
    cancelLabel: cms?.modalCancelLabel ?? workshop.cancelLabel,
    confirmLabel: cms?.modalConfirmLabel ?? workshop.confirmLabel,
  }

  const [showDates, setShowDates] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [bookingDate, setBookingDate] = useState<WorkshopDate | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const datesRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleToggleDates = () => {
    setShowDates((prev) => {
      const next = !prev
      if (next)
        setTimeout(
          () => datesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          150,
        )
      return next
    })
  }

  const handleToggleInfo = () => {
    setShowInfo((prev) => {
      const next = !prev
      if (next)
        setTimeout(
          () => infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          150,
        )
      return next
    })
  }

  return (
    <>
      <section ref={sectionRef} id="booking" className="section-padding-lg bg-white">
        <div className="container mx-auto container-padding">
          {/* ────────────────────────────────────────────
           *  BOOKING CARD — Gold header + actions
           * ──────────────────────────────────────────── */}
          <div
            className={`mx-auto max-w-4xl transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <div className="overflow-hidden rounded-3xl shadow-lg">
              {/* ── Dark Header ─────────────────────── */}
              <div className="px-8 py-8 sm:px-12 sm:py-10" style={{ backgroundColor: '#555954' }}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  {/* Left — title + subtitle */}
                  <div>
                    <p
                      className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.25em]"
                      style={{ color: 'var(--ff-gold, #e6be68)' }}
                    >
                      {bookingEyebrow}
                    </p>
                    <h2 className="font-display text-section-heading font-black tracking-tight text-white">
                      {workshop.title}
                    </h2>
                  </div>
                  {/* Right — price */}
                  <div className="shrink-0 text-left sm:text-right">
                    <span
                      className="font-display text-4xl font-black tracking-tight sm:text-5xl"
                      style={{ color: 'var(--ff-gold, #e6be68)' }}
                    >
                      {currency}{price}
                    </span>
                    <span className="ml-1.5 font-display text-sm font-medium text-white/50">
                      /{priceSuffix}
                    </span>
                  </div>
                </div>

                {/* Attributes strip */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {bookingAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="rounded-full border border-white/20 px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-white/80"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Image ───────────────────────────── */}
              <div className="relative aspect-21/9 w-full overflow-hidden bg-[#ECE5DE]">
                {isResolvedMedia(bookingImage) ? (
                  <Media resource={bookingImage as MediaType} fill imgClassName="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#555954]/20">
                      Workshop Impression
                    </span>
                  </div>
                )}
              </div>

              {/* ── Action Buttons (cream body) ─────── */}
              <div className="bg-ff-cream px-8 py-8 sm:px-12">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleToggleDates}
                    className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: '#555954' }}
                  >
                    <CalendarIcon />
                    {showDates ? hideDatesLabel : viewDatesLabel}
                  </button>
                  <button
                    onClick={handleToggleInfo}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:opacity-80 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ borderColor: '#555954', color: '#555954' }}
                  >
                    {moreDetailsLabel}
                    <ChevronDown open={showInfo} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────
           *  EXPANDABLE: Available Dates
           * ──────────────────────────────────────────── */}
          <div
            ref={datesRef}
            className={`mx-auto max-w-4xl overflow-hidden transition-all duration-500 ${
              showDates ? 'mt-8 max-h-500 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="rounded-3xl border border-ff-border-light bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-subheading font-bold text-ff-near-black">
                  {datesHeading}
                </h3>
                <button
                  onClick={() => setShowDates(false)}
                  className="rounded-full p-2 text-ff-gray-text-light transition-colors hover:bg-ff-warm-gray hover:text-ff-near-black"
                  aria-label="Termine schließen"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {cmsDates.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-2xl border border-ff-border-light bg-ff-cream px-6 py-5 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="space-y-1">
                      <p className="font-display text-body-lg font-bold text-ff-near-black">
                        {d.date}
                      </p>
                      <div className="flex items-center gap-3 text-body-sm text-ff-gray-text-light">
                        <ClockIcon />
                        <span>{d.time}</span>
                        <span className="text-ff-border-light">·</span>
                        <span className="font-bold" style={{ color: 'var(--ff-gold, #e6be68)' }}>
                          {d.spotsLeft} {spotsLabel}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setBookingDate(d)}
                      className="rounded-full border-2 border-ff-near-black bg-ff-near-black px-6 py-2.5 font-display text-body-sm font-bold text-white transition-all duration-300 hover:bg-transparent hover:text-ff-near-black hover:scale-[1.03] active:scale-[0.97]"
                    >
                      {bookLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────
           *  EXPANDABLE: More Details
           * ──────────────────────────────────────────── */}
          <div
            ref={infoRef}
            id="details"
            className={`mx-auto max-w-4xl overflow-hidden transition-all duration-500 ${
              showInfo ? 'mt-8 max-h-1250 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-10 rounded-3xl border border-ff-border-light bg-white p-8 shadow-sm sm:p-10">
              {/* About */}
              <div>
                <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#555954]/60">
                  ÜBER DEN WORKSHOP
                </p>
                <h3 className="mb-4 font-display text-subheading font-bold text-ff-near-black">
                  {aboutHeading}
                </h3>
                <p className="max-w-2xl text-body-lg leading-relaxed text-ff-gray-text">
                  {aboutText}
                </p>
              </div>

              {/* Schedule */}
              <div>
                <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#555954]/60">
                  ABLAUF
                </p>
                <h3 className="mb-8 font-display text-subheading font-bold text-ff-near-black">
                  {scheduleHeading}
                </h3>
                <div className="relative space-y-0">
                  <div className="absolute bottom-4 left-5 top-4 w-px bg-ff-border-light" />
                  {scheduleItems.map((step, i) => (
                    <div key={i} className="relative flex gap-6 pb-8 last:pb-0">
                      <div
                        className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'var(--ff-gold, #e6be68)' }}
                      >
                        <span className="font-display text-[10px] font-bold text-white">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="pt-1">
                        <div className="mb-1 inline-flex items-center gap-2">
                          <span className="rounded-full px-3 py-1 font-display text-caption font-semibold text-[#555954]" style={{ backgroundColor: '#F6F0E8' }}>
                            {step.duration}
                          </span>
                        </div>
                        <h4 className="font-display text-body-lg font-bold text-ff-near-black">
                          {step.title}
                        </h4>
                        <p className="mt-1 text-body text-ff-gray-text-light">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included */}
              <div>
                <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#555954]/60">
                  IM PREIS ENTHALTEN
                </p>
                <h3 className="mb-6 font-display text-subheading font-bold text-ff-near-black">
                  {includedHeading}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {includedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-5 py-3" style={{ backgroundColor: '#F6F0E8' }}>
                      <div
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: 'var(--ff-gold, #e6be68)' }}
                      />
                      <span className="text-body text-ff-gray-text">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why */}
              <div className="rounded-2xl px-8 py-10 sm:px-10" style={{ backgroundColor: '#F6F0E8' }}>
                <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#555954]/60">
                  DARUM DIESER WORKSHOP
                </p>
                <h3 className="mb-8 font-display text-subheading font-bold text-ff-near-black">
                  {whyHeading}
                </h3>
                <div className="space-y-6">
                  {whyPoints.map((point, i) => (
                    <p key={i} className="text-body-lg leading-relaxed text-ff-gray-text">
                      <span className="font-bold text-ff-near-black">{point.bold}</span>
                      {point.rest}
                    </p>
                  ))}
                </div>
              </div>

              {/* Close */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowInfo(false)}
                  className="rounded-full border-2 border-ff-border-light px-8 py-3 font-display text-body-sm font-semibold text-ff-gray-text transition-all duration-200 hover:bg-ff-warm-gray hover:text-ff-near-black"
                >
                  Details schließen
                </button>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────
           *  WAS DICH ERWARTET — Alternating Image Cards
           * ──────────────────────────────────────────── */}
          <div className="mx-auto mt-24 max-w-6xl">
            {/* Section header */}
            <div
              className={`mb-16 text-center transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <p
                className="mb-3 font-display text-caption font-bold uppercase tracking-[0.2em]"
                style={{ color: 'var(--ff-gold, #e6be68)' }}
              >
                {experienceEyebrow}
              </p>
              <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-near-black">
                {experienceTitle}
              </h2>
            </div>

            {/* Cards — alternating layout */}
            <div className="space-y-16 lg:space-y-24">
              {experienceCardsData.map((card, i) => {
                const imageOnLeft = i % 2 === 0
                return (
                  <div
                    key={card.eyebrow || i}
                    className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14 transition-all duration-700 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                    } ${imageOnLeft ? '' : 'lg:flex-row-reverse'}`}
                    style={{ transitionDelay: `${400 + i * 150}ms` }}
                  >
                    {/* Image */}
                    <div className="flex-1">
                      <div className="aspect-4/3 w-full overflow-hidden rounded-3xl bg-ff-warm-gray">
                        {isResolvedMedia(card.image) ? (
                          <Media resource={card.image as MediaType} fill imgClassName="object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <span className="font-display text-lg font-bold uppercase tracking-widest text-ff-gray-text-light/40">
                              {card.eyebrow}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="flex flex-1 flex-col justify-center">
                      <p
                        className="mb-3 font-display text-[11px] font-black uppercase tracking-[0.2em]"
                        style={{ color: 'var(--ff-gold, #e6be68)' }}
                      >
                        {card.eyebrow}
                      </p>
                      <h3 className="font-display text-display font-bold tracking-tight text-ff-near-black">
                        {card.title}
                      </h3>
                      <p className="mt-4 max-w-md text-body-lg leading-relaxed text-ff-gray-text">
                        {card.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking Modal ─────────────────────────── */}
      {bookingDate && (
        <BookingModal
          workshop={mergedWorkshop}
          selectedDate={bookingDate}
          onClose={() => setBookingDate(null)}
          onConfirm={() => {
            alert(`Booking confirmed for ${bookingDate.date}!`)
            setBookingDate(null)
          }}
        />
      )}
    </>
  )
}
