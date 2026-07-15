'use client'

import { Media } from '@/components/Media'
import { FadeIn } from '@/components/FadeIn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { SupportedLocale } from '@/utilities/getLocale'
import {
  buildYoutubeBackgroundEmbedUrl,
  parseYoutubeStartSeconds,
  parseYoutubeVideoId,
} from '@/utilities/youtube'
import { Volume2, VolumeX } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import type { Media as MediaType, Page } from '@/payload-types'

const DEFAULTS = {
  label: 'Press',
  heading: 'FermentFreude in the Media',
  description:
    'Press and TV coverage, awards, and expert appearances on fermentation and our workshops.',
}

const SOUND_LABELS = {
  de: { on: 'Ton einschalten', off: 'Ton stummschalten' },
  en: { on: 'Turn sound on', off: 'Mute' },
} as const

const YOUTUBE_COVER_CLASS =
  'pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0'

type HeroPressProps = Page['hero'] & { type: 'heroPress'; locale?: SupportedLocale }

function isPopulatedMedia(value: unknown): value is MediaType {
  return typeof value === 'object' && value !== null && 'url' in value
}

function isVideoMedia(value: MediaType): boolean {
  return !!value.mimeType?.toLowerCase().includes('video')
}

export const HeroPress: React.FC<HeroPressProps> = (props) => {
  const { setHeaderTheme } = useHeaderTheme()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [soundOn, setSoundOn] = useState(false)
  const {
    splitLabel,
    splitHeading,
    splitDescription,
    splitHeroVideo,
    splitMedia,
    splitMediaPoster,
    splitYoutubeUrl,
    splitYoutubeStart,
    locale = 'de',
  } = props

  const soundLabels = SOUND_LABELS[locale === 'en' ? 'en' : 'de']

  const label = splitLabel ?? DEFAULTS.label
  const heading = splitHeading ?? DEFAULTS.heading
  const description = splitDescription ?? DEFAULTS.description

  const youtubeId = splitYoutubeUrl ? parseYoutubeVideoId(splitYoutubeUrl) : null
  const youtubeStart =
    splitYoutubeStart ??
    (splitYoutubeUrl ? parseYoutubeStartSeconds(splitYoutubeUrl) : undefined) ??
    undefined

  const heroVideoMedia = useMemo(() => {
    if (isPopulatedMedia(splitHeroVideo) && isVideoMedia(splitHeroVideo)) return splitHeroVideo
    if (isPopulatedMedia(splitMedia) && isVideoMedia(splitMedia)) return splitMedia
    return null
  }, [splitHeroVideo, splitMedia])

  const hasUploadedVideo = !!heroVideoMedia
  const useYoutube = !!youtubeId && !prefersReducedMotion && !hasUploadedVideo

  const youtubeEmbedUrl = useMemo(() => {
    if (!useYoutube) return null
    return buildYoutubeBackgroundEmbedUrl(youtubeId!, {
      start: youtubeStart,
      muted: !soundOn,
    })
  }, [prefersReducedMotion, soundOn, useYoutube, youtubeId, youtubeStart])

  const isVideo = hasUploadedVideo
  const posterMedia = isPopulatedMedia(splitMediaPoster) ? splitMediaPoster : null

  const showYoutube = useYoutube && !!youtubeEmbedUrl
  const showUploadedVideo = isVideo && !prefersReducedMotion
  const showPosterOnly = prefersReducedMotion && posterMedia && (useYoutube || isVideo)
  const showStill =
    !showYoutube && !showUploadedVideo && !showPosterOnly && isPopulatedMedia(splitMedia)
  const showSoundToggle = showYoutube || showUploadedVideo

  useEffect(() => {
    setHeaderTheme('dark')
    return () => setHeaderTheme('light')
  }, [setHeaderTheme])

  const mediaClassName = 'absolute inset-0 h-full w-full object-cover object-[50%_38%]'

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative min-h-[30rem] bg-ff-near-black lg:min-h-[38rem]">
        {showYoutube || showUploadedVideo || showStill || showPosterOnly ? (
          <div className="absolute inset-0 overflow-hidden bg-black">
            {showYoutube ? (
              <iframe
                key={soundOn ? 'youtube-sound' : 'youtube-muted'}
                title=""
                src={youtubeEmbedUrl ?? undefined}
                allow="autoplay; encrypted-media; picture-in-picture"
                className={YOUTUBE_COVER_CLASS}
                tabIndex={-1}
                aria-hidden
              />
            ) : showUploadedVideo ? (
              <Media
                resource={heroVideoMedia}
                fill
                videoClassName={mediaClassName}
                videoMuted={!soundOn}
                priority
                className="absolute inset-0"
              />
            ) : (
              <Media
                resource={(showPosterOnly ? posterMedia : splitMedia) as Parameters<
                  typeof Media
                >[0]['resource']}
                fill
                imgClassName={mediaClassName}
                priority
                className="absolute inset-0"
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-ff-near-black" aria-hidden />
        )}

        <div
          className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-black/70 via-black/25 to-transparent lg:from-black/80"
          aria-hidden
        />

        {showSoundToggle ? (
          <button
            type="button"
            onClick={() => setSoundOn((on) => !on)}
            className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border border-white/25 bg-black/55 px-4 py-2.5 font-display text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-gold-accent"
            aria-pressed={soundOn}
            aria-label={soundOn ? soundLabels.off : soundLabels.on}
          >
            {soundOn ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
            <span>{soundOn ? soundLabels.off : soundLabels.on}</span>
          </button>
        ) : null}

        <div className="relative z-10 flex min-h-[30rem] items-end lg:min-h-[38rem]">
          <div className="container mx-auto container-padding pb-14 pt-28 lg:pb-20 lg:pt-32">
            <FadeIn className="content-medium max-w-3xl" delay={0} duration={1.1} from="left">
              {label ? (
                <span className="text-eyebrow font-display font-semibold tracking-[0.28em] text-ff-gold-accent">
                  {label.toUpperCase()}
                </span>
              ) : null}
              <h1 className="text-hero mt-5 font-display font-bold leading-[1.08] tracking-tight text-white">
                {heading}
              </h1>
              <div className="mt-6 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />
              {description ? (
                <p className="mt-6 max-w-2xl font-sans text-body-lg leading-relaxed text-white/80">
                  {description}
                </p>
              ) : null}
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
