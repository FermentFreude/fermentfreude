import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

function isResolvedMedia(img: unknown): img is { url?: string; alt?: string } {
  if (typeof img !== 'object' || img === null || !('url' in img)) return false
  const url = String((img as { url?: string }).url ?? '').trim()
  return Boolean(url) && !/\/null(?:\?|$)/.test(url) && !/round-label/i.test(url)
}

type Props = {
  title: string
  image?: unknown
  facts: string[]
  ctaLabel: string
  ctaUrl: string
}

export function GastronomyProductOffer({ title, image, facts, ctaLabel, ctaUrl }: Props) {
  const cms = isResolvedMedia(image) ? image : null

  return (
    <section className="bg-white section-padding-md" aria-label={title}>
      <div className="container mx-auto container-padding">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F6F0E8] lg:aspect-[5/6]">
            {cms ? (
              <Media
                resource={cms as never}
                fill
                imgClassName="object-cover object-center"
                size="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[#ECE5DE]" aria-hidden />
            )}
          </div>
          <div>
            <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-black">
              {title}
            </h2>
            {facts.length > 0 ? (
              <ul className="mt-8 space-y-3">
                {facts.map((fact) => (
                  <li
                    key={fact}
                    className="border-b border-black/8 pb-3 font-display text-body font-medium text-ff-black last:border-b-0"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href={ctaUrl}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-ff-gold px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#1b1b1b] transition-transform hover:scale-[1.03] hover:bg-[#EDD195] active:scale-[0.97]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
