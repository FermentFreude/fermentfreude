'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'
import { useRef, useState, useCallback } from 'react'

import type { WorkshopItem } from '@/utilities/getWorkshops'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

function getSlugFromCtaLink(ctaLink: string | null | undefined): string | null {
  if (!ctaLink) return null
  const match = ctaLink.match(/\/workshops\/([^/]+)/)
  return match ? match[1] : null
}

function getWorkshopCardBg(slug: string | null): string {
  switch (slug) {
    case 'tempeh':
      return 'bg-[#F4F3F1]'
    case 'kombucha':
      return 'bg-[#F6F5F3]'
    case 'lakto-gemuese':
      return 'bg-[#F2F1EF]'
    default:
      return 'bg-[#F8F7F6]'
  }
}

type Props = {
  workshops: WorkshopItem[]
  heading: string
  subtitle: string
  pillLabel: string
  buyLabel: string
  moreInfoLabel: string
}

export function WorkshopTypesSlider({
  workshops,
  heading,
  subtitle,
  pillLabel,
  buyLabel,
  moreInfoLabel,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current
      if (!el) return
      const cardWidth = el.querySelector('[data-workshop-card]')?.clientWidth ?? 800
      const gap = 16
      const distance = cardWidth + gap
      el.scrollBy({
        left: direction === 'left' ? -distance : distance,
        behavior: 'smooth',
      })
      setTimeout(updateScrollState, 350)
    },
    [updateScrollState],
  )

  if (workshops.length === 0) return null

  return (
    <section className="relative bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container-padding relative mx-auto max-w-7xl">
        {/* Header: Title + Subtitle */}
        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-2xl font-bold text-[#1a1a1a] sm:text-3xl md:text-4xl">
            {heading}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[#555954] sm:mt-3 sm:text-body-lg">
            {subtitle}
          </p>
        </div>

        {/* Scrollable Workshop Cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          data-workshop-slider
          className="flex gap-4 overflow-x-auto pb-0 snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
          }}
        >
          <style>{`[data-workshop-slider]::-webkit-scrollbar { display: none; }`}</style>
          {workshops.map((w) => {
            const slug = getSlugFromCtaLink(w.ctaLink)
            const href = slug ? `/workshops/${slug}` : '/workshops'
            const displayImage = isResolvedMedia(w.image2) ? w.image2 : w.image
            const cardBg = getWorkshopCardBg(slug)

            return (
              <div
                key={w.title}
                data-workshop-card
                className="flex shrink-0 snap-start"
                style={{ width: 'calc(100vw - 2rem)', maxWidth: '900px' }}
              >
                <div
                  className={`flex w-full flex-col overflow-hidden rounded-xl sm:rounded-2xl lg:flex-row ${cardBg}`}
                >
                  {/* Left: text + buttons */}
                  <div className="flex flex-col justify-center px-4 py-8 sm:px-8 md:px-10 lg:px-12 lg:py-0 lg:w-1/2">
                    <span className="inline-flex w-fit rounded-full bg-[#ECE5DE] px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-[#555954] sm:px-4 sm:py-1.5">
                      {pillLabel}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-bold text-[#1a1a1a] sm:mt-4 sm:text-2xl md:text-3xl lg:text-3xl">
                      {w.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#555954] sm:mt-3 sm:text-body-lg line-clamp-2 lg:line-clamp-3">
                      {w.description}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 text-xs text-[#555954] sm:mt-6 sm:text-sm">
                      {w.duration && (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
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
                          {w.duration}
                        </span>
                      )}
                      {(w.location || w.format) && (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
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
                          {w.location ?? w.format}
                        </span>
                      )}
                    </div>
                    <div className="mt-6 flex flex-col gap-2 sm:gap-3 sm:flex-row md:mt-8">
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-lg bg-[#555954] px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#333] sm:rounded-2xl sm:px-8 sm:py-4 sm:text-sm"
                      >
                        {buyLabel}
                        <svg
                          className="ml-2 h-3 w-3 sm:h-4 sm:w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                      <Link
                        href={href}
                        className="inline-flex items-center justify-center rounded-lg border-2 border-[#E5B765] bg-transparent px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[#555954] transition-colors hover:bg-[#E5B765]/10 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-sm"
                      >
                        {moreInfoLabel}
                      </Link>
                    </div>
                  </div>
                  {/* Right: image - hidden on mobile, visible on lg */}
                  <div className="relative hidden aspect-4/3 w-full lg:block lg:w-1/2 lg:aspect-auto lg:min-h-80">
                    {isResolvedMedia(displayImage) ? (
                      <Media resource={displayImage} fill imgClassName="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[#ECE5DE]" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Bottom Navigation Arrows ───────────────────── */}
        <div className="flex justify-end items-center gap-3 mt-6 md:mt-8">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex items-center justify-center transition-all hover:bg-[#E5B765]/80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#E5B765',
            }}
            aria-label="Scroll left"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex items-center justify-center transition-all hover:bg-[#E5B765]/80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#E5B765',
            }}
            aria-label="Scroll right"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
