'use client'

import { cn } from '@/utilities/cn'
import { Pointer } from 'lucide-react'
import { MotionConfig, motion, type MotionValue } from 'motion/react'
import React from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  SCROLL CUE — the upright sibling of the workshop swipe capsule.
 *  A dark capsule with a gesture (phone/tablet: a hand swiping up,
 *  desktop: a mouse wheel) above a gold progress bar.
 *
 *  · resting=false (while scrolling): the gesture collapses away and
 *    the capsule shrinks to just the bar
 *  · direction='up': the gesture flips (you are scrolling back)
 *  · visible=false: the whole capsule fades out (e.g. at the end)
 * ═══════════════════════════════════════════════════════════════ */

type Props = {
  /** 0 → 1, drives the gold bar */
  progress: MotionValue<number>
  visible: boolean
  resting: boolean
  direction: 'down' | 'up'
  className?: string
}

const EASE = [0.16, 1, 0.3, 1] as const
const LOOP = { duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' } as const

export function ScrollCue({ progress, visible, resting, direction, className }: Props) {
  const down = direction === 'down'

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        data-direction={direction}
        className={cn(
          'pointer-events-none flex flex-col items-center rounded-full bg-ff-near-black px-2 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
          className,
        )}
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* Gesture + divider — collapse away while scrolling */}
        <motion.div
          className="flex flex-col items-center gap-3 overflow-hidden"
          initial={false}
          animate={{
            height: resting ? 'auto' : 0,
            opacity: resting ? 1 : 0,
            marginBottom: resting ? 12 : 0,
          }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <span className="flex h-7 w-5 shrink-0 items-center justify-center">
            {/* Phone/tablet: finger swipes up (= scroll down); key restarts the loop on a flip */}
            <motion.span
              key={`hand-${direction}`}
              className="inline-flex text-ff-ivory lg:hidden"
              animate={
                down
                  ? { y: [9, -9, -9], opacity: [0, 1, 0] }
                  : { y: [-9, 9, 9], opacity: [0, 1, 0] }
              }
              transition={{ ...LOOP, times: [0, 0.65, 1] }}
            >
              <Pointer className="size-4" strokeWidth={1.75} />
            </motion.span>
            {/* Desktop: mouse with a rolling wheel */}
            <span className="relative hidden h-6 w-4 rounded-full border-[1.5px] border-ff-ivory/80 lg:block">
              <motion.span
                key={`wheel-${direction}`}
                className="absolute left-1/2 top-1 -ml-[1.5px] h-1.5 w-[3px] rounded-full bg-ff-ivory"
                animate={down ? { y: [0, 7], opacity: [1, 0] } : { y: [7, 0], opacity: [1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.3, ease: 'easeOut' }}
              />
            </span>
          </span>
          <span className="h-px w-4 shrink-0 bg-white/15" />
        </motion.div>

        {/* Progress — fills gold from the top */}
        <span className="relative block h-14 w-1.5 overflow-hidden rounded-full bg-ff-ivory/25">
          <motion.span
            className="absolute inset-0 origin-top rounded-full bg-ff-gold"
            style={{ scaleY: progress }}
          />
        </span>
      </motion.div>
    </MotionConfig>
  )
}
