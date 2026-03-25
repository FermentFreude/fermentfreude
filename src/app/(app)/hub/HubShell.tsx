'use client'

import Link from 'next/link'
import { type ReactNode, useEffect, useState } from 'react'

export interface TocSection {
  id: string
  title: string
  icon?: ReactNode
}

interface HubShellProps {
  title: string
  subtitle: string
  accentColor: string
  sections: TocSection[]
  children: ReactNode
}

export function HubShell({ title, subtitle, accentColor, sections, children }: HubShellProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5' }}>
      {/* Top bar */}
      <div
        className="fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-md"
        style={{ background: 'rgba(250,248,245,0.92)', borderColor: '#E8E4D9' }}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
          <Link
            href="/hub"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#626160' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
            Hub
          </Link>
          <span style={{ color: '#ccc' }}>/</span>
          <span className="font-display text-sm font-semibold" style={{ color: '#1a1a1a' }}>
            {title}
          </span>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-auto rounded-lg p-2 md:hidden"
            style={{ color: '#626160' }}
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl pt-14">
        {/* Sidebar — desktop */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r p-6 md:block" style={{ borderColor: '#E8E4D9' }}>
          <div className="mb-6">
            <h2 className="font-display text-base font-bold" style={{ color: '#1a1a1a' }}>{title}</h2>
            <p className="mt-0.5 text-xs" style={{ color: '#999' }}>{subtitle}</p>
          </div>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => {
              const isActive = activeId === s.id
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all"
                  style={{
                    background: isActive ? `${accentColor}10` : 'transparent',
                    color: isActive ? accentColor : '#626160',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {s.icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{s.icon}</span>}
                  {s.title}
                </a>
              )
            })}
          </nav>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 top-14 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            />
            <nav
              className="relative w-72 overflow-y-auto border-r p-6"
              style={{ background: '#FAF8F5', borderColor: '#E8E4D9', height: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h2 className="font-display text-base font-bold" style={{ color: '#1a1a1a' }}>{title}</h2>
                <p className="mt-0.5 text-xs" style={{ color: '#999' }}>{subtitle}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                {sections.map((s) => {
                  const isActive = activeId === s.id
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all"
                      style={{
                        background: isActive ? `${accentColor}10` : 'transparent',
                        color: isActive ? accentColor : '#626160',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {s.icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{s.icon}</span>}
                      {s.title}
                    </a>
                  )
                })}
              </div>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-6 py-10 md:px-12 md:py-14">
          {children}
        </main>
      </div>
    </div>
  )
}

/* ── Reusable content components ── */

export function HubSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="font-display mb-6 border-b pb-3 text-2xl font-bold" style={{ color: '#1a1a1a', borderColor: '#E8E4D9' }}>
        {title}
      </h2>
      <div className="space-y-6" style={{ color: '#444' }}>
        {children}
      </div>
    </section>
  )
}

export function InfoCard({
  title,
  children,
  variant = 'default',
}: {
  title?: string
  children: ReactNode
  variant?: 'default' | 'warning' | 'tip' | 'important'
}) {
  const styles = {
    default: { bg: '#F5F3EF', border: '#E8E4D9', icon: 'ℹ️' },
    warning: { bg: '#FEF3CD', border: '#F0D56C', icon: '⚠️' },
    tip: { bg: '#E8F5E9', border: '#A5D6A7', icon: '💡' },
    important: { bg: '#FCE4EC', border: '#EF9A9A', icon: '❗' },
  }
  const s = styles[variant]
  return (
    <div className="rounded-xl border p-5" style={{ background: s.bg, borderColor: s.border }}>
      {title && (
        <p className="font-display mb-2 text-sm font-semibold" style={{ color: '#1a1a1a' }}>
          {s.icon} {title}
        </p>
      )}
      <div className="text-sm leading-relaxed" style={{ color: '#444' }}>
        {children}
      </div>
    </div>
  )
}

export function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <span
            className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: '#555954' }}
          >
            {i + 1}
          </span>
          <div>
            <p className="font-display text-sm font-semibold" style={{ color: '#1a1a1a' }}>
              {step.title}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed" style={{ color: '#626160' }}>
              {step.desc}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function FieldTable({
  fields,
}: {
  fields: { name: string; description: string; required?: boolean }[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#F5F3EF' }}>
            <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Feld / Field</th>
            <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>Beschreibung / Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, i) => (
            <tr key={i} className="border-t" style={{ borderColor: '#E8E4D9' }}>
              <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#555954' }}>
                {f.name}
                {f.required && <span className="ml-1 text-red-500">*</span>}
              </td>
              <td className="px-4 py-2.5" style={{ color: '#626160' }}>{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
