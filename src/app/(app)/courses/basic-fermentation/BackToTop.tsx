'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

const SCROLL_THRESHOLD = 400

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-ff-near-black text-white shadow-lg transition hover:bg-ff-charcoal focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2"
    >
      <ChevronUp className="size-6" strokeWidth={2.5} aria-hidden />
    </button>
  )
}
