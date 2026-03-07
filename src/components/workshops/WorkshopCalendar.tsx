'use client'

import Link from 'next/link'
import { useState } from 'react'

export type WorkshopDate = {
  id: string
  workshopType: 'lakto' | 'kombucha' | 'tempeh'
  date: string
  time: string
  availableSpots: number
  price: number
}

const WORKSHOP_DATA = [
  {
    workshopType: 'lakto' as const,
    title: 'Lakto-Gemüse',
    description: 'Gemüse fermentieren, Aromen erleben – jeden Monat anders.',
    image: '/assets/images/lakto-teaser.jpg',
    nextDate: 'February 15, 2026',
    price: 99,
  },
  {
    workshopType: 'kombucha' as const,
    title: 'Kombucha',
    description: 'Das beliebteste Fermentgetränk – einfach zu Hause gemacht.',
    image: '/assets/images/kombucha-teaser.jpg',
    nextDate: 'February 18, 2026',
    price: 99,
  },
  {
    workshopType: 'tempeh' as const,
    title: 'Tempeh',
    description: 'Eine pflanzliche Proteinquelle neu entdecken – mild, nussig und vielseitig.',
    image: '/assets/images/tempeh-teaser.jpg',
    nextDate: 'February 20, 2026',
    price: 99,
  },
]

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

function getWorkshopBgColor(type: string): string {
  switch (type) {
    case 'lakto':
      return 'bg-[#e8e4d9]'
    case 'kombucha':
      return 'bg-[#f9f0dc]'
    case 'tempeh':
      return 'bg-[#f5f1e8]'
    default:
      return 'bg-[#f0edea]'
  }
}

function getWorkshopBadgeBg(type: string): string {
  switch (type) {
    case 'lakto':
      return 'bg-[#e8e4d9]'
    case 'kombucha':
      return 'bg-[#f9f0dc]'
    case 'tempeh':
      return 'bg-[#f5f1e8]'
    default:
      return 'bg-[#fffef9]'
  }
}

export function WorkshopCalendar() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredDates = selectedType
    ? UPCOMING_DATES.filter((d) => d.workshopType === selectedType)
    : UPCOMING_DATES

  return (
    <section id="alle-termine" className="relative w-full bg-white py-16 md:py-24">
      <div className="container-padding mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-section-heading font-bold text-[#1a1a1a]">
              Workshop Kalender
            </h2>
            <svg
              className="w-8 h-8 text-[#E5B765]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
          <p className="text-body-lg text-[#555954]">
            Finde den perfekten Workshop-Termin für dich
          </p>
        </div>

        {/* Workshop Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-20">
          {WORKSHOP_DATA.map((workshop) => (
            <div
              key={workshop.workshopType}
              className="bg-white border border-[#e8e4d9]/50 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-linear-to-b from-[#ECE5DE] to-[#F0EDEA]" />

              {/* Content */}
              <div className="p-8 space-y-4">
                <h3 className="font-display text-2xl font-bold text-[#1a1a1a]">
                  {workshop.title}
                </h3>
                <p className="text-body text-[#555954]">{workshop.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="font-display text-3xl font-bold text-[#1a1a1a]">
                    €{workshop.price}
                  </span>
                  <span className="text-body text-[#1d1d1d]">pro Person</span>
                </div>

                {/* Button */}
                <Link
                  href={`/workshops/${workshop.workshopType}`}
                  className="block w-full bg-[#555954] hover:bg-[#3c3c3c] text-white font-display font-bold text-sm py-3 rounded-full transition-colors duration-300 text-center"
                >
                  Mehr Infos & Buchen
                </Link>

                {/* Next date */}
                <div className="border-t border-[#e8e4d9] pt-4 mt-4">
                  <p className="text-xs text-[#1d1d1d] font-semibold mb-1">Nächster Termin:</p>
                  <p className="font-display text-sm font-semibold text-[#1a1a1a]">
                    {workshop.nextDate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All Dates Calendar */}
        <div className="bg-[#fffef9] border border-[#e8e4d9]/50 rounded-3xl p-8 md:p-12">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-6 py-2 rounded-full font-display font-semibold text-sm transition-all duration-300 ${
                selectedType === null
                  ? 'bg-[#555954] text-white'
                  : 'bg-[#f0edea] text-[#555954] hover:bg-[#e8e4d9]'
              }`}
            >
              Alle
            </button>
            {['lakto', 'kombucha', 'tempeh'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-full font-display font-semibold text-sm transition-all duration-300 capitalize ${
                  selectedType === type
                    ? 'bg-[#555954] text-white'
                    : `${getWorkshopBadgeBg(type)} text-[#555954] hover:bg-[#e8e4d9]`
                }`}
              >
                {type === 'lakto'
                  ? 'Lakto-Gemüse'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Dates list */}
          <div className="space-y-3">
            {filteredDates.map((date) => (
              <div
                key={date.id}
                className={`${getWorkshopBgColor(date.workshopType)} rounded-2xl p-6 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-300`}
              >
                {/* Left content */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  {/* Workshop type badge */}
                  <div className="bg-white rounded-full px-4 py-2 whitespace-nowrap">
                    <p className="font-display font-semibold text-sm text-[#1a1a1a]">
                      {date.workshopType === 'lakto'
                        ? 'Lakto-Gemüse'
                        : date.workshopType.charAt(0).toUpperCase() + date.workshopType.slice(1)}
                    </p>
                  </div>

                  {/* Date and time info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-lg text-[#3c3c3c] truncate">
                      {date.date}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[#1d1d1d]">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{date.time}</span>
                      <span>•</span>
                      <span>{date.availableSpots} Plätze frei</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/contact"
                  className="bg-[#555954] hover:bg-[#3c3c3c] text-white font-display font-semibold text-sm px-8 py-3 rounded-full whitespace-nowrap transition-colors duration-300"
                >
                  Buchen
                </Link>
              </div>
            ))}
          </div>

          {filteredDates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#555954] text-lg">Keine Termine für diesen Workshop verfügbar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
