import { SentenceBreakText } from '@/components/gastronomy/SentenceBreakText'
import { Media } from '@/components/Media'
import React from 'react'

import './gastronomy.css'

function isResolvedMedia(img: unknown): img is { url?: string; alt?: string } {
  if (typeof img !== 'object' || img === null || !('url' in img)) return false
  const url = String((img as { url?: string }).url ?? '').trim()
  return Boolean(url) && !/\/null(?:\?|$)/.test(url)
}

export type ProofItem = {
  quote: string
  author: string
}

type Props = {
  title: string
  items: ProofItem[]
  image?: unknown
}

function splitAuthor(author: string): { name: string; place: string | null } {
  const comma = author.indexOf(',')
  if (comma === -1) return { name: author.trim(), place: null }
  return {
    name: author.slice(0, comma).trim(),
    place: author.slice(comma + 1).trim() || null,
  }
}

export function GastronomyProof({ title, items, image }: Props) {
  if (items.length === 0) return null

  const cms = isResolvedMedia(image) ? image : null

  return (
    <section className="relative overflow-hidden bg-ff-near-black" aria-label={title}>
      <div className="absolute inset-0">
        {cms ? (
          <Media
            resource={cms as never}
            fill
            imgClassName="object-cover object-center"
            size="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#ECE5DE]" aria-hidden />
        )}
      </div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(18,16,15,0.82) 0%, rgba(18,16,15,0.55) 48%, rgba(18,16,15,0.28) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(18,16,15,0.2) 0%, rgba(18,16,15,0.45) 100%)',
        }}
      />

      <div className="relative z-10 container mx-auto container-padding flex min-h-[70svh] flex-col justify-end py-16 md:min-h-[78svh] md:py-24">
        <p className="font-display text-caption font-bold uppercase tracking-[0.18em] text-ff-gold">
          {title}
        </p>

        <div className="mt-8 flex flex-col gap-16 md:mt-10">
          {items.map((item) => {
            const { name, place } = splitAuthor(item.author)

            return (
              <blockquote key={item.author} className="max-w-2xl animate-fade-in-up">
                <span
                  aria-hidden
                  className="block font-display text-[4.5rem] leading-none text-ff-gold md:text-[6rem]"
                >
                  “
                </span>
                <SentenceBreakText
                  text={item.quote.replace(/^["“]|["”]$/g, '')}
                  className="gastronomy-hero-copy -mt-6 font-display text-subheading font-bold tracking-tight text-white md:-mt-8"
                />
                <footer className="mt-8">
                  <p className="font-display text-body font-bold text-white">{name}</p>
                  {place ? (
                    <p className="mt-1 font-display text-caption font-bold uppercase tracking-[0.16em] text-ff-gold">
                      {place}
                    </p>
                  ) : null}
                </footer>
              </blockquote>
            )
          })}
        </div>
      </div>
    </section>
  )
}
