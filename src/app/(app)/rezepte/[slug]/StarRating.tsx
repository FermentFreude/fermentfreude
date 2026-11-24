'use client'

import { useEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  "Hat's geschmeckt?" — 1 to 5 stars. Sends to /api/recipes/rate
 *  (one vote per person and recipe; voting again changes it).
 *  The browser remembers your own vote (best effort, localStorage).
 * ═══════════════════════════════════════════════════════════════ */

type Labels = { title: string; thanks: string; error: string; one: string; many: string; starsAria: string }

const KEY = (slug: string) => `ff-rating:${slug}`

export function StarRating({
  slug,
  initial,
  labels,
  locale,
}: {
  slug: string
  initial: { count: number; average: number }
  labels: Labels
  locale: 'de' | 'en'
}) {
  const [summary, setSummary] = useState(initial)
  const [mine, setMine] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  useEffect(() => {
    try {
      const v = Number(window.localStorage.getItem(KEY(slug)))
      if (v >= 1 && v <= 5) setMine(v)
    } catch {
      // storage blocked: just don't remember
    }
  }, [slug])

  const vote = async (stars: number) => {
    if (state === 'sending') return
    setState('sending')
    try {
      const res = await fetch('/api/recipes/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, stars }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { count: number; average: number }
      setSummary({ count: data.count, average: data.average })
      setMine(stars)
      setState('done')
      try {
        window.localStorage.setItem(KEY(slug), String(stars))
      } catch {
        // ignore
      }
    } catch {
      setState('error')
    }
  }

  const shown = hover ?? mine ?? 0
  const avg = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-AT', { maximumFractionDigits: 1 }).format(summary.average)

  return (
    // in the title card, centred: the question in deep Sage, five small Mustard stars below it, then the result
    <div className="mt-1 flex flex-col items-center gap-1 border-t border-[#2D2F2C]/10 pt-4 print:hidden">
      <p className="font-display text-[0.95rem] font-bold text-[#4F6F5C]">{labels.title}</p>
      <div role="group" aria-label={labels.title} className="flex" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={labels.starsAria.replace('{n}', String(n))}
            aria-pressed={mine === n}
            disabled={state === 'sending'}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => vote(n)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#E6BE68] disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path
                d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3L2.8 9.5l6.4-.9L12 2.8Z"
                fill={n <= shown ? '#E6BE68' : 'transparent'}
                stroke={n <= shown ? '#C9A04A' : 'rgb(45 47 44 / 35%)'}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      <p className="font-display text-[0.82rem] text-[#2D2F2C]/55" aria-live="polite">
        {state === 'done'
          ? labels.thanks
          : state === 'error'
            ? labels.error
            : summary.count > 0
              ? `${avg} / 5 · ${summary.count} ${summary.count === 1 ? labels.one : labels.many}`
              : ''}
      </p>
    </div>
  )
}
