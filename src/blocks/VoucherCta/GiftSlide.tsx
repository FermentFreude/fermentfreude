'use client'

import { ArrowUpRight } from 'lucide-react'
import { MotionConfig, motion, useInView, useMotionValueEvent, type Variants } from 'motion/react'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

import { Media } from '@/components/Media'
import { PointsRow } from '@/components/PointsRow'
import { useArrival } from '@/components/StoryScene/hooks'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/cn'

import { VOUCHER_LAYERS } from './layers'

/* ═══════════════════════════════════════════════════════════════
 *  GIFT SLIDE — full-screen voucher card that slides up over the
 *  bento gallery once it is fully open (the parent extends the
 *  gallery pin and pulls this card up by one screen).
 *
 *  Built like the Tempeh / Workshops showcase slides. Two picture layouts:
 *   top         an illustration sits in-flow on top (it carries the word)
 *   background  a photo fills the slide behind a dark shade, the big word
 *               on top in cream — exactly like the Tempeh slide
 *  The text sits bottom left — small name, editorial headline, one
 *  paragraph, price, button — and the points row at the far right.
 *  With no picture, the big word (e.g. GUTSCHEIN) takes the top.
 *  Everything written is CMS.
 * ═══════════════════════════════════════════════════════════════ */

export type GiftSlideData = {
  bigWord?: string | null
  backgroundImage?: (string | null) | MediaType
  pictureLayout?: ('top' | 'background') | null
  label?: string | null
  headline?: string | null
  text?: string | null
  priceText?: string | null
  cardAlt?: string | null
  buttonLabel?: string | null
  buttonLink?: string | null
  buttonNote?: string | null
  points?:
    | { icon?: string | null; title: string; text?: string | null; id?: string | null }[]
    | null
}

const DEFAULT_BIG_WORD = 'VOUCHER'
const DEFAULT_LINK = '/workshops/voucher'
const DEFAULT_CARD_ALT = 'Gift voucher for a fermentation workshop at Fermentfreude in Graz'
const INK = '#1A1A1A' // brand near-black
export const GIFT_PAPER = '#F9F2E0' // the illustration's paper, so the picture melts into the slide
const NIGHT = '#1A1A1A' // behind a full-background photo

/** Colour behind the slide (also used by the sliding shell, so no strip shows under the browser bar) */
export const giftSlideColor = (data: Pick<GiftSlideData, 'backgroundImage' | 'pictureLayout'>) =>
  data.backgroundImage && data.pictureLayout === 'background' ? NIGHT : GIFT_PAPER
const EASE = [0.16, 1, 0.3, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.25 + i * 0.08 },
  }),
}

export function GiftSlide({ data }: { data: GiftSlideData }) {
  const ref = useRef<HTMLElement>(null)

  const bg =
    data.backgroundImage &&
    typeof data.backgroundImage === 'object' &&
    'url' in data.backgroundImage
      ? data.backgroundImage
      : null
  // Photo behind everything (light text) vs. illustration on top (dark text)
  const full = Boolean(bg) && data.pictureLayout === 'background'
  const lines = (data.bigWord?.trim() || DEFAULT_BIG_WORD).split('\n').map((l) => l.trim())
  const text = data.text?.trim() || null
  const href = data.buttonLink?.trim() || DEFAULT_LINK
  const points = (data.points ?? []).slice(0, 4)
  const cardAlt = data.cardAlt?.trim() || DEFAULT_CARD_ALT

  // Product data for search engines (Google can show name + price in results)
  const price = data.priceText?.replace(',', '.').match(/\d+(\.\d+)?/)?.[0]
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  const jsonLd = price
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: cardAlt,
        description: text ?? undefined,
        image: bg?.url ?? `${siteUrl}${VOUCHER_LAYERS.card.src}`,
        brand: { '@type': 'Brand', name: 'Fermentfreude' },
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}${href}`,
        },
      }
    : null

  const inView = useInView(ref, { once: true, amount: 0.3 })
  // Safety net: the entrance also starts once the card has (nearly) landed,
  // in case a browser misses the in-view signal inside the pinned scene
  const arrival = useArrival(ref)
  const [landed, setLanded] = useState(false)
  useMotionValueEvent(arrival, 'change', (v) => {
    if (v > 0.85 && !landed) setLanded(true)
  })
  const active = inView || landed
  const anim = (i: number) => ({
    custom: i,
    variants: fadeUp,
    initial: 'hidden' as const,
    animate: active ? ('show' as const) : ('hidden' as const),
  })

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={ref}
        // 100svh = the part of the screen a phone really shows (browser bars excluded)
        className="relative isolate flex h-svh max-h-full flex-col overflow-clip"
        style={{ backgroundColor: giftSlideColor(data), color: full ? '#F9F0DC' : INK }}
      >
        {/* Full background: the photo behind a shade, darkest at the bottom where the text sits */}
        {full && bg ? (
          <div aria-hidden className="absolute inset-0 -z-10">
            <Media
              resource={bg}
              fill
              priority
              size="100vw"
              imgClassName="object-cover object-[50%_35%]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.82) 22%, rgba(0,0,0,0.5) 58%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          </div>
        ) : null}
        <div className="container mx-auto container-padding relative flex min-h-0 flex-1 flex-col gap-6 pb-6 pt-16 md:pt-20 lg:gap-8 lg:pb-10 lg:pt-20">
          {/* No picture, or a photo behind: the big word fills the top, like a showcase slide */}
          {!bg || full ? (
            <motion.h2
              {...anim(0)}
              // On a photo: low, right above the text, so it never covers faces
              className={cn(
                'text-center font-display font-bold uppercase leading-[0.86] tracking-[-0.02em]',
                full ? 'mb-0 mt-auto' : 'my-auto',
              )}
              style={{ fontSize: 'clamp(3.5rem, 15vw, 14rem)' }}
            >
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </motion.h2>
          ) : (
            // The picture takes the top, like the big word on the showcase slides:
            // as big as the room above the text allows, never cut, never behind text
            <motion.div {...anim(0)} className="relative min-h-40 flex-1">
              <Media
                resource={bg}
                fill
                priority
                size="(min-width: 1024px) 80vw, 100vw"
                imgClassName="object-contain object-center"
              />
            </motion.div>
          )}

          {/* ── Info: centred on phone/tablet; desktop text left, points at the far right ── */}
          <div
            className={cn(
              'relative z-10 mx-auto w-full max-w-2xl shrink-0 text-center lg:mx-0 lg:max-w-none lg:text-left',
              !full && 'mt-auto',
              points.length
                ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:items-end lg:gap-x-16'
                : '',
            )}
          >
            <div className="mx-auto max-w-md lg:mx-0 lg:max-w-lg">
              {data.label ? (
                <motion.p
                  {...anim(0)}
                  className={cn(
                    'mb-0 font-display text-[11px] font-bold uppercase tracking-[0.14em]',
                    full ? 'text-ff-gold' : 'text-ff-near-black/60',
                  )}
                >
                  {data.label}
                </motion.p>
              ) : null}
              {data.headline ? (
                <motion.h3
                  {...anim(1)}
                  className="mb-0 mt-2 font-display text-2xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-3xl lg:text-[2.125rem]"
                >
                  {data.headline}
                </motion.h3>
              ) : null}
              {text ? (
                <motion.p
                  {...anim(2)}
                  className={cn(
                    'mb-0 mt-3 text-[15px] leading-[1.65] sm:text-base lg:mt-4',
                    full ? 'text-ff-ivory/75' : 'text-ff-near-black/75',
                  )}
                >
                  {text}
                </motion.p>
              ) : null}
              {data.priceText ? (
                <motion.p
                  {...anim(3)}
                  className="mb-0 mt-4 font-display text-3xl font-bold leading-none tracking-[-0.02em] lg:mt-5"
                >
                  {data.priceText}
                </motion.p>
              ) : null}
              {data.buttonLabel ? (
                <motion.div {...anim(4)} className="mt-4 lg:mt-5">
                  <Link
                    href={href}
                    className={cn(
                      'group pointer-events-auto inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full py-2.5 pl-6 pr-3 font-display text-sm font-bold transition-colors sm:w-auto',
                      // Same button as the Tempeh slide: gold on a photo, black on paper
                      full
                        ? 'bg-[#E6BE68] text-[#1A1A1A] hover:bg-[#EDD195]'
                        : 'bg-[#1D1D1D] text-white hover:bg-black',
                    )}
                  >
                    {data.buttonLabel}
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45',
                        full ? 'bg-[#1A1A1A] text-[#E6BE68]' : 'bg-white text-[#1D1D1D]',
                      )}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </Link>
                </motion.div>
              ) : null}
              {data.buttonNote ? (
                <motion.p
                  {...anim(5)}
                  className={cn(
                    'mb-0 mt-2 whitespace-pre-line text-xs leading-relaxed lg:mt-3',
                    full ? 'text-ff-ivory/60' : 'text-ff-near-black/60',
                  )}
                >
                  {data.buttonNote}
                </motion.p>
              ) : null}
            </div>

            {/* The site's points row. Very short phones: hidden, nothing gets cut */}
            {points.length ? (
              <motion.div
                {...anim(5)}
                className="mt-6 lg:mt-0 lg:self-end [@media(max-height:700px)]:hidden lg:[@media(max-height:700px)]:block"
              >
                <PointsRow
                  items={points}
                  tone={full ? 'light' : 'dark'}
                  align="center"
                  alignLg="center"
                />
              </motion.div>
            ) : null}
          </div>
        </div>

        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </section>
    </MotionConfig>
  )
}
