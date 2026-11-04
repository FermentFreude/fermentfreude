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
  /** Label colour per variety (hex) */
  accent: string | null
  /** Product image size tweak (1 = default) */
  scale: number
  /** Workshops slide may have no picture */
  image: LayerImage | null
  ingredients: LayerImage | null
  /** Optional photo behind everything */
  background: LayerImage | null
  /** Shade strength over the background, 0–80 (%) */
  backgroundVeil: number
  /** Text colour on the photo: cream on a dark shade, or charcoal on an ivory shade */
  textTone: 'light' | 'dark'
  /** Workshops slide: the active workshops with their next date */
  workshops: { title: string; href: string; date: string | null }[] | null
  seasonalLabel: string
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

const pad = (n: number) => String(n).padStart(2, '0')

/* ── When a card starts sliding in, the text animates in (slow and smooth);
 *  the product and ingredients are tied to the scroll and rise into place
 *  from different depths as the card arrives */
const T_LABEL = 0.6
const T_INFO = 0.75
const SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1]

const wordGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.12, delayChildren: 0 } },
}
/* One soft rise per line — calmer than letter by letter */
const lineIn: Variants = {
  enter: { y: '105%' },
  center: { y: '0%', transition: { duration: 1.1, ease: SMOOTH } },
}
const infoGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.1, delayChildren: T_INFO } },
}
/* Small label above the big word: comes with "the rest" */
const labelIn: Variants = {
  enter: { opacity: 0, y: '60%' },
  center: { opacity: 1, y: '0%', transition: { duration: 0.9, ease: SMOOTH, delay: T_LABEL } },
}
const fadeUp: Variants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 0.9, ease: SMOOTH } },
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
  accent,
  light,
  active,
  sharedSize,
  onFit,
}: {
  text: string
  /** Small label at the top right of the word (e.g. the tempeh variety) */
  eyebrow: string | null
  accent: string | null
  light: boolean
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
        className={cn(
          'flex flex-col items-end font-display font-bold leading-[0.86] tracking-[-0.035em]',
          light ? 'text-[#F9F0DC]' : 'text-[#1D1D1D]',
        )}
        style={{ fontSize: size ? `${size}px` : '10vw', opacity: size ? 1 : 0 }}
      >
        {eyebrow ? (
          // Label at the top right, scaled with the word
          // Mask with room below, so the dot and letters aren't clipped; the
          // negative margin keeps the label tight on the word
          <span className="-mb-[0.02em] block overflow-hidden pr-[0.04em] pt-[0.01em] pb-[0.025em]">
            <motion.span
              variants={labelIn}
              className="flex items-center gap-[0.6em] text-[max(11px,0.048em)] uppercase leading-[1.2] tracking-[0.2em]"
              style={{ color: accent ?? (light ? 'rgba(249,240,220,0.8)' : 'rgba(29,29,29,0.75)') }}
            >
              {/* Colour dot + name: tells the varieties apart at a glance */}
              {accent ? (
                <span
                  aria-hidden
                  className="inline-block size-[0.75em] rounded-full"
                  style={{ backgroundColor: accent }}
                />
              ) : null}
              {eyebrow}
            </motion.span>
          </span>
        ) : null}
        {lines.map((line, li) => (
          // Mask per line; padding keeps umlauts and descenders inside it
          <span key={li} className="flex justify-center overflow-hidden pt-[0.06em] pb-[0.02em]">
            <motion.span variants={lineIn} className="inline-block whitespace-nowrap">
              {line}
            </motion.span>
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
  const active = useInView(ref, { once: true, amount: 0.12 })
  const arrival = useArrival(ref)

  const onPhoto = Boolean(slide.background)
  const light = onPhoto && slide.textTone === 'light'
  /* Text colours: charcoal on beige/ivory, cream on a dark photo */
  const ink = light ? 'text-[#F9F0DC]' : 'text-[#1D1D1D]'
  const inkSoft = light ? 'text-[#F9F0DC]/75' : 'text-[#1D1D1D]/75'
  const inkMuted = light ? 'text-[#F9F0DC]/60' : 'text-[#1D1D1D]/55'
  const rule = light ? 'border-[#F9F0DC]/20' : 'border-[#1D1D1D]/12'

  // As the panel slides in, the product and ingredients lift into place
  // Product + ingredients follow the scroll: 1 = still below, 0 = in place.
  // A soft spring keeps it smooth between wheel steps.
  const lift = useSpring(useTransform(arrival, [0.15, 0.95], [1, 0], { clamp: true }), {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  })
  const productOpacity = useTransform(lift, [0.75, 0.15], [0, 1])
  const ingrOpacity = useTransform(lift, [0.6, 0], [0, 1])
  const productY = useTransform(() => lift.get() * 160)
  const productRotate = useTransform(() => lift.get() * 6)
  const ingrY = useTransform(() => lift.get() * 320)

  // A touch smaller than the stage so the huge word stays readable around it
  const imageBox = 'relative h-[80%] w-[76%] sm:w-[56%] lg:-mt-[5%] lg:h-[76%] lg:w-[40%]'
  // Without a product picture the word needs less room on phones
  const stageHeight = slide.image
    ? 'h-96 sm:h-120 lg:h-[calc(100svh-4rem)]'
    : 'h-38 sm:h-64 lg:h-[calc(100svh-4rem)]'

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
      className="relative isolate flex min-h-svh flex-col bg-[#EFE3D5]"
    >
      {slide.background ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src={slide.background.src}
            alt=""
            fill
            sizes="100vw"
            draggable={false}
            className="object-cover"
          />
          {/* Shade for readability: stronger at the bottom where the text sits */}
          {slide.backgroundVeil > 0 ? (
            <div
              className="absolute inset-0"
              style={{
                background: (() => {
                  const v = slide.backgroundVeil / 100
                  const rgb = light ? '0,0,0' : '249,240,220'
                  const bottom = Math.min(light ? 0.9 : 0.97, v + (light ? 0.5 : 0.6))
                  const mid = Math.min(0.85, v + 0.3)
                  return `linear-gradient(to top, rgba(${rgb},${bottom}) 0%, rgba(${rgb},${bottom}) 18%, rgba(${rgb},${mid.toFixed(2)}) 55%, rgba(${rgb},${(v * 0.45).toFixed(2)}) 100%)`
                })(),
              }}
            />
          ) : null}
        </div>
      ) : null}
      <div className="container mx-auto container-padding flex-1">
        <div className="relative h-full">
          {tagline ? (
            <p
              ref={taglineRef}
              className={cn(
                'relative z-30 whitespace-pre-line pt-8 font-display text-xs font-bold uppercase leading-normal tracking-[0.12em] lg:absolute lg:left-0 lg:top-0 lg:pt-10',
                light ? 'text-[#F9F0DC]/85' : 'text-[#1D1D1D]/80',
              )}
            >
              {tagline}
            </p>
          ) : null}

          {/* ── Stage: word, product, ingredients ── */}
          <div ref={stageRef} className={cn('relative', stageHeight)}>
            <motion.div
              className="absolute inset-x-0 top-[6%] bottom-[10%] lg:top-[13%] lg:bottom-[36%]"
              style={band ?? undefined}
            >
              <h2 className="sr-only">{slide.name}</h2>
              <BigWord
                eyebrow={slide.eyebrow}
                accent={slide.accent}
                light={light}
                text={slide.bigWord}
                active={active}
                sharedSize={wordSize}
                onFit={reportFit}
              />
            </motion.div>

            <motion.div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              style={reduce ? undefined : { y: productY, rotate: productRotate }}
            >
              {/* 2 · Product: rises with the scroll as the card slides in */}
              <motion.div
                className="flex h-full w-full items-center justify-center"
                style={{ opacity: reduce ? 1 : productOpacity }}
              >
                <div className={imageBox} style={{ scale: slide.scale }}>
                  {slide.image ? <LayerImg img={slide.image} shadow /> : null}
                </div>
              </motion.div>
            </motion.div>

            {slide.ingredients ? (
              <motion.div
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                style={reduce ? undefined : { y: ingrY }}
              >
                {/* 3 · Ingredients: follow the product, from further down */}
                <motion.div
                  className="flex h-full w-full items-center justify-center"
                  // Rises from further down than the product → depth on scroll
                  style={{ opacity: reduce ? 1 : ingrOpacity }}
                >
                  <div className={imageBox}>
                    <LayerImg img={slide.ingredients} />
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </div>

          {/* ── Info: centred under the product on phone/tablet, bottom left on desktop ── */}
          <motion.div
            ref={infoRef}
            variants={infoGroup}
            initial="enter"
            animate={active ? 'center' : 'enter'}
            className={cn(
              'relative z-30 mx-auto pb-8 lg:absolute lg:bottom-0 lg:left-0 lg:mx-0 lg:pb-10 lg:text-left',
              slide.workshops ? 'w-full max-w-md text-left' : 'max-w-xs text-center',
            )}
          >
            <motion.p
              variants={fadeUp}
              className={cn('mb-3 font-display text-[11px] font-bold tabular-nums tracking-[0.14em]', inkMuted)}
            >
              {pad(index + 1)} / {pad(count)}
            </motion.p>
            <motion.h3
              variants={fadeUp}
              className={cn('font-display text-base font-bold uppercase tracking-[0.04em]', ink)}
            >
              {slide.name}
            </motion.h3>
            {slide.text ? (
              <motion.p variants={fadeUp} className={cn('mb-0 mt-2 text-base leading-relaxed', inkSoft)}>
                {slide.text}
              </motion.p>
            ) : null}
            {slide.workshops?.length ? (
              /* The workshops, one calm row each: name left, next date right */
              <motion.ul variants={fadeUp} className={cn('mt-5 border-t', rule)}>
                {slide.workshops.map((w) => (
                  <li key={w.href} className={cn('border-b', rule)}>
                    <Link
                      href={w.href}
                      className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className={cn('font-display text-base font-bold', ink)}>{w.title}</span>
                      {/* Next date as a small gold label (dark text: readable on ivory and on photos);
                          no date → quiet outlined label */}
                      <span
                        className={cn(
                          'w-fit shrink-0 rounded-full px-3 py-1 text-sm font-bold sm:self-center',
                          w.date
                            ? 'bg-[#E6BE68] text-[#1A1A1A]'
                            : cn('border font-normal', rule, inkMuted),
                        )}
                      >
                        {w.date ?? slide.seasonalLabel}
                      </span>
                    </Link>
                  </li>
                ))}
              </motion.ul>
            ) : null}
            {slide.price ? (
              <motion.p
                variants={fadeUp}
                className={cn('mb-0 mt-4 font-display text-3xl font-bold leading-none tracking-[-0.02em]', ink)}
              >
                {slide.price}
              </motion.p>
            ) : null}
            {slide.meta ? (
              <motion.p variants={fadeUp} className={cn('mb-0 mt-2 text-xs', inkMuted)}>
                {slide.meta}
              </motion.p>
            ) : null}
            {slide.href ? (
              <motion.div variants={fadeUp} className="mt-5">
                <Link
                  href={slide.href}
                  className={cn(
                    'group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full py-2.5 pl-6 pr-3 font-display text-sm font-bold transition-colors sm:w-auto',
                    light
                      ? 'bg-[#E6BE68] text-[#1A1A1A] hover:bg-[#EDD195]'
                      : 'bg-[#1D1D1D] text-white hover:bg-black',
                  )}
                >
                  {slide.buttonLabel}
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45',
                      light ? 'bg-[#1A1A1A] text-[#E6BE68]' : 'bg-white text-[#1D1D1D]',
                    )}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* ── Trust points along the bottom ── */}
      {trustPoints.length && !slide.workshops ? (
        <div className={cn('relative z-30 border-t', rule)}>
          <ul className="container mx-auto container-padding flex gap-6 overflow-x-auto py-4 [scrollbar-width:none] lg:justify-between lg:gap-4">
            {trustPoints.map((t, i) => (
              <li
                key={i}
                className={cn('shrink-0 whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.14em]', inkSoft)}
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
    <nav
      aria-label={label}
      className="pointer-events-auto flex items-stretch gap-4 transition-colors duration-500"
      // Follows the slide on screen: cream on a dark photo, charcoal on a light one
      style={
        {
          '--idx':
            slides[current]?.background && slides[current]?.textTone === 'light'
              ? '#F9F0DC'
              : '#1D1D1D',
        } as React.CSSProperties
      }
    >
      {/* Overall progress through the products */}
      <span className="relative w-0.5 overflow-hidden rounded-full bg-[var(--idx)]/15" aria-hidden>
        <motion.span
          className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-[var(--idx)]"
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
                    active ? 'text-[var(--idx)]' : 'text-[var(--idx)]/40 group-hover:text-[var(--idx)]/75',
                  )}
                >
                  {pad(i + 1)}
                </span>
                <span
                  className={cn(
                    'h-0.5 rounded-full transition-all duration-500 ease-out',
                    active ? 'w-8 bg-[var(--idx)]' : 'w-3 bg-[var(--idx)]/25 group-hover:w-5',
                  )}
                />
                <span
                  className={cn(
                    'whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-500',
                    active ? 'text-[var(--idx)]' : 'text-[var(--idx)]/40 group-hover:text-[var(--idx)]/75',
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
          <StackPanel key={slide.key} index={i} last={i === slides.length - 1} sink={false}>
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
          <div className="pointer-events-none absolute inset-0 z-60 hidden lg:block">
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
              {s.workshops?.map((w) => (
                <a key={w.href} href={w.href}>
                  {w.title}
                </a>
              ))}
              {s.href ? <a href={s.href}>{s.buttonLabel}</a> : null}
            </article>
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}
