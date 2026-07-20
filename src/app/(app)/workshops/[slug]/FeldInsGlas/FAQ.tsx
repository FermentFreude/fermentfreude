'use client'

/**
 * FeldInsGlas FAQ — cream editorial accordion (not Lakto FAQ chrome).
 */

import { useEffect, useRef, useState } from 'react'
import type { LaktoFAQCMS } from '../LaktoFAQ'

type Item = { question: string; answer: string }

export function FeldInsGlasFAQ({ cms }: { cms?: LaktoFAQCMS }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState<number | null>(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const eyebrow = cms?.eyebrow ?? 'Häufige Fragen'
  const title = cms?.title ?? 'Gut zu wissen'
  const description = cms?.description ?? ''
  const items: Item[] =
    (cms?.items?.length ?? 0) > 0
      ? cms!.items!.map((i) => ({
          question: i.question ?? '',
          answer: i.answer ?? '',
        }))
      : []

  if (items.length === 0) return null

  return (
    <section ref={sectionRef} className="bg-[#FFFEF9]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-24">
        <div
          className={`transition-all duration-700 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#E6BE68]">
            {eyebrow}
          </p>
          <h2
            className="mt-4 font-display font-black tracking-[-0.035em] text-[#1A1A1A]"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-sm text-body leading-relaxed text-[#4B4B4B]">{description}</p>
          ) : null}
        </div>

        <div
          className={`divide-y divide-[#1A1A1A]/12 border-y border-[#1A1A1A]/12 transition-all duration-700 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: visible ? '120ms' : '0ms' }}
        >
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-body font-bold leading-snug text-[#1A1A1A]">
                    {item.question}
                  </span>
                  <span
                    className="mt-0.5 shrink-0 font-display text-[18px] font-bold text-[#E6BE68]"
                    aria-hidden
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-body-sm leading-relaxed text-[#4B4B4B]">{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
