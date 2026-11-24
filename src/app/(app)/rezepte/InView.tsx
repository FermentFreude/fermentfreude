'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Marks its block with data-anim="pending" after hydration and "in" once it scrolls into
 * view (once). CSS in creative.tsx animates children only under these attributes, so
 * without JavaScript (or when printing) everything simply shows.
 */
export function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'pending' | 'in' | undefined>(undefined)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    setState('pending')
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('in')
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} data-anim={state}>
      {children}
    </div>
  )
}
