'use client'

import { Media } from '@/components/Media'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { RichText } from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ media, richTextLowImpact }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative flex flex-col justify-center h-svh min-h-[28rem] mb-[var(--space-section-md)]"
      data-theme="dark"
    >
      <div className="absolute inset-0 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover" priority resource={media} />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30"
          aria-hidden
        />
      </div>
      {richTextLowImpact && (
        <div className="relative z-10 mx-auto container-padding text-center">
          <RichText
            data={richTextLowImpact}
            enableGutter={false}
            className="[&_h1]:text-hero [&_h1]:text-ff-ivory [&_h1]:font-display [&_h1]:font-bold [&_h1]:drop-shadow-lg [&_h1]:tracking-tight"
          />
        </div>
      )}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce" aria-hidden>
        <span className="flex h-12 w-8 items-start justify-center rounded-full border-2 border-white/60 pt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        </span>
      </div>
    </div>
  )
}
