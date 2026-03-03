'use client'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useState } from 'react'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

type TerminOption = { id: string; label: string }

type Props = {
  mainImage: MediaType | string | null | undefined
  galleryImages: MediaType[]
  title: string
  description: string
  price: string | null
  location: string | null
  timeLabel: string
  duration: string | null
  slug: string
  dateLabel: string
  quantityLabel: string
  detailsLabel: string
  reserveLabel: string
  dateOptions: TerminOption[]
}

export function WorkshopBookingSection({
  mainImage,
  galleryImages,
  title,
  description,
  price,
  location,
  timeLabel,
  duration,
  slug,
  dateLabel,
  quantityLabel,
  detailsLabel,
  reserveLabel,
  dateOptions,
}: Props) {
  const [quantity, setQuantity] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0]?.id ?? '')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const displayPrice = price ?? '79,00 €'
  const thumbnailImages = [mainImage, ...galleryImages].slice(0, 4)
  const displayedImage = thumbnailImages[selectedImageIndex]

  return (
    <section className="section-padding-md container-padding bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Image + thumbnails */}
            <div className="space-y-4 p-6 lg:p-8">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                {displayedImage && isResolvedMedia(displayedImage) ? (
                  <Media resource={displayedImage} fill imgClassName="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[#ECE5DE]" />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {thumbnailImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative aspect-square overflow-hidden rounded-lg bg-[#ECE5DE] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#555954] focus-visible:ring-offset-2 ${
                      selectedImageIndex === i ? 'ring-2 ring-[#555954] ring-offset-2' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {img && isResolvedMedia(img) ? (
                      <Media resource={img} fill imgClassName="object-cover" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Booking panel (white bg) */}
            <div className="flex flex-col justify-center border-t border-[#1a1a1a]/10 bg-white p-6 lg:border-l lg:border-t-0 lg:p-10">
              <h2 className="font-display text-2xl font-bold text-[#1a1a1a] md:text-3xl">
                {title}
              </h2>
              <p className="mt-4 font-display text-2xl font-bold text-[#E5B765]">{displayPrice}</p>
              {(location || timeLabel || duration) && (
                <div className="mt-4 space-y-2 font-sans text-sm text-[#333]">
                  {location && (
                    <p className="flex items-center gap-2">
                      <svg
                        className="size-5 shrink-0 text-[#555954]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {location}
                    </p>
                  )}
                  {timeLabel && (
                    <p className="flex items-center gap-2">
                      <svg
                        className="size-5 shrink-0 text-[#555954]"
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
                      {timeLabel}
                    </p>
                  )}
                  {duration && (
                    <p className="flex items-center gap-2">
                      <svg
                        className="size-5 shrink-0 text-[#555954]"
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
                      {duration}
                    </p>
                  )}
                </div>
              )}
              {description && (
                <p className="mt-4 text-body-lg leading-relaxed text-[#333]">{description}</p>
              )}
              <div className="my-6 border-t border-[#1a1a1a]/10" />

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-sans text-sm font-medium text-[#1a1a1a]">
                    {dateLabel}
                  </label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="w-full rounded-2xl border-2 border-[#1a1a1a]/15 bg-white font-sans text-[#1a1a1a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block font-sans text-sm font-medium text-[#1a1a1a]">
                    {quantityLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[#1a1a1a]/15 bg-white font-display text-lg font-bold text-[#1a1a1a] transition-colors hover:bg-[#F6F0E8]"
                    >
                      −
                    </button>
                    <span className="min-w-[3rem] text-center font-sans text-lg font-medium text-[#1a1a1a]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[#1a1a1a]/15 bg-white font-display text-lg font-bold text-[#1a1a1a] transition-colors hover:bg-[#F6F0E8]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`#workshop-topics`}
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-[#555954] bg-white px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#4B4B4B] transition-colors hover:bg-[#F6F0E8]"
                >
                  {detailsLabel}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#E5B765] px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#4B4B4B] transition-colors hover:bg-[#d4a654]"
                >
                  {reserveLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
