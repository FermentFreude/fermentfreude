'use client'

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type {
  Media as MediaType,
  WorkshopSliderBlock as WorkshopSliderBlockType,
} from '@/payload-types'
import { MotionConfig, motion, type Variants } from 'motion/react'
import { SwipeCapsule, useSwipeNudge, useSwipeTrack } from '@/components/SwipeCapsule'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS  (English — CMS data always wins)
 * ═══════════════════════════════════════════════════════════════ */

/** Below lg the gallery is a native swipe row (desktop: sticky scroll scene) */
/** Desktop sticky scroll scene only on a wide screen WITH a mouse — touch tablets
 *  (even iPad Pro / landscape) get the swipe row + capsule. Matches the `desk:` variant. */
const isDeskScene = () =>
  window.innerWidth >= 1024 && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const isTouchLayout = () => !isDeskScene()

const DEFAULT_EYEBROW = 'Workshop Experience'
const DEFAULT_SECTION_HEADING = 'Our next workshops'
const DEFAULT_DETAILS_CTA_LABEL = 'Explore'
const DEFAULT_NEXT_DATE_LABEL = 'Next date'
const DEFAULT_NO_DATE_LABEL = 'Available soon'

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

/* ═══════════════════════════════════════════════════════════════
 *  BANNER — bridges the product showcase to the workshops.
 *  The intro sentence is the big h2 (keywords for SEO), one sentence
 *  per line; the "next workshops" line sits under it, small and gold.
 *
 *  Reveal (once, on scroll into view): each word rises out of a mask,
 *  staggered, then the gold line follows when the title has landed.
 * ═══════════════════════════════════════════════════════════════ */

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const WORD_STAGGER = 0.07

const bannerGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: WORD_STAGGER } },
}
const wordRise: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1.1, ease: EASE_OUT } },
}

function WorkshopBanner({
  lead,
  heading,
  href,
}: {
  lead?: string | null
  heading?: string | null
  href: string
}) {
  // One sentence per line — never a break in the middle of a sentence
  const sentences = lead ? lead.split(/(?<=[.!?])\s+/).map((s) => s.split(/\s+/)) : []
  const wordCount = sentences.flat().length
  const goldLine: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE_OUT, delay: wordCount * WORD_STAGGER + 0.35 },
    },
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="bg-ff-near-black py-14 md:py-16 lg:py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.45 }}
        variants={bannerGroup}
      >
        <div className="container mx-auto container-padding text-center">
          {sentences.length ? (
            <h2 className="mx-auto text-balance font-display text-[clamp(1.875rem,4.6vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ff-ivory">
              {sentences.map((words, i) => (
                <span key={i} className="block">
                  {words.map((word, j) => (
                    <React.Fragment key={j}>
                      {/* Mask: padding keeps descenders (g, p) visible */}
                      <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                        <motion.span className="inline-block" variants={wordRise}>
                          {word}
                        </motion.span>
                      </span>
                      {j < words.length - 1 ? ' ' : null}
                    </React.Fragment>
                  ))}
                </span>
              ))}
            </h2>
          ) : null}
          {heading ? (
            <motion.p variants={goldLine} className={sentences.length ? 'mt-4 md:mt-5' : ''}>
              {/* Link to all workshops — underline draws in on hover */}
              <Link
                href={href}
                className="group/all inline-flex items-center font-display text-lg font-bold tracking-[-0.01em] text-ff-gold transition-colors duration-300 hover:text-ff-gold-light md:text-2xl"
              >
                <span className="relative">
                  {heading}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover/all:scale-x-100"
                  />
                </span>
              </Link>
            </motion.p>
          ) : null}
        </div>
      </motion.div>
    </MotionConfig>
  )
}

/* ═══════════════════════════════════════════════════════════════ */

type Props = WorkshopSliderBlockType & {
  id?: string
  upcomingLabel?: string
  /** Formatted date per workshop href. The page passes { date, soldOut } records, the global wrapper plain strings. */
  upcomingDatesByHref?: Record<string, string | { dateFirst: string | null } | null>
}

/** Next bookable date as text, or undefined when there is none (sold out / no appointment) */
function dateText(
  value: string | { dateFirst: string | null } | null | undefined,
): string | undefined {
  if (!value) return undefined
  return (typeof value === 'object' ? value.dateFirst : value) || undefined
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
  visible,
  sectionLead,
  sectionHeading,
  allWorkshopsLink,
  eyebrow,
  workshops,
  id,
  upcomingLabel,
  nextDateLabel,
  noDateLabel,
  upcomingDatesByHref,
}) => {
  /* ── refs ──────────────────────────────────────────────────── */
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const workshopGroupRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgInnerRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollRef = useRef({ current: 0, target: 0, limit: 0 })
  const rafRef = useRef<number>(0)
  const isActiveRef = useRef(false)

  /* ── merge CMS + defaults ──────────────────────────────────── */
  const resolvedEyebrow = eyebrow || DEFAULT_EYEBROW
  // null/undefined → English default; an empty string in the CMS hides the title
  const resolvedSectionHeading = sectionHeading ?? DEFAULT_SECTION_HEADING
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
          detailsButtonLabel:
            (w as { detailsButtonLabel?: string | null }).detailsButtonLabel ||
            DEFAULT_DETAILS_CTA_LABEL,
          nextDate: dateText(
            upcomingDatesByHref?.[w.ctaLink || DEFAULT_WORKSHOPS[i]?.ctaLink || ''],
          ),
        }))
      : DEFAULT_WORKSHOPS.map((w) => ({
          ...w,
          audienceTag: w.audienceTag,
          image: null as MediaType | null,
          image2: null as MediaType | null,
          detailsButtonLabel: DEFAULT_DETAILS_CTA_LABEL,
          nextDate: dateText(upcomingDatesByHref?.[w.ctaLink]),
        }))

  /* ── Sticky scroll + parallax engine (all breakpoints) ─────── */
  useEffect(() => {
    const outer = outerRef.current
    const container = containerRef.current
    if (!outer || !container) return

    // Share of the remaining distance covered per frame. Higher = follows the
    // scroll more tightly (0.08 felt floaty: cards kept drifting ~1s after you stopped).
    const EASE = 0.18
    const MAX_SHIFT = 8

    /* Image positions inside the track, measured once per resize — never read
     * the layout inside the animation loop (that forced a reflow every frame). */
    let imageBoxes: { center: number }[] = []
    let trackLeft = 0
    let lastWidth = 0

    /* Recalculate outer height and scroll limit.
     * Sticky scroll-jacking is kept for desktop (lg+, the signature effect),
     * but disabled on mobile/tablet where it feels broken on touch:
     *  - users get "stuck" when scrolling back up,
     *  - vertical-scroll → horizontal-translate is unintuitive on a phone,
     *  - mobile address-bar resize causes jumps mid-scrub.
     * Below lg the section becomes a native horizontal swipe carousel. */
    const updateDimensions = () => {
      lastWidth = window.innerWidth
      const enableStickyScene = isDeskScene()
      const overshoot = enableStickyScene
        ? Math.max(0, container.scrollWidth - window.innerWidth)
        : 0
      isActiveRef.current = enableStickyScene && overshoot > 0
      outer.style.height = enableStickyScene ? `${window.innerHeight + overshoot}px` : ''
      scrollRef.current.limit = overshoot

      if (!isActiveRef.current) {
        scrollRef.current.target = 0
        scrollRef.current.current = 0
        container.style.transform = ''
        return
      }

      // Measure at rest (no transform) so positions are relative to the track
      const prev = container.style.transform
      container.style.transform = ''
      trackLeft = container.getBoundingClientRect().left
      imageBoxes = imgInnerRefs.current.map((inner) => {
        const box = inner?.parentElement?.getBoundingClientRect()
        return { center: box ? box.left - trackLeft + box.width / 2 : 0 }
      })
      container.style.transform = prev
      onScroll()
    }

    /* Map vertical page scroll → horizontal translateX target */
    const onScroll = () => {
      if (!isActiveRef.current) return
      const outerTop = outer.getBoundingClientRect().top + window.scrollY
      const overshoot = scrollRef.current.limit
      if (overshoot <= 0) return
      const progress = Math.max(0, Math.min(1, (window.scrollY - outerTop) / overshoot))
      scrollRef.current.target = progress * overshoot
      start()
    }

    /* RAF loop — lerp + parallax. Runs only while the track is moving,
     * then stops (it used to run every frame forever, even off-screen). */
    let running = false
    const tick = () => {
      const s = scrollRef.current
      const diff = s.target - s.current
      s.current = Math.abs(diff) < 0.3 ? s.target : s.current + diff * EASE
      container.style.transform = `translate3d(${-s.current}px, 0, 0)`

      /* Parallax each image inner — pure math from cached positions */
      const vCenter = window.innerWidth * 0.5
      imgInnerRefs.current.forEach((inner, i) => {
        if (!inner) return
        const ec = trackLeft + (imageBoxes[i]?.center ?? 0) - s.current
        const t = Math.max(-1, Math.min(1, (ec - vCenter) / vCenter))
        inner.style.transform = `translate3d(${-t * MAX_SHIFT}%, 0, 0)`
      })

      if (s.current === s.target) {
        running = false
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    const start = () => {
      if (running || !isActiveRef.current) return
      running = true
      rafRef.current = requestAnimationFrame(tick)
    }

    /* Desktop: any resize. Touch sizes: width only — a height-only resize there
     * is the mobile address bar showing/hiding, not a real layout change. */
    const onResize = () => {
      if (isDeskScene() || window.innerWidth !== lastWidth) updateDimensions()
    }

    updateDimensions()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const workshopCount = resolvedWorkshops.length

  /* Phone/tablet: swipe capsule (hand + dots) follows the native swipe row;
   * the cards nudge once when the gallery comes into view. Desktop has its own
   * sticky scroll scene, so nothing is tracked there. */
  const {
    active: activeWorkshopIndex,
    handDirection,
    isSwiping,
    goTo: goToWorkshop,
  } = useSwipeTrack({
    trackRef,
    itemRefs: workshopGroupRefs,
    count: workshopCount,
    enabled: isTouchLayout,
  })
  useSwipeNudge(trackRef, containerRef, workshopCount, isTouchLayout)

  if (visible === false) return null

  /* ═══════════════════════════════════════════════════════════ */
  /*  RENDER                                                     */
  /* ═══════════════════════════════════════════════════════════ */

  return (
    /* Outer pin div — JS sets height to 100svh + overshoot on lg+.
     * Below lg, height is auto and the section becomes a normal
     * horizontal swipe carousel (no scroll-jacking). */
    <div id={id ?? undefined} className="bg-white">
      {/* ── Section title — introduces the workshops before the gallery pins */}
      {sectionLead || resolvedSectionHeading ? (
        <WorkshopBanner
          lead={sectionLead}
          heading={resolvedSectionHeading}
          href={allWorkshopsLink || '/workshops'}
        />
      ) : null}

      <div ref={outerRef} className="relative w-full bg-white desk:min-h-svh">
        {/* ── Viewport: sticky on desktop, native horizontal scroll on mobile */}
        <section
          ref={trackRef}
          className="relative w-full bg-white overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden desk:sticky desk:top-0 desk:overflow-hidden h-auto desk:h-svh py-10 desk:py-0"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
        >
          {/* ── Scroll hint (desktop only — mobile gets native swipe affordance) */}
          <p className="hidden desk:block absolute bottom-6 md:bottom-8 right-[5vw] z-10 text-black/20 text-[10px] md:text-xs font-display tracking-[0.15em] uppercase pointer-events-none select-none">
            scroll →
          </p>

          {/* ══════════════════════════════════════════════════════
           *  RESPONSIVE TRACK
           *   · lg+: absolutely positioned, transformed by JS (sticky scene)
           *   · <desk: in-flow flex row, native overflow-x with snap
           * ══════════════════════════════════════════════════════ */}
          <div className="desk:absolute desk:inset-0 desk:overflow-hidden select-none snap-x snap-mandatory desk:snap-none">
            <div
              ref={containerRef}
              className="flex items-center h-full will-change-transform"
              style={{
                gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                paddingLeft: '5vw',
                paddingRight: '5vw',
              }}
            >
              {resolvedWorkshops.map((workshop, wIdx) => {
                const imgAIdx = wIdx * 2
                const imgBIdx = wIdx * 2 + 1
                const secondImg = workshop.image2 ?? workshop.image

                return (
                  <div
                    key={wIdx}
                    ref={(el) => {
                      workshopGroupRefs.current[wIdx] = el
                    }}
                    className="flex shrink-0 items-center snap-start desk:snap-none"
                    style={{
                      gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                      marginRight:
                        wIdx < resolvedWorkshops.length - 1 ? 'clamp(1rem, 4vw, 4vw)' : undefined,
                    }}
                  >
                    {/* ── LEFT COLUMN — title on top, small image below ── */}
                    <div
                      className="shrink-0 flex flex-col self-center w-[80vw] sm:w-[20rem] md:w-88 desk:w-85"
                      style={{ height: 'clamp(62svh, 74svh, 78vh)' }}
                    >
                      <div className="shrink-0 pb-4 md:pb-5 w-full">
                        <FadeIn>
                          <p className="text-eyebrow font-bold mb-2 tracking-[0.08em] uppercase text-ff-gold">
                            {resolvedEyebrow}
                          </p>
                          <h2 className="text-section-heading font-display font-bold leading-[1.05] tracking-[-0.025em] text-ff-black mb-3 md:mb-4">
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
                      {/* Dark box: gold label + the date in ivory. Fixed size on every card; room for a 2nd line when a long date wraps on a narrow card */}
                      <div className="mb-5 flex h-[4.75rem] flex-col justify-center rounded-xl bg-ff-near-black px-4">
                        <p className="mb-1 font-display text-[10px] font-bold uppercase tracking-[0.08em] text-ff-gold">
                          {nextDateLabel || upcomingLabel || DEFAULT_NEXT_DATE_LABEL}
                        </p>
                        <p className="mb-0 line-clamp-2 font-display text-[15px] font-bold leading-tight text-ff-ivory">
                          {workshop.nextDate || noDateLabel || DEFAULT_NO_DATE_LABEL}
                        </p>
                      </div>

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
                          className="flex items-center justify-end gap-3 sm:justify-between group/cta"
                          aria-label={`Workshop Seite: ${workshop.title}`}
                        >
                          <span className="text-[11px] font-display font-bold tracking-widest uppercase text-black/40 group-hover/cta:text-black transition-colors duration-200">
                            {workshop.detailsButtonLabel}
                          </span>
                          <span className="size-9 rounded-full border border-black/25 flex items-center justify-center text-base leading-none text-black/35 transition-all duration-200 group-hover/cta:border-black group-hover/cta:text-black group-hover/cta:scale-110">
                            +
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Mobile/tablet controls — one wordless capsule: a hand that swipes
            left (the gesture itself) + the slide dots. Hidden on the desktop
            sticky scene. */}
        {workshopCount > 1 ? (
          <div className="desk:hidden flex justify-center px-6 pt-2 pb-6">
            <SwipeCapsule
              labels={resolvedWorkshops.map((w) => w.title)}
              active={activeWorkshopIndex}
              handDirection={handDirection}
              isSwiping={isSwiping}
              onSelect={goToWorkshop}
              ariaLabel="Workshop navigation"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
