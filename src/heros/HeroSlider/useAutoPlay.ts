'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const AUTO_PLAY_INTERVAL = 6000

/**
 * useAutoPlay — Manages slide transitions, auto-play timer, and animation state
 * for the HeroSlider.
 */
export function useAutoPlay(slideCount: number) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [animState, setAnimState] = useState<'entering' | 'visible' | 'exiting'>('entering')
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  /* ── Transition logic ──────────────────────────────────────── */
  const goToSlide = useCallback(
    (nextIndex: number) => {
      if (animState === 'exiting') return
      setAnimState('exiting')
      setTimeout(() => {
        setActiveIndex(nextIndex)
        setAnimState('entering')
        setTimeout(() => setAnimState('visible'), 800)
      }, 450)
    },
    [animState],
  )

  const goNext = useCallback(() => {
    goToSlide((activeIndex + 1) % slideCount)
  }, [activeIndex, goToSlide, slideCount])

  const goPrev = useCallback(() => {
    goToSlide((activeIndex - 1 + slideCount) % slideCount)
  }, [activeIndex, goToSlide, slideCount])

  /* ── Auto-play timer ───────────────────────────────────────── */
  useEffect(() => {
    if (isPaused || animState === 'exiting') return
    timerRef.current = setTimeout(goNext, AUTO_PLAY_INTERVAL)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, isPaused, animState, goNext])

  /* ── Restart progress bar animation on slide change ───────── */
  useEffect(() => {
    if (!progressRef.current) return
    const el = progressRef.current
    el.style.animation = 'none'
    void el.offsetHeight // trigger reflow
    el.style.animation = ''
  }, [activeIndex])

  /* ── Initial enter ─────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setAnimState('visible'), 900)
    return () => clearTimeout(t)
  }, [])

  const isEntering = animState === 'entering'
  const isExiting = animState === 'exiting'

  return {
    activeIndex,
    animState,
    isEntering,
    isExiting,
    isPaused,
    setIsPaused,
    progressRef,
    goToSlide,
    goNext,
    goPrev,
  }
}
