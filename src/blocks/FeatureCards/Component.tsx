'use client'

import { SectionHeader } from '@/components/SectionHeader'
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
  visible,
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Card titles: animate by word so line breaks never split a word ── */
      titlesRef.current.forEach((el) => {
        if (!el) return
        const text = (el.textContent ?? '').trim()
        const words = text.split(/\s+/).filter(Boolean)
        el.innerHTML = words
          .map(
            (word) =>
              `<span class="inline-block whitespace-nowrap" style="opacity:0">${word}</span>`,
          )
          .join(' ')
        const wordSpans = el.querySelectorAll(':scope > span')
        gsap.fromTo(
          wordSpans,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.07,
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
  }, [resolvedCards, resolvedEyebrow])

  if (visible === false) return null

  return (
    <section id={id ?? undefined} className="bg-white section-padding-md">
      <div className="container mx-auto container-padding flex flex-col items-start gap-(--space-content-xl)">
        {/* Header — shared editorial pattern (rule · label · heading · intro) */}
        <div className="flex w-full flex-col gap-(--space-content-sm)">
          <FadeIn className="w-full">
            <SectionHeader
              eyebrow={resolvedEyebrow}
              heading={resolvedHeading}
              intro={resolvedDescription}
            />
          </FadeIn>

          {/* CTA directly under the intro description */}
          {resolvedButtonLabel && (
            <FadeIn>
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
