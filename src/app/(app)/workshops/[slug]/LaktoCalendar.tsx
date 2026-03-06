'use client'

import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  LaktoCalendar — Modern Seasonal Fermentation Calendar
 *
 *  CMS-driven via `cms` prop (workshopDetail tab in admin).
 *  Falls back to hardcoded MONTHS data when CMS is empty.
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS Props Type ─────────────────────────────────────────

export type LaktoCalendarCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  months?: Array<{
    month?: string | null
    monthShort?: string | null
    monthNumber?: string | null
    season?: string | null
    accent?: string | null
    recipes?: Array<{ name?: string | null }> | null
  }> | null
}

type MonthEntry = {
  month: string
  monthShort: string
  monthNumber: string
  season: string
  recipes: string[]
  accent: string
  accentDot: string
}

const MONTHS: MonthEntry[] = [
  {
    month: 'März',
    monthShort: 'MÄR',
    monthNumber: '03',
    season: 'FRÜHLING',
    recipes: ['Fermentierte Curry-Zwiebel', 'Milchsaure Radieschen-Pickles', 'Kohlrabi Kimchi'],
    accent: '#e6be68',
    accentDot: '#d4a94e',
  },
  {
    month: 'April',
    monthShort: 'APR',
    monthNumber: '04',
    season: 'FRÜHLING',
    recipes: ['Milchsaure Bärlauchblüten', 'Fermentierter Rhabarber-Kohlrabi', 'Radieschen Kimchi'],
    accent: '#555954',
    accentDot: '#3d3d3c',
  },
  {
    month: 'Mai',
    monthShort: 'MAI',
    monthNumber: '05',
    season: 'FRÜHLING',
    recipes: ['Fermentierter Spargel', 'Rhabarber-Sauerkraut', 'Kohlrabi-Kimchi'],
    accent: '#1a1a1a',
    accentDot: '#000000',
  },
]

/** Darken/lighten a hex color by a fixed amount */
function adjustColor(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(h.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(h.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(h.substring(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ─── Component ──────────────────────────────────────────────

export function LaktoCalendar({ cms }: { cms?: LaktoCalendarCMS }) {
  // ── CMS values → fallback to hardcoded defaults ──
  const eyebrow = cms?.eyebrow ?? 'SAISONALE REZEPTE'
  const title = cms?.title ?? 'Fermentkalender'
  const description =
    cms?.description ??
    'Entdecke was du in jedem Monat fermentieren kannst — frisch, saisonal und voller Geschmack.'

  const months: MonthEntry[] =
    (cms?.months?.length ?? 0) > 0
      ? cms!.months!.map((m) => ({
          month: m.month ?? '',
          monthShort: m.monthShort ?? '',
          monthNumber: m.monthNumber ?? '',
          season: m.season ?? '',
          recipes: (m.recipes ?? []).map((r) => r.name ?? '').filter(Boolean),
          accent: m.accent ?? '#e6be68',
          accentDot: m.accent ? adjustColor(m.accent, -20) : '#d4a94e',
        }))
      : MONTHS

  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

  // Auto-rotate
  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % months.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isVisible, months.length])

  const active = months[activeIndex]

  if (months.length === 0) return null

  return (
    <section ref={sectionRef} className="section-padding-lg overflow-hidden bg-ff-cream">
      <div className="container mx-auto container-padding">
        {/* ── Header ─────────────────────────────────── */}
        <div
          className={`mb-16 transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p
            className="mb-3 font-display text-caption font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--ff-gold, #e6be68)' }}
          >
            {eyebrow}
          </p>
          <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-near-black">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-body-lg leading-relaxed text-ff-gray-text">
            {description}
          </p>
        </div>

        {/* ── Timeline Navigation ────────────────────── */}
        <div
          className={`relative mb-12 transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Line */}
          <div className="absolute left-0 right-0 top-5 h-px bg-ff-border-light" />

          <div className="relative flex justify-between">
            {months.map((entry, i) => (
              <button
                key={entry.month}
                onClick={() => setActiveIndex(i)}
                className="group relative flex flex-col items-center"
              >
                {/* Dot */}
                <div
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    activeIndex === i
                      ? 'scale-110 border-transparent shadow-lg'
                      : 'border-ff-border-light bg-white hover:border-[#555954]/30 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: activeIndex === i ? entry.accent : undefined,
                  }}
                >
                  <span
                    className={`font-display text-[11px] font-bold tracking-wide transition-colors duration-300 ${
                      activeIndex === i
                        ? 'text-white'
                        : 'text-ff-gray-text-light group-hover:text-ff-near-black'
                    }`}
                  >
                    {entry.monthShort}
                  </span>
                </div>

                {/* Label below */}
                <span
                  className={`mt-3 font-display text-body-sm font-medium transition-all duration-300 ${
                    activeIndex === i ? 'text-ff-near-black' : 'text-ff-gray-text-light'
                  }`}
                >
                  {entry.month}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active Month Card ──────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl border border-ff-border-light transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
          style={{
            transitionDelay: '400ms',
            backgroundColor: active.accent + '0d', // very faint tint
          }}
        >
          {/* Watermark */}
          <div className="pointer-events-none absolute -right-4 -top-8 select-none">
            <span
              className="font-display text-[14rem] font-black leading-none opacity-[0.04]"
              style={{ color: active.accent }}
            >
              {active.monthNumber}
            </span>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-0">
            {/* Left: Month info */}
            <div className="flex flex-col justify-center px-8 py-10 sm:px-10 lg:border-r lg:border-ff-border-light">
              <p className="mb-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ff-gray-text-light">
                {active.season}
              </p>
              <h3 className="font-display text-display font-bold tracking-tight text-ff-near-black">
                {active.month}
              </h3>
              <div
                className="mt-4 h-1 w-16 rounded-full transition-colors duration-500"
                style={{ backgroundColor: active.accent }}
              />
              <p className="mt-4 text-body text-ff-gray-text">
                {active.recipes.length} saisonale Rezepte
              </p>
            </div>

            {/* Right: Recipes */}
            <div className="px-8 py-10 sm:px-10">
              <p className="mb-6 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-ff-gray-text-light">
                REZEPTE DIESES MONATS
              </p>
              <ul className="space-y-5">
                {active.recipes.map((recipe, j) => (
                  <li
                    key={`${active.month}-${j}`}
                    className="flex items-center gap-4 transition-all duration-500"
                    style={{ transitionDelay: `${j * 100}ms` }}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
                      style={{ backgroundColor: active.accent + '20' }}
                    >
                      <span
                        className="size-2 rounded-full transition-colors duration-500"
                        style={{ backgroundColor: active.accentDot }}
                      />
                    </span>
                    <span className="text-body-lg font-medium text-ff-near-black">{recipe}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Progress dots ──────────────────────────── */}
        <div className="mt-8 flex justify-center gap-2">
          {months.map((entry, i) => (
            <button
              key={entry.month}
              onClick={() => setActiveIndex(i)}
              aria-label={`${entry.month} anzeigen`}
              className={`rounded-full transition-all duration-500 ${
                activeIndex === i ? 'h-2 w-8' : 'size-2 hover:scale-125'
              }`}
              style={{
                backgroundColor: activeIndex === i ? entry.accent : '#d4d0c8',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
