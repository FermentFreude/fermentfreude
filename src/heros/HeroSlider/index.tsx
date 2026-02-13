'use client'

import { RichText } from '@/components/RichText'
import type { Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS
 *  Shows immediately without any CMS setup.
 *  CMS data always wins when available.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_HEADING = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Gutes Essen',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Bessere Gesundheit',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Echte Freude',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Wir machen Fermentation zugänglich & freudvoll — für bessere Darmgesundheit durch Geschmack, Bildung und handgemachte Lebensmittel.',
            version: 1,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

const DEFAULT_EYEBROW_DE = 'Fermentation für alle'
const DEFAULT_EYEBROW_EN = 'Fermentation for everyone'

const DEFAULT_LINKS = [
  {
    link: {
      type: 'custom' as const,
      label: 'Shop',
      url: '/shop',
      appearance: 'default' as const,
    },
  },
  {
    link: {
      type: 'custom' as const,
      label: 'Workshops',
      url: '/workshops',
      appearance: 'outline' as const,
    },
  },
]

/* ═══════════════════════════════════════════════════════════════ */

type HeroSliderProps = Page['hero']

/** Resolve a Payload CMS link object to an href string. */
function resolveHref(link: Record<string, unknown>): string {
  if (link?.type === 'reference' && typeof link?.reference === 'object' && link.reference) {
    const ref = link.reference as { relationTo?: string; value?: { slug?: string } | string }
    const slug = typeof ref.value === 'object' ? ref.value?.slug : ref.value
    if (slug) {
      return `${ref.relationTo !== 'pages' ? `/${ref.relationTo}` : ''}/${slug}`
    }
  }
  return (link?.url as string) || '#'
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ links, richText, eyebrow }) => {
  const { setHeaderTheme } = useHeaderTheme()

  /* ── Merge CMS data with defaults ──────────────────────────── */
  const resolvedEyebrow = eyebrow ?? DEFAULT_EYEBROW_DE
  const resolvedRichText = richText ?? DEFAULT_HEADING
  const resolvedLinks = links && links.length > 0 ? links : DEFAULT_LINKS

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section className="relative w-full h-[85vh] md:h-[80vh] overflow-hidden">
      {/* ──── Fullscreen GIF background ───────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/tempeh-hero.gif"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ──── Gradient overlay — adapts to theme ─────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent dark:from-black/90 dark:via-black/50 dark:to-black/20" />

      {/* ──── Content — bottom-left aligned on all screens ────── */}
      <div className="relative z-10 flex items-end h-full">
        <div className="w-full px-6 md:px-10 lg:px-14 xl:px-20 pb-10 md:pb-12 lg:pb-16">
          <div className="max-w-xl flex flex-col gap-4 lg:gap-5">
            {/* Eyebrow tag */}
            {resolvedEyebrow && (
              <span className="font-sans text-[10px] sm:text-xs uppercase tracking-widest text-white/60 dark:text-white/50">
                {resolvedEyebrow}
              </span>
            )}

            {resolvedRichText && (
              <RichText
                className={cn(
                  '[&_h1]:font-display [&_h1]:font-bold [&_h1]:leading-[1.08] [&_h1]:tracking-tight',
                  '[&_h1]:text-2xl sm:[&_h1]:text-3xl md:[&_h1]:text-4xl lg:[&_h1]:text-5xl',
                  '[&_h1]:text-white',
                  '[&_p]:font-sans [&_p]:text-white/70 dark:[&_p]:text-white/60',
                  '[&_p]:text-xs sm:[&_p]:text-sm lg:[&_p]:text-base',
                  '[&_p]:leading-relaxed [&_p]:max-w-[44ch]',
                  '[&_p]:mt-2 lg:[&_p]:mt-3',
                )}
                data={resolvedRichText}
                enableGutter={false}
                enableProse={false}
              />
            )}

            {resolvedLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {resolvedLinks.map(({ link }, i) => {
                  const href = resolveHref(link as unknown as Record<string, unknown>)
                  return (
                    <Link
                      key={i}
                      href={href}
                      className={cn(
                        'inline-flex items-center justify-center font-display font-bold',
                        'transition-all duration-300 ease-out',
                        i === 0
                          ? 'rounded-full bg-white text-ff-near-black px-6 py-2.5 text-xs sm:px-7 sm:py-3 sm:text-sm hover:bg-ff-ivory hover:scale-105 dark:bg-ff-ivory dark:text-ff-near-black dark:hover:bg-white'
                          : 'group text-white/80 hover:text-white text-xs sm:text-sm dark:text-white/70 dark:hover:text-white',
                      )}
                    >
                      {(link as { label?: string })?.label}
                      {i !== 0 && (
                        <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
