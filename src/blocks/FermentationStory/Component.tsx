'use client'

import { useArrival, useFitSize, useNavOffset } from '@/components/StoryScene/hooks'
import type { FermentationStoryBlock as Props } from '@/payload-types'
import { ArrowUpRight, Leaf, Microscope, Sparkles, Sprout } from 'lucide-react'
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

import { FERMENTATION_LAYERS, type PictureSlot, type StoryLayer } from './layers'

/* ═══════════════════════════════════════════════════════════════
 *  FERMENTATION STORY — full-screen cards that slide in from the side
 *  while you scroll down (the frame holds still): the intro card ("Warum Fermentation? / GESUND",
 *  button + benefits) and then one card per topic. Every card: title +
 *  text top left, one huge black word (same size on every card), a
 *  picture floating over it (lifts in on scroll, follows the pointer).
 *  The scroll pauses at each card. Text is CMS; pictures live in code.
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
  const isFirst = index === 0
  const Heading = isFirst ? 'h2' : 'h3'

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative h-full overflow-clip"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <div
        className="container mx-auto container-padding flex h-full flex-col gap-6 py-14 md:gap-8 md:py-20 lg:gap-6 lg:py-16 [@media(max-height:700px)]:gap-4 [@media(max-height:700px)]:py-10"
        style={navOffset ? { paddingTop: navOffset + 24 } : undefined}
      >
        {/* ── Number, title + text, top left ── */}
        <div className="relative z-20 max-w-md">
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
              className="mb-0 mt-3 whitespace-pre-line text-sm leading-relaxed opacity-75 md:text-base"
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
        <div className="relative flex flex-1 items-center">
          <div ref={wordBoxRef} className="relative h-[clamp(4rem,22vw,15rem)] w-full">
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
            </motion.p>
          </div>

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

        {/* ── Button + benefits (intro card) ── */}
        {card.button || benefits.length ? (
          <div className="relative z-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {card.button ? (
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="shrink-0"
              >
                <Link
                  href={card.button.href}
                  className="group inline-flex items-center gap-3 rounded-full py-2.5 pl-5 pr-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-black"
                  style={{ backgroundColor: INK }}
                >
                  {card.button.label}
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:rotate-45"
                    style={{ color: INK }}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
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
                      <span className="mt-1 block text-xs leading-snug opacity-70 md:text-sm">
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

/** One card in the side-scrolling frame. Card 0 sits in place; card i slides in
 *  from the right (100% → 0) during the i-th screen of scrolling, over the
 *  cards before it, with rounded left corners and a soft shadow. */
function SideCard({
  index,
  count,
  progress,
  children,
}: {
  index: number
  count: number
  progress: MotionValue<number>
  children: (enter: MotionValue<number> | undefined) => React.ReactNode
}) {
  const steps = Math.max(1, count - 1)
  const enter = useTransform(progress, [(index - 1) / steps, index / steps], [0, 1], {
    clamp: true,
  })
  // Waits an extra 80px off-screen so its shadow doesn't peek in before it moves
  const x = useTransform(enter, (v) => `calc(${(1 - v) * 100}% + ${(1 - v) * 80}px)`)
  // zIndex on every card (incl. the first) keeps each card's content inside its own layer
  if (index === 0)
    return (
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {children(undefined)}
      </div>
    )
  return (
    <motion.div
      className="absolute inset-0 overflow-clip rounded-l-[2rem] shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.35)] md:rounded-l-[2.5rem]"
      style={{ x, zIndex: index + 1 }}
    >
      {children(enter)}
    </motion.div>
  )
}

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
    })),
  ]

  // Every big word at the same size: the smallest fit of all cards
  const [fits, setFits] = useState<Record<string, number>>({})
  const onFit = useCallback((key: string, size: number) => {
    setFits((prev) => (prev[key] === size ? prev : { ...prev, [key]: size }))
  }, [])
  const known = Object.values(fits)
  const wordSize = known.length === cards.length ? Math.min(...known) : null

  /* Side scroll: the section is (cards) screens tall; its inner frame sticks to
   * the screen while you scroll down, and each next card slides in from the
   * right over the one before. Scroll distance per card = one screen. */
  const outerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end end'] })

  /* Pause at each card: snap points one screen apart ("proximity" only snaps
   * when the scroll ends near a card — it never traps the visitor) */
  useEffect(() => {
    if (cards.length < 2) return
    const root = document.documentElement
    const previous = root.style.scrollSnapType
    root.style.scrollSnapType = 'y proximity'
    return () => {
      root.style.scrollSnapType = previous
    }
  }, [cards.length])

  if (visible === false) return null

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={outerRef}
        id={id ?? undefined}
        className="relative"
        style={{ height: `${cards.length * 100}svh` }}
      >
        <div className="sticky top-0 h-[100svh] overflow-clip">
          {cards.map((card, i) => (
            <SideCard key={card.key} index={i} count={cards.length} progress={scrollYProgress}>
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
            </SideCard>
          ))}
        </div>
        {cards.length > 1
          ? cards.map((card, i) => (
              <div
                key={card.key}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-px [scroll-snap-align:start] [scroll-snap-stop:normal]"
                style={{ top: `${i * 100}svh` }}
              />
            ))
          : null}
      </div>
    </MotionConfig>
  )
}
