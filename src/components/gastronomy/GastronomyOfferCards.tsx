'use client'

import { Heart, Leaf, Shield, Sparkles, UtensilsCrossed } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

type Card = {
  id?: string | null
  title?: string | null
  description?: string | null
  image?: unknown
}

type Props = {
  title: string
  cards: Card[]
}

const BENEFIT_ICONS = [Heart, Sparkles, Shield, Leaf, UtensilsCrossed] as const

export function GastronomyOfferCards({ title, cards }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="offer"
      className={`bg-white px-6 py-16 md:px-12 lg:px-20 ${inView ? 'offer-cards-in-view' : ''}`}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-10 text-center font-display text-3xl font-bold text-ff-black md:text-4xl">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length] ?? Heart
            return (
              <div
                key={card.id ?? i}
                className="offer-card group relative overflow-hidden rounded-3xl border border-[#E6BE68]/30 bg-gradient-to-br from-white via-[#FFFCF6] to-[#F7F7F7] p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)] md:p-8"
                style={inView ? { animationDelay: `${0.1 * (i + 1)}s` } : undefined}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-80"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(230,190,104,0.95) 0%, rgba(250,242,224,0.9) 50%, rgba(230,190,104,0.95) 100%)',
                  }}
                />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6BE68]/18 text-[#E6BE68] ring-1 ring-[#E6BE68]/25 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ff-black">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ff-gray-text md:text-base">
                  {card.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
