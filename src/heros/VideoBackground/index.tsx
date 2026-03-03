'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useMemo } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

/** Extract Vimeo video ID from URL (vimeo.com/123 or player.vimeo.com/video/123) */
function getVimeoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const m = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)
  return m ? m[1] : null
}

type VideoBackgroundHeroProps = Page['hero'] & {
  type: 'videoBackground'
  vimeoUrl?: string | null
  videoFallbackImage?: unknown
  videoLinks?: Array<{ link: { type?: string; url?: string; label?: string; newTab?: boolean } }>
  videoRichText?: unknown
}

export const VideoBackgroundHero: React.FC<VideoBackgroundHeroProps> = ({
  videoLinks,
  videoFallbackImage,
  videoRichText,
  vimeoUrl,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const vimeoId = useMemo(() => getVimeoId(vimeoUrl), [vimeoUrl])

  useEffect(() => {
    setHeaderTheme('dark')
  })

  const embedSrc = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&quality=720p`
    : null

  return (
    <div className="relative flex flex-col text-white h-svh overflow-hidden" data-theme="dark">
      {/* Video background — fullscreen, behind content */}
      <div className="absolute inset-0 select-none">
        {embedSrc ? (
          <iframe
            src={embedSrc}
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
            style={{
              aspectRatio: '16/9',
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.78vh',
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Hero background video"
          />
        ) : null}
        {/* Fallback image when no video */}
        {videoFallbackImage && typeof videoFallbackImage === 'object' && !embedSrc && (
          <Media fill imgClassName="object-cover" priority resource={videoFallbackImage} />
        )}
        {!embedSrc && !(videoFallbackImage && typeof videoFallbackImage === 'object') && (
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}
      </div>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"
        aria-hidden
      />

      {/* Content — bottom third, like Slider Revolution template */}
      <div className="flex-1" />
      <div className="container z-10 relative pb-12 md:pb-16 lg:pb-20">
        <div className="content-narrow [&_h1]:text-hero [&_h1]:text-white [&_h2]:text-subheading [&_h2]:text-white/90 [&_p]:text-body-sm [&_p]:leading-relaxed [&_p]:text-white/80">
          {videoRichText && (
            <RichText
              className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              data={videoRichText}
              enableGutter={false}
            />
          )}
          {Array.isArray(videoLinks) && videoLinks.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {videoLinks.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
