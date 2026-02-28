'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React, { useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

interface FadeInProps {
  children: React.ReactNode
  className?: string
  /** Stagger delay in seconds */
  delay?: number
  /** Direction to animate from */
  from?: 'bottom' | 'left' | 'right'
  /** Animation duration in seconds (default 0.9) */
  duration?: number
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  from = 'bottom',
  duration = 1.4,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const initial = {
    bottom: { y: 80, x: 0, skewY: 1.5 },
    left: { y: 0, x: -80, skewY: 0 },
    right: { y: 0, x: 80, skewY: 0 },
  }

  useGSAP(
    () => {
      if (!ref.current) return

      // Respect prefers-reduced-motion: skip animation entirely
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(ref.current, { opacity: 1 })
        return
      }

      const { y, x, skewY } = initial[from]

      gsap.set(ref.current, { y, x, opacity: 0, skewY })

      gsap.to(ref.current, {
        y: 0,
        x: 0,
        opacity: 1,
        skewY: 0,
        duration,
        delay: delay / 1000, // convert ms to seconds for backwards compat
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 82%',
          once: true,
        },
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
