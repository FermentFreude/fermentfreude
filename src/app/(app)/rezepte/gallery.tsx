import type { Recipe } from '@/payload-types'
import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import Link from 'next/link'

import type { Labels } from './shared'
import { SaveButton } from './saved'
import { Photo } from './ui'

/* ═══════════════════════════════════════════════════════════════
 *  Gallery style (reference: Cooking Catrin)
 *  Photography first (ref. Cooking Catrin): small landscape 3:2
 *  photos, the name centred underneath, many recipes at a glance.
 * ═══════════════════════════════════════════════════════════════ */

export const SMALL_CAPS = 'font-display text-[0.72rem] font-bold uppercase tracking-[0.2em]'

/** Recipe in the gallery: photo + name only, both clickable (David: keep it simple). */
export function GalleryCard({
  recipe,
  labels,
  priority,
}: {
  recipe: Recipe
  locale?: AppLocale
  /** Template words (used for the save heart). */
  labels?: Labels
  priority?: boolean
}) {
  return (
    <div className="relative">
      <Link href={`/rezepte/${recipe.slug}`} className="group block">
        <Photo image={recipe.heroImage} ratio="aspect-[3/2]" className="rounded-[1rem] md:rounded-[1.25rem]" tint="#ECE5DE" priority={priority} />
        <h3 className="mt-2.5 text-center font-display text-[clamp(0.92rem,1.15vw,1.05rem)] font-bold leading-[1.25] tracking-[-0.01em] text-[#2D2F2C] decoration-[#E6BE68] decoration-2 underline-offset-[5px] text-balance group-hover:underline md:mt-3">
          {recipe.title}
        </h3>
      </Link>
      {/* heart on the photo: save for later (this device) */}
      {labels && recipe.slug && (
        <SaveButton
          variant="card"
          slug={recipe.slug}
          title={recipe.title}
          labels={{ save: labels.save, saved: labels.saved, saveAria: labels.saveAria, unsaveAria: labels.unsaveAria }}
          className="absolute right-2 top-2 md:right-2.5 md:top-2.5"
        />
      )}
    </div>
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
