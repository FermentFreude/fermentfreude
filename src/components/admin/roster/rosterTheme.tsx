'use client'

import React from 'react'

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
  success: { accent: '#16a34a', bg: '#dcfce7', color: '#166534' },
  warning: { accent: '#d97706', bg: '#fef3c7', color: '#92400e' },
  danger: { accent: '#dc2626', bg: '#fee2e2', color: '#991b1b' },
  info: { accent: '#3b82f6', bg: '#dbeafe', color: '#1e40af' },
  purple: { accent: '#8b5cf6', bg: '#ede9fe', color: '#5b21b6' },
  neutral: { accent: '#9ca3af', bg: 'var(--theme-elevation-100)', color: 'var(--theme-text)' },
}

/** Distinct accent per workshop type — used for icon chips throughout. */
export const WORKSHOP_COLORS: Record<string, { accent: string; bg: string; icon: string }> = {
  kombucha: { accent: '#0d9488', bg: '#ccfbf1', icon: '🫧' },
  tempeh: { accent: '#b45309', bg: '#fef3c7', icon: '🫘' },
  lakto: { accent: '#15803d', bg: '#dcfce7', icon: '🥬' },
  'vom feld': { accent: '#c2410c', bg: '#ffedd5', icon: '🌾' },
}

export function workshopColor(title: string) {
  const key = (title || '').toLowerCase()
  const match = Object.keys(WORKSHOP_COLORS).find((k) => key.includes(k))
  return match ? WORKSHOP_COLORS[match] : { accent: BRAND.gold, bg: BRAND.goldTint, icon: '🍽️' }
}

/** Continuous booked/capacity → color, for progress bars + capacity badges. */
export function fillLevel(booked: number, capacity: number) {
  if (capacity <= 0) return { pct: 0, ...STATUS.neutral }
  const pct = Math.min(100, Math.round((booked / capacity) * 100))
  if (booked > capacity) return { pct: 100, accent: STATUS.warning.accent, bg: STATUS.warning.bg, color: STATUS.warning.color } // overbooked
  if (booked === capacity) return { pct: 100, accent: STATUS.danger.accent, bg: STATUS.danger.bg, color: STATUS.danger.color } // full
  if (pct >= 70) return { pct, accent: '#ea580c', bg: '#ffedd5', color: '#9a3412' } // filling up
  if (pct > 0) return { pct, accent: STATUS.success.accent, bg: STATUS.success.bg, color: STATUS.success.color } // open, has bookings
  return { pct, ...STATUS.neutral } // empty
}

/** Rotating palette for generic stat cards (not tied to a workshop type). */
export const STAT_ACCENTS = {
  indigo: { accent: '#4f46e5', bg: '#e0e7ff' },
  green: { accent: '#16a34a', bg: '#dcfce7' },
  orange: { accent: '#ea580c', bg: '#ffedd5' },
  purple: { accent: '#c026d3', bg: '#fae8ff' },
  gold: { accent: BRAND.goldDark, bg: BRAND.goldTint },
  blue: { accent: '#2563eb', bg: '#dbeafe' },
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
        }}
      >
        {icon}
      </div>
    </div>
  )
}

/** Branded primary action button (gold), replacing the generic near-black CTA. */
export const primaryButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  background: BRAND.gold,
  color: BRAND.nearBlack,
  fontSize: '14px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
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
