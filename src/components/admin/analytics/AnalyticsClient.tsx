'use client'

import React, { useEffect, useState } from 'react'

type ReferrerRow = { key: string; total: { value: number; pct: number } }
type PageRow = { key: string; total: { value: number; pct: number } }
type CountryRow = { key: string; total: { value: number; pct: number } }
type DeviceRow = { key: string; total: { value: number; pct: number } }

type Data = {
  configured: boolean
  stats?: { data?: { sum?: { visits?: number; pageViews?: number; avgDuration?: number } } }
  referrers?: { data?: ReferrerRow[] }
  pages?: { data?: PageRow[] }
  countries?: { data?: CountryRow[] }
  devices?: { data?: DeviceRow[] }
}

const GA4_URL = 'https://analytics.google.com'

const COUNTRY_FLAGS: Record<string, string> = {
  Germany: '🇩🇪', Austria: '🇦🇹', Switzerland: '🇨🇭',
  'United States': '🇺🇸', Netherlands: '🇳🇱', France: '🇫🇷',
  Italy: '🇮🇹', Spain: '🇪🇸', 'United Kingdom': '🇬🇧',
  Belgium: '🇧🇪', Poland: '🇵🇱', Czechia: '🇨🇿',
}

function fmt(n?: number) {
  if (n == null) return '—'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function fmtDuration(s?: number) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function cleanReferrer(key: string) {
  if (!key || key === '(direct)' || key === 'direct') return 'Direct'
  return key.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] ?? key
}

function Bar({ pct, color = '#10B981' }: { pct: number; color?: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: 'var(--theme-elevation-100)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(pct * 100, 2)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .5s ease' }} />
    </div>
  )
}

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--theme-elevation-50)', borderRadius: 8, padding: '18px 20px', border: '1px solid var(--theme-border-color)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--theme-text-dim)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--theme-text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--theme-text-dim)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-border-color)', borderRadius: 8, padding: '20px 22px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--theme-text-dim)', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  )
}

function SetupInstructions() {
  return (
    <div style={{ maxWidth: 600, margin: '48px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--theme-text)' }}>Connect Vercel Analytics</div>
      <div style={{ fontSize: 14, color: 'var(--theme-text-dim)', lineHeight: 1.7, marginBottom: 28 }}>
        To show real visitor data, complete these two steps:
      </div>
      <ol style={{ textAlign: 'left', background: 'var(--theme-elevation-50)', border: '1px solid var(--theme-border-color)', borderRadius: 8, padding: '20px 28px', lineHeight: 2, fontSize: 13, color: 'var(--theme-text)' }}>
        <li><strong>Enable Analytics</strong> — Vercel dashboard → your project → Analytics tab → Enable</li>
        <li><strong>Create an API token</strong> — <a href="https://vercel.com/account/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--theme-success)' }}>vercel.com/account/tokens</a> → New token (Full Account scope)</li>
        <li><strong>Find your Project ID</strong> — Vercel project → Settings → General → Project ID</li>
        <li>Add to <code style={{ background: 'var(--theme-elevation-100)', padding: '1px 5px', borderRadius: 3 }}>.env</code>:
          <pre style={{ background: 'var(--theme-elevation-100)', borderRadius: 6, padding: '10px 14px', marginTop: 6, fontSize: 12, overflowX: 'auto' }}>
{`VERCEL_ACCESS_TOKEN=your_token_here
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=your_team_id   # optional`}
          </pre>
        </li>
        <li>Restart the dev server — data loads automatically</li>
      </ol>
    </div>
  )
}

export function AnalyticsClient() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const s = {
    outer: { padding: '32px 40px', maxWidth: 1100, margin: '0 auto' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 } as React.CSSProperties,
    title: { fontSize: 22, fontWeight: 700, color: 'var(--theme-text)', margin: 0 } as React.CSSProperties,
    sub: { fontSize: 13, color: 'var(--theme-text-dim)', marginTop: 2 } as React.CSSProperties,
    ga4btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid var(--theme-border-color)', background: 'var(--theme-elevation-50)', color: 'var(--theme-text)', fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' } as React.CSSProperties,
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 } as React.CSSProperties,
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 } as React.CSSProperties,
    grid3: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } as React.CSSProperties,
    rowLabel: { width: 160, fontSize: 13, color: 'var(--theme-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
    rowPct: { width: 40, fontSize: 12, color: 'var(--theme-text-dim)', textAlign: 'right' as const, flexShrink: 0 },
    rowVal: { width: 52, fontSize: 12, color: 'var(--theme-text-dim)', textAlign: 'right' as const, flexShrink: 0, fontVariantNumeric: 'tabular-nums' },
  }

  if (loading) {
    return (
      <div style={{ ...s.outer, paddingTop: 64, textAlign: 'center', color: 'var(--theme-text-dim)' }}>
        Loading analytics…
      </div>
    )
  }

  if (!data || !data.configured) {
    return <div style={s.outer}><SetupInstructions /></div>
  }

  const visitors = data.stats?.data?.sum?.visits ?? 0
  const pageViews = data.stats?.data?.sum?.pageViews ?? 0
  const avgDur = data.stats?.data?.sum?.avgDuration
  const ppv = visitors > 0 ? (pageViews / visitors).toFixed(1) : '—'

  const referrers: ReferrerRow[] = data.referrers?.data ?? []
  const pages: PageRow[] = data.pages?.data ?? []
  const countries: CountryRow[] = data.countries?.data ?? []
  const devices: DeviceRow[] = data.devices?.data ?? []

  const REFERRER_COLORS: Record<string, string> = {
    'instagram.com': '#E1306C',
    'google.com': '#4285F4',
    'facebook.com': '#1877F2',
    'Direct': '#10B981',
  }
  function refColor(key: string) {
    const clean = cleanReferrer(key)
    return REFERRER_COLORS[key] ?? REFERRER_COLORS[clean] ?? '#94A3B8'
  }

  return (
    <div style={s.outer}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Website Analytics</h1>
          <p style={s.sub}>Last 30 days · Production · Powered by Vercel</p>
        </div>
        <a href={GA4_URL} target="_blank" rel="noreferrer" style={s.ga4btn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Open GA4
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>

      {/* KPI tiles */}
      <div style={s.grid4}>
        <KpiTile label="Unique Visitors" value={fmt(visitors)} sub="last 30 days" />
        <KpiTile label="Page Views" value={fmt(pageViews)} sub="last 30 days" />
        <KpiTile label="Pages / Visit" value={String(ppv)} />
        <KpiTile label="Avg. Session" value={fmtDuration(avgDur)} />
      </div>

      {/* Referrers + Top Pages */}
      <div style={s.grid2}>
        <Section title="Traffic Sources">
          {referrers.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--theme-text-dim)' }}>No referrer data yet.</div>
          ) : (
            referrers.slice(0, 8).map((r) => {
              const label = cleanReferrer(r.key)
              const pct = r.total?.pct ?? 0
              const val = r.total?.value ?? 0
              const color = refColor(r.key)
              return (
                <div key={r.key} style={s.row}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={s.rowLabel}>{label}</span>
                  <Bar pct={pct} color={color} />
                  <span style={s.rowPct}>{Math.round(pct * 100)}%</span>
                  <span style={s.rowVal}>{fmt(val)}</span>
                </div>
              )
            })
          )}
        </Section>

        <Section title="Top Pages">
          {pages.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--theme-text-dim)' }}>No page data yet.</div>
          ) : (
            pages.slice(0, 8).map((p) => {
              const pct = p.total?.pct ?? 0
              const val = p.total?.value ?? 0
              return (
                <div key={p.key} style={s.row}>
                  <span style={{ ...s.rowLabel, width: 200, fontFamily: 'monospace', fontSize: 11 }}>{p.key || '/'}</span>
                  <Bar pct={pct} color="#10B981" />
                  <span style={s.rowPct}>{Math.round(pct * 100)}%</span>
                  <span style={s.rowVal}>{fmt(val)}</span>
                </div>
              )
            })
          )}
        </Section>
      </div>

      {/* Countries + Devices */}
      <div style={s.grid3}>
        <Section title="Countries">
          {countries.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--theme-text-dim)' }}>No data yet.</div>
          ) : (
            countries.slice(0, 6).map((c) => {
              const pct = c.total?.pct ?? 0
              const val = c.total?.value ?? 0
              const flag = COUNTRY_FLAGS[c.key] ?? '🌍'
              return (
                <div key={c.key} style={s.row}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{flag}</span>
                  <span style={{ ...s.rowLabel, width: 140 }}>{c.key}</span>
                  <Bar pct={pct} color="#6366F1" />
                  <span style={s.rowPct}>{Math.round(pct * 100)}%</span>
                  <span style={s.rowVal}>{fmt(val)}</span>
                </div>
              )
            })
          )}
        </Section>

        <Section title="Devices">
          {devices.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--theme-text-dim)' }}>No data yet.</div>
          ) : (
            devices.slice(0, 5).map((d) => {
              const pct = d.total?.pct ?? 0
              const val = d.total?.value ?? 0
              return (
                <div key={d.key} style={s.row}>
                  <span style={{ ...s.rowLabel, width: 80 }}>{d.key}</span>
                  <Bar pct={pct} color="#F59E0B" />
                  <span style={s.rowPct}>{Math.round(pct * 100)}%</span>
                  <span style={s.rowVal}>{fmt(val)}</span>
                </div>
              )
            })
          )}

          {/* GA4 conversions note */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--theme-border-color)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--theme-text-dim)', marginBottom: 10 }}>Conversions (GA4)</div>
            <a href={GA4_URL} target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--theme-border-color)', background: 'var(--theme-elevation-100)', fontSize: 12, color: 'var(--theme-text)', textDecoration: 'none', textAlign: 'center' }}>
              View bookings, orders &amp; newsletter signups in GA4 →
            </a>
          </div>
        </Section>
      </div>
    </div>
  )
}
