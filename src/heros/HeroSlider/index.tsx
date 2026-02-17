'use client'

import { PrimaryLogo } from '@/components/icons'
import { RichText } from '@/components/RichText'
import type { Page } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS (English)
 *  Shows immediately without any CMS setup.
 *  CMS data always wins when available.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_RICHTEXT = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag: 'h1',
        children: [
          {
            type: 'text',
            text: 'Learn with us',
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
            text: 'Create your own flavour at home',
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
            text: 'We create fermented foods and share the knowledge behind them. Through workshops, products, and education, we make fermentation accessible and enjoyable.',
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

const DEFAULT_LINKS = [
  {
    link: {
      type: 'custom' as const,
      label: 'Discover More',
      url: '/about',
      appearance: 'default' as const,
    },
  },
]

const DEFAULT_SOCIAL_LINKS = [
  { platform: 'facebook', url: 'https://facebook.com/fermentfreude' },
  { platform: 'twitter', url: 'https://twitter.com/fermentfreude' },
  { platform: 'pinterest', url: 'https://pinterest.com/fermentfreude' },
  { platform: 'youtube', url: 'https://youtube.com/@fermentfreude' },
]

/** SVG path data for each social platform icon (24×24 viewBox) */
const SOCIAL_ICON_PATHS: Record<string, string> = {
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  twitter:
    'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z',
  pinterest:
    'M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.9 6.4 9.3-.1-.8-.2-2 0-2.9.2-.8 1.2-5 1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.8 0-4.5 2.1-4.5 4.3 0 .9.3 1.8.7 2.3a.3.3 0 0 1 .1.3l-.3 1.1c0 .2-.1.2-.3.1-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.6-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.4-2.2 6.2-5.2 6.2-1 0-2-.5-2.3-1.1l-.6 2.4c-.2.9-.8 2-1.2 2.6.9.3 1.9.4 3 .4 5.5 0 10-4.5 10-10S17.5 2 12 2z',
  youtube:
    'M19.6 3.2c-3.6-.2-11.6-.2-15.2 0C.5 3.5 0 5.8 0 12s.5 8.5 4.4 8.8c3.6.2 11.6.2 15.2 0C23.5 20.5 24 18.2 24 12s-.5-8.5-4.4-8.8zM9 16V8l8 4-8 4z',
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8 0-3.2 0-3.6.1-4.9.1-3.2 1.7-4.8 4.9-4.9 1.3 0 1.6 0 4.8 0zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.3.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.3.1-1.7.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z',
  tiktok:
    'M12.5 0c1.3 0 2.6 0 3.9 0 .1 1.5.6 3.1 1.8 4.2 1.1 1.1 2.7 1.6 4.2 1.8v4c-1.4 0-2.9-.3-4.2-1-.6-.3-1.1-.6-1.6-.9 0 2.9 0 5.8 0 8.8-.1 1.4-.5 2.8-1.4 3.9-1.3 1.9-3.6 3.2-5.9 3.2-1.4.1-2.9-.3-4.1-1-2-1.2-3.4-3.4-3.6-5.7 0-.5 0-1 0-1.5.2-1.9 1.1-3.7 2.6-5 1.7-1.4 4-2.1 6.2-1.7 0 1.5 0 3 0 4.4-1-.3-2.2-.2-3 .4-.6.4-1.1 1-1.4 1.8-.2.5-.2 1.1-.1 1.6.2 1.6 1.8 3 3.5 2.9 1.1 0 2.2-.7 2.8-1.6.2-.3.4-.7.4-1.1.1-1.8.1-3.6.1-5.4 0-4 0-8 0-12z',
}

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

export const HeroSlider: React.FC<HeroSliderProps> = ({
  links,
  richText,
  showWordmark,
  socialLinks,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  /* ── Merge CMS data with defaults ──────────────────────────── */
  const resolvedRichText = richText ?? DEFAULT_RICHTEXT
  const resolvedLinks = links && links.length > 0 ? links : DEFAULT_LINKS
  const resolvedShowWordmark = showWordmark ?? true
  const resolvedSocialLinks =
    socialLinks && socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIAL_LINKS

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <section className="relative w-full h-svh overflow-hidden">
      {/* ──── Fullscreen GIF background ───────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/tempeh-hero.gif"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ──── Gradient overlay ────────────────────────────────── */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />

      {/* ──── Content — vertically centered, clear of navbar ──── */}
      <div className="relative z-10 flex items-center h-full pt-16 sm:pt-20 lg:pt-24">
        <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left: Main content */}
            <div className="flex flex-col gap-5 sm:gap-6 md:gap-8 lg:gap-10 max-w-3xl">
              {/* Gold wordmark logo + Heading + Description */}
              <div className="flex flex-col">
                {resolvedShowWordmark && (
                  <PrimaryLogo className="h-1.75 sm:h-2.5 md:h-4 lg:h-5 xl:h-6 w-auto self-start text-[#E8C079] mb-2 sm:mb-3" />
                )}

                {resolvedRichText && (
                  <RichText
                    className={cn(
                      'flex flex-col gap-2 sm:gap-3 lg:gap-4',
                      '[&_h1]:text-hero [&_h1]:text-[#F6EFDD]',
                      '[&_p]:text-hero-body [&_p]:text-[#D8D8D8]',
                      '[&_p]:max-w-[52ch] [&_p]:mt-2 sm:[&_p]:mt-3',
                    )}
                    data={resolvedRichText}
                    enableGutter={false}
                    enableProse={false}
                  />
                )}
              </div>

              {/* CTA Button(s) */}
              {resolvedLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-4">
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
                            ? 'rounded-full bg-[#E5B765] text-black px-5 py-2 text-xs sm:text-sm sm:px-6 sm:py-2.5 lg:text-base lg:px-7 lg:py-3 hover:bg-[#d4a654] hover:scale-105'
                            : 'group text-white/80 hover:text-white text-xs sm:text-sm',
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

            {/* Right: Social media icons (desktop only — Figma) */}
            {resolvedSocialLinks.length > 0 && (
              <div className="hidden lg:flex flex-col items-center gap-4 xl:gap-5">
                {resolvedSocialLinks.map((social, i) => {
                  const iconPath = SOCIAL_ICON_PATHS[(social.platform as string) ?? '']
                  if (!iconPath) return null
                  return (
                    <a
                      key={i}
                      href={social.url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform as string}
                      className="flex items-center justify-center w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/80 hover:scale-110"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 xl:w-5 xl:h-5" fill="#FAF2E0">
                        <path d={iconPath} />
                      </svg>
                    </a>
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
