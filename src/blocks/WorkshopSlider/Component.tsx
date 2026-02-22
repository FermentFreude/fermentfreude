'use client'

import { Media } from '@/components/Media'
import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
import { cn } from '@/utilities/cn'
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
    title: 'Lakto-Gemüse',
    theme: 'light' as const,
    description:
      'Fermenting vegetables, experiencing different flavours every month.\nDo you have leftover seasonal vegetables and want to transform them into real taste sensations?',
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
    theme: 'dark' as const,
    description:
      'Fermenting tea, creating balanced flavours with every brew.\nCurious how kombucha becomes naturally fizzy, fresh, and complex?',
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
    theme: 'dark' as const,
    description:
      'From beans to tempeh, understanding texture, taste, and technique.\nLearn how this traditional fermentation becomes a versatile, healthy protein.',
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

const DEFAULT_ALL_WORKSHOPS_BUTTON_LABEL = 'All Workshops'
const DEFAULT_ALL_WORKSHOPS_LINK = '/workshops'

/* ═══════════════════════════════════════════════════════════════ */

type Props = WorkshopSliderBlockType & {
  id?: string
}

/** Format index as zero-padded number (e.g. 0 → "01") */
function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0')
}

/** Resolve Payload media field to an object (or null) */
function resolveMedia(image: MediaType | string | number | null | undefined): MediaType | null {
  if (!image) return null
  if (typeof image === 'object') return image
  return null
}

/* ── Theme colour maps ─────────────────────────────────────── */
const themeStyles = {
  light: {
    titleColor: 'text-black',
    descColor: 'text-[#1A1A1A]',
    cardBg: 'bg-[var(--ff-ivory-mist,#FAF2E0)]',
    cardText: 'text-black',
    cardDivider: 'border-black',
    stepNumColor: 'text-[#C1C1C1]',
    stepLineColor: 'border-[#C1C1C1]',
    arrowBg: 'bg-[var(--ff-ivory-mist,#FCF4EA)]',
    arrowIcon: 'text-[#C1C1C1]',
  },
  dark: {
    titleColor: 'text-[#555954]',
    descColor: 'text-[#4B4B4B]',
    cardBg: 'bg-[#4B4B4B]',
    cardText: 'text-[#FCF4EA]',
    cardDivider: 'border-[#FCF4EA]',
    stepNumColor: 'text-[#351C0B]',
    stepLineColor: 'border-[#351C0B]',
    arrowBg: 'bg-[#4B4B4B]',
    arrowIcon: 'text-[#E6BE68]',
  },
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
          theme: (w.theme as 'light' | 'dark') || DEFAULT_WORKSHOPS[i]?.theme || 'light',
          features:
            w.features && w.features.length > 0 ? w.features : DEFAULT_WORKSHOPS[i]?.features || [],
          image: resolveMedia(w.image as MediaType | string | number | null | undefined),
          ctaLink: w.ctaLink || DEFAULT_WORKSHOPS[i]?.ctaLink || '#',
          detailsButtonLabel:
            w.detailsButtonLabel || DEFAULT_WORKSHOPS[i]?.detailsButtonLabel || 'Workshop Details',
        }))
      : DEFAULT_WORKSHOPS.map((w) => ({ ...w, image: null as MediaType | null }))

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
    <section id={id ?? undefined} className="w-full section-padding-sm">
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
          const feats = workshop.features ?? []
          const ratio = visibilities[wIdx] ?? (wIdx === 0 ? 1 : 0)
          const scale = 0.92 + 0.08 * ratio
          const opacity = 0.35 + 0.65 * ratio
          const t = themeStyles[workshop.theme] ?? themeStyles.light

          return (
            <div
              key={wIdx}
              ref={(el) => {
                slideRefs.current[wIdx] = el
              }}
              className="snap-center shrink-0 w-screen"
            >
              <div
                className="max-w-369 mx-auto px-(--space-container-x,1.5rem) flex flex-col gap-6 lg:gap-8"
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                  transformOrigin: 'center top',
                }}
              >
                {/* ── Eyebrow ─────────────────────────────── */}
                <span className="text-(--ff-gold-accent,#E5B765) font-display font-black text-lg lg:text-[1.75rem] leading-snug">
                  {resolvedEyebrow}
                </span>

                {/* ── Counter ─────────────────────────────── */}
                <span className="font-sans text-base lg:text-xl tabular-nums self-end -mt-12 lg:-mt-14">
                  <span className="text-[#351C0B]">{activeIndex + 1}/ </span>
                  <span className="text-[#351C0B]/30">{total}</span>
                </span>

                {/* ── Title + Description ─────────────────── */}
                <div className="flex flex-col">
                  <h2
                    className={cn(
                      'font-display font-black leading-[1.2] tracking-tight',
                      'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem]',
                      t.titleColor,
                    )}
                  >
                    {workshop.title}
                  </h2>
                  <p
                    className={cn(
                      'font-display font-bold text-base sm:text-lg lg:text-2xl',
                      'leading-relaxed max-w-[55ch] whitespace-pre-line mt-2 lg:mt-4',
                      workshop.theme === 'light' ? 'font-bold' : 'font-medium',
                      t.descColor,
                    )}
                  >
                    {workshop.description}
                  </p>
                </div>

                {/* ── Image + Features layout ────────────────── */}
                <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
                  {/* Image with nav button overlay */}
                  <div className="relative w-full lg:w-[60%] aspect-879/495 rounded-2xl lg:rounded-3xl overflow-hidden shrink-0">
                    {workshop.image ? (
                      <Media
                        resource={workshop.image}
                        fill
                        imgClassName="object-cover"
                        className="absolute inset-0"
                      />
                    ) : (
                      <div className="w-full h-full bg-(--ff-warm-gray,#ECE5DE) flex items-center justify-center">
                        <span className="text-(--ff-charcoal,#4b4b4b) font-display text-lg">
                          {workshop.title}
                        </span>
                      </div>
                    )}

                    {/* Circular nav arrow overlaying the image */}
                    <button
                      onClick={handleNext}
                      disabled={activeIndex === total - 1}
                      aria-label="Next workshop"
                      className={cn(
                        'absolute bottom-4 left-1/2 -translate-x-1/2',
                        'w-14 h-14 lg:w-17.5 lg:h-17.5 rounded-full',
                        'flex items-center justify-center',
                        'transition-all duration-300',
                        'disabled:opacity-30 disabled:pointer-events-none',
                        t.arrowBg,
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={cn('w-4 h-4 lg:w-5 lg:h-5', t.arrowIcon)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Numbers + Feature card */}
                  <div className="flex items-start gap-3 lg:gap-5 w-full lg:w-auto">
                    {/* Numbered step indicators — hidden on mobile */}
                    <div className="hidden sm:flex flex-col items-end shrink-0 pt-16 lg:pt-25">
                      {feats.map((_, fIdx) => (
                        <React.Fragment key={fIdx}>
                          <span
                            className={cn(
                              'font-display font-bold text-base lg:text-xl tabular-nums py-2 lg:py-3',
                              t.stepNumColor,
                            )}
                          >
                            {padIndex(fIdx)}
                          </span>
                          {fIdx < feats.length - 1 && (
                            <div
                              className={cn('w-48.25 border-t', t.stepLineColor)}
                              style={{ borderWidth: '0.84px' }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Feature card */}
                    <div
                      className={cn(
                        'rounded-[42px] backdrop-blur-sm',
                        'px-6 sm:px-8 lg:px-11 py-12 sm:py-16 lg:py-25',
                        'w-full sm:w-auto sm:min-w-[320px] lg:min-w-100 xl:min-w-140.25',
                        'flex flex-col items-center justify-center gap-2.5',
                        t.cardBg,
                      )}
                    >
                      {feats.map((feature, fIdx) => (
                        <React.Fragment key={fIdx}>
                          {/* Divider line */}
                          <div
                            className={cn('w-full max-w-119.25 border-t', t.cardDivider)}
                            style={{ borderWidth: '0.84px' }}
                          />
                          {/* Feature text */}
                          <p
                            className={cn(
                              'w-full max-w-119.25 font-display font-bold text-base lg:text-xl leading-relaxed',
                              t.cardText,
                            )}
                          >
                            {/* Mobile-only number prefix */}
                            <span className="sm:hidden text-xs opacity-50 mr-2 tabular-nums">
                              {padIndex(fIdx)}
                            </span>
                            {(feature as { text?: string }).text}
                          </p>
                        </React.Fragment>
                      ))}
                      {/* Final divider */}
                      {feats.length > 0 && (
                        <div
                          className={cn('w-full max-w-119.25 border-t', t.cardDivider)}
                          style={{ borderWidth: '0.84px' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ──── Bottom controls ─────────────────────────────────── */}
      <div className="max-w-369 mx-auto px-(--space-container-x,1.5rem)">
        {/* Progress bar */}
        <div className="flex items-center gap-6 mt-6 lg:mt-8">
          <div className="flex-1 h-0.75 bg-(--ff-near-black,#1a1a1a)/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-(--ff-near-black,#1a1a1a) rounded-full transition-all duration-300"
              style={{
                width: `${(1 / total) * 100}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* Navigation + CTA row */}
        <div className="flex items-center justify-between mt-5 lg:mt-6">
          {/* Prev / "+" / Next */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous workshop"
              disabled={activeIndex === 0}
              className={cn(
                'w-10 h-10 sm:w-11 sm:h-11 rounded-full border',
                'border-(--ff-near-black,#1a1a1a)/20',
                'flex items-center justify-center transition-all duration-300',
                'text-(--ff-near-black,#1a1a1a)',
                'hover:bg-(--ff-near-black,#1a1a1a)/5 hover:border-(--ff-near-black,#1a1a1a)/40',
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
                'border-(--ff-near-black,#1a1a1a)/20',
                'flex items-center justify-center transition-all duration-300',
                'text-(--ff-near-black,#1a1a1a)',
                'hover:bg-(--ff-near-black,#1a1a1a)/5 hover:border-(--ff-near-black,#1a1a1a)/40',
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
              'px-6 py-2.5 text-base',
              'bg-(--ff-charcoal-dark,#403c39) text-(--ff-ivory-mist,#faf2e0)',
              'font-display font-bold',
              'transition-all duration-300 ease-out',
              'hover:bg-(--ff-ivory-mist,#faf2e0) hover:text-(--ff-charcoal-dark,#403c39) hover:scale-[1.03] active:scale-[0.97]',
            )}
          >
            {resolvedAllWorkshopsLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
