'use client'

import { SectionHeader } from '@/components/SectionHeader'
import { SwipeCapsule, useSwipeNudge, useSwipeTrack } from '@/components/SwipeCapsule'
import type { FermentationFactsBlock as Props } from '@/payload-types'
import { MotionConfig, motion, type Variants } from 'motion/react'
import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  FERMENTATION FACTS — a short sideways story (3–6 cards) about
 *  fermentation, nutrition and what research looks at. Native swipe
 *  row on every screen; the shared swipe capsule (hand + dots) sits
 *  under it. Cards are numbered, text is CMS, sources optional.
 * ═══════════════════════════════════════════════════════════════ */

const INK = '#1A1A1A'
const PAPER = '#F5E7D6'
const EASE = [0.16, 1, 0.3, 1] as const

const cardIn: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.1 + i * 0.08 },
  }),
}

const pad = (n: number) => String(n).padStart(2, '0')

export const FermentationFactsBlock: React.FC<Props & { id?: string }> = ({
  visible,
  eyebrow,
  heading,
  slides,
  id,
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const items = slides ?? []

  const { active, handDirection, isSwiping, goTo } = useSwipeTrack({
    trackRef,
    itemRefs: cardRefs,
    count: items.length,
  })
  useSwipeNudge(trackRef, rowRef, items.length)

  /* Line the first card up with the heading: the row's side padding (and the snap
   * padding) = where the container's content starts, measured at every width */
  const headRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const head = headRef.current
    const track = trackRef.current
    const row = rowRef.current
    if (!head || !track || !row) return
    const align = () => {
      const left =
        head.getBoundingClientRect().left + parseFloat(getComputedStyle(head).paddingLeft)
      row.style.paddingLeft = `${left}px`
      row.style.paddingRight = `${left}px`
      track.style.scrollPaddingLeft = `${left}px`
    }
    align()
    const observer = new ResizeObserver(align)
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [items.length])

  if (visible === false || items.length === 0) return null

  return (
    <MotionConfig reducedMotion="user">
      <section id={id ?? undefined} className="bg-white section-padding-md" style={{ color: INK }}>
        <div ref={headRef} className="container mx-auto container-padding">
          <SectionHeader eyebrow={eyebrow} heading={heading} className="mb-8 lg:mb-10" />
        </div>

        {/* Sideways swipe row — first card lines up with the heading (padding set in
            the effect above), the next card always peeks in on the right */}
        <div
          ref={trackRef}
          className="snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            overscrollBehaviorX: 'contain',
            scrollPaddingInline: 'var(--space-container-x)',
          }}
        >
          <div ref={rowRef} className="flex w-max gap-4 md:gap-6">
            {items.map((slide, i) => (
              <motion.article
                key={slide.id ?? i}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                custom={i}
                variants={cardIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="flex w-[82vw] shrink-0 snap-start flex-col rounded-2xl p-6 sm:w-[60vw] md:p-8 lg:w-[38vw] xl:w-[30rem]"
                style={{ backgroundColor: PAPER }}
              >
                <p className="mb-0 font-display text-sm font-bold tabular-nums opacity-40">
                  {pad(i + 1)} / {pad(items.length)}
                </p>
                <h3 className="mt-6 font-display text-2xl font-bold leading-tight tracking-[-0.02em] md:mt-10 md:text-3xl">
                  {slide.title}
                </h3>
                <p className="mb-0 mt-4 whitespace-pre-line text-base leading-relaxed opacity-80">
                  {slide.text}
                </p>
                {slide.sourceLabel ? (
                  <p className="mb-0 mt-auto pt-6 text-xs opacity-55">
                    {slide.sourceUrl ? (
                      <a
                        href={slide.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-current/30 underline-offset-2 hover:decoration-current"
                      >
                        {slide.sourceLabel}
                      </a>
                    ) : (
                      slide.sourceLabel
                    )}
                  </p>
                ) : null}
              </motion.article>
            ))}
          </div>
        </div>

        {items.length > 1 ? (
          <div className="mt-8 flex justify-center px-6">
            <SwipeCapsule
              labels={items.map((s) => s.title)}
              active={active}
              handDirection={handDirection}
              isSwiping={isSwiping}
              onSelect={goTo}
              ariaLabel="Fermentation facts"
            />
          </div>
        ) : null}
      </section>
    </MotionConfig>
  )
}
