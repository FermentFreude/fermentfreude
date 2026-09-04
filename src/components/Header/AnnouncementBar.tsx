'use client'

import { ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

/* ── Hardcoded English defaults — only used when the CMS field is empty ── */
const DEFAULT_TEXT = 'Explore our online courses'
const DEFAULT_LINK = '/courses'

interface AnnouncementBarProps {
  enabled?: boolean | null
  text?: string | null
  link?: string | null
}

export function AnnouncementBar({ enabled, text, link }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true)

  const resolvedEnabled = enabled ?? true
  const resolvedText = (text ?? DEFAULT_TEXT).trim() || DEFAULT_TEXT
  const resolvedLink = link ?? DEFAULT_LINK

  if (!visible || !resolvedEnabled) return null

  return (
    <div className="w-full">
      <div className="relative flex w-full items-center justify-center bg-ff-charcoal dark:bg-ff-cream px-11 sm:px-14 py-1.5 md:py-2">
        <Link
          href={resolvedLink}
          className="flex max-w-[min(100%,42rem)] items-center justify-center gap-2 text-ff-ivory dark:text-ff-charcoal font-display text-[11px] md:text-xs font-medium tracking-wide transition-opacity hover:opacity-85"
        >
          <span className="text-center leading-snug line-clamp-2">{resolvedText}</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full text-ff-ivory/55 dark:text-ff-charcoal/50 hover:text-ff-ivory dark:hover:text-ff-charcoal hover:bg-white/10 dark:hover:bg-ff-charcoal/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
