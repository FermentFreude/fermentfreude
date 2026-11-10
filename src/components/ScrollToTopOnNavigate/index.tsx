'use client'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Every new page starts at the top.
 *
 * GSAP ScrollTrigger remembers the scroll position whenever it re-measures.
 * After a link from far down Home (e.g. the gastronomy banner → /gastronomy),
 * the next `ScrollTrigger.refresh()` (ScrollTriggerRefresh, when the new page's
 * images change its height) scrolled back to Home's old position — on a
 * shorter page that's the bottom, right at the contact form. So on every new
 * page we clear that memory and start at the top.
 *
 * Back/forward keep the browser's own scroll restoration, and links to a
 * section (#anchor) still jump to that section.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname()
  const isHistoryNav = useRef(false)
  const first = useRef(true)

  useEffect(() => {
    const onPop = () => {
      isHistoryNav.current = true
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (isHistoryNav.current) {
      isHistoryNav.current = false
      return
    }
    if (window.location.hash) return
    ScrollTrigger.clearScrollMemory()
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // Re-read the real position now, so the next refresh restores 0, not Home's old one
    ScrollTrigger.update()
  }, [pathname])

  return null
}
