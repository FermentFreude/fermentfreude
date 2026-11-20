import { Media as MediaComponent } from '@/components/Media'
import { PALETTE } from '@/collections/Recipes/categories'
import { cn } from '@/utilities/cn'
import type { CSSProperties, ReactNode } from 'react'

import { isResolvedMedia } from './shared'

/* ═══════════════════════════════════════════════════════════════
 *  /rezepte design kit — brand palette only:
 *  Cream #FAF2E0 · Charcoal #2D2F2C · Sage #B0C7B8 · Mustard #E6BE68
 *  Surfaces: cream page, off-white cards (#FFFEF9), charcoal type.
 * ═══════════════════════════════════════════════════════════════ */

export { PALETTE }

export const INK = 'text-[#2D2F2C]'
export const MUTED = 'text-[#2D2F2C]/70'

export const WRAP = 'mx-auto w-full max-w-[82rem] px-[clamp(1.25rem,4vw,4rem)]'
export const H1 = cn('font-display text-[clamp(2.6rem,6vw,5.2rem)] font-bold leading-[0.98] tracking-[-0.035em] text-balance', INK)
export const H2 = cn('font-display text-[clamp(1.8rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance', INK)
export const H3 = cn('font-display text-[clamp(1.2rem,1.7vw,1.45rem)] font-bold leading-[1.2] tracking-[-0.015em]', INK)
export const LEAD = cn('max-w-[36rem] text-[clamp(1.08rem,1.4vw,1.3rem)] leading-[1.55]', MUTED)

export function Eyebrow({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <p
      style={style}
      className={cn('font-display text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#2D2F2C]/70', className)}
    >
      {children}
    </p>
  )
}

/** Mustard marker underline behind a word. */
export function Mark({ children }: { children: ReactNode }) {
  return (
    <span className="bg-[linear-gradient(transparent_62%,#E6BE68_62%,#E6BE68_92%,transparent_92%)] px-[0.06em] [box-decoration-break:clone]">
      {children}
    </span>
  )
}

export function ArrowIcon({ className = 'size-[1.1em]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export function ClockIcon({ className = 'size-[1.05em]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function JarIcon({ className = 'size-[1.05em]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 3h10v3H7z" />
      <path d="M6 9a3 3 0 0 1 1-3h10a3 3 0 0 1 1 3v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
      <path d="M6 13h12" />
    </svg>
  )
}

/** Image box with a fixed ratio; warm placeholder with a jar when there's no photo. */
export function Photo({
  image,
  ratio,
  className,
  priority,
  tint = '#ECE5DE',
}: {
  image: unknown
  ratio: string
  className?: string
  priority?: boolean
  tint?: string
}) {
  const has = isResolvedMedia(image)
  return (
    <div className={cn('relative overflow-hidden', ratio, className)} style={has ? undefined : { backgroundColor: tint }}>
      {has ? (
        <MediaComponent
          resource={image}
          fill
          imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#2D2F2C]/15">
          <JarIcon className="size-[28%] max-w-24" />
        </div>
      )}
    </div>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#2D2F2C]/[0.07] px-3 py-1 font-display text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#2D2F2C]">
      {children}
    </span>
  )
}
