'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════
 *  LaktoVoucherCta — "Go with a friend" warm-toned CTA
 *
 *  CMS-driven via `cms` prop (workshopDetail tab in admin).
 *  Falls back to hardcoded defaults when CMS is empty.
 * ═══════════════════════════════════════════════════════════════ */

// ─── CMS Props Type ─────────────────────────────────────────

export type LaktoVoucherCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
  pills?: Array<{ text?: string | null }> | null
}

export function LaktoVoucherCta({ cms }: { cms?: LaktoVoucherCMS }) {
  // ── CMS values → fallback to hardcoded defaults ──
  const eyebrow = cms?.eyebrow ?? 'GEMEINSAM FERMENTIEREN'
  const title = cms?.title ?? 'Go with a friend.'
  const description = cms?.description ?? 'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und neugierige Köpfe.'
  const primaryLabel = cms?.primaryLabel ?? 'Gutschein kaufen'
  const primaryHref = cms?.primaryHref ?? '/voucher'
  const secondaryLabel = cms?.secondaryLabel ?? 'Zum Shop'
  const secondaryHref = cms?.secondaryHref ?? '/shop'
  const pills = (cms?.pills?.length ?? 0) > 0
    ? cms!.pills!.map((p) => p.text ?? '').filter(Boolean)
    : ['Sofort einlösbar', 'Für alle Workshops', 'Digital oder gedruckt']

  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() } },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-padding-lg"
      style={{ backgroundColor: '#F6F0E8' }}
    >
      <div className="container mx-auto container-padding">
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-900 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Eyebrow */}
          <p className="mb-4 font-display text-caption font-bold uppercase tracking-[0.25em] text-[#555954]/60">
            {eyebrow}
          </p>

          {/* Headline */}
          <h2 className="font-display text-display font-bold tracking-tight text-ff-near-black">
            {title}
          </h2>

          {/* Description */}
          <p
            className={`mx-auto mt-5 max-w-lg text-body-lg leading-relaxed text-ff-gray-text transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {description}
          </p>

          {/* Divider accent */}
          <div
            className={`mx-auto mt-8 h-px w-24 transition-all duration-700 ${
              isVisible ? 'w-24 opacity-100' : 'w-0 opacity-0'
            }`}
            style={{ backgroundColor: '#555954', transitionDelay: '350ms' }}
          />

          {/* CTA buttons */}
          <div
            className={`mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '450ms' }}
          >
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-full bg-[#555954] px-10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#3c3c3c] hover:scale-[1.03] active:scale-[0.97]"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#555954]/30 px-10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-[#555954] transition-all duration-300 hover:border-[#555954] hover:scale-[1.03] active:scale-[0.97]"
            >
              {secondaryLabel}
            </Link>
          </div>

          {/* Feature pills */}
          <div
            className={`mt-10 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {pills.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#555954]/15 bg-white/60 px-5 py-2 font-display text-caption font-semibold uppercase tracking-wide text-ff-gray-text"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
