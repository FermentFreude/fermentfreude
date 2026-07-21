'use client'

/**
 * FeldInsGlas — rotating circular seal (Figma Make stamp).
 * Ring text spins; center word stays fixed (e.g. FERM / ENTATION).
 */

import { useId } from 'react'

type Props = {
  ringText?: string
  /** Single label from copy (e.g. FERMENTATION) — split for two-line stamp */
  centerText?: string
  centerLines?: [string, string]
  className?: string
  size?: number
}

function splitCenterText(text: string): [string, string] {
  const t = text.trim().toUpperCase()
  if (t === 'FERMENTATION') return ['FERM', 'ENTATION']
  if (t === 'FERMENT') return ['FER', 'MENT']
  if (t.includes(' · ')) {
    const [a, b] = t.split(' · ')
    if (a && b) return [a.trim(), b.trim()]
  }
  if (t.length <= 5) return [t, '']
  const mid = Math.ceil(t.length / 2)
  return [t.slice(0, mid), t.slice(mid)]
}

export function EditionSeal({
  ringText = 'EINMALIGE VERANSTALTUNG',
  centerText,
  centerLines,
  className = '',
  size = 140,
}: Props) {
  const lines: [string, string] =
    centerLines ?? (centerText ? splitCenterText(centerText) : ['FERM', 'ENTATION'])
  const gold = '#F2E2B8'
  const pathId = useId().replace(/:/g, '')
  const ringLabel = ` · ${ringText} · ${ringText} · `

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="feld-seal-spin absolute inset-0 motion-reduce:[animation:none]">
        <svg viewBox="0 0 148 148" className="h-full w-full" fill="none">
          <circle cx="74" cy="74" r="71" stroke={gold} strokeWidth="1.15" opacity="0.95" />
          <circle cx="74" cy="74" r="56" stroke={gold} strokeWidth="0.75" opacity="0.45" />
          <defs>
            <path
              id={pathId}
              d="M 74,74 m -63.5,0 a 63.5,63.5 0 1,1 127,0 a 63.5,63.5 0 1,1 -127,0"
            />
          </defs>
          <text
            fill={gold}
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.32em"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              {ringLabel}
            </textPath>
          </text>
        </svg>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-display font-bold uppercase leading-none tracking-[0.28em] text-[#F2E2B8]"
          style={{ fontSize: Math.max(9, size * 0.082) }}
        >
          {lines[0]}
        </span>
        {lines[1] ? (
        <span
          className="mt-0.5 font-display font-bold uppercase leading-none tracking-[0.28em] text-[#F2E2B8]"
          style={{ fontSize: Math.max(9, size * 0.082) }}
        >
          {lines[1]}
        </span>
        ) : null}
      </div>
    </div>
  )
}
