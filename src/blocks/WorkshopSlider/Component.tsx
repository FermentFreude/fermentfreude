'use client'

import { Media } from '@/components/Media'
import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
import { cn } from '@/utilities/cn'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React, { useCallback, useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS (English)
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

/* ═══════════════════════════════════════════════════════════════ */

type Props = WorkshopSliderBlockType & { id?: string }

/** Zero-padded index string (0 → "01") */
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
    cardDivider: 'border-black/15',
  },
  dark: {
    titleColor: 'text-[#555954]',
    descColor: 'text-[#4B4B4B]',
    cardBg: 'bg-[#4B4B4B]',
    cardText: 'text-[#FCF4EA]',
    cardDivider: 'border-[#FCF4EA]/20',
  },
}

/* ═══════════════════════════════════════════════════════════════
 *  COMPONENT
 *
 *  Desktop (lg+): GSAP-pinned horizontal parallax scroll.
 *    Vertical page scroll drives horizontal panel movement.
 *    Each workshop image has an independent parallax offset.
 *    (Codrops "Smooth Horizontal Parallax Gallery" style)
 *
 *  Mobile: panels stack vertically, natural scroll, no pinning.
 * ═══════════════════════════════════════════════════════════════ */

export const WorkshopSliderBlock: React.FC<Props> = ({
  eyebrow,
  workshops,
  id,
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const imageInnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  /* ── Merge CMS data with defaults ────────────────────────── */
  const resolvedEyebrow = eyebrow || DEFAULT_EYEBROW
  const resolvedWorkshops =
    workshops && workshops.length > 0
      ? workshops.map((w, i) => ({
          title: w.title || DEFAULT_WORKSHOPS[i]?.title || `Workshop ${i + 1}`,
          description: w.description || DEFAULT_WORKSHOPS[i]?.description || '',
          theme: (w.theme as 'light' | 'dark') || DEFAULT_WORKSHOPS[i]?.theme || 'light',
          features:
            w.features && w.features.length > 0
              ? w.features
              : DEFAULT_WORKSHOPS[i]?.features || [],
          image: resolveMedia(w.image as MediaType | string | number | null | undefined),
          ctaLink: w.ctaLink || DEFAULT_WORKSHOPS[i]?.ctaLink || '#',
        }))
      : DEFAULT_WORKSHOPS.map((w) => ({ ...w, image: null as MediaType | null }))

  const total = resolvedWorkshops.length

  /* ── GSAP horizontal parallax scroll (desktop only) ──────── */
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const totalScroll = track.scrollWidth - window.innerWidth

      /* Main horizontal scroll tween, scrubbed by vertical scroll */
      const scrollTween = gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 0.6,
          end: () => `+=${totalScroll}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress(self.progress)
            const idx = Math.min(
              total - 1,
              Math.round(self.progress * (total - 1)),
            )
            setActiveIndex(idx)
          },
        },
      })

      scrollTriggerRef.current = scrollTween.scrollTrigger ?? null

      /* Parallax offset on each image (Codrops-style) */
      imageInnerRefs.current.forEach((img, i) => {
        if (!img || !panelRefs.current[i]) return
        gsap.fromTo(
          img,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: panelRefs.current[i]!,
              containerAnimation: scrollTween,
              scrub: true,
              start: 'left right',
              end: 'right left',
            },
          },
        )
      })

      /* Fade-in text per panel */
      panelRefs.current.forEach((panel) => {
        if (!panel) return
        const texts = panel.querySelectorAll('[data-anim="fade"]')
        gsap.fromTo(
          texts,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            ease: 'power3.out',
            duration: 0.8,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: 'left 80%',
              end: 'left 30%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })
    })

    return () => {
      mm.revert()
      scrollTriggerRef.current = null
    }
  }, [total])

  /* ── Navigate via arrows ─────────────────────────────────── */
  const scrollToWorkshop = useCallback(
    (index: number) => {
      const st = scrollTriggerRef.current
      if (!st) return
      const clamped = Math.max(0, Math.min(index, total - 1))
      const targetProgress = clamped / Math.max(1, total - 1)
      const targetScroll = st.start + (st.end - st.start) * targetProgress
      window.scrollTo({ top: targetScroll, behavior: 'smooth' })
    },
    [total],
  )

  const handlePrev = useCallback(
    () => scrollToWorkshop(activeIndex - 1),
    [activeIndex, scrollToWorkshop],
  )
  const handleNext = useCallback(
    () => scrollToWorkshop(activeIndex + 1),
    [activeIndex, scrollToWorkshop],
  )

  /* ═══════════════════════════════════════════════════════════ */
  /*  RENDER                                                    */
  /* ═══════════════════════════════════════════════════════════ */

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className="relative py-16 lg:py-0 lg:h-screen lg:overflow-hidden"
    >
      {/* ── Horizontal track ─────────────────────────────────── */}
      <div
        ref={trackRef}
        className={cn(
          'flex flex-col gap-20',
          'lg:flex-row lg:gap-0 lg:h-full lg:will-change-transform',
        )}
      >
        {resolvedWorkshops.map((workshop, wIdx) => {
          const feats = workshop.features ?? []
          const t = themeStyles[workshop.theme] ?? themeStyles.light

          return (
            <div
              key={wIdx}
              ref={(el) => {
                panelRefs.current[wIdx] = el
              }}
              className={cn(
                'shrink-0 flex flex-col lg:flex-row items-start lg:items-center',
                'w-full lg:w-screen lg:h-full',
                'px-6 sm:px-8 lg:px-0',
              )}
            >
              {/* ── Left column: text + features ── */}
              <div className="w-full lg:w-[42%] lg:h-full flex flex-col justify-center lg:pl-12 xl:pl-20 2xl:pl-24 lg:pr-6 xl:pr-10 py-6 lg:py-0">
                {/* Eyebrow */}
                <span
                  data-anim="fade"
                  className="text-(--ff-gold-accent,#E5B765) font-display font-black text-lg lg:text-[1.75rem] leading-snug"
                >
                  {resolvedEyebrow}
                </span>

                {/* Title */}
                <h2
                  data-anim="fade"
                  className={cn(
                    'font-display font-black tracking-tight',
                    'text-4xl sm:text-5xl lg:text-6xl xl:text-[5rem] leading-[1.1]',
                    'mt-3 lg:mt-5',
                    t.titleColor,
                  )}
                >
                  {workshop.title}
                </h2>

                {/* Description */}
                <p
                  data-anim="fade"
                  className={cn(
                    'font-display text-base sm:text-lg lg:text-xl',
                    'leading-relaxed whitespace-pre-line max-w-[48ch]',
                    'mt-3 lg:mt-4',
                    workshop.theme === 'light' ? 'font-bold' : 'font-medium',
                    t.descColor,
                  )}
                >
                  {workshop.description}
                </p>

                {/* Feature card */}
                <div
                  data-anim="fade"
                  className={cn(
                    'mt-6 lg:mt-8 rounded-4xl px-6 lg:px-8 py-8 lg:py-10',
                    t.cardBg,
                  )}
                >
                  {feats.map((feature, fIdx) => (
                    <React.Fragment key={fIdx}>
                      <div
                        className={cn('w-full border-t', t.cardDivider)}
                        style={{ borderWidth: '0.84px' }}
                      />
                      <p
                        className={cn(
                          'font-display font-bold text-sm sm:text-base lg:text-lg',
                          'leading-relaxed py-2.5 lg:py-3',
                          t.cardText,
                        )}
                      >
                        <span className="opacity-30 mr-3 tabular-nums text-xs font-bold">
                          {padIndex(fIdx)}
                        </span>
                        {(feature as { text?: string }).text}
                      </p>
                    </React.Fragment>
                  ))}
                  {feats.length > 0 && (
                    <div
                      className={cn('w-full border-t', t.cardDivider)}
                      style={{ borderWidth: '0.84px' }}
                    />
                  )}
                </div>
              </div>

              {/* ── Right column: image with parallax ── */}
              <div className="w-full lg:w-[58%] lg:h-full flex items-center lg:py-8 lg:pr-8 xl:pr-16">
                <div className="relative w-full aspect-16/10 lg:aspect-auto lg:h-[80vh] rounded-2xl lg:rounded-3xl overflow-hidden">
                  <div
                    ref={(el) => {
                      imageInnerRefs.current[wIdx] = el
                    }}
                    className="relative w-full h-full lg:w-[120%] lg:-ml-[10%]"
                  >
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
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom controls (desktop only, absolute inside pinned section) ── */}
      <div className="hidden lg:flex absolute bottom-6 xl:bottom-8 left-0 right-0 z-10 items-center px-12 xl:px-20 2xl:px-24 gap-6">
        {/* Progress bar */}
        <div className="flex-1 h-0.75 bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-(--ff-charcoal,#4B4B4B) rounded-full"
            style={{ width: `${progress * 100}%`, transition: 'none' }}
          />
        </div>

        {/* Counter */}
        <span className="font-display font-bold text-lg tabular-nums text-[#351C0B] shrink-0 select-none">
          {activeIndex + 1}
          <span className="opacity-30">/ {total}</span>
        </span>

        {/* Arrows */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous workshop"
            className={cn(
              'w-11 h-11 rounded-full border border-[#B3B3B3]',
              'flex items-center justify-center transition-colors duration-200',
              'hover:border-[#4B4B4B]',
              'disabled:opacity-30 disabled:pointer-events-none',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === total - 1}
            aria-label="Next workshop"
            className={cn(
              'w-11 h-11 rounded-full',
              'bg-(--ff-charcoal,#4B4B4B) text-white',
              'flex items-center justify-center transition-colors duration-200',
              'hover:bg-[#333]',
              'disabled:opacity-30 disabled:pointer-events-none',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
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
      </div>
    </section>
  )
}
