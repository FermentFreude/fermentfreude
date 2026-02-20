'use client'

import { useCallback, useRef } from 'react'

/**
 * useSwipe — Touch/swipe handler for mobile slider navigation.
 * Returns touch event handlers and requires goNext/goPrev callbacks.
 *
 * Only triggers if the horizontal swipe exceeds 50px and is
 * dominant over vertical movement (1.2x ratio).
 */
export function useSwipe({ goNext, goPrev }: { goNext: () => void; goPrev: () => void }) {
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current
      touchStartX.current = null
      touchStartY.current = null

      // Only trigger if horizontal swipe is dominant and exceeds threshold
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) goNext()
        else goPrev()
      }
    },
    [goNext, goPrev],
  )

  return { handleTouchStart, handleTouchEnd }
}
