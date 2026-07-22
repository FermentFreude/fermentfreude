'use client'

/**
 * FeldInsGlas — rotating circular seal (Figma Make stamp).
 * Ring text spins; center stays fixed (FERMENT / freude).
 */

import { useId, useMemo } from 'react'

const RING_RADIUS = 63.5

type Props = {
  ringText?: string
  /** Single label from copy — use "WORD · word" for two-line stamp */
  centerText?: string
  centerLines?: [string, string]
  className?: string
  size?: number
}

function splitCenterText(text: string): [string, string] {
  const raw = text.trim()
  if (raw.includes(' · ')) {
    const [a, b] = raw.split(' · ')
    if (a && b) {
      const left = a.trim()
      const right = b.trim()
      // Brand lockup: FERMENT + freude (small f)
      if (right.toUpperCase() === 'FREUDE') {
        return [left.toUpperCase() === 'FERMENT' ? 'FERMENT' : left, 'freude']
      }
      return [left, right]
    }
  }
  // Also accept "ferment freude" / "FermentFreude" / "FERMENT freude"
  const upperCompact = raw.toUpperCase().replace(/[\s·.•]+/g, '')
  if (upperCompact === 'FERMENTFREUDE') return ['FERMENT', 'freude']
  if (raw.length <= 5) return [raw, '']
  const mid = Math.ceil(raw.length / 2)
  return [raw.slice(0, mid), raw.slice(mid)]
}

/**
 * 2–3 spaced repeats so the ring reads clearly without crushing letters.
 * Shorter phrases get more repeats; longer ones get fewer.
 */
function buildRingLabel(phrase: string): string {
  const p = phrase.trim().toUpperCase()
  const repeats = p.length > 18 ? 2 : 3
  return Array.from({ length: repeats }, () => p).join('  ·  ') + '  ·  '
}

export function EditionSeal({
  ringText = 'SPEZIAL-WORKSHOP',
  centerText,
  centerLines,
  className = '',
  size = 140,
}: Props) {
  const lines: [string, string] =
    centerLines ?? (centerText ? splitCenterText(centerText) : ['FERMENT', 'freude'])
  const ringLabel = useMemo(() => buildRingLabel(ringText), [ringText])
  const gold = '#F2E2B8'
  const pathId = useId().replace(/:/g, '')

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="feld-seal-spin absolute inset-0 motion-reduce:[animation:none]">
        <svg
          viewBox="0 0 148 148"
          className="h-full w-full overflow-visible"
          fill="none"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <circle cx="74" cy="74" r="71" stroke={gold} strokeWidth="1.2" opacity="0.95" />
          <circle cx="74" cy="74" r="55" stroke={gold} strokeWidth="0.7" opacity="0.4" />
          <defs>
            <path
              id={pathId}
              d={`M 74,74 m -${RING_RADIUS},0 a ${RING_RADIUS},${RING_RADIUS} 0 1,1 ${RING_RADIUS * 2},0 a ${RING_RADIUS},${RING_RADIUS} 0 1,1 -${RING_RADIUS * 2},0`}
            />
          </defs>
          <text
            fill={gold}
            fontSize="7.5"
            fontWeight="600"
            letterSpacing="0.22em"
            style={{
              fontFamily: 'var(--font-display), sans-serif',
              textRendering: 'geometricPrecision',
            }}
          >
            {/* Natural spacing only — no textLength (that crushed / overlapped glyphs) */}
            <textPath href={`#${pathId}`} startOffset="0%" method="align" spacing="auto">
              {ringLabel}
            </textPath>
          </text>
        </svg>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <span
          className="font-display font-bold uppercase leading-none tracking-[0.2em] text-[#F2E2B8]"
          style={{ fontSize: Math.max(10, size * 0.088) }}
        >
          {lines[0]}
        </span>
        {lines[1] ? (
          <span
            className="mt-1 font-display font-bold leading-none tracking-[0.2em] text-[#F2E2B8] normal-case"
            style={{ fontSize: Math.max(10, size * 0.088) }}
          >
            {lines[1]}
          </span>
        ) : null}
      </div>
    </div>
  )
}
