'use client'

import { useEffect, useState } from 'react'

const SCROLL_THRESHOLD = 320

type Props = {
  label: string
}

export function StickyCurriculumBar({ label }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-30 border-b border-ff-border-light bg-white/95 py-3 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto flex justify-center px-4 container-padding">
        <a
          href="#curriculum"
          className="inline-flex items-center rounded-full bg-ff-near-black px-4 py-2 text-caption font-semibold text-white transition hover:bg-ff-charcoal focus:outline-none focus:ring-2 focus:ring-ff-gold-accent focus:ring-offset-2"
        >
          {label}
        </a>
      </div>
    </div>
  )
}
