'use client'

import { FadeIn } from '@/components/FadeIn'
import type { FeatureCardsBlock as FeatureCardsBlockType } from '@/payload-types'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

const BlobCanvas = dynamic(() => import('./BlobCanvas').then((m) => m.BlobCanvas), { ssr: false })

/** Per-card blob colour (black) */
const BLOB_COLOR = '#000000'

/** Fallback SVG icons when CMS icon is not set */
const FALLBACK_ICONS = [
  '/assets/images/feature-probiotics.svg',
  '/assets/images/feature-nutrients.svg',
  '/assets/images/feature-taste.svg',
]

const DEFAULTS = {
  eyebrow: 'IS HEALTHY',
  heading: 'Why Fermentation?',
  description:
    'Fermentation is one of the oldest and most natural methods of food preservation. It enhances flavour, nutritional value, and digestibility.',
  cards: [
    {
      title: 'Probiotics',
      description:
        'Fermented foods are rich in live cultures that strengthen your gut health and immune system.',
      icon: undefined as unknown,
    },
    {
      title: 'Nutrients',
      description:
        'The fermentation process increases the bioavailability of vitamins and minerals in your food.',
      icon: undefined as unknown,
    },
    {
      title: 'Flavour',
      description:
        'Fermentation creates complex umami flavours and unique taste profiles that no other process can achieve.',
      icon: undefined as unknown,
    },
  ],
  buttonLabel: 'Read more about it',
  buttonLink: '/about',
}

/** Resolve icon URL from CMS Media object or fall back to static SVG */
const getIconSrc = (icon: unknown, index: number): string => {
  if (icon && typeof icon === 'object' && 'url' in icon) {
    const url = (icon as { url?: string | null }).url
    if (url) return url
  }
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

type Props = FeatureCardsBlockType & { id?: string }

export const FeatureCardsBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  description,
  cards,
  buttonLabel,
  buttonLink,
  id,
}) => {
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedCards = cards && cards.length > 0 ? cards : DEFAULTS.cards
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink
  const titlesRef = useRef<(HTMLHeadingElement | null)[]>([])
  const eyebrowRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Eyebrow "FERMENTATION" entrance ── */
      if (eyebrowRef.current) {
        const el = eyebrowRef.current
        const text = el.textContent ?? ''
        el.innerHTML = text
          .split('')
          .map((ch) =>
            ch === ' ' ? ' ' : `<span class="inline-block" style="opacity:0">${ch}</span>`,
          )
          .join('')
        const chars = el.querySelectorAll('span')
        gsap.fromTo(
          chars,
          { opacity: 0, y: -60, rotateX: 90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      /* ── Card titles letter animation ── */
      titlesRef.current.forEach((el) => {
        if (!el) return
        const text = el.textContent ?? ''
        el.innerHTML = text
          .split('')
          .map((ch) => (ch === ' ' ? ' ' : `<span class="inline-block">${ch}</span>`))
          .join('')
        const chars = el.querySelectorAll('span')
        gsap.fromTo(
          chars,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.04,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )
      })
    })
    return () => ctx.revert()
  }, [resolvedCards])

  return (
    <section id={id ?? undefined} className="bg-white section-padding-md">
      <div className="container mx-auto px-6 flex flex-col items-start gap-(--space-content-xl)">
        {/* Header: heading row (title + eyebrow + button) then description */}
        <div className="flex flex-col gap-(--space-content-sm) w-full">
          {/* Top row: heading+eyebrow left, button right — vertically centered */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-16 w-full">
            <FadeIn className="flex items-start gap-3 flex-1">
              <h2
                className="font-display font-black"
                style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  color: '#000',
                }}
              >
                {resolvedHeading}
              </h2>
              {resolvedEyebrow && (
                <span
                  ref={eyebrowRef}
                  className="text-eyebrow font-bold text-ff-gold-accent shrink-0"
                  style={{ marginTop: '0.35em', perspective: '600px' }}
                >
                  {resolvedEyebrow}
                </span>
              )}
            </FadeIn>

            {/* CTA button — centered with the heading */}
            {resolvedButtonLabel && (
              <FadeIn className="shrink-0">
                <Link
                  href={resolvedButtonLink}
                  className="inline-flex items-center justify-center font-display font-bold text-[#F9F0DC] transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: '#4B4B4B',
                    borderRadius: '2rem',
                    padding: '0.875rem 1.5rem',
                    fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
                    lineHeight: 1.5,
                  }}
                >
                  {resolvedButtonLabel}
                </Link>
              </FadeIn>
            )}
          </div>

          {/* Description below the heading row */}
          {resolvedDescription && (
            <FadeIn className="max-w-264">
              <p
                className="font-display font-bold"
                style={{
                  fontSize: 'clamp(0.9rem, 1.4vw, 1.25rem)',
                  lineHeight: 1.6,
                  color: '#000',
                }}
              >
                {resolvedDescription}
              </p>
            </FadeIn>
          )}
        </div>

        {/* Cards — 3 across on desktop, 1 per row on mobile (never 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-(--space-content-lg) w-full">
          {resolvedCards.map((card, index) => (
            <FadeIn key={index} delay={index * 120}>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-ff-gold-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {/* Blob + Brand Character */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center -mb-2">
                  <BlobCanvas
                    color={BLOB_COLOR}
                    radius={65}
                    numPoints={32}
                    className="absolute inset-0 w-full h-full"
                  />
                  <div className="relative z-10 flex items-center justify-center pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getIconSrc(card.icon, index)}
                      alt={card.title ?? ''}
                      width={70}
                      height={70}
                      className="w-15 h-15 md:w-17.5 md:h-17.5 animate-[gentle-float_3s_ease-in-out_infinite] drop-shadow-md object-contain"
                    />
                  </div>
                </div>

                {/* Title + Description */}
                <h3
                  ref={(el) => {
                    titlesRef.current[index] = el
                  }}
                  className="font-display font-bold text-lg text-ff-black uppercase tracking-wide"
                >
                  {card.title}
                </h3>
                <p className="text-body-sm text-ff-black mt-2">{card.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
