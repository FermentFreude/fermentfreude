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
  useScroll,
  useSpring,
  useTransform,
  type PanInfo,
  type Variants,
} from 'motion/react'
import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  PRODUCT SHOWCASE — one product at a time on a calm cream stage.
 *
 *  Three depth layers, each with its own parallax (mouse + scroll):
 *    1. BIG WORD   (back, slowest)  — the product name, huge, fitted
 *    2. PRODUCT    (middle)         — transparent cut-out, gently floating
 *    3. INGREDIENTS (front, fastest) — optional transparent layer
 *  Slide change: word letters lift out / rise in, the product swings
 *  in from the travel direction, ingredients burst in after it.
 *  Autoplay with a progress bar (pauses on mouse hover, focus,
 *  off-screen, reduced motion); swipe, arrows, ← → keys.
 * ═══════════════════════════════════════════════════════════════ */

export type ShowcaseSlide = {
  key: string
  bigWord: string
  image: MediaType
  ingredients: MediaType | null
  name: string
  text: string | null
  price: string | null
  meta: string | null
  href?: string
  buttonLabel: string
}

type Props = {
  tagline: string | null
  slides: ShowcaseSlide[]
  trustPoints: string[]
  locale: 'de' | 'en'
}

const AUTOPLAY_SECONDS = 6
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const pad = (n: number) => String(n).padStart(2, '0')
const mod = (n: number, m: number) => ((n % m) + m) % m

/* ── Big word: letters rise in behind line masks, lift out on exit ── */
const wordGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.012 } },
}
const letter: Variants = {
  enter: { y: '105%' },
  center: { y: '0%', transition: { duration: 0.75, ease: EASE } },
  exit: { y: '-105%', transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
}

/* ── Product: swings in from the travel direction ── */
const product: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: `${dir * 22}%`, rotate: dir * 7, scale: 0.9 }),
  center: {
    opacity: 1,
    x: '0%',
    rotate: 0,
    scale: 1,
    transition: { type: 'spring', visualDuration: 0.8, bounce: 0.15 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: `${dir * -22}%`,
    rotate: dir * -7,
    scale: 0.9,
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
  }),
}

/* ── Ingredients: burst in just after the product ── */
const ingredients: Variants = {
  enter: { opacity: 0, scale: 1.18 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE, delay: 0.15 } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.3 } },
}

/* ── Info panel ── */
const infoGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
  exit: {},
}
const fadeUp: Variants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
}

/**
 * The big word, sized so its widest line spans the stage width without
 * getting taller than the stage. One mask per line; letters are animated.
 */
function BigWord({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<number | null>(null)
  const lines = text
    .toUpperCase()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  useLayoutEffect(() => {
    const box = boxRef.current
    const measure = measureRef.current
    if (!box || !measure) return
    const fit = () => {
      // The hidden copy is set at 100px: scale from there
      const widest = Math.max(
        ...Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth),
      )
      if (!widest) return
      const byWidth = (box.clientWidth / widest) * 100
      const byHeight = box.clientHeight / (lines.length * 0.86)
      setSize(Math.min(byWidth, byHeight) * 0.98)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [text, lines.length])

  return (
    <div ref={boxRef} className="relative flex h-full w-full items-center justify-center">
      {/* Hidden copy at a fixed size, used only for measuring */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute font-display text-[100px] font-bold tracking-[-0.035em]"
      >
        {lines.map((l, i) => (
          <span key={i} className="block w-max whitespace-nowrap">
            {l}
          </span>
        ))}
      </div>

      <motion.div
        aria-hidden
        variants={wordGroup}
        initial="enter"
        animate="center"
        exit="exit"
        className="font-display font-bold leading-[0.86] tracking-[-0.035em] text-[#1D1D1D]"
        style={{ fontSize: size ? `${size}px` : '10vw', opacity: size ? 1 : 0 }}
      >
        {lines.map((line, li) => (
          // Mask per line; padding keeps umlauts and descenders inside it
          <span key={li} className="flex justify-center overflow-hidden pt-[0.06em] pb-[0.02em]">
            {Array.from(line).map((ch, i) => (
              <motion.span key={i} variants={letter} className="inline-block">
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function ProductShowcaseSlider({ tagline, slides, trustPoints, locale }: Props) {
  const count = slides.length
  const [[index, dir], setPage] = useState<[number, number]>([0, 1])
  const slide = slides[mod(index, count)]

  const sectionRef = useRef<HTMLElement>(null)
  const seen = useInView(sectionRef, { once: true, amount: 0.25 })
  const onScreen = useInView(sectionRef, { amount: 0.35 })
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const playing = Boolean(seen && onScreen && !hovered && !focused && !reduce && count > 1)

  /* ── Navigation + autoplay ── */
  const progress = useMotionValue(0)
  const paginate = useCallback(
    (step: number) => {
      progress.set(0)
      setPage(([i]) => [i + step, step])
    },
    [progress],
  )
  const goTo = useCallback(
    (target: number) => {
      progress.set(0)
      setPage(([i]) => {
        const current = mod(i, count)
        return [i + (target - current), target >= current ? 1 : -1]
      })
    },
    [count, progress],
  )
  useEffect(() => {
    if (!playing) return
    const controls = animate(progress, 1, {
      duration: AUTOPLAY_SECONDS * (1 - progress.get()),
      ease: 'linear',
      onComplete: () => paginate(1),
    })
    return () => controls.stop()
  }, [playing, index, paginate, progress])

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 50 && Math.abs(info.velocity.x) < 300) return
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) return
    paginate(info.offset.x < 0 ? 1 : -1)
  }

  /* ── Parallax: mouse position (desktop) + scroll through the section ── */
  const px = useSpring(0, { stiffness: 60, damping: 18 })
  const py = useSpring(0, { stiffness: 60, damping: 18 })
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  // Scroll progress from the section's own position: 0 entering below → 1 leaving above
  // height 0 = not measured yet → no scroll offset (same on server and first client render)
  const boxRef = useRef({ top: 0, height: 0 })
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      boxRef.current = { top: r.top + window.scrollY, height: Math.max(1, el.offsetHeight) }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])
  const { scrollY } = useScroll()
  const sp = useTransform(() => {
    const { top, height } = boxRef.current
    if (!height || typeof window === 'undefined') return 0
    const vh = window.innerHeight
    return Math.min(1, Math.max(0, (scrollY.get() - (top - vh)) / (height + vh))) - 0.5
  })
  const wordX = useTransform(() => px.get() * -18)
  const wordY = useTransform(() => py.get() * -12 + sp.get() * 70)
  const productX = useTransform(() => px.get() * 26)
  const productY = useTransform(() => py.get() * 18 + sp.get() * -50)
  const ingrX = useTransform(() => px.get() * 54)
  const ingrY = useTransform(() => py.get() * 38 + sp.get() * -110)

  const labels =
    locale === 'en'
      ? { prev: 'Previous product', next: 'Next product', goTo: 'Go to', products: 'Products' }
      : { prev: 'Vorheriges Produkt', next: 'Nächstes Produkt', goTo: 'Zu', products: 'Produkte' }

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-label={labels.products}
        className="relative overflow-hidden bg-[#EFE3D5]"
        onPointerMove={onPointerMove}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return
          setHovered(false)
          px.set(0)
          py.set(0)
        }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') paginate(1)
          if (e.key === 'ArrowLeft') paginate(-1)
        }}
      >
        <div className="container mx-auto container-padding">
          <div className="relative">
            {tagline ? (
              <p className="relative z-30 whitespace-pre-line pt-8 font-display text-xs font-bold uppercase leading-[1.5] tracking-[0.12em] text-[#1D1D1D]/80 lg:absolute lg:left-0 lg:top-0 lg:pt-10">
                {tagline}
              </p>
            ) : null}

            {/* ── Stage: word, product, ingredients ── */}
            <motion.div
              className="relative h-[24rem] touch-pan-y sm:h-[30rem] lg:h-[min(44rem,calc(100svh-5rem))]"
              onPanEnd={onPanEnd}
            >
              {/* 1 · Big word (back) */}
              <motion.div
                className="absolute inset-x-0 top-[6%] bottom-[10%] lg:top-[13%] lg:bottom-[36%]"
                style={reduce ? undefined : { x: wordX, y: wordY }}
              >
                <h2 className="sr-only">{slide.name}</h2>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mod(index, count)}
                    className="h-full w-full"
                    initial={seen ? 'enter' : false}
                    animate="center"
                    exit="exit"
                  >
                    {seen ? <BigWord text={slide.bigWord} /> : null}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* 2 · Product (middle) */}
              <motion.div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
                style={reduce ? undefined : { x: productX, y: productY }}
              >
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div
                    key={mod(index, count)}
                    custom={dir}
                    variants={product}
                    initial="enter"
                    animate={seen ? 'center' : 'enter'}
                    exit="exit"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Gentle idle float */}
                    <motion.div
                      className="relative h-[86%] w-[82%] sm:w-[62%] lg:-mt-[6%] lg:h-[84%] lg:w-[44%]"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
                    >
                      <Media
                        resource={slide.image}
                        fill
                        priority={false}
                        imgClassName="object-contain drop-shadow-[0_24px_30px_rgba(60,40,20,0.18)]"
                        size="(max-width: 1024px) 82vw, 46vw"
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* 3 · Ingredients (front) */}
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                style={reduce ? undefined : { x: ingrX, y: ingrY }}
              >
                <AnimatePresence initial={false}>
                  {slide.ingredients ? (
                    <motion.div
                      key={mod(index, count)}
                      variants={ingredients}
                      initial="enter"
                      animate={seen ? 'center' : 'enter'}
                      exit="exit"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="relative h-[86%] w-[82%] sm:w-[62%] lg:-mt-[6%] lg:h-[84%] lg:w-[44%]">
                        <Media
                          resource={slide.ingredients}
                          fill
                          imgClassName="object-contain"
                          size="(max-width: 1024px) 82vw, 46vw"
                        />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* ── Info (bottom left) + controls (bottom right) ── */}
            <div className="relative z-30 flex flex-col gap-6 pb-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between lg:pb-10">
              <div className="min-h-44 max-w-xs" aria-live={playing ? 'off' : 'polite'}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mod(index, count)}
                    variants={infoGroup}
                    initial="enter"
                    animate={seen ? 'center' : 'enter'}
                    exit="exit"
                  >
                    <motion.h3
                      variants={fadeUp}
                      className="font-display text-base font-bold uppercase tracking-[0.04em] text-[#1D1D1D]"
                    >
                      {slide.name}
                    </motion.h3>
                    {slide.text ? (
                      <motion.p
                        variants={fadeUp}
                        className="mb-0 mt-2 text-sm leading-relaxed text-[#1D1D1D]/75"
                      >
                        {slide.text}
                      </motion.p>
                    ) : null}
                    {slide.price ? (
                      <motion.p
                        variants={fadeUp}
                        className="mb-0 mt-4 font-display text-3xl font-bold leading-none tracking-[-0.02em] text-[#1D1D1D]"
                      >
                        {slide.price}
                      </motion.p>
                    ) : null}
                    {slide.meta ? (
                      <motion.p variants={fadeUp} className="mb-0 mt-2 text-xs text-[#1D1D1D]/65">
                        {slide.meta}
                      </motion.p>
                    ) : null}
                    {slide.href ? (
                      <motion.div variants={fadeUp} className="mt-5">
                        <Link
                          href={slide.href}
                          className="group inline-flex items-center gap-3 rounded-full bg-[#1D1D1D] py-2.5 pl-5 pr-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-black"
                        >
                          {slide.buttonLabel}
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1D1D1D] transition-transform duration-300 group-hover:rotate-45">
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        </Link>
                      </motion.div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {count > 1 && (
                <div className="flex items-center gap-5 lg:pb-1">
                  <div className="flex w-40 gap-1.5" role="group" aria-label={labels.products}>
                    {slides.map((s, i) => {
                      const active = i === mod(index, count)
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => goTo(i)}
                          aria-label={`${labels.goTo} ${s.name}`}
                          aria-current={active ? 'true' : undefined}
                          className="group flex h-6 flex-1 cursor-pointer items-center"
                        >
                          <span className="relative h-0.75 w-full overflow-hidden rounded-full bg-[#1D1D1D]/15">
                            <motion.span
                              className="absolute inset-0 origin-left rounded-full bg-[#1D1D1D]"
                              style={{
                                scaleX: active
                                  ? reduce
                                    ? 1
                                    : progress
                                  : i < mod(index, count)
                                    ? 1
                                    : 0,
                              }}
                            />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <span className="font-display text-xs font-bold tabular-nums tracking-[0.12em] text-[#1D1D1D]/60">
                    {pad(mod(index, count) + 1)} / {pad(count)}
                  </span>
                  <div className="flex gap-2">
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
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#1D1D1D]/25 text-[#1D1D1D] transition-colors hover:border-[#1D1D1D] hover:bg-[#1D1D1D] hover:text-white"
                      >
                        <Icon className="h-4.5 w-4.5" aria-hidden />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Trust points along the bottom ── */}
        {trustPoints.length ? (
          <div className="relative z-30 border-t border-[#1D1D1D]/12">
            <ul className="container mx-auto container-padding flex gap-6 overflow-x-auto py-4 [scrollbar-width:none] lg:justify-between lg:gap-4">
              {trustPoints.map((t, i) => (
                <li
                  key={i}
                  className={cn(
                    'shrink-0 whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1D1D]/70',
                  )}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Every product's text for search engines (the panel shows one at a time) */}
        <div hidden>
          {slides.map((s) => (
            <article key={s.key}>
              <h3>{s.name}</h3>
              {s.text ? <p>{s.text}</p> : null}
              {s.price ? <p>{s.price}</p> : null}
              {s.href ? <a href={s.href}>{s.buttonLabel}</a> : null}
            </article>
          ))}
        </div>
      </section>
    </MotionConfig>
  )
}
