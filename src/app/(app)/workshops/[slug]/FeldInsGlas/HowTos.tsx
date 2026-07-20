'use client'

/**
 * FeldInsGlas Tipps & Guides — Figma hairline grid (no image cards).
 */

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

type Article = {
  id?: string
  slug?: string | null
  title?: string | null
  summary?: string | null
  readTime?: string | null
  heroImage?: MediaType | string | null
  categories?: Array<string | { title?: string | null }> | null
}

const CATEGORY_BY_SLUG: Record<string, string> = {
  'frisches-gemuese-am-feld-erkennen': 'Technik',
  'milchsaure-zucchini-pickels': 'Rezept',
  'fermentiertes-gurken-relish': 'Rezept',
  'karfiol-kimchi-anleitung': 'Rezept',
  'marktgarten-workshop-vorbereitung': 'Equipment',
  'vom-feld-ins-glas-ablauf': 'Lagerung',
}

const FALLBACK_CATEGORIES = ['Technik', 'Equipment', 'Rezept', 'Lagerung'] as const

function resolveCategory(article: Article, index: number): string {
  const fromSlug = article.slug ? CATEGORY_BY_SLUG[article.slug] : undefined
  if (fromSlug) return fromSlug

  const cats = article.categories
  if (Array.isArray(cats) && cats.length > 0) {
    const first = cats[0]
    if (typeof first === 'string' && first.trim()) return first
    if (typeof first === 'object' && first?.title) return first.title
  }

  return FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length]!
}

function resolveReadTime(article: Article, locale: 'de' | 'en'): string {
  if (article.readTime?.trim()) {
    const t = article.readTime.trim()
    if (/lesezeit|read/i.test(t)) return t
    return locale === 'de' ? `${t} Lesezeit` : `${t} read`
  }
  return locale === 'de' ? '6 Min. Lesezeit' : '6 min read'
}

export function FeldInsGlasHowTos({
  articles,
  locale = 'de',
  eyebrow,
  title,
}: {
  articles: Article[]
  locale?: 'de' | 'en'
  eyebrow?: string | null
  title?: string | null
}) {
  const sectionRef = useRef<HTMLElement>(null)
  // Start visible so SSR/no-JS links stay usable; animate only after mount.
  const [visible, setVisible] = useState(true)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const rect = el.getBoundingClientRect()
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0
    if (inView) return

    setAnimate(true)
    setVisible(false)

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.08 },
    )
    obs.observe(el)

    // Never leave the section stuck invisible if the observer misses.
    const fallback = window.setTimeout(() => setVisible(true), 1200)
    return () => {
      obs.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  const items = articles.filter((a) => a.slug && a.title).slice(0, 6)
  if (items.length === 0) return null

  const resolvedEyebrow = eyebrow ?? (locale === 'de' ? 'Wissen' : 'Knowledge')
  const resolvedTitle = title ?? (locale === 'de' ? 'Tipps & Guides.' : 'Tips & Guides.')

  return (
    <section ref={sectionRef} className="bg-[#FFFEF9]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:py-24">
        <div
          className={`${animate ? 'transition-all duration-700' : ''} ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#E6BE68]">
            {resolvedEyebrow}
          </p>
          <h2
            className="mt-3 font-display font-medium tracking-[-0.03em] text-[#1A1A1A]"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', lineHeight: 1.1 }}
          >
            {resolvedTitle}
          </h2>
        </div>

        <div
          className={`mt-12 border-t border-[#1A1A1A]/10 ${
            animate ? 'transition-all duration-700' : ''
          } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          style={{ transitionDelay: animate && visible ? '100ms' : '0ms' }}
        >
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article, i) => {
              const category = resolveCategory(article, i)
              const readTime = resolveReadTime(article, locale)
              const href = `/tipps/${article.slug}`

              return (
                <li
                  key={article.id ?? article.slug}
                  className={[
                    'border-b border-[#1A1A1A]/10',
                    'sm:odd:border-r sm:odd:border-[#1A1A1A]/10',
                    'lg:border-r-0',
                    'lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n))]:border-[#1A1A1A]/10',
                  ].join(' ')}
                >
                  <Link
                    href={href}
                    prefetch
                    className="group flex h-full min-h-[11rem] flex-col justify-between px-5 py-7 transition-colors hover:bg-[#1A1A1A]/[0.02] sm:px-6 sm:py-8"
                  >
                    <div>
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-[#E6BE68]">
                        {category}
                      </p>
                      <h3 className="mt-3 font-display text-[1.05rem] font-medium leading-snug tracking-tight text-[#1A1A1A] transition-colors group-hover:text-[#E6BE68] sm:text-[1.15rem]">
                        {article.title}
                      </h3>
                    </div>
                    <div className="mt-8 flex items-center justify-between gap-4">
                      <span className="text-body-sm text-[#1A1A1A]/40">{readTime}</span>
                      <span
                        className="text-[#1A1A1A]/35 transition-transform group-hover:translate-x-0.5 group-hover:text-[#E6BE68]"
                        aria-hidden
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
