'use client'

import { RichText } from '@/components/RichText'
import type { Page } from '@/payload-types'
import Image from 'next/image'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS (English)
 *  Shown immediately without any CMS setup.
 *  CMS data always wins when available.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_RICHTEXT = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Good food',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Better Health',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Real Joy',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'We make fermentation joyful & accessible while empowering gut health through taste, education, and quality handmade foods.',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

const DEFAULT_LINKS = [
  {
    link: {
      type: 'custom' as const,
      label: 'Workshop',
      url: '/workshops',
      appearance: 'default' as const,
    },
  },
  {
    link: {
      type: 'custom' as const,
      label: 'Products',
      url: '/shop',
      appearance: 'outline' as const,
    },
  },
]

/* ═══════════════════════════════════════════════════════════════ */

type HeroSliderProps = Page['hero']

/** Resolve a Payload CMS link object to an href string. */
function resolveHref(link: Record<string, unknown>): string {
  if (link?.type === 'reference' && typeof link?.reference === 'object' && link.reference) {
    const ref = link.reference as { relationTo?: string; value?: { slug?: string } | string }
    const slug = typeof ref.value === 'object' ? ref.value?.slug : ref.value
    if (slug) {
      return `${ref.relationTo !== 'pages' ? `/${ref.relationTo}` : ''}/${slug}`
    }
  }
  return (link?.url as string) || '#'
}

/* ── Test slides using local image ─────────────────────────── */
const TEST_SLIDES = Array.from({ length: 5 }, (_, i) => ({
  id: `slide-${i}`,
  src: '/assets/images/hero-test.jpg',
  alt: `FermentFreude hero slide ${i + 1}`,
}))

/* ── Arrow Icons ──────────────────────────────────────────────── */

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

/* ── Scroll Down Indicator ────────────────────────────────────── */

function ScrollIndicator() {
  return (
    <div className="hidden lg:flex flex-col items-center gap-2 text-[#4b4b4b]/60">
      <div className="w-px h-10 bg-[#4b4b4b]/40" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
 *  HERO SLIDER COMPONENT
 * ═══════════════════════════════════════════════════════════════ */

export const HeroSlider: React.FC<HeroSliderProps> = ({
  links,
  richText,
  heroImages,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  /* ── Merge CMS data with defaults ──────────────────────────── */
  const resolvedRichText = richText ?? DEFAULT_RICHTEXT
  const resolvedLinks = links && links.length > 0 ? links : DEFAULT_LINKS

  // Use local test images for now
  const slides = TEST_SLIDES

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  /* ── Embla Carousel ─────────────────────────────────────────── */
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const hasImages = slides.length > 0

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section className="relative w-full bg-[#F9F0DC] overflow-hidden">
      <div className="mx-auto w-full max-w-416 px-(--space-container-x) pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-0">
          {/* ══════════════════════════════════════════════════════
           *  LEFT SIDE — Text Content
           * ══════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col gap-6 sm:gap-8 lg:gap-12 shrink-0 lg:pr-8 xl:pr-12">
            {/* Title + Description */}
            {resolvedRichText && (
              <RichText
                className={cn(
                  'flex flex-col',
                  '[&_h1]:font-display [&_h1]:font-black [&_h1]:text-[#1d1d1d]',
                  '[&_h1]:text-[2rem] sm:[&_h1]:text-[2.5rem] md:[&_h1]:text-[3rem] lg:[&_h1]:text-[3.5rem] xl:[&_h1]:text-[4.25rem]',
                  '[&_h1]:leading-[1.08] [&_h1]:tracking-[-0.02em]',
                  '[&_h1]:mb-0',
                  '[&_p]:font-display [&_p]:font-bold [&_p]:text-[#6b6b6b]',
                  '[&_p]:text-[0.875rem] sm:[&_p]:text-[1rem] lg:[&_p]:text-[1.125rem] xl:[&_p]:text-[1.25rem]',
                  '[&_p]:leading-normal [&_p]:mt-6 sm:[&_p]:mt-8 lg:[&_p]:mt-10',
                  '[&_p]:max-w-xl',
                  '[&_p]:mb-0',
                )}
                data={resolvedRichText}
                enableGutter={false}
                enableProse={false}
              />
            )}

            {/* CTA Buttons */}
            {resolvedLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {resolvedLinks.map(({ link }, i) => {
                  const href = resolveHref(link as unknown as Record<string, unknown>)
                  const label = (link as { label?: string })?.label
                  const isPrimary = i === 0
                  return (
                    <Link
                      key={i}
                      href={href}
                      className={cn(
                        'inline-flex items-center justify-center font-display font-bold',
                        'rounded-full transition-all duration-300 ease-out',
                        'text-sm sm:text-base lg:text-lg',
                        'px-8 py-3 sm:px-10 sm:py-3.5 lg:px-12 lg:py-4',
                        isPrimary
                          ? 'bg-[#4b4b4b] text-[#F9F0DC] hover:bg-[#3a3a3a] hover:scale-[1.02]'
                          : 'bg-[#F9F0DC] text-[#4b4b4b] border border-[#4b4b4b] hover:bg-[#4b4b4b] hover:text-[#F9F0DC] hover:scale-[1.02]',
                      )}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
           *  RIGHT SIDE — Image Carousel
           * ══════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[58%] xl:w-[60%] relative">
            {hasImages ? (
              <>
                {/* Carousel viewport */}
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex items-center touch-pan-y">
                    {slides.map((slide, index) => {
                      const isActive = index === selectedIndex
                      return (
                        <div
                          key={slide.id}
                          className={cn(
                            'flex-[0_0_55%] sm:flex-[0_0_50%] lg:flex-[0_0_58%] xl:flex-[0_0_55%]',
                            'min-w-0 relative px-2 sm:px-3',
                            'transition-all duration-500 ease-out',
                          )}
                        >
                          <div
                            className={cn(
                              'relative overflow-hidden rounded-3xl sm:rounded-4xl lg:rounded-[2.5rem]',
                              'transition-all duration-500 ease-out',
                              isActive
                                ? 'aspect-3/4 sm:aspect-4/5 scale-100 opacity-100 z-10'
                                : 'aspect-3/4 sm:aspect-4/5 scale-[0.85] opacity-60 z-0',
                            )}
                          >
                            <Image
                              src={slide.src}
                              alt={slide.alt}
                              fill
                              className="object-cover"
                              priority={isActive}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center lg:justify-end gap-3 mt-6 lg:mt-8 lg:pr-4">
                  {/* Previous */}
                  <button
                    onClick={scrollPrev}
                    aria-label="Previous slide"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#4b4b4b]/30 text-[#4b4b4b] hover:bg-[#4b4b4b] hover:text-[#F9F0DC] transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Dot indicators */}
                  <div className="flex items-center gap-2 sm:gap-2.5 px-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={cn(
                          'rounded-full transition-all duration-300',
                          index === selectedIndex
                            ? 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#4b4b4b]'
                            : 'w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#4b4b4b]/40 hover:bg-[#4b4b4b]/60',
                        )}
                      />
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={scrollNext}
                    aria-label="Next slide"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#4b4b4b]/30 text-[#4b4b4b] hover:bg-[#4b4b4b] hover:text-[#F9F0DC] transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </>
            ) : (
              /* Placeholder when no images */
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'bg-[#ECE5DE] rounded-4xl',
                      i === 2
                        ? 'w-[55%] aspect-3/4'
                        : 'w-[35%] aspect-3/4 scale-[0.85] opacity-60',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator — bottom right */}
        <div className="flex justify-end mt-6 lg:mt-8">
          <ScrollIndicator />
        </div>
      </div>
    </section>
  )
}
