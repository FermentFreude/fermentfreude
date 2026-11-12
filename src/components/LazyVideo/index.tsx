'use client'

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  poster?: string
  className?: string
}

/**
 * Background video that costs nothing until it is near the screen:
 * the file is only requested when the visitor scrolls close, and not at all for
 * people who asked for reduced motion or data saving (they see the poster image).
 */
export const LazyVideo: React.FC<Props> = ({ src, poster, className }) => {
  const ref = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || conn?.saveData) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      autoPlay={load}
      loop
      muted
      playsInline
      preload="none"
      className={className}
      poster={poster}
      src={load ? src : undefined}
    />
  )
}
