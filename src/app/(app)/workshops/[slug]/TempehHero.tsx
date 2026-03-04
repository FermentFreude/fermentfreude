'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  TempehHero — Dedicated hero for /workshops/tempeh
 *
 *  Full-viewport split layout inspired by the home HeroSlider:
 *  LEFT:  Clustered pot/vessel silhouettes (placeholder)
 *  RIGHT: Eyebrow + title + description + CTA
 *
 *  Design language: warm browns/creams, clean typography,
 *  serif-like display font, award-worthy minimalism.
 * ═══════════════════════════════════════════════════════════════ */

// ─── Fermentation Vessel Silhouette Placeholder ─────────────

function VesselSilhouette({ className, delay }: { className?: string; delay: number }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-linear-to-b from-[#d4b896]/50 to-[#c4a87a]/40 shadow-xl backdrop-blur-sm transition-all duration-1000 ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Lid accent */}
      <div className="absolute inset-x-2 top-0 h-2 rounded-full bg-[#555954]/40" />
      {/* Rim detail */}
      <div className="absolute inset-x-1 top-2 h-1 rounded-full bg-white/20 backdrop-blur-sm" />
      {/* Interior gradient */}
      <div className="absolute inset-2 top-1/3 rounded-sm bg-white/15 backdrop-blur-sm" />
    </div>
  )
}

// ─── CMS Props ──────────────────────────────────────────────

export type TempehHeroCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  attributes?: Array<{ text?: string | null }> | null
  image?: MediaType | string | null
}

// ─── Main Component ─────────────────────────────────────────

export function TempehHero({ cms }: { cms?: TempehHeroCMS }) {
  // CMS values with English defaults
  const eyebrow = cms?.eyebrow ?? 'Workshop Experience'
  const titleRaw = cms?.title ?? 'Die Kunst der\nTempeh-Fermentation'
  const titleLines = titleRaw.split('\n')
  const description =
    cms?.description ??
    'Lerne Schritt für Schritt, wie du Tempeh selbst herstellst — von der Vorbereitung bis zum fertigen, aromatischen Ferment.'
  const attributes =
    (cms?.attributes?.length ?? 0) > 0
      ? cms!.attributes!.map((a) => a.text ?? '').filter(Boolean)
      : ['3 Stunden', 'Hands-on', 'Experience']

  const heroImage =
    cms?.image && typeof cms.image === 'object' && 'url' in cms.image
      ? (cms.image as MediaType)
      : null

  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-svh w-full overflow-hidden"
      style={{ backgroundColor: '#F6F3F0' }}
    >
      {/* ── Background watermark ────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span
          className={`font-display text-[18vw] font-black uppercase tracking-[-0.04em] transition-opacity duration-1000 ${
            isVisible ? 'opacity-[0.04]' : 'opacity-0'
          }`}
          style={{ color: '#555954' }}
        >
          Tempeh
        </span>
      </div>

      {/* ── Mobile Layout (below lg) ───────────────────── */}
      <div className="flex w-full flex-col lg:hidden">
        {/* Mobile top — image fills full width */}
        <div className="relative h-[58vh] min-h-56 w-full overflow-hidden">
          {heroImage ? (
            <>
              <Media
                resource={heroImage}
                fill
                imgClassName={`object-cover transition-all duration-1000 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                priority
              />
              {/* subtle gradient blending into dark text panel below */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-[#555954]/50" />
            </>
          ) : (
            <div className="flex h-full items-end justify-center pb-8 pt-28">
              <div
                className={`flex items-end gap-3 transition-all duration-1000 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <VesselSilhouette className="h-32 w-24 -rotate-6" delay={200} />
                <VesselSilhouette className="h-40 w-28 rotate-2" delay={350} />
                <VesselSilhouette className="h-28 w-20 rotate-6" delay={500} />
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom — text */}
        <div
          className="flex flex-col items-center pb-20 pt-4 text-center px-6"
          style={{ backgroundColor: '#555954' }}
        >
          <p
            className={`mb-3 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {eyebrow}
          </p>
          <h1
            className={`font-display text-2xl font-black leading-[1.08] tracking-tight text-white sm:text-3xl transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p
            className={`mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/80 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {description}
          </p>
          <div
            className={`mt-4 flex w-full max-w-xs items-center justify-between px-2 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <div className="h-px w-full bg-white/20" />
          </div>
          <div
            className={`mt-3 flex items-center gap-4 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '750ms' }}
          >
            {attributes.map((attr, i) => (
              <span key={attr} className="flex items-center gap-4">
                <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-white/90">
                  {attr}
                </span>
                {i < attributes.length - 1 && (
                  <span className="h-3 w-px bg-white/25" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop Layout (lg+) ───────────────────────── */}
      <div className="hidden h-full min-h-svh w-full lg:flex">
        {/* LEFT — image fills the entire left half */}
        <div className="relative flex-1 overflow-hidden">
          {heroImage ? (
            <div className="absolute inset-0">
              <Media
                resource={heroImage}
                fill
                imgClassName={`object-cover transition-all duration-1200 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                priority
              />
            </div>
          ) : (
            <div className="flex h-full items-end justify-center pb-16">
              <div
                className={`relative flex items-end gap-4 xl:gap-6 transition-all duration-1200 ${
                  isVisible
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-12 opacity-0 scale-95'
                }`}
              >
                <VesselSilhouette className="h-44 w-32 -rotate-6 xl:h-52 xl:w-40" delay={300} />
                <VesselSilhouette className="h-56 w-40 rotate-2 xl:h-64 xl:w-48" delay={450} />
                <VesselSilhouette className="h-40 w-28 rotate-6 xl:h-48 xl:w-36" delay={600} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Panel with text */}
        <div
          className="flex w-[44%] xl:w-[40%] flex-col items-center justify-center px-10 xl:px-16 text-center transition-colors duration-700"
          style={{ backgroundColor: '#555954' }}
        >
          {/* Eyebrow */}
          <p
            className={`mb-4 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-white/60 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {eyebrow}
          </p>

          {/* Title */}
          <h1
            className={`font-display text-hero font-black leading-[1.08] tracking-tight text-white transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '450ms' }}
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>

          {/* Description */}
          <p
            className={`mx-auto mt-5 max-w-sm text-body-sm leading-relaxed text-white/75 xl:max-w-md xl:text-body transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {description}
          </p>

          {/* Divider + attributes */}
          <div
            className={`mt-6 w-full max-w-sm transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <div className="h-px w-full bg-white/20" />
            <div className="mt-4 flex items-center justify-between px-2">
              {attributes.map((attr, i) => (
                <span key={attr} className="flex items-center gap-4">
                  <span className="font-display text-[10px] font-semibold uppercase tracking-widest text-white/90 xl:text-xs">
                    {attr}
                  </span>
                  {i < attributes.length - 1 && (
                    <span className="h-4 w-px bg-white/25" aria-hidden="true" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ───────────────────────────── */}
      <div
        className={`absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        style={{ transitionDelay: '1000ms' }}
      >
        <span className="font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-[#555954]/60 lg:text-white/50">
          Scroll
        </span>
        <div className="h-8 w-px animate-pulse bg-[#555954]/30 lg:bg-white/30" />
      </div>
    </section>
  )
}
