'use client'

import { useArrival, useFitSize, useNavOffset } from '@/components/StoryScene/hooks'
import { SwipeCapsule, useSwipeNudge, useSwipeTrack } from '@/components/SwipeCapsule'
import type { FermentationStoryBlock as Props } from '@/payload-types'
import { Leaf, Microscope, Sparkles, Sprout } from 'lucide-react'
import {
  MotionConfig,
  motion,
  useInView,
  useSpring,
  useTransform,
  useScroll,
  type MotionValue,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  FERMENTATION_LAYERS,
  DECOR_BY_SLOT,
  INTRO_DECOR,
  type Decor,
  type PictureSlot,
  type StoryLayer,
} from './layers'

/* ═══════════════════════════════════════════════════════════════
 *  FERMENTATION STORY — one full-screen card on the page ("Warum
 *  Fermentation? / GESUND"); the other cards are optional, a sideways
 *  swipe row with the shared swipe capsule: the intro card ("Warum Fermentation? / GESUND",
 *  button + benefits) and then one card per topic. Every card: title +
 *  text top left, one huge black word (same size on every card), a
 *  picture floating over it (lifts in on scroll, follows the pointer).
 *  Text is CMS; pictures live in code.
 * ═══════════════════════════════════════════════════════════════ */

const INK = '#1A1A1A' // brand near-black
const PAPER = '#F5E7D6'
const EASE = [0.16, 1, 0.3, 1] as const

const DEFAULTS = {
  title: 'Why fermentation?',
  bigWord: 'IS HEALTHY',
  buttonLabel: 'More about fermentation',
  buttonLink: '/fermentation',
}

const lineRise: Variants = {
  hidden: { y: '105%' },
  show: { y: '0%', transition: { duration: 1.2, ease: EASE, delay: 0.1 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.35 + i * 0.08 },
  }),
}

const pad = (n: number) => String(n).padStart(2, '0')

function BenefitIcon({ icon }: { icon?: string | null }) {
  const cls = 'size-[46%]'
  if (icon === 'leaf') return <Leaf className={cls} strokeWidth={1.25} />
  if (icon === 'sparkles') return <Sparkles className={cls} strokeWidth={1.25} />
  if (icon === 'sprout') return <Sprout className={cls} strokeWidth={1.25} />
  return <Microscope className={cls} strokeWidth={1.25} />
}

type Benefit = NonNullable<Props['benefits']>[number]

type CardData = {
  key: string
  word: string
  title?: string | null
  text?: string | null
  sourceLabel?: string | null
  sourceUrl?: string | null
  layer?: StoryLayer
  /** Small cut-outs around the big word */
  decor?: Decor[]
  button?: { label: string; href: string }
  benefits?: Benefit[]
}

function StoryCard({
  card,
  index,
  count,
  wordSize,
  onFit,
  enter,
}: {
  card: CardData
  index: number
  count: number
  /** 0 → 1 while this card slides in from the side (cards after the first) */
  enter?: MotionValue<number>
  /** Shared size (the smallest fit of all cards) so every big word matches */
  wordSize: number | null
  onFit: (key: string, size: number) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const wordBoxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const ownFit = useFitSize(wordBoxRef, measureRef, 1)
  useEffect(() => {
    if (ownFit) onFit(card.key, ownFit)
  }, [ownFit, card.key, onFit])

  // Where the big word ends (space right of it) and the empty strip under its
  // letters — desktop lines the 'below' picture + button up with the word's end
  // and lets the picture use that strip. Offsets ignore the pointer float.
  const lettersRef = useRef<HTMLSpanElement>(null)
  const [wordEdge, setWordEdge] = useState<{ end: number; gap: number } | null>(null)
  useEffect(() => {
    const box = wordBoxRef.current
    const letters = lettersRef.current
    const line = letters?.offsetParent as HTMLElement | null
    if (!box || !letters || !line) return
    const measure = () =>
      setWordEdge({
        end: Math.max(0, line.clientWidth - (letters.offsetLeft + letters.offsetWidth)),
        gap: Math.max(0, line.clientHeight - (letters.offsetTop + letters.offsetHeight)),
      })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    observer.observe(letters)
    return () => observer.disconnect()
  }, [])

  const active = useInView(ref, { once: true, amount: 0.25 })
  // Room for the site header while it is on screen (it slides away on scroll-down)
  const navOffset = useNavOffset()

  // Pointer float (desktop)
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

  // The picture lifts into place as the card slides in — movement only, never faded
  // First card: driven by its vertical arrival; side cards: by their slide-in
  const arrival = useArrival(ref)
  const progress = enter ?? arrival
  const lift = useSpring(useTransform(progress, [0.1, 0.95], [1, 0], { clamp: true }), {
    stiffness: 70,
    damping: 22,
  })
  const wordX = useTransform(() => px.get() * -14)
  const wordY = useTransform(() => py.get() * -10)
  const imgX = useTransform(() => px.get() * 30)
  const imgY = useTransform(() => py.get() * 22 + lift.get() * 160)
  const imgRotate = useTransform(() => px.get() * 3 + lift.get() * 5)

  const benefits = card.benefits ?? []
  // Phone/tablet: every card's picture sits centred between the word and the
  // button. Desktop: 'below' pictures stay there (right-aligned), the others
  // are placed around the word.
  const belowDecor = card.decor?.find((d) => d.placement === 'below') ?? card.decor?.[0]
  const belowOnDesktop = belowDecor?.placement === 'below'
  const isFirst = index === 0
  const Heading = isFirst ? 'h2' : 'h3'

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative h-full overflow-clip"
      style={
        {
          backgroundColor: PAPER,
          color: INK,
          '--word-end': `${wordEdge?.end ?? 0}px`,
          '--word-gap': `${wordEdge?.gap ?? 0}px`,
        } as React.CSSProperties
      }
    >
      <div
        className="container mx-auto container-padding flex h-full flex-col gap-6 py-14 md:gap-8 md:py-20 lg:gap-6 lg:py-16 [@media(max-height:700px)]:gap-4 [@media(max-height:700px)]:py-10 [@media(max-height:620px)]:gap-3 [@media(max-height:620px)]:py-6"
        style={navOffset ? { paddingTop: navOffset + 24 } : undefined}
      >
        {/* ── Number, title + text, top left ── */}
        {/* Phone/tablet: centred; desktop: top left */}
        <div className="relative z-20 mx-auto max-w-md text-center lg:mx-0 lg:text-left">
          {count > 1 ? (
            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={active ? 'show' : 'hidden'}
              className="mb-3 font-display text-[11px] font-bold tabular-nums tracking-[0.14em] opacity-50"
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
              <Heading className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] md:text-3xl">
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
              className="mb-0 mt-3 whitespace-pre-line text-sm leading-relaxed opacity-75 md:text-base [@media(max-height:620px)]:mt-2 [@media(max-height:620px)]:text-[13px] [@media(max-height:620px)]:leading-snug"
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
              className="mb-0 mt-3 text-xs opacity-55"
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

        {/* ── Big word with the picture floating over it ── */}
        <div
          className={`relative flex min-h-0 flex-1 ${belowDecor ? 'flex-col justify-center' : 'items-center'} ${belowDecor && !belowOnDesktop ? 'lg:flex-row lg:items-center lg:justify-start' : ''}`}
        >
          <div
            ref={wordBoxRef}
            // Short laptops: a lower word box leaves room for cut-outs (all cards share the size)
            className="relative h-[clamp(4rem,22vw,15rem)] w-full [@media(max-height:620px)]:h-14 lg:[@media(max-height:800px)]:h-[clamp(4rem,19vh,9.5rem)]"
          >
            {/* Hidden copy at 100px to measure the word */}
            <div
              ref={measureRef}
              aria-hidden
              className="invisible absolute left-0 top-0 w-max whitespace-pre font-display font-bold uppercase leading-[0.86] tracking-[-0.02em]"
              style={{ fontSize: 100 }}
            >
              {card.word}
            </div>
            <motion.p
              aria-hidden
              className="absolute inset-0 m-0 flex items-center justify-center whitespace-nowrap font-display font-bold uppercase leading-[0.86] tracking-[-0.02em]"
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
                    animate={active ? 'show' : 'hidden'}
                  >
                    {card.word}
                  </motion.span>
                </span>
                {/* Cut-outs around the word — sized in em, so they scale with it */}
                {card.decor
                  ?.filter((d) => d.placement !== 'below')
                  .map((d, i) => (
                    <motion.span
                      key={d.src}
                      // Around the word on desktop only — phone/tablet show it below the word
                      className={`pointer-events-none absolute block max-lg:hidden ${d.className}`}
                      initial={{ opacity: 0, y: '0.2em', scale: 0.9 }}
                      animate={active ? { opacity: 1, y: 0, scale: 1 } : undefined}
                      transition={{ duration: 1.1, ease: EASE, delay: 0.5 + i * 0.12 }}
                    >
                      <Image
                        src={d.src}
                        width={d.width}
                        height={d.height}
                        alt=""
                        loading="eager"
                        className="h-auto w-full drop-shadow-[0_14px_18px_rgba(60,40,20,0.2)]"
                      />
                    </motion.span>
                  ))}
              </span>
            </motion.p>
          </div>

          {/* Cut-out below the word, in its own space: shrinks to fit, so it never
              sits on the black letters or leaves the card. Desktop: bigger, its
              right edge lined up with the end of the word (button below it; on
              short screens beside it, so the picture keeps its size);
              phone/tablet: centred (above the swipe capsule). */}
          {belowDecor ? (
            <motion.div
              className={`flex min-h-0 max-h-[min(22rem,40vh)] flex-1 justify-center pt-[clamp(0.5rem,2vh,1.5rem)] lg:mt-[calc(var(--word-gap)*-1)] lg:max-h-[min(26rem,42vh)] lg:justify-end lg:pr-[var(--word-end)] lg:pt-5 ${belowOnDesktop ? '' : 'lg:hidden'}`}
              initial={{ opacity: 0, y: 16 }}
              animate={active ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
            >
              {belowOnDesktop && card.button ? (
                <Link
                  href={card.button.href}
                  className="mr-6 hidden shrink-0 items-center self-end rounded-full px-6 py-3 font-display text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03] lg:[@media(max-height:820px)]:inline-flex"
                  style={{ backgroundColor: INK }}
                >
                  {card.button.label}
                </Link>
              ) : null}
              <Image
                src={belowDecor.src}
                width={belowDecor.width}
                height={belowDecor.height}
                alt=""
                loading="eager"
                sizes="(min-width: 1024px) 30vw, 70vw"
                className="h-full w-auto min-w-0 max-w-full object-contain object-bottom drop-shadow-[0_14px_18px_rgba(60,40,20,0.2)] lg:object-right-bottom"
              />
            </motion.div>
          ) : null}

          {card.layer ? (
            <motion.div
              className="pointer-events-none absolute right-[4%] top-1/2 z-10 w-[min(44%,24rem)] -translate-y-1/2 md:w-[min(34%,26rem)]"
              style={{ x: imgX, y: imgY, rotate: imgRotate }}
            >
              <Image
                src={card.layer.src}
                width={card.layer.width}
                height={card.layer.height}
                alt={card.layer.alt}
                sizes="(min-width: 768px) 34vw, 44vw"
                loading="eager"
                className="h-auto w-full drop-shadow-[0_22px_30px_rgba(40,30,15,0.25)]"
              />
            </motion.div>
          ) : null}
        </div>

        {/* ── Intro card: desktop benefits left + button right; phone button, then benefits ── */}
        {card.button || benefits.length ? (
          <div
            // Desktop, with a picture under the word: button right under it, same right edge
            className={`relative z-20 flex flex-col gap-8 lg:flex-row-reverse lg:items-end lg:justify-between ${belowOnDesktop ? 'lg:-mt-3 lg:pr-[var(--word-end)] lg:[@media(max-height:820px)]:hidden' : ''}`}
          >
            {card.button ? (
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                // Centred on phone/tablet, right on desktop
                className="shrink-0 self-center lg:self-auto"
              >
                <Link
                  href={card.button.href}
                  className="inline-flex items-center rounded-full px-6 py-3 font-display text-sm font-bold text-white transition-transform duration-300 hover:scale-[1.03]"
                  style={{ backgroundColor: INK }}
                >
                  {card.button.label}
                </Link>
              </motion.div>
            ) : null}

            {benefits.length ? (
              <ul
                className="grid gap-x-6 gap-y-6 sm:gap-x-10 lg:max-w-3xl lg:flex-1"
                style={{ gridTemplateColumns: `repeat(${benefits.length}, minmax(0, 1fr))` }}
              >
                {benefits.map((item, i) => (
                  <motion.li
                    key={item.id ?? i}
                    custom={5 + i}
                    variants={fadeUp}
                    initial="hidden"
                    animate={active ? 'show' : 'hidden'}
                    className="flex flex-col items-center text-center lg:items-start lg:text-left"
                  >
                    <span
                      className="flex size-[clamp(40px,4.5vw,48px)] items-center justify-center rounded-full border"
                      style={{ borderColor: `${INK}33` }}
                    >
                      <BenefitIcon icon={item.icon} />
                    </span>
                    <span className="mt-3 block font-display text-xs font-bold uppercase tracking-[0.04em] md:text-sm">
                      {item.title}
                    </span>
                    {item.text ? (
                      <span className="mt-1 block text-xs leading-snug opacity-70 md:text-sm [@media(max-height:620px)]:hidden">
                        {item.text}
                      </span>
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** One card in the sideways swipe row. `enter` goes 0 → 1 as the card comes
 *  into view horizontally (drives its picture lift); the first card uses its
 *  vertical arrival instead. */
function SlideCard({
  index,
  scrollX,
  trackRef,
  cardRef,
  children,
}: {
  index: number
  scrollX: MotionValue<number>
  trackRef: React.RefObject<HTMLDivElement | null>
  cardRef: (el: HTMLDivElement | null) => void
  children: (enter: MotionValue<number> | undefined) => React.ReactNode
}) {
  const enter = useTransform(() => {
    const width = trackRef.current?.clientWidth || 1
    return Math.max(0, Math.min(1, 1 - Math.abs(scrollX.get() / width - index)))
  })
  return (
    <div ref={cardRef} className="relative h-full w-full shrink-0 snap-start snap-always">
      {children(index === 0 ? undefined : enter)}
    </div>
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
      layer: FERMENTATION_LAYERS[(introPicture as PictureSlot | null) ?? 'intro'],
      decor: INTRO_DECOR,
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
      layer: s.picture ? FERMENTATION_LAYERS[s.picture as PictureSlot] : undefined,
      decor: s.picture ? DECOR_BY_SLOT[s.picture as PictureSlot] : undefined,
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

  /* The first card is what you see while scrolling down. The others are
   * optional: a sideways swipe row (touch, trackpad, dots, arrows) — the page
   * scroll is never taken over. */
  const trackRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { scrollX } = useScroll({ container: trackRef })
  const { active, handDirection, isSwiping, goTo } = useSwipeTrack({
    trackRef,
    itemRefs: cardRefs,
    count: cards.length,
  })
  // Swipe everywhere: touch, trackpad (sideways two-finger swipe) and mouse drag;
  // snap-mandatory always lands on a full card. The nudge is for touch only.
  useSwipeNudge(trackRef, rowRef, cards.length, isTouch)

  /* Desktop mouse: click-and-drag the card sideways. Past a small threshold the
   * next/previous card is shown; a short drag springs back. Clicks on links and
   * buttons still work (a drag under 6px counts as a click). */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
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
  // A drag must not turn into a click on a link/button underneath
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragJustEnded.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
  const dragJustEnded = useRef(false)

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
      <div id={id ?? undefined} className="relative" style={{ backgroundColor: PAPER }}>
        <div
          ref={trackRef}
          className="h-[calc(100svh-4.5rem)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] desk:cursor-grab desk:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          style={{ overscrollBehaviorX: 'contain' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
          aria-label="Fermentation"
          role="region"
        >
          <div ref={rowRef} className="flex h-full">
            {cards.map((card, i) => (
              <SlideCard
                key={card.key}
                index={i}
                scrollX={scrollX}
                trackRef={trackRef}
                cardRef={(el) => {
                  cardRefs.current[i] = el
                }}
              >
                {(enter) => (
                  <StoryCard
                    card={card}
                    index={i}
                    count={cards.length}
                    wordSize={wordSize}
                    onFit={onFit}
                    enter={enter}
                  />
                )}
              </SlideCard>
            ))}
          </div>
        </div>

        {/* Swipe capsule (hand gesture + dots) — under the cards; card + capsule = one screen */}
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
