'use client'

import { SectionHeader } from '@/components/SectionHeader'
import { Media } from '@/components/Media'
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
 *  TEMPEH STORY CAROUSEL — every slide (product first, then the story)
 *  comes from the CMS: photo, small label, title, text, optional button.
 *
 *  Photo (left) wipes in over the previous one, which drifts back
 *  underneath. Text (right) rises in line by line behind masks.
 *  A story-style progress bar plays each slide; it pauses on hover,
 *  keyboard focus, off-screen, or with reduced motion.
 *  Drag / swipe the photo, use the arrows, or ← → keys.
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

const AUTOPLAY_SECONDS = 7
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 400
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const pad = (n: number) => String(n).padStart(2, '0')

/* ── Photo: new one wipes in from the travel direction, old one drifts back ── */
const photo: Variants = {
  enter: (dir: number) => ({
    clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
    scale: 1.15,
    zIndex: 2,
  }),
  center: {
    clipPath: 'inset(0% 0% 0% 0%)',
    scale: 1,
    x: '0%',
    zIndex: 2,
    transition: {
      clipPath: { duration: 1, ease: EASE },
      scale: { duration: 1.4, ease: EASE },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-10%' : '10%',
    scale: 0.96,
    zIndex: 1,
    transition: { duration: 1, ease: EASE },
  }),
}

/* ── Text: masked lines rise in, lift out ── */
const textGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.03 } },
}
const rise: Variants = {
  enter: { y: '110%' },
  center: { y: '0%', transition: { duration: 0.8, ease: EASE } },
  exit: { y: '-110%', transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
}
const fadeUp: Variants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

/**
 * The big outlined word (or number) above each slide's text. Starts at the
 * full display size; a long word shrinks just enough to fit the column instead
 * of overflowing it.
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

export function HomeTempehStoryCarousel({ eyebrow, heading, slides: items, locale }: Props) {
  const count = items.length

  const [[index, dir], setPage] = useState<[number, number]>([0, 1])
  const slide = items[index] ?? items[0]

  const sectionRef = useRef<HTMLElement>(null)
  const seen = useInView(sectionRef, { once: true, amount: 0.3 })
  const onScreen = useInView(sectionRef, { amount: 0.4 })
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const playing = Boolean(seen && onScreen && !hovered && !focused && !reduce && count > 1)

  /* ── Navigation ── */
  const progress = useMotionValue(0)
  const paginate = useCallback(
    (step: number) => {
      progress.set(0)
      setPage(([i]) => [(i + step + count) % count, step])
    },
    [count, progress],
  )
  const goTo = useCallback(
    (target: number) => {
      progress.set(0)
      setPage(([i]) => [target, target >= i ? 1 : -1])
    },
    [progress],
  )

  /* ── Autoplay: fills the active progress segment, then moves on ── */
  useEffect(() => {
    if (!playing) return
    const controls = animate(progress, 1, {
      // Resume from where a pause left off
      duration: AUTOPLAY_SECONDS * (1 - progress.get()),
      ease: 'linear',
      onComplete: () => paginate(1),
    })
    return () => controls.stop()
  }, [playing, index, paginate, progress])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) paginate(1)
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) paginate(-1)
  }

  const labels =
    locale === 'en'
      ? { prev: 'Previous slide', next: 'Next slide', goTo: 'Go to slide', slides: 'Slides' }
      : { prev: 'Vorherige Folie', next: 'Nächste Folie', goTo: 'Zu Folie', slides: 'Folien' }

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-label={heading}
        className="overflow-hidden bg-[#F6F0E8] section-padding-md"
      >
        <div className="container mx-auto container-padding">
          {/* ── Header — shared editorial pattern, fades in when first seen ── */}
          <motion.div initial="enter" animate={seen ? 'center' : 'enter'} variants={fadeUp}>
            <SectionHeader eyebrow={eyebrow} heading={heading} />
          </motion.div>

          {/* ── Stage ── */}
          <div
            className="mt-8 grid gap-8 outline-none lg:mt-10 lg:grid-cols-12 lg:gap-12"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') paginate(1)
              if (e.key === 'ArrowLeft') paginate(-1)
            }}
          >
            {/* Photo — opens up when first seen; drag / swipe to change */}
            <motion.div
              className="relative aspect-4/5 cursor-grab touch-pan-y overflow-hidden rounded-4xl bg-[#ECE5DE] active:cursor-grabbing sm:aspect-4/3 lg:col-span-7 lg:aspect-auto lg:h-[30rem] [&_img]:pointer-events-none"
              initial={{ clipPath: 'inset(8% 8% 8% 8% round 32px)' }}
              animate={{
                clipPath: seen ? 'inset(0% 0% 0% 0% round 32px)' : 'inset(8% 8% 8% 8% round 32px)',
              }}
              transition={{ duration: 1.2, ease: EASE }}
              drag={count > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={onDragEnd}
            >
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={slide.key}
                  custom={dir}
                  variants={photo}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  {slide.image ? (
                    <Media
                      resource={slide.image}
                      fill
                      imgClassName="object-cover"
                      size="(max-width: 1024px) 100vw, 58vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#ECE5DE]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Text + controls — min-w-0 so a long punch word can't widen the column (it shrinks to fit instead) */}
            <div className="flex min-w-0 flex-col lg:col-span-5">
              <div className="min-w-0 flex-1" aria-live={playing ? 'off' : 'polite'}>
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div
                    key={slide.key}
                    variants={textGroup}
                    initial="enter"
                    animate={seen ? 'center' : 'enter'}
                    exit="exit"
                    className="flex h-full min-h-68 flex-col justify-center lg:min-h-0"
                  >
                    {/* Big outlined punch word — falls back to the slide number.
                        Its line height (1.15) leaves room for descenders (g, p) inside the mask. */}
                    <Mask>
                      <motion.span variants={rise} className="block" aria-hidden>
                        <PunchWord text={slide.punchWord || pad(index + 1)} />
                      </motion.span>
                    </Mask>

                    {slide.label ? (
                      <motion.p
                        variants={fadeUp}
                        className="mt-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-ff-near-black/55"
                      >
                        {slide.label}
                      </motion.p>
                    ) : null}

                    <h3
                      className={cn(
                        slide.label ? 'mt-2' : 'mt-6',
                        '  text-subheading font-display font-bold tracking-[-0.02em] text-ff-near-black',
                      )}
                    >
                      <Mask className="pb-[0.1em] -mb-[0.1em]">
                        <motion.span variants={rise} className="block">
                          {slide.title}
                        </motion.span>
                      </Mask>
                    </h3>

                    {slide.description ? (
                      <motion.p
                        variants={fadeUp}
                        className="mt-4 max-w-md text-body-lg leading-relaxed text-ff-gray-text"
                      >
                        {slide.description}
                      </motion.p>
                    ) : null}

                    {slide.href && slide.buttonLabel ? (
                      <motion.div variants={fadeUp} className="mt-8">
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
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Story-style progress + arrows */}
              {count > 1 && (
                <div className="mt-10 flex items-center gap-5">
                  <div className="flex flex-1 gap-1.5" role="group" aria-label={labels.slides}>
                    {items.map((item, i) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`${labels.goTo} ${i + 1}: ${item.title}`}
                        aria-current={i === index ? 'true' : undefined}
                        // Tall invisible hit area, thin visible bar
                        className="group flex h-6 flex-1 cursor-pointer items-center"
                      >
                        <span className="relative h-0.75 w-full overflow-hidden rounded-full bg-ff-near-black/15 transition-colors group-hover:bg-ff-near-black/30">
                          <motion.span
                            className="absolute inset-0 origin-left rounded-full bg-ff-near-black"
                            style={{
                              scaleX: i === index ? (reduce ? 1 : progress) : i < index ? 1 : 0,
                            }}
                          />
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {[
                      { label: labels.prev, step: -1, Icon: ArrowLeft },
                      { label: labels.next, step: 1, Icon: ArrowRight },
                    ].map(({ label, step, Icon }) => (
                      <motion.button
                        key={label}
                        type="button"
                        onClick={() => paginate(step)}
                        aria-label={label}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.3 }}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-ff-near-black/20 text-ff-near-black transition-colors hover:border-ff-near-black hover:bg-ff-near-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-near-black"
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Every slide's text for search engines: the animated panel above only
            renders the active slide, so slides 2+ were missing from the HTML.
            `hidden` keeps it out of view and away from screen readers (they get
            the live panel), while crawlers still read the text and follow links. */}
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
