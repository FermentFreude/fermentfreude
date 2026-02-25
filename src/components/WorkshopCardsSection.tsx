import Link from 'next/link'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export interface WorkshopCard {
  id?: string | null
  title: string
  description: string
  image?: unknown
  price?: string
  priceSuffix?: string
  buttonLabel?: string
  buttonUrl?: string
  nextDate?: string
}

interface WorkshopCardsSectionProps {
  title: string
  subtitle?: string
  nextDateLabel?: string
  viewAllLabel?: string
  viewAllUrl?: string
  cards: WorkshopCard[]
  cardBg?: string
  layout?: 'inline' | 'stacked'
  /** Section wrapper background. Default: bg-ff-ivory. Use "white" for white. */
  sectionBg?: 'ivory' | 'white'
}

export function WorkshopCardsSection({
  title,
  subtitle,
  nextDateLabel,
  viewAllLabel,
  viewAllUrl,
  cards,
  cardBg = '#ffffff',
  sectionBg = 'ivory',
}: WorkshopCardsSectionProps) {
  if (cards.length === 0) return null

  return (
    <section
      className={`section-padding-lg ${sectionBg === 'white' ? 'bg-white' : 'bg-ff-ivory'}`}
    >
      <div className="container mx-auto container-padding content-wide">
        <h2 className="text-center text-section-heading font-display font-bold text-ff-black">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-ff-olive">{subtitle}</p>
        )}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={card.id ?? i}
              className="overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-lg"
              style={{ backgroundColor: cardBg }}
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-t-2xl">
                {isResolvedMedia(card.image) ? (
                  <Media resource={card.image} fill imgClassName="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-neutral-100" />
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-2 font-display text-title font-bold text-ff-black">
                  {card.title}
                </h3>
                <p className="mb-4 text-body leading-relaxed text-ff-charcoal">
                  {card.description}
                </p>
                {card.price && (
                  <div className="mb-5 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-ff-gold">
                      {card.price}
                    </span>
                    {card.priceSuffix && (
                      <span className="font-sans text-body text-ff-olive">
                        {card.priceSuffix}
                      </span>
                    )}
                  </div>
                )}
                {card.buttonUrl && card.buttonLabel && (
                  <Link
                    href={card.buttonUrl}
                    className="inline-flex w-full items-center justify-center rounded-full bg-ff-charcoal hover:bg-ff-charcoal-hover px-6 py-2.5 font-display font-bold text-base text-ff-ivory transition-all hover:scale-[1.03] active:scale-[0.97]"
                  >
                    {card.buttonLabel}
                  </Link>
                )}
                {card.nextDate && nextDateLabel && (
                  <div className="mt-5">
                    <p className="font-sans text-body-sm text-ff-olive">{nextDateLabel}</p>
                    <p className="mt-1 font-display text-lg font-bold text-ff-black">
                      {card.nextDate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {viewAllLabel && viewAllUrl && (
          <div className="mt-10 text-center">
            <Link
              href={viewAllUrl}
              className="inline-flex items-center justify-center rounded-full border-2 border-ff-charcoal bg-transparent hover:bg-ff-charcoal hover:text-ff-ivory px-8 py-2.5 font-display font-bold text-base text-ff-charcoal transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {viewAllLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
