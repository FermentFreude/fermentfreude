'use client'

import { Media } from '@/components/Media'
import { WorkshopCardButton } from '@/components/WorkshopCardButton'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
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
  availableSpots?: number | null
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
  /** Locale for displaying sold out text. Default: 'de' */
  locale?: 'de' | 'en'
}

function WorkshopCardSlide({
  card,
  cardBg,
  nextDateLabel,
  locale,
}: {
  card: WorkshopCard
  cardBg: string
  nextDateLabel?: string | null
  locale: 'de' | 'en'
}) {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/15 shadow-lg transition-shadow hover:shadow-xl"
      style={{ backgroundColor: cardBg }}
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {isResolvedMedia(card.image) ? (
          (() => {
            const res = card.image as { url?: string }
            const url = res?.url
            return url?.startsWith('/assets/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <Media resource={res as MediaType} fill imgClassName="object-cover" />
            )
          })()
        ) : (
          <div className="flex size-full items-center justify-center bg-[#D8D6D1]" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold text-ff-black md:text-subheading">
          {card.title}
        </h3>
        <p className="mt-2 text-body-sm leading-relaxed text-ff-black/90">{card.description}</p>
        <div className="mt-auto">
          {(card.price || card.priceSuffix) && (
            <p className="mt-4 font-display text-lg font-bold text-ff-black">
              {card.price}
              {card.priceSuffix && ` ${card.priceSuffix}`}
            </p>
          )}
          {card.buttonUrl && card.buttonLabel && (
            <WorkshopCardButton
              href={card.buttonUrl}
              label={card.buttonLabel}
              isOutOfStock={card.availableSpots === 0}
              locale={locale}
            />
          )}
          {card.nextDate && (
            <div className="mt-4 flex items-center gap-2">
              <p className="text-body-sm text-ff-black/70">
                {nextDateLabel ? `${nextDateLabel} ` : ''}
                {card.nextDate}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
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
  locale = 'de',
}: WorkshopCardsSectionProps) {
  if (cards.length === 0) return null

  const prevLabel = locale === 'en' ? 'Previous workshops' : 'Vorherige Workshops'
  const nextLabel = locale === 'en' ? 'Next workshops' : 'Nächste Workshops'
  const showNav = cards.length > 1

  return (
    <section className="section-padding-sm bg-white">
      <div className="mx-auto max-w-379 px-4 sm:px-6">
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

        <Carousel
          opts={{
            align: 'start',
            loop: showNav,
            skipSnaps: false,
            dragFree: false,
          }}
          className="mt-10 w-full"
        >
          <CarouselContent className="-ml-6 sm:-ml-8">
            {cards.map((card, i) => (
              <CarouselItem
                key={card.id ?? i}
                className="flex basis-full pl-6 sm:pl-8 md:basis-1/2 lg:basis-1/3"
              >
                <WorkshopCardSlide
                  card={card}
                  cardBg={cardBg}
                  nextDateLabel={nextDateLabel}
                  locale={locale}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {showNav && (
            <div className="mt-8 flex justify-center gap-2">
              <CarouselPrevious
                className="static size-12 translate-y-0 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] hover:bg-[#d4a654] hover:text-[#1a1a1a]"
                variant="default"
                aria-label={prevLabel}
              />
              <CarouselNext
                className="static size-12 translate-y-0 rounded-full border-0 bg-[#E5B765] text-[#1a1a1a] hover:bg-[#d4a654] hover:text-[#1a1a1a]"
                variant="default"
                aria-label={nextLabel}
              />
            </div>
          )}
        </Carousel>
      </div>
    </section>
  )
}
