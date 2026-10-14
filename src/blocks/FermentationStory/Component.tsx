'use client'

import { useArrival, useFitSize } from '@/components/StoryScene/hooks'
import type { FermentationStoryBlock as Props } from '@/payload-types'
import { ArrowUpRight, Leaf, Microscope, Sparkles, Sprout } from 'lucide-react'
import {
  MotionConfig,
  motion,
  useInView,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef } from 'react'

import { FERMENTATION_LAYER } from './layers'

/* ═══════════════════════════════════════════════════════════════
 *  FERMENTATION STORY — "Why fermentation?" as a full-screen story card
 *  (same family as the voucher gift slide): title + intro top left, one
 *  huge black word across the card, a single picture floating over it
 *  (lifts in on scroll, follows the pointer), button + three benefits.
 *  On Home it slides up over the section before it (StackPanel, page.tsx).
 *  Text is CMS; the picture lives in code (layers.ts).
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

function BenefitIcon({ icon }: { icon?: string | null }) {
  const cls = 'size-[46%]'
  if (icon === 'leaf') return <Leaf className={cls} strokeWidth={1.25} />
  if (icon === 'sparkles') return <Sparkles className={cls} strokeWidth={1.25} />
  if (icon === 'sprout') return <Sprout className={cls} strokeWidth={1.25} />
  return <Microscope className={cls} strokeWidth={1.25} />
}

export const FermentationStoryBlock: React.FC<Props & { id?: string }> = ({
  visible,
  title,
  intro,
  bigWord,
  buttonLabel,
  buttonLink,
  benefits,
  id,
}) => {
  const ref = useRef<HTMLElement>(null)
  const wordBoxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  const word = (bigWord?.trim() || DEFAULTS.bigWord).toUpperCase()
  const resolvedTitle = title ?? DEFAULTS.title
  const resolvedButton = buttonLabel ?? DEFAULTS.buttonLabel
  const href = buttonLink?.trim() || DEFAULTS.buttonLink
  const items = (benefits ?? []).slice(0, 3)

  const fontSize = useFitSize(wordBoxRef, measureRef, 1)
  const active = useInView(ref, { once: true, amount: 0.25 })

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
  const arrival = useArrival(ref)
  const lift = useSpring(useTransform(arrival, [0.1, 0.95], [1, 0], { clamp: true }), {
    stiffness: 70,
    damping: 22,
  })
  const wordX = useTransform(() => px.get() * -14)
  const wordY = useTransform(() => py.get() * -10)
  const imgX = useTransform(() => px.get() * 30)
  const imgY = useTransform(() => py.get() * 22 + lift.get() * 160)
  const imgRotate = useTransform(() => px.get() * 3 + lift.get() * 5)

  if (visible === false) return null

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={ref}
        id={id ?? undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative overflow-clip"
        style={{ backgroundColor: PAPER, color: INK }}
      >
        <div className="container mx-auto container-padding flex min-h-[100svh] flex-col gap-8 py-16 md:py-20 lg:gap-6 lg:py-16">
          {/* ── Title + intro, top left ── */}
          <div className="relative z-20 max-w-md">
            {resolvedTitle ? (
              <motion.h2
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] md:text-3xl"
              >
                {resolvedTitle}
              </motion.h2>
            ) : null}
            {intro ? (
              <motion.p
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="mb-0 mt-3 text-sm leading-relaxed opacity-75 md:text-base"
              >
                {intro}
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
                {word}
              </div>
              <motion.p
                aria-hidden
                className="absolute inset-0 m-0 flex items-center justify-center whitespace-nowrap font-display font-bold uppercase leading-[0.86] tracking-[-0.02em]"
                style={{ fontSize: fontSize ?? 'clamp(3rem, 14vw, 13rem)', x: wordX, y: wordY }}
              >
                <span className="block overflow-hidden pb-[0.04em]">
                  <motion.span
                    className="block"
                    variants={lineRise}
                    initial="hidden"
                    animate={active ? 'show' : 'hidden'}
                  >
                    {word}
                  </motion.span>
                </span>
              </motion.p>
            </div>

            {FERMENTATION_LAYER ? (
              <motion.div
                className="pointer-events-none absolute right-[4%] top-1/2 z-10 w-[min(44%,24rem)] -translate-y-1/2 md:w-[min(34%,26rem)]"
                style={{ x: imgX, y: imgY, rotate: imgRotate }}
              >
                <Image
                  src={FERMENTATION_LAYER.src}
                  width={FERMENTATION_LAYER.width}
                  height={FERMENTATION_LAYER.height}
                  alt={FERMENTATION_LAYER.alt}
                  sizes="(min-width: 768px) 34vw, 44vw"
                  loading="eager"
                  className="h-auto w-full drop-shadow-[0_22px_30px_rgba(40,30,15,0.25)]"
                />
              </motion.div>
            ) : null}
          </div>

          {/* ── Button + benefits ── */}
          <div className="relative z-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {resolvedButton ? (
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="shrink-0"
              >
                <Link
                  href={href}
                  className="group inline-flex items-center gap-3 rounded-full py-2.5 pl-5 pr-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-black"
                  style={{ backgroundColor: INK }}
                >
                  {resolvedButton}
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:rotate-45"
                    style={{ color: INK }}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ) : null}

            {items.length ? (
              <ul
                className="grid gap-x-6 gap-y-6 sm:gap-x-10 lg:max-w-3xl lg:flex-1"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
              >
                {items.map((item, i) => (
                  <motion.li
                    key={item.id ?? i}
                    custom={3 + i}
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
        </div>
      </section>
    </MotionConfig>
  )
}
