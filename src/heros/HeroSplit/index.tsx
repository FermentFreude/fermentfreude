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

function isPopulatedMedia(media: unknown): media is { url: string } {
  return typeof media === 'object' && media !== null && 'url' in media
}

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

  const hasImage = isPopulatedMedia(splitMedia)

  return (
    <section className="relative mb-0 w-full overflow-hidden">
      <div
        className={
          hasImage
            ? 'grid min-h-[28rem] grid-cols-1 lg:min-h-[32rem] lg:grid-cols-2'
            : 'min-h-0'
        }
      >
        {/* Left — text */}
        <div
          className={
            hasImage
              ? 'flex h-full flex-col justify-center bg-[#F8F8F8] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24'
              : 'container mx-auto container-padding section-padding-sm bg-[#F8F8F8]'
          }
        >
          <div className={hasImage ? '' : 'content-medium mx-auto text-center'}>
            {label && (
              <span
                className={`mb-6 inline-block w-fit rounded-full bg-ff-gold-accent/30 px-4 py-1.5 font-display text-sm font-semibold text-ff-near-black ${
                  hasImage ? '' : 'mx-auto'
                }`}
              >
                {label}
              </span>
            )}
            <h1
              className={`font-display text-display font-bold leading-[1.15] tracking-tight text-ff-near-black ${
                hasImage ? '' : 'mx-auto max-w-4xl text-center'
              }`}
            >
              {heading}
            </h1>
            {description && (
              <p
                className={`mt-6 font-sans text-body-lg leading-relaxed text-ff-gray-text ${
                  hasImage ? 'max-w-xl' : 'mx-auto max-w-3xl text-center'
                }`}
              >
                {description}
              </p>
            )}
            {ctaLabel && ctaUrl && (
              <Link
                href={ctaUrl}
                className="group mt-8 inline-flex items-center gap-2 font-sans text-body font-semibold text-ff-near-black transition-colors hover:text-ff-charcoal"
              >
                {ctaLabel}
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Right — image */}
        {hasImage ? (
          <div className="relative min-h-[20rem] lg:min-h-full">
            <Media
              resource={splitMedia as Parameters<typeof Media>[0]['resource']}
              fill
              imgClassName="object-cover"
              priority
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
