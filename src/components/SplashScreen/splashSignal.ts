'use client'

import { useEffect, useState } from 'react'

/**
 * Splash ↔ page handshake.
 *
 * The SplashScreen covers the page on every full load (~5s). Entrance
 * animations that run on mount would finish hidden behind it, so the splash
 * announces when it starts sweeping away and animated sections wait for that.
 * On client-side navigation the splash is gone, so they start right away.
 */

const SPLASH_EVENT = 'ff:splash'

type SplashState = 'revealing' | 'done'

/** Called by SplashScreen when its close wave starts, and again when it unmounts. */
export function announceSplash(state: SplashState) {
  document.documentElement.dataset.splash = state
  window.dispatchEvent(new Event(SPLASH_EVENT))
}

/** Safety net — never leave content hidden if the splash fails to announce. */
const FALLBACK_MS = 6000

function isPageVisible() {
  const state = document.documentElement.dataset.splash
  if (state === 'revealing' || state === 'done') return true
  // No splash rendered (client navigation, or it already finished)
  return !document.getElementById('site-splash')?.childElementCount
}

/** True once the page is visible to the user (splash sweeping away, or no splash at all). */
export function useSplashReveal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isPageVisible()) {
      setVisible(true)
      return
    }
    const onSplash = () => {
      if (isPageVisible()) setVisible(true)
    }
    const fallback = setTimeout(() => setVisible(true), FALLBACK_MS)
    window.addEventListener(SPLASH_EVENT, onSplash)
    return () => {
      clearTimeout(fallback)
      window.removeEventListener(SPLASH_EVENT, onSplash)
    }
  }, [])

  return visible
}
