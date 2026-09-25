'use client'

import { SentenceBreakText } from '@/components/gastronomy/SentenceBreakText'
import { Media } from '@/components/Media'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

function isResolvedMedia(img: unknown): img is { url?: string; alt?: string } {
  if (typeof img !== 'object' || img === null || !('url' in img)) return false
  const url = String((img as { url?: string }).url ?? '').trim()
  return Boolean(url) && !/\/null(?:\?|$)/.test(url)
}

export type ShowcaseSlide = {
  id?: string | null
  title: string
  text?: string | null
  image?: unknown
}

type Props = {
  title: string
  slides: ShowcaseSlide[]
  locale?: 'de' | 'en'
}

export function GastronomyShowcase({ title, slides, locale = 'de' }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    containScroll: 'trimSnaps',
  })
  const prevLabel = locale === 'en' ? 'Previous slide' : 'Vorherige Folie'
  const nextLabel = locale === 'en' ? 'Next slide' : 'Nächste Folie'

  if (slides.length === 0) return null

  return (
    <section className="bg-[#F6F0E8] section-padding-md" aria-label={title}>
      <div className="container mx-auto container-padding">
        <h2 className="max-w-3xl font-display text-section-heading font-bold tracking-tight text-ff-black">
          {title}
        </h2>
      </div>

      <div className="mt-8 md:mt-10">
        <div className="px-[var(--space-container-x)]">
          <div ref={emblaRef} className="overflow-hidden">
            {/* Slide spacing via padding (not CSS gap) — gap breaks Embla loop alignment
                and crops the left card. Snap options stay unchanged. */}
            <div className="-ml-4 flex touch-pan-y backface-hidden md:-ml-5">
              {slides.map((slide, i) => {
                const cms = isResolvedMedia(slide.image) ? slide.image : null

                return (
                  <article
                    key={slide.id ?? `${slide.title}-${i}`}
                    className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_70%] md:flex-[0_0_52%] md:pl-5 lg:flex-[0_0_38%]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#ECE5DE]">
                      {cms ? (
                        <Media
                          resource={cms as never}
                          fill
                          priority={i === 0}
                          imgClassName="object-cover transition-transform duration-700 hover:scale-[1.04]"
                          size="(max-width: 768px) 85vw, 38vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#ECE5DE]" aria-hidden />
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-subheading font-bold text-ff-black">
                      {slide.title}
                    </h3>
                    {slide.text?.trim() ? (
                      <SentenceBreakText
                        text={slide.text}
                        className="mt-1 max-w-sm text-body-sm text-ff-gray-text"
                      />
                    ) : null}
                  </article>
                )
              })}
            </div>
          </div>
        </div>

        <div className="container mx-auto container-padding mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-ff-gold text-[#1b1b1b] transition-transform hover:scale-[1.06] hover:bg-[#EDD195] active:scale-[0.97]"
            aria-label={prevLabel}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-ff-gold text-[#1b1b1b] transition-transform hover:scale-[1.06] hover:bg-[#EDD195] active:scale-[0.97]"
            aria-label={nextLabel}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
}
