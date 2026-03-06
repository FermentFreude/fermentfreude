'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

/* ═══════════════════════════════════════════════════════════════
 *  HERO SPLIT — Simple editorial layout
 *  Text left, image right. Label, heading, description, link.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULTS = {
  label: 'About Us',
  heading: 'Where tradition meets science',
  description:
    'FermentFreude makes fermentation accessible and enjoyable. Discover workshops, products, and our passionate team dedicated to gut health.',
  ctaLabel: 'Learn more',
  ctaUrl: '/fermentation',
}

type HeroSplitProps = Page['hero'] & { type: 'heroSplit' }

export const HeroSplit: React.FC<HeroSplitProps> = (props) => {
  const { setHeaderTheme } = useHeaderTheme()
  const {
    splitLabel,
    splitHeading,
    splitDescription,
    splitCtaLabel,
    splitCtaUrl,
    splitMedia,
  } = props

  const label = splitLabel ?? DEFAULTS.label
  const heading = splitHeading ?? DEFAULTS.heading
  const description = splitDescription ?? DEFAULTS.description
  const ctaLabel = splitCtaLabel ?? DEFAULTS.ctaLabel
  const ctaUrl = splitCtaUrl ?? DEFAULTS.ctaUrl

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  const hasImage = splitMedia && typeof splitMedia === 'object' && 'url' in splitMedia

  return (
    <section className="relative w-full overflow-hidden mb-[var(--space-section-md)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[28rem] lg:min-h-[32rem]">
        {/* Left — text */}
        <div className="flex flex-col justify-center bg-[#F8F8F8] px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24">
          {label && (
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-display font-semibold text-ff-near-black bg-ff-gold-accent/30 mb-6 w-fit">
              {label}
            </span>
          )}
          <h1 className="font-display text-display font-bold text-ff-near-black tracking-tight leading-[1.15]">
            {heading}
          </h1>
          {description && (
            <p className="mt-6 font-sans text-body-lg text-ff-gray-text leading-relaxed max-w-xl">
              {description}
            </p>
          )}
          {ctaLabel && ctaUrl && (
            <Link
              href={ctaUrl}
              className="mt-8 font-sans text-body font-semibold text-ff-near-black hover:text-ff-charcoal transition-colors inline-flex items-center gap-2 group"
            >
              {ctaLabel}
              <span className="group-hover:translate-x-1 transition-transform" aria-hidden>
                →
              </span>
            </Link>
          )}
        </div>

        {/* Right — image */}
        <div className="relative min-h-[20rem] lg:min-h-full">
          {hasImage ? (
            <Media
              resource={splitMedia as Parameters<typeof Media>[0]['resource']}
              fill
              imgClassName="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-ff-warm-gray" />
          )}
        </div>
      </div>
    </section>
  )
}
