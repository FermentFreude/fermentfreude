import { Media } from '@/components/Media'
import type { Recipe, RecipeTeaserBlock as RecipeTeaserBlockType } from '@/payload-types'
import { normalizeAppLocale, strictLocaleQuery } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

/* ═══════════════════════════════════════════════════════════════
 *  Home page: "Rezept der Woche" — big recipe photo + name + short
 *  description, a button to the recipe and a link to /rezepte.
 *  Recipe: the block's own pick, else Rezepte-Seite → Hero →
 *  "Rezept der Woche", else the first highlighted published recipe.
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULTS = {
  de: { eyebrow: 'Rezept der Woche', recipeButton: 'Zum Rezept', allButton: 'Alle Rezepte' },
  en: { eyebrow: 'Recipe of the week', recipeButton: 'View recipe', allButton: 'All recipes' },
} as const

const idOf = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : v && typeof v === 'object' && 'id' in v ? String((v as { id: unknown }).id) : undefined

const hasPhoto = (r?: Recipe) => !!r && typeof r.heroImage === 'object' && r.heroImage !== null

async function pickRecipe(blockRecipe: unknown, locale: 'de' | 'en'): Promise<Recipe | undefined> {
  try {
    const payload = await getPayload({ config: configPromise })
    const findPublished = async (id: string) => {
      const { docs } = await payload.find({
        collection: 'recipes',
        where: { id: { equals: id }, _status: { equals: 'published' } },
        limit: 1,
        depth: 1,
        ...strictLocaleQuery(locale),
      })
      return docs[0] as Recipe | undefined
    }

    const own = idOf(blockRecipe)
    if (own) {
      const r = await findPublished(own)
      if (r) return r
    }
    const page = await payload.findGlobal({ slug: 'recipes-page', depth: 0, ...strictLocaleQuery(locale) })
    const weekly = idOf(page?.hero?.heroRecipe)
    if (weekly) {
      const r = await findPublished(weekly)
      if (r) return r
    }
    const { docs } = await payload.find({
      collection: 'recipes',
      where: { _status: { equals: 'published' } },
      sort: ['-featured', '-publishedAt'],
      limit: 10,
      depth: 1,
      ...strictLocaleQuery(locale),
    })
    return (docs as Recipe[]).find(hasPhoto) ?? (docs[0] as Recipe | undefined)
  } catch (error) {
    console.warn('RecipeTeaser: could not load a recipe', error)
    return undefined
  }
}

export async function RecipeTeaserBlock(props: RecipeTeaserBlockType & { id?: string; locale?: string }) {
  if (props.visible === false) return null
  const locale = normalizeAppLocale(props.locale)
  const d = DEFAULTS[locale]
  const recipe = await pickRecipe(props.recipe, locale)
  if (!recipe) return null // no published recipe yet → no empty section

  const href = `/rezepte/${recipe.slug}`
  const image = typeof recipe.heroImage === 'object' ? recipe.heroImage : null

  return (
    <section id={props.id ?? undefined} className="section-padding-md">
      <div className="container mx-auto container-padding">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#FAF2E0] lg:grid-cols-[1.15fr_1fr]">
          <Link href={href} tabIndex={-1} aria-hidden className="group relative block aspect-[4/3] overflow-hidden bg-[#ECE5DE] lg:aspect-auto lg:min-h-[30rem]">
            {image && (
              <Media
                resource={image}
                fill
                imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            )}
          </Link>

          <div className="flex flex-col items-start justify-center gap-4 p-7 md:p-12 lg:p-14">
            <span className="rounded-full bg-[#E6BE68] px-3 py-1 font-display text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#2D2F2C]">
              {props.eyebrow || d.eyebrow}
            </span>
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[#1D1D1D] text-balance">
              <Link href={href} className="decoration-[#E6BE68] decoration-[3px] underline-offset-[6px] hover:underline">
                {recipe.title}
              </Link>
            </h2>
            {recipe.summary && (
              <p className="max-w-[30rem] text-[1.05rem] leading-relaxed text-[#2D2F2C]/75">{recipe.summary}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1D] px-6 py-3.5 font-display text-[0.95rem] font-bold text-[#FFFEF9] transition-colors hover:bg-black"
              >
                {props.recipeButton || d.recipeButton}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/rezepte"
                className="font-display text-[0.95rem] font-bold text-[#2D2F2C] underline decoration-[#E6BE68] decoration-2 underline-offset-4 hover:decoration-[#2D2F2C]"
              >
                {props.allButton || d.allButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
