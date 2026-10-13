'use client'

import { Media } from '@/components/Media'
import { SectionHeader } from '@/components/SectionHeader'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from 'motion/react'
import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  TEMPEH STORY CAROUSEL — autoplay strip.
 *
 *  A horizontal strip of photo cards slides along on a soft spring.
 *  The active card lines up with the section text; its neighbours
 *  peek in at both edges and fade out. The strip loops endlessly
 *  (cards are rendered from an unbounded index, so there is never a
 *  jump back to the start). One progress bar fills before each slide;
 *  it pauses on hover, keyboard focus, off-screen and reduced motion.
 *  Drag / swipe the strip, use the arrows, or ← → keys.
 *
 *  Below the strip, the active slide's punch word, label, title, text
 *  and button change with each card. Every slide comes from the CMS.
 * ═══════════════════════════════════════════════════════════════ */

export type TempehSlide = {
  key: string
  label?: string | null
  punchWord?: string | null
  title: string
  description?: string | null
  image: MediaType | null
  href?: string
  buttonLabel?: string
}

type Props = {
  eyebrow?: string | null
  heading: string
  slides: TempehSlide[]
  locale: 'de' | 'en'
}

const AUTOPLAY_SECONDS = 6
const GAP = 20
/** Cards rendered on each side of the active one (covers wide screens + drags) */
const BUFFER = 3
const SLIDE_SPRING = { type: 'spring', visualDuration: 0.75, bounce: 0.1 } as const
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const pad = (n: number) => String(n).padStart(2, '0')
const mod = (n: number, m: number) => ((n % m) + m) % m

/* ── Text: masked lines rise in, lift out ── */
const textGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.03 } },
}
const rise: Variants = {
  enter: { y: '110%' },
  center: { y: '0%', transition: { duration: 0.7, ease: EASE } },
  exit: { y: '-110%', transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } },
}
const fadeUp: Variants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22 } },
}

/**
 * The big outlined word (or number) for the active slide. Starts at the
 * full display size; a long word shrinks just enough to fit its column.
 */
function PunchWord({ text }: { text: string }) {
  const boxRef = useRef<HTMLSpanElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const [fontSize, setFontSize] = useState<number | null>(null)
  /** Full display size from the CSS clamp(), read while no override is applied */
  const fullSizeRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const box = boxRef.current
    const word = wordRef.current
    if (!box || !word) return
    fullSizeRef.current = null
    // Never write the size to the DOM here — React owns it via `fontSize`
    const fit = () => {
      const current = parseFloat(getComputedStyle(word).fontSize)
      if (fullSizeRef.current === null) fullSizeRef.current = current
      const width = word.offsetWidth
      if (!width || !box.clientWidth) return
      const target = current * (box.clientWidth / width) * 0.98
      const full = fullSizeRef.current
      setFontSize(target >= full ? null : target)
    }
    setFontSize(null)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [text])

  return (
    <span ref={boxRef} className="block w-full">
      <span
        ref={wordRef}
        className="inline-block whitespace-nowrap font-display text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[1.15] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1.5px_#1a1a1a]"
        style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
      >
        {text}
      </span>
    </span>
  )
}

/** Clips its child so it can rise in from below / lift out above. */
function Mask({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('block overflow-hidden', className)}>{children}</span>
}

/**
 * Card size + where the active card starts, from the strip's width and the
 * page container's left edge (so the active card lines up with the text).
 */
function useStripLayout(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  alignRef: React.RefObject<HTMLDivElement | null>,
) {
  const [layout, setLayout] = useState({ cardW: 0, cardH: 0, left: 0 })
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const align = alignRef.current
    if (!viewport || !align) return
    const measure = () => {
      const vw = viewport.clientWidth
      const left = align.getBoundingClientRect().left - viewport.getBoundingClientRect().left
      const contentW = align.clientWidth
      const desktop = vw >= 1024
      // Desktop: landscape cards ~44% of the content width; mobile: almost full width
      const cardW = desktop ? Math.min(680, contentW * 0.44) : contentW * 0.86
      const cardH = cardW * (desktop ? 0.62 : 0.78)
      setLayout({ cardW, cardH, left })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [viewportRef, alignRef])
  return layout
}

export function HomeTempehStoryCarousel({ eyebrow, heading, slides: items, locale }: Props) {
  const count = items.length
  /** Unbounded index — the visible slide is items[mod(index, count)] */
  const [index, setIndex] = useState(0)
  const slide = items[mod(index, count)] ?? items[0]

  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const alignRef = useRef<HTMLDivElement>(null)
  const { cardW, cardH, left } = useStripLayout(viewportRef, alignRef)
  const step = cardW + GAP

  const seen = useInView(sectionRef, { once: true, amount: 0.3 })
  const onScreen = useInView(sectionRef, { amount: 0.35 })
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const playing = Boolean(
    seen && onScreen && !hovered && !focused && !dragging && !reduce && count > 1,
  )

  /* ── Strip position ── */
  const x = useMotionValue(0)
  // Keep the strip on the active card when the size changes (resize, first measure)
  useEffect(() => {
    if (step > 0) x.set(-index * step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const progress = useMotionValue(0)
  const goTo = useCallback(
    (target: number) => {
      progress.set(0)
      setIndex(target)
      if (step > 0) animate(x, -target * step, reduce ? { duration: 0 } : SLIDE_SPRING)
    },
    [progress, step, x, reduce],
  )

  /* ── Autoplay: fills the progress bar, then moves on ── */
  useEffect(() => {
    if (!playing) return
    const controls = animate(progress, 1, {
      // Resume from where a pause left off
      duration: AUTOPLAY_SECONDS * (1 - progress.get()),
      ease: 'linear',
      onComplete: () => goTo(index + 1),
    })
    return () => controls.stop()
  }, [playing, index, goTo, progress])

  /* ── Drag: snap to the nearest card, with a flick moving one card ── */
  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false)
    if (step <= 0) return
    const position = -x.get() / step
    const flick = Math.abs(info.velocity.x) > 350 ? -Math.sign(info.velocity.x) * 0.5 : 0
    const target = Math.round(position + flick)
    goTo(Math.max(index - 2, Math.min(index + 2, target)))
  }

  const labels =
    locale === 'en'
      ? { prev: 'Previous slide', next: 'Next slide', slide: 'Slide', of: 'of' }
      : { prev: 'Vorherige Folie', next: 'Nächste Folie', slide: 'Folie', of: 'von' }

  const visible: number[] = []
  for (let i = index - BUFFER; i <= index + BUFFER; i++) visible.push(i)

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-label={heading}
        className="overflow-hidden bg-[#F6F0E8] section-padding-md"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goTo(index + 1)
          if (e.key === 'ArrowLeft') goTo(index - 1)
        }}
      >
        <div className="container mx-auto container-padding">
          {/* ── Header — shared editorial pattern, fades in when first seen ── */}
          <motion.div initial="enter" animate={seen ? 'center' : 'enter'} variants={fadeUp}>
            <SectionHeader eyebrow={eyebrow} heading={heading} />
          </motion.div>
          {/* Invisible ruler: the active card lines up with this content edge */}
          <div ref={alignRef} aria-hidden className="h-0" />
        </div>

        {/* ── Strip: full-bleed, edges fade out so neighbours "peek" ── */}
        <div
          ref={viewportRef}
          className="relative mt-8 w-full overflow-hidden lg:mt-10"
          style={{
            height: cardH || undefined,
            // Fade only the margins: the previous card fades out in the left gutter,
            // the next ones towards the right edge — the active card stays crisp
            maskImage: `linear-gradient(to right, transparent 0px, black ${Math.round(left)}px, black 82%, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to right, transparent 0px, black ${Math.round(left)}px, black 82%, transparent 100%)`,
          }}
        >
          {cardW > 0 && (
            <motion.div
              className="absolute inset-y-0 cursor-grab touch-pan-y active:cursor-grabbing [&_img]:pointer-events-none"
              style={{ x, left, width: step * (count + 2 * BUFFER) }}
              drag={count > 1 ? 'x' : false}
              dragMomentum={false}
              onDragStart={() => setDragging(true)}
              onDragEnd={onDragEnd}
            >
              {visible.map((i) => {
                const item = items[mod(i, count)]
                const active = i === index
                return (
                  <motion.div
                    key={i}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${labels.slide} ${mod(i, count) + 1} ${labels.of} ${count}`}
                    aria-hidden={!active}
                    className="absolute top-0 overflow-hidden rounded-3xl bg-[#ECE5DE]"
                    style={{ left: i * step, width: cardW, height: cardH }}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0.5, scale: active ? 1 : 0.96 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    onClick={() => !active && goTo(i)}
                  >
                    {item?.image ? (
                      <Media
                        resource={item.image}
                        fill
                        imgClassName="object-cover"
                        size="(max-width: 1024px) 86vw, 50vw"
                      />
                    ) : null}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>

        <div className="container mx-auto container-padding">
          {/* ── Progress + counter + arrows ── */}
          {count > 1 && (
            <div className="mt-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="h-[3px] w-[120px] overflow-hidden rounded-full bg-ff-near-black/15"
                  aria-hidden
                >
                  <motion.span
                    className="block h-full origin-left rounded-full bg-ff-near-black"
                    style={{ scaleX: reduce ? 1 : progress }}
                  />
                </div>
                <span className="font-display text-xs font-bold tabular-nums tracking-[0.12em] text-ff-near-black/60">
                  {pad(mod(index, count) + 1)} / {pad(count)}
                </span>
              </div>
              <div className="flex shrink-0 gap-2">
                {[
                  { label: labels.prev, step: -1, Icon: ArrowLeft },
                  { label: labels.next, step: 1, Icon: ArrowRight },
                ].map(({ label, step: dirStep, Icon }) => (
                  <motion.button
                    key={label}
                    type="button"
                    onClick={() => goTo(index + dirStep)}
                    aria-label={label}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.3 }}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ff-near-black/20 text-ff-near-black transition-colors hover:border-ff-near-black hover:bg-ff-near-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-near-black"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* ── Active slide text ── */}
          <div className="mt-8 min-h-56 lg:mt-10" aria-live={playing ? 'off' : 'polite'}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mod(index, count)}
                variants={textGroup}
                initial="enter"
                animate={seen ? 'center' : 'enter'}
                exit="exit"
                className="grid gap-4 lg:grid-cols-12 lg:gap-12"
              >
                {/* Big outlined punch word — falls back to the slide number */}
                <div className="min-w-0 lg:col-span-5">
                  <Mask>
                    <motion.span variants={rise} className="block" aria-hidden>
                      <PunchWord text={slide.punchWord || pad(mod(index, count) + 1)} />
                    </motion.span>
                  </Mask>
                </div>

                <div className="min-w-0 lg:col-span-7 lg:pt-3">
                  {slide.label ? (
                    <motion.p
                      variants={fadeUp}
                      className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ff-near-black/55"
                    >
                      {slide.label}
                    </motion.p>
                  ) : null}
                  <h3 className="mt-2 text-subheading font-display font-bold tracking-[-0.02em] text-ff-near-black">
                    <Mask className="pb-[0.1em] -mb-[0.1em]">
                      <motion.span variants={rise} className="block">
                        {slide.title}
                      </motion.span>
                    </Mask>
                  </h3>
                  {slide.description ? (
                    <motion.p
                      variants={fadeUp}
                      className="mt-3 max-w-xl text-body-lg leading-relaxed text-ff-gray-text"
                    >
                      {slide.description}
                    </motion.p>
                  ) : null}
                  {slide.href && slide.buttonLabel ? (
                    <motion.div variants={fadeUp} className="mt-6">
                      <Link
                        href={slide.href}
                        className="group inline-flex items-center gap-3 rounded-full bg-ff-near-black py-3 pl-6 pr-3 font-display text-sm font-bold text-white transition-colors hover:bg-black"
                      >
                        {slide.buttonLabel}
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ff-near-black transition-transform duration-300 group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </span>
                      </Link>
                    </motion.div>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Every slide's text for search engines: the panel above only renders
            the active slide. `hidden` keeps it out of view and away from screen
            readers (they get the live panel); crawlers still read it. */}
        <div hidden>
          {items.map((item) => (
            <article key={item.key}>
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
              {item.href && item.buttonLabel ? <a href={item.href}>{item.buttonLabel}</a> : null}
            </article>
          ))}
        </div>
      </section>
    </MotionConfig>
  )
}
