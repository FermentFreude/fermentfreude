'use client'

import { Pointer } from 'lucide-react'
import { motion } from 'motion/react'
import React, { useCallback, useEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  SWIPE CAPSULE — the wordless control under a sideways-swipe row:
 *  a hand that swipes (the gesture itself) + one dot per item.
 *
 *  · the hand fades out while you swipe and comes back once you stop
 *  · it swipes the way you last went (swiping back flips it)
 *  · on the last item it disappears and the capsule shrinks to the dots
 *  · tapping a dot jumps to that item
 *
 *  useSwipeTrack() follows a native horizontal scroller; <SwipeCapsule>
 *  draws the control. useSwipeNudge() slides the row a little to the
 *  left and back once, the first time it comes into view.
 * ═══════════════════════════════════════════════════════════════ */

export type HandDirection = 'forward' | 'back' | 'hidden'

type TrackOptions = {
  trackRef: React.RefObject<HTMLElement | null>
  itemRefs: React.RefObject<(HTMLElement | null)[]>
  count: number
  /** When false (e.g. desktop with its own scroll scene) nothing is tracked */
  enabled?: () => boolean
}

export function useSwipeTrack({ trackRef, itemRefs, count, enabled }: TrackOptions) {
  const [active, setActive] = useState(0)
  const [handDirection, setHandDirection] = useState<HandDirection>('forward')
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track || count === 0) return

    let swipeStartLeft: number | null = null
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    /** Index of the item whose start is closest to the left edge */
    const closestIndex = () => {
      const trackRect = track.getBoundingClientRect()
      let closest = 0
      let minDistance = Number.POSITIVE_INFINITY
      itemRefs.current?.forEach((item, index) => {
        if (!item) return
        const distance = Math.abs(item.getBoundingClientRect().left - trackRect.left)
        if (distance < minDistance) {
          minDistance = distance
          closest = index
        }
      })
      // At the end of the scroll the last item may not reach the left edge
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 8) return count - 1
      return closest
    }

    /* Hand, decided once a swipe has settled: hidden on the last item, forward
     * on the first; in between it follows the net direction of your last swipe.
     * A small swipe that snaps back to the same item changes nothing. */
    const updateHand = () => {
      const index = closestIndex()
      const net = swipeStartLeft === null ? 0 : track.scrollLeft - swipeStartLeft
      setHandDirection((prev) =>
        index >= count - 1
          ? 'hidden'
          : index === 0
            ? 'forward'
            : net > 24
              ? 'forward'
              : net < -24
                ? 'back'
                : prev === 'hidden'
                  ? 'back'
                  : prev,
      )
    }

    const syncActive = () => {
      if (enabled && !enabled()) return
      setActive(closestIndex())
    }

    const onScroll = () => {
      syncActive()
      if (swipeStartLeft === null) swipeStartLeft = track.scrollLeft
      setIsSwiping(true)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        updateHand()
        swipeStartLeft = null
        setIsSwiping(false)
      }, 600)
    }

    syncActive()
    updateHand()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', syncActive)
    return () => {
      clearTimeout(idleTimer)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', syncActive)
    }
  }, [trackRef, itemRefs, count, enabled])

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(count - 1, index))
      const el = itemRefs.current?.[clamped]
      const track = trackRef.current
      if (!el || !track) return
      // Sideways only — scrollIntoView could also move the page or the track vertically
      const snapLeft = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0
      const left =
        el.getBoundingClientRect().left -
        track.getBoundingClientRect().left +
        track.scrollLeft -
        snapLeft
      track.scrollTo({ left, behavior: 'smooth' })
      setActive(clamped)
    },
    [count, itemRefs, trackRef],
  )

  return { active, handDirection, isSwiping, goTo }
}

/** Slides the row a little to the left and back once, when the track first comes
 *  into view — shows there is more to swipe to. Skipped with "reduce motion". */
export function useSwipeNudge(
  trackRef: React.RefObject<HTMLElement | null>,
  rowRef: React.RefObject<HTMLElement | null>,
  count: number,
  enabled?: () => boolean,
) {
  useEffect(() => {
    const track = trackRef.current
    const row = rowRef.current
    if (!track || !row || count < 2) return
    if (enabled && !enabled()) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        if (track.scrollLeft > 24) return
        row.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-56px)', offset: 0.45 },
            { transform: 'translateX(0)' },
          ],
          { duration: 1400, delay: 500, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
        )
      },
      { threshold: 0.5 },
    )
    observer.observe(track)
    return () => observer.disconnect()
  }, [trackRef, rowRef, count, enabled])
}

type CapsuleProps = {
  /** One label per item (used for the dots' accessible names) */
  labels: string[]
  active: number
  handDirection: HandDirection
  isSwiping: boolean
  onSelect: (index: number) => void
  ariaLabel: string
}

export function SwipeCapsule({
  labels,
  active,
  handDirection,
  isSwiping,
  onSelect,
  ariaLabel,
}: CapsuleProps) {
  // Hand visible only when resting, and not on the last item
  const showHand = handDirection !== 'hidden' && !isSwiping

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full bg-ff-near-black py-2 pr-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-[padding] duration-400 ${showHand ? 'pl-4' : 'pl-3'}`}
      role="group"
      aria-label={ariaLabel}
    >
      {/* Hand + divider: collapse away (capsule shrinks to the dots) while swiping and on the last item */}
      <motion.span
        aria-hidden
        data-hand={handDirection}
        className="flex items-center gap-3 overflow-hidden"
        initial={false}
        animate={{
          width: showHand ? 'auto' : 0,
          opacity: showHand ? 1 : 0,
          marginRight: showHand ? 0 : -12,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="flex h-5 w-7 shrink-0 items-center justify-center">
          {/* key restarts the loop when the direction flips */}
          <motion.span
            key={handDirection}
            className="inline-flex text-ff-ivory"
            animate={
              handDirection === 'back'
                ? { x: [-7, 7, -7], rotate: [8, 14, 8] }
                : { x: [7, -7, 7], rotate: [-8, -14, -8] }
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: 'easeInOut',
              times: [0, 0.55, 1],
            }}
          >
            <Pointer className="size-4" strokeWidth={1.75} />
          </motion.span>
        </span>
        <span className="h-4 w-px shrink-0 bg-white/15" />
      </motion.span>
      <div className="flex items-center">
        {labels.map((label, index) => {
          const isActive = index === active
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className="flex h-6 items-center rounded-full px-1 outline-none focus-visible:ring-2 focus-visible:ring-ff-gold"
              aria-label={`${label}${isActive ? ' (current)' : ''}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Active = longer gold bar, others small ivory dots */}
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? 'w-5 bg-ff-gold' : 'w-1.5 bg-ff-ivory/35'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
