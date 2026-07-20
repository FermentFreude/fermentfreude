'use client'

/**
 * FeldInsGlas last section — dark swipe scroll of other workshops (Figma Make).
 */

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import type { WorkshopItem } from '@/utilities/getWorkshops'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

function getSlugFromCtaLink(ctaLink: string | null | undefined): string | null {
  if (!ctaLink) return null
  const match = ctaLink.match(/\/workshops\/([^/]+)/)
  return match?.[1] ?? null
}

function cardMeta(slug: string | null, locale: 'de' | 'en'): string {
  switch (slug) {
    case 'lakto-gemuese':
      return locale === 'de' ? 'Grundkurs · Studio Graz' : 'Basics · Studio Graz'
    case 'tempeh':
      return locale === 'de' ? 'Intensivkurs · Studio Graz' : 'Intensive · Studio Graz'
    case 'kombucha':
      return locale === 'de' ? 'Abendworkshop · Studio Graz' : 'Evening workshop · Studio Graz'
    case 'vom-feld-ins-glas':
      return locale === 'de' ? 'Outdoor · Steiermark' : 'Outdoor · Styria'
    default:
      return locale === 'de' ? 'Workshop · Graz' : 'Workshop · Graz'
  }
}

type Props = {
  workshops: WorkshopItem[]
  locale?: 'de' | 'en'
  eyebrow?: string
  heading?: string
}

export function FeldInsGlasMoreWorkshops({
  workshops,
  locale = 'de',
  eyebrow = locale === 'de' ? 'Mehr entdecken' : 'Discover more',
  heading = locale === 'de' ? 'Entdecke weitere Workshops.' : 'Discover more workshops.',
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    const onResize = () => updateScrollState()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [updateScrollState, workshops.length])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current
      if (!el) return
      const card = el.querySelector<HTMLElement>('[data-more-workshop-card]')
      const distance = (card?.offsetWidth ?? 280) + 24
      el.scrollBy({
        left: direction === 'left' ? -distance : distance,
        behavior: 'smooth',
      })
      window.setTimeout(updateScrollState, 320)
    },
    [updateScrollState],
  )

  if (workshops.length === 0) return null

  return (
    <section className="bg-white text-[#1A1A1A]">
      <div className="mx-auto max-w-6xl px-6 pt-16 sm:px-10 lg:pt-24">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#E6BE68]">
            {eyebrow}
          </p>
          <h2
            className="mt-4 font-display font-medium tracking-[-0.03em] text-[#1A1A1A]"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.1 }}
          >
            {heading}
          </h2>
        </div>
      </div>

      <div className="relative mt-10 pb-16 lg:mt-14 lg:pb-24">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          data-feld-more-slider
          className="flex gap-6 overflow-x-auto px-6 pb-2 sm:px-10 lg:px-[max(2.5rem,calc((100vw-72rem)/2+2.5rem))]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
          }}
        >
          <style>{`[data-feld-more-slider]::-webkit-scrollbar { display: none; }`}</style>

          {workshops.map((w) => {
            const slug = getSlugFromCtaLink(w.ctaLink)
            const href = slug ? `/workshops/${slug}` : (w.ctaLink ?? '/workshops')
            const image = isResolvedMedia(w.image2) ? w.image2 : w.image
            const meta = w.format
              ? `${w.format}${w.location ? ` · ${w.location}` : ''}`
              : cardMeta(slug, locale)
            const dateLabel = w.dates?.trim() || (locale === 'de' ? 'Termine folgen' : 'Dates TBA')
            const priceLabel = w.price?.trim() || null

            return (
              <Link
                key={w.title + href}
                href={href}
                data-more-workshop-card
                className="group w-[min(78vw,20rem)] shrink-0 snap-start sm:w-[22rem]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#ECE5DE]">
                  {isResolvedMedia(image) ? (
                    <Media
                      resource={image}
                      fill
                      imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="mt-4 font-display text-[10px] font-bold uppercase tracking-[0.22em] text-[#E6BE68]">
                  {meta}
                </p>
                <h3 className="mt-2 font-display text-[1.25rem] font-medium leading-snug tracking-tight text-[#1A1A1A] transition-colors group-hover:text-[#E6BE68]">
                  {w.title}
                </h3>
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <span className="text-body-sm text-[#4B4B4B]/70">{dateLabel}</span>
                  {priceLabel ? (
                    <span className="font-display text-body font-bold text-[#1A1A1A]">
                      {priceLabel}
                    </span>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mx-auto mt-8 flex max-w-6xl justify-end gap-2 px-6 sm:px-10">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex size-10 items-center justify-center border border-[#1A1A1A]/20 text-[#1A1A1A] transition-colors hover:border-[#E6BE68] hover:text-[#E6BE68] disabled:cursor-not-allowed disabled:opacity-25"
            aria-label={locale === 'de' ? 'Zurück' : 'Previous'}
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex size-10 items-center justify-center border border-[#1A1A1A]/20 text-[#1A1A1A] transition-colors hover:border-[#E6BE68] hover:text-[#E6BE68] disabled:cursor-not-allowed disabled:opacity-25"
            aria-label={locale === 'de' ? 'Weiter' : 'Next'}
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
