'use client'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
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
      return 'bg-[#F5F1E8]'
    case 'kombucha':
      return 'bg-[#F9F0DC]'
    case 'lakto-gemuese':
      return 'bg-[#E8E4D9]'
    default:
      return 'bg-[#FAFAF9]'
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
    <section className="relative overflow-visible bg-white py-16 md:py-24">
      <div className="container-padding relative mx-auto max-w-7xl">
        <Carousel opts={{ align: 'start', loop: true }} className="w-full">
          {/* Header with nav arrows - inside Carousel for context */}
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">{heading}</h2>
              <p className="mt-3 max-w-xl text-body-lg text-[#333]">{subtitle}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <CarouselPrevious
                className="static size-12 translate-y-0 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] hover:bg-[#d4a654] hover:text-[#1a1a1a]"
                variant="default"
              />
              <CarouselNext
                className="static size-12 translate-y-0 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] hover:bg-[#d4a654] hover:text-[#1a1a1a]"
                variant="default"
              />
            </div>
          </div>
          <CarouselContent className="-ml-0">
            {workshops.map((w) => {
              const slug = getSlugFromCtaLink(w.ctaLink)
              const href = slug ? `/workshops/${slug}` : '/workshops'
              const displayImage = isResolvedMedia(w.image2) ? w.image2 : w.image
              const cardBg = getWorkshopCardBg(slug)

              return (
                <CarouselItem key={w.title} className="pl-0">
                  <div className={`flex h-[28rem] min-h-[28rem] overflow-hidden rounded-2xl ${cardBg}`}>
                    <div className="grid min-h-full w-full grid-cols-1 lg:grid-cols-2">
                      {/* Left: text + buttons */}
                      <div className="flex flex-col justify-center p-8 md:p-12">
                        <span className="inline-flex w-fit rounded-full bg-[#ECE5DE] px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-[#555954]">
                          {pillLabel}
                        </span>
                        <h3 className="mt-4 font-display text-3xl font-bold text-[#1a1a1a] md:text-4xl">
                          {w.title}
                        </h3>
                        <p className="mt-3 text-body-lg text-[#333]">{w.description}</p>
                        <div className="mt-6 flex flex-col gap-2 text-base text-[#333]">
                          {w.duration && (
                            <span className="flex items-center gap-2">
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
                              {w.duration}
                            </span>
                          )}
                          {(w.location || w.format) && (
                            <span className="flex items-center gap-2 text-[#333]">
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
                              {w.location ?? w.format}
                            </span>
                          )}
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                          <Link
                            href="/contact"
                            className="inline-flex items-center justify-center rounded-2xl bg-[#555954] px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#333]"
                          >
                            {buyLabel}
                            <svg className="ml-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <Link
                            href={href}
                            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#E5B765] bg-transparent px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#4B4B4B] transition-colors hover:bg-[#E5B765]/10"
                          >
                            {moreInfoLabel}
                          </Link>
                        </div>
                        <CarouselDots count={workshops.length} />
                      </div>
                      {/* Right: image */}
                      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[24rem]">
                        {isResolvedMedia(displayImage) ? (
                          <Media resource={displayImage} fill imgClassName="object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-[#ECE5DE]" />
                        )}
                      </div>
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
    <div className="mt-8 flex gap-2" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1 w-8 rounded-full transition-colors ${i === 0 ? 'bg-[#555954]' : 'bg-[#555954]/30'}`}
        />
      ))}
    </div>
  )
}
