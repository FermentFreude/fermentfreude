'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import { Calendar, ChevronRight, Users } from 'lucide-react'

type FeaturedItem = {
  id?: string | null
  image?: MediaType | string | null
  title?: string | null
  description?: string | null
  date?: string | null
  seats?: number | null
  price?: string | null
  buttonLabel?: string | null
  readMoreLabel?: string | null
  url?: string | null
}

type ShopFeaturedSectionData = {
  featuredHeading?: string | null
  featuredHeadingHighlight?: string | null
  featuredViewAllLabel?: string | null
  featuredViewAllUrl?: string | null
  featuredItems?: FeaturedItem[] | null
}

type Props = {
  data?: ShopFeaturedSectionData | null
}

const DEFAULT_ITEMS: FeaturedItem[] = [
  {
    title: 'Kombucha Mastery',
    description:
      'Learn the secrets of double fermentation and creating your own signature flavors.',
    date: '12. March 2026',
    seats: 12,
    price: '€89',
    buttonLabel: 'Info & Book',
    url: '/workshops',
  },
  {
    title: 'Lakto Fermentation',
    description: 'Learn the art of fermented vegetables and natural preservation.',
    date: '19. March 2026',
    seats: 10,
    price: '€75',
    buttonLabel: 'Info & Book',
    url: '/workshops',
  },
]

const DEFAULTS = {
  featuredHeading: 'Learn UNIQUE Flavours',
  featuredHeadingHighlight: 'UNIQUE',
  featuredViewAllLabel: 'See All Workshops',
  featuredViewAllUrl: '/workshops',
  buttonLabel: 'Info & Book',
}

export const ShopFeaturedSection: React.FC<Props> = ({ data }) => {
  const heading = data?.featuredHeading ?? DEFAULTS.featuredHeading
  const highlight = data?.featuredHeadingHighlight ?? DEFAULTS.featuredHeadingHighlight
  const viewAllLabel = data?.featuredViewAllLabel ?? DEFAULTS.featuredViewAllLabel
  const viewAllUrl = data?.featuredViewAllUrl ?? DEFAULTS.featuredViewAllUrl
  const rawItems = data?.featuredItems ?? []
  const items = rawItems.length > 0 ? rawItems : DEFAULT_ITEMS

  return (
    <section className="section-padding-lg bg-white">
      <div className="container mx-auto container-padding content-wide">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10 animate-fade-in-up">
          <h2 className="text-section-heading font-display font-bold text-ff-charcoal">
            {highlight && heading.includes(highlight) ? (
              <>
                {heading.slice(0, heading.indexOf(highlight))}
                <span className="text-ff-gold">{highlight}</span>
                {heading.slice(heading.indexOf(highlight) + highlight.length)}
              </>
            ) : (
              heading
            )}
          </h2>
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="inline-flex items-center font-display font-bold text-sm text-ff-gold hover:text-ff-charcoal transition-colors shrink-0"
            >
              {viewAllLabel}
              <ChevronRight className="ml-1 size-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {items.map((item, i) => {
            const delayClass = i === 0 ? 'animate-delay-200' : 'animate-delay-400'
            const img =
              item.image && typeof item.image === 'object' && item.image !== null
                ? item.image
                : null
            const buttonLabel = item.buttonLabel ?? item.readMoreLabel ?? DEFAULTS.buttonLabel

            return (
              <Link
                key={item.id ?? i}
                href={item.url ?? '#'}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-ff-charcoal/10 bg-[#FBF9F6] shadow-sm transition-shadow hover:shadow-md sm:flex-row animate-fade-in-up ${delayClass}`}
              >
                <div className="relative aspect-[4/3] w-full shrink-0 sm:aspect-square sm:w-2/5 sm:min-w-[200px]">
                  {img ? (
                    <Media
                      resource={img as MediaType}
                      fill
                      imgClassName="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#FBF9F6]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-ff-gold">
                      {item.date && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-4" aria-hidden />
                          {item.date}
                        </span>
                      )}
                      {item.seats != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-4" aria-hidden />
                          {item.seats} seats
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-subheading font-bold leading-tight text-ff-charcoal">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-body-sm text-ff-gray-text line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {item.price && (
                      <span className="font-display font-bold text-ff-charcoal">{item.price}</span>
                    )}
                    <span className="inline-flex items-center justify-center rounded-full bg-ff-charcoal px-4 py-2.5 font-display text-sm font-bold text-ff-ivory transition-all group-hover:bg-ff-charcoal-hover group-hover:scale-[1.02]">
                      {buttonLabel}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
