'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  PARALLAX PANEL — scrolls away at half speed while the next section
 *  glides over it. No sticking, no shrinking or darkening: just a calm
 *  depth effect. Used for the home hero.
 * ═══════════════════════════════════════════════════════════════ */

const SPEED = 0.5

export function ParallaxPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [box, setBox] = useState({ top: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () =>
      setBox({ top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Counter-move the content by half the distance scrolled past it
  const { scrollY } = useScroll()
  const y = useTransform(() => {
    if (!box.height) return 0
    return Math.min(Math.max(scrollY.get() - box.top, 0), box.height) * SPEED
  })

  return (
    <div ref={ref} className="relative overflow-clip">
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  )
}
