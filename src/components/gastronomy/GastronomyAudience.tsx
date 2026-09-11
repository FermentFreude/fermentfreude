import { Media } from '@/components/Media'
import React from 'react'

function isResolvedMedia(img: unknown): img is { url?: string; alt?: string } {
  if (typeof img !== 'object' || img === null || !('url' in img)) return false
  const url = String((img as { url?: string }).url ?? '').trim()
  return Boolean(url) && !/\/null(?:\?|$)/.test(url)
}

export type AudienceCard = {
  id?: string | null
  title: string
  text?: string | null
  image?: unknown
  imageFit?: 'cover' | 'contain'
}

type Props = {
  title: string
  cards: AudienceCard[]
}

export function GastronomyAudience({ title, cards }: Props) {
  if (cards.length === 0) return null

  return (
    <section className="bg-[#F6F0E8] section-padding-md" aria-label={title}>
      <div className="container mx-auto container-padding">
        <h2 className="mx-auto max-w-3xl text-center font-display text-section-heading font-bold tracking-tight text-ff-black">
          {title}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:grid-cols-4 md:gap-x-6 md:gap-y-0">
          {cards.map((card, i) => {
            const cms = isResolvedMedia(card.image) ? card.image : null
            const contain = card.imageFit === 'contain'

            return (
              <figure key={card.id ?? `${card.title}-${i}`} className="group">
                <div
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl ${contain ? 'bg-[#111110]' : 'bg-[#ECE5DE]'}`}
                >
                  {cms ? (
                    <Media
                      resource={cms as never}
                      fill
                      imgClassName={`${contain ? 'object-contain p-4' : 'object-cover'} transition-transform duration-700 group-hover:scale-[1.03]`}
                      size="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#ECE5DE]" aria-hidden />
                  )}
                </div>
                <figcaption className="mt-4 text-center">
                  <p className="font-display text-body font-bold tracking-tight text-ff-black">
                    {card.title}
                  </p>
                  {card.text?.trim() ? (
                    <p className="mt-1 text-body-sm leading-relaxed text-ff-gray-text">{card.text.trim()}</p>
                  ) : null}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
