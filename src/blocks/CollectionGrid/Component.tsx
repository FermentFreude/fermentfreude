import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

import type { CollectionGridBlock, Media as MediaType } from '@/payload-types'

type CollectionItem = NonNullable<CollectionGridBlock['collections']>[number]

const DEFAULT_COLLECTIONS: Omit<CollectionItem, 'image'>[] = [
  {
    id: '1',
    title: 'Tempeh',
    description: 'Handcrafted soy tempeh, rich in protein.',
    url: '/shop?category=tempeh',
  },
  {
    id: '2',
    title: 'Kimchi & Laktogemüse',
    description: 'Traditional lacto-fermented vegetables.',
    url: '/shop?category=kimchi',
  },
  {
    id: '3',
    title: 'Starterkulturen',
    description: 'Starter cultures for your own ferments.',
    url: '/shop?category=starterkulturen',
  },
  {
    id: '4',
    title: 'Miso',
    description: 'Aged miso paste, umami depth.',
    url: '/shop?category=miso',
  },
]

function isMediaObject(val: unknown): val is MediaType {
  return typeof val === 'object' && val !== null && 'url' in val
}

export const CollectionGridComponent: React.FC<CollectionGridBlock> = (props) => {
  const { eyebrow, heading, collections: cmsCollections } = props

  const collections =
    cmsCollections && cmsCollections.length > 0
      ? cmsCollections
      : (DEFAULT_COLLECTIONS as CollectionItem[])

  const resolvedEyebrow = eyebrow ?? 'Our Collections'
  const resolvedHeading = heading ?? 'Explore Our Products'

  return (
    <section className="py-(--space-section-lg) bg-white">
      <div className="mx-auto max-w-(--content-full) px-(--space-container-x)">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-ff-charcoal mb-3">
            {resolvedEyebrow}
          </span>
          <h2 className="text-ff-near-black">{resolvedHeading}</h2>
        </div>

        {/* Grid — editorial asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {collections.map((item, index) => {
            const hasImage = isMediaObject(item.image)
            const isLarge = index === 0 || index === 3

            const Card = (
              <div
                key={item.id || index}
                className={`group relative overflow-hidden rounded-2xl ${
                  isLarge ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1'
                }`}
              >
                {/* Image */}
                <div className="aspect-4/5 lg:aspect-3/4 relative overflow-hidden">
                  {hasImage ? (
                    <Media
                      resource={item.image as MediaType}
                      imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ECE5DE] flex items-center justify-center">
                      <span className="text-ff-charcoal/40 font-display text-2xl">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <h3 className="font-display text-white text-[clamp(1.25rem,2vw,1.75rem)] mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-white/80 text-sm leading-relaxed m-0 max-w-[80%]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )

            if (item.url) {
              return (
                <Link
                  key={item.id || index}
                  href={item.url}
                  className={`no-underline ${
                    isLarge ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1'
                  }`}
                >
                  {Card}
                </Link>
              )
            }

            return Card
          })}
        </div>
      </div>
    </section>
  )
}
