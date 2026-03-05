'use client'

import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'

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
  if (workshops.length === 0) return null

  return (
    <section className="relative overflow-visible bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container-padding relative mx-auto max-w-7xl">
        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          {/* Header with nav arrows */}
          <div className="mb-6 flex flex-col gap-4 sm:gap-6 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-[#1a1a1a] sm:text-3xl md:text-4xl">
                {heading}
              </h2>
              <p className="mt-2 text-sm text-[#555954] sm:mt-3 sm:text-body-lg md:max-w-xl">
                {subtitle}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <CarouselPrevious
                className="h-10 w-10 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] transition-colors hover:bg-[#d4a654] sm:h-12 sm:w-12"
                variant="default"
              />
              <CarouselNext
                className="h-10 w-10 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] transition-colors hover:bg-[#d4a654] sm:h-12 sm:w-12"
                variant="default"
              />
            </div>
          </div>
          <CarouselContent className="ml-0">
            {workshops.map((w) => {
              const slug = getSlugFromCtaLink(w.ctaLink)
              const href = slug ? `/workshops/${slug}` : '/workshops'
              const displayImage = isResolvedMedia(w.image2) ? w.image2 : w.image
              const cardBg = getWorkshopCardBg(slug)

              return (
                <CarouselItem key={w.title} className="pl-0">
                  <div
                    className={`flex min-h-screen flex-col overflow-hidden rounded-xl sm:rounded-2xl md:min-h-96 lg:min-h-112 lg:flex-row ${cardBg}`}
                  >
                    {/* Left: text + buttons */}
                    <div className="flex flex-col justify-center px-4 py-8 sm:px-8 md:px-10 lg:px-12 lg:py-0">
                      <span className="inline-flex w-fit rounded-full bg-[#ECE5DE] px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-[#555954] sm:px-4 sm:py-1.5">
                        {pillLabel}
                      </span>
                      <h3 className="mt-3 font-display text-xl font-bold text-[#1a1a1a] sm:mt-4 sm:text-2xl md:text-3xl lg:text-4xl">
                        {w.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#555954] sm:mt-3 sm:text-body-lg">
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
                      <CarouselDots count={workshops.length} />
                    </div>
                    {/* Right: image - hidden on mobile, visible on lg */}
                    <div className="relative hidden aspect-4/3 w-full lg:block lg:w-1/2 lg:aspect-auto lg:min-h-96">
                      {isResolvedMedia(displayImage) ? (
                        <Media resource={displayImage} fill imgClassName="object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[#ECE5DE]" />
                      )}
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

function CarouselDots({ count }: { count: number }) {
  return (
    <div className="mt-6 flex gap-1.5 sm:mt-8 sm:gap-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-0.5 w-4 rounded-full transition-colors sm:h-1 sm:w-8 ${i === 0 ? 'bg-[#555954]' : 'bg-[#555954]/30'}`}
        />
      ))}
    </div>
  )
}
