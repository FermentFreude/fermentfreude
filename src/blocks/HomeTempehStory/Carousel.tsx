'use client'

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
import { useCallback, useEffect, useRef, useState } from 'react'

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
  title: string
  description?: string | null
  image: MediaType | null
  href?: string
  buttonLabel?: string
}

type Props = {
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

/** Clips its child so it can rise in from below / lift out above. */
function Mask({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('block overflow-hidden', className)}>{children}</span>
}

export function HomeTempehStoryCarousel({ heading, slides: items, locale }: Props) {
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
          {/* ── Header: huge heading, rises in when first seen ── */}
          <div>
            <motion.h2
              initial="enter"
              animate={seen ? 'center' : 'enter'}
              variants={textGroup}
              className="font-display text-[clamp(2.75rem,8vw,7.5rem)] font-bold leading-[0.92] tracking-[-0.045em] text-ff-near-black"
            >
              <Mask className="pb-[0.08em] -mb-[0.08em]">
                <motion.span variants={rise} className="block">
                  {heading}
                </motion.span>
              </Mask>
            </motion.h2>
          </div>

          {/* ── Stage ── */}
          <div
            className="mt-10 grid gap-8 outline-none lg:mt-14 lg:grid-cols-12 lg:gap-14"
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
              className="relative aspect-[4/5] cursor-grab touch-pan-y overflow-hidden rounded-[2rem] bg-[#ECE5DE] active:cursor-grabbing sm:aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:min-h-[36rem] [&_img]:pointer-events-none"
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

            {/* Text + controls */}
            <div className="flex flex-col lg:col-span-5">
              <div className="flex-1" aria-live={playing ? 'off' : 'polite'}>
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.div
                    key={slide.key}
                    variants={textGroup}
                    initial="enter"
                    animate={seen ? 'center' : 'enter'}
                    exit="exit"
                    className="flex h-full min-h-[17rem] flex-col justify-center lg:min-h-0"
                  >
                    {/* Big outlined slide number */}
                    <Mask>
                      <motion.span
                        variants={rise}
                        className="block font-display text-[clamp(4.5rem,9vw,8.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_#1a1a1a]"
                        aria-hidden
                      >
                        {pad(index + 1)}
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
                        '  font-display text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ff-near-black',
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
                        <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-ff-near-black/15 transition-colors group-hover:bg-ff-near-black/30">
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
      </section>
    </MotionConfig>
  )
}
