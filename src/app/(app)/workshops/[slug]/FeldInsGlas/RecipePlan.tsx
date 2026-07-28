'use client'

/**
 * FeldInsGlas — Recipe plan (replaces Fermentkalender for this special workshop).
 * Shows what participants will ferment — usually 2 recipes, CMS-editable.
 */

import { useEffect, useRef, useState } from 'react'

export type FeldInsGlasRecipePlanCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  recipes?: Array<{ name?: string | null }> | null
}

const DEFAULTS = {
  de: {
    eyebrow: 'Im Workshop',
    title: 'Das fermentieren wir.',
    description:
      'Statt eines Monatskalenders siehst du hier die Rezepte, die du an diesem Tag zubereitest und mitnimmst.',
    listLabel: 'Rezepte für diesen Tag',
    recipes: ['Zucchini-Pickles', 'Gurken-Relish'],
    takeHomeSingular: 'Rezept · zum Mitnehmen',
    takeHomePlural: 'Rezepte · zum Mitnehmen',
  },
  en: {
    eyebrow: 'In the workshop',
    title: 'What we will ferment.',
    description:
      'Instead of a monthly calendar, you see the recipes you will make and take home that day.',
    listLabel: 'Recipes for this day',
    recipes: ['Zucchini pickles', 'Cucumber relish'],
    takeHomeSingular: 'recipe · take home',
    takeHomePlural: 'recipes · take home',
  },
} as const

export function FeldInsGlasRecipePlan({
  cms,
  locale = 'de',
}: {
  cms?: FeldInsGlasRecipePlanCMS
  locale?: 'de' | 'en'
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(true)
  const defaults = DEFAULTS[locale]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.9) return

    setVisible(false)
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    obs.observe(el)
    const t = window.setTimeout(() => setVisible(true), 1200)
    return () => {
      obs.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  const eyebrow = cms?.eyebrow?.trim() || defaults.eyebrow
  const title = cms?.title?.trim() || defaults.title
  const description = cms?.description?.trim() || defaults.description
  const recipes =
    (cms?.recipes?.map((r) => r.name?.trim()).filter(Boolean) as string[] | undefined)?.length
      ? (cms!.recipes!.map((r) => r.name!.trim()).filter(Boolean) as string[])
      : [...defaults.recipes]

  return (
    <section ref={sectionRef} className="bg-[#FFFEF9]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
        <div
          className={`grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16 transition-all duration-700 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#E6BE68]">
              {eyebrow}
            </p>
            <h2
              className="mt-4 font-display font-bold tracking-[-0.03em] text-[#1A1A1A]"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.1 }}
            >
              {title}
            </h2>
            <p className="mt-5 max-w-md text-body leading-relaxed text-[#4B4B4B]">{description}</p>
          </div>

          <div className="border-t border-[#1A1A1A]/12 lg:border-t-0 lg:border-l lg:pl-12">
            <p className="pt-6 font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#1A1A1A]/45 lg:pt-0">
              {defaults.listLabel}
            </p>
            <ol className="mt-6 space-y-0">
              {recipes.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="flex items-baseline gap-5 border-b border-[#1A1A1A]/10 py-5 first:pt-0"
                >
                  <span className="font-display text-[11px] font-bold tabular-nums tracking-[0.18em] text-[#E6BE68]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-[1.15rem] font-medium leading-snug tracking-tight text-[#1A1A1A] sm:text-[1.25rem]">
                    {name}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-body-sm text-[#1A1A1A]/40">
              {recipes.length}{' '}
              {recipes.length === 1 ? defaults.takeHomeSingular : defaults.takeHomePlural}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
