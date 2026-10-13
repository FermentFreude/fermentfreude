'use client'

import { cn } from '@/utilities/cn'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  STACK PANEL — sections that stack like cards while you scroll.
 *
 *  Each panel sticks once its bottom edge reaches the bottom of the
 *  screen (so tall panels are fully seen first), and the next panel
 *  slides up over it with rounded top corners and a soft shadow.
 *  The covered panel gently sinks back: slightly smaller and darker.
 *
 *  Pure `position: sticky` — the browser scrolls normally, nothing is
 *  hijacked. Wrap consecutive panels in one container: the stack ends
 *  where that container ends.
 * ═══════════════════════════════════════════════════════════════ */

type Props = {
  children: React.ReactNode
  /** Stacking order — later panels sit on top */
  index: number
  /** Panels after the first get rounded top corners + an upward shadow */
  overlap?: boolean
  /** The last panel doesn't need to stick */
  last?: boolean
}

export function StackPanel({ children, index, overlap = index > 0, last = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [top, setTop] = useState(0)
  /** 0 = fully visible → 1 = fully covered by the next panel */
  const covered = useMotionValue(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Stick when the bottom edge reaches the bottom of the screen
    const measure = () => setTop(Math.min(0, window.innerHeight - el.offsetHeight))
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    window.addEventListener('resize', measure)

    // How far the next panel has slid over this one
    let frame = 0
    const update = () => {
      frame = 0
      const next = el.nextElementSibling as HTMLElement | null
      if (!next) return
      const nextTop = next.getBoundingClientRect().top
      const vh = window.innerHeight
      covered.set(Math.min(1, Math.max(0, 1 - nextTop / vh)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      resize.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [covered])

  const scale = useTransform(covered, [0, 1], [1, 0.94])
  const shade = useTransform(covered, [0, 1], [0, 0.45])

  return (
    <div
      ref={ref}
      className={cn(
        'relative',
        overlap &&
          '-mt-8 overflow-hidden rounded-t-[2rem] shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.35)] md:-mt-10 md:rounded-t-[2.5rem]',
      )}
      style={{ position: last ? 'relative' : 'sticky', top, zIndex: index + 1 }}
    >
      <motion.div className="origin-top" style={last || reduce ? undefined : { scale }}>
        {children}
      </motion.div>
      {/* Darkens as the next panel covers this one */}
      {!last && !reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: shade }}
        />
      ) : null}
    </div>
  )
}
