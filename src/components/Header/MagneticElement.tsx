'use client'

import { gsap } from 'gsap'
import React, { useCallback, useRef } from 'react'

/**
 * MagneticElement — wraps any element to give it a magnetic "pull" effect
 * on mouse hover, inspired by the ElasticCursor from rafaela-studio.
 *
 * On hover the child shifts toward the cursor with a spring ease.
 * On leave it springs back to its original position.
 *
 * Desktop only — the effect is disabled below 1024 px.
 */

interface MagneticElementProps {
  children: React.ReactNode
  /** How strongly the element follows the cursor (0–1). Default 0.35 */
  strength?: number
  /** Extra class names for the wrapper */
  className?: string
}

export function MagneticElement({ children, strength = 0.35, className }: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || window.innerWidth < 1024) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(ref.current, {
        x: x * strength,
        y: y * strength,
        duration: 0.6,
        ease: 'power3.out',
      })
    },
    [strength],
  )

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)',
    })
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}
    </div>
  )
}
