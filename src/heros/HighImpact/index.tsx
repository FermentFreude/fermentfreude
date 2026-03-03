'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  const mediaObj = media && typeof media === 'object' ? media : null
  const imageUrl =
    mediaObj && typeof mediaObj === 'object' && 'url' in mediaObj && typeof mediaObj.url === 'string'
      ? mediaObj.url
      : null

  return (
    <div className="relative flex flex-col text-white h-svh" data-theme="dark">
      {/* Background — use native img for reliable loading, fallback to Media then solid */}
      <div className="absolute inset-0 select-none">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={typeof mediaObj?.alt === 'string' ? mediaObj.alt : 'Hero banner'}
            className="absolute inset-0 size-full object-cover"
            fetchPriority="high"
          />
        ) : mediaObj ? (
          <Media fill imgClassName="object-cover" priority resource={mediaObj} />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden />
        )}
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
          aria-hidden
        />
      </div>

      {/* Spacer — pushes content to the bottom third of the screen */}
      <div className="flex-1" />

      <div className="container z-10 relative pb-12 md:pb-16 lg:pb-20">
        <div className="content-narrow mx-auto text-center [&_h1]:text-hero [&_h1]:text-white [&_p]:text-body-sm [&_p]:leading-relaxed [&_p]:text-white/80">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
