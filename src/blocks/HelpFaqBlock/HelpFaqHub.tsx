'use client'

import { FaqAccordion, type FaqItem } from '@/app/(app)/fermentation/FaqAccordion'
import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  CreditCard,
  Gift,
  HelpCircle,
  Lock,
  Search,
  ShoppingBag,
  Star,
  Truck,
  User,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type HelpFaqSection = {
  id?: string | null
  key: string
  title: string
  intro?: string | null
  icon?: string | null
  items?: Array<{
    id?: string | null
    question: string
    answer: string
  }> | null
}

export type HelpFaqHubProps = {
  header: {
    eyebrow: string
    title: string
    intro: string
    searchPlaceholder: string
    commonSearchesLabel: string
    commonSearches: string[]
    backLabel: string
    resultsLabel: string
    emptyResultsLabel: string
    questionCountSingular: string
    questionCountPlural: string
  }
  sections: HelpFaqSection[]
  contact: {
    title: string
    body: string
    ctaLabel: string
    link: string
    email: string
  }
  heroBackground?: unknown
}

const ICON_MAP: Record<string, LucideIcon> = {
  user: User,
  calendar: Calendar,
  gift: Gift,
  'shopping-bag': ShoppingBag,
  truck: Truck,
  'credit-card': CreditCard,
  utensils: UtensilsCrossed,
  wrench: Wrench,
  'book-open': BookOpen,
  lock: Lock,
  star: Star,
  'help-circle': HelpCircle,
}

const KEY_ICON_FALLBACK: Record<string, string> = {
  account: 'user',
  workshops: 'calendar',
  vouchers: 'gift',
  shop: 'shopping-bag',
  shipping: 'truck',
  payment: 'credit-card',
  gastronomy: 'utensils',
  support: 'wrench',
  courses: 'book-open',
}

function sectionIcon(section: HelpFaqSection): LucideIcon {
  const name = section.icon || KEY_ICON_FALLBACK[section.key] || 'help-circle'
  return ICON_MAP[name] ?? HelpCircle
}

function isResolvedMedia(img: unknown): img is { url?: string | null; alt?: string | null } {
  return typeof img === 'object' && img !== null && 'url' in img
}

function questionsLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  const word = count === 1 ? singular : plural
  return `${count} ${word}`
}

export function HelpFaqHub({ header, sections, contact, heroBackground }: HelpFaqHubProps) {
  const [query, setQuery] = useState('')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const contactHref =
    contact.link.trim() ||
    (contact.email.trim() ? `mailto:${contact.email.trim()}` : '/contact')

  const openSection = useCallback((key: string) => {
    setQuery('')
    setActiveKey(key)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${key}`)
    }
  }, [])

  const goHub = useCallback(() => {
    setQuery('')
    setActiveKey(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && sections.some((s) => s.key === hash)) {
        setActiveKey(hash)
        setQuery('')
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [sections])

  const trimmed = query.trim()
  const isSearching = trimmed.length > 0

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = trimmed.toLowerCase()
    const matches: Array<FaqItem & { sectionTitle: string }> = []
    for (const section of sections) {
      for (const item of section.items ?? []) {
        const haystack = `${item.question} ${item.answer} ${section.title}`.toLowerCase()
        if (haystack.includes(q)) {
          matches.push({
            id: item.id,
            question: item.question,
            answer: item.answer,
            sectionTitle: section.title,
          })
        }
      }
    }
    return matches
  }, [isSearching, sections, trimmed])

  const activeSection = activeKey ? sections.find((s) => s.key === activeKey) : null
  const showHub = !isSearching && !activeSection
  const bg = isResolvedMedia(heroBackground) ? heroBackground : null

  return (
    <div className="bg-[#F9F0DC]">
      <section className="relative aspect-[2.4/1] w-full overflow-hidden bg-[#E8DFD0]">
        <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
          {bg ? (
            <Media
              resource={bg as never}
              fill
              priority
              imgClassName="object-cover object-center"
              size="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#E8DFD0] via-[#F9F0DC] to-[#4B4F4A]" />
          )}
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-3 sm:px-6 md:px-10">
          <FadeIn
            immediate
            className="relative w-full max-w-[18rem] rounded-3xl border border-white/70 bg-[#FFFEF9]/88 px-4 py-4 text-center shadow-sm backdrop-blur-md sm:max-w-sm sm:px-6 sm:py-5 md:max-w-md"
          >
            {header.eyebrow ? (
              <p className="text-eyebrow font-semibold tracking-[0.16em] text-[#D4A654]">
                {header.eyebrow}
              </p>
            ) : null}
            <h1
              className={cn(
                'font-display text-subheading font-bold text-[#1A1A1A] sm:text-section-heading',
                header.eyebrow ? 'mt-2' : '',
              )}
            >
              {header.title}
            </h1>
            {header.intro ? (
              <p className="mx-auto mt-3 max-w-xl text-body-sm leading-relaxed text-[#4B4B4B] sm:text-body">
                {header.intro}
              </p>
            ) : null}

            <form
              role="search"
              className="mx-auto mt-3 max-w-md sm:mt-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="help-faq-search" className="sr-only">
                {header.searchPlaceholder}
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6B6B6B]"
                  aria-hidden
                />
                <input
                  id="help-faq-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (e.target.value.trim()) setActiveKey(null)
                  }}
                  placeholder={header.searchPlaceholder}
                  autoComplete="off"
                  className="h-11 w-full rounded-full border border-[#E8E4D9] bg-white pl-11 pr-4 text-body-sm text-[#1A1A1A] shadow-sm outline-none placeholder:text-[#6B6B6B] focus:border-[#E6BE68] focus:ring-2 focus:ring-[#E6BE68]/35 sm:h-12 sm:text-body"
                />
              </div>
            </form>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {showHub ? (
            <FadeIn immediate>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {sections.map((section) => {
                  const Icon = sectionIcon(section)
                  const count = section.items?.length ?? 0
                  const hint = section.intro?.trim()
                  return (
                    <li key={section.key}>
                      <button
                        type="button"
                        onClick={() => openSection(section.key)}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-[#E8E4D9] bg-white px-5 py-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#E6BE68]/70 hover:shadow-md"
                      >
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#E6BE68]/30 text-[#1A1A1A]">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-title font-bold text-[#1A1A1A]">
                            {section.title}
                          </span>
                          <span className="mt-1 block text-caption text-[#6B6B6B]">
                            {hint ? (
                              <span className="line-clamp-1">{hint}</span>
                            ) : (
                              questionsLabel(
                                count,
                                header.questionCountSingular,
                                header.questionCountPlural,
                              )
                            )}
                            {hint && count > 0 ? (
                              <span className="text-[#6B6B6B]/80">
                                {' '}
                                ·{' '}
                                {questionsLabel(
                                  count,
                                  header.questionCountSingular,
                                  header.questionCountPlural,
                                )}
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-5 shrink-0 text-[#6B6B6B] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1A1A1A]"
                          aria-hidden
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>

              <p className="mt-8 text-center text-body-sm text-[#6B6B6B]">
                {contact.body}{' '}
                <Link
                  href={contactHref}
                  className="font-medium text-[#1A1A1A] underline decoration-[#E6BE68] underline-offset-4 transition-colors hover:text-[#4B4B4B]"
                >
                  {contact.ctaLabel}
                </Link>
              </p>
            </FadeIn>
          ) : null}

          {isSearching ? (
            <FadeIn immediate>
              <div className="rounded-2xl border border-[#E8E4D9] bg-[#FFFEF9] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-section-heading font-bold text-[#1A1A1A]">
                    {header.resultsLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={goHub}
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-[#4B4B4B] hover:text-[#1A1A1A]"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    {header.backLabel}
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <p className="mt-3 text-body leading-relaxed text-[#595959]" aria-live="polite">
                    {header.emptyResultsLabel}{' '}
                    <Link
                      href={contactHref}
                      className="font-medium text-[#1A1A1A] underline decoration-[#E6BE68] underline-offset-4"
                    >
                      {contact.ctaLabel}
                    </Link>
                  </p>
                ) : (
                  <div className="mt-4">
                    <FaqAccordion
                      items={searchResults.map(({ sectionTitle: _s, ...item }) => item)}
                      type="single"
                    />
                  </div>
                )}
              </div>
            </FadeIn>
          ) : null}

          {activeSection && !isSearching ? (
            <FadeIn immediate>
              <div className="rounded-2xl border border-[#E8E4D9] bg-[#FFFEF9] p-6 sm:p-8">
                <button
                  type="button"
                  onClick={goHub}
                  className="inline-flex items-center gap-2 text-body-sm font-medium text-[#4B4B4B] hover:text-[#1A1A1A]"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  {header.backLabel}
                </button>
                <h2 className="mt-4 font-display text-section-heading font-bold text-[#1A1A1A]">
                  {activeSection.title}
                </h2>
                {activeSection.intro ? (
                  <p className="mt-3 text-body leading-relaxed text-[#595959]">
                    {activeSection.intro}
                  </p>
                ) : null}
                <div className="mt-6">
                  <FaqAccordion
                    items={(activeSection.items ?? []).map((it) => ({
                      id: it.id,
                      question: it.question,
                      answer: it.answer,
                    }))}
                    type="single"
                  />
                </div>
              </div>
            </FadeIn>
          ) : null}
        </div>
      </section>
    </div>
  )
}
