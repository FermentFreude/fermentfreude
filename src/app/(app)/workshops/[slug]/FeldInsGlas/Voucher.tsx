'use client'

/**
 * FeldInsGlas gift/voucher — white text card overlaid on full-bleed photo.
 */

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import type { LaktoVoucherCMS } from '../LaktoVoucherCta'

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

const COPY = {
  de: {
    eyebrow: 'Geschenk',
    title: 'Verschenke Fermentation als Erlebnis.',
    description:
      'Ein FermentFreude-Gutschein für „Vom Feld ins Glas“ — für Menschen, die mehr suchen als ein Kochbuch. Schöner verpackt, per Post oder digital, mit persönlicher Widmung.',
    primaryLabel: 'Gutschein bestellen',
    secondaryLabel: 'Zum Shop',
    imageQuote: '„Das schönste Geschenk ist Zeit — im Garten.“',
    bullets: [
      'Einlösbar für alle Termine 2025',
      'Kostenloser Versand (gedruckt)',
      'Mit persönlicher Botschaft',
      'Auch als PDF zum Sofortversand',
    ],
  },
  en: {
    eyebrow: 'Gift',
    title: 'Gift fermentation as an experience.',
    description:
      'A FermentFreude voucher for “Vom Feld ins Glas” — for people who want more than a cookbook. Beautifully packed, by post or digital, with a personal dedication.',
    primaryLabel: 'Order voucher',
    secondaryLabel: 'To the shop',
    imageQuote: '“The most beautiful gift is time — in the garden.”',
    bullets: [
      'Valid for all 2025 dates',
      'Free shipping (printed)',
      'With a personal message',
      'Also as PDF for instant delivery',
    ],
  },
} as const

export function FeldInsGlasVoucher({
  cms,
  locale = 'de',
  image,
}: {
  cms?: LaktoVoucherCMS
  locale?: 'de' | 'en'
  image?: MediaType | string | null
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const defaults = COPY[locale]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const primaryHref =
    cms?.primaryHref === '/voucher'
      ? '/workshops/voucher'
      : (cms?.primaryHref ?? '/workshops/voucher')

  const photo = isResolvedMedia(image)
    ? image
    : isResolvedMedia(cms?.backgroundImage)
      ? cms!.backgroundImage
      : null

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[34rem] overflow-hidden bg-[#1A1A1A] sm:min-h-[38rem] lg:min-h-[42rem]"
    >
      {/* Full-bleed background photo */}
      <div className="absolute inset-0">
        {photo ? (
          <Media resource={photo} fill imgClassName="object-cover object-center" />
        ) : (
          <div className="absolute inset-0 bg-[#2A2A28]" />
        )}
        <div
          className="absolute inset-0 bg-linear-to-r from-black/45 via-black/15 to-transparent max-lg:from-black/50 max-lg:via-black/30"
          aria-hidden
        />
      </div>

      {/* Quote on the photo (right / bottom area on desktop) */}
      <div className="pointer-events-none absolute bottom-8 right-6 z-[1] hidden max-w-xs lg:bottom-12 lg:right-12 lg:block xl:right-16">
        <p className="font-display text-[1.15rem] font-medium leading-snug text-white">
          {defaults.imageQuote}
        </p>
        <span className="mt-3 block h-px w-10 bg-[#E6BE68]" aria-hidden />
      </div>

      {/* White text box sitting on top of the background */}
      <div className="relative z-10 flex min-h-[34rem] items-center px-6 py-12 sm:min-h-[38rem] sm:px-10 lg:min-h-[42rem] lg:px-14 xl:px-20">
        <div
          className={`w-full max-w-md bg-white px-7 py-9 transition-all duration-700 sm:max-w-lg sm:px-9 sm:py-10 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#E6BE68]">
            {defaults.eyebrow}
          </p>
          <h2
            className="mt-4 font-display font-medium tracking-[-0.03em] text-[#1A1A1A]"
            style={{ fontSize: 'clamp(1.55rem, 2.6vw, 2.15rem)', lineHeight: 1.15 }}
          >
            {defaults.title}
          </h2>

          <p className="mt-5 text-body leading-relaxed text-[#4B4B4B]">{defaults.description}</p>

          <ul className="mt-7 space-y-3.5">
            {defaults.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-4">
                <span className="h-px w-6 shrink-0 bg-[#E6BE68]" aria-hidden />
                <span className="text-body-sm leading-snug text-[#1A1A1A]">{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] px-8 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#E6BE68] hover:text-[#1A1A1A]"
            >
              {defaults.primaryLabel}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/shop"
              className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A]/55 underline decoration-[#E6BE68]/50 underline-offset-6 transition-colors hover:text-[#1A1A1A] hover:decoration-[#E6BE68]"
            >
              {defaults.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile quote under the card */}
      <div className="relative z-10 px-6 pb-10 lg:hidden">
        <p className="max-w-xs font-display text-[1.05rem] font-medium leading-snug text-white">
          {defaults.imageQuote}
        </p>
        <span className="mt-3 block h-px w-10 bg-[#E6BE68]" aria-hidden />
      </div>
    </section>
  )
}
