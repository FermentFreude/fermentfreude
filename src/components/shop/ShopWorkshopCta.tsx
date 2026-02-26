'use client'

import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

const DEFAULTS = {
  workshopCtaHeading: 'Learn Fermentation Anytime, Anywhere',
  workshopCtaDescription:
    'Our online courses let you learn at your own pace. Discover the art of fermentation from the comfort of your home.',
  workshopCtaButtonLabel: 'Start Learning',
  workshopCtaButtonUrl: '/workshops',
}

type ShopWorkshopCtaData = {
  workshopCtaHeading?: string | null
  workshopCtaDescription?: string | null
  workshopCtaButtonLabel?: string | null
  workshopCtaButtonUrl?: string | null
  workshopCtaBackgroundImage?: unknown
}

type Props = {
  data?: ShopWorkshopCtaData | null
}

export const ShopWorkshopCta: React.FC<Props> = ({ data }) => {

  const heading = data?.workshopCtaHeading ?? DEFAULTS.workshopCtaHeading
  const description = data?.workshopCtaDescription ?? DEFAULTS.workshopCtaDescription
  const buttonLabel = data?.workshopCtaButtonLabel ?? DEFAULTS.workshopCtaButtonLabel
  const buttonUrl = data?.workshopCtaButtonUrl ?? DEFAULTS.workshopCtaButtonUrl

  const image =
    data?.workshopCtaBackgroundImage &&
    typeof data.workshopCtaBackgroundImage === 'object' &&
    data.workshopCtaBackgroundImage !== null &&
    'url' in data.workshopCtaBackgroundImage
      ? data.workshopCtaBackgroundImage
      : null

  return (
    <section
      className="relative flex flex-col justify-center min-h-[40vh] md:min-h-[50vh] text-white py-16 md:py-24"
      data-theme="dark"
    >
      <div className="absolute inset-0 -z-10">
        {image ? (
          <>
            <div className="absolute inset-0 bg-ff-charcoal/70 z-[1]" />
            <Media
              fill
              imgClassName="object-cover"
              priority={false}
              resource={image as { url: string; alt?: string }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-ff-charcoal" />
        )}
      </div>
      <div className="container mx-auto container-padding relative z-10 flex flex-col items-center text-center">
        <div className="content-narrow max-w-2xl">
          <h2 className="text-section-heading font-display font-bold text-white mb-4">
            {heading}
          </h2>
          {description && (
            <p className="text-body-lg text-white/90 mb-8">{description}</p>
          )}
          {buttonUrl && (
            <Link
              href={buttonUrl}
              className="inline-flex items-center justify-center rounded-full bg-ff-ivory hover:bg-ff-cream px-8 py-2.5 font-display font-bold text-base text-ff-charcoal transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {buttonLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
