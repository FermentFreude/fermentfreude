'use client'

import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { Media as MediaType } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import { ChevronRight } from 'lucide-react'

const DEFAULTS = {
  featuredHeading: 'Learn UNIQUE Flavours',
  featuredViewAllLabel: 'View all',
  featuredViewAllUrl: '/workshops',
  readMoreLabel: 'Read more',
}

type FeaturedItem = {
  id?: string
  image?: MediaType | string | null
  title?: string | null
  description?: string | null
  readMoreLabel?: string | null
  url?: string | null
}

type ShopFeaturedSectionData = {
  featuredHeading?: string | null
  featuredViewAllLabel?: string | null
  featuredViewAllUrl?: string | null
  featuredItems?: FeaturedItem[] | null
}

type Props = {
  data?: ShopFeaturedSectionData | null
}

export const ShopFeaturedSection: React.FC<Props> = ({ data }) => {
  const heading = data?.featuredHeading ?? DEFAULTS.featuredHeading
  const viewAllLabel = data?.featuredViewAllLabel ?? DEFAULTS.featuredViewAllLabel
  const viewAllUrl = data?.featuredViewAllUrl ?? DEFAULTS.featuredViewAllUrl
  const items = data?.featuredItems ?? []

  if (items.length === 0) return null

  return (
    <section className="section-padding-lg bg-ff-ivory">
      <div className="container mx-auto container-padding">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-section-heading font-display font-bold text-ff-black">
            {heading}
          </h2>
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="inline-flex items-center font-display font-bold text-sm text-ff-charcoal hover:text-ff-black transition-colors shrink-0"
            >
              {viewAllLabel}
              <ChevronRight className="ml-1 size-4" />
            </Link>
          )}
        </div>
        <div className="relative">
          <Carousel opts={{ align: 'start', loop: true }} className="w-full">
            <CarouselContent className="-ml-4 md:-ml-6">
              {items.map((item, i) => {
                const img =
                  item.image && typeof item.image === 'object' && item.image !== null
                    ? item.image
                    : null
                const readMore = item.readMoreLabel ?? DEFAULTS.readMoreLabel

                return (
                  <CarouselItem
                    key={item.id ?? i}
                    className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="rounded-2xl overflow-hidden border bg-ff-ivory-mist">
                      <div className="aspect-[4/3] relative">
                        {img ? (
                          <Media
                            resource={img as { url: string; alt?: string }}
                            fill
                            imgClassName="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-ff-ivory-mist" />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display font-bold text-ff-black text-lg">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-2 text-body-sm text-ff-olive line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.url && (
                          <Link
                            href={item.url}
                            className="mt-4 inline-flex items-center font-display font-bold text-sm border-2 border-ff-charcoal rounded-full px-4 py-2 text-ff-charcoal hover:bg-ff-charcoal hover:text-ff-ivory transition-colors"
                          >
                            {readMore}
                            <ChevronRight className="ml-1 size-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-2 md:right-4 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      </div>
    </section>
  )
}
