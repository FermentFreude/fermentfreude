'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import React, { useEffect } from 'react'

import './gastronomy.css'

function isResolvedMedia(img: unknown): img is { url?: string; alt?: string } {
  if (typeof img !== 'object' || img === null || !('url' in img)) return false
  const url = String((img as { url?: string }).url ?? '').trim()
  return Boolean(url) && !/\/null(?:\?|$)/.test(url)
}

type Props = {
  image?: unknown
  eyebrow?: string | null
  title: string
  tagline?: string
  ctaLabel: string
  ctaUrl: string
  secondaryLabel?: string | null
  secondaryUrl?: string | null
}

export function GastronomyHero({
  image,
  eyebrow,
  title,
  tagline,
  ctaLabel,
  ctaUrl,
  secondaryLabel,
  secondaryUrl,
}: Props) {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme('dark')
    return () => setHeaderTheme(undefined)
  }, [setHeaderTheme])

  const cms = isResolvedMedia(image) ? image : null

  return (
    <section
      id="gastronomy-hero"
      className="relative w-full overflow-hidden bg-ff-near-black"
      data-theme="dark"
    >
      <div className="relative min-h-[78svh] md:min-h-[88svh]">
        <div className="absolute inset-0">
          {cms ? (
            <Media
              resource={cms as never}
              fill
              priority
              imgClassName="object-cover object-[48%_68%]"
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
              'linear-gradient(90deg, rgba(18,16,15,0.72) 0%, rgba(18,16,15,0.32) 46%, rgba(18,16,15,0.12) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(18,16,15,0.55) 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 z-10 pb-12 md:pb-16">
          <div className="container mx-auto container-padding">
            <div className="max-w-2xl">
              {eyebrow?.trim() ? (
                <p className="gastronomy-hero-copy mb-3 font-display text-caption font-bold uppercase tracking-[0.18em] text-ff-gold">
                  {eyebrow.trim()}
                </p>
              ) : null}
              <h1 className="gastronomy-hero-copy font-display font-bold text-hero tracking-tight text-white leading-[1.06]">
                {title}
              </h1>
              {tagline ? (
                <p className="gastronomy-hero-copy mt-4 max-w-lg text-body-lg text-white/88">
                  {tagline}
                </p>
              ) : null}
              <div className="mt-8 flex w-full flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
                <Link
                  href={ctaUrl}
                  className="inline-flex w-full items-center justify-center rounded-full bg-ff-gold px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#1b1b1b] transition-transform hover:scale-[1.03] hover:bg-[#EDD195] active:scale-[0.97] md:w-auto"
                >
                  {ctaLabel}
                </Link>
                {secondaryLabel && secondaryUrl ? (
                  <Link
                    href={secondaryUrl}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/55 bg-white/10 px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-transform hover:scale-[1.03] hover:bg-white/18 active:scale-[0.97] md:w-auto"
                  >
                    {secondaryLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
