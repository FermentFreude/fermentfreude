'use client'

import { BookingModal } from '@/app/(app)/workshops/[slug]/BookingModal'
import { addWorkshopToCart } from '@/app/(app)/workshops/[slug]/add-to-cart-utils'
import type { WorkshopDetailData } from '@/app/(app)/workshops/[slug]/workshop-data'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { formatWorkshopDate } from '@/lib/formatWorkshopDate'
import { mapsUrl, shortLocation } from '@/lib/mapsUrl'
import { workshopColorVars } from '@/utilities/workshopColors'
import { toast } from 'sonner'

export type WorkshopCalendarCard = {
  id?: string | null
  workshopType: 'basics' | 'lakto' | 'kombucha' | 'tempeh'
  cardImage?: unknown
  cardImageId?: string | null
  nextDate?: string | null
  nextLocationName?: string | null
  nextLocationAddress?: string | null
  /** Price per person (from the workshop), shown next to the date */
  price?: number | null
  /** Free spots on the next bookable date — drives the "only X left" badge */
  spotsLeft?: number | null
  duration?: string | null
  detailsLabel?: string | null
  buttonLabel?: string | null
  productId?: string | null
}

// ─── Helper function to get workshop type label with emoji ─

function getWorkshopTypeLabel(type: string): string {
  switch (type) {
    case 'lakto':
      return 'Lakto-Gemüse'
    case 'kombucha':
      return 'Kombucha'
    case 'tempeh':
      return 'Tempeh'
    case 'basics':
      return 'Basics'
    default:
      return type
  }
}

// ─── Helper function to get workshop slug ──────────────

function getWorkshopSlug(type: string): string {
  const slugMap: Record<string, string> = {
    basics: '/workshops/basics',
    lakto: '/workshops/lakto-gemuese',
    kombucha: '/workshops/kombucha',
    tempeh: '/workshops/tempeh',
  }
  return slugMap[type] || `/workshops/${type}`
}

export type WorkshopDate = {
  id: string
  workshopType: 'lakto' | 'kombucha' | 'tempeh'
  workshopTitle?: string
  date: string
  time: string
  availableSpots: number
  price: number
  appointmentId?: string
  dateTime?: string
  locationName?: string | null // Display only
  locationAddress?: string | null
}

// ─── Card component ──────────────────────────────────────

function WorkshopCard({
  workshop,
  cardImage,
  onBookingClick,
  nextDateLabel,
  isFullySoldOut,
  hasNoDates,
  soldOutLabel,
  comingSoonLabel,
  locale,
}: {
  workshop: WorkshopCalendarCard
  cardImage: MediaType | null
  onBookingClick?: (workshop: WorkshopCalendarCard) => void
  nextDateLabel?: string | null
  isFullySoldOut?: boolean
  hasNoDates?: boolean
  soldOutLabel?: string | null
  comingSoonLabel?: string | null
  locale?: string
}) {
  const isDe = locale !== 'en'
  // CMS sometimes stores the duration in English ("3 Hours") — show it in German on the DE site.
  const durationText =
    workshop.duration && isDe
      ? workshop.duration.replace(/\bhours?\b/i, (m) => (/s$/i.test(m) ? 'Stunden' : 'Stunde'))
      : workshop.duration
  // Urgency badge when the next date is almost full (1–3 spots left)
  const LOW_SPOTS = 3
  const spots = workshop.spotsLeft
  const lowSpotsText =
    !isFullySoldOut && !hasNoDates && typeof spots === 'number' && spots > 0 && spots <= LOW_SPOTS
      ? isDe
        ? `Nur noch ${spots} ${spots === 1 ? 'Platz' : 'Plätze'}!`
        : `Only ${spots} ${spots === 1 ? 'spot' : 'spots'} left!`
      : null
  const priceText =
    typeof workshop.price === 'number'
      ? isDe
        ? `${workshop.price} €`
        : `€${workshop.price}`
      : null
  return (
    <div
      className="bg-white text-[#1a1a1a] border border-[#e8e4d9] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
      style={workshopColorVars(workshop.workshopType)}
    >
      {/* Image Section */}
      <div
        className="relative h-40 sm:h-48 w-full bg-[#f5f1e8] overflow-hidden"
        id={workshop.cardImageId ? `card-image-${workshop.cardImageId}` : undefined}
      >
        {cardImage ? (
          <Media
            resource={cardImage}
            className="h-full w-full object-cover"
            imgClassName="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#f5f1e8] to-[#e8e4d9]" />
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 sm:p-6">
        {/* Workshop Type Badge */}
        <div className="mb-5 inline-flex flex-wrap items-center gap-2">
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider bg-(--ws) text-(--ws-on) px-3 py-1.5 rounded-full">
            {getWorkshopTypeLabel(workshop.workshopType)}
          </span>
          {lowSpotsText && (
            <span className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider bg-[#2D2F2C] text-[#FAF2E0] px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
              {lowSpotsText}
            </span>
          )}
          {isFullySoldOut && (
            <span className="font-display text-xs font-bold uppercase tracking-wider bg-[#d0ccc6] text-[#6b6b6b] px-3 py-1.5 rounded-full">
              {soldOutLabel || 'Ausgebucht'}
            </span>
          )}
        </div>

        {/* Next Date OR Coming Soon Message */}
        {isFullySoldOut || hasNoDates ? (
          <div className="mb-5">
            <p className="mb-1.5! text-xs text-[#6b6b6b] font-semibold uppercase tracking-wider">
              {nextDateLabel || 'Nächster Termin'}
            </p>
            <p className="mb-0! font-display text-sm sm:text-base font-medium text-[#6b6b6b] italic">
              {comingSoonLabel || 'Bald neue Termine verfügbar'}
            </p>
          </div>
        ) : (
          workshop.nextDate && (
            <div className="mb-5">
              <p className="mb-1.5! text-xs text-[#6b6b6b] font-semibold uppercase tracking-wider">
                {nextDateLabel || 'Nächster Termin'}
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <p className="mb-0! font-display text-base sm:text-lg font-bold">
                  {workshop.nextDate}
                </p>
                {priceText && (
                  <p className="mb-0! shrink-0 font-display text-base sm:text-lg font-bold">
                    {priceText}
                  </p>
                )}
              </div>
            </div>
          )
        )}

        {/* Location — visible before booking */}
        {workshop.nextLocationName &&
          (() => {
            const name = workshop.nextLocationName
            const address = workshop.nextLocationAddress ?? ''
            // City from "Street 1, 8010 Graz, Österreich" → "Graz"
            const city = address.match(/\b\d{4,5}\s+([^,]+)/)?.[1]?.trim()
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [name, address].filter(Boolean).join(', '),
            )}`
            return (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={[name, address].filter(Boolean).join(', ')}
                className="group mb-5 inline-flex items-center gap-2 self-start text-sm text-[#4b4b4b] transition-colors hover:text-[#1a1a1a]"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 20 20"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
                  <circle cx="10" cy="8" r="2.2" />
                </svg>
                <span className="underline decoration-current/40 underline-offset-4 transition-colors group-hover:decoration-current">
                  {city ? `${name}, ${city}` : name}
                </span>
              </a>
            )
          })()}

        {/* Duration */}
        {workshop.duration && (
          <div className="mb-6 flex items-center gap-2 text-sm text-[#4b4b4b]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {durationText}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#e8e4d9]">
          {/* Details Button */}
          <Link
            href={getWorkshopSlug(workshop.workshopType)}
            className="inline-flex items-center justify-center px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide rounded-md bg-[#FAF2E0] text-[#2D2F2C] hover:bg-(--ws) hover:text-(--ws-on) transition-all duration-300"
          >
            {workshop.detailsLabel || 'Details'}
          </Link>

          {/* Booking Button */}
          <button
            type="button"
            onClick={() => !isFullySoldOut && !hasNoDates && onBookingClick?.(workshop)}
            disabled={isFullySoldOut || hasNoDates}
            aria-disabled={isFullySoldOut || hasNoDates}
            className={`inline-flex items-center justify-center px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide rounded-md transition-all duration-300 ${
              isFullySoldOut || hasNoDates
                ? 'bg-[#d0ccc6] text-[#6b6b6b] cursor-not-allowed'
                : 'bg-(--ws) text-(--ws-on) hover:opacity-90'
            }`}
          >
            {isFullySoldOut
              ? soldOutLabel || 'Ausgebucht'
              : hasNoDates
                ? comingSoonLabel || 'Bald verfügbar'
                : workshop.buttonLabel || 'Buchen'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function WorkshopCalendar({
  cards,
  title,
  description,
  appointments,
  nextDateLabel,
  allDatesHeading,
  allFilterLabel,
  typeColumnLabel,
  dateColumnLabel,
  spotsColumnLabel,
  spotsLabel,
  soldOutLabel,
  bookLabel,
  emptyMessage,
  comingSoonLabel,
  locationColumnLabel,
}: {
  cards?: WorkshopCalendarCard[] | null
  title?: string | null
  description?: string | null
  appointments?: WorkshopDate[]
  nextDateLabel?: string | null
  allDatesHeading?: string | null
  allFilterLabel?: string | null
  typeColumnLabel?: string | null
  dateColumnLabel?: string | null
  spotsColumnLabel?: string | null
  spotsLabel?: string | null
  soldOutLabel?: string | null
  bookLabel?: string | null
  emptyMessage?: string | null
  comingSoonLabel?: string | null
  locationColumnLabel?: string | null
} = {}) {
  // Default workshop card types (fallback when no CMS data)
  const defaultWorkshopCards: WorkshopCalendarCard[] = [
    { workshopType: 'lakto' },
    { workshopType: 'kombucha' },
    { workshopType: 'tempeh' },
  ]

  // Use CMS cards if provided, otherwise use defaults
  const workshopCards = cards && cards.length > 0 ? cards : defaultWorkshopCards

  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showAllDates, setShowAllDates] = useState(false)
  const [bookingDate, setBookingDate] = useState<WorkshopDate | null>(null)
  const [bookingWorkshop, setBookingWorkshop] = useState<WorkshopCalendarCard | null>(null)
  // Separate state for card bookings
  const [cardBookingDate, setCardBookingDate] = useState<WorkshopDate | null>(null)
  const [cardBookingWorkshop, setCardBookingWorkshop] = useState<WorkshopCalendarCard | null>(null)
  const { addItem, clearCart } = useCart()
  const router = useRouter()
  const { locale } = useLocale()
  // On the English site, use English UI labels — the CMS "en" values for these
  // short labels were saved in German. The German site keeps the CMS labels.
  if (locale === 'en') {
    nextDateLabel = 'Next date'
    allDatesHeading = 'All available dates'
    allFilterLabel = 'All'
    typeColumnLabel = 'Workshop'
    dateColumnLabel = 'Date & time'
    spotsColumnLabel = 'Spots left'
    spotsLabel = 'spots'
    soldOutLabel = 'Sold out'
    bookLabel = '→ Book'
    emptyMessage = 'There are currently no dates for this workshop.'
  }

  // Use real appointments from database, or empty array if none
  const upcomingDates = useMemo(() => appointments || [], [appointments])

  // Helper: Get next BOOKABLE (non-sold-out) appointment for a workshop type
  const getNextAppointment = useCallback(
    (workshopType: string): WorkshopDate | null => {
      const typeAppointments = upcomingDates.filter((d) => d.workshopType === workshopType)
      return typeAppointments.find((d) => d.availableSpots > 0) ?? null
    },
    [upcomingDates],
  )

  // Convert card to WorkshopDetailData format for BookingModal
  const convertToWorkshopDetail = useCallback((card: WorkshopCalendarCard): WorkshopDetailData => {
    return {
      slug: card.workshopType,
      workshopType: card.workshopType as 'lakto' | 'kombucha' | 'tempeh',
      title: getWorkshopTypeLabel(card.workshopType),
      subtitle: card.duration || '3-hour hands-on workshop',
      description: '',
      price: 99,
      priceSuffix: 'per person',
      currency: 'EUR',
      heroImage: null,
      maxCapacity: 12,
      highlights: [],
      aboutHeading: '',
      aboutText: '',
      scheduleHeading: '',
      schedule: [],
      includedHeading: '',
      includedItems: [],
      whyHeading: '',
      whyPoints: [],
      datesHeading: '',
      dates: [],
      viewDatesLabel: '',
      hideDatesLabel: '',
      moreInfoLabel: '',
      bookLabel: '',
      spotsLabel: '',
      closeLabel: '',
      confirmHeading: 'Buchung bestätigen',
      confirmSubheading: 'Workshop zum Warenkorb hinzufügen?',
      workshopLabel: 'Workshop',
      dateLabel: 'Datum',
      timeLabel: 'Zeit',
      totalLabel: 'Preis',
      cancelLabel: 'Abbrechen',
      confirmLabel: 'Zum Warenkorb',
    }
  }, [])

  // Handle card booking click
  const handleCardBookingClick = useCallback(
    (workshop: WorkshopCalendarCard) => {
      const nextDate = getNextAppointment(workshop.workshopType)
      if (nextDate) {
        setCardBookingDate(nextDate)
        setCardBookingWorkshop(workshop)
      } else {
        toast.error('Keine verfügbaren Termine für diesen Workshop')
      }
    },
    [getNextAppointment],
  )

  // Handle card booking confirmation with guest count
  const handleCardBookingConfirm = useCallback(
    async (guestCount: number) => {
      if (!cardBookingDate || !cardBookingWorkshop) return

      const appointmentId = cardBookingDate.appointmentId
      if (!appointmentId) {
        toast.error('Ungültige Terminauswahl')
        return
      }

      await addWorkshopToCart({
        addItemAction: addItem,
        clearCart,
        appointmentId,
        workshopSlug: cardBookingWorkshop.workshopType,
        workshopTitle: getWorkshopTypeLabel(cardBookingWorkshop.workshopType),
        guestCount,
        locale,
      })

      // Clear card booking states
      setCardBookingDate(null)
      setCardBookingWorkshop(null)
      router.refresh()
    },
    [cardBookingDate, cardBookingWorkshop, addItem, clearCart, router, locale],
  )
  const filteredDates = selectedType
    ? upcomingDates.filter((d) => d.workshopType === selectedType)
    : upcomingDates

  // ── Date list: date order (sold-out dates stay in place — shows demand), first 6 only ──
  const VISIBLE_DATES = 6
  const shownDates = showAllDates ? filteredDates : filteredDates.slice(0, VISIBLE_DATES)
  const hiddenCount = filteredDates.length - shownDates.length
  const canCollapse = filteredDates.length > VISIBLE_DATES

  // "Nur noch 1 Platz!" on almost-full dates (1–3 spots left)
  const LOW_SPOTS_ROW = 3
  const lowSpotsText = (n: number) =>
    n > 0 && n <= LOW_SPOTS_ROW
      ? locale === 'en'
        ? `Only ${n} ${n === 1 ? 'spot' : 'spots'} left!`
        : `Nur noch ${n} ${n === 1 ? 'Platz' : 'Plätze'}!`
      : null

  // "13. Dezember 2026" → "Dezember 2026"
  const displayDate = (d: WorkshopDate) => formatWorkshopDate(d.dateTime, locale, d.date)
  // "13. Dezember 2026" / "13 December 2026" → month + year
  const monthOf = (d: WorkshopDate) => displayDate(d).replace(/^\s*\d{1,2}\.?\s*/, '')
  const visibleGroups: { label: string; dates: WorkshopDate[] }[] = []
  for (const d of shownDates) {
    const label = monthOf(d)
    const last = visibleGroups[visibleGroups.length - 1]
    if (last && last.label === label) last.dates.push(d)
    else visibleGroups.push({ label, dates: [d] })
  }

  // Bookable dates per workshop, for the filter pill counts
  const bookableCount = (type: string | null) =>
    upcomingDates.filter((d) => d.availableSpots > 0 && (type === null || d.workshopType === type))
      .length

  const renderDateRow = (date: WorkshopDate) => (
    <div
      key={date.id}
      className="bg-[#f9f7f3] text-[#1a1a1a] border border-[#e8e4d9] border-l-4 border-l-(--ws) rounded-lg p-4 sm:p-5 hover:border-(--ws) transition-all duration-300"
      style={workshopColorVars(date.workshopType)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_0.8fr_9.5rem] gap-3 sm:gap-4 items-start">
        {/* Phone: compact summary (columns below are hidden on phones) */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 font-display text-sm font-bold">
              <span className="size-2.5 shrink-0 rounded-full bg-(--ws)" aria-hidden="true" />
              {getWorkshopTypeLabel(date.workshopType)}
            </span>
            {lowSpotsText(date.availableSpots) ? (
              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#2D2F2C] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-[#FAF2E0]">
                <span
                  className="size-1.5 rounded-full bg-current animate-pulse"
                  aria-hidden="true"
                />
                {lowSpotsText(date.availableSpots)}
              </span>
            ) : (
              <span className="shrink-0 text-xs font-semibold opacity-75">
                {date.availableSpots > 0
                  ? `${date.availableSpots} ${spotsLabel || 'Plätze'}`
                  : soldOutLabel || 'Ausgebucht'}
              </span>
            )}
          </div>
          <p className="mt-1.5 mb-0! font-display text-base font-bold">{displayDate(date)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-80">
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {date.time}
            </span>
            {date.locationName && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={mapsUrl(date.locationName, date.locationAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 underline decoration-current/40 underline-offset-4"
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 20 20"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
                    <circle cx="10" cy="8" r="2.2" />
                  </svg>
                  {shortLocation(date.locationName, date.locationAddress)}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Workshop Type */}
        <div className="hidden sm:block">
          <p className="text-xs opacity-75 font-semibold uppercase tracking-wide mb-1">
            {typeColumnLabel || 'Workshop-Art'}
          </p>
          <p className="font-display font-bold text-base">
            {getWorkshopTypeLabel(date.workshopType)}
          </p>
        </div>

        {/* Date & Time */}
        <div className="hidden sm:block">
          <p className="text-xs opacity-75 font-semibold uppercase tracking-wide mb-1">
            {dateColumnLabel || 'Datum & Zeit'}
          </p>
          <div className="space-y-1">
            <p className="font-display font-bold text-base">{displayDate(date)}</p>
            <p className="text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {date.time}
            </p>
          </div>
        </div>

        {/* Location — shown before booking */}
        <div className="hidden sm:block">
          <p className="text-xs opacity-75 font-semibold uppercase tracking-wide mb-1">
            {locationColumnLabel || 'Standort'}
          </p>
          {date.locationName ? (
            <a
              href={mapsUrl(date.locationName, date.locationAddress)}
              target="_blank"
              rel="noopener noreferrer"
              title={[date.locationName, date.locationAddress].filter(Boolean).join(', ')}
              className="group inline-flex items-start gap-1.5 text-sm"
            >
              <svg
                className="mt-0.5 w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 20 20"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
                <circle cx="10" cy="8" r="2.2" />
              </svg>
              <span>
                <span className="font-display font-bold underline decoration-current/40 underline-offset-4 transition-colors group-hover:decoration-current">
                  {date.locationName}
                </span>
                {date.locationAddress && (
                  <span className="block text-xs opacity-75">{date.locationAddress}</span>
                )}
              </span>
            </a>
          ) : (
            <p className="text-sm opacity-75">–</p>
          )}
        </div>

        {/* Availability — hidden on sold-out rows; the disabled button already conveys the state */}
        {date.availableSpots > 0 ? (
          <div className="hidden sm:block">
            <p className="text-xs opacity-75 font-semibold uppercase tracking-wide mb-1">
              {spotsColumnLabel || 'Plätze frei'}
            </p>
            {lowSpotsText(date.availableSpots) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2D2F2C] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-[#FAF2E0]">
                <span
                  className="size-1.5 rounded-full bg-current animate-pulse"
                  aria-hidden="true"
                />
                {lowSpotsText(date.availableSpots)}
              </span>
            ) : (
              <p className="font-display font-bold text-base">
                {`${date.availableSpots} ${spotsLabel || 'Plätze'}`}
              </p>
            )}
          </div>
        ) : (
          <div className="hidden sm:block" aria-hidden="true" />
        )}

        {/* Action Button */}
        <div className="pt-2 sm:pt-0 sm:self-center">
          <button
            disabled={date.availableSpots === 0}
            onClick={() => {
              setBookingDate(date)
              // Find the workshop for this date
              const workshop = workshopCards.find((w) => w.workshopType === date.workshopType)
              if (workshop) setBookingWorkshop(workshop)
            }}
            className={`inline-block w-full sm:w-auto lg:w-full px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-center rounded-md transition-all duration-300 ${
              date.availableSpots === 0
                ? 'bg-[#d0ccc6] text-[#5a5a5a] cursor-not-allowed'
                : 'bg-(--ws) text-(--ws-on) hover:bg-(--ws-hover) hover:text-(--ws-hover-on) hover:-translate-y-px hover:shadow-md'
            }`}
          >
            {date.availableSpots === 0
              ? soldOutLabel || (locale === 'en' ? 'Sold out' : 'Ausgebucht')
              : bookLabel || (locale === 'en' ? '→ Book' : '→ Buchen')}
          </button>
        </div>
      </div>
    </div>
  )

  // Handle date list booking confirmation with guest count
  const handleDateListBookingConfirm = useCallback(
    async (guestCount: number) => {
      if (!bookingDate || !bookingWorkshop) return

      const appointmentId = bookingDate.appointmentId
      if (!appointmentId) {
        toast.error('Ungültige Terminauswahl')
        return
      }

      await addWorkshopToCart({
        addItemAction: addItem,
        clearCart,
        appointmentId,
        workshopSlug: bookingWorkshop.workshopType,
        workshopTitle: getWorkshopTypeLabel(bookingWorkshop.workshopType),
        guestCount,
        locale,
      })

      // Clear date list booking states
      setBookingDate(null)
      setBookingWorkshop(null)
      router.refresh()
    },
    [bookingDate, bookingWorkshop, addItem, clearCart, router, locale],
  )

  return (
    <>
      <section className="w-full bg-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h2 className="font-bold text-2xl sm:text-section-heading text-[#1a1a1a] mb-2 sm:mb-3">
              {title ?? 'Workshop-Kalender'}
            </h2>
            <p className="text-body-sm sm:text-body text-[#555954]">
              {description ?? 'Wähle deinen Workshop und buche noch heute'}
            </p>
          </div>

          {/* Workshop Type Cards Grid */}
          <div className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {workshopCards.map((workshop) => {
                // Check if cardImage is a proper Media object
                const cardImage =
                  workshop.cardImage &&
                  typeof workshop.cardImage === 'object' &&
                  'url' in workshop.cardImage
                    ? (workshop.cardImage as MediaType)
                    : null

                // Per-card availability check.
                // isFullySoldOut → has upcoming dates, but every one is at 0 spots.
                // hasNoDates     → no upcoming dates at all ("coming soon" but not "sold out").
                // Both cases disable the booking button and show the coming-soon message.
                const futureAppts = upcomingDates.filter(
                  (d) => d.workshopType === workshop.workshopType,
                )
                const hasAvailable = futureAppts.some((d) => d.availableSpots > 0)
                const isFullySoldOut = futureAppts.length > 0 && !hasAvailable
                const hasNoDates = futureAppts.length === 0

                return (
                  <WorkshopCard
                    key={workshop.workshopType}
                    workshop={workshop}
                    cardImage={cardImage}
                    onBookingClick={() => handleCardBookingClick(workshop)}
                    nextDateLabel={nextDateLabel}
                    isFullySoldOut={isFullySoldOut}
                    hasNoDates={hasNoDates}
                    soldOutLabel={soldOutLabel}
                    comingSoonLabel={comingSoonLabel}
                    locale={locale}
                  />
                )
              })}
            </div>
          </div>

          {/* Filter & Dates Calendar Section */}
          <div className="border-t border-[#e8e4d9] pt-8 sm:pt-12">
            <h3 className="font-bold text-xl sm:text-2xl text-[#1a1a1a] mb-4 sm:mb-6">
              {allDatesHeading || 'Alle verfügbaren Termine'}
            </h3>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
              <button
                onClick={() => {
                  setSelectedType(null)
                  setShowAllDates(false)
                }}
                className={`px-3 sm:px-4 py-2 rounded-full font-display font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
                  selectedType === null
                    ? 'bg-[#2D2F2C] text-[#FAF2E0]'
                    : 'bg-[#FAF2E0] text-[#2D2F2C] hover:bg-[#2D2F2C] hover:text-[#FAF2E0]'
                }`}
              >
                {allFilterLabel || 'Alle'} ({bookableCount(null)})
              </button>
              {['lakto', 'kombucha', 'tempeh'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type)
                    setShowAllDates(false)
                  }}
                  style={workshopColorVars(type)}
                  className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-display font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
                    selectedType === type
                      ? 'bg-(--ws) text-(--ws-on)'
                      : 'bg-[#FAF2E0] text-[#2D2F2C] hover:bg-(--ws) hover:text-(--ws-on)'
                  }`}
                >
                  {selectedType !== type && (
                    <span className="size-2 rounded-full bg-(--ws)" aria-hidden="true" />
                  )}
                  {getWorkshopTypeLabel(type).split(' ')[0]} ({bookableCount(type)})
                </button>
              ))}
            </div>

            {/* Dates List */}
            <div className="space-y-3 sm:space-y-4">
              {visibleGroups.map((group) => (
                <div key={group.label} className="space-y-3 sm:space-y-4">
                  <h4 className="pt-2 font-display text-sm font-bold uppercase tracking-wider text-[#6b6b6b]">
                    {group.label}
                  </h4>
                  {group.dates.map((date) => renderDateRow(date))}
                </div>
              ))}
            </div>

            {hiddenCount > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllDates(true)}
                  className="rounded-full border-2 border-[#2D2F2C] px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-[#2D2F2C] transition-colors hover:bg-[#2D2F2C] hover:text-[#FAF2E0]"
                >
                  {locale === 'en'
                    ? `Show more dates (${hiddenCount})`
                    : `Weitere Termine anzeigen (${hiddenCount})`}
                </button>
              </div>
            )}
            {showAllDates && canCollapse && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllDates(false)}
                  className="rounded-full px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-[#2D2F2C] underline underline-offset-4 decoration-[#2D2F2C]/40 hover:decoration-[#2D2F2C]"
                >
                  {locale === 'en' ? 'Show fewer dates' : 'Weniger Termine anzeigen'}
                </button>
              </div>
            )}

            {filteredDates.length === 0 && (
              <div className="py-8 sm:py-12 text-center">
                <p className="text-[#6b6b6b] text-sm sm:text-body">
                  {emptyMessage ||
                    'Für diese Workshop-Art gibt es derzeit keine verfügbaren Termine.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Card Booking Modal with Guest Selection */}
      {cardBookingDate && cardBookingWorkshop && (
        <BookingModal
          workshop={convertToWorkshopDetail(cardBookingWorkshop)}
          selectedDate={{
            ...cardBookingDate,
            spotsLeft: cardBookingDate.availableSpots,
          }}
          maxCapacity={12}
          onClose={() => {
            setCardBookingDate(null)
            setCardBookingWorkshop(null)
          }}
          onConfirm={handleCardBookingConfirm}
        />
      )}

      {/* Date List Booking Modal with Guest Selection */}
      {bookingDate && bookingWorkshop && (
        <BookingModal
          workshop={convertToWorkshopDetail(bookingWorkshop)}
          selectedDate={{
            ...bookingDate,
            spotsLeft: bookingDate.availableSpots,
          }}
          maxCapacity={12}
          onClose={() => {
            setBookingDate(null)
            setBookingWorkshop(null)
          }}
          onConfirm={handleDateListBookingConfirm}
        />
      )}
    </>
  )
}
