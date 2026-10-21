'use client'

import { useFitSize } from '@/components/StoryScene/hooks'
import { SwipeCapsule, useSwipeNudge, useSwipeTrack } from '@/components/SwipeCapsule'
import type { FermentationStoryBlock as Props } from '@/payload-types'
import { ArrowRight, Leaf, Microscope, Sparkles, Sprout } from 'lucide-react'
import {
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { PICTURE_BY_SLOT, UPRIGHT_RATIO, type PictureSlot, type StoryPicture } from './layers'

/* ═══════════════════════════════════════════════════════════════
 *  FERMENTATION STORY — a full-screen sideways swipe row of cards:
 *  the intro card ("Warum Fermentation? / GESUND", button + benefits)
 *  and one card per topic. Phone/tablet: everything centred. Desktop:
 *  text top left; the picture centred two thirds along the word, or
 *  around the word itself (apple, carrot, leek). Every card has the same four rows, shared
 *  across all cards with CSS subgrid, so nothing jumps while swiping:
 *
 *    1 · number, title, text      (as tall as the tallest card's)
 *    2 · one huge word            (same size on every card)
 *    3 · the picture              (takes the room that is left — it
 *                                  shrinks instead of overlapping)
 *    4 · button (phone/tablet)    (desktop: in row 3)
 *
 *  While swiping, the word lags and the picture leads (parallax).
 *  Text is CMS; pictures live in code (layers.ts).
 * ═══════════════════════════════════════════════════════════════ */

const INK = '#1A1A1A' // brand near-black
const PAPER = '#FAF2E0'
const EASE = [0.16, 1, 0.3, 1] as const

const DEFAULTS = {
  title: 'Why fermentation?',
  bigWord: 'HEALTHY',
  buttonLabel: 'More about fermentation',
  buttonLink: '/fermentation',
}

const lineRise: Variants = {
  hidden: { y: '105%' },
  show: { y: '0%', transition: { duration: 1.1, ease: EASE, delay: 0.1 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: 0.2 + i * 0.07 },
  }),
}
const pictureIn: Variants = {
  hidden: { opacity: 0, y: 70, rotate: 5, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 16, mass: 0.9, delay: 0.35 },
  },
}

const pad = (n: number) => String(n).padStart(2, '0')

function BenefitIcon({ icon, className }: { icon?: string | null; className: string }) {
  if (icon === 'leaf') return <Leaf className={className} strokeWidth={1.25} />
  if (icon === 'sparkles') return <Sparkles className={className} strokeWidth={1.25} />
  if (icon === 'sprout') return <Sprout className={className} strokeWidth={1.25} />
  return <Microscope className={className} strokeWidth={1.25} />
}

type Benefit = NonNullable<Props['benefits']>[number]

type CardData = {
  key: string
  word: string
  title?: string | null
  text?: string | null
  sourceLabel?: string | null
  sourceUrl?: string | null
  picture?: StoryPicture
  button?: { label: string; href: string }
  benefits?: Benefit[]
}

function CardButton({ button }: { button: NonNullable<CardData['button']> }) {
  return (
    <Link
      href={button.href}
      className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full py-3 pl-6 pr-5 font-display text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(26,26,26,0.6)] transition-transform duration-300 ease-out hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      style={{ backgroundColor: INK }}
    >
      {button.label}
      <ArrowRight
        className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  )
}

/** Intro benefits. Compact (phone/tablet): icon + title in one row. Full (desktop):
 *  three columns with icon, title and short line. */
function Benefits({
  items,
  active,
  compact,
}: {
  items: Benefit[]
  active: boolean
  compact?: boolean
}) {
  if (compact) {
    return (
      <ul className="m-0 grid w-[min(22rem,100%)] list-none grid-cols-3 gap-2 p-0">
        {items.map((item, i) => (
          <motion.li
            key={item.id ?? i}
            custom={5 + i}
            variants={fadeUp}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <span
              className="flex size-8 items-center justify-center rounded-full border"
              style={{ borderColor: `${INK}26` }}
            >
              <BenefitIcon icon={item.icon} className="size-4" />
            </span>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em]">
              {item.title}
            </span>
          </motion.li>
        ))}
      </ul>
    )
  }
  return (
    <ul
      className="m-0 grid list-none gap-x-8 p-0"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, i) => (
        <motion.li
          key={item.id ?? i}
          custom={5 + i}
          variants={fadeUp}
          initial="hidden"
          animate={active ? 'show' : 'hidden'}
        >
          <span
            className="flex size-11 items-center justify-center rounded-full border"
            style={{ borderColor: `${INK}26` }}
          >
            <BenefitIcon icon={item.icon} className="size-5" />
          </span>
          <span className="mt-3 block font-display text-sm font-bold uppercase tracking-[0.05em]">
            {item.title}
          </span>
          {item.text ? (
            <span className="mt-1 block text-sm leading-snug opacity-70">{item.text}</span>
          ) : null}
        </motion.li>
      ))}
    </ul>
  )
}

function StoryCard({
  card,
  index,
  count,
  wordSize,
  onFit,
  scrollX,
  cardRef,
}: {
  card: CardData
  index: number
  count: number
  /** Shared size (the smallest fit of all cards) so every big word matches */
  wordSize: number | null
  onFit: (key: string, size: number) => void
  /** Sideways scroll of the row — drives the swipe parallax */
  scrollX: MotionValue<number>
  cardRef: (el: HTMLElement | null) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      ref.current = el
      cardRef(el)
    },
    [cardRef],
  )

  // Big word: fit to the box, then all cards share the smallest size
  const wordBoxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const ownFit = useFitSize(wordBoxRef, measureRef, 1)
  useEffect(() => {
    if (ownFit) onFit(card.key, ownFit)
  }, [ownFit, card.key, onFit])

  // Space right of the big word — desktop lines the picture up with the word's end
  const lettersRef = useRef<HTMLSpanElement>(null)
  const [wordEnd, setWordEnd] = useState(0)
  // Card width, for the parallax (read every frame — cached, never measured there)
  const width = useRef(1)
  useEffect(() => {
    const card = ref.current
    const letters = lettersRef.current
    const line = letters?.offsetParent as HTMLElement | null
    if (!card || !letters || !line) return
    const measure = () => {
      width.current = card.clientWidth || 1
      setWordEnd(
        Math.round(Math.max(0, line.clientWidth - (letters.offsetLeft + letters.offsetWidth))),
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    observer.observe(letters)
    return () => observer.disconnect()
  }, [])

  const active = useInView(ref, { once: true, amount: 0.35 })
  const wordReady = active && wordSize !== null

  // Pointer float (desktop mouse only)
  const px = useSpring(0, { stiffness: 60, damping: 18 })
  const py = useSpring(0, { stiffness: 60, damping: 18 })
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  // Swipe parallax: pos = 0 while this card fills the row, ±1 one card away.
  // The word lags behind the card, the picture runs ahead, the text fades.
  const reduce = useReducedMotion()
  const depth = reduce ? 0 : 1
  const pos = useTransform(() => scrollX.get() / width.current - index)
  const textX = useTransform(() => pos.get() * width.current * 0.12 * depth)
  const textOpacity = useTransform(() => 1 - Math.min(1, Math.abs(pos.get()) * 1.5 * depth))
  const wordX = useTransform(() => (pos.get() * width.current * 0.3 + px.get() * -14) * depth)
  const wordY = useTransform(() => py.get() * -10 * depth)
  const picX = useTransform(() => (pos.get() * width.current * -0.2 + px.get() * 28) * depth)
  const picY = useTransform(() => py.get() * 20 * depth)
  const picRotate = useTransform(() => (pos.get() * -10 + px.get() * 3) * depth)

  const benefits = card.benefits ?? []
  const Heading = index === 0 ? 'h2' : 'h3'
  const pic = card.picture
  // Same visual weight for every picture: equal area, whatever its shape. The most
  // upright one fills the picture row's height; never wider than the room beside it.
  const ratio = pic ? pic.width / pic.height : 1
  const areaScale = Math.sqrt(UPRIGHT_RATIO / ratio)
  const picHeight = `min(${(areaScale * 94).toFixed(1)}cqh, ${(areaScale * 26).toFixed(2)}rem, calc(var(--room) / ${ratio.toFixed(3)}))`

  return (
    <article
      ref={setRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative row-span-6 grid snap-start snap-always grid-rows-subgrid overflow-clip"
      style={{ '--word-end': `${wordEnd}px` } as React.CSSProperties}
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${count}`}
    >
      {/* Spacer: free height is shared equally above and below (balanced) */}
      <div aria-hidden />

      {/* ── 1 · Number, title + text (phone/tablet centred, desktop top left) ── */}
      <motion.div
        className="container container-padding relative z-20 pt-[calc(var(--nav,4.5rem)+clamp(0.75rem,3svh,2.5rem))]"
        style={{ x: textX, opacity: textOpacity }}
      >
        <div className="mx-auto max-w-[24rem] text-center md:max-w-[30rem] lg:mx-0 lg:text-left">
          {count > 1 ? (
            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              className="mb-2 font-display text-[11px] font-bold tabular-nums tracking-[0.16em] opacity-45 md:mb-3"
            >
              {pad(index + 1)} / {pad(count)}
            </motion.p>
          ) : null}
          {card.title ? (
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
            >
              <Heading className="m-0 font-display text-[clamp(1.375rem,2.4vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-balance">
                {card.title}
              </Heading>
            </motion.div>
          ) : null}
          {card.text ? (
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              className="mb-0 mt-2.5 whitespace-pre-line text-[15px] leading-[1.5] text-pretty opacity-75 md:mt-3 md:text-base [@media(max-height:560px)]:hidden"
            >
              {card.text}
            </motion.p>
          ) : null}
          {card.sourceLabel ? (
            <motion.p
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              className="mb-0 mt-2 text-xs opacity-55"
            >
              {card.sourceUrl ? (
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-current/30 underline-offset-2 hover:decoration-current"
                >
                  {card.sourceLabel}
                </a>
              ) : (
                card.sourceLabel
              )}
            </motion.p>
          ) : null}
        </div>
      </motion.div>

      {/* ── 2 · Big word (same size on every card) ── */}
      <div className="container container-padding pt-[clamp(0.25rem,2svh,2rem)]">
        <div
          ref={wordBoxRef}
          className="relative h-[clamp(3.25rem,min(22vw,19svh),14rem)] [@media(max-height:720px)]:h-[clamp(3rem,min(20vw,15svh),14rem)] w-full"
        >
          {/* Hidden copy at 100px to measure the word */}
          <div
            ref={measureRef}
            aria-hidden
            className="invisible absolute left-0 top-0 w-max whitespace-pre font-display font-bold uppercase leading-[0.86] tracking-[-0.03em]"
            style={{ fontSize: 100 }}
          >
            {card.word}
          </div>
          <motion.p
            aria-hidden
            className="absolute inset-0 m-0 flex items-center justify-center whitespace-nowrap font-display font-bold uppercase leading-[0.86] tracking-[-0.03em] will-change-transform"
            style={{
              fontSize: wordSize ?? ownFit ?? 'clamp(3rem, 14vw, 13rem)',
              x: wordX,
              y: wordY,
            }}
          >
            {/* Mask: top padding keeps accents (Ü, É) visible, bottom padding the descenders */}
            <span ref={lettersRef} className="relative inline-block">
              <span className="-my-[0.16em] block overflow-hidden pb-[0.06em] pt-[0.16em]">
                <motion.span
                  className="block"
                  variants={lineRise}
                  initial="hidden"
                  animate={wordReady ? 'show' : 'hidden'}
                >
                  {card.word}
                </motion.span>
              </span>
              {/* Desktop: picture at the word itself (em of the word — scales with it) */}
              {pic?.aroundWord ? (
                <motion.span
                  className={`pointer-events-none absolute block max-lg:hidden ${pic.aroundWord}`}
                  initial={{ opacity: 0, y: '0.2em', scale: 0.9 }}
                  animate={wordReady ? { opacity: 1, y: 0, scale: 1 } : undefined}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
                >
                  <motion.span
                    className="block"
                    animate={reduce ? undefined : { y: ['0em', '-0.03em', '0em'] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Image
                      src={pic.src}
                      width={pic.width}
                      height={pic.height}
                      alt=""
                      loading="eager"
                      sizes="30vw"
                      draggable={false}
                      className="h-auto w-full select-none drop-shadow-[0_14px_18px_rgba(60,40,20,0.2)]"
                    />
                  </motion.span>
                </motion.span>
              ) : null}
            </span>
          </motion.p>
        </div>
      </div>

      {/* ── 3 · Picture (desktop: intro benefits + button bottom left; the picture
          centred at two thirds of the word, a little right of the middle) ── */}
      <div className="container container-padding flex min-h-0 gap-10 py-[clamp(0.5rem,1.75svh,1.5rem)]">
        {benefits.length ? (
          <div className="hidden shrink-0 items-end gap-10 self-end lg:flex">
            <div className="w-[min(30rem,40vw)]">
              <Benefits items={benefits} active={active} />
            </div>
            {card.button ? (
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="shrink-0 pb-1"
              >
                <CardButton button={card.button} />
              </motion.div>
            ) : null}
          </div>
        ) : null}
        <div
          className={`relative min-h-0 min-w-0 flex-1 [container-type:size] [--room:100cqw] ${
            card.button && !benefits.length
              ? 'lg:[--room:calc(100cqw_-_2*var(--word-end)_-_17rem)]'
              : 'lg:[--room:calc(100cqw_-_2*var(--word-end))]'
          }`}
        >
          <div className="absolute inset-0 flex items-end justify-center">
            {/* Desktop: centred on a point two thirds along the word */}
            <div className="flex items-end gap-8 lg:absolute lg:bottom-0 lg:left-[calc(var(--word-end)+(100%-2*var(--word-end))*0.66)] lg:-translate-x-1/2">
              {card.button && !benefits.length ? (
                <motion.div
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate={active ? 'show' : 'hidden'}
                  className="hidden shrink-0 pb-[6%] lg:block"
                >
                  <CardButton button={card.button} />
                </motion.div>
              ) : null}
              {pic ? (
                <motion.div
                  variants={pictureIn}
                  initial="hidden"
                  animate={active ? 'show' : 'hidden'}
                  className="relative shrink-0"
                >
                  <motion.div
                    className="will-change-transform"
                    style={{ x: picX, y: picY, rotate: picRotate }}
                  >
                    {/* Gentle idle float, out of step from card to card */}
                    <motion.div
                      animate={reduce ? undefined : { y: [0, -9, 0], rotate: [0, -1.2, 0] }}
                      transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: (index % 3) * 0.8,
                      }}
                    >
                      <Image
                        src={pic.src}
                        width={pic.width}
                        height={pic.height}
                        alt=""
                        loading="eager"
                        sizes="(min-width: 1024px) 34vw, 80vw"
                        draggable={false}
                        className={`block max-w-none select-none drop-shadow-[0_18px_22px_rgba(60,40,20,0.18)] ${pic.aroundWord ? 'lg:hidden' : ''}`}
                        style={{ height: picHeight, width: 'auto' }}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 · Phone/tablet: button, then the intro benefits ── */}
      <div className="container container-padding flex flex-col items-center gap-3 pb-[clamp(0.75rem,2.5svh,1.75rem)] lg:pb-[clamp(1.5rem,5svh,3.5rem)]">
        {card.button ? (
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            className="lg:hidden"
          >
            <CardButton button={card.button} />
          </motion.div>
        ) : null}
        {benefits.length ? (
          <div className="lg:hidden [@media(max-height:680px)]:hidden">
            <Benefits items={benefits} active={active} compact />
          </div>
        ) : null}
      </div>
      <div aria-hidden />
    </article>
  )
}

const isTouch = () => !window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const FermentationStoryBlock: React.FC<Props & { id?: string }> = ({
  visible,
  title,
  intro,
  bigWord,
  buttonLabel,
  buttonLink,
  introPicture,
  benefits,
  slides,
  id,
}) => {
  const resolvedButton = buttonLabel ?? DEFAULTS.buttonLabel
  const cards: CardData[] = [
    {
      key: 'intro',
      word: (bigWord?.trim() || DEFAULTS.bigWord).toUpperCase(),
      title: title ?? DEFAULTS.title,
      text: intro,
      picture: PICTURE_BY_SLOT[(introPicture as PictureSlot | null) ?? 'intro'],
      button: resolvedButton
        ? { label: resolvedButton, href: buttonLink?.trim() || DEFAULTS.buttonLink }
        : undefined,
      benefits: (benefits ?? []).slice(0, 3),
    },
    ...(slides ?? []).map((s, i) => ({
      key: s.id ?? `card-${i}`,
      word: s.bigWord.toUpperCase(),
      title: s.title,
      text: s.text,
      sourceLabel: s.sourceLabel,
      sourceUrl: s.sourceUrl,
      picture: s.picture ? PICTURE_BY_SLOT[s.picture as PictureSlot] : undefined,
      button: s.buttonLabel?.trim()
        ? { label: s.buttonLabel.trim(), href: s.buttonLink?.trim() || '/' }
        : undefined,
    })),
  ]

  // Every big word at the same size: the smallest fit of all cards
  const [fits, setFits] = useState<Record<string, number>>({})
  const onFit = useCallback((key: string, size: number) => {
    setFits((prev) => (prev[key] === size ? prev : { ...prev, [key]: size }))
  }, [])
  const known = Object.values(fits)
  const wordSize = known.length === cards.length ? Math.min(...known) : null

  // The site header's room is always kept (also while it is slid away), so
  // nothing moves when it comes and goes
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    const nav = document.querySelector<HTMLElement>('#site-header nav')
    if (!root || !nav) return
    const update = () => root.style.setProperty('--nav', `${nav.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [])

  /* Sideways swipe row (touch, trackpad, mouse drag, dots, arrow keys) — the
   * page scroll is never taken over. */
  const trackRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const { scrollX } = useScroll({ container: trackRef })
  const { active, handDirection, isSwiping, goTo } = useSwipeTrack({
    trackRef,
    itemRefs: cardRefs,
    count: cards.length,
  })
  // Touch only: the row slides a little once, to show there is more
  useSwipeNudge(trackRef, rowRef, cards.length, isTouch)

  /* Desktop mouse: click-and-drag sideways. Past a small threshold the
   * next/previous card is shown; a short drag springs back. Clicks on links
   * still work (a drag under 6px counts as a click). */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const dragJustEnded = useRef(false)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const track = trackRef.current
    if (!track) return
    drag.current = { x: e.clientX, left: track.scrollLeft, moved: false }
    track.style.scrollSnapType = 'none'
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const track = trackRef.current
    if (!d || !track) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 6 && !d.moved) {
      d.moved = true
      track.setPointerCapture(e.pointerId)
    }
    if (d.moved) track.scrollLeft = d.left - dx
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    dragJustEnded.current = Boolean(d?.moved)
    setTimeout(() => (dragJustEnded.current = false), 0)
    const track = trackRef.current
    drag.current = null
    if (!d || !track) return
    track.style.scrollSnapType = ''
    if (!d.moved) return
    const dx = e.clientX - d.x
    const threshold = track.clientWidth * 0.12
    goTo(dx < -threshold ? active + 1 : dx > threshold ? active - 1 : active)
  }
  // A drag must not turn into a click on a link underneath
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragJustEnded.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(active + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(active - 1)
    }
  }

  /* Trackpad / horizontal wheel: one sideways swipe = one card, in that
   * direction (snapping alone pulled short swipes back to the same card).
   * Vertical scrolling is left to the page. */
  const activeRef = useRef(active)
  activeRef.current = active
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let sum = 0
    let locked = false
    let idle: ReturnType<typeof setTimeout> | undefined
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      clearTimeout(idle)
      // A gesture ends after a short pause; then the next swipe can move again
      idle = setTimeout(() => {
        sum = 0
        locked = false
      }, 180)
      if (locked) return
      sum += e.deltaX
      if (Math.abs(sum) > 30) {
        locked = true
        goTo(activeRef.current + (sum > 0 ? 1 : -1))
      }
    }
    track.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(idle)
      track.removeEventListener('wheel', onWheel)
    }
  }, [goTo])
  // The track must never scroll vertically (focus, find-in-page, trackpads)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const keepTop = () => {
      if (track.scrollTop !== 0) track.scrollTop = 0
    }
    track.addEventListener('scroll', keepTop, { passive: true })
    return () => track.removeEventListener('scroll', keepTop)
  }, [])

  if (visible === false) return null

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        id={id ?? undefined}
        className="relative"
        style={{ backgroundColor: PAPER, color: INK }}
      >
        <div
          ref={trackRef}
          className="h-[calc(100svh-4.5rem)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden outline-none [scrollbar-width:none] desk:cursor-grab desk:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          style={{ overscrollBehaviorX: 'contain' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
          onDragStart={(e) => e.preventDefault()}
          tabIndex={0}
          aria-label="Fermentation"
          aria-roledescription="carousel"
          role="region"
        >
          {/* One column per card; the rows are shared by all cards (subgrid). The
              picture row grows to its cap first, then the free height is split
              between the spacers above and below — the stack sits centred. */}
          <div
            ref={rowRef}
            className="grid h-full auto-cols-[100%] grid-flow-col grid-rows-[minmax(0,1fr)_auto_auto_minmax(0,min(36svh,24rem))_auto_minmax(0,1fr)]"
          >
            {cards.map((card, i) => (
              <StoryCard
                key={card.key}
                card={card}
                index={i}
                count={cards.length}
                wordSize={wordSize}
                onFit={onFit}
                scrollX={scrollX}
                cardRef={(el) => {
                  cardRefs.current[i] = el
                }}
              />
            ))}
          </div>
        </div>

        {/* Swipe capsule (hand gesture + dots) — under the cards; cards + capsule = one screen */}
        {cards.length > 1 ? (
          <div className="flex h-[4.5rem] items-start justify-center">
            <SwipeCapsule
              labels={cards.map((c) => c.title || c.word)}
              active={active}
              handDirection={handDirection}
              isSwiping={isSwiping}
              onSelect={goTo}
              ariaLabel="Fermentation cards"
            />
          </div>
        ) : null}
      </div>
    </MotionConfig>
  )
}
