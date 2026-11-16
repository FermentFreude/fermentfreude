import type { CSSProperties } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop colors — Fermentfreude palette
 *
 *  Cream #FAF2E0 · Charcoal #2D2F2C · Sage #B0C7B8 · Mustard #E6BE68
 *
 *  Each workshop gets one palette color so the workshops are easy to tell
 *  apart (cards, date rows, booking buttons). Change colors here only —
 *  /workshops and the three workshop pages all read from this file.
 *
 *  fill = accent surface · on = text on fill · ink = text on tint · tint = light surface
 * ═══════════════════════════════════════════════════════════════ */

export const FF_PALETTE = {
  cream: '#FAF2E0',
  charcoal: '#2D2F2C',
  sage: '#B0C7B8',
  mustard: '#E6BE68',
} as const

export type WorkshopColor = {
  fill: string
  on: string
  ink: string
  tint: string
  /** Solid button that sits ON a fill-colored surface (e.g. colored card) */
  btn?: string
  btnOn?: string
  /** Hover state for buttons filled with `fill` — always clearly darker */
  hover?: string
  hoverOn?: string
}

export const WORKSHOP_COLORS: Record<string, WorkshopColor> = {
  lakto: { fill: FF_PALETTE.sage, on: FF_PALETTE.charcoal, ink: FF_PALETTE.charcoal, tint: FF_PALETTE.cream, btn: FF_PALETTE.charcoal, btnOn: FF_PALETTE.cream, hover: FF_PALETTE.charcoal, hoverOn: FF_PALETTE.cream },
  kombucha: { fill: FF_PALETTE.mustard, on: FF_PALETTE.charcoal, ink: FF_PALETTE.charcoal, tint: FF_PALETTE.cream, btn: FF_PALETTE.charcoal, btnOn: FF_PALETTE.cream, hover: FF_PALETTE.charcoal, hoverOn: FF_PALETTE.cream },
  tempeh: { fill: FF_PALETTE.charcoal, on: FF_PALETTE.cream, ink: FF_PALETTE.charcoal, tint: FF_PALETTE.cream, btn: FF_PALETTE.cream, btnOn: FF_PALETTE.charcoal, hover: '#000000', hoverOn: FF_PALETTE.cream },
  basics: { fill: FF_PALETTE.charcoal, on: FF_PALETTE.cream, ink: FF_PALETTE.charcoal, tint: FF_PALETTE.cream, btn: FF_PALETTE.cream, btnOn: FF_PALETTE.charcoal, hover: '#000000', hoverOn: FF_PALETTE.cream },
}

/** CSS variables (--ws, --ws-on, --ws-ink, --ws-tint) for a workshop, to use with bg-(--ws) etc. */
export function workshopColorVars(typeOrColor: string | WorkshopColor): CSSProperties {
  const c =
    typeof typeOrColor === 'string'
      ? (WORKSHOP_COLORS[typeOrColor] ?? WORKSHOP_COLORS.basics)
      : typeOrColor
  return {
    '--ws': c.fill,
    '--ws-on': c.on,
    '--ws-ink': c.ink,
    '--ws-tint': c.tint,
    '--ws-btn': c.btn ?? c.on,
    '--ws-btn-on': c.btnOn ?? c.fill,
    '--ws-hover': c.hover ?? '#000000',
    '--ws-hover-on': c.hoverOn ?? '#FAF2E0',
  } as CSSProperties
}
