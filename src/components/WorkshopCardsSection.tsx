import { Media } from '@/components/Media'
import Link from 'next/link'

import type { Media as MediaType } from '@/payload-types'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export type WorkshopCard = {
  id?: string | null
  title?: string | null
  description?: string | null
  image?: unknown
  price?: string | null
  priceSuffix?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
  nextDate?: string | null
}

export type WorkshopCardsSectionProps = {
  title: string
  subtitle?: string | null
  clarification?: string | null
  nextDateLabel?: string | null
  viewAllLabel?: string | null
  viewAllUrl?: string | null
  cards: WorkshopCard[]
  /** Card background. Default: #FAF2E0 */
  cardBg?: string
  /** Layout: 'centered' (gastronomy) or 'inline' (fermentation with View All button) */
  layout?: 'centered' | 'inline'
}

export function WorkshopCardsSection({
  title,
  subtitle,
  clarification,
  nextDateLabel,
  viewAllLabel,
  viewAllUrl,
  cards,
  cardBg = '#FAF2E0',
  layout = 'inline',
}: WorkshopCardsSectionProps) {
  if (cards.length === 0) return null

  return (
    <section className="section-padding-sm bg-white">
      <div className="mx-auto max-w-[1516px] px-4 sm:px-6">
        {layout === 'centered' ? (
          <div className="text-center">
            <h2 className="font-display text-section-heading font-bold text-ff-black md:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-body text-ff-black/80 sm:text-body-lg">{subtitle}</p>
            )}
            {clarification && (
              <p className="mx-auto mt-3 max-w-2xl text-body text-ff-black/70">{clarification}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
            <div>
              <h2 className="font-display text-section-heading font-bold text-ff-black">{title}</h2>
              {subtitle && (
                <p className="mt-3 max-w-2xl text-body text-ff-black/85 sm:text-body-lg">
                  {subtitle}
                </p>
              )}
            </div>
            {viewAllLabel && (
              <Link
                href={viewAllUrl ?? '/workshops'}
                className="shrink-0 rounded-lg bg-[#333333] px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                {viewAllLabel}
              </Link>
            )}
          </div>
        )}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={card.id ?? i}
              className="overflow-hidden rounded-2xl shadow-lg transition-shadow hover:shadow-xl"
              style={{ backgroundColor: cardBg }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {isResolvedMedia(card.image) ? (
                  <Media resource={card.image} fill imgClassName="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[#D8D6D1]" />
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-ff-black md:text-subheading">
                  {card.title}
                </h3>
                <p className="mt-2 text-body-sm leading-relaxed text-ff-black/90">
                  {card.description}
                </p>
                {(card.price || card.priceSuffix) && (
                  <p className="mt-4 font-display text-lg font-bold text-ff-black">
                    {card.price}
                    {card.priceSuffix && ` ${card.priceSuffix}`}
                  </p>
                )}
                {card.buttonUrl && card.buttonLabel && (
                  <Link
                    href={card.buttonUrl}
                    className="mt-4 inline-flex items-center rounded-lg bg-[#333333] px-5 py-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-[#1a1a1a]"
                  >
                    {String(card.buttonLabel).replace(/\s+>\s*$/, '')}
                  </Link>
                )}
                {card.nextDate && nextDateLabel && (
                  <p className="mt-4 text-body-sm text-ff-black/70">
                    {nextDateLabel} {card.nextDate}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
