'use client'

import { ArrowDown, ArrowUpRight } from 'lucide-react'
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react'
import React from 'react'

import { Media } from '@/components/Media'
import { PointsRow } from '@/components/PointsRow'
import { cn } from '@/utilities/cn'

import type { VoucherContent } from './content'
import { Eyebrow } from './Eyebrow'
import { BuyButton } from './VoucherBuy'
import { VoucherTicket } from './VoucherTicket'

/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER HERO — editorial text left; on the right, chosen in the
 *  admin (hero.visual):
 *    ticket      the drawn €99 ticket (default), leaning towards the mouse
 *    image       a photo instead of the ticket
 *    background  a photo behind the whole hero (optionally blurred) under a
 *                dark shade, text in cream; the ticket stays on top unless
 *                switched off
 * ═══════════════════════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const
// Background blur; the photo is scaled up a little so the soft edges stay outside the frame
const BLUR = {
  none: { px: 0, scale: 1 },
  soft: { px: 3, scale: 1.03 },
  strong: { px: 10, scale: 1.08 },
} as const
const PAPER = '#F9F2E0'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.08 * i },
  }),
}

export function VoucherPageHero({ c }: { c: VoucherContent }) {
  const h = c.hero
  const reduce = useReducedMotion()
  const onPhoto = h.visual === 'background' && !!h.image
  const photoRight = h.visual === 'image' && !!h.image
  const showTicket = !photoRight && (!onPhoto || h.ticketOnBackground)
  /** Photo behind the hero and nothing on the right: the points get the right column (like the Home Tempeh slide) */
  const pointsRight = onPhoto && !showTicket
  const blur = BLUR[h.backgroundBlur] ?? BLUR.soft

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 18 })
  const sy = useSpring(py, { stiffness: 60, damping: 18 })
  // a small lean on top of the resting angle set by the outer layer
  const ticketRotate = useTransform(sx, [-0.5, 0.5], [-1.5, 1.5])
  const ticketX = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const ticketY = useTransform(sy, [-0.5, 0.5], [-8, 8])

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative isolate overflow-hidden"
        style={{ background: onPhoto ? '#1A1A1A' : PAPER }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          px.set(0)
          py.set(0)
        }}
      >
        {onPhoto && h.image && (
          <>
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ scale: blur.scale + 0.06, opacity: 0 }}
              animate={{ scale: blur.scale, opacity: 1 }}
              transition={{ duration: 1.6, ease: EASE }}
              style={blur.px ? { filter: `blur(${blur.px}px)` } : undefined}
            >
              <Media
                resource={h.image}
                fill
                priority
                size={blur.px >= 10 ? '50vw' : '100vw'}
                imgClassName="object-cover"
              />
            </motion.div>
            {/* shade: even on phone, darker on the text side from desktop up */}
            <div
              className="absolute inset-0 -z-10 bg-[#1A1A1A]/60 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgba(26,26,26,0.85)_0%,rgba(26,26,26,0.6)_45%,rgba(26,26,26,0.25)_100%)]"
              aria-hidden="true"
            />
            {/* desktop, points on the right: a shade rising from the bottom so they read
                on the bright half of the photo (like the even veil on the Home Tempeh slide) */}
            {pointsRight && (
              <div
                className="absolute inset-0 -z-10 hidden bg-[linear-gradient(0deg,rgba(26,26,26,0.8)_0%,rgba(26,26,26,0.45)_30%,rgba(26,26,26,0)_60%)] lg:block"
                aria-hidden="true"
              />
            )}
          </>
        )}

        {/* phone/tablet: headline → visual → text; desktop: text left, visual right */}
        <div className="container-padding mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)] gap-x-16 pb-16 pt-10 sm:pt-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:pb-20 lg:pt-12">
          <motion.div
            initial="hidden"
            animate="show"
            className="max-w-xl lg:col-start-1 lg:row-start-2"
          >
            <motion.div variants={fadeUp} custom={0}>
              <Eyebrow tone={onPhoto ? 'light' : 'dark'}>{h.eyebrow}</Eyebrow>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className={cn(
                'mb-0 mt-4 font-display text-[clamp(2.5rem,5.2vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.04em] hyphens-manual',
                onPhoto ? 'text-[#FAF2E0]' : 'text-[#1A1A1A]',
              )}
            >
              {h.headline}
            </motion.h1>
          </motion.div>

          {/* the visual: ticket, photo, or (on a background photo) the ticket again or nothing */}
          {photoRight && h.image ? (
            <motion.div
              className="relative mx-auto mt-10 aspect-4/5 w-full max-w-xl overflow-hidden rounded-2xl bg-[#ECE5DE] lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:max-w-152 lg:self-center"
              initial={{ opacity: 0, y: 40, clipPath: 'inset(6% 6% 6% 6% round 24px)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 16px)' }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
            >
              <Media
                resource={h.image}
                fill
                priority
                size="(min-width: 1024px) 608px, 100vw"
                imgClassName="object-cover"
              />
            </motion.div>
          ) : showTicket ? (
            <div className="mx-auto mt-10 w-full max-w-xl px-2 py-4 sm:py-8 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:max-w-184 lg:self-center">
              <motion.div
                initial={{ opacity: 0, y: 60, rotate: -9 }}
                animate={{ opacity: 1, y: 0, rotate: -3.5 }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.25 }}
              >
                <motion.div
                  style={reduce ? undefined : { rotate: ticketRotate, x: ticketX, y: ticketY }}
                  className="drop-shadow-[0_30px_50px_rgba(26,26,26,0.28)]"
                >
                  <motion.div
                    animate={reduce ? undefined : { y: [0, -7, 0] }}
                    transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1.6 }}
                  >
                    <VoucherTicket
                      amount={99}
                      variant="workshop"
                      text={{ ...c.ticket.workshop, footer: c.ticket.footer, stub: c.ticket.stub }}
                      alt={h.ticketAlt}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div
              className="hidden lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:block"
              aria-hidden="true"
            />
          )}

          <motion.div
            initial="hidden"
            animate="show"
            className="mt-8 max-w-xl lg:col-start-1 lg:row-start-3 lg:mt-0"
          >
            <motion.p
              variants={fadeUp}
              custom={2}
              className={cn(
                'mb-0 mt-6 max-w-md font-sans text-[17px] leading-relaxed lg:text-lg',
                onPhoto ? 'text-[#FAF2E0]/85' : 'text-[#4B4B4B]',
              )}
            >
              {h.text}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-8 flex items-baseline gap-3">
              <span
                className={cn(
                  'font-display text-5xl font-bold leading-none tracking-[-0.03em]',
                  onPhoto ? 'text-[#FAF2E0]' : 'text-[#1A1A1A]',
                )}
              >
                {h.price}
              </span>
              <span
                className={cn(
                  'font-sans text-[15px] text-balance',
                  onPhoto ? 'text-[#FAF2E0]/85' : 'text-[#4B4B4B]',
                )}
              >
                {h.priceNote}
              </span>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4"
            >
              <BuyButton
                amount={99}
                className="group inline-flex min-h-13 items-center gap-2 rounded-full bg-[#E6BE68] px-7 py-3.5 font-display text-base font-bold text-[#1A1A1A] transition hover:bg-[#D4A654]"
              >
                {h.button}
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </BuyButton>
              {c.sections.values && (
                <a
                  href="#betraege"
                  className={cn(
                    'inline-flex min-h-11 items-center gap-1.5 font-display text-[15px] font-bold underline decoration-[#E6BE68] decoration-2 underline-offset-[6px] transition',
                    onPhoto
                      ? 'text-[#FAF2E0] hover:decoration-[#FAF2E0]'
                      : 'text-[#1A1A1A] hover:decoration-[#1A1A1A]',
                  )}
                >
                  {h.secondary}
                  <ArrowDown className="size-4" aria-hidden="true" />
                </a>
              )}
            </motion.div>
          </motion.div>

          {/* Points — like the Home Tempeh slide: centred under the button on phone/tablet;
              on desktop a 26rem column at the far right, bottom-aligned with the price and
              button (or under the button when the right half shows the ticket/photo) */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={5}
            className={cn(
              'mt-10 w-full',
              pointsRight
                ? 'lg:col-start-2 lg:row-start-3 lg:mt-0 lg:w-[min(32rem,100%)] lg:self-end lg:justify-self-end'
                : 'max-w-xl lg:col-start-1 lg:row-start-4 lg:mt-12 lg:self-start',
            )}
          >
            <PointsRow
              items={h.points}
              tone={onPhoto ? 'light' : 'dark'}
              align="center"
              alignLg="start"
              phoneText
              balance
            />
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}
