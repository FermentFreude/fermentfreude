'use client'

import Link from 'next/link'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

export type TempehVoucherCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
  pills?: Array<{ text?: string | null }> | null
  backgroundImage?: MediaType | string | null
}

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export function TempehVoucherCta({ cms }: { cms?: TempehVoucherCMS }) {
  const eyebrow = cms?.eyebrow ?? 'GEMEINSAM FERMENTIEREN'
  const title = cms?.title ?? 'Schenke ein Tempeh-Abenteuer'
  const description =
    cms?.description ??
    'Schenke jemandem ein besonderes Erlebnis — unsere Gutscheine sind das perfekte Geschenk für Feinschmecker und gesundheitsbewusste Freunde.'
  const primaryLabel = cms?.primaryLabel ?? 'Gutschein kaufen'
  const primaryHref = cms?.primaryHref ?? '/voucher'
  const secondaryLabel = cms?.secondaryLabel ?? 'Zum Shop'
  const secondaryHref = cms?.secondaryHref ?? '/shop'
  const pills =
    (cms?.pills?.length ?? 0) > 0
      ? cms!.pills!.map((p) => p.text ?? '').filter(Boolean)
      : ['Sofort einlösbar', 'Für alle Workshops', 'Digital oder gedruckt']

  const hasBackgroundImage = isResolvedMedia(cms?.backgroundImage)

  return (
    <section className="section-padding-lg">
      {/* ── With Background Image ── */}
      {hasBackgroundImage ? (
        <div className="overflow-hidden rounded-lg">
          <div className="relative aspect-4/3 md:aspect-21/9 md:min-h-72 w-full">
            <Media
              resource={cms.backgroundImage as MediaType}
              fill
              imgClassName="object-cover blur-[2px]"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex items-center justify-center px-6 py-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-4 font-display text-caption font-bold uppercase tracking-[0.25em] text-white/80">
                  {eyebrow}
                </p>
                <h2 className="font-display text-display font-bold tracking-tight text-white">
                  {title}
                </h2>
                <p className="mx-auto mt-5 max-w-lg text-body-lg leading-relaxed text-white/90">
                  {description}
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href={primaryHref}
                    className="inline-flex items-center justify-center rounded-full bg-white px-10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-[#1A1510] transition-all hover:bg-white/90"
                  >
                    {primaryLabel}
                  </Link>
                  <Link
                    href={secondaryHref}
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-all hover:border-white"
                  >
                    {secondaryLabel}
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  {pills.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/25 bg-white/10 px-5 py-2 font-display text-caption font-semibold uppercase tracking-wide text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Without Background Image (Fallback) ── */
        <div className="rounded-lg px-6 py-12 md:py-16" style={{ backgroundColor: '#F6F3F0' }}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-display text-caption font-bold uppercase tracking-[0.25em] text-[#555954]/60">
              {eyebrow}
            </p>
            <h2 className="font-display text-display font-bold tracking-tight text-ff-near-black">
              {title}
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-body-lg leading-relaxed text-ff-gray-text">
              {description}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-[#555954] px-10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#3c3c3c]"
              >
                {primaryLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border-2 border-[#555954]/30 px-10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-[#555954] transition-all hover:border-[#555954]"
              >
                {secondaryLabel}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {pills.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#555954]/15 bg-white/60 px-5 py-2 font-display text-caption font-semibold uppercase tracking-wide text-ff-gray-text"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
