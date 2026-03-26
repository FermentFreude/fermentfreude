'use client'

import Link from 'next/link'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

/* ── Locale context ── */

type HubLocale = 'de' | 'en'

const HubLocaleCtx = createContext<{ locale: HubLocale; setLocale: (l: HubLocale) => void }>({
  locale: 'en',
  setLocale: () => {},
})

export function useHubLocale() {
  return useContext(HubLocaleCtx)
}

/** Shorthand: returns DE or EN string based on current hub locale */
export function useT() {
  const { locale } = useHubLocale()
  return (de: string, en: string) => (locale === 'de' ? de : en)
}

/* ── Layout-level provider (wraps ALL hub pages) ── */

export function HubLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<HubLocale>('en')

  return (
    <HubLocaleCtx.Provider value={{ locale, setLocale }}>
      <div className="hub-shell">
        {children}
      </div>
    </HubLocaleCtx.Provider>
  )
}

/* ── Types ── */

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

/* ── Shell ── */

export function HubShell({ title, subtitle, accentColor, sections, children }: HubShellProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { locale, setLocale } = useHubLocale()

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
      <div className="flex min-h-screen flex-col" style={{ background: '#FAF8F5' }}>
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

            {/* Spacer + lang toggle */}
            <div className="ml-auto flex items-center gap-3">
              <LocaleToggle locale={locale} setLocale={setLocale} />

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 md:hidden"
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
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 pt-14">
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
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
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

        {/* Hub footer */}
        <HubFooter />
      </div>
  )
}

/* ── Locale toggle ── */

function LocaleToggle({ locale, setLocale }: { locale: HubLocale; setLocale: (l: HubLocale) => void }) {
  return (
    <div
      className="flex items-center overflow-hidden rounded-full border text-xs font-medium"
      style={{ borderColor: '#E8E4D9' }}
    >
      <button
        onClick={() => setLocale('de')}
        className="px-3 py-1.5 transition-all"
        style={{
          background: locale === 'de' ? '#555954' : 'transparent',
          color: locale === 'de' ? '#fff' : '#626160',
        }}
      >
        DE
      </button>
      <button
        onClick={() => setLocale('en')}
        className="px-3 py-1.5 transition-all"
        style={{
          background: locale === 'en' ? '#555954' : 'transparent',
          color: locale === 'en' ? '#fff' : '#626160',
        }}
      >
        EN
      </button>
    </div>
  )
}

/* ── Hub footer ── */

function HubFooter() {
  return (
    <footer
      className="border-t py-8 text-center text-sm leading-relaxed"
      style={{ borderColor: '#E8E4D9', color: '#999' }}
    >
      <p>Made with</p>
      <p className="mt-1">
        <svg viewBox="0 0 24 24" fill="#999" className="mx-auto h-4 w-4">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      </p>
      <p className="mt-1">Raphaella Vaz & Ala&apos;a Shaheen</p>
    </footer>
  )
}

/* ── Hub landing page wrapper (with locale + footer but no sidebar) ── */

export function HubLandingShell({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useHubLocale()

  return (
      <div className="flex min-h-screen flex-col" style={{ background: '#FAF8F5' }}>
        {/* Lang toggle — top right */}
        <div className="fixed top-4 right-6 z-50">
          <LocaleToggle locale={locale} setLocale={setLocale} />
        </div>
        <div className="flex-1">{children}</div>
        <HubFooter />
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
    default: { bg: '#F5F3EF', border: '#E8E4D9', icon: '\u2139\uFE0F' },
    warning: { bg: '#FEF3CD', border: '#F0D56C', icon: '\u26A0\uFE0F' },
    tip: { bg: '#E8F5E9', border: '#A5D6A7', icon: '\uD83D\uDCA1' },
    important: { bg: '#FCE4EC', border: '#EF9A9A', icon: '\u2757' },
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
  const t = useT()
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8E4D9' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#F5F3EF' }}>
            <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Feld', 'Field')}</th>
            <th className="px-4 py-2.5 text-left font-semibold" style={{ color: '#1a1a1a' }}>{t('Beschreibung', 'Description')}</th>
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
