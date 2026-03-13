'use client'

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS  (English — CMS data always wins)
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_EYEBROW = 'Workshop Experience'

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

type Props = WorkshopSliderBlockType & {
  id?: string
  upcomingLabel?: string
  upcomingDatesByHref?: Record<string, string>
}

function resolveMedia(image: MediaType | string | number | null | undefined): MediaType | null {
  if (!image) return null
  if (typeof image === 'object') return image
  return null
}

/* ═══════════════════════════════════════════════════════════════
 *  COMPONENT
 *
 *  All breakpoints: Sticky-scroll horizontal gallery
 *    · Outer div height = 100svh + horizontal overshoot
 *    · Inner <section> is position:sticky top:0 h-svh overflow:hidden
 *    · window.scroll progress → translateX on the track
 *    · Per-frame lerp (EASE 0.08) + per-image parallax
 *    · Same composition as desktop, scaled responsively
 *    · On mobile the middle image is hidden and CTA text is removed
 * ═══════════════════════════════════════════════════════════════ */

export const WorkshopSliderBlock: React.FC<Props> = ({
  eyebrow,
  workshops,
  id,
  upcomingLabel,
  upcomingDatesByHref,
}) => {
  /* ── refs ──────────────────────────────────────────────────── */
  const outerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgInnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollRef = useRef({ current: 0, target: 0, limit: 0 })
  const rafRef = useRef<number>(0)
  const isActiveRef = useRef(false)

  /* ── merge CMS + defaults ──────────────────────────────────── */
  const resolvedEyebrow = eyebrow || DEFAULT_EYEBROW
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
          nextDate:
            upcomingDatesByHref?.[w.ctaLink || DEFAULT_WORKSHOPS[i]?.ctaLink || ''] || undefined,
        }))
      : DEFAULT_WORKSHOPS.map((w) => ({
          ...w,
          audienceTag: w.audienceTag,
          image: null as MediaType | null,
          image2: null as MediaType | null,
          nextDate: upcomingDatesByHref?.[w.ctaLink],
        }))

  /* ── Sticky scroll + parallax engine (all breakpoints) ─────── */
  useEffect(() => {
    const outer = outerRef.current
    const container = containerRef.current
    if (!outer || !container) return

    const EASE = 0.08
    const MAX_SHIFT = 8

    /* Recalculate outer height and scroll limit */
    const updateDimensions = () => {
      const overshoot = Math.max(0, container.scrollWidth - window.innerWidth)
      isActiveRef.current = overshoot > 0
      outer.style.height = `${window.innerHeight + overshoot}px`
      scrollRef.current.limit = overshoot

      if (!isActiveRef.current) {
        scrollRef.current.target = 0
        scrollRef.current.current = 0
        container.style.transform = 'translateX(0)'
      }
    }

    updateDimensions()

    /* Map vertical page scroll → horizontal translateX target */
    const onScroll = () => {
      if (!isActiveRef.current) return
      const outerTop = outer.getBoundingClientRect().top + window.scrollY
      const overshoot = scrollRef.current.limit
      if (overshoot <= 0) return
      const progress = Math.max(0, Math.min(1, (window.scrollY - outerTop) / overshoot))
      scrollRef.current.target = progress * overshoot
    }

    /* RAF loop — lerp + parallax */
    const tick = () => {
      if (isActiveRef.current) {
        const s = scrollRef.current
        s.current += (s.target - s.current) * EASE
        container.style.transform = `translateX(-${s.current}px)`

        /* Parallax each image inner */
        const vCenter = window.innerWidth * 0.5
        imgInnerRefs.current.forEach((inner) => {
          if (!inner) return
          const outerEl = inner.parentElement
          if (!outerEl) return
          const rect = outerEl.getBoundingClientRect()
          const ec = rect.left + rect.width * 0.5
          const t = Math.max(-1, Math.min(1, (ec - vCenter) / vCenter))
          inner.style.transform = `translate3d(${-t * MAX_SHIFT}%, 0, 0)`
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateDimensions)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  /* ═══════════════════════════════════════════════════════════ */
  /*  RENDER                                                     */
  /* ═══════════════════════════════════════════════════════════ */

  return (
    /* Outer pin div — JS sets height to 100svh + overshoot on lg+ */
    <div
      ref={outerRef}
      id={id ?? undefined}
      className="relative w-full bg-white"
      style={{ minHeight: '100svh' }}
    >
      {/* ── Sticky viewport (always visible while scrolling through outer) */}
      <section
        className="sticky top-0 w-full bg-white overflow-hidden"
        style={{ height: '100svh' }}
      >
        {/* ── Scroll hint ─────────────────────────────────────── */}
        <p className="absolute bottom-6 md:bottom-8 right-[5vw] z-10 text-black/20 text-[10px] md:text-xs font-display tracking-[0.15em] uppercase pointer-events-none select-none">
          scroll →
        </p>

        {/* ══════════════════════════════════════════════════════
         *  RESPONSIVE TRACK — same composition across sizes
         * ══════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 overflow-hidden select-none">
          <div
            ref={containerRef}
            className="flex items-center h-full will-change-transform"
            style={{ gap: 'clamp(0.75rem, 2vw, 1.5rem)', paddingLeft: '5vw', paddingRight: '5vw' }}
          >
            {resolvedWorkshops.map((workshop, wIdx) => {
              const imgAIdx = wIdx * 2
              const imgBIdx = wIdx * 2 + 1
              const secondImg = workshop.image2 ?? workshop.image

              return (
                <React.Fragment key={wIdx}>
                  {/* ── LEFT COLUMN — title on top, small image below ── */}
                  <div
                    className="shrink-0 flex flex-col self-center w-[72vw] sm:w-[20rem] md:w-88 lg:w-85"
                    style={{ height: 'clamp(62svh, 74svh, 78vh)' }}
                  >
                    <div className="shrink-0 pb-4 md:pb-5 w-full">
                      <FadeIn>
                        <p
                          className="text-eyebrow font-bold mb-2 md:mb-3 text-[10px] md:text-inherit tracking-[0.18em] uppercase"
                          style={{ color: 'var(--ff-gold)' }}
                        >
                          {resolvedEyebrow}
                        </p>
                        <h2 className="text-ff-black mb-3 md:mb-4 text-[1.9rem] sm:text-[2.2rem] md:text-[2.5rem] lg:text-inherit leading-[0.95]">
                          {workshop.title}
                        </h2>
                        <p className="text-body-sm text-ff-olive text-[13px] sm:text-sm md:text-[15px] leading-relaxed">
                          {(() => {
                            const match = workshop.description.match(/^(.+?[.!?])\s*(.*)$/s)
                            return match?.[1] ?? workshop.description
                          })()}
                        </p>
                      </FadeIn>
                    </div>

                    {/* Small image — fills remaining height */}
                    <div
                      className="relative overflow-hidden rounded-2xl"
                      style={{ flex: 1, aspectRatio: '4 / 3', minHeight: 0 }}
                    >
                      <div
                        ref={(el) => {
                          imgInnerRefs.current[imgBIdx] = el
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

                  {/* ── BIG IMAGE ───────────────────────────────────── */}
                  <div
                    className="relative shrink-0 overflow-hidden self-center hidden sm:block rounded-2xl"
                    style={{ aspectRatio: '3 / 4', height: 'clamp(52svh, 62svh, 68vh)' }}
                  >
                    <div
                      ref={(el) => {
                        imgInnerRefs.current[imgAIdx] = el
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

                  {/* ── DETAILS CARD ────────────────────────────────── */}
                  <div
                    className="shrink-0 relative flex flex-col justify-between self-center rounded-2xl"
                    style={{
                      width: 'clamp(220px, 24vw, 280px)',
                      padding: 'clamp(1.25rem, 2.2vw, 2rem)',
                      background: 'rgba(255,255,255,0.5)',
                      backdropFilter: 'blur(18px)',
                      WebkitBackdropFilter: 'blur(18px)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
                    }}
                  >
                    {workshop.nextDate ? (
                      <div className="mb-4 pb-3 border-b border-black/10">
                        <p className="text-[10px] font-display font-bold tracking-widest uppercase text-black/45 mb-1">
                          {upcomingLabel || 'Upcoming'}
                        </p>
                        <p className="text-sm md:text-base font-display font-bold text-black/85">
                          {workshop.nextDate}
                        </p>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {workshop.features.map((feature, fIdx) => (
                        <p
                          key={fIdx}
                          className="text-black/70 font-display font-bold text-[11px] md:text-xs leading-relaxed flex gap-3"
                        >
                          <span className="tabular-nums shrink-0 font-bold">
                            {String(fIdx + 1).padStart(2, '0')}
                          </span>
                          {(feature as { text?: string }).text}
                        </p>
                      ))}
                    </div>

                    {/* ── CTA link — text + circle "+" ─────────────── */}
                    <div className="mt-6 pt-4 border-t border-black/10">
                      <Link
                        href={workshop.ctaLink}
                        className="flex items-center justify-end sm:justify-between group/cta"
                        aria-label={`Workshop Seite: ${workshop.title}`}
                      >
                        <span className="hidden sm:block text-[11px] font-display font-bold tracking-widest uppercase text-black/40 group-hover/cta:text-black transition-colors duration-200">
                          Entdecken
                        </span>
                        <span className="size-9 rounded-full border border-black/25 flex items-center justify-center text-base leading-none text-black/35 transition-all duration-200 group-hover/cta:border-black group-hover/cta:text-black group-hover/cta:scale-110">
                          +
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* ── Gap between workshop groups ─────────────────── */}
                  {wIdx < resolvedWorkshops.length - 1 && (
                    <div className="shrink-0" style={{ width: 'clamp(1rem, 4vw, 4vw)' }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
