'use client'

import { ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-ff-charcoal">
      <div className="container relative flex items-center justify-center py-2.5">
        <Link
          href="/workshops"
          className="flex items-center gap-2 text-ff-ivory text-sm md:text-base font-normal transition-opacity hover:opacity-90"
        >
          <span>We Have Digital Workshops too, take a look</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 text-ff-ivory/70 hover:text-ff-ivory transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
