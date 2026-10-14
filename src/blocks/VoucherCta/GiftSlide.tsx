'use client'

import { Gift, Heart, Leaf } from 'lucide-react'
import {
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { VOUCHER_LAYERS } from './layers'

/* ═══════════════════════════════════════════════════════════════
 *  GIFT SLIDE — full-screen voucher card that slides up over the
 *  bento gallery once it is fully open (the parent extends the
 *  gallery pin and pulls this card up by one screen).
 *
 *  Built like a showcase panel: huge headline behind two image layers
 *  (ingredients + voucher card, from the same Kittl artboard) that lift
 *  into place as the card arrives and float with the pointer. Text is
 *  CMS; the images live in code (public/voucher, `pnpm voucher:images`).
 * ═══════════════════════════════════════════════════════════════ */

export type GiftSlideData = {
  bigWord?: string | null
  label?: string | null
  text?: string | null
  priceText?: string | null
  cardAlt?: string | null
  buttonLabel?: string | null
  buttonLink?: string | null
  points?:
    | { icon?: string | null; title: string; text?: string | null; id?: string | null }[]
    | null
}

const DEFAULT_BIG_WORD = 'VOUCHER'
const DEFAULT_LINK = '/workshops/voucher'
const DEFAULT_CARD_ALT = 'Gift voucher for a fermentation workshop at FermentFreude in Graz'
const INK = '#1A1A1A' // brand near-black
const PAPER = '#F5E7D6'
const EASE = [0.16, 1, 0.3, 1] as const

/* Where the layer artboard sits in the scene: Kittl layout on desktop; on phone/tablet it fills the headline group */
const LAYER_BOX = 'inset-x-0 top-0 w-full lg:left-[17%] lg:right-auto lg:top-[3%] lg:w-[82%]'

/** 0 while the card is below the screen → 1 once its top reaches the top */
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

/** Font size so the widest line fills `ratio` of the box width (and the lines fit its height) */
function useFitSize(
  boxRef: React.RefObject<HTMLElement | null>,
  measureRef: React.RefObject<HTMLElement | null>,
  lines: number,
) {
  const [size, setSize] = useState<number | null>(null)
  useLayoutEffect(() => {
    const box = boxRef.current
    const measure = measureRef.current
    if (!box || !measure) return
    const fit = () => {
      // measure is rendered at 100px
      const byWidth = (box.clientWidth / measure.scrollWidth) * 100
      const byHeight = box.clientHeight / (lines * 0.86)
      setSize(Math.floor(Math.min(byWidth, byHeight)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [boxRef, measureRef, lines])
  return size
}

function JarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} {...props}>
      <rect x="6" y="3" width="12" height="3.5" rx="1" />
      <path d="M7 6.5v1.2c-1 .6-1.5 1.5-1.5 2.6V19a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-8.7c0-1.1-.5-2-1.5-2.6V6.5" />
      <path d="M8.5 13h7" />
    </svg>
  )
}

function PointIcon({ icon }: { icon?: string | null }) {
  const cls = 'size-5 md:size-4'
  if (icon === 'jar') return <JarIcon className={cls} />
  if (icon === 'heart') return <Heart className={cls} strokeWidth={1.25} />
  if (icon === 'gift') return <Gift className={cls} strokeWidth={1.25} />
  return <Leaf className={cls} strokeWidth={1.25} />
}

const lineRise: Variants = {
  hidden: { y: '105%' },
  show: (i: number) => ({
    y: '0%',
    transition: { duration: 1.2, ease: EASE, delay: 0.1 + i * 0.12 },
  }),
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.6 + i * 0.08 },
  }),
}

export function GiftSlide({ data }: { data: GiftSlideData }) {
  const ref = useRef<HTMLElement>(null)
  const wordBoxRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  const lines = (data.bigWord?.trim() || DEFAULT_BIG_WORD).split('\n').map((l) => l.trim())
  const textLines = (data.text ?? '').split('\n').filter((l) => l.trim())
  const href = data.buttonLink?.trim() || DEFAULT_LINK
  const points = (data.points ?? []).slice(0, 4)
  const cardAlt = data.cardAlt?.trim() || DEFAULT_CARD_ALT

  // Product data for search engines (Google can show name + price in results)
  const price = data.priceText?.replace(',', '.').match(/\d+(\.\d+)?/)?.[0]
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const jsonLd = price
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: cardAlt,
        description: textLines.join(' '),
        image: `${siteUrl}${VOUCHER_LAYERS.card.src}`,
        brand: { '@type': 'Brand', name: 'FermentFreude' },
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}${href}`,
        },
      }
    : null

  const fontSize = useFitSize(wordBoxRef, measureRef, lines.length)
  const active = useInView(ref, { once: true, amount: 0.3 })

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

  // As the card slides in, the layers lift into place (ingredients further, card a
  // touch less). Movement only — the layers stay fully solid the whole time.
  const arrival = useArrival(ref)
  const lift = useSpring(useTransform(arrival, [0.1, 0.95], [1, 0], { clamp: true }), {
    stiffness: 70,
    damping: 22,
  })
  const wordX = useTransform(() => px.get() * -14)
  const wordY = useTransform(() => py.get() * -10)
  const ingrX = useTransform(() => px.get() * 50)
  const ingrY = useTransform(() => py.get() * 36 + lift.get() * 180)
  const cardX = useTransform(() => px.get() * 22 + lift.get() * 80)
  const cardY = useTransform(() => py.get() * 16 + lift.get() * 90)
  const cardRotate = useTransform(() => px.get() * 3 + lift.get() * 6)

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        // 100svh = the part of the screen a phone really shows (browser bars excluded)
        className="relative flex h-[100svh] max-h-full flex-col overflow-clip"
        style={{ backgroundColor: PAPER, color: INK }}
      >
        {/* ── Scene grid: the headline and the text each own their area, so they
         *    can never overlap. Desktop: text column left · headline centred ·
         *    equal empty column right. Phone/tablet: headline above, text below. ── */}
        <div className="container mx-auto container-padding grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-6 pb-6 pt-20 lg:grid-cols-[minmax(12rem,15%)_1fr_minmax(12rem,15%)] lg:grid-rows-1 lg:gap-8 lg:pb-10 lg:pt-24">
          {/* Headline + layers as one group.
           *  Phone/tablet: the group has the artboard's proportions and sits centred
           *  above the text — layers fill it, the headline sits in its middle.
           *  Desktop: the group is not positioned, so the layers take the Kittl
           *  positions across the whole slide and the headline fills the centre column. */}
          <div className="relative aspect-[1004/673] w-full self-center lg:static lg:col-start-2 lg:row-start-1 lg:aspect-auto lg:self-stretch">
            {/* Layers — in front of the headline */}
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute z-10 ${LAYER_BOX}`}
              style={{ x: ingrX, y: ingrY }}
            >
              <Image
                src={VOUCHER_LAYERS.ingredients.src}
                width={VOUCHER_LAYERS.ingredients.width}
                height={VOUCHER_LAYERS.ingredients.height}
                alt=""
                sizes="(min-width: 1024px) 82vw, 100vw"
                className="h-auto w-full drop-shadow-[0_18px_24px_rgba(60,40,20,0.18)]"
              />
            </motion.div>
            <motion.div
              className={`pointer-events-none absolute z-10 ${LAYER_BOX}`}
              style={{ x: cardX, y: cardY, rotate: cardRotate }}
            >
              <Image
                src={VOUCHER_LAYERS.card.src}
                width={VOUCHER_LAYERS.card.width}
                height={VOUCHER_LAYERS.card.height}
                alt={cardAlt}
                sizes="(min-width: 1024px) 82vw, 100vw"
                className="h-auto w-full drop-shadow-[0_22px_30px_rgba(40,30,15,0.25)]"
              />
            </motion.div>
            {/* Headline area — the word is sized to fit it */}
            <div
              ref={wordBoxRef}
              className="absolute inset-x-0 inset-y-[22%] lg:relative lg:inset-auto lg:h-full"
            >
              {/* Hidden copy at 100px to measure the widest line */}
              <div
                ref={measureRef}
                aria-hidden
                className="invisible absolute left-0 top-0 w-max whitespace-pre font-display font-bold uppercase leading-[0.86] tracking-[-0.02em]"
                style={{ fontSize: 100 }}
              >
                {lines.join('\n')}
              </div>
              <motion.h2
                className="absolute inset-0 flex flex-col items-center justify-center text-center font-display font-bold uppercase leading-[0.86] tracking-[-0.02em]"
                style={{
                  fontSize: fontSize ?? undefined,
                  x: wordX,
                  y: wordY,
                  opacity: fontSize ? 1 : 0,
                }}
              >
                {lines.map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-[0.04em]">
                    <motion.span
                      className="block"
                      custom={i}
                      variants={lineRise}
                      initial="hidden"
                      animate={active ? 'show' : 'hidden'}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </motion.h2>
            </div>
          </div>

          {/* Text — bottom left; above the layers so it always stays readable */}
          <div className="relative z-20 self-end lg:col-start-1 lg:row-start-1">
            {data.label ? (
              <motion.p
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.08em]"
              >
                {data.label}
              </motion.p>
            ) : null}
            {textLines.length ? (
              <motion.p
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate={active ? 'show' : 'hidden'}
                className="mb-0 text-sm leading-snug opacity-80 lg:text-base"
              >
                {textLines.map((l, i) => (
                  <span key={i} className="block">
                    {l}
                  </span>
                ))}
              </motion.p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4 lg:mt-6 lg:block">
              {data.priceText ? (
                <motion.p
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate={active ? 'show' : 'hidden'}
                  className="mb-0 font-display text-5xl font-bold leading-none tracking-[-0.03em] lg:text-6xl"
                >
                  {data.priceText}
                </motion.p>
              ) : null}
              {data.buttonLabel ? (
                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate={active ? 'show' : 'hidden'}
                  className="lg:mt-6"
                >
                  <Link
                    href={href}
                    className="pointer-events-auto inline-flex items-center justify-center rounded-full px-6 py-3 font-display text-sm font-bold text-ff-ivory transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: INK }}
                  >
                    {data.buttonLabel}
                  </Link>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Points along the bottom — editorial shop bar. Tablet/desktop: even
         *    columns divided by hairlines (the ul's colour shows through 1px gaps),
         *    outlined icon, bold title, muted line. Phone: four columns in one row,
         *    icon on top with the title stacked under it (no second line). ── */}
        {points.length ? (
          <div className="relative z-20 shrink-0 border-t" style={{ borderColor: `${INK}1F` }}>
            <div className="container mx-auto container-padding">
              <ul className="grid grid-cols-4 gap-px" style={{ backgroundColor: `${INK}1F` }}>
                {points.map((point, i) => (
                  <li
                    key={point.id ?? i}
                    className="flex flex-col items-center gap-2 px-0.5 py-3.5 text-center md:flex-row md:gap-3 md:px-6 md:py-5 md:text-left md:first:pl-0"
                    style={{ backgroundColor: PAPER }}
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border md:size-9"
                      style={{ borderColor: `${INK}33` }}
                    >
                      <PointIcon icon={point.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[clamp(8.5px,2.7vw,11.5px)] font-bold uppercase leading-[1.2] md:text-[11px] md:leading-tight md:tracking-[0.06em]">
                        {point.title}
                      </span>
                      {point.text ? (
                        // Phone and short screens: titles only
                        <span className="mt-0.5 hidden text-xs leading-snug opacity-60 md:block [@media(max-height:700px)]:hidden">
                          {point.text}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </section>
    </MotionConfig>
  )
}
