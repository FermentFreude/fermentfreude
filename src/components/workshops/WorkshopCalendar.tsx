'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

export type WorkshopCalendarCard = {
  id?: string | null
  workshopType: 'basics' | 'lakto' | 'kombucha' | 'tempeh'
  cardImage?: unknown
  nextDate?: string | null
  duration?: string | null
  buttonLabel?: string | null
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
  return type === 'basics' ? '/workshops/basics' : `/workshops/${type}`
}

export type WorkshopDate = {
  id: string
  workshopType: 'lakto' | 'kombucha' | 'tempeh'
  date: string
  time: string
  availableSpots: number
  price: number
}
const UPCOMING_DATES: WorkshopDate[] = [
  {
    id: '1',
    workshopType: 'lakto',
    date: 'February 15, 2026',
    time: '2:00 PM - 5:00 PM',
    availableSpots: 5,
    price: 99,
  },
  {
    id: '2',
    workshopType: 'kombucha',
    date: 'February 18, 2026',
    time: '6:00 PM - 9:00 PM',
    availableSpots: 7,
    price: 99,
  },
  {
    id: '3',
    workshopType: 'tempeh',
    date: 'February 20, 2026',
    time: '10:00 AM - 1:00 PM',
    availableSpots: 9,
    price: 99,
  },
  {
    id: '4',
    workshopType: 'lakto',
    date: 'February 22, 2026',
    time: '10:00 AM - 1:00 PM',
    availableSpots: 3,
    price: 99,
  },
  {
    id: '5',
    workshopType: 'kombucha',
    date: 'March 4, 2026',
    time: '6:00 PM - 9:00 PM',
    availableSpots: 8,
    price: 99,
  },
  {
    id: '6',
    workshopType: 'tempeh',
    date: 'March 8, 2026',
    time: '2:00 PM - 5:00 PM',
    availableSpots: 4,
    price: 99,
  },
]

// ─── Card component ──────────────────────────────────────

function WorkshopCard({
  workshop,
  cardImage,
}: {
  workshop: WorkshopCalendarCard
  cardImage: MediaType | null
}) {
  return (
    <div className="bg-white border border-[#e8e4d9] rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      {/* Image Section */}
      <div className="relative h-40 sm:h-48 w-full bg-[#f5f1e8] overflow-hidden">
        {cardImage ? (
          <Media
            resource={cardImage}
            className="h-full w-full object-cover"
            imgClassName="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#f5f1e8] to-[#e8e4d9]" />
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 sm:p-6">
        {/* Workshop Type Badge */}
        <div className="mb-3 inline-block">
          <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#f5f1e8] text-[#555954] px-3 py-1.5 rounded-full">
            {getWorkshopTypeLabel(workshop.workshopType)}
          </span>
        </div>

        {/* Next Date */}
        {workshop.nextDate && (
          <div className="mb-4">
            <p className="text-xs text-[#9a9a9a] font-semibold uppercase tracking-wide">
              Nächster Termin
            </p>
            <p className="font-display text-base sm:text-lg font-bold text-[#1a1a1a]">
              {workshop.nextDate}
            </p>
          </div>
        )}

        {/* Duration */}
        {workshop.duration && (
          <div className="mb-4 flex items-center gap-2 text-sm text-[#555954]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {workshop.duration}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#e8e4d9]">
          {/* Details Button */}
          <Link
            href={getWorkshopSlug(workshop.workshopType)}
            className="inline-flex items-center justify-center px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide rounded-md bg-[#f5f1e8] text-[#555954] hover:bg-[#555954] hover:text-white transition-all duration-300"
          >
            Details
          </Link>

          {/* Booking Button */}
          <Link
            href={getWorkshopSlug(workshop.workshopType)}
            className="inline-flex items-center justify-center px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide rounded-md bg-[#555954] text-white hover:bg-[#f5f1e8] hover:text-[#555954] transition-all duration-300"
          >
            Buchen
          </Link>
        </div>
      </div>
    </div>
  )
}

export function WorkshopCalendar({ cards }: { cards?: WorkshopCalendarCard[] | null } = {}) {
  // Default workshop card types (fallback when no CMS data)
  const defaultWorkshopCards: WorkshopCalendarCard[] = [
    { workshopType: 'lakto' },
    { workshopType: 'kombucha' },
    { workshopType: 'tempeh' },
  ]

  // Use CMS cards if provided, otherwise use defaults
  const workshopCards = cards && cards.length > 0 ? cards : defaultWorkshopCards

  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredDates = selectedType
    ? UPCOMING_DATES.filter((d) => d.workshopType === selectedType)
    : UPCOMING_DATES

  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="font-bold text-2xl sm:text-section-heading text-[#1a1a1a] mb-2 sm:mb-3">
            Workshop-Kalender
          </h2>
          <p className="text-body-sm sm:text-body text-[#555954]">
            Wähle deinen Workshop und buche noch heute
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

              return (
                <WorkshopCard
                  key={workshop.workshopType}
                  workshop={workshop}
                  cardImage={cardImage}
                />
              )
            })}
          </div>
        </div>

        {/* Filter & Dates Calendar Section */}
        <div className="border-t border-[#e8e4d9] pt-8 sm:pt-12">
          <h3 className="font-bold text-xl sm:text-2xl text-[#1a1a1a] mb-4 sm:mb-6">
            Alle verfügbaren Termine
          </h3>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 sm:px-4 py-2 rounded-full font-display font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
                selectedType === null
                  ? 'bg-[#555954] text-white'
                  : 'bg-[#f5f1e8] text-[#555954] hover:bg-[#e8e4d9]'
              }`}
            >
              Alle
            </button>
            {['lakto', 'kombucha', 'tempeh'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 sm:px-4 py-2 rounded-full font-display font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 ${
                  selectedType === type
                    ? 'bg-[#555954] text-white'
                    : 'bg-[#f5f1e8] text-[#555954] hover:bg-[#e8e4d9]'
                }`}
              >
                {getWorkshopTypeLabel(type).split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Dates List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredDates.map((date) => (
              <div
                key={date.id}
                className="bg-[#f9f7f3] border border-[#e8e4d9] rounded-lg p-4 sm:p-5 hover:border-[#555954] transition-all duration-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start sm:items-center">
                  {/* Workshop Type */}
                  <div>
                    <p className="text-xs text-[#9a9a9a] font-semibold uppercase tracking-wide mb-1">
                      Workshop-Art
                    </p>
                    <p className="font-display font-bold text-base text-[#1a1a1a]">
                      {getWorkshopTypeLabel(date.workshopType)}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-xs text-[#9a9a9a] font-semibold uppercase tracking-wide mb-1">
                      Datum & Zeit
                    </p>
                    <div className="space-y-1">
                      <p className="font-display font-bold text-base text-[#1a1a1a]">
                        {date.date}
                      </p>
                      <p className="text-sm text-[#555954] flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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

                  {/* Availability */}
                  <div>
                    <p className="text-xs text-[#9a9a9a] font-semibold uppercase tracking-wide mb-1">
                      Plätze frei
                    </p>
                    <p className="font-display font-bold text-base text-[#1a1a1a]">
                      {date.availableSpots > 0 ? `${date.availableSpots} Plätze` : 'Ausgebucht'}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 sm:pt-0">
                    <Link
                      href={getWorkshopSlug(date.workshopType)}
                      className="inline-block w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-center rounded-md bg-[#555954] text-white hover:bg-[#f5f1e8] hover:text-[#555954] transition-all duration-300"
                    >
                      → Buchen
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDates.length === 0 && (
            <div className="py-8 sm:py-12 text-center">
              <p className="text-[#9a9a9a] text-sm sm:text-body">
                Für diese Workshop-Art gibt es derzeit keine verfügbaren Termine.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
