'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useCallback, useEffect, useRef, useState } from 'react'

export type TempehTypeSliderProps = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  items?: Array<{
    id?: string | null
    title: string
    description?: string | null
    badgeLabel?: string | null
    badgeColor?: string | null
    image?: (string | null) | MediaType
  }> | null
}

/**
 * TempehTypeSlider — Hero-Style Carousel (Image Left, Content Right)
 *
 * Horizontal scrolling carousel with full-height hero slides.
 * Each slide: image (left) + content panel (right with title, description, badge)
 * - Smooth horizontal scrolling with nav arrows
 * - Pagination dots
 * - Responsive sizing
 */
export function TempehTypeSlider({ eyebrow, heading, description, items }: TempehTypeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const safeItems = Array.isArray(items) ? items : []

  const checkScroll = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    setCanScrollLeft(container.scrollLeft > 10)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)

    // Update current slide based on scroll position
    const slideIndex = Math.round(container.scrollLeft / container.clientWidth)
    setCurrentSlide(Math.min(slideIndex, safeItems.length - 1))
  }, [safeItems.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    checkScroll()
    container.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  if (safeItems.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return
    const container = containerRef.current
    const scrollAmount = container.clientWidth
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const getBadgeColor = (color?: string | null) => {
    if (!color) return 'bg-[#F5F1E8] text-[#595959]'
    if (color.toLowerCase() === 'benefit') return 'bg-[#E5B765] text-[#1a1a1a]'
    return 'bg-[#F5F1E8] text-[#595959]'
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#F5F1EE]">
      {/* Header */}
      {(eyebrow || heading || description) && (
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">
          {eyebrow && (
            <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[#595959]/70">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
          )}
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#595959] sm:text-lg">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 sm:left-6 sm:size-11 ${
            canScrollLeft
              ? 'bg-white/90 shadow-lg hover:scale-110 hover:bg-white hover:shadow-xl'
              : 'pointer-events-none bg-white/30 opacity-40'
          }`}
          aria-label="Previous slide"
        >
          <svg
            className="size-4 sm:size-5 text-[#1a1a1a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="overflow-x-auto scroll-smooth"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <div className="flex">
            {safeItems.map((item, index) => (
              <div
                key={item.id || index}
                className="relative h-125 w-full shrink-0 snap-start sm:h-150 lg:h-162.5"
              >
                {/* Slide Content */}
                <div className="absolute inset-0 flex flex-col sm:flex-row">
                  {/* Image Section (Left on desktop, Top on mobile) */}
                  <div className="relative h-1/2 w-full sm:h-full sm:w-1/2">
                    {item.image &&
                      typeof item.image === 'object' &&
                      item.image !== null &&
                      'url' in item.image && (
                        <Media
                          resource={item.image as MediaType}
                          fill
                          imgClassName="object-cover"
                        />
                      )}
                  </div>

                  {/* Content Panel (Right on desktop, Bottom on mobile) */}
                  <div className="flex h-1/2 w-full flex-col justify-center gap-4 bg-white px-6 py-8 sm:h-full sm:w-1/2 sm:gap-6 sm:px-10 lg:px-16">
                    {/* Badge */}
                    {item.badgeLabel && (
                      <div
                        className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide sm:text-sm ${getBadgeColor(item.badgeColor)}`}
                      >
                        {item.badgeLabel}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-display text-2xl font-bold leading-tight text-[#1a1a1a] sm:text-3xl lg:text-4xl">
                      {item.title}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="text-base leading-relaxed text-[#595959] sm:text-lg">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 sm:right-6 sm:size-11 ${
            canScrollRight
              ? 'bg-white/90 shadow-lg hover:scale-110 hover:bg-white hover:shadow-xl'
              : 'pointer-events-none bg-white/30 opacity-40'
          }`}
          aria-label="Next slide"
        >
          <svg
            className="size-4 sm:size-5 text-[#1a1a1a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 bg-[#F5F1EE] py-8">
        {safeItems.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  left: (containerRef.current.scrollWidth / safeItems.length) * i,
                  behavior: 'smooth',
                })
              }
              setCurrentSlide(i)
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-8 bg-[#1a1a1a]' : 'w-1.5 bg-[#D9D9D9] hover:bg-[#B0B0B0]'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentSlide ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  )
}
