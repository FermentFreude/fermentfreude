'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, PressBannerBlock as PressBannerBlockType } from '@/payload-types'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

const DEFAULTS = {
  eyebrow: 'Press & Media',
  heading: 'As seen in press & TV',
  description: 'Reports, awards, and TV appearances around fermentation and field-bean tempeh.',
  ctaLabel: 'All press coverage',
  ctaLink: '/presse',
  slides: [
    {
      outlet: 'Kleine Zeitung',
      quote:
        'From Food Masterclass participants to co-founders — building fermented foods from Styrian field beans.',
      linkLabel: 'Read article',
      url: 'https://www.kleinezeitung.at/artikel/20140608/aromen-aufstriche-alkoholfreier-gin-innovationen-auf-dem-teller-und-im',
    },
    {
      outlet: 'kanal3',
      quote:
        'On regional TV: how microorganisms transform food — and why fermentation opens new flavours.',
      linkLabel: 'Watch segment',
      url: 'https://www.kanal3.tv/?cid=15&vid=13957',
    },
    {
      outlet: 'Junge Wirtschaft Steiermark',
      quote: 'Second place at the Elevator Pitch — 90 seconds for regional ingredients and food innovation.',
      linkLabel: 'Read more',
      url: 'https://www.meinbezirk.at/graz/c-wirtschaft/vier-junge-unternehmen-ueberzeugten-beim-elevator-pitch_a7820501',
    },
  ],
}

type Props = PressBannerBlockType & { id?: string }

type Slide = NonNullable<PressBannerBlockType['slides']>[number]

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

export const PressBannerBlock: React.FC<Props> = ({
  visible,
  eyebrow,
  heading,
  description,
  ctaLabel,
  ctaLink,
  autoplay,
  slides,
  id,
}) => {
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedCtaLabel = ctaLabel ?? DEFAULTS.ctaLabel
  const resolvedCtaLink = ctaLink ?? DEFAULTS.ctaLink
  const shouldAutoplay = autoplay !== false

  const resolvedSlides: Slide[] =
    Array.isArray(slides) && slides.length > 0
      ? slides
      : (DEFAULTS.slides as unknown as Slide[])

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = resolvedSlides.length

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count)
    },
    [count],
  )

  const next = useCallback(() => goTo(active + 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])

  useEffect(() => {
    if (!shouldAutoplay || paused || count <= 1) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % count)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [shouldAutoplay, paused, count])

  if (visible === false) return null

  const current = resolvedSlides[active]
  if (!current) return null

  const slideUrl = current.url?.trim() || undefined
  const slideLinkLabel = current.linkLabel ?? DEFAULTS.slides[0]?.linkLabel ?? 'Read more'

  return (
    <section
      id={id ?? undefined}
      className="block-press-banner section-padding-md bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={resolvedHeading}
    >
      <div className="container mx-auto container-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-(--content-wide) mx-auto">
          {/* Left — heading / CTA */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {resolvedEyebrow ? (
              <p className="text-eyebrow text-ff-gold-accent tracking-[0.18em]">{resolvedEyebrow}</p>
            ) : null}
            <h2 className="text-section-heading font-display font-bold text-ff-near-black">
              {resolvedHeading}
            </h2>
            {resolvedDescription ? (
              <p className="text-body-lg text-ff-near-black/70 max-w-md">{resolvedDescription}</p>
            ) : null}
            {resolvedCtaLabel && resolvedCtaLink ? (
              <div className="pt-1">
                <Link
                  href={resolvedCtaLink}
                  className="inline-flex items-center gap-2 font-display font-bold text-ff-near-black border-b-2 border-ff-gold-accent pb-0.5 hover:opacity-80 transition-opacity"
                >
                  {resolvedCtaLabel}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Right — slide panel */}
          <div className="lg:col-span-7 relative">
            <div
              className="relative min-h-[14rem] md:min-h-[16rem] bg-ff-warm-gray/55 border border-ff-border-light px-6 py-8 md:px-10 md:py-10"
              aria-live="polite"
              aria-atomic="true"
            >
              {resolvedSlides.map((slide, index) => {
                const isActive = index === active
                const logo = slide.logo

                return (
                  <div
                    key={slide.id ?? `${slide.outlet}-${index}`}
                    className={`transition-all duration-500 ease-out ${
                      isActive
                        ? 'relative opacity-100 translate-x-0'
                        : 'absolute inset-0 opacity-0 pointer-events-none translate-x-4'
                    }`}
                    aria-hidden={!isActive}
                  >
                    <div className="flex flex-col gap-5 h-full justify-between">
                      <div className="flex items-center gap-4 min-h-10">
                        <div className="relative h-8 w-28 shrink-0">
                          {isResolvedMedia(logo) ? (
                            <Media
                              resource={logo}
                              imgClassName="object-contain object-left w-full h-full"
                              className="absolute inset-0"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#ECE5DE]" />
                          )}
                        </div>
                        {slide.outlet ? (
                          <p className="label-uppercase text-ff-near-black/50">{slide.outlet}</p>
                        ) : null}
                      </div>

                      <blockquote className="font-display text-subheading font-bold text-ff-near-black leading-snug max-w-xl">
                        “{slide.quote}”
                      </blockquote>

                      {slideUrl ? (
                        <a
                          href={slideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-body-sm font-display font-bold text-ff-near-black/80 hover:text-ff-near-black transition-colors w-fit"
                        >
                          {slideLinkLabel}
                          <span aria-hidden>↗</span>
                        </a>
                      ) : (
                        <span className="h-5" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {count > 1 ? (
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2" role="tablist" aria-label="Press slides">
                  {resolvedSlides.map((slide, index) => (
                    <button
                      key={slide.id ?? `dot-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={index === active}
                      aria-label={`${slide.outlet ?? 'Slide'} ${index + 1}`}
                      onClick={() => goTo(index)}
                      className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ff-near-black/40 ${
                        index === active
                          ? 'w-7 bg-ff-near-black'
                          : 'w-2 bg-ff-near-black/25 hover:bg-ff-near-black/45'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous press slide"
                    className="h-10 w-10 border border-ff-near-black/20 text-ff-near-black hover:bg-ff-near-black hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ff-near-black/40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next press slide"
                    className="h-10 w-10 border border-ff-near-black/20 text-ff-near-black hover:bg-ff-near-black hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ff-near-black/40"
                  >
                    →
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
