'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import type { Page } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS (English)
 *  CMS data always wins when available.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_SLIDES = [
  {
    title: 'Learn with us',
    description:
      'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
    buttonLabel: 'Discover More',
    buttonUrl: '/about',
    image: null as string | null,
  },
]

function getImageUrl(image: unknown): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image !== null && 'url' in image) {
    const url = (image as { url?: string }).url
    if (!url) return ''
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${url}`
  }
  return ''
}

type HeroCarouselProps = Page['hero'] & { type: 'heroCarousel' }

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    duration: 25,
  })
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const resolvedSlides =
    slides && slides.length > 0
      ? slides.map((s) => ({
          image: s.image,
          title: (s as { title?: string }).title ?? '',
          description: (s as { description?: string }).description ?? '',
          buttonLabel: (s as { buttonLabel?: string }).buttonLabel ?? '',
          buttonUrl: (s as { buttonUrl?: string }).buttonUrl ?? '',
        }))
      : DEFAULT_SLIDES

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  // Autoplay: advance every 5 seconds
  useEffect(() => {
    if (!emblaApi || resolvedSlides.length <= 1) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)
    return () => clearInterval(interval)
  }, [emblaApi, resolvedSlides.length])

  return (
    <section className="relative w-full h-svh overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {resolvedSlides.map((slide, i) => {
            const imageUrl = getImageUrl(slide.image)
            return (
              <div
                key={i}
                className="relative min-w-0 flex-[0_0_100%] h-full"
              >
                {/* Background image */}
                {imageUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                ) : slide.image && typeof slide.image === 'object' ? (
                  <div className="absolute inset-0">
                    <Media
                      resource={slide.image}
                      fill
                      imgClassName="object-cover"
                      priority={i === 0}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

                {/* Content */}
                <div className="relative z-10 flex h-full items-center pt-16 sm:pt-20 lg:pt-24">
                  <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
                    <div className="max-w-3xl">
                      <h1 className="font-display text-4xl font-bold leading-tight text-[#F6EFDD] sm:text-5xl md:text-6xl lg:text-7xl">
                        {slide.title}
                      </h1>
                      {slide.description && (
                        <p className="mt-4 max-w-xl font-sans text-lg leading-relaxed text-[#D8D8D8] md:text-xl">
                          {slide.description}
                        </p>
                      )}
                      {slide.buttonLabel && slide.buttonUrl && (
                        <Link
                          href={slide.buttonUrl}
                          className="mt-6 inline-flex rounded-full bg-[#E5B765] px-6 py-3 font-display text-base font-bold text-black transition-all hover:bg-[#d4a654] hover:scale-105 md:mt-8 md:px-8 md:py-4 md:text-lg"
                        >
                          {slide.buttonLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dots navigation */}
      {resolvedSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {resolvedSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                i === selectedIndex
                  ? 'w-8 bg-[#E5B765]'
                  : 'bg-white/50 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
