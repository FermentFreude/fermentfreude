/**
 * FeldInsGlas - Feld ins Glas body
 * Order: intro, 3-section path, Feld/Kueche/Glas, included, booking bridge
 */

import { ChefHat, Sprout } from 'lucide-react'
import type { LucideIcon, LucideProps } from 'lucide-react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import type { FeldInsGlasCopy } from './data'

/** Simple mason-jar mark — Lucide has no jar icon */
function JarIcon({ className, strokeWidth = 1.5, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M8 3h8" />
      <path d="M9 3v2.2a1 1 0 0 0 .2.6L10 7h4l.8-1.2a1 1 0 0 0 .2-.6V3" />
      <rect x="7" y="7" width="10" height="14" rx="2.5" />
      <path d="M9.5 11h5" />
    </svg>
  )
}

const JOURNEY_ICONS: Array<LucideIcon | typeof JarIcon> = [Sprout, ChefHat, JarIcon]

/** Figma second section — Das Konzept */
function ConceptSection({
  copy,
  image,
}: {
  copy: FeldInsGlasCopy
  image?: MediaType | null
}) {
  const hasImage = image && typeof image === 'object' && 'url' in image

  return (
    <section id="konzept" className="bg-[#FFFEF9]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#E6BE68]">
            {copy.storyEyebrow}
          </p>
          <h2
            className="mt-5 font-display font-medium tracking-[-0.03em] text-[#1A1A1A]"
            style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.65rem)', lineHeight: 1.15 }}
          >
            {copy.storyTitle}
          </h2>

          <blockquote className="mt-8 border-l-2 border-[#E6BE68] pl-5">
            <p className="font-sans text-body italic leading-relaxed text-[#5A5A5A]">
              {copy.storyQuote}
            </p>
          </blockquote>

          <div className="mt-8 space-y-5 text-body leading-relaxed text-[#4B4B4B]">
            <p>{copy.storyText}</p>
            <p>{copy.storyTextSecondary}</p>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#ECE5DE] max-lg:max-h-[32rem]">
          {hasImage ? (
            <Media resource={image} fill imgClassName="object-cover" />
          ) : null}
          <div className="absolute bottom-0 left-0 bg-[#1A1A1A] px-5 py-4 text-center">
            <p className="font-display text-[1.15rem] font-medium leading-none tracking-tight text-[#E6BE68]">
              {copy.storySeasonMonths}
            </p>
            <p className="mt-2 font-display text-[9px] font-bold uppercase tracking-[0.22em] text-[#E6BE68]">
              {copy.storySeasonLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Special 3-section: 01 Feld · 02 Küche · 03 Glas */
function JourneyPath({ copy }: { copy: FeldInsGlasCopy }) {
  const steps = copy.journeySections

  return (
    <section id="journey" className="bg-[#1A1A1A]">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-10 sm:px-10 md:flex-row md:justify-center md:gap-10">
        {steps.map((step, i) => {
          const Icon = JOURNEY_ICONS[i] ?? Sprout

          return (
            <div key={step.label} className="flex items-center gap-10">
              <a
                href={`#section-${step.label}`}
                className="group flex flex-col items-center gap-3 font-display text-[#F9F0DC] transition-opacity hover:opacity-70"
              >
                <Icon
                  className="size-5 text-[#E6BE68] transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="flex items-baseline gap-3">
                  <span className="text-[10px] font-bold tabular-nums tracking-[0.2em] text-[#E6BE68]">
                    {step.label}
                  </span>
                  <span className="text-[13px] font-bold uppercase tracking-[0.18em]">
                    {step.name ?? step.title}
                  </span>
                </span>
              </a>
              {i < steps.length - 1 ? (
                <span className="hidden h-px w-8 bg-[#E6BE68]/40 md:block" aria-hidden="true" />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Figma sections 4–6 — Feld / Küche / Glas */
function JourneyPhases({
  copy,
  images,
}: {
  copy: FeldInsGlasCopy
  images: Array<MediaType | null | undefined>
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6 sm:px-10 lg:py-10">
        {copy.journeySections.map((section, i) => {
          const reverse = i % 2 === 1
          const image = images[i]
          const hasImage = image && typeof image === 'object' && 'url' in image

          return (
            <article
              key={section.label}
              id={`section-${section.label}`}
              className="scroll-mt-24 py-12 lg:py-16"
            >
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#ECE5DE] lg:aspect-[5/4]">
                  {hasImage ? (
                    <Media resource={image} fill imgClassName="object-cover" />
                  ) : null}
                </div>

                <div className="max-w-lg">
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#E6BE68]">
                    {section.label} · {section.name ?? section.title}
                  </p>
                  <h3
                    className="mt-4 font-display font-medium tracking-[-0.025em] text-[#1A1A1A]"
                    style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.15rem)', lineHeight: 1.15 }}
                  >
                    {section.title}
                  </h3>
                  <p className="mt-5 text-body leading-relaxed text-[#4B4B4B]">
                    {section.description}
                  </p>

                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="mt-8 space-y-4">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-4">
                          <span
                            className="h-px w-6 shrink-0 bg-[#E6BE68]"
                            aria-hidden
                          />
                          <span className="text-body-sm leading-snug text-[#1A1A1A]">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function FeldInsGlasExperience({
  copy,
  images,
}: {
  copy: FeldInsGlasCopy
  locale: 'de' | 'en'
  images: {
    hero?: MediaType | null
    hands?: MediaType | null
    jars?: MediaType | null
    konzept?: MediaType | null
    feld?: MediaType | null
    kueche?: MediaType | null
    glas?: MediaType | null
  }
}) {
  const sectionImages = [
    images.feld ?? images.hands,
    images.kueche ?? images.hands ?? images.konzept,
    images.glas ?? images.jars,
  ]

  return (
    <>
      <ConceptSection
        copy={copy}
        image={images.konzept ?? images.hands ?? images.jars}
      />

      <JourneyPath copy={copy} />

      <JourneyPhases copy={copy} images={sectionImages} />
    </>
  )
}
