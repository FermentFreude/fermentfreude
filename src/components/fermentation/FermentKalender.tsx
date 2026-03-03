'use client'

import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  Fermentkalender — Seasonal Fermentation Calendar
 *
 *  A modern, interactive calendar showing seasonal fermentation
 *  recipes by month. Features:
 *  - Animated entrance on scroll (IntersectionObserver)
 *  - Soft seasonal accent colours per month
 *  - Active month highlight with smooth transitions
 *  - Responsive: horizontal cards on desktop, stacked on mobile
 * ═══════════════════════════════════════════════════════════════ */

// ─── Data ───────────────────────────────────────────────────

type MonthEntry = {
  month: string
  monthShort: string
  monthNumber: string
  recipes: string[]
  accent: string        // bg tint for card highlight
  accentDot: string     // dot bullet colour
  accentBorder: string  // top border accent
}

const CALENDAR_DATA: MonthEntry[] = [
  {
    month: 'März',
    monthShort: 'MÄR',
    monthNumber: '03',
    recipes: [
      'Fermentierte Curry-Zwiebel',
      'Milchsaure Radieschen-Pickles',
      'Kohlrabi Kimchi',
    ],
    accent: '#eef3ee',
    accentDot: '#7a9a7a',
    accentBorder: '#7a9a7a',
  },
  {
    month: 'April',
    monthShort: 'APR',
    monthNumber: '04',
    recipes: [
      'Milchsaure Bärlauchblüten',
      'Fermentierter Rhabarber-Kohlrabi',
      'Radieschen Kimchi',
    ],
    accent: '#f3f0e8',
    accentDot: '#b8a060',
    accentBorder: '#b8a060',
  },
  {
    month: 'Mai',
    monthShort: 'MAI',
    monthNumber: '05',
    recipes: [
      'Fermentierter Spargel',
      'Rhabarber-Sauerkraut',
      'Kohlrabi-Kimchi',
    ],
    accent: '#f0ece6',
    accentDot: '#c48c5c',
    accentBorder: '#c48c5c',
  },
]

// ─── Leaf SVG Icon ──────────────────────────────────────────

function LeafIcon({ className = 'size-5', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c-4-4-8-7.5-8-12C4 5.5 7.5 2 12 2c4.5 0 8 3.5 8 8 0 4.5-4 8-8 12z" />
      <path d="M12 22V8" />
      <path d="M8 12c2-1 4 1 4 1s2-2 4-1" />
    </svg>
  )
}

// ─── Main Component ─────────────────────────────────────────

export function FermentKalender() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Animate in on scroll
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-rotate active month
  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CALENDAR_DATA.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="section-padding-lg bg-ff-cream"
    >
      <div className="container mx-auto container-padding">
        {/* ── Header ───────────────────────────────────── */}
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <span className="mb-4 inline-flex items-center gap-2 font-display text-caption font-bold uppercase tracking-[0.2em] text-ff-gray-text-light">
            <LeafIcon className="size-4" color="var(--ff-gold-accent)" />
            Saisonale Rezepte
            <LeafIcon className="size-4" color="var(--ff-gold-accent)" />
          </span>
          <h2 className="mt-4 font-display text-section-heading font-bold tracking-tight text-ff-near-black">
            Fermentkalender
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-ff-gray-text">
            Entdecke was du in jedem Monat fermentieren kannst — frisch, saisonal und voller Geschmack.
          </p>
        </div>

        {/* ── Month Selector (mobile-visible, desktop-hidden) ─ */}
        <div className="mb-8 flex justify-center gap-2 lg:hidden">
          {CALENDAR_DATA.map((entry, i) => (
            <button
              key={entry.month}
              onClick={() => setActiveIndex(i)}
              className={`rounded-(--radius-pill) px-5 py-2 font-display text-body-sm font-semibold transition-all duration-300 ${
                activeIndex === i
                  ? 'bg-ff-near-black text-ff-cream'
                  : 'bg-ff-warm-gray text-ff-gray-text hover:bg-ff-border-light'
              }`}
            >
              {entry.monthShort}
            </button>
          ))}
        </div>

        {/* ── Cards Grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {CALENDAR_DATA.map((entry, i) => (
            <MonthCard
              key={entry.month}
              entry={entry}
              index={i}
              isActive={activeIndex === i}
              isVisible={isVisible}
              onActivate={() => setActiveIndex(i)}
            />
          ))}
        </div>

        {/* ── Timeline dots (desktop only) ─────────────── */}
        <div className="mt-10 hidden items-center justify-center gap-3 lg:flex">
          {CALENDAR_DATA.map((entry, i) => (
            <button
              key={entry.month}
              onClick={() => setActiveIndex(i)}
              aria-label={`${entry.month} anzeigen`}
              className={`rounded-full transition-all duration-500 ${
                activeIndex === i
                  ? 'h-3 w-10'
                  : 'size-3 hover:scale-125'
              }`}
              style={{
                backgroundColor: activeIndex === i ? entry.accentBorder : '#d4d0c8',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Month Card ─────────────────────────────────────────────

function MonthCard({
  entry,
  index,
  isActive,
  isVisible,
  onActivate,
}: {
  entry: MonthEntry
  index: number
  isActive: boolean
  isVisible: boolean
  onActivate: () => void
}) {
  const delay = index * 150

  return (
    <button
      onClick={onActivate}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border text-left transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      } ${
        isActive
          ? 'border-transparent shadow-lg ring-1 lg:scale-[1.03]'
          : 'border-ff-border-light shadow-sm hover:shadow-md lg:scale-100'
      }`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        backgroundColor: isActive ? entry.accent : 'var(--ff-cream)',
        // @ts-expect-error ring-color as inline style
        '--tw-ring-color': isActive ? entry.accentBorder : 'transparent',
      }}
    >
      {/* Top accent stripe */}
      <div
        className={`h-1.5 w-full transition-all duration-500 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
        style={{ backgroundColor: entry.accentBorder }}
      />

      <div className="relative px-8 pb-10 pt-8">
        {/* Watermark number */}
        <span
          className={`pointer-events-none absolute -right-2 -top-2 select-none font-display text-[8rem] font-black leading-none transition-opacity duration-500 ${
            isActive ? 'opacity-[0.07]' : 'opacity-[0.03]'
          }`}
          style={{ color: entry.accentBorder }}
        >
          {entry.monthNumber}
        </span>

        {/* Month label */}
        <div className="relative mb-8">
          <span
            className={`inline-block rounded-(--radius-pill) px-4 py-1.5 font-display text-body-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
              isActive ? 'text-white' : 'text-ff-gray-text-light'
            }`}
            style={{
              backgroundColor: isActive ? entry.accentBorder : 'transparent',
              border: isActive ? 'none' : '1px solid var(--ff-border-light)',
            }}
          >
            {entry.monthShort}
          </span>
          <h3 className="mt-4 font-display text-subheading font-bold tracking-tight text-ff-near-black">
            {entry.month}
          </h3>
        </div>

        {/* Recipe list */}
        <ul className="relative space-y-4">
          {entry.recipes.map((recipe, j) => (
            <li
              key={j}
              className="flex items-start gap-3.5"
            >
              {/* Animated dot */}
              <span
                className={`mt-[0.45rem] block size-2.5 shrink-0 rounded-full transition-all duration-500 ${
                  isActive ? 'scale-100' : 'scale-75'
                }`}
                style={{
                  backgroundColor: isActive ? entry.accentDot : '#c8c4bc',
                }}
              />
              <span
                className={`text-body-lg leading-relaxed transition-colors duration-300 ${
                  isActive ? 'text-ff-near-black' : 'text-ff-gray-text'
                }`}
              >
                {recipe}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  )
}

export default FermentKalender
