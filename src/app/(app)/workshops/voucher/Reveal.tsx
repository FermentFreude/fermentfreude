'use client'

import { motion } from 'motion/react'
import React from 'react'

const EASE = [0.16, 1, 0.3, 1] as const
const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const

/** Fades a block up once it scrolls into view (skipped with reduced motion). */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** A photo frame that opens from a slightly smaller window as it scrolls in, the picture settling from a light zoom. */
export function RevealImage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(6% 6% 6% 6% round 24px)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 16px)' }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.6, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
