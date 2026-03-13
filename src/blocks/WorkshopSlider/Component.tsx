'use client'

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
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

export const WorkshopSliderBlock: React.FC<Props> = ({ eyebrow, workshops, id }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  /* Refs to INNER divs of images only (not info-cards) */
  const imgInnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollRef = useRef({ current: 0, target: 0, limit: 0 })
  const rafRef = useRef<number>(0)
  const touchXRef = useRef(0)

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
        }))
      : DEFAULT_WORKSHOPS.map((w) => ({
          ...w,
          audienceTag: w.audienceTag,
          image: null as MediaType | null,
          image2: null as MediaType | null,
        }))

  /* ── Codrops DOM scroll + parallax engine ─────────────────── */
  useEffect(() => {
    const section = sectionRef.current
    const wrapper = wrapperRef.current
    const container = containerRef.current
    if (!section || !wrapper || !container) return

    const EASE = 0.07
    const MAX_SHIFT = 10 // % of image width

    const setLimit = () => {
      scrollRef.current.limit = Math.max(0, container.scrollWidth - wrapper.clientWidth)
    }
    setLimit()

    /* Wheel — captured only when gallery has room to scroll */
    const onWheel = (e: WheelEvent) => {
      const s = scrollRef.current
      const next = s.target + e.deltaY
      /* At the edges let the page scroll through */
      if ((e.deltaY < 0 && s.target <= 0) || (e.deltaY > 0 && s.target >= s.limit)) {
        return
      }
      e.preventDefault()
      s.target = Math.max(0, Math.min(s.limit, next))
    }

    /* Touch drag */
    const onTouchStart = (e: TouchEvent) => {
      touchXRef.current = e.touches[0].clientX
    }
    const onTouchMove = (e: TouchEvent) => {
      const delta = touchXRef.current - e.touches[0].clientX
      touchXRef.current = e.touches[0].clientX
      scrollRef.current.target = Math.max(
        0,
        Math.min(scrollRef.current.limit, scrollRef.current.target + delta),
      )
    }

    /* RAF loop — lerp + parallax */
    const tick = () => {
      const s = scrollRef.current
      s.current += (s.target - s.current) * EASE

      /* Move gallery */
      container.style.transform = `translateX(-${s.current}px)`

      /* Parallax each image inner */
      const vCenter = window.innerWidth * 0.5
      imgInnerRefs.current.forEach((inner) => {
        if (!inner) return
        const outer = inner.parentElement
        if (!outer) return
        const rect = outer.getBoundingClientRect()
        const ec = rect.left + rect.width * 0.5
        const t = Math.max(-1, Math.min(1, (ec - vCenter) / vCenter))
        inner.style.transform = `translate3d(${-t * MAX_SHIFT}%, 0, 0)`
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    window.addEventListener('resize', setLimit)
    section.addEventListener('wheel', onWheel, { passive: false })
    wrapper.addEventListener('touchstart', onTouchStart, { passive: true })
    wrapper.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', setLimit)
      section.removeEventListener('wheel', onWheel)
      wrapper.removeEventListener('touchstart', onTouchStart)
      wrapper.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  /* ═══════════════════════════════════════════════════════════ */
  /*  RENDER                                                    */
  /* ═══════════════════════════════════════════════════════════ */

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className="relative w-full overflow-hidden bg-white"
      style={{ height: '100svh' }}
    >
      {/* ── Scroll hint ─────────────────────────────────────── */}
      <p className="absolute bottom-8 right-[5vw] z-10 text-black/20 text-xs font-display tracking-[0.15em] uppercase pointer-events-none select-none">
        scroll →
      </p>

      {/* ── Gallery wrapper (overflow:hidden clips the track) ── */}
      <div ref={wrapperRef} className="absolute inset-0 overflow-hidden select-none">
        {/* ── Scrolling track ──────────────────────────────── */}
        <div
          ref={containerRef}
          className="flex items-center h-full will-change-transform"
          style={{ gap: '1.5rem', paddingLeft: '5vw', paddingRight: '5vw' }}
        >
          {resolvedWorkshops.map((workshop, wIdx) => {
            const imgARef = wIdx * 2
            const imgBRef = wIdx * 2 + 1
            const secondImg = workshop.image2 ?? workshop.image

            return (
              <React.Fragment key={wIdx}>
                {/* ── LEFT COLUMN — title on top, small image below ── */}
                <div
                  className="shrink-0 flex flex-col self-center"
                  style={{ height: '78vh', width: 'auto' }}
                >
                  {/* Eyebrow + title + subtitle */}
                  <div className="shrink-0 pb-5 w-85">
                    <FadeIn>
                      <p className="text-eyebrow font-bold text-ff-gold-accent mb-3">
                        {resolvedEyebrow}
                      </p>
                      <h2 className="text-ff-black mb-4">{workshop.title}</h2>
                      <p className="text-body-sm text-ff-olive">
                        {(() => {
                          const match = workshop.description.match(/^(.+?[.!?])\s*(.*)$/s)
                          return match?.[1] ?? workshop.description
                        })()}
                      </p>
                    </FadeIn>
                  </div>

                  {/* Small image — fills remaining height */}
                  <div
                    className="relative overflow-hidden"
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

                {/* ── BIG IMAGE — right ──────────────────────────────── */}
                <div
                  className="relative shrink-0 overflow-hidden self-center"
                  style={{ aspectRatio: '3 / 4', height: '68vh' }}
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

                {/* ── DETAILS CARD — glassmorphism, features only ── */}
                <div
                  className="shrink-0 relative flex flex-col justify-between self-center"
                  style={{
                    width: '280px',
                    padding: '2rem',
                    background: 'rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {workshop.features.map((feature, fIdx) => (
                      <p
                        key={fIdx}
                        className="text-black/70 font-display font-bold text-xs leading-relaxed flex gap-3"
                      >
                        <span className="tabular-nums shrink-0 font-bold">
                          {String(fIdx + 1).padStart(2, '0')}
                        </span>
                        {(feature as { text?: string }).text}
                      </p>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      aria-label={`View details for ${workshop.title}`}
                      className="size-10 rounded-full border border-black/30 flex items-center justify-center text-black/40 text-lg leading-none transition-all duration-200 hover:border-black hover:text-black hover:scale-110 bg-transparent cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ── Gap between workshop groups ─────────── */}
                {wIdx < resolvedWorkshops.length - 1 && (
                  <div className="shrink-0" style={{ width: '4vw' }} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
