'use client'

/**
 * Gastronomy Product Slider — matches Kitchen Knives Product Slider layout.
 * @see https://www.sliderrevolution.com/templates/kitchen-knives-product-slider/
 *
 * Layout: Left ~2/3 image (diagonal edge), right ~1/3 light off-white/beige panel.
 * Content (title, description, CTA) and nav on light panel with dark text.
 */
import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

/** Fallback images when CMS has none — Unsplash (allowed in next.config.js) */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', // fermentation jars
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80', // professional kitchen
  'https://images.unsplash.com/photo-1556911220-e15b29be5c8f?w=1200&q=80', // cooking prep
]

function isResolvedMedia(img: unknown): img is { url?: string } {
  return typeof img === 'object' && img !== null && 'url' in img
}

type Slide = {
  id?: string | null
  title?: string
  description?: string
  image?: unknown
}

type Props = {
  slides: Slide[]
  ctaLabel: string
  ctaUrl: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    title: 'Professional Training',
    description:
      "Elevate your team's culinary skills with tailored fermentation workshops.",
  },
  {
    title: 'Corporate Events',
    description:
      'Unique teambuilding experiences around fermentation for your company.',
  },
  {
    title: 'Menu Development',
    description:
      'We support you in integrating fermented products into your menu.',
  },
]

export function GastronomyProductSlider({ slides, ctaLabel, ctaUrl }: Props) {
  const { setHeaderTheme } = useHeaderTheme()
  const resolvedSlides = slides?.length > 0 ? slides : DEFAULT_SLIDES

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    duration: 28,
  })
  const [selectedIndex, setSelectedIndex] = React.useState(0)

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
    <section className="relative w-full min-h-svh overflow-hidden bg-[#f5f4f2]">
      <div ref={emblaRef} className="relative z-10 h-full min-h-svh overflow-hidden">
        <div className="flex h-full min-h-svh">
          {resolvedSlides.map((slide, i) => (
            <div
              key={slide.id ?? i}
              className="relative flex min-w-0 flex-[0_0_100%] min-h-svh flex-col md:flex-row"
            >
              {/* Left: product image (~2/3) — diagonal edge, dark overlay */}
              <div
                className="relative min-h-[40vh] overflow-hidden md:min-h-0 md:w-[58%] lg:w-[65%]"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                  backgroundColor: '#333333',
                }}
              >
                {slide.image && isResolvedMedia(slide.image) ? (
                  <Media
                    resource={slide.image as Parameters<typeof Media>[0]['resource']}
                    fill
                    imgClassName="object-cover object-center"
                    priority={i === 0}
                  />
                ) : FALLBACK_IMAGES[i] ? (
                  <Image
                    src={FALLBACK_IMAGES[i]!}
                    alt={slide.title ?? 'Fermentation'}
                    fill
                    className="object-cover object-center"
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 65vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#333333]" aria-hidden />
                )}
                <div className="absolute inset-0 bg-black/50" aria-hidden />
              </div>

              {/* Right: light off-white/beige panel — same structure & spacing as Kitchen Knives */}
              <div className="relative flex flex-1 flex-col justify-between bg-[#f5f4f2] py-12 pl-8 pr-6 md:py-16 md:pl-12 md:pr-8 lg:pl-24 lg:pr-14 lg:py-20">
                <div className="flex flex-1 flex-col justify-center">
                  <h1 className="font-display text-3xl font-bold leading-tight text-[#1b1b1b] sm:text-4xl md:text-4xl lg:text-[3.75rem] lg:leading-[1.1]">
                    {slide.title}
                  </h1>
                  {slide.description && (
                    <p className="mt-6 font-sans text-base leading-relaxed text-[#333] md:mt-8 md:text-lg">
                      {slide.description}
                    </p>
                  )}
                  <Link
                    href={ctaUrl}
                    className="mt-10 inline-block w-fit bg-[#1b1b1b] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 md:mt-12"
                  >
                    {ctaLabel}
                  </Link>
                  {/* PREV | NEXT — left-aligned, generous spacing above */}
                  {resolvedSlides.length > 1 && (
                    <div className="mt-12 flex items-center gap-0 md:mt-16">
                      <span className="font-sans text-sm font-extrabold tracking-tight text-[#1b1b1b]/70 md:hidden md:text-base">
                        {String(selectedIndex + 1).padStart(2, '0')} / {String(resolvedSlides.length).padStart(2, '0')}{' '}
                      </span>
                      <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={scrollPrev}
                        className="shrink-0 font-display text-lg font-extrabold uppercase tracking-[1px] leading-[45px] text-[#1b1b1b]/65 transition-colors hover:text-[#1b1b1b]"
                      >
                        PREV
                      </button>
                      <span className="mx-6 h-[45px] shrink-0 w-px bg-[#1b1b1b]/50" aria-hidden />
                      <button
                        type="button"
                        aria-label="Next slide"
                        onClick={scrollNext}
                        className="shrink-0 font-display text-lg font-extrabold uppercase tracking-[1px] leading-[45px] text-[#1b1b1b]/65 transition-colors hover:text-[#1b1b1b]"
                      >
                        NEXT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide counter — bottom left on dark image area (white text), desktop only */}
      {resolvedSlides.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 hidden font-sans text-sm font-extrabold tracking-tight text-white md:block md:bottom-8 md:left-12 md:text-base">
          {String(selectedIndex + 1).padStart(2, '0')} / {String(resolvedSlides.length).padStart(2, '0')}
        </div>
      )}
    </section>
  )
}
