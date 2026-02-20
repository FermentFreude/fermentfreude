'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Page } from '@/payload-types'

/**
 * Food Presentation Slider — split layout inspired by Slider Revolution template.
 * Left: title, tagline, description in white box, red CTA, chevron nav.
 * Right: food image. Light grey textured background, red accent, slide counter.
 * @see https://www.sliderrevolution.com/templates/food-presentation-template-slider/
 */

const DEFAULT_SLIDES = [
  {
    title: 'Learn with us',
    tagline: '',
    description:
      'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
    buttonLabel: 'LEARN MORE',
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

type HeroSlide = NonNullable<Page['hero']['slides']>[number]
type FoodPresentationSliderProps = Page['hero'] & { type: 'foodPresentationSlider' }

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.56 1.66-1.03 3.77-.99 5.5-.27v-4.04c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.56 1.66-1.03 3.77-.99 5.5-.27v-4.02c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.56 1.66-1.03 3.77-.99 5.5-.27v-4.04c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.56 1.66-1.03 3.77-.99 5.5-.27z" />
    </svg>
  ),
}

export const FoodPresentationSlider: React.FC<FoodPresentationSliderProps> = ({
  slides,
  socialLinks,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    duration: 28,
  })
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const resolvedSlides =
    slides && slides.length > 0
      ? slides.map((s: HeroSlide) => ({
          image: s.image,
          title: s.title ?? '',
          tagline: (s as { tagline?: string }).tagline ?? '',
          description: s.description ?? '',
          buttonLabel: (s.buttonLabel ?? 'LEARN MORE').toUpperCase(),
          buttonUrl: s.buttonUrl ?? '',
        }))
      : DEFAULT_SLIDES

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi || resolvedSlides.length <= 1) return
    const interval = setInterval(() => emblaApi.scrollNext(), 6000)
    return () => clearInterval(interval)
  }, [emblaApi, resolvedSlides.length])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="relative w-full min-h-svh overflow-hidden bg-[#E8E6E3]">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      {/* Red accent block — top right */}
      <div
        className="absolute right-0 top-0 z-0 h-[45%] w-[55%] bg-[#C41E3A] md:h-[50%] md:w-[45%]"
        aria-hidden
      />

      <div ref={emblaRef} className="relative z-10 h-full min-h-svh overflow-hidden">
        <div className="flex h-full min-h-svh">
          {resolvedSlides.map((slide, i) => {
            const imageUrl = getImageUrl(slide.image)
            return (
              <div
                key={i}
                className="relative flex min-w-0 flex-[0_0_100%] min-h-svh flex-col md:flex-row"
              >
                {/* Left: text + controls */}
                <div className="relative flex flex-1 flex-col justify-center px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
                  <div className="max-w-xl">
                    {/* Title — large black serif */}
                    <h1 className="font-display text-4xl font-bold tracking-tight text-[#1D1D1D] sm:text-5xl md:text-6xl lg:text-7xl">
                      {slide.title}
                    </h1>

                    {/* Tagline — elegant italic */}
                    {slide.tagline && (
                      <p className="mt-2 font-display text-xl italic text-[#4A4A4A] sm:text-2xl md:mt-3 md:text-3xl">
                        {slide.tagline}
                      </p>
                    )}

                    {/* Description — semi-transparent white box */}
                    {slide.description && (
                      <div className="mt-6 rounded-lg bg-white/70 px-5 py-4 backdrop-blur-sm md:mt-8 md:px-6 md:py-5">
                        <p className="font-sans text-base leading-relaxed text-[#333] md:text-lg">
                          {slide.description}
                        </p>
                      </div>
                    )}

                    {/* CTA — red button */}
                    {slide.buttonLabel && slide.buttonUrl && (
                      <Link
                        href={slide.buttonUrl}
                        className="mt-6 inline-block font-display text-sm font-bold uppercase tracking-widest text-[#C41E3A] transition-opacity hover:opacity-80 md:mt-8"
                      >
                        {slide.buttonLabel}
                      </Link>
                    )}

                    {/* Chevron nav — below description */}
                    {resolvedSlides.length > 1 && (
                      <div className="mt-8 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Previous slide"
                          onClick={scrollPrev}
                          className="flex h-10 w-10 items-center justify-center bg-[#1D1D1D] text-white transition-opacity hover:opacity-90"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next slide"
                          onClick={scrollNext}
                          className="flex h-10 w-10 items-center justify-center bg-[#1D1D1D] text-white transition-opacity hover:opacity-90"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: food image */}
                <div className="relative flex-1 min-h-[40vh] md:min-h-0">
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
                    <div className="absolute inset-0 bg-[#D4D2CF]" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Slide indicator — bottom left */}
      {resolvedSlides.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 font-sans text-sm font-medium text-[#4A4A4A] md:bottom-8 md:left-10 md:text-base">
          {selectedIndex + 1}/{resolvedSlides.length}
        </div>
      )}

      {/* Social icons — bottom right */}
      {socialLinks && socialLinks.length > 0 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-4 text-[#4A4A4A] md:bottom-8 md:right-10">
          {socialLinks.map((link) => {
            const platform = (link as { platform?: string }).platform
            const url = (link as { url?: string }).url
            const Icon = platform ? SOCIAL_ICONS[platform] : null
            if (!Icon || !url) return null
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                className="transition-opacity hover:opacity-70"
              >
                {Icon}
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
