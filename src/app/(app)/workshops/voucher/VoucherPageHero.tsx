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

import { PointsRow } from '@/components/PointsRow'
import type { VoucherContent } from './content'
import { Eyebrow } from './Eyebrow'
import { BuyButton } from './VoucherBuy'
import { VoucherTicket } from './VoucherTicket'

/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER HERO — editorial text left, the €99 workshop ticket
 *  right. On a mouse the ticket leans gently towards the pointer.
 * ═══════════════════════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const
const PAPER = '#F9F2E0'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.08 * i } }),
}

export function VoucherPageHero({ c }: { c: VoucherContent }) {
  const h = c.hero
  const reduce = useReducedMotion()

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
        className="relative overflow-hidden"
        style={{ background: PAPER }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          px.set(0)
          py.set(0)
        }}
      >
        {/* phone/tablet: headline → ticket → text; desktop: text left, ticket right */}
        <div className="container-padding mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)] gap-x-16 pb-16 pt-10 sm:pt-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:pb-20 lg:pt-12">
          <motion.div initial="hidden" animate="show" className="max-w-xl lg:col-start-1 lg:row-start-2">
            <motion.div variants={fadeUp} custom={0}>
              <Eyebrow>{h.eyebrow}</Eyebrow>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-0 mt-4 font-display text-[clamp(2.5rem,5.2vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.04em] hyphens-manual text-[#1A1A1A]"
            >
              {h.headline}
            </motion.h1>
          </motion.div>

          {/* the €99 ticket */}
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

          <motion.div initial="hidden" animate="show" className="mt-8 max-w-xl lg:col-start-1 lg:row-start-3 lg:mt-0">
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mb-0 mt-6 max-w-md font-sans text-[17px] leading-relaxed text-[#4B4B4B] lg:text-lg"
            >
              {h.text}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-8 flex items-baseline gap-3">
              <span className="font-display text-5xl font-bold leading-none tracking-[-0.03em] text-[#1A1A1A]">
                {h.price}
              </span>
              <span className="font-sans text-[15px] text-[#4B4B4B]">{h.priceNote}</span>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
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
              <a
                href="#betraege"
                className="inline-flex min-h-11 items-center gap-1.5 font-display text-[15px] font-bold text-[#1A1A1A] underline decoration-[#E6BE68] decoration-2 underline-offset-[6px] transition hover:decoration-[#1A1A1A]"
              >
                {h.secondary}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} custom={5} className="mt-10 lg:mt-12">
              <PointsRow items={h.points} tone="dark" phoneText size="sm" />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}
