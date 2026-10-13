'use client'

import { StackPanel } from '@/components/StackPanel'
import { cn } from '@/utilities/cn'
import { ArrowUpRight } from 'lucide-react'
import {
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  PRODUCT SHOWCASE — one full-screen card per product, stacked on scroll.
 *
 *  Each product is its own panel; scrolling slides the next one up over it
 *  with rounded top corners (StackPanel), the covered one gently sinks back.
 *  Inside a panel, three depth layers follow the pointer:
 *    big word (back, slowest) · product (middle) · ingredients (front, most)
 *  As a panel slides in, its word letters rise and the product lifts into
 *  place. A fixed product index on the side shows where you are and jumps
 *  to a product on click.
 * ═══════════════════════════════════════════════════════════════ */

/** One image layer — from public/showcase (code) or a CMS fallback */
export type LayerImage = { src: string; width: number; height: number; alt: string }

export type ShowcaseSlide = {
  key: string
  bigWord: string
  eyebrow: string | null
  /** Product image size tweak (1 = default) */
  scale: number
  image: LayerImage
  ingredients: LayerImage | null
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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const pad = (n: number) => String(n).padStart(2, '0')

/* ── Entrance order when a card arrives: word → product → the rest ──
 *  so there is time to read the title before more appears */
const T_PRODUCT = 0.45
const T_REST = 1.25

const wordGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
}
const letter: Variants = {
  enter: { y: '105%' },
  center: { y: '0%', transition: { duration: 0.8, ease: EASE } },
}
const infoGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.08, delayChildren: T_REST + 0.15 } },
}
/* Small label above the big word: comes with "the rest" */
const labelIn: Variants = {
  enter: { opacity: 0, y: '60%' },
  center: { opacity: 1, y: '0%', transition: { duration: 0.6, ease: EASE, delay: T_REST } },
}
const fadeUp: Variants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/** One layer image, filling its box and keeping its proportions */
function LayerImg({ img, shadow }: { img: LayerImage; shadow?: boolean }) {
  return (
    <Image
      src={img.src}
      alt={img.alt}
      fill
      sizes="(max-width: 1024px) 90vw, 60vw"
      draggable={false}
      className={cn('object-contain', shadow && 'drop-shadow-[0_24px_30px_rgba(60,40,20,0.18)]')}
    />
  )
}

/**
 * The big word, sized so its widest line spans the stage width without
 * getting taller than the stage. One mask per line; letters are animated.
 */
function BigWord({
  text,
  eyebrow,
  active,
  sharedSize,
  onFit,
}: {
  text: string
  /** Small label at the top right of the word (e.g. the tempeh variety) */
  eyebrow: string | null
  active: boolean
  /** One size for every product's word (the smallest that fits them all) */
  sharedSize: number | null
  onFit: (size: number) => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
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
      // Lines are 0.86em tall; the small label above takes ~0.06em of the word size
      const byHeight = box.clientHeight / (lines.length * 0.86 + (eyebrow ? 0.06 : 0))
      // Report the largest size at which this word fits; the parent picks the
      // smallest of all words so every product uses the same size
      onFit(Math.min(byWidth, byHeight) * 0.96)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [text, eyebrow, lines.length, onFit])
  const size = sharedSize

  return (
    <div ref={boxRef} className="relative flex h-full w-full items-center justify-center">
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
        animate={active ? 'center' : 'enter'}
        className="flex flex-col items-end font-display font-bold leading-[0.86] tracking-[-0.035em] text-[#1D1D1D]"
        style={{ fontSize: size ? `${size}px` : '10vw', opacity: size ? 1 : 0 }}
      >
        {eyebrow ? (
          // Label at the top right, scaled with the word
          <span className="block overflow-hidden pr-[0.04em]">
            <motion.span
              variants={labelIn}
              className="block text-[max(11px,0.048em)] uppercase leading-none tracking-[0.2em] text-[#1D1D1D]/75"
              style={{ marginBottom: '-0.2em' }}
            >
              {eyebrow}
            </motion.span>
          </span>
        ) : null}
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

/** 0 while the panel is below the screen → 1 once its top reaches the top */
function useArrival(ref: React.RefObject<HTMLElement | null>): MotionValue<number> {
  const value = useMotionValue(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const top = el.getBoundingClientRect().top
      value.set(Math.min(1, Math.max(0, 1 - top / window.innerHeight)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref, value])
  return value
}

function ProductPanel({
  slide,
  index,
  count,
  tagline,
  trustPoints,
  wordSize,
  onWordFit,
}: {
  slide: ShowcaseSlide
  index: number
  count: number
  tagline: string | null
  trustPoints: string[]
  wordSize: number | null
  onWordFit: (index: number, size: number) => void
}) {
  const reportFit = React.useCallback((size: number) => onWordFit(index, size), [index, onWordFit])
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const active = useInView(ref, { once: true, amount: 0.6 })
  const arrival = useArrival(ref)

  /* Pointer parallax — each layer moves a different amount */
  const px = useSpring(0, { stiffness: 60, damping: 18 })
  const py = useSpring(0, { stiffness: 60, damping: 18 })
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  // As the panel slides in, the product and ingredients lift into place
  const lift = useTransform(arrival, [0, 1], [1, 0])
  const wordX = useTransform(() => px.get() * -18)
  const wordY = useTransform(() => py.get() * -12)
  const productX = useTransform(() => px.get() * 26)
  const productY = useTransform(() => py.get() * 18 + lift.get() * 90)
  const productRotate = useTransform(() => lift.get() * 6)
  const ingrX = useTransform(() => px.get() * 60)
  const ingrY = useTransform(() => py.get() * 42 + lift.get() * 180)
  const ingrRotate = useTransform(() => px.get() * 4)

  // A touch smaller than the stage so the huge word stays readable around it
  const imageBox = 'relative h-[80%] w-[76%] sm:w-[56%] lg:-mt-[5%] lg:h-[76%] lg:w-[40%]'

  /* Desktop: the big word sits exactly in the free band between the tagline
   * and the product text, so it never touches either — on any screen height */
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const [band, setBand] = useState<{ top: number; bottom: number } | null>(null)
  useLayoutEffect(() => {
    const stage = stageRef.current
    const info = infoRef.current
    if (!stage || !info) return
    const GAP = 28
    const measure = () => {
      if (window.innerWidth < 1024) return setBand(null)
      const st = stage.getBoundingClientRect()
      const tagBottom = taglineRef.current?.getBoundingClientRect().bottom ?? st.top
      // offsetTop/Height ignore the info's own entrance animation (transform)
      const infoTop = info.offsetTop - stage.offsetTop
      setBand({
        top: Math.max(0, tagBottom - st.top) + GAP,
        bottom: Math.max(0, stage.offsetHeight - infoTop) + GAP,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    observer.observe(info)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={`showcase-${index}`}
      aria-label={slide.name}
      className="relative flex min-h-svh flex-col bg-[#EFE3D5]"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="container mx-auto container-padding flex-1">
        <div className="relative h-full">
          {tagline ? (
            <p
              ref={taglineRef}
              className="relative z-30 whitespace-pre-line pt-8 font-display text-xs font-bold uppercase leading-[1.5] tracking-[0.12em] text-[#1D1D1D]/80 lg:absolute lg:left-0 lg:top-0 lg:pt-10"
            >
              {tagline}
            </p>
          ) : null}

          {/* ── Stage: word, product, ingredients ── */}
          <div ref={stageRef} className="relative h-[24rem] sm:h-[30rem] lg:h-[calc(100svh-4rem)]">
            <motion.div
              className="absolute inset-x-0 top-[6%] bottom-[10%] lg:top-[13%] lg:bottom-[36%]"
              style={{ ...(band ?? {}), ...(reduce ? {} : { x: wordX, y: wordY }) }}
            >
              <h2 className="sr-only">{slide.name}</h2>
              <BigWord
                eyebrow={slide.eyebrow}
                text={slide.bigWord}
                active={active}
                sharedSize={wordSize}
                onFit={reportFit}
              />
            </motion.div>

            <motion.div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              style={reduce ? undefined : { x: productX, y: productY, rotate: productRotate }}
            >
              {/* 2 · Product: appears just after the word */}
              <motion.div
                className="flex h-full w-full items-center justify-center"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={
                  active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 40 }
                }
                transition={{ duration: 0.9, ease: EASE, delay: T_PRODUCT }}
              >
                <motion.div
                  className={imageBox}
                  style={{ scale: slide.scale }}
                  animate={reduce ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
                >
                  <LayerImg img={slide.image} shadow />
                </motion.div>
              </motion.div>
            </motion.div>

            {slide.ingredients ? (
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                style={reduce ? undefined : { x: ingrX, y: ingrY, rotate: ingrRotate }}
              >
                {/* 3 · Ingredients: burst in with the rest, after the title */}
                <motion.div
                  className="flex h-full w-full items-center justify-center"
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.15 }}
                  transition={{ duration: 1, ease: EASE, delay: T_REST }}
                >
                  <motion.div
                    className={imageBox}
                    animate={reduce ? undefined : { y: [0, 10, 0], rotate: [0, 1.2, 0] }}
                    transition={{ duration: 7.5, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
                  >
                    <LayerImg img={slide.ingredients} />
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : null}
          </div>

          {/* ── Info, bottom left ── */}
          <motion.div
            ref={infoRef}
            variants={infoGroup}
            initial="enter"
            animate={active ? 'center' : 'enter'}
            className="relative z-30 max-w-xs pb-8 lg:absolute lg:bottom-0 lg:left-0 lg:pb-10"
          >
            <motion.p
              variants={fadeUp}
              className="mb-3 font-display text-[11px] font-bold tabular-nums tracking-[0.14em] text-[#1D1D1D]/50"
            >
              {pad(index + 1)} / {pad(count)}
            </motion.p>
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
        </div>
      </div>

      {/* ── Trust points along the bottom ── */}
      {trustPoints.length ? (
        <div className="relative z-30 border-t border-[#1D1D1D]/12">
          <ul className="container mx-auto container-padding flex gap-6 overflow-x-auto py-4 [scrollbar-width:none] lg:justify-between lg:gap-4">
            {trustPoints.map((t, i) => (
              <li
                key={i}
                className="shrink-0 whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1D1D]/70"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

/** Fixed product index, bottom right (desktop): where you are, click to jump */
function ProductIndex({
  slides,
  containerRef,
  label,
}: {
  slides: ShowcaseSlide[]
  containerRef: React.RefObject<HTMLDivElement | null>
  label: string
}) {
  const [current, setCurrent] = useState(0)
  const progress = useMotionValue(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = containerRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const step = window.innerHeight
      const p = (window.scrollY - top) / step
      const i = Math.min(slides.length - 1, Math.max(0, Math.round(p)))
      setCurrent(i)
      progress.set(Math.min(1, Math.max(0, p / Math.max(1, slides.length - 1))))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [containerRef, slides.length, progress])

  const jump = (i: number) => {
    const el = containerRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + i * window.innerHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <nav aria-label={label} className="pointer-events-auto flex items-stretch gap-4">
      {/* Overall progress through the products */}
      <span className="relative w-0.5 overflow-hidden rounded-full bg-[#1D1D1D]/15" aria-hidden>
        <motion.span
          className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-[#1D1D1D]"
          style={{ scaleY: progress }}
        />
      </span>
      <ol className="flex flex-col gap-1">
        {slides.map((s, i) => {
          const active = i === current
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-current={active ? 'true' : undefined}
                className="group flex cursor-pointer items-center gap-3 py-1 text-left"
              >
                <span
                  className={cn(
                    'font-display text-[11px] font-bold tabular-nums transition-colors duration-500',
                    active ? 'text-[#1D1D1D]' : 'text-[#1D1D1D]/35 group-hover:text-[#1D1D1D]/70',
                  )}
                >
                  {pad(i + 1)}
                </span>
                <span
                  className={cn(
                    'h-0.5 rounded-full transition-all duration-500 ease-out',
                    active ? 'w-8 bg-[#1D1D1D]' : 'w-3 bg-[#1D1D1D]/25 group-hover:w-5',
                  )}
                />
                <span
                  className={cn(
                    'whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-500',
                    active ? 'text-[#1D1D1D]' : 'text-[#1D1D1D]/35 group-hover:text-[#1D1D1D]/70',
                  )}
                >
                  {s.name}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ProductShowcaseStack({ tagline, slides, trustPoints, locale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const label = locale === 'en' ? 'Products' : 'Produkte'

  // Every product's big word at the same size: the largest that fits all of them
  const [fits, setFits] = useState<Record<number, number>>({})
  const onWordFit = React.useCallback((i: number, size: number) => {
    setFits((prev) => (Math.abs((prev[i] ?? 0) - size) < 0.5 ? prev : { ...prev, [i]: size }))
  }, [])
  const known = Object.values(fits)
  const wordSize = known.length === slides.length ? Math.min(...known) : null

  return (
    <MotionConfig reducedMotion="user">
      <div ref={containerRef} className="relative" aria-label={label} role="region">
        {slides.map((slide, i) => (
          <StackPanel key={slide.key} index={i} last={i === slides.length - 1}>
            <ProductPanel
              slide={slide}
              index={i}
              count={slides.length}
              tagline={tagline}
              trustPoints={trustPoints}
              wordSize={wordSize}
              onWordFit={onWordFit}
            />
          </StackPanel>
        ))}

        {/* Index overlay: spans all panels, its inner part sticks to the screen */}
        {slides.length > 1 ? (
          <div className="pointer-events-none absolute inset-0 z-[60] hidden lg:block">
            <div className="sticky top-0 flex h-svh items-end justify-end pb-24 pr-[max(4rem,calc((100vw-86rem)/2+4rem))]">
              <ProductIndex slides={slides} containerRef={containerRef} label={label} />
            </div>
          </div>
        ) : null}

        {/* Every product's text for search engines */}
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
      </div>
    </MotionConfig>
  )
}
