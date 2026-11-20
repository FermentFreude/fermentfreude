import type { Recipe } from '@/payload-types'
import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import Link from 'next/link'

import type { Labels } from './shared'
import { Photo } from './ui'

/* ═══════════════════════════════════════════════════════════════
 *  Gallery style (reference: Cooking Catrin)
 *  Photography first: 4:5 photos with rounded corners, the name
 *  centred underneath, lots of white space.
 * ═══════════════════════════════════════════════════════════════ */

export const SMALL_CAPS = 'font-display text-[0.72rem] font-bold uppercase tracking-[0.2em]'

/** Recipe in the gallery: photo + name only, both clickable (David: keep it simple). */
export function GalleryCard({
  recipe,
  priority,
}: {
  recipe: Recipe
  locale?: AppLocale
  /** Unused since David's note: the time shows only inside the recipe. */
  labels?: Labels
  priority?: boolean
}) {
  return (
    <Link href={`/rezepte/${recipe.slug}`} className="group block">
      <Photo image={recipe.heroImage} ratio="aspect-[4/5]" className="rounded-[1.25rem] md:rounded-[1.5rem]" tint="#ECE5DE" priority={priority} />
      <h3 className="mt-3 text-center font-display text-[clamp(0.98rem,1.5vw,1.2rem)] font-bold leading-[1.25] tracking-[-0.01em] text-[#2D2F2C] decoration-[#E6BE68] decoration-2 underline-offset-[5px] group-hover:underline md:mt-4">
        {recipe.title}
      </h3>
    </Link>
  )
}

/** Section title, same style as every heading on /rezepte. */
export function GalleryHeading({ title, id }: { eyebrow?: string; title: string; id?: string }) {
  // Same style as every section heading on /rezepte: left-aligned, no label, no rule
  return (
    <h2
      id={id}
      className="mb-5 font-display text-[clamp(1.8rem,3.4vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#2D2F2C] text-balance md:mb-6"
    >
      {title}
    </h2>
  )
}
