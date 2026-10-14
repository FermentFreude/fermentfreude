import { cn } from '@/utilities/cn'
import React from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  SECTION HEADER — the one editorial header every section uses.
 *
 *  ───────────────────────────────────────── (thin rule)
 *  SMALL LABEL
 *  Section heading (h2, design-system size)
 *  Optional intro — one or two lines.
 *
 *  Left-aligned to the container edge, same sizes everywhere, so the
 *  page reads like a magazine instead of a mix of one-off headings.
 *  `aside` sits on the right of the heading row on desktop (e.g. a link).
 * ═══════════════════════════════════════════════════════════════ */

type Props = {
  eyebrow?: string | null
  /** Optional — an empty heading is simply not shown */
  heading?: React.ReactNode
  intro?: React.ReactNode
  /** Light text for dark/photo backgrounds */
  tone?: 'light' | 'dark'
  aside?: React.ReactNode
  /** Hide the thin rule (e.g. directly under a photo edge) */
  rule?: boolean
  className?: string
  headingId?: string
  /** Hooks for existing GSAP/Motion text reveals */
  eyebrowProps?: React.HTMLAttributes<HTMLParagraphElement> & {
    ref?: React.Ref<HTMLParagraphElement>
  }
  headingProps?: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }
  introProps?: React.HTMLAttributes<HTMLParagraphElement> & {
    ref?: React.Ref<HTMLParagraphElement>
  }
}

export function SectionHeader({
  eyebrow,
  heading,
  intro,
  tone = 'dark',
  aside,
  rule = true,
  className,
  headingId,
  eyebrowProps,
  headingProps,
  introProps,
}: Props) {
  const light = tone === 'light'
  return (
    <header
      className={cn(
        rule && 'border-t pt-5 md:pt-6',
        rule && (light ? 'border-white/25' : 'border-ff-near-black/15'),
        className,
      )}
    >
      {eyebrow ? (
        <p
          {...eyebrowProps}
          // text-eyebrow kept outside cn(): tailwind-merge mistakes it for a colour
          // class and would drop it next to text-ff-gold-accent
          className={`text-eyebrow ${cn('font-bold uppercase tracking-[0.18em] text-ff-gold-accent', eyebrowProps?.className)}`}
        >
          {eyebrow}
        </p>
      ) : null}

      {heading || aside ? (
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {heading ? (
            <h2
              id={headingId}
              {...headingProps}
              className={cn(
                'max-w-3xl text-section-heading font-display font-bold leading-[1.05] tracking-[-0.025em] text-balance',
                light ? 'text-white' : 'text-ff-near-black',
                headingProps?.className,
              )}
            >
              {heading}
            </h2>
          ) : null}
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      ) : null}

      {intro ? (
        <p
          {...introProps}
          className={cn(
            'mt-4 max-w-2xl text-body-lg leading-relaxed',
            light ? 'text-white/80' : 'text-ff-gray-text',
            introProps?.className,
          )}
        >
          {intro}
        </p>
      ) : null}
    </header>
  )
}
