import { Media as MediaComponent } from '@/components/Media'
import { getRecipeCategory } from '@/collections/Recipes/categories'
import type { Product, Recipe, User, Workshop } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { getLocale } from '@/utilities/getLocale'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { normalizeAppLocale, strictLocaleQuery, type AppLocale } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'
import { headers } from 'next/headers'
import { checkRole } from '@/access/utilities'

import { MotionStyles } from '../creative'
import { InView } from '../InView'
import { RecipeActions } from './RecipeActions'
import { StarRating } from './StarRating'
import { IngredientList } from './IngredientList'
import { SaveButton } from '../saved'
import { summarize } from '@/lib/recipeRatings'
import { ReadyOn } from './ReadyOn'
import { getRecipesPage, pick } from '../data'
import { CategoryView, categoryMetadata } from '../category-view'
import { GalleryCard, GalleryHeading, SMALL_CAPS } from '../gallery'
import { categoryPath } from '../load'
import { WorkshopBlock } from '../closing'
import { LANDING_DEFAULTS, NOTE_DEFAULTS } from '../labels'
import {
  absoluteMediaUrl,
  buildRecipeJsonLd,
  categoryName,
  difficultyName,
  disclosureName,
  formatDays,
  isResolvedMedia,
  resolveLabels,
} from '../shared'
import { ArrowIcon, Photo, WRAP } from '../ui'

export const dynamic = 'force-dynamic'

/* ═══════════════════════════════════════════════════════════════
 *  /rezepte/[slug] — one recipe, gallery style (matches /rezepte)
 *
 *  Centred title → large rounded photo → facts row →
 *  ingredients | ferment timeline + "why it works" + steps + tips +
 *  partner → shop products → workshop + category photo cards →
 *  related recipes. JSON-LD Recipe data for Google & Pinterest.
 * ═══════════════════════════════════════════════════════════════ */

type Params = Promise<{ slug: string }>

const getRecipe = cache(async (slug: string, locale: AppLocale) => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'recipes',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 2,
    ...strictLocaleQuery(locale),
  })
  return docs[0] as Recipe | undefined
})

/** Drafts are hidden from visitors. A logged-in admin sees the latest draft (with a banner) to check it before publishing. */
const getAdminDraft = cache(async (slug: string, locale: AppLocale) => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || !checkRole(['admin'], user as User)) return undefined
  const { docs } = await payload.find({
    collection: 'recipes',
    where: { slug: { equals: slug } },
    draft: true,
    limit: 1,
    depth: 2,
    overrideAccess: false,
    user,
    ...strictLocaleQuery(locale),
  })
  return docs[0] as Recipe | undefined
})

const loadRecipe = async (slug: string, locale: AppLocale) => (await getRecipe(slug, locale)) ?? (await getAdminDraft(slug, locale))

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const locale = normalizeAppLocale(await getLocale())
  // /rezepte/kombucha etc. is a category page, not a recipe
  const asCategory = getRecipeCategory(slug)
  if (asCategory) return categoryMetadata(asCategory, locale)
  const recipe = await loadRecipe(slug, locale)
  if (!recipe) return {}

  const baseUrl = getServerSideURL()
  const l = resolveLabels((await getRecipesPage(locale)).labels, locale)
  const title = recipe.meta?.title || `${recipe.title} | ${l.overviewTitle} | Fermentfreude`
  const description = recipe.meta?.description || recipe.summary || undefined
  const image =
    absoluteMediaUrl(recipe.meta?.image, baseUrl) || absoluteMediaUrl(recipe.heroImage, baseUrl)
  const pin = absoluteMediaUrl(recipe.pinterestImage, baseUrl)

  return {
    title,
    description,
    alternates: { canonical: `/rezepte/${recipe.slug}` },
    openGraph: mergeOpenGraph({
      type: 'article',
      title,
      description,
      url: `/rezepte/${recipe.slug}`,
      images: image ? [{ url: image }] : undefined,
    }),
    // Pinterest prefers a tall image when someone pins the page
    other: pin ? { 'pin:media': pin } : {},
    // admin-only draft view: never indexed
    ...(recipe._status !== 'published' ? { robots: { index: false, follow: false } } : {}),
  }
}

/** Brand illustrations on the printed card (David: two, top left + bottom right). */
const PRINT_ART = [
  { src: '/fermentation/carrot-chef.webp', w: 1260, h: 764, cls: 'left-[0.5cm] top-[0.5cm] w-[3.6cm] -rotate-6' },
  { src: '/fermentation/broccoli-chef.webp', w: 1200, h: 812, cls: 'bottom-[0.5cm] right-[0.5cm] w-[3.4cm] -rotate-3' },
]

/** Section title with a soft Sage brush stroke behind it (print card). */
function PrintHeading({ children }: { children: string }) {
  return (
    <h2 className="relative inline-block font-display text-[11pt] font-bold uppercase tracking-[0.16em]">
      <span aria-hidden className="absolute -inset-x-2 inset-y-[0.12em] -z-10 -skew-x-6 rounded-[3px] bg-[#B0C7B8]/70" />
      {children}
    </h2>
  )
}

/**
 * Print only (`Rezept drucken`): one-page A4 recipe card. Logo, category line, big title,
 * facts bar with icons; left: ingredients, tips and David's note; right: numbered steps
 * (no photo: saves ink, David/Alaa); bottom: QR code to fermentfreude.at + slogan; two comic friends.
 */
function PrintCard({
  recipe,
  l,
  facts,
  category,
  note,
}: {
  recipe: Recipe
  l: ReturnType<typeof resolveLabels>
  facts: Array<{ label: string; value: string; icon: FactIconName }>
  category?: string
  note: { name: string; role: string }
}) {
  return (
    <section className="relative isolate hidden min-h-[29.6cm] overflow-hidden bg-[#FBF7EE] px-[1.6cm] pb-[3.3cm] pt-[1cm] text-[#1D1D1D] [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:block">
      {PRINT_ART.map((a) => (
        // eager: the card is hidden on screen, and lazy images would never load before printing
        <Image key={a.src} src={a.src} width={a.w} height={a.h} sizes="240px" loading="eager" alt="" aria-hidden className={cn('pointer-events-none absolute -z-10 h-auto', a.cls)} />
      ))}

      {/* ─── head: logo, category, title, ornament ─── */}
      <header className="flex flex-col items-center text-center">
        <Image src="/primary-logo.svg" width={301} height={35} loading="eager" alt="Fermentfreude" className="h-[0.45cm] w-auto" />
        {category && (
          <p className="mt-3 flex items-center gap-2 font-display text-[8.5pt] font-bold uppercase tracking-[0.28em] text-[#1D1D1D]/60">
            <span aria-hidden className="h-px w-6 bg-[#1D1D1D]/30" />
            {category}
            <span aria-hidden className="h-px w-6 bg-[#1D1D1D]/30" />
          </p>
        )}
        <h1 className="mt-1.5 max-w-[14cm] font-display text-[25pt] font-bold uppercase leading-[1.02] tracking-[0.01em] text-balance">{recipe.title}</h1>
        <div aria-hidden className="mt-2 flex items-center gap-2">
          <span className="h-[1.5px] w-14 bg-[#1D1D1D]/35" />
          <span className="size-1.5 rotate-45 bg-[#E6BE68]" />
          <span className="h-[1.5px] w-14 bg-[#1D1D1D]/35" />
        </div>
      </header>

      {/* ─── facts bar ─── */}
      {facts.length > 0 && (
        <dl className="mt-4 grid grid-flow-col auto-cols-fr divide-x divide-[#1D1D1D]/20 rounded-[0.4cm] bg-[#B0C7B8]/45 py-2.5">
          {facts.map((f) => (
            <div key={f.label} className="flex items-center justify-center gap-2 px-2">
              <span aria-hidden className="grid size-[0.85cm] shrink-0 place-items-center rounded-full border border-[#1D1D1D]/60">
                <FactIcon name={f.icon} />
              </span>
              <div className="min-w-0">
                <dt className="font-display text-[7pt] font-bold uppercase tracking-[0.18em] text-[#1D1D1D]/60">{f.label}</dt>
                <dd className="font-display text-[9.5pt] font-bold leading-tight">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {/* ─── two columns ─── */}
      <div className="mt-5 grid grid-cols-[0.82fr_1.18fr] gap-7">
        <div>
          <PrintHeading>{l.ingredients}</PrintHeading>
          {recipe.vessel && <p className="mt-2 text-[8.5pt] text-[#1D1D1D]/60">{recipe.vessel}</p>}
          {(recipe.ingredientGroups ?? []).map((g, gi) => (
            <div key={g.id ?? gi} className="mt-2">
              {g.title && <p className="mb-1 font-display text-[8.5pt] font-bold">{g.title}</p>}
              <ul className="flex flex-col gap-[0.13cm]">
                {(g.items ?? []).map((it, ii) => (
                  <li key={it.id ?? ii} className="flex items-baseline gap-2 text-[9pt] leading-snug">
                    <span aria-hidden className="relative top-[0.08em] size-[0.75em] shrink-0 self-start rounded-full border border-[#1D1D1D]/55" />
                    <span>
                      {it.amount && <b className="font-display">{it.amount} </b>}
                      {it.name}
                      {it.note && <span className="text-[#1D1D1D]/55">, {it.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {(recipe.tips ?? []).length > 0 && (
            <>
              <div aria-hidden className="my-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#1D1D1D]/25" />
                <span className="size-1.5 rotate-45 bg-[#B0C7B8]" />
                <span className="h-px flex-1 bg-[#1D1D1D]/25" />
              </div>
              <PrintHeading>{l.tips}</PrintHeading>
              <ul className="mt-2 flex flex-col gap-1.5 text-[8.8pt] leading-snug">
                {recipe.tips!.map((t, ti) => (
                  <li key={t.id ?? ti} className="flex gap-2">
                    <span aria-hidden className="mt-[0.45em] size-1 shrink-0 rounded-full bg-[#1D1D1D]/60" />
                    {t.text}
                  </li>
                ))}
              </ul>
            </>
          )}

          {recipe.whyItWorks && (
            <div className="mt-5 rounded-[0.3cm] border border-[#1D1D1D]/35 bg-[#FFFEF9]/70 px-4 py-3 text-center">
              <p className="font-display text-[8.5pt] font-bold uppercase tracking-[0.2em]">{l.whyItWorks}</p>
              <p className="mt-1.5 text-[8.6pt] italic leading-snug text-[#1D1D1D]/75">„{recipe.whyItWorks}“</p>
              <p className="mt-1.5 font-display text-[8pt] font-bold">
                {note.name} <span className="font-normal text-[#1D1D1D]/55">· {note.role}</span>
              </p>
            </div>
          )}
        </div>

        <div>
          <PrintHeading>{l.steps}</PrintHeading>
          <ol className="mt-3 divide-y divide-[#1D1D1D]/15">
            {(recipe.steps ?? []).map((st, si) => (
              <li key={st.id ?? si} className="grid grid-cols-[0.8cm_1fr] items-start gap-2.5 py-[0.2cm] [break-inside:avoid]">
                <span className={cn('grid size-[0.75cm] place-items-center rounded-full bg-[#2D2F2C] font-display text-[8.5pt] font-bold text-[#FAF2E0]', '[-webkit-print-color-adjust:exact] [print-color-adjust:exact]')}>
                  {String(si + 1).padStart(2, '0')}
                </span>
                <p className="pt-[0.08cm] text-[9pt] leading-snug">
                  {st.title && <b className="font-display">{st.title}: </b>}
                  {st.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ─── bottom middle: QR code to the website + slogan ─── */}
      <div className="absolute inset-x-0 bottom-[0.55cm] flex flex-col items-center gap-1 text-[7.5pt] text-[#1D1D1D]/65">
        <Image src="/print/qr-fermentfreude.svg" width={31} height={31} loading="eager" alt="QR: fermentfreude.at" className="size-[1.9cm]" unoptimized />
        <span>
          {l.printSlogan} · fermentfreude.at
        </span>
      </div>
    </section>
  )
}

/** Jar outline used as the ingredient checkbox; parent classes fill the body and show the tick. */
function JarCheck() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
      <rect x="7.5" y="2.5" width="9" height="3.2" rx="1" />
      <path className="jar-body transition-colors" d="M7.8 5.7h8.4c1.5 1 2.3 2.5 2.3 4.3v8.3a2.6 2.6 0 0 1-2.6 2.6H8.1a2.6 2.6 0 0 1-2.6-2.6V10c0-1.8.8-3.3 2.3-4.3Z" />
      <path className="jar-tick opacity-0 transition-opacity" d="m9 13.6 2.1 2.1 3.9-4.2" stroke="#FAF2E0" strokeWidth={2.1} strokeLinecap="round" />
    </svg>
  )
}

type FactIconName = 'clock' | 'calendar' | 'jar' | 'bowl' | 'level-leicht' | 'level-mittel' | 'level-fortgeschritten'

/** Small line icons for the facts (prep time, fermentation, amount, difficulty). */
function FactIcon({ name }: { name: FactIconName }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'size-[1.15rem]' } as const
  if (name === 'clock')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    )
  if (name === 'calendar')
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    )
  if (name === 'bowl')
    return (
      <svg {...common}>
        <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
        <path d="M9 7.5c0-1.2 1-1.5 1-2.7M13 7.5c0-1.2 1-1.5 1-2.7" />
      </svg>
    )
  if (name === 'jar')
    return (
      <svg {...common}>
        <path d="M8 3.5h8M7 6.5h10" />
        <path d="M7 6.5c-1.7 1-2.5 2.4-2.5 4.5v7a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-7c0-2.1-.8-3.5-2.5-4.5" />
        <path d="M4.5 12.5h15" />
      </svg>
    )
  // difficulty: 1, 2 or 3 filled bars
  const filled = name === 'level-fortgeschritten' ? 3 : name === 'level-mittel' ? 2 : 1
  return (
    <svg {...common}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={5 + i * 5.5} y={15 - i * 4} width="3.5" height={5 + i * 4} rx="1" fill={i < filled ? 'currentColor' : 'none'} />
      ))}
    </svg>
  )
}

/** Set up → ferment → enjoy, "what you'll notice" per day and the ready-on date. */
function FermentTimeline({
  days,
  prep,
  l,
  locale,
  notices,
}: {
  days: number
  prep?: number | null
  l: ReturnType<typeof resolveLabels>
  locale: AppLocale
  notices: { day: number; text: string }[]
}) {
  const stops = [
    { title: l.timelineStart, sub: prep ? `${l.today} · ${prep} ${l.minutes}` : l.today },
    { title: l.timelineMiddle, sub: formatDays(days, l) },
    { title: l.timelineEnd, sub: `${l.dayShort} ${days}` },
  ]
  // small mustard dots on the line where something happens (not on the 3 big stops)
  const dots = notices
    .map((n) => Math.min(100, Math.max(0, (n.day / days) * 100)))
    .filter((at) => at > 7 && at < 93 && Math.abs(at - 50) > 5)
  const icons = [
    // jar (Ansetzen)
    <svg key="j" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3.5h8M7 6.5h10" />
      <path d="M7 6.5c-1.7 1-2.5 2.4-2.5 4.5v7a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-7c0-2.1-.8-3.5-2.5-4.5" />
    </svg>,
    // bubbles (Fermentieren)
    <svg key="b" viewBox="0 0 24 24" className="ff-bubbles size-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="8" cy="15" r="4" />
      <circle cx="16" cy="9" r="3" />
      <circle cx="16.5" cy="17.5" r="1.8" />
      <circle cx="9" cy="5.5" r="1.5" />
    </svg>,
    // spoon (Genießen)
    <svg key="s" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <ellipse cx="12" cy="7" rx="3.6" ry="4.5" />
      <path d="M12 11.5V21" />
    </svg>,
  ]
  const stopStyle = ['bg-[#B0C7B8] text-[#1D3A2A]', 'bg-[#E6BE68] text-[#2D2F2C]', 'bg-[#2D2F2C] text-[#FAF2E0]']

  return (
    <div className="mb-14">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FAF2E0] px-3.5 py-1.5 font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#2D2F2C]">
        {l.readyIn} {formatDays(days, l)}
      </p>

      {/* three coloured stops with icons on a Sage → Mustard → Charcoal line; small dots = "Was du bemerkst" days */}
      <InView className="relative">
        <div aria-hidden className="ff-tl-line absolute left-[22px] right-[22px] top-[21px] h-[3px] rounded-full bg-[linear-gradient(to_right,#B0C7B8,#E6BE68_50%,#2D2F2C)]" />
        {dots.map((at, i) => (
          <span
            key={`d${i}`}
            aria-hidden
            className="ff-tl-dot absolute top-[22.5px] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FFFEF9] bg-[#2D2F2C]"
            style={{ left: `calc(22px + (100% - 44px) * ${at / 100})`, ['--d' as string]: `${0.2 + (at / 100) * 1.1}s` }}
          />
        ))}
        <div className="relative grid grid-cols-3">
          {stops.map((st, i) => (
            <div key={i} className={cn('flex flex-col gap-2', i === 0 ? 'items-start text-left' : i === 2 ? 'items-end text-right' : 'items-center text-center')}>
              <span
                aria-hidden
                className={cn('ff-tl-stop ff-tl-icon grid size-11 place-items-center rounded-full ring-4 ring-[#FFFEF9]', stopStyle[i])}
                style={{ ['--d' as string]: `${i * 0.45}s` }}
              >
                {icons[i]}
              </span>
              <div>
                <p className="font-display text-[1rem] font-bold text-[#2D2F2C]">{st.title}</p>
                <p className="font-display text-[0.85rem] text-[#2D2F2C]/55">{st.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </InView>

      {notices.length > 0 && (
        <div className="mt-8">
          <p className={cn(SMALL_CAPS, 'text-[#2D2F2C]/55')}>{l.noticeTitle}</p>
          <ol className="mt-3 divide-y divide-[#2D2F2C]/10 border-y border-[#2D2F2C]/10">
            {notices.map((n, i) => (
              <li key={i} className="flex items-baseline gap-4 py-3">
                <span className="w-16 shrink-0 font-display text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#2D2F2C]/55">
                  {n.day === 0 ? l.today : `${l.dayShort} ${n.day}`}
                </span>
                <span className="text-[1.02rem] leading-snug text-[#2D2F2C]">{n.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <ReadyOn days={days} template={l.readyOnText} locale={locale} />
    </div>
  )
}

export default async function RecipePage({ params }: { params: Params }) {
  const { slug } = await params
  const locale = normalizeAppLocale(await getLocale())
  // /rezepte/fermentieren · /einlegen · /tempeh · /kombucha → category page
  const asCategory = getRecipeCategory(slug)
  if (asCategory) return <CategoryView category={asCategory} locale={locale} />
  const recipe = await loadRecipe(slug, locale)
  if (!recipe) notFound()
  const isDraft = recipe._status !== 'published'

  const page = await getRecipesPage(locale)
  const l = resolveLabels(page.labels, locale)
  const baseUrl = getServerSideURL()
  const category = getRecipeCategory(recipe.category)
  const categoryHref = category ? categoryPath(category.value) : '/rezepte'
  const catName = categoryName(recipe.category, locale, page)
  const difficulty = difficultyName(recipe.difficulty, l)

  const workshop =
    typeof recipe.relatedWorkshop === 'object' && recipe.relatedWorkshop
      ? (recipe.relatedWorkshop as Workshop)
      : null
  const workshopHref = workshop?.slug ? `/workshops/${workshop.slug}` : (category?.workshopHref ?? '/workshops')

  const products = (recipe.relatedProducts ?? []).filter(
    (p): p is Product => typeof p === 'object' && p !== null,
  )
  const partner = recipe.partner?.enabled ? recipe.partner : null
  const disclosure = partner?.disclosure ?? 'kooperation'
  // e.g. "In Kooperation mit Musterglas" — label from the admin dropdown + brand name
  const partnerLine = partner
    ? [disclosureName(disclosure, l), partner.name].filter(Boolean).join(disclosure === 'kooperation' ? ' ' : ' · ')
    : null

  const payload = await getPayload({ config: configPromise })
  const { docs: related } = await payload.find({
    collection: 'recipes',
    where: {
      _status: { equals: 'published' },
      slug: { not_equals: recipe.slug },
      category: { equals: recipe.category },
    },
    limit: 3,
    depth: 1,
    sort: '-publishedAt',
    ...strictLocaleQuery(locale),
  })
  // fewer than 3 in this category → fill up with recipes from the others
  if (related.length < 3) {
    const { docs: more } = await payload.find({
      collection: 'recipes',
      where: {
        _status: { equals: 'published' },
        slug: { not_in: [recipe.slug, ...related.map((r) => r.slug)].filter((x): x is string => Boolean(x)) },
      },
      limit: 3 - related.length,
      depth: 1,
      sort: ['-featured', '-publishedAt'],
      ...strictLocaleQuery(locale),
    })
    related.push(...more)
  }

  // star votes ("Hat's geschmeckt?"): read server-side, the collection is admin-only
  const { docs: votes } = await payload.find({
    collection: 'recipe-ratings',
    where: { recipe: { equals: recipe.id } },
    pagination: false,
    depth: 0,
    overrideAccess: true,
    select: { stars: true },
  })
  const rating = summarize(votes.map((v) => v.stars))

  const jsonLd = buildRecipeJsonLd(recipe, {
    url: `${baseUrl}/rezepte/${recipe.slug}`,
    baseUrl,
    categoryLabel: category ? catName : undefined,
    locale,
    rating,
  })

  type Fact = { label: string; value: string; icon: FactIconName }
  const facts: Array<Fact | null> = [
    recipe.prepMinutes ? { label: l.prep, value: `${recipe.prepMinutes} ${l.minutes}`, icon: 'clock' } : null,
    recipe.fermentationDays ? { label: l.fermentation, value: formatDays(recipe.fermentationDays, l), icon: 'calendar' } : null,
    recipe.yield ? { label: l.yield, value: recipe.yield, icon: 'bowl' } : null,
    difficulty ? { label: l.difficulty, value: difficulty, icon: `level-${recipe.difficulty ?? 'leicht'}` as FactIconName } : null,
  ]
  const visibleFacts = facts.filter((f): f is Fact => f !== null)
  // "Über das Rezept" box on screen also shows the container (Gefäß); the print card keeps it under Zutaten
  const boxFacts: Fact[] = recipe.vessel ? [...visibleFacts, { label: l.vessel, value: recipe.vessel, icon: 'jar' }] : visibleFacts

  const f = page.featured
  const noteName = pick(page.note?.name, NOTE_DEFAULTS[locale].name)
  const noteRole = pick(page.note?.role, NOTE_DEFAULTS[locale].role)

  return (
    <main className="min-h-screen bg-[#FFFEF9] print:bg-white">
      <MotionStyles />
      {/* print only the recipe: no site header/footer, no cookie banner */}
      <style media="print">{`#site-header,#site-footer,#site-splash,[role=dialog]{display:none!important}#main-content{margin:0!important;padding:0!important}@page{size:A4;margin:0}html,body{background:#fff!important}`}</style>
      <script
        type="application/ld+json"
        // escape "<" so CMS text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <article>
        {/* draft: only admins get here (visitors see 404) */}
        {isDraft && (
          <div className="sticky top-0 z-40 bg-[#E6BE68] px-4 py-2.5 text-center font-display text-[0.9rem] font-bold text-[#1D1D1D] print:hidden">
            Entwurf – nur für eingeloggte Admins sichtbar. Zum Veröffentlichen im Dashboard auf „Veröffentlichen“ klicken.
          </div>
        )}
        {/* ─── Print only: the recipe as a one-page recipe card ─── */}
        <PrintCard recipe={recipe} l={l} facts={visibleFacts} category={category ? catName : undefined} note={{ name: noteName, role: noteRole }} />

        {/* ─── Top: clear way back · full-width photo, white title card overlapping its bottom edge ─── */}
        <div className={cn(WRAP, 'pt-4 md:pt-6 print:hidden')}>
          <Link
            href="/rezepte"
            className="group mb-3 inline-flex items-center gap-2 rounded-full border border-[#2D2F2C]/15 bg-[#FFFEF9] px-4 py-2 font-display text-[0.9rem] font-bold text-[#2D2F2C] transition-colors hover:border-[#2D2F2C] md:mb-4"
          >
            <ArrowIcon className="size-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            {l.backToRecipes}
          </Link>
          <Photo
            image={recipe.heroImage}
            ratio="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
            className="rounded-[1.75rem] md:rounded-[2rem]"
            tint="#ECE5DE"
            priority
          />
        </div>
        <header className={cn(WRAP, 'relative print:hidden')}>
          <div className="relative mx-4 -mt-12 flex flex-col items-center gap-3.5 rounded-[1.5rem] bg-[#FFFEF9] px-6 pb-8 pt-7 text-center shadow-[0_26px_60px_-32px_rgb(29_29_29/40%)] sm:mx-auto sm:max-w-[52rem] md:-mt-28 md:gap-4 md:rounded-[2rem] md:px-12 md:pb-10 md:pt-10">
            {/* category as a clear pill in its own colour → all recipes of that category */}
            {category && (
              <Link
                href={categoryHref}
                className="group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-[0.82rem] font-bold transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: category.theme.bg,
                  color: category.theme.fg,
                  boxShadow: category.theme.bg === '#FAF2E0' ? 'inset 0 0 0 1px rgb(45 47 44 / 20%)' : undefined,
                }}
              >
                {catName}
                <ArrowIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <h1 className="font-display text-[clamp(2.1rem,4.4vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[#2D2F2C] text-balance">
              {recipe.title}
            </h1>
            <span aria-hidden className="h-[3px] w-12 bg-[#E6BE68]" />
            {recipe.summary && (
              <p className="max-w-[36rem] text-[clamp(1.02rem,1.3vw,1.18rem)] leading-[1.55] text-[#2D2F2C]/70">{recipe.summary}</p>
            )}
            {partnerLine && (
              <p className="font-display text-[0.95rem] text-[#2D2F2C]/65">
                {disclosureName(disclosure, l)}
                {partner?.name && <b className="ml-1 text-[#2D2F2C]">{partner.name}</b>}
              </p>
            )}
            {/* straight down to the ingredients (long way on phones) + save for later */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="#zutaten"
              className="group inline-flex items-center gap-2 rounded-full bg-[#2D2F2C] px-5 py-2.5 font-display text-[0.92rem] font-bold text-[#FAF2E0] transition-colors hover:bg-[#1D1D1D]"
            >
              {l.jumpToRecipe}
              <ArrowIcon className="size-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
            </a>
            <SaveButton
              variant="pill"
              slug={recipe.slug ?? ''}
              title={recipe.title}
              labels={{ save: l.save, saved: l.saved, saveAria: l.saveAria, unsaveAria: l.unsaveAria }}
            />
            </div>
            {/* "Hat's geschmeckt?" in the title card (Alaa) */}
            <StarRating
              slug={recipe.slug ?? ''}
              initial={rating}
              locale={locale}
              labels={{
                title: l.rateTitle,
                thanks: l.rateThanks,
                error: l.rateError,
                one: l.rateOne,
                many: l.rateMany,
                starsAria: l.rateStarsAria,
              }}
            />
          </div>
        </header>

        {/* ─── Ingredients | Method ─── */}
        <div className={cn(WRAP, 'grid gap-12 py-12 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-20 lg:py-16 print:hidden')}>
          <aside
            aria-labelledby="zutaten"
            className="h-fit scroll-mt-24 rounded-[1.75rem] bg-[#FAF2E0] p-7 md:p-8"
          >
            {/* "Über das Rezept": times and amounts, right above the ingredients */}
            {boxFacts.length > 0 && (
              <div className="mb-7 border-b border-[#2D2F2C]/12 pb-6">
                <p className={cn(SMALL_CAPS, 'text-[#2D2F2C]/55')}>{l.aboutRecipe}</p>
                <dl className="mt-4 flex flex-col gap-3">
                  {boxFacts.map((fact) => (
                    // top-aligned: a long value (e.g. two jars) wraps downwards, the icon and label stay on its first line
                    <div key={fact.label} className="flex items-start gap-3">
                      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFFEF9] text-[#2D2F2C]">
                        <FactIcon name={fact.icon} />
                      </span>
                      <dt className="shrink-0 py-[0.45rem] text-[0.95rem] leading-snug text-[#2D2F2C]/65">{fact.label}</dt>
                      <dd className="ml-auto py-[0.45rem] text-right font-display text-[0.98rem] font-bold leading-snug text-[#2D2F2C] text-balance">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                {/* Drucken · Teilen · Merken: one row of three equal buttons */}
                <div className="mt-5">
                  <RecipeActions
                    url={`${baseUrl}/rezepte/${recipe.slug}`}
                    title={recipe.title}
                    image={absoluteMediaUrl(recipe.pinterestImage, baseUrl) || absoluteMediaUrl(recipe.heroImage, baseUrl)}
                    labels={{ print: l.printShort, share: l.share, pin: l.pinShort, copyLink: l.copyLink, copied: l.linkCopied }}
                  />
                </div>
              </div>
            )}
            <h2 id="zutaten" className="scroll-mt-28 font-display text-[1.6rem] font-bold tracking-[-0.025em] text-[#2D2F2C]">
              {l.ingredients}
            </h2>
            {/* 1× 2× 3× switch, tick-off list, "Bildschirm anlassen" (client component) */}
            <IngredientList
              groups={(recipe.ingredientGroups ?? []).map((g) => ({
                id: g.id,
                title: g.title,
                items: (g.items ?? []).map((i) => ({ id: i.id, name: i.name, note: i.note, amount: i.amount })),
              }))}
              yieldText={recipe.yield}
              locale={locale}
              jar={<JarCheck />}
              labels={{ scale: l.scaleLabel, factors: [l.scale1, l.scale2, l.scale3], makes: l.scaleMakes, checkHint: l.checkHint, cookMode: l.cookMode, cookModeHint: l.cookModeHint }}
            />
          </aside>

          <div className="max-w-[44rem]">
            {(recipe.fermentationDays ?? 0) > 0 && (
              <FermentTimeline
                days={recipe.fermentationDays!}
                prep={recipe.prepMinutes}
                l={l}
                locale={locale}
                notices={(recipe.fermentLog ?? [])
                  .filter((n) => typeof n.day === 'number' && n.text)
                  .map((n) => ({ day: n.day, text: n.text }))
                  .sort((x, y) => x.day - y.day)}
              />
            )}

            {/* ─── Note card styled like a jar label: Sage label, stitched edge, David's tip
                   (photo, name, role: Rezepte-Seite → Notiz-Karte; heading = template word) ─── */}
            {recipe.whyItWorks && (
              <figure className="relative mb-14 rounded-[2rem] bg-[#B0C7B8] p-2 shadow-[0_22px_44px_-28px_rgb(29_29_29/45%)] print:shadow-none">
                <div className="rounded-[1.6rem] border-2 border-dashed border-[#FFFEF9]/85 px-6 pb-7 pt-6 text-center md:px-12 md:pb-9 md:pt-8">
                  <p className="flex items-center justify-center gap-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[#1D3A2A]">
                    <span aria-hidden className="h-px w-8 bg-[#1D3A2A]/40" />
                    {l.whyItWorks}
                    <span aria-hidden className="h-px w-8 bg-[#1D3A2A]/40" />
                  </p>
                  <blockquote className="mx-auto mt-4 max-w-[36rem] text-[1.1rem] leading-relaxed text-[#1D3A2A] md:text-[1.18rem]">
                    „{recipe.whyItWorks}“
                  </blockquote>
                  <figcaption className="mt-6 flex items-center justify-center gap-3">
                    {isResolvedMedia(page.note?.photo) ? (
                      // one person → round; a wide photo (e.g. David & Marcel together) → wide pill
                      <span
                        className={cn(
                          'relative h-12 shrink-0 overflow-hidden rounded-full ring-[3px] ring-[#FFFEF9]',
                          (page.note.photo.width ?? 1) / (page.note.photo.height ?? 1) > 1.3 ? 'w-24' : 'w-12',
                        )}
                      >
                        <MediaComponent
                          resource={page.note.photo}
                          fill
                          imgClassName={cn('object-cover', (page.note.photo.width ?? 1) / (page.note.photo.height ?? 1) > 1.3 ? 'object-center' : 'object-[50%_12%]')}
                        />
                      </span>
                    ) : (
                      <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-[#1D3A2A] font-display text-[1.1rem] font-bold text-[#FAF2E0]">
                        {noteName.charAt(0)}
                      </span>
                    )}
                    <span className="flex flex-col text-left">
                      <span className="font-display text-[1.02rem] font-bold text-[#1D3A2A]">{noteName}</span>
                      <span className="text-[0.86rem] text-[#1D3A2A]/70">{noteRole}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            )}

            <h2 className="mb-8 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-[#2D2F2C]">{l.steps}</h2>
            <ol className="flex flex-col gap-10">
              {(recipe.steps ?? []).map((step, si) => (
                <li key={step.id ?? si} className="grid grid-cols-[2.75rem_1fr] gap-5">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[#B0C7B8] font-display text-[1.05rem] font-bold text-[#2D2F2C]">
                    {si + 1}
                  </span>
                  {/* with a photo: text left, photo right (phones: photo under the text) */}
                  <div className={cn('pt-1.5', isResolvedMedia(step.image) && 'sm:grid sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]')}>
                    <div>
                      <h3 className="font-display text-[1.2rem] font-bold text-[#2D2F2C]">{step.title || `${l.stepFallback} ${si + 1}`}</h3>
                      <p className="mt-2 whitespace-pre-line text-[1.0625rem] leading-relaxed text-[#2D2F2C]/75">{step.text}</p>
                    </div>
                    {isResolvedMedia(step.image) && (
                      <Photo image={step.image} ratio="aspect-[4/3]" className="mt-4 rounded-[1.25rem] sm:mt-0 print:hidden" />
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {(recipe.tips ?? []).length > 0 && (
              <div className="mt-14 rounded-[1.75rem] bg-[#FAF2E0] p-7 md:p-8">
                <h2 className={cn(SMALL_CAPS, 'text-[#2D2F2C]/60')}>{l.tips}</h2>
                <ul className="mt-4 space-y-3 text-[1.0625rem] leading-relaxed text-[#2D2F2C]/80">
                  {recipe.tips!.map((t, ti) => (
                    <li key={t.id ?? ti} className="flex gap-3">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[#E6BE68]" />
                      {t.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ─── Partner (sponsored), only when switched on ─── */}
            {partner && (
              <aside
                aria-label={partnerLine ?? undefined}
                className="mt-14 rounded-[1.75rem] border border-[#2D2F2C]/10 p-7 md:p-8 print:hidden"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {isResolvedMedia(partner.logo) && (
                    <div className="h-14 w-32 shrink-0">
                      <MediaComponent resource={partner.logo} imgClassName="size-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    {partner.name && <p className="font-display text-[1.15rem] font-bold text-[#2D2F2C]">{partner.name}</p>}
                    {partner.text && <p className="mt-1 leading-relaxed text-[#2D2F2C]/70">{partner.text}</p>}
                  </div>
                  {partner.linkUrl && /^https?:\/\//.test(partner.linkUrl) && (
                    <a
                      href={partner.linkUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#2D2F2C] px-6 py-3 font-display font-bold text-[#FAF2E0] transition-colors hover:bg-black"
                    >
                      {partner.linkLabel || l.partnerDefaultCta}
                      <ArrowIcon />
                    </a>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* ─── Shop products ─── */}
        {products.length > 0 && (
          <section className={cn(WRAP, 'pb-16 print:hidden')}>
            <h2 className={cn(SMALL_CAPS, 'mb-6 text-center text-[#2D2F2C]/60')}>{l.products}</h2>
            <div className="mx-auto grid max-w-[56rem] gap-6 sm:grid-cols-3">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group block text-center">
                  <Photo image={p.gallery?.[0]?.image} ratio="aspect-square" className="rounded-[1.5rem]" tint="#FAF2E0" />
                  <p className="mt-3 font-display font-bold text-[#2D2F2C] group-hover:underline">{p.title}</p>
                  <p className={cn(SMALL_CAPS, 'mt-1 text-[#2D2F2C]/55')}>{l.toProduct} →</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Related recipes ─── */}
        {related.length > 0 && (
          <section className={cn(WRAP, 'border-t border-[#2D2F2C]/10 pb-8 pt-16 md:pt-20 print:hidden')}>
            <GalleryHeading title={l.related} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-6 md:gap-y-10">
              {related.map((r) => (
                <GalleryCard key={r.id} recipe={r} locale={locale} labels={l} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                href="/rezepte#alle"
                className="group inline-flex items-center gap-2 rounded-full bg-[#2D2F2C] px-7 py-3.5 font-display text-[0.95rem] font-bold text-[#FAF2E0] transition-colors hover:bg-black"
              >
                {l.allRecipes}
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        )}

        {/* ─── Workshop invitation, same ending as /rezepte ─── */}
        <section className={cn(WRAP, 'flex flex-col gap-5 pb-24 pt-12 md:gap-6 print:hidden')}>
          <WorkshopBlock
            locale={locale}
            labels={l}
            workshop={{
              eyebrow: l.workshopEyebrow,
              title: workshop?.title ?? pick(f?.bandTitle, LANDING_DEFAULTS[locale].featured.bandTitle),
              text: pick(f?.bandText, LANDING_DEFAULTS[locale].featured.bandText),
              button: l.toWorkshop,
              href: workshopHref,
              image: f?.bandImage,
            }}
          />
        </section>
      </article>
    </main>
  )
}
