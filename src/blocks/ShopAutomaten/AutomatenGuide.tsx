'use client'

import { ArrowUpRight, Link2, Share2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import './automaten.css'

export type AutomatenEditorialLocation = {
  city: string
  name: string
  address: string
  products: string
  description: string
  badge: string
  mapsUrl: string
  websiteUrl: string | null
  imageUrl: string | null
  imageAlt: string
  accent: string
}

type Props = {
  eyebrow: string
  heading: string
  body: string
  mapsLabel: string
  shareLabel: string
  websiteLabel: string
  featuredImageUrl: string | null
  featuredImageAlt: string
  locations: AutomatenEditorialLocation[]
  tipText: string | null
  tipMapsUrl: string | null
  tipWebsiteUrl: string | null
  tipLabel: string
  tipName: string | null
  tipAddress: string | null
  tipProducts: string | null
  tipImageUrl: string | null
  tipImageAlt: string
}

async function shareRoute(title: string, text: string, url: string) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title, text, url })
      return 'shared'
    }
  } catch {
    // user cancelled or share failed — fall through to clipboard
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}

function ActionRow({
  mapsUrl,
  mapsLabel,
  websiteUrl,
  websiteLabel,
  shareLabel,
  shareTitle,
  shareText,
}: {
  mapsUrl: string
  mapsLabel: string
  websiteUrl: string | null
  websiteLabel: string
  shareLabel: string
  shareTitle: string
  shareText: string
}) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle')

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-display text-sm font-bold text-ff-near-black no-underline transition-colors hover:text-ff-gold"
      >
        {mapsLabel}
        <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-ff-charcoal/80 no-underline transition-colors hover:text-ff-gold"
        >
          <Link2 className="size-3.5" />
          {websiteLabel}
        </a>
      )}
      <button
        type="button"
        onClick={async () => {
          const result = await shareRoute(shareTitle, shareText, mapsUrl)
          if (result === 'copied') {
            setShareState('copied')
            window.setTimeout(() => setShareState('idle'), 2000)
          } else if (result === 'failed') {
            setShareState('failed')
            window.setTimeout(() => setShareState('idle'), 2000)
          }
        }}
        className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 font-display text-sm font-bold text-ff-charcoal/80 transition-colors hover:text-ff-gold"
      >
        <Share2 className="size-3.5" />
        {shareState === 'copied' ? '✓' : shareState === 'failed' ? '…' : shareLabel}
      </button>
    </div>
  )
}

/**
 * Editorial Automaten: lifestyle image + numbered stacked cards + subtle tip.
 * Uses plain Next/Image + absolute URLs so media always paints.
 */
export function AutomatenEditorial({
  eyebrow,
  heading,
  body,
  mapsLabel,
  shareLabel,
  websiteLabel,
  featuredImageUrl,
  featuredImageAlt,
  locations,
  tipText,
  tipMapsUrl,
  tipWebsiteUrl,
  tipLabel,
  tipName,
  tipAddress,
  tipProducts,
  tipImageUrl,
  tipImageAlt,
}: Props) {
  const [active, setActive] = useState(0)
  const tipIndex = locations.length
  const showTip = Boolean(tipText && tipMapsUrl)

  return (
    <section id="automaten" className="automaten-editorial relative overflow-hidden bg-white">
      <div className="container relative mx-auto container-padding py-16 md:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center md:mx-0 md:max-w-xl md:text-left">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-ff-gold">
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-[1.85rem] font-bold leading-[1.08] tracking-tight text-ff-near-black sm:text-[2.1rem] md:text-[2.85rem] lg:text-[3.15rem]">
            {heading}
          </h2>
          {body && (
            <p className="mt-4 max-w-lg text-body leading-relaxed text-ff-gray-text">{body}</p>
          )}
        </div>

        <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Left featured */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="automaten-featured relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#E8E2D8] shadow-[0_24px_60px_rgba(26,26,26,0.1)]">
              {featuredImageUrl ? (
                <Image
                  src={featuredImageUrl}
                  alt={featuredImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out automaten-featured-img"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-[#ECE5DE]" />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              />
              <p className="absolute bottom-5 left-5 right-5 z-10 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
                {eyebrow}
              </p>
            </div>
          </div>

          {/* Right cards */}
          <div className="lg:col-span-7">
            <ol className="relative m-0 list-none space-y-0 p-0">
              {locations.map((loc, i) => {
                return (
                  <li key={`${loc.name}-${i}`} className="relative pb-6 last:pb-0 md:pb-8">
                    <article
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={`automaten-loc-card group relative grid min-h-[10rem] overflow-hidden rounded-[1.5rem] bg-[#FDFBF8] shadow-[0_10px_30px_rgba(26,26,26,0.05)] transition-all duration-500 md:grid-cols-[13rem_1fr] ${
                        active === i ? 'automaten-loc-card--active' : ''
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#ECE5DE] md:aspect-auto md:min-h-[10rem] md:h-full">
                        {loc.imageUrl ? (
                          <Image
                            src={loc.imageUrl}
                            alt={loc.imageAlt || loc.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 208px"
                            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[#ECE5DE]" />
                        )}
                      </div>

                      <div className="flex flex-col p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex w-fit items-center rounded-full bg-[#ECE5DE] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-ff-charcoal">
                            {loc.badge}
                          </span>
                          {loc.city && (
                            <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ff-gold">
                              {loc.city}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ff-near-black md:text-xl">
                          {loc.name}
                        </h3>
                        <p className="mt-1.5 text-body-sm text-ff-gray-text">{loc.address}</p>
                        {loc.products && (
                          <p className="mt-2 font-display text-[11px] font-bold tracking-wide text-ff-charcoal">
                            {loc.products}
                          </p>
                        )}
                        {loc.description && (
                          <p className="mt-3 text-body-sm leading-relaxed text-ff-charcoal">
                            {loc.description}
                          </p>
                        )}
                        <ActionRow
                          mapsUrl={loc.mapsUrl}
                          mapsLabel={mapsLabel}
                          websiteUrl={loc.websiteUrl}
                          websiteLabel={websiteLabel}
                          shareLabel={shareLabel}
                          shareTitle={loc.name}
                          shareText={`${loc.name} · ${loc.address}`}
                        />
                      </div>
                    </article>
                  </li>
                )
              })}

              {showTip && (
                <li className="relative pb-0 md:pb-0">
                  <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ff-gold">
                    {tipLabel} · Restaurant
                  </p>
                  <article
                    onMouseEnter={() => setActive(tipIndex)}
                    onFocus={() => setActive(tipIndex)}
                    className={`automaten-loc-card group relative grid min-h-[10rem] overflow-hidden rounded-[1.5rem] bg-[#FDFBF8] shadow-[0_10px_30px_rgba(26,26,26,0.05)] transition-all duration-500 md:grid-cols-[13rem_1fr] ${
                      active === tipIndex ? 'automaten-loc-card--active' : ''
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#ECE5DE] md:aspect-auto md:min-h-[10rem] md:h-full">
                      {tipImageUrl ? (
                        <Image
                          src={tipImageUrl}
                          alt={tipImageAlt}
                          fill
                          sizes="(max-width: 768px) 100vw, 208px"
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#ECE5DE]" />
                      )}
                    </div>

                    <div className="flex flex-col p-5 md:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex w-fit items-center rounded-full bg-[#ECE5DE] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-ff-charcoal">
                          Restaurant
                        </span>
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-ff-gold">
                          Graz
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ff-near-black md:text-xl">
                        {tipName || 'Wildmoser'}
                      </h3>
                      {tipAddress && (
                        <p className="mt-1.5 text-body-sm text-ff-gray-text">{tipAddress}</p>
                      )}
                      {tipProducts && (
                        <p className="mt-2 font-display text-[11px] font-bold tracking-wide text-ff-charcoal">
                          {tipProducts}
                        </p>
                      )}
                      {tipText && (
                        <p className="mt-3 text-body-sm leading-relaxed text-ff-charcoal">{tipText}</p>
                      )}
                      <ActionRow
                        mapsUrl={tipMapsUrl!}
                        mapsLabel={mapsLabel}
                        websiteUrl={tipWebsiteUrl}
                        websiteLabel={websiteLabel}
                        shareLabel={shareLabel}
                        shareTitle={tipName || 'Wildmoser'}
                        shareText={`${tipName || 'Wildmoser'} · ${tipAddress || tipText}`}
                      />
                    </div>
                  </article>
                </li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
