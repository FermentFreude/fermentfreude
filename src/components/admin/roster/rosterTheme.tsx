'use client'

import React from 'react'

import { ORIGIN_INFO, type BookingOrigin } from './bookingOrigin'

/**
 * Shared visual language for the roster admin dashboard — brand colors
 * (docs/BRAND.md), workshop-type identity, stat cards, and status badges.
 * Payload's admin chrome (surfaces, borders, text) stays on its own
 * `--theme-*` CSS vars so it still adapts to light/dark automatically;
 * only accent colors are fixed brand hex values, per BRAND.md's own rule
 * that brand color is fixed regardless of theme.
 */

export const BRAND = {
  gold: '#E6BE68',
  goldLight: '#EDD195',
  goldDark: '#D4A654',
  goldTint: '#FBF3E1', // pale gold background for chips/highlights
  oliveDark: '#3A3E3A',
  nearBlack: '#1A1A1A',
}

export const STATUS = {
  // On brand: warm gray (done / fine), gold (needs a look), charcoal (problem). No green, red or orange.
  success: { accent: '#4B4F4A', bg: '#ECE5DE', color: '#3A3E3A' },
  warning: { accent: '#D4A654', bg: '#F6E7BC', color: '#6B470A' },
  danger: { accent: '#3A3E3A', bg: '#3A3E3A', color: '#F9F0DC' },
  info: { accent: '#8A8D84', bg: '#F0EDE5', color: '#55584F' },
  purple: { accent: '#A8957A', bg: '#F3ECE0', color: '#6B5A3F' },
  neutral: { accent: '#9ca3af', bg: 'var(--theme-elevation-100)', color: 'var(--theme-text)' },
}

/** Distinct accent per workshop type — used for icon chips throughout. */
export const WORKSHOP_COLORS: Record<string, { accent: string; bg: string; icon: string }> = {
  kombucha: { accent: '#4B4F4A', bg: '#ECE5DE', icon: '🫧' },
  tempeh: { accent: '#8C7A5E', bg: '#F3ECE0', icon: '🫘' },
  lakto: { accent: '#C9A04E', bg: '#FBF3E1', icon: '🥬' },
  'vom feld': { accent: '#A9A296', bg: '#F0EDE5', icon: '🌾' },
}

export function workshopColor(title: string) {
  const key = (title || '').toLowerCase()
  const match = Object.keys(WORKSHOP_COLORS).find((k) => key.includes(k))
  return match ? WORKSHOP_COLORS[match] : { accent: BRAND.gold, bg: BRAND.goldTint, icon: '🍽️' }
}

/** Rotating palette for generic stat cards (not tied to a workshop type). */
export const STAT_ACCENTS = {
  indigo: { accent: '#4B4F4A', bg: '#ECE5DE' },
  green: { accent: '#6B6B6B', bg: '#F0EDE5' },
  orange: { accent: '#B8892F', bg: '#F6E7BC' },
  purple: { accent: '#8C7A5E', bg: '#F3ECE0' },
  gold: { accent: BRAND.goldDark, bg: BRAND.goldTint },
  blue: { accent: '#55584F', bg: '#F0EDE5' },
}

export function StatCard({
  label,
  value,
  icon,
  accentKey = 'gold',
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accentKey?: keyof typeof STAT_ACCENTS
}) {
  const { accent, bg } = STAT_ACCENTS[accentKey]
  return (
    <div
      style={{
        background: 'var(--theme-elevation-0)',
        borderRadius: '14px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        border: '1px solid var(--theme-elevation-100)',
        borderTop: `3px solid ${accent}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--theme-text)', opacity: 0.6, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: 'var(--theme-text)' }}>{value}</p>
      </div>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '11px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0,
          filter: 'grayscale(1)', // emoji carry their own colours; keep them on brand
        }}
      >
        {icon}
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: subtitle ? '32px' : '24px', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-text)', margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--theme-text)', opacity: 0.55 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/** Small rounded label used for statuses, origins and payment kinds. */
export function Pill({
  label,
  tone = 'neutral',
  title,
}: {
  label: string
  tone?: keyof typeof STATUS
  title?: string
}) {
  const t = STATUS[tone]
  return (
    <span
      title={title}
      style={{
        display: 'inline-block',
        padding: '2px 9px',
        borderRadius: '999px',
        background: t.bg,
        color: t.color,
        fontSize: '11px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

const ORIGIN_TONE: Record<BookingOrigin, keyof typeof STATUS> = {
  website: 'neutral',
  manual: 'purple',
  wix: 'info',
  unmarked: 'warning',
}

/** Shows where a booking came from: website, added by hand, Wix import, or unmarked. */
export function OriginBadge({ origin }: { origin: BookingOrigin }) {
  const info = ORIGIN_INFO[origin]
  return <Pill label={info.label} tone={ORIGIN_TONE[origin]} title={info.hint} />
}
