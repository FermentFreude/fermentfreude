'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  WorkshopPhases — Three-phase workshop experience section
 *
 *  Displays the flow/journey of the workshop:
 *  Phase 1 → Phase 2 → Phase 3
 *
 *  Each phase has: label, title, description, optional image
 * ═══════════════════════════════════════════════════════════════ */

export type WorkshopPhasesBlock = {
  blockType: 'workshopPhases'
  eyebrow?: string | null
  heading?: string | null
  phases?: Array<{
    label?: string | null
    title?: string | null
    description?: string | null
    image?: unknown
    id?: string
  }> | null
}

type Phase = NonNullable<WorkshopPhasesBlock['phases']>[number]

export const WorkshopPhasesComponent: React.FC<
  WorkshopPhasesBlock & {
    id?: string | number
    className?: string
  }
> = (props) => {
  const block = props as WorkshopPhasesBlock & { id?: string | number }
  const { eyebrow, heading, phases, id } = block

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Fallback defaults if CMS is empty
  const displayEyebrow = eyebrow ?? 'Workshop Phases'
  const displayHeading = heading ?? 'What to Expect'
  const displayPhases: Phase[] = phases && Array.isArray(phases) && phases.length > 0 ? phases : []

  if (!displayPhases.length) return null

  return (
    <section
      id={typeof id === 'string' ? id : undefined}
      className="relative w-full bg-white py-16 sm:py-20 md:py-24 lg:py-32"
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-379 px-4 sm:px-6 text-center">
        {displayEyebrow && (
          <p
            className={`font-display text-[11px] font-bold uppercase tracking-[0.25em] text-ff-gray-15 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {displayEyebrow}
          </p>
        )}

        {displayHeading && (
          <h2
            className={`mt-3 font-display text-heading font-black leading-[1.15] tracking-tight text-ff-near-black transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {displayHeading}
          </h2>
        )}
      </div>

      {/* ── Phases Grid ────────────────────────────────────────── */}
      <div className="mx-auto mt-12 max-w-379 px-4 sm:px-6 sm:mt-16 md:mt-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
          {displayPhases.map((phase: Phase, idx) => {
            // Follow TeamCards pattern: check if object, then cast
            const hasImage = phase.image && typeof phase.image === 'object'

            return (
              <div
                key={phase.id || idx}
                className={`flex flex-col rounded-2xl overflow-hidden bg-ff-warm-gray/30 transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${400 + idx * 100}ms` }}
              >
                {/* ── Phase Image ────────────────────────────────── */}
                {hasImage ? (
                  <div className="relative h-40 overflow-hidden bg-ff-warm-gray">
                    <Media
                      resource={phase.image as MediaType}
                      fill
                      imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={phase.title || `Phase ${idx + 1}`}
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-linear-to-br from-ff-warm-gray to-ff-warm-gray/50" />
                )}

                {/* ── Phase Content ──────────────────────────────── */}
                <div className="flex flex-col p-6 md:p-7 lg:p-8">
                  {phase.label && (
                    <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-ff-gray-15 mb-2">
                      {phase.label}
                    </p>
                  )}

                  {phase.title && (
                    <h3 className="font-display text-title font-bold leading-[1.3] tracking-tight text-ff-near-black mb-3">
                      {phase.title}
                    </h3>
                  )}

                  {phase.description && (
                    <p className="text-body-sm leading-relaxed text-ff-gray-text">
                      {phase.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
