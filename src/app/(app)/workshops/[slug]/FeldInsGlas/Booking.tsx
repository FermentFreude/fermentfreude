'use client'

/**
 * Feld ins Glas booking chips + modal (same cart flow)
 */

import { useLocale } from '@/providers/Locale'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookingModal } from '../BookingModal'
import { addWorkshopToCart } from '../add-to-cart-utils'
import type { WorkshopDate, WorkshopDetailData } from '../workshop-data'
import type { FeldInsGlasCopy } from './data'

type Props = {
  copy: FeldInsGlasCopy
  workshop: WorkshopDetailData
  dates: WorkshopDate[]
}

export function FeldInsGlasBooking({ copy, workshop, dates }: Props) {
  const [bookingDate, setBookingDate] = useState<WorkshopDate | null>(null)
  const { addItem, clearCart } = useCart()
  const { locale } = useLocale()
  const router = useRouter()
  const isDe = locale !== 'en'

  return (
    <>
      <section id="buchen" className="border-t border-[#555954]/12 bg-[#F6F0E8]">
        <div className="section-padding-lg container-padding mx-auto max-w-3xl text-center">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#555954]/65">
            {isDe ? 'Buchen' : 'Book'}
          </p>
          <h2 className="mt-3 font-display text-section-heading font-black tracking-tight text-[#1a1c1a]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-body-sm text-[#1a1c1a]/60">
            {copy.currency}
            {copy.price} · {copy.partnerLine}
          </p>

          {dates.length === 0 ? (
            <p className="mt-10 text-body-sm text-[#555954]/60">
              {isDe ? 'Termine folgen bald.' : 'Dates coming soon.'}
            </p>
          ) : (
            <ul className="mt-10 flex flex-col gap-3">
              {dates.map((d) => {
                const soldOut = (d.availableSpots ?? d.spotsLeft) <= 0
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => setBookingDate(d)}
                      className={`flex w-full items-center justify-between gap-4 border px-5 py-4 text-left transition-colors ${
                        soldOut
                          ? 'cursor-not-allowed border-[#555954]/15 opacity-40'
                          : 'border-[#555954]/25 bg-white hover:border-[#1a1c1a]'
                      }`}
                    >
                      <span>
                        <span className="block font-display text-body font-bold text-[#1a1c1a]">
                          {d.date}
                        </span>
                        <span className="mt-0.5 block text-caption text-[#555954]/70">{d.time}</span>
                      </span>
                      <span className="shrink-0 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#1a1c1a]">
                        {soldOut
                          ? isDe
                            ? 'Ausgebucht'
                            : 'Sold out'
                          : copy.ctaLabel}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {bookingDate && (
        <BookingModal
          workshop={workshop}
          selectedDate={bookingDate}
          maxCapacity={workshop.maxCapacity ?? 12}
          onClose={() => setBookingDate(null)}
          onConfirm={async (guestCount) => {
            try {
              await addWorkshopToCart({
                addItemAction: addItem,
                clearCart,
                appointmentId: bookingDate.appointmentId ?? bookingDate.id,
                workshopSlug: 'vom-feld-ins-glas',
                workshopTitle: workshop.title,
                guestCount,
                locale,
                pageSlug: 'vom-feld-ins-glas',
                locationName: isDe
                  ? 'Marktgarten „Unser Bauerngarten“'
                  : 'Marktgarten “Unser Bauerngarten”',
                locationAddress: isDe
                  ? 'Hochfeldweg, Graz (nicht Grabenstraße)'
                  : 'Hochfeldweg, Graz (not Grabenstraße)',
              })
              setBookingDate(null)
              router.refresh()
            } catch (error) {
              console.error('Booking failed:', error)
            }
          }}
          onSelectDifferentDate={() => setBookingDate(null)}
        />
      )}
    </>
  )
}
