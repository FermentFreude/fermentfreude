'use client'

import { ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="w-full">
      <div className="relative flex w-full items-center justify-center bg-ff-near-black dark:bg-white px-6 py-3">
        <Link
          href="/workshops"
          className="flex items-center gap-3 text-ff-ivory dark:text-ff-near-black font-display text-sm md:text-base font-normal transition-opacity hover:opacity-90"
        >
          <span>We Have Digital Workshops too, take a look</span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 text-white dark:text-ff-near-black/60 hover:text-ff-ivory dark:hover:text-ff-near-black transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
