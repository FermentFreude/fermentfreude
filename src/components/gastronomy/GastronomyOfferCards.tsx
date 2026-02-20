'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import React, { useEffect, useRef, useState } from 'react'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

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
        <h2 className="mb-10 font-display text-3xl font-bold text-ff-black md:text-4xl">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={card.id ?? i}
              className="offer-card overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              style={inView ? { animationDelay: `${0.1 * (i + 1)}s` } : undefined}
            >
              <div className="relative aspect-square">
                {isResolvedMedia(card.image) ? (
                  <Media resource={card.image} fill imgClassName="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-neutral-100" />
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-2 font-display text-lg font-bold text-ff-black">{card.title}</h3>
                <p className="text-sm leading-relaxed text-ff-gray-text">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
