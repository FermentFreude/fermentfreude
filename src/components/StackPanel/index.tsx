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
  /** Shrink + darken while the next panel covers this one (default on) */
  sink?: boolean
}

export function StackPanel({
  children,
  index,
  overlap = index > 0,
  last = false,
  sink = true,
}: Props) {
  const sinks = sink && !last
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

    // Share of this panel the next one already covers: 0 while the next panel
    // is still below this one's bottom edge (nothing hidden yet) → 1 fully covered
    let frame = 0
    const update = () => {
      frame = 0
      const next = el.nextElementSibling as HTMLElement | null
      if (!next) return
      const own = el.getBoundingClientRect()
      const nextTop = next.getBoundingClientRect().top
      covered.set(Math.min(1, Math.max(0, (own.bottom - nextTop) / own.height)))
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

  // Subtle: the covered panel sinks back just a little
  const scale = useTransform(covered, [0, 1], [1, 0.97])
  const shade = useTransform(covered, [0, 1], [0, 0.3])

  return (
    <div
      ref={ref}
      className={cn(
        'relative',
        overlap &&
          // No negative margin: the previous panel is always seen in full before this one covers it
          'overflow-clip rounded-t-[2rem] shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.35)] md:rounded-t-[2.5rem]',
      )}
      style={
        last
          ? { position: 'relative', zIndex: index + 1 }
          : { position: 'sticky', top, zIndex: index + 1 }
      }
    >
      <motion.div className="origin-top" style={!sinks || reduce ? undefined : { scale }}>
        {children}
      </motion.div>
      {/* Darkens as the next panel covers this one */}
      {sinks && !reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: shade }}
        />
      ) : null}
    </div>
  )
}
