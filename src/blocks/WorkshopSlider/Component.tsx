'use client'

import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS (English)
 *  Shows immediately without any CMS setup.
 *  CMS data always wins when available.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_EYEBROW = 'Workshop Experience'

const DEFAULT_WORKSHOPS = [
  {
    title: 'Lacto-Vegetables',
    description:
      'Fermenting vegetables, experiencing different flavours every month. Do you have leftover seasonal vegetables and want to transform them into real taste sensations?',
    features: [
      { text: 'Duration: approx. 3 hours' },
      { text: 'For everyone from beginner to pro.' },
      { text: 'Ingredients, jars, and spices are all provided.' },
      { text: 'Take all the jars home with you afterward' },
    ],
    ctaLink: '/workshops/lakto-gemuese',
    detailsButtonLabel: 'Workshop Details',
  },
  {
    title: 'Kombucha',
    description:
      'Fermenting tea, creating balanced flavours with every brew. Curious how kombucha becomes naturally fizzy, fresh, and complex?',
    features: [
      { text: 'Duration: approx. 3 hours' },
      { text: 'For everyone from beginner to pro.' },
      { text: 'Tea, bottles, and flavourings are all provided.' },
      { text: 'Take home your own brewed kombucha.' },
    ],
    ctaLink: '/workshops/kombucha',
    detailsButtonLabel: 'Workshop Details',
  },
  {
    title: 'Tempeh',
    description:
      'From beans to tempeh, understanding texture, taste, and technique. Learn how this traditional fermentation becomes a versatile, healthy protein.',
    features: [
      { text: 'Duration: approx. 3 hours' },
      { text: 'Suitable for home cooks and professionals.' },
      { text: 'Beans, starter cultures, and all are provided.' },
      { text: 'Take home freshly made tempeh.' },
    ],
    ctaLink: '/workshops/tempeh',
    detailsButtonLabel: 'Workshop Details',
  },
]

const DEFAULT_DETAILS_BUTTON_LABEL = 'Workshop Details'
const DEFAULT_ALL_WORKSHOPS_BUTTON_LABEL = 'All Workshops'
const DEFAULT_ALL_WORKSHOPS_LINK = '/workshops'

/* ═══════════════════════════════════════════════════════════════ */

type Props = WorkshopSliderBlockType & {
  id?: string
}

/** Format index as zero-padded number (e.g. 1 → "01") */
function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0')
}

/** Get the image URL from a Payload media field */
function getImageUrl(image: MediaType | string | null | undefined): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  return image.url ?? null
}

export const WorkshopSliderBlock: React.FC<Props> = ({
  eyebrow,
  workshops,
  allWorkshopsButtonLabel,
  allWorkshopsLink,
  id,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibilities, setVisibilities] = useState<number[]>([])

  /* ── Merge CMS data with defaults ──────────────────────────── */
  const resolvedEyebrow = eyebrow || DEFAULT_EYEBROW
  const resolvedAllWorkshopsLabel = allWorkshopsButtonLabel || DEFAULT_ALL_WORKSHOPS_BUTTON_LABEL
  const resolvedAllWorkshopsLink = allWorkshopsLink || DEFAULT_ALL_WORKSHOPS_LINK
  const resolvedWorkshops =
    workshops && workshops.length > 0
      ? workshops.map((w, i) => ({
          title: w.title || DEFAULT_WORKSHOPS[i]?.title || `Workshop ${i + 1}`,
          description: w.description || DEFAULT_WORKSHOPS[i]?.description || '',
          features:
            w.features && w.features.length > 0 ? w.features : DEFAULT_WORKSHOPS[i]?.features || [],
          image: w.image,
          ctaLink: w.ctaLink || DEFAULT_WORKSHOPS[i]?.ctaLink || '#',
          detailsButtonLabel: w.detailsButtonLabel || DEFAULT_DETAILS_BUTTON_LABEL,
        }))
      : DEFAULT_WORKSHOPS

  const total = resolvedWorkshops.length

  /* ── Track visibility per slide via IntersectionObserver ──── */
  useEffect(() => {
    const vis = new Array(total).fill(0)
    const observers: IntersectionObserver[] = []

    slideRefs.current.forEach((el, idx) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          vis[idx] = entry.intersectionRatio
          setVisibilities([...vis])
          if (entry.intersectionRatio > 0.5) {
            setActiveIndex(idx)
          }
        },
        {
          root: scrollRef.current,
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [total])

  /* ── Navigate via arrows ───────────────────────────────────── */
  const scrollToSlide = useCallback(
    (index: number) => {
      const el = scrollRef.current
      if (!el) return
      const clamped = Math.max(0, Math.min(index, total - 1))
      const slide = el.children[clamped] as HTMLElement | undefined
      if (slide) {
        el.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
      }
    },
    [total],
  )

  const handlePrev = useCallback(() => scrollToSlide(activeIndex - 1), [activeIndex, scrollToSlide])
  const handleNext = useCallback(() => scrollToSlide(activeIndex + 1), [activeIndex, scrollToSlide])

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section id={id ?? undefined} className="w-full py-6 sm:py-8 lg:py-10">
      <div className="max-w-5xl mx-auto px-(--space-container-x,1.5rem)">
        {/* ── Eyebrow ──────────────────────────────────── */}
        <span className="font-display font-bold text-[10px] sm:text-xs lg:text-sm tracking-widest uppercase text-[#E8C079] dark:text-[#E8C079] block mb-1 sm:mb-1.5">
          {resolvedEyebrow}
        </span>
      </div>

      {/* ── Horizontal scroll track ──────────────────────────── */}
      <div
        ref={scrollRef}
        className={cn(
          'flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory',
          'scroll-smooth scrollbar-none',
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {resolvedWorkshops.map((workshop, wIdx) => {
          const imgUrl = getImageUrl(
            (workshop as { image?: MediaType | string | null }).image ?? null,
          )
          const feats = workshop.features ?? []
          const ratio = visibilities[wIdx] ?? (wIdx === 0 ? 1 : 0)
          const scale = 0.92 + 0.08 * ratio
          const opacity = 0.35 + 0.65 * ratio

          return (
            <div
              key={wIdx}
              ref={(el) => {
                slideRefs.current[wIdx] = el
              }}
              className="snap-center shrink-0 w-screen"
            >
              <div
                className="max-w-5xl mx-auto px-(--space-container-x,1.5rem) flex flex-col min-h-[45vh] sm:min-h-[40vh] lg:min-h-[45vh]"
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                  transformOrigin: 'center top',
                }}
              >
                {/* ── Title ──────────────────────────────── */}
                <h2 className="font-display font-black text-[1.25rem] sm:text-[1.75rem] lg:text-[2rem] xl:text-[2.5rem] leading-[1.05] tracking-tight text-(--ff-near-black,#1a1a1a) dark:text-white mb-0.5">
                  {workshop.title}
                </h2>

                {/* ── Description ────────────────────────── */}
                <p className="font-display font-bold text-xs sm:text-xs lg:text-sm text-(--ff-near-black,#1a1a1a) dark:text-white/80 leading-snug max-w-[55ch]">
                  {workshop.description}
                </p>

                {/* ── Spacer between text & features/image ── */}
                <div className="mt-2.5 sm:mt-3 lg:mt-4" />

                {/* ── Features + Image area ──────────────── */}
                <div className="relative flex-1">
                  {/* Product image — behind the card on sm+ */}
                  <div
                    className={cn(
                      'relative',
                      'sm:absolute sm:right-0 sm:top-0',
                      'sm:z-0',
                      'sm:w-[50%] lg:w-[52%]',
                      'rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden',
                      'aspect-16/10 sm:aspect-auto sm:h-full',
                      'w-full',
                      'mb-4 sm:mb-0',
                    )}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={workshop.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                        <span className="text-neutral-400 font-display text-lg">
                          {workshop.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Numbers + ivory card */}
                  <div className="relative z-10 flex">
                    {/* Numbered labels with lines — tablet+ */}
                    <div className="hidden sm:flex flex-col shrink-0 w-32 lg:w-40 xl:w-44">
                      {feats.map((_, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 h-7 lg:h-9">
                          <span className="font-display text-xs lg:text-sm text-(--ff-near-black,#1a1a1a)/50 dark:text-white/50 shrink-0 tabular-nums">
                            {padIndex(fIdx)}
                          </span>
                          <div className="flex-1 h-px bg-(--ff-near-black,#1a1a1a)/15 dark:bg-white/15" />
                        </div>
                      ))}
                    </div>

                    {/* Ivory feature card */}
                    <div
                      className={cn(
                        'bg-(--ff-ivory,#f9f0dc) relative',
                        'rounded-xl sm:rounded-2xl lg:rounded-3xl',
                        'p-3 sm:p-3.5',
                        'lg:py-4 lg:px-5',
                        'w-full sm:w-auto sm:min-w-52 lg:min-w-64 xl:min-w-72',
                      )}
                    >
                      {feats.map((feature, fIdx) => (
                        <div key={fIdx}>
                          <div className="flex items-center gap-3 sm:gap-0 py-1 lg:py-1.5">
                            {/* Mobile-only number */}
                            <span className="sm:hidden font-display text-xs text-(--ff-near-black,#1a1a1a)/50 dark:text-white/50 shrink-0 w-6 tabular-nums">
                              {padIndex(fIdx)}
                            </span>
                            {/* Feature text */}
                            <span className="font-display font-bold text-xs lg:text-sm text-(--ff-near-black,#1a1a1a) dark:text-white leading-snug">
                              {(feature as { text?: string }).text}
                            </span>
                          </div>
                          {fIdx < feats.length - 1 && (
                            <div className="h-px bg-(--ff-near-black,#1a1a1a)/10 dark:bg-white/10" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ──── Bottom controls ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-(--space-container-x,1.5rem)">
        {/* Progress bar + counter + arrows */}
        <div className="flex items-center gap-6 mt-3 lg:mt-4">
          {/* Progress bar */}
          <div className="flex-1 h-0.75 bg-(--ff-near-black,#1a1a1a)/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-(--ff-near-black,#1a1a1a) dark:bg-white rounded-full transition-all duration-300"
              style={{
                width: `${(1 / total) * 100}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          </div>

          {/* Counter */}
          <span className="font-display text-sm lg:text-base shrink-0">
            <span className="text-(--ff-near-black,#1a1a1a) dark:text-white">
              {activeIndex + 1}/
            </span>
            <span className="text-(--ff-near-black,#1a1a1a)/30 dark:text-white/30 ml-0.5">
              {total}
            </span>
          </span>
        </div>

        {/* Buttons row: prev / + / next  |  All Workshops — same total width */}
        <div className="flex items-center justify-between mt-4 lg:mt-3">
          {/* Prev + "+" + Next — flex-1 each so they share equal width */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous workshop"
              disabled={activeIndex === 0}
              className={cn(
                'w-10 h-10 sm:w-11 sm:h-11 rounded-full border',
                'border-(--ff-near-black,#1a1a1a)/20 dark:border-white/20',
                'flex items-center justify-center transition-all duration-300',
                'text-(--ff-near-black,#1a1a1a) dark:text-white',
                'hover:bg-(--ff-near-black,#1a1a1a)/5 hover:border-(--ff-near-black,#1a1a1a)/40',
                'dark:hover:bg-white/10 dark:hover:border-white/40',
                'disabled:opacity-30 disabled:pointer-events-none',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* "+" detail button */}
            <Link
              href={resolvedWorkshops[activeIndex]?.ctaLink || '#'}
              aria-label={`More about ${resolvedWorkshops[activeIndex]?.title}`}
              className={cn(
                'inline-flex items-center justify-center',
                'w-10 h-10 sm:w-11 sm:h-11 rounded-full',
                'bg-(--ff-charcoal-dark,#403c39) text-(--ff-ivory-mist,#faf2e0)',
                'transition-all duration-300 ease-out',
                'hover:bg-(--ff-ivory-mist,#faf2e0) hover:text-(--ff-charcoal-dark,#403c39) hover:scale-110',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>

            <button
              onClick={handleNext}
              aria-label="Next workshop"
              disabled={activeIndex === total - 1}
              className={cn(
                'w-10 h-10 sm:w-11 sm:h-11 rounded-full border',
                'border-(--ff-near-black,#1a1a1a)/20 dark:border-white/20',
                'flex items-center justify-center transition-all duration-300',
                'text-(--ff-near-black,#1a1a1a) dark:text-white',
                'hover:bg-(--ff-near-black,#1a1a1a)/5 hover:border-(--ff-near-black,#1a1a1a)/40',
                'dark:hover:bg-white/10 dark:hover:border-white/40',
                'disabled:opacity-30 disabled:pointer-events-none',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* "All Workshops" */}
          <Link
            href={resolvedAllWorkshopsLink}
            className={cn(
              'inline-flex items-center justify-center',
              'rounded-full',
              'px-6 py-2.5 text-sm sm:px-7 sm:py-3 lg:text-base lg:px-8 lg:py-3',
              'bg-(--ff-charcoal-dark,#403c39) text-(--ff-ivory-mist,#faf2e0)',
              'font-display font-bold',
              'transition-all duration-300 ease-out',
              'hover:bg-(--ff-ivory-mist,#faf2e0) hover:text-(--ff-charcoal-dark,#403c39) hover:scale-105',
            )}
          >
            {resolvedAllWorkshopsLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
