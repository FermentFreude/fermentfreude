'use client'

import { Media } from '@/components/Media'
import { useSplashReveal } from '@/components/SplashScreen/splashSignal'
import type { Media as MediaType, Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import type { SupportedLocale } from '@/utilities/getLocale'
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { isResolvedMedia } from '../HeroSlider/slide-data'
import { AUTO_PLAY_INTERVAL, useAutoPlay } from '../HeroSlider/useAutoPlay'
import { useSwipe } from '../HeroSlider/useSwipe'

/* ═══════════════════════════════════════════════════════════════
 *  HERO CINEMATIC — scroll-told hero over a full-screen dark photo.
 *
 *  The section is taller than the screen; the photo stays pinned
 *  (sticky) while scrolling plays three steps:
 *    1. Page opens: only the photo + one huge word ("Big Word" field)
 *       rising in letter by letter. Scrolling lifts it away.
 *    2. The title, just as huge, rises in letter by letter (all lines
 *       together), holds, then lifts away the same way.
 *    3. Description lines rise in, centred, with the buttons below.
 *  Scrolling back up plays it in reverse. Then the page scrolls on.
 *
 *  Desktop (1024px+): photo fills the screen. Mobile: photo on top at
 *  its natural ratio, text below on near-black.
 *  Two or more slides = photos/text crossfade, arrows, swipe, auto-play.
 * ═══════════════════════════════════════════════════════════════ */

const HERO_BG = '#0b0b0b'

/* ── Scroll timeline (0 = top of hero, 1 = hero fully scrolled) ── */
const WORD_OUT: [number, number] = [0, 0.16]
const TITLE_IN: [number, number] = [0.17, 0.34]
const TITLE_OUT: [number, number] = [0.46, 0.6]
const BODY_IN = 0.6
const CTA_IN: [number, number] = [0.72, 0.84]

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ── Load-in of the big word (after the splash lifts) ── */
const wordGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.3 } },
}
const letterIn: Variants = {
  hidden: { transform: 'translateY(120%)' },
  show: { transform: 'translateY(0%)', transition: { duration: 1.1, ease: EASE_OUT } },
}

interface ResolvedCinematicSlide {
  image: MediaType | null
  eyebrow: string
  title: string
  titleAccent: string
  description: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
}

/** English fallbacks — CMS data always wins. */
const DEFAULT_SLIDES: ResolvedCinematicSlide[] = [
  {
    image: null,
    eyebrow: 'FermentFreude',
    title: 'Fermentation,\nmade by hand.',
    titleAccent: 'Taste the difference.',
    description:
      'Workshops, ferments and know-how from our kitchen in Graz — natural, probiotic and full of flavour.',
    ctaLabel: 'Discover workshops',
    ctaHref: '/workshops',
    secondaryCtaLabel: 'Visit the shop',
    secondaryCtaHref: '/shop',
  },
]

const splitLines = (...texts: string[]) =>
  texts.flatMap((t) => t.split('\n')).filter((l) => l.trim() !== '')

/** Reduced-motion flag that only flips after mount, so server and client HTML match. */
function useReducedAfterMount() {
  const prefersReduced = useReducedMotion()
  const [reduce, setReduce] = useState(false)
  useEffect(() => setReduce(!!prefersReduced), [prefersReduced])
  return reduce
}

/**
 * Sizes text so its widest `[data-fit-line]` exactly fills the box width — lines never wrap.
 * `maxPx` caps the size (for text that should only shrink to fit, not grow).
 */
function useFitFontSize(
  boxRef: React.RefObject<HTMLElement | null>,
  text: string,
  maxPx?: () => number,
) {
  const [fontSize, setFontSize] = useState<number | null>(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const fit = () => {
      const lineEls = Array.from(box.querySelectorAll<HTMLElement>('[data-fit-line]'))
      if (!lineEls.length) return
      const current = parseFloat(getComputedStyle(lineEls[0]).fontSize)
      const widest = Math.max(...lineEls.map((el) => el.offsetWidth))
      const ratio = box.clientWidth / widest
      if (!Number.isFinite(ratio) || ratio <= 0) return
      // Small safety margin against sub-pixel rounding
      const next = current * ratio * 0.995
      setFontSize(maxPx ? Math.min(next, maxPx()) : next)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    // Typekit loads after first paint — refit once the real font is in
    document.fonts?.ready.then(fit)
    return () => observer.disconnect()
    // maxPx is a stable module-level function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxRef, text])

  return fontSize
}

/** Description size on large screens: same as clamp(1.375rem, 3vw, 2.75rem). */
const bodyMaxPx = () => Math.min(44, Math.max(22, window.innerWidth * 0.03))

/** Spreads a step over the letters of a line: each starts a bit after the previous one. */
function letterRange(range: [number, number], index: number, count: number): [number, number] {
  const [start, end] = range
  const spread = (end - start) * 0.45
  const from = start + (spread * index) / Math.max(count - 1, 1)
  return [from, from + (end - start) - spread]
}

/* ── One letter: rises in (on load or on scroll), lifts out on scroll ── */
function Letter({
  char,
  progress,
  inRange,
  outRange,
  loadIn,
  reduce,
}: {
  char: string
  progress: MotionValue<number>
  /** Scroll range to rise in over. Omit when the letter rises in on load instead. */
  inRange?: [number, number]
  outRange: [number, number]
  loadIn: boolean
  reduce: boolean
}) {
  const input = inRange ? [...inRange, ...outRange] : outRange
  const y = useTransform(progress, input, inRange ? ['120%', '0%', '0%', '-120%'] : ['0%', '-120%'])
  const opacity = useTransform(progress, input, inRange ? [0, 1, 1, 0] : [1, 0])
  const glyph = char === ' ' ? ' ' : char
  return (
    <motion.span className="inline-block" style={{ y: reduce ? 0 : y, opacity }}>
      {loadIn ? (
        <motion.span className="inline-block" variants={letterIn}>
          {glyph}
        </motion.span>
      ) : (
        glyph
      )}
    </motion.span>
  )
}

/* ── Huge text, auto-sized so its widest line spans the full content width ── */
function BigText({
  as: Tag,
  lines,
  progress,
  inRange,
  outRange,
  isRevealed,
  reduce,
  uppercase,
  centered,
}: {
  as: 'h1' | 'p'
  lines: string[]
  progress: MotionValue<number>
  /** Scroll range to rise in over. Omit to rise in on load (after the splash). */
  inRange?: [number, number]
  outRange: [number, number]
  isRevealed: boolean
  reduce: boolean
  uppercase?: boolean
  /** Centre each line (shorter lines sit centred under the widest one). */
  centered?: boolean
}) {
  const boxRef = useRef<HTMLHeadingElement>(null)
  const text = lines.join('\n')
  const fontSize = useFitFontSize(boxRef, text)

  const loadIn = !inRange

  return (
    <Tag ref={boxRef} className="w-full">
      <span className="sr-only">{text}</span>
      <motion.span
        className="block font-display font-bold leading-[0.92] tracking-[-0.045em] text-white"
        style={{ fontSize: fontSize ? `${fontSize}px` : '9vw' }}
        aria-hidden
        {...(loadIn && {
          variants: wordGroup,
          initial: 'hidden',
          animate: isRevealed ? 'show' : 'hidden',
        })}
      >
        {lines.map((line, li) => {
          const chars = Array.from(uppercase ? line.toUpperCase() : line)
          return (
            // Mask: clips letters as they rise in and lift out (padding keeps descenders)
            <span
              key={li}
              className={cn(
                'block overflow-hidden pb-[0.12em] -mb-[0.12em]',
                centered && 'flex justify-center',
              )}
            >
              <span data-fit-line className="flex w-max whitespace-nowrap">
                {chars.map((char, i) => (
                  <Letter
                    key={i}
                    char={char}
                    progress={progress}
                    inRange={inRange && letterRange(inRange, i, chars.length)}
                    outRange={letterRange(outRange, i, chars.length)}
                    loadIn={loadIn}
                    reduce={reduce}
                  />
                ))}
              </span>
            </span>
          )
        })}
      </motion.span>
    </Tag>
  )
}

/* ── Scroll-revealed line: rises from behind a mask as the user scrolls ── */
function RevealLine({
  progress,
  range,
  reduce,
  noWrap,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  reduce: boolean
  /** Keep on one line and let useFitFontSize measure it. */
  noWrap?: boolean
  children: React.ReactNode
}) {
  const y = useTransform(progress, range, ['110%', '0%'])
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <motion.span className="block" style={{ y: reduce ? 0 : y, opacity }}>
        {noWrap ? (
          <span data-fit-line className="inline-block whitespace-nowrap">
            {children}
          </span>
        ) : (
          children
        )}
      </motion.span>
    </span>
  )
}

type HeroCinematicProps = Page['hero'] & { locale?: SupportedLocale }

export const HeroCinematic: React.FC<HeroCinematicProps> = (props) => {
  const { setHeaderTheme, setHeroBackgroundColor } = useHeaderTheme()

  const slides: ResolvedCinematicSlide[] = useMemo(() => {
    const cms = props.cinematicSlides
    if (!cms?.length) return DEFAULT_SLIDES
    const fallback = DEFAULT_SLIDES[0]
    return cms.map((s) => ({
      image: isResolvedMedia(s.image) ? s.image : null,
      eyebrow: s.eyebrow ?? '',
      title: s.title ?? fallback.title,
      titleAccent: s.titleAccent ?? '',
      description: s.description ?? '',
      ctaLabel: s.ctaLabel ?? '',
      ctaHref: s.ctaHref ?? '',
      secondaryCtaLabel: s.secondaryCtaLabel ?? '',
      secondaryCtaHref: s.secondaryCtaHref ?? '',
    }))
  }, [props.cinematicSlides])

  const isMulti = slides.length > 1
  const { activeIndex, isExiting, isPaused, setIsPaused, progressRef, goToSlide, goNext, goPrev } =
    useAutoPlay(slides.length)
  const { handleTouchStart, handleTouchEnd } = useSwipe({ goNext, goPrev })
  // Hold the entrance until the splash screen lifts, otherwise it plays unseen
  const isRevealed = useSplashReveal()
  const reduce = useReducedAfterMount()

  /* ── Scroll progress through the pinned hero ── */
  const trackRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  // Light spring smooths wheel steps so the reveals glide instead of jumping
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 32, restDelta: 0.0005 })

  const photoScale = useTransform(progress, [0, 1], [1, 1.08])
  // Photo darkens a little for the title, more for the centred description
  const shadeOpacity = useTransform(
    progress,
    [WORD_OUT[1] - 0.04, TITLE_IN[1], TITLE_OUT[1], CTA_IN[0]],
    [0, 0.45, 0.45, 0.8],
  )
  const cueOpacity = useTransform(progress, [0, 0.04], [1, 0])
  const ctaY = useTransform(progress, CTA_IN, [24, 0])
  const ctaOpacity = useTransform(progress, CTA_IN, [0, 1])

  useEffect(() => {
    setHeaderTheme('dark')
    setHeroBackgroundColor(HERO_BG)
    // Tells the transparent home header to switch logo + icons to white (see Header/index.css)
    document.body.dataset.heroDark = ''
    return () => {
      delete document.body.dataset.heroDark
    }
  }, [setHeaderTheme, setHeroBackgroundColor])

  const slide = slides[activeIndex] ?? slides[0]
  const titleLines = splitLines(slide.title, slide.titleAccent)
  const bodyLines = splitLines(slide.description)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const bodySize = useFitFontSize(bodyRef, bodyLines.join('\n'), bodyMaxPx)
  const hasCtas =
    Boolean(slide.ctaLabel && slide.ctaHref) ||
    Boolean(slide.secondaryCtaLabel && slide.secondaryCtaHref)

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={trackRef}
        className="relative h-[400svh] w-full max-w-[100vw]"
        style={{ backgroundColor: HERO_BG }}
      >
        <div
          className="sticky top-0 flex h-svh w-full flex-col overflow-hidden touch-pan-y"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ── Photo layer (all slides stacked, active one fades in) ── */}
          <div className="relative mt-16 aspect-[3/2] w-full shrink-0 overflow-hidden lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
            <motion.div className="absolute inset-0" style={{ scale: reduce ? 1 : photoScale }}>
              {slides.map((s, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  // Starts visible (no opacity fade) so the photo still counts for LCP
                  initial={{ opacity: i === 0 ? 1 : 0, transform: 'scale(1.1)' }}
                  animate={
                    i === activeIndex
                      ? { opacity: 1, transform: isRevealed ? 'scale(1)' : 'scale(1.1)' }
                      : { opacity: 0, transform: 'scale(1.1)' }
                  }
                  transition={{
                    opacity: { duration: 1.1, ease: 'easeInOut' },
                    transform: { duration: i === activeIndex ? 2.8 : 1.1, ease: EASE_OUT },
                  }}
                  aria-hidden={i !== activeIndex}
                >
                  {s.image ? (
                    <Media
                      resource={s.image}
                      fill
                      imgClassName="object-cover object-[50%_12%]"
                      priority={i === 0}
                      size="100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-ff-charcoal-dark" />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Contrast fades — keep white text readable on any photo */}
            <div
              className="absolute inset-0 bg-linear-to-t from-[#0b0b0b] via-[#0b0b0b]/25 to-transparent lg:from-black/90 lg:via-black/35 lg:to-black/5"
              aria-hidden
            />
            <div
              className="absolute inset-x-0 top-0 hidden h-40 bg-linear-to-b from-black/50 to-transparent lg:block"
              aria-hidden
            />
            {/* Deepens step by step so each text stays readable over the photo */}
            <motion.div
              className="absolute inset-0 bg-black/70"
              style={{ opacity: shadeOpacity }}
              aria-hidden
            />
          </div>

          {/* ── Text stage — below the photo on mobile, over it on desktop ── */}
          <motion.div
            key={activeIndex}
            className="relative z-10 flex-1 lg:absolute lg:inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Step 1 — big word (rises in on load) */}
            {slide.eyebrow && (
              <div className="absolute inset-x-0 top-0 pt-6 lg:top-auto lg:bottom-0 lg:pt-0 lg:pb-16">
                <div className="container mx-auto container-padding">
                  <BigText
                    as="p"
                    lines={[slide.eyebrow]}
                    progress={progress}
                    outRange={WORD_OUT}
                    isRevealed={isRevealed}
                    reduce={reduce}
                    uppercase
                  />
                </div>
              </div>
            )}

            {/* Step 2 — huge title, centred, same letter-by-letter motion */}
            <div className="absolute inset-0 flex items-center pb-10 lg:pb-0">
              <div className="container mx-auto container-padding w-full">
                <BigText
                  as="h1"
                  lines={titleLines}
                  progress={progress}
                  inRange={TITLE_IN}
                  outRange={TITLE_OUT}
                  isRevealed={isRevealed}
                  reduce={reduce}
                  centered
                />
              </div>
            </div>

            {/* Step 3 — description + buttons, centred */}
            <div className="absolute inset-0 flex items-center justify-center pb-10 lg:pb-0">
              <div className="container mx-auto container-padding flex flex-col items-center text-center">
                {bodyLines.length > 0 && (
                  <p
                    ref={bodyRef}
                    className="w-full max-w-5xl font-display text-[clamp(1.375rem,3vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white"
                    // Each line stays on one line — the size shrinks so the longest line fits
                    style={bodySize ? { fontSize: `${bodySize}px` } : undefined}
                  >
                    {bodyLines.map((line, i) => {
                      const from = BODY_IN + i * 0.05
                      return (
                        <RevealLine
                          key={i}
                          progress={progress}
                          range={[from, from + 0.12]}
                          reduce={reduce}
                          noWrap
                        >
                          {line}
                        </RevealLine>
                      )
                    })}
                  </p>
                )}

                {hasCtas && (
                  <motion.div
                    className="mt-10 flex flex-wrap items-center justify-center gap-3"
                    style={{ y: reduce ? 0 : ctaY, opacity: ctaOpacity }}
                  >
                    {slide.ctaLabel && slide.ctaHref && (
                      <Link
                        href={slide.ctaHref}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-8 py-3.5 font-display text-sm font-bold text-ff-near-black transition-all duration-300 hover:bg-white/85 hover:scale-[1.03]"
                      >
                        {slide.ctaLabel}
                      </Link>
                    )}
                    {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                      <Link
                        href={slide.secondaryCtaHref}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/70 px-8 py-3.5 font-display text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-ff-near-black hover:scale-[1.03]"
                      >
                        {slide.secondaryCtaLabel}
                      </Link>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Scroll cue — thin line with a travelling highlight; fades on first scroll ── */}
          <motion.div
            className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
            style={{ opacity: cueOpacity }}
            aria-hidden
          >
            <motion.div
              className="h-10 w-px overflow-hidden bg-white/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: isRevealed ? 1 : 0 }}
              transition={{ duration: 0.6, delay: isRevealed ? 1.2 : 0 }}
            >
              <motion.span
                className="block h-1/2 w-full bg-white"
                animate={{ transform: ['translateY(-100%)', 'translateY(200%)'] }}
                transition={{
                  duration: 1.6,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 0.3,
                }}
              />
            </motion.div>
          </motion.div>

          {/* ── Controls (only with 2+ slides) ─────────────────── */}
          {isMulti && (
            <div className="absolute inset-x-0 bottom-6 z-20 lg:bottom-10">
              <div className="container mx-auto container-padding flex items-center justify-end gap-5">
                <span className="font-display text-xs font-bold tracking-[0.2em] text-white/80">
                  <span className="text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
                  {' / '}
                  {String(slides.length).padStart(2, '0')}
                </span>
                <div className="h-px w-16 overflow-hidden bg-white/25 sm:w-24">
                  <div
                    ref={progressRef}
                    className="h-full bg-white"
                    style={{
                      animation: `heroProgress ${AUTO_PLAY_INTERVAL}ms linear`,
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Previous slide', onClick: goPrev, d: 'M15 18l-6-6 6-6' },
                    { label: 'Next slide', onClick: goNext, d: 'M9 18l6-6-6-6' },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={btn.onClick}
                      aria-label={btn.label}
                      className={cn(
                        'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/50 text-white',
                        'transition-colors duration-300 hover:border-white hover:bg-white hover:text-ff-near-black',
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d={btn.d} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="sr-only" role="group" aria-label="Slide navigation">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </MotionConfig>
  )
}
