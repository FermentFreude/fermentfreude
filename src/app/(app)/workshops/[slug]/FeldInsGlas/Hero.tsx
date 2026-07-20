'use client'

/**
 * FeldInsGlas hero — Figma Make layout:
 * wheat full-bleed, two-line title (medium weight), CTAs, spinning seal.
 */

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useEffect, useState } from 'react'
import type { FeldInsGlasCopy } from './data'
import { EditionSeal } from './EditionSeal'

export function FeldInsGlasHero({
  copy,
  image,
}: {
  copy: FeldInsGlasCopy
  image?: MediaType | null
}) {
  const [on, setOn] = useState(false)
  const hasImage = Boolean(image && typeof image === 'object' && 'url' in image)

  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const scrollToBooking = () => {
    document.getElementById('buchen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToStory = () => {
    document.getElementById('konzept')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative flex min-h-svh w-full flex-col justify-end overflow-hidden bg-[#2A1F14]">
      <div className="absolute inset-0">
        {hasImage ? (
          <Media
            resource={image!}
            fill
            priority
            imgClassName={`object-cover object-center transition-transform duration-[2.4s] ease-out ${
              on ? 'scale-100' : 'scale-110'
            }`}
          />
        ) : (
          <div className="absolute inset-0 bg-[#3D2A1C]" />
        )}
        {/* Light wash — keep warm wheat tones visible like Figma */}
        <div
          className="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-black/25"
          aria-hidden
        />
      </div>

      <div
        className={`absolute right-5 top-28 z-10 sm:right-8 lg:right-14 lg:top-32 xl:right-20 ${
          on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        } transition-all duration-700`}
        style={{ transitionDelay: '380ms' }}
      >
        <EditionSeal ringText={copy.sealRingText} size={148} />
      </div>

      <div className="relative z-10 max-w-3xl px-6 pb-16 pt-32 sm:px-10 lg:px-16 lg:pb-24 xl:px-24">
        {/* Two-line title — medium weight like Figma, not heavy black */}
        <h1
          className={`font-display font-medium tracking-[-0.035em] text-white transition-all duration-700 ${
            on ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{
            fontSize: 'clamp(2.75rem, 7.5vw, 5.5rem)',
            lineHeight: 1.02,
            transitionDelay: '90ms',
          }}
        >
          {copy.titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <p
          className={`mt-6 max-w-xl text-body leading-relaxed text-white/90 transition-all duration-700 sm:text-body-lg ${
            on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '180ms' }}
        >
          {copy.heroSubline}
        </p>

        <div
          className={`mt-10 flex flex-col items-start gap-4 transition-all duration-700 sm:flex-row sm:items-center sm:gap-8 ${
            on ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '280ms' }}
        >
          <button
            type="button"
            onClick={scrollToBooking}
            className="inline-flex items-center gap-2 bg-[#E6BE68] px-8 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] transition-colors hover:bg-[#F0D08A]"
          >
            {copy.ctaLabel}
            <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            onClick={scrollToStory}
            className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70"
          >
            {copy.secondaryCtaLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
