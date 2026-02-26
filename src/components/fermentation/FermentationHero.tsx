'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import React, { useEffect } from 'react'

const DEFAULTS = {
  heroTitleLine1: 'Innovation meets',
  heroTitleLine2: 'Tradition',
  heroTitleHighlight: '',
  heroDescription:
    'Fermentation is more than sauerkraut or yogurt. It is a world full of taste, creativity and surprising aromas.',
  heroCtaPrimaryLabel: 'Explore Now',
  heroCtaPrimaryUrl: '#what',
  heroCtaSecondaryLabel: 'Learn More',
  heroCtaSecondaryUrl: '/workshops',
}

type FermentationHeroData = {
  heroTitleLine1?: string | null
  heroTitleLine2?: string | null
  heroTitleHighlight?: string | null
  heroDescription?: string | null
  heroBackgroundImage?: unknown
  heroCtaPrimaryLabel?: string | null
  heroCtaPrimaryUrl?: string | null
  heroCtaSecondaryLabel?: string | null
  heroCtaSecondaryUrl?: string | null
}

type Props = {
  data?: FermentationHeroData | null
  /** Fallback when using single title from CMS (e.g. "Innovation meets Tradition") */
  heroTitle?: string | null
}

export const FermentationHero: React.FC<Props> = ({ data, heroTitle }) => {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => setHeaderTheme('dark'), [setHeaderTheme])

  const words = heroTitle?.trim().split(/\s+/) ?? []
  const fallbackLine1 = words.length > 1 ? words.slice(0, -1).join(' ') : (words[0] ?? DEFAULTS.heroTitleLine1)
  const fallbackLine2 = words.length > 1 ? words.slice(-1).join(' ') : DEFAULTS.heroTitleLine2
  const line1 = data?.heroTitleLine1 ?? fallbackLine1
  const line2 = data?.heroTitleLine2 ?? fallbackLine2
  const highlight = data?.heroTitleHighlight ?? DEFAULTS.heroTitleHighlight
  const description = data?.heroDescription ?? DEFAULTS.heroDescription
  const primaryLabel = data?.heroCtaPrimaryLabel ?? DEFAULTS.heroCtaPrimaryLabel
  const primaryUrl = data?.heroCtaPrimaryUrl ?? DEFAULTS.heroCtaPrimaryUrl
  const secondaryLabel = data?.heroCtaSecondaryLabel ?? DEFAULTS.heroCtaSecondaryLabel
  const secondaryUrl = data?.heroCtaSecondaryUrl ?? DEFAULTS.heroCtaSecondaryUrl

  const image =
    data?.heroBackgroundImage &&
    typeof data.heroBackgroundImage === 'object' &&
    data.heroBackgroundImage !== null &&
    'url' in data.heroBackgroundImage
      ? data.heroBackgroundImage
      : null

  return (
    <div
      className="relative flex flex-col justify-end min-h-[50vh] md:min-h-[60vh] text-white"
      data-theme="dark"
    >
      <div className="flex-1" />
      <div className="container z-10 relative pb-12 md:pb-16 lg:pb-20 container-padding">
        <div className="content-narrow">
          <h1 className="text-hero font-display font-bold text-white mb-4">
            <span className="block">{line1}</span>
            <span className="block">
              {highlight && line2.includes(highlight) ? (
                <>
                  <span className="text-ff-gold">{highlight}</span>
                  {line2.replace(highlight, '').trim() && (
                    <span> {line2.replace(highlight, '').trim()}</span>
                  )}
                </>
              ) : (
                line2
              )}
            </span>
          </h1>
          {description && (
            <p className="text-body-lg text-white/90 mb-6 max-w-xl">{description}</p>
          )}
          <div className="flex flex-wrap gap-4">
            {primaryUrl && (
              <Link
                href={primaryUrl}
                className="inline-flex items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover px-6 py-2.5 font-display font-bold text-base text-ff-ivory transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                {primaryLabel}
              </Link>
            )}
            {secondaryUrl && (
              <Link
                href={secondaryUrl}
                className="inline-flex items-center justify-center rounded-full border-2 border-ff-charcoal bg-ff-ivory/90 hover:bg-ff-ivory text-ff-charcoal px-6 py-2.5 font-display font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10">
        {image ? (
          <>
            <div className="absolute inset-0 bg-ff-charcoal/40 z-[1]" />
            <Media
              fill
              imgClassName="object-cover blur-sm"
              priority
              resource={image as MediaType}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-ff-charcoal" />
        )}
      </div>
    </div>
  )
}
