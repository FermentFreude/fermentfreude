'use client'

import { gsap } from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useMouse } from '@/hooks/use-mouse'

/* ── GSAP ticker hook ──────────────────────────────────────── */

function useTicker(callback: () => void, paused: boolean) {
  useEffect(() => {
    if (!paused && callback) {
      gsap.ticker.add(callback)
    }
    return () => {
      gsap.ticker.remove(callback)
    }
  }, [callback, paused])
}

/* ── Persistent instance ref (avoids re-init) ──────────────── */

function useInstance<T>(factory: () => T): T {
  const ref = useRef<T | null>(null)
  if (ref.current === null) {
    ref.current = factory()
  }
  return ref.current
}

/* ── Helpers ───────────────────────────────────────────────── */

/** Velocity → squeeze scale factor (capped at 0.35) */
function getScale(diffX: number, diffY: number) {
  const distance = Math.sqrt(diffX ** 2 + diffY ** 2)
  return Math.min(distance / 735, 0.35)
}

/** Velocity → angle in degrees for CSS rotate */
function getAngle(diffX: number, diffY: number) {
  return (Math.atan2(diffY, diffX) * 180) / Math.PI
}

/**
 * Walk up to 5 parent levels looking for `.cursor-can-hover`.
 */
function getHoverableAncestor(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el
  for (let i = 0; i < 6; i++) {
    if (!current) return null
    if (current.classList.contains('cursor-can-hover')) return current
    current = current.parentElement
  }
  return null
}

/**
 * Detect if we are over a button, link, image, or other interactive element
 * where the blob should completely hide and show a normal pointer.
 * `.cursor-can-hover` takes priority — blob stays visible there.
 */
function shouldHideBlob(el: HTMLElement): boolean {
  // cursor-can-hover wins — blob should appear on these
  if (el.closest('.cursor-can-hover')) return false

  // Any interactive element → hide blob
  if (
    el.closest(
      'a, button, [data-slot="button"], [role="button"], input, select, textarea, label, .dropdown-glass, .cursor-normal-zone',
    )
  )
    return true

  // Media elements → hide blob (no invert on images)
  const tag = el.tagName
  if (tag === 'IMG' || tag === 'VIDEO' || tag === 'SVG' || tag === 'CANVAS') return true
  if (el.closest('figure, picture')) return true

  return false
}

const CURSOR_DIAMETER = 70

/* ── Component ─────────────────────────────────────────────── */

export function ElasticCursor() {
  const [isMobile, setIsMobile] = useState(true)
  const jellyRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const isHoveringRef = useRef(false)
  const isHiddenRef = useRef(false)
  const [cursorMoved, setCursorMoved] = useState(false)
  const { x, y } = useMouse()

  // Persistent position and velocity objects
  const pos = useInstance(() => ({ x: 0, y: 0 }))
  const vel = useInstance(() => ({ x: 0, y: 0 }))
  const set = useInstance(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => ({}) as Record<string, any>,
  )

  // Check viewport width
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Set up GSAP quickSetters
  useLayoutEffect(() => {
    if (!jellyRef.current || isMobile) return
    set.x = gsap.quickSetter(jellyRef.current, 'x', 'px')
    set.y = gsap.quickSetter(jellyRef.current, 'y', 'px')
    set.r = gsap.quickSetter(jellyRef.current, 'rotate', 'deg')
    set.sx = gsap.quickSetter(jellyRef.current, 'scaleX')
    set.sy = gsap.quickSetter(jellyRef.current, 'scaleY')
    set.width = gsap.quickSetter(jellyRef.current, 'width', 'px')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  /** Immediately hide blob + dot (synchronous, no animation delay) */
  const hideBlob = useCallback(() => {
    if (isHiddenRef.current) return
    isHiddenRef.current = true
    isHoveringRef.current = false
    if (jellyRef.current) {
      gsap.killTweensOf(jellyRef.current)
      jellyRef.current.style.opacity = '0'
      jellyRef.current.style.visibility = 'hidden'
    }
    if (dotRef.current) {
      dotRef.current.style.opacity = '0'
    }
  }, [])

  /** Show blob + dot again */
  const showBlob = useCallback(() => {
    if (!isHiddenRef.current) return
    isHiddenRef.current = false
    if (jellyRef.current) {
      jellyRef.current.style.visibility = 'visible'
      jellyRef.current.style.opacity = '1'
    }
    if (dotRef.current) {
      dotRef.current.style.opacity = '1'
    }
  }, [])

  // Animation loop — runs on every GSAP tick
  const loop = useCallback(() => {
    if (!set.width || !set.sx || !set.sy || !set.r) return
    // Skip updates when blob is hidden
    if (isHiddenRef.current) return

    const rotation = getAngle(vel.x, vel.y)
    const scale = getScale(vel.x, vel.y)

    if (!isHoveringRef.current) {
      set.x(pos.x)
      set.y(pos.y)
      set.width(70 + scale * 300)
      set.r(rotation)
      set.sx(1 + scale)
      set.sy(1 - scale * 2)
    } else {
      set.r(0)
    }
  }, [pos, vel, set])

  // Mouse move handler
  useLayoutEffect(() => {
    if (isMobile) return

    const setFromEvent = (e: MouseEvent) => {
      if (!jellyRef.current) return
      if (!cursorMoved) setCursorMoved(true)

      const el = e.target as HTMLElement

      // Check if blob should be hidden
      if (shouldHideBlob(el)) {
        hideBlob()
        // Still update position so blob doesn't jump when it reappears
        pos.x = e.clientX
        pos.y = e.clientY
        vel.x = 0
        vel.y = 0
        return
      }

      // Show blob if it was hidden
      showBlob()

      const hoverableEl = getHoverableAncestor(el)

      if (hoverableEl) {
        const textEl = hoverableEl.querySelector('p, span.inline-block') as HTMLElement | null
        const measureEl = textEl || hoverableEl
        const rect = measureEl.getBoundingClientRect()

        isHoveringRef.current = true
        gsap.to(jellyRef.current, { rotate: 0, duration: 0 })
        gsap.to(jellyRef.current, {
          width: rect.width + 16,
          height: rect.height + 12,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          borderRadius: 4,
          duration: 1.2,
          ease: 'elastic.out(1, 0.35)',
        })
      } else {
        gsap.to(jellyRef.current, {
          borderRadius: '50%',
          width: CURSOR_DIAMETER,
          height: CURSOR_DIAMETER,
        })
        isHoveringRef.current = false
      }

      const mouseX = e.clientX
      const mouseY = e.clientY

      gsap.to(pos, {
        x: mouseX,
        y: mouseY,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        onUpdate: () => {
          vel.x = (mouseX - (pos.x as number)) * 1.2
          vel.y = (mouseY - (pos.y as number)) * 1.2
        },
      })

      loop()
    }

    window.addEventListener('mousemove', setFromEvent)
    return () => window.removeEventListener('mousemove', setFromEvent)
  }, [isMobile, cursorMoved, loop, pos, vel, hideBlob, showBlob])

  useTicker(loop, !cursorMoved || isMobile)

  if (isMobile) return null

  return (
    <>
      {/* Jelly blob */}
      <div
        ref={jellyRef}
        className="fixed left-0 top-0 pointer-events-none will-change-transform -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: CURSOR_DIAMETER,
          height: CURSOR_DIAMETER,
          backgroundColor: '#ffffff',
          mixBlendMode: 'difference',
          zIndex: 9999,
          transition: 'opacity 0.15s ease, visibility 0.15s ease',
        }}
      />
      {/* Small tracking dot */}
      <div
        ref={dotRef}
        className="w-2 h-2 rounded-full fixed -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          top: y,
          left: x,
          backgroundColor: 'rgba(180, 180, 180, 0.35)',
          zIndex: 9999,
          transition: 'opacity 0.15s ease',
        }}
      />
    </>
  )
}
