'use client'

import { FadeIn } from '@/components/FadeIn'
import React from 'react'

export function FoodPdpSectionGroup({
  id,
  title,
  description,
  children,
  isFirst = false,
}: {
  id?: string
  title: string
  description?: string
  children: React.ReactNode
  isFirst?: boolean
}) {
  return (
    <FadeIn>
      <section
        id={id}
        className={
          isFirst
            ? 'scroll-mt-[calc(var(--header-height,5rem)+1.5rem)]'
            : 'scroll-mt-[calc(var(--header-height,5rem)+1.5rem)] border-t border-ff-near-black/10 pt-12 lg:pt-14'
        }
      >
        <header className="mb-8">
          <h2 className="flex items-center gap-3 font-display text-body-lg font-bold text-ff-near-black">
            <span className="size-2 shrink-0 rounded-full bg-ff-gold-accent" aria-hidden />
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-ff-gray-text">
              {description}
            </p>
          )}
        </header>
        <div className="flex flex-col gap-8">{children}</div>
      </section>
    </FadeIn>
  )
}
