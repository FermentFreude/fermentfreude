'use client'

import { useMotionValue, type MotionValue } from 'motion/react'
import React, { useEffect, useLayoutEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  STORY SCENE HOOKS — shared by the full-screen "story" cards
 *  (voucher gift slide, fermentation story): scroll arrival for the
 *  layer lift, big-word fitting, and the navbar offset.
 * ═══════════════════════════════════════════════════════════════ */

/** 0 while the card is below the screen → 1 once its top reaches the top */
export function useArrival(ref: React.RefObject<HTMLElement | null>): MotionValue<number> {
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
export function useFitSize(
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
      // measure is rendered at 100px; skip while anything is still 0-sized
      // (not laid out yet) — the CSS fallback size shows meanwhile
      if (!box.clientWidth || !box.clientHeight || !measure.scrollWidth) return
      const byWidth = (box.clientWidth / measure.scrollWidth) * 100
      const byHeight = box.clientHeight / (lines * 0.86)
      setSize(Math.floor(Math.min(byWidth, byHeight)))
    }
    fit()
    // Re-measure when the box resizes, the window resizes, and once the web
    // fonts have loaded (the fallback font has different widths)
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    window.addEventListener('resize', fit)
    document.fonts?.ready.then(fit).catch(() => {})
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [boxRef, measureRef, lines])
  return size
}

/** Height of the site navbar while it is on screen, 0 while it has slid away
 *  (it hides on scroll-down, comes back on scroll-up) — so the points bar can sit
 *  flush at the top and still never be covered */
export function useNavOffset() {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('#site-header nav')
    if (!nav) return
    const update = () =>
      setOffset(
        nav.classList.contains('-translate-y-full') ? 0 : nav.getBoundingClientRect().height,
      )
    update()
    const observer = new MutationObserver(update)
    observer.observe(nav, { attributes: true, attributeFilter: ['class'] })
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])
  return offset
}
