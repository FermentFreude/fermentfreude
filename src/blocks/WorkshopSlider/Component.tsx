'use client'

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS  (English — CMS data always wins)
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_EYEBROW = 'Experience'
const DEFAULT_SECTION_HEADING = 'Workshops'
const DEFAULT_ALL_WORKSHOPS_LABEL = 'See All Workshops'
const DEFAULT_ALL_WORKSHOPS_LINK = '/workshops'
const DEFAULT_DETAILS_LABEL = 'Workshop Details'

const DEFAULT_WORKSHOPS = [
  {
    title: 'Lakto-Gemüse',
    audienceTag: 'For Chefs and Food Professionals',
    description:
      'Fermenting vegetables, experiencing different flavours every month. Have leftover seasonal vegetables? Transform them into real taste sensations.',
    features: [
      { text: 'Duration: approx. 3 hours' },
      { text: 'For everyone from beginner to pro.' },
      { text: 'Ingredients, jars, and spices are all provided.' },
      { text: 'Take all the jars home with you afterward.' },
    ],
    ctaLink: '/workshops/lakto-gemuese',
  },
  {
    title: 'Kombucha',
    audienceTag: 'For Chefs and Food Professionals',
    description:
      'Fermenting tea, creating balanced flavours with every brew. Curious how kombucha becomes naturally fizzy, fresh, and complex?',
    features: [
      { text: 'Duration: approx. 3 hours' },
      { text: 'For everyone from beginner to pro.' },
      { text: 'Tea, bottles, and flavourings are all provided.' },
      { text: 'Take home your own brewed kombucha.' },
    ],
    ctaLink: '/workshops/kombucha',
  },
  {
    title: 'Tempeh',
    audienceTag: 'For Chefs and Food Professionals',
    description:
      'From beans to tempeh — texture, taste, and technique. Learn how this traditional fermentation becomes a versatile, healthy protein.',
    features: [
      { text: 'Duration: approx. 3 hours' },
      { text: 'Suitable for home cooks and professionals.' },
      { text: 'Beans, starter cultures, and all are provided.' },
      { text: 'Take home freshly made tempeh.' },
    ],
    ctaLink: '/workshops/tempeh',
  },
]

/* ═══════════════════════════════════════════════════════════════ */

type Props = WorkshopSliderBlockType & { id?: string }

function resolveMedia(image: MediaType | string | number | null | undefined): MediaType | null {
  if (!image) return null
  if (typeof image === 'object') return image
  return null
}

/* ═══════════════════════════════════════════════════════════════
 *  COMPONENT
 *
 *  DOM parallax gallery — exact Codrops approach:
 *    · Wheel events drive a lerp'd horizontal scroll value
 *    · Container translateX(-scroll px)
 *    · Each image inner div is 125% wide, left: -12.5% (headroom)
 *    · Per-frame: t = (elementCenter - viewportCenter) / viewportCenter
 *    · Image shifts: translate3d(-t * 10%, 0, 0)  → counter-motion
 *
 *  Layout per workshop  [IMG-A 60vh]  [IMG-B 50vh offset]  [CARD]
 *  Touch drag support included for mobile.
 * ═══════════════════════════════════════════════════════════════ */

export const WorkshopSliderBlock: React.FC<Props> = ({
  eyebrow: _eyebrow,
  workshops,
  allWorkshopsButtonLabel,
  allWorkshopsLink,
  id,
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgInnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [runwayHeight, setRunwayHeight] = useState('100vh')

  /* ── merge CMS + defaults ──────────────────────────────────── */
  const resolvedAllLabel = allWorkshopsButtonLabel || DEFAULT_ALL_WORKSHOPS_LABEL
  const resolvedAllLink = allWorkshopsLink || DEFAULT_ALL_WORKSHOPS_LINK
  const resolvedWorkshops =
    workshops && workshops.length > 0
      ? workshops.map((w, i) => ({
          title: w.title || DEFAULT_WORKSHOPS[i]?.title || `Workshop ${i + 1}`,
          audienceTag:
            (w as { audienceTag?: string }).audienceTag || DEFAULT_WORKSHOPS[i]?.audienceTag || '',
          description: w.description || DEFAULT_WORKSHOPS[i]?.description || '',
          features:
            w.features && w.features.length > 0
              ? w.features
              : (DEFAULT_WORKSHOPS[i]?.features ?? []),
          image: resolveMedia(w.image as MediaType | string | number | null | undefined),
          image2: resolveMedia(w.image2 as MediaType | string | number | null | undefined),
          ctaLink: w.ctaLink || DEFAULT_WORKSHOPS[i]?.ctaLink || '#',
          detailsLabel:
            (w as { detailsButtonLabel?: string }).detailsButtonLabel || DEFAULT_DETAILS_LABEL,
        }))
      : DEFAULT_WORKSHOPS.map((w) => ({
          ...w,
          audienceTag: w.audienceTag,
          image: null as MediaType | null,
          image2: null as MediaType | null,
          detailsLabel: DEFAULT_DETAILS_LABEL,
        }))

  /* ── Scroll-driven horizontal gallery ─────────────────────── */
  useEffect(() => {
    const section = sectionRef.current
    const container = containerRef.current
    if (!section || !container) return

    const MAX_SHIFT = 10

    /* Calculate how much horizontal overflow the track has */
    const calcRunway = () => {
      const scrollableWidth = Math.max(0, container.scrollWidth - window.innerWidth)
      /* Section height = 1 viewport (sticky area) + scrollable distance + extra buffer
         so the last workshop is fully visible before the sticky releases */
      setRunwayHeight(`${window.innerHeight + scrollableWidth + window.innerHeight * 0.8}px`)
    }
    calcRunway()

    const onScroll = () => {
      if (!section || !container) return
      const rect = section.getBoundingClientRect()
      const scrollableWidth = Math.max(0, container.scrollWidth - window.innerWidth)
      if (scrollableWidth <= 0) return

      /* How far into the section we've scrolled (0 → scrollableWidth) */
      const progress = Math.max(0, Math.min(scrollableWidth, -rect.top))
      container.style.transform = `translateX(-${progress}px)`

      /* Parallax each image */
      const vCenter = window.innerWidth * 0.5
      imgInnerRefs.current.forEach((inner) => {
        if (!inner) return
        const outer = inner.parentElement
        if (!outer) return
        const outerRect = outer.getBoundingClientRect()
        const ec = outerRect.left + outerRect.width * 0.5
        const t = Math.max(-1, Math.min(1, (ec - vCenter) / vCenter))
        inner.style.transform = `translate3d(${-t * MAX_SHIFT}%, 0, 0)`
      })
    }

    window.addEventListener('resize', calcRunway)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('resize', calcRunway)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  /* ═══════════════════════════════════════════════════════════ */
  /*  RENDER                                                    */
  /* ═══════════════════════════════════════════════════════════ */

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className="relative w-full bg-white"
      style={{ height: runwayHeight }}
    >
      {/* Sticky container — pins the gallery in viewport */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-svh flex flex-col justify-center overflow-hidden"
      >
        {/* ── Section heading (left-aligned) ────────────── */}
        <div className="w-full pb-6 lg:pb-8" style={{ paddingLeft: '5vw', paddingRight: '5vw' }}>
          <FadeIn>
            <div className="flex items-start gap-3">
              <h2
                className="font-display font-black"
                style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  color: '#000',
                }}
              >
                {DEFAULT_SECTION_HEADING}
              </h2>
              <span
                className="text-eyebrow font-bold text-ff-gold-accent shrink-0"
                style={{ marginTop: '0.35em' }}
              >
                {DEFAULT_EYEBROW}
              </span>
            </div>
          </FadeIn>
        </div>

        {/* ── Gallery area ──────────────────────────────── */}
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0 overflow-hidden select-none">
            <div
              ref={containerRef}
              className="flex items-center h-full will-change-transform"
              style={{ gap: 0 }}
            >
              {resolvedWorkshops.map((workshop, wIdx) => {
                const imgARef = wIdx * 2
                const imgBRef = wIdx * 2 + 1
                const secondImg = workshop.image2 ?? workshop.image

                return (
                  <div
                    key={wIdx}
                    data-workshop-group
                    className="shrink-0 flex items-center justify-center"
                    style={{ width: '85vw', gap: 'clamp(0.75rem, 1.5vw, 1.5rem)', paddingLeft: '3vw', paddingRight: '3vw' }}
                  >
                    {/* ── LEFT COLUMN — title + small image ── */}
                    <div
                      className="shrink-0 flex flex-col self-center"
                      style={{ height: 'clamp(40vh, 55vh, 70vh)', width: 'auto' }}
                    >
                      <div
                        className="shrink-0 pb-4 lg:pb-5"
                        style={{ width: 'clamp(180px, 22vw, 340px)' }}
                      >
                        <FadeIn>
                          <h3
                            className="font-display font-black text-ff-black mb-3 lg:mb-4"
                            style={{
                              fontSize: 'clamp(1.35rem, 2.5vw, 2.75rem)',
                              lineHeight: 1.1,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {workshop.title}
                          </h3>
                          <p
                            className="text-body-sm text-ff-olive"
                            style={{ fontSize: 'clamp(0.75rem, 1vw, 0.9rem)' }}
                          >
                            {(() => {
                              const match = workshop.description.match(/^(.+?[.!?])\s*(.*)$/s)
                              return match?.[1] ?? workshop.description
                            })()}
                          </p>
                        </FadeIn>
                      </div>

                      {/* Small image */}
                      <div
                        className="relative overflow-hidden rounded-xl lg:rounded-2xl"
                        style={{ flex: 1, aspectRatio: '4 / 3', minHeight: 0 }}
                      >
                        <div
                          ref={(el) => {
                            imgInnerRefs.current[imgBRef] = el
                          }}
                          className="absolute top-0 h-full will-change-transform"
                          style={{ left: '-12.5%', width: '125%' }}
                        >
                          {secondImg ? (
                            <Media
                              resource={secondImg}
                              fill
                              imgClassName="object-cover"
                              className="absolute inset-0"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#e0e0e0]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── BIG IMAGE ──────────────────────────── */}
                    <div
                      className="relative shrink-0 overflow-hidden self-center rounded-xl lg:rounded-2xl"
                      style={{ aspectRatio: '3 / 4', height: 'clamp(35vh, 50vh, 62vh)' }}
                    >
                      <div
                        ref={(el) => {
                          imgInnerRefs.current[imgARef] = el
                        }}
                        className="absolute top-0 h-full will-change-transform"
                        style={{ left: '-12.5%', width: '125%' }}
                      >
                        {workshop.image ? (
                          <Media
                            resource={workshop.image}
                            fill
                            imgClassName="object-cover"
                            className="absolute inset-0"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#141414]" />
                        )}
                      </div>
                    </div>

                    {/* ── DETAILS CARD ── */}
                    <div
                      className="shrink-0 relative flex flex-col justify-between self-center rounded-xl lg:rounded-2xl"
                      style={{
                        width: 'clamp(200px, 18vw, 280px)',
                        padding: 'clamp(1.25rem, 2vw, 2rem)',
                        background: 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {workshop.features.map((feature, fIdx) => (
                          <p
                            key={fIdx}
                            className="text-black/70 font-display font-bold leading-relaxed flex gap-2 lg:gap-3"
                            style={{ fontSize: 'clamp(0.65rem, 0.8vw, 0.75rem)' }}
                          >
                            <span className="tabular-nums shrink-0 font-bold">
                              {String(fIdx + 1).padStart(2, '0')}
                            </span>
                            {(feature as { text?: string }).text}
                          </p>
                        ))}
                      </div>
                      <div className="flex justify-end mt-4 lg:mt-6">
                        <Link
                          href={workshop.ctaLink}
                          aria-label={`${workshop.detailsLabel} – ${workshop.title}`}
                          className="group inline-flex items-center gap-2 font-display font-bold tracking-wide uppercase text-black/60 transition-colors duration-200 hover:text-black"
                          style={{ fontSize: 'clamp(0.6rem, 0.75vw, 0.75rem)' }}
                        >
                          <span>{workshop.detailsLabel}</span>
                          <span className="size-7 lg:size-8 rounded-full border border-current flex items-center justify-center transition-all duration-200 group-hover:bg-black group-hover:text-white group-hover:border-black group-hover:scale-110">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── All Workshops button (right-aligned below gallery) ── */}
        <div
          className="w-full flex justify-end py-5 lg:py-6"
          style={{ paddingLeft: '5vw', paddingRight: '5vw' }}
        >
          <Link
            href={resolvedAllLink}
            className="font-display font-bold uppercase border border-black text-black bg-transparent transition-all duration-200 hover:bg-black hover:text-white"
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: '2rem',
              fontSize: 'clamp(0.75rem, 1vw, 0.95rem)',
              letterSpacing: '0.05em',
            }}
          >
            {resolvedAllLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
