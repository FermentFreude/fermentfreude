'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

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
    duration: 30,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [progress, setProgress] = useState(0)

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
    setProgress(0)
  }, [emblaApi])

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Autoplay: advance every 5 seconds + progress bar
  useEffect(() => {
    if (!emblaApi || resolvedSlides.length <= 1) return
    setProgress(0)
    const duration = 5000
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / duration) * 100, 100))
    }, 50)
    const timeout = setTimeout(() => {
      emblaApi.scrollNext()
    }, duration)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [emblaApi, resolvedSlides.length, selectedIndex])

  return (
    <section className="relative w-full h-svh overflow-hidden">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {resolvedSlides.map((slide, i) => {
            const imageUrl = getImageUrl(slide.image)
            return (
              <div key={i} className="relative min-w-0 flex-[0_0_100%] h-full">
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
                  <div className="absolute inset-0 bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a]" />
                )}

                {/* Gradient overlay — editorial vignette */}
                <div className="absolute inset-0 bg-linear-to-r from-ff-black/80 via-ff-black/30 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-ff-black/60 via-transparent to-transparent" />
                {/* Subtle grain texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} aria-hidden />

                {/* Slide counter — editorial (only on current slide) */}
                {i === selectedIndex && (
                  <div className="absolute top-24 left-6 sm:left-8 md:left-12 lg:left-16 z-20 font-mono text-caption text-ff-cream/60 tracking-widest">
                    {String(selectedIndex + 1).padStart(2, '0')} / {String(resolvedSlides.length).padStart(2, '0')}
                  </div>
                )}

                {/* Content — left-aligned editorial on large screens */}
                <div className="relative z-10 flex h-full items-center pt-20 sm:pt-24 lg:pt-28">
                  <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
                    <div className="max-w-2xl lg:max-w-xl lg:text-left">
                      <div className="h-px w-12 bg-ff-gold-accent mb-6 lg:mb-8" aria-hidden />
                      <h1 className="text-hero text-ff-cream tracking-tight">
                        {slide.title}
                      </h1>
                      {slide.description && (
                        <p className="mt-5 text-body-lg leading-relaxed text-ff-cream/90 max-w-lg">
                          {slide.description}
                        </p>
                      )}
                      {slide.buttonLabel && slide.buttonUrl && (
                        <Link
                          href={slide.buttonUrl}
                          className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-ff-gold-accent bg-ff-gold-accent px-8 py-3.5 font-display text-base font-bold text-ff-black transition-all hover:bg-ff-gold-accent-dark hover:border-ff-gold-accent-dark md:px-10 md:py-4 group"
                        >
                          {slide.buttonLabel}
                          <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
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

      {/* Progress bar + Dots navigation */}
      {resolvedSlides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Progress bar */}
          <div className="h-0.5 w-full bg-ff-cream/20 overflow-hidden">
            <div
              className="h-full bg-ff-gold-accent transition-none duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2.5">
            {resolvedSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === selectedIndex ? 'w-8 bg-ff-gold-accent' : 'w-1.5 bg-ff-cream/50 hover:bg-ff-cream/80',
                )}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
