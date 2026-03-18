'use client'

import { ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

/* ── Hardcoded English defaults ──────────────────────────────── */
const DEFAULT_TEXT = 'We Have Digital Workshops too, take a look'
const DEFAULT_LINK = '/workshops'

interface AnnouncementBarProps {
  enabled?: boolean | null
  text?: string | null
  link?: string | null
}

export function AnnouncementBar({ enabled, text, link }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true)

  const resolvedEnabled = enabled ?? true
  const resolvedText = text ?? DEFAULT_TEXT
  const resolvedLink = link ?? DEFAULT_LINK

  if (!visible || !resolvedEnabled) return null

  return (
    <div className="w-full">
      <div className="relative flex w-full items-center justify-center bg-ff-near-black dark:bg-white px-6 py-3">
        <Link
          href={resolvedLink}
          className="flex items-center gap-3 text-ff-ivory dark:text-ff-near-black font-display text-sm md:text-base font-normal transition-opacity hover:opacity-90"
        >
          <span>{resolvedText}</span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 text-ff-ivory/60 dark:text-ff-near-black/60 hover:text-ff-ivory dark:hover:text-ff-near-black transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
