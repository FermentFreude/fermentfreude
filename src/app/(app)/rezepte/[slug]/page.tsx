import { Media as MediaComponent } from '@/components/Media'
import { getRecipeCategory } from '@/collections/Recipes/categories'
import type { Product, Recipe, Workshop } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { getLocale } from '@/utilities/getLocale'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { normalizeAppLocale, strictLocaleQuery, type AppLocale } from '@/utilities/payloadLocaleQuery'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

import { MotionStyles } from '../creative'
import { PrintButton } from './PrintButton'
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

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const locale = normalizeAppLocale(await getLocale())
  // /rezepte/kombucha etc. is a category page, not a recipe
  const asCategory = getRecipeCategory(slug)
  if (asCategory) return categoryMetadata(asCategory, locale)
  const recipe = await getRecipe(slug, locale)
  if (!recipe) return {}

  const baseUrl = getServerSideURL()
  const title = recipe.meta?.title || `${recipe.title} — Rezept | Fermentfreude`
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
  }
}

type FactIconName = 'clock' | 'calendar' | 'jar' | 'level-leicht' | 'level-mittel' | 'level-fortgeschritten'

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
  return (
    <div className="mb-14">
      <p className={cn(SMALL_CAPS, 'mb-5 text-[#2D2F2C]/55')}>
        {l.readyIn} {formatDays(days, l)}
      </p>
      <div className="relative mx-2 h-[2px] bg-[#2D2F2C]/15">
        <div className="absolute inset-y-0 left-0 w-full bg-[#E6BE68]" />
        {dots.map((at, i) => (
          <span key={`d${i}`} className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D2F2C]" style={{ left: `${at}%` }} />
        ))}
        {[0, 50, 100].map((at) => (
          <span key={at} className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#2D2F2C] bg-[#FFFEF9]" style={{ left: `${at}%` }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3">
        {stops.map((s, i) => (
          <div key={i} className={i === 0 ? 'text-left' : i === 2 ? 'text-right' : 'text-center'}>
            <p className="font-display text-[1rem] font-bold text-[#2D2F2C]">{s.title}</p>
            <p className="font-display text-[0.85rem] text-[#2D2F2C]/55">{s.sub}</p>
          </div>
        ))}
      </div>

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
  const recipe = await getRecipe(slug, locale)
  if (!recipe) notFound()

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

  const jsonLd = buildRecipeJsonLd(recipe, {
    url: `${baseUrl}/rezepte/${recipe.slug}`,
    baseUrl,
    categoryLabel: category ? catName : undefined,
    locale,
  })

  type Fact = { label: string; value: string; icon: FactIconName }
  const facts: Array<Fact | null> = [
    recipe.prepMinutes ? { label: l.prep, value: `${recipe.prepMinutes} ${l.minutes}`, icon: 'clock' } : null,
    recipe.fermentationDays ? { label: l.fermentation, value: formatDays(recipe.fermentationDays, l), icon: 'calendar' } : null,
    recipe.yield ? { label: l.yield, value: recipe.yield, icon: 'jar' } : null,
    difficulty ? { label: l.difficulty, value: difficulty, icon: `level-${recipe.difficulty ?? 'leicht'}` as FactIconName } : null,
  ]
  const visibleFacts = facts.filter((f): f is Fact => f !== null)

  const f = page.featured
  const noteName = pick(page.note?.name, NOTE_DEFAULTS[locale].name)
  const noteRole = pick(page.note?.role, NOTE_DEFAULTS[locale].role)

  return (
    <main className="min-h-screen bg-[#FFFEF9]">
      <MotionStyles />
      {/* print only the recipe: no site header/footer, no cookie banner */}
      <style media="print">{`#site-header,#site-footer,#site-splash,[role=dialog]{display:none!important}#main-content{margin:0!important;padding:0!important}@page{margin:1.5cm}`}</style>
      <script
        type="application/ld+json"
        // escape "<" so CMS text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <article>
        {/* ─── Top: text, facts and buttons left · photo right (phones: title → photo → facts) ─── */}
        <header
          className={cn(
            WRAP,
            'grid gap-6 pb-12 pt-8 md:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-x-16 lg:gap-y-8 lg:pb-16',
          )}
        >
          <div className="flex flex-col items-start gap-4 lg:self-end">
            <nav aria-label="Breadcrumb" className={cn(SMALL_CAPS, 'flex flex-wrap items-center gap-3 text-[#2D2F2C]/50 print:hidden')}>
              <Link href="/rezepte" className="hover:text-[#2D2F2C]">
                {l.overviewTitle}
              </Link>
              {category && (
                <>
                  <span aria-hidden>/</span>
                  <Link href={categoryHref} className="hover:text-[#2D2F2C]">
                    {catName}
                  </Link>
                </>
              )}
            </nav>
            <h1 className="font-display text-[clamp(2.3rem,4.6vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[#2D2F2C] text-balance">
              {recipe.title}
            </h1>
            <span aria-hidden className="h-[3px] w-12 bg-[#E6BE68]" />
            {recipe.summary && (
              <p className="max-w-[34rem] text-[clamp(1.05rem,1.3vw,1.2rem)] leading-[1.55] text-[#2D2F2C]/70">{recipe.summary}</p>
            )}
            {partnerLine && (
              <p className="font-display text-[0.95rem] text-[#2D2F2C]/65">
                {disclosureName(disclosure, l)}
                {partner?.name && <b className="ml-1 text-[#2D2F2C]">{partner.name}</b>}
              </p>
            )}
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 print:hidden">
            <Photo image={recipe.heroImage} ratio="aspect-[4/3] lg:aspect-[4/5]" className="rounded-[1.75rem] md:rounded-[2rem]" tint="#ECE5DE" priority />
          </div>

          <div className="flex flex-col gap-6 lg:self-start">
            {visibleFacts.length > 0 && (
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#2D2F2C]/10 bg-[#2D2F2C]/10 sm:grid-cols-4 lg:max-w-[30rem] lg:grid-cols-2">
                {visibleFacts.map((fact) => (
                  <div key={fact.label} className="flex items-center gap-3 bg-[#FFFEF9] px-4 py-3">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FAF2E0] text-[#2D2F2C]">
                      <FactIcon name={fact.icon} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <dt className="font-display text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#2D2F2C]/50">{fact.label}</dt>
                      <dd className="font-display text-[1rem] font-bold leading-tight text-[#2D2F2C]">{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <PrintButton
                label={l.printRecipe}
                className="inline-flex items-center gap-2 rounded-full border border-[#2D2F2C]/25 px-5 py-3.5 font-display text-[0.95rem] font-bold text-[#2D2F2C] transition-colors hover:border-[#2D2F2C]"
              />
            </div>
          </div>
        </header>

        {/* ─── Ingredients | Method ─── */}
        <div className={cn(WRAP, 'grid gap-12 py-14 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-20 lg:py-20')}>
          <aside aria-labelledby="zutaten" className="h-fit scroll-mt-24 rounded-[1.75rem] bg-[#FAF2E0] p-7 md:p-8 lg:sticky lg:top-28 print:static print:bg-transparent print:p-0">
            <h2 id="zutaten" className="scroll-mt-28 font-display text-[1.6rem] font-bold tracking-[-0.025em] text-[#2D2F2C]">
              {l.ingredients}
            </h2>
            {recipe.vessel && (
              <p className="mt-2 flex items-start gap-2 text-[0.92rem] leading-snug text-[#2D2F2C]/65">
                <svg aria-hidden viewBox="0 0 24 24" className="mt-px size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3.5h8M7 6.5h10" />
                  <path d="M7 6.5c-1.7 1-2.5 2.4-2.5 4.5v7a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-7c0-2.1-.8-3.5-2.5-4.5" />
                </svg>
                {recipe.vessel}
              </p>
            )}
            {/* tells people the list is tickable */}
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFFEF9] px-3 py-1.5 font-display text-[0.8rem] font-bold text-[#2D2F2C]/75 print:hidden">
              <span aria-hidden className="grid size-4 place-items-center rounded-[5px] bg-[#2D2F2C] text-[#FAF2E0]">
                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {l.checkHint}
            </p>
            {(recipe.ingredientGroups ?? []).map((group, gi) => (
              <div key={group.id ?? gi} className="mt-5">
                {group.title && <h3 className={cn(SMALL_CAPS, 'mb-2 text-[#2D2F2C]/60')}>{group.title}</h3>}
                <ul>
                  {(group.items ?? []).map((item, ii) => (
                    <li key={item.id ?? ii}>
                      {/* tap to tick off while cooking — plain checkbox, no script */}
                      <label className="group -mx-2.5 flex cursor-pointer items-baseline gap-3 rounded-xl px-2.5 py-2.5 text-[0.98rem] leading-snug transition-colors hover:bg-[#FFFEF9]/80">
                        <input type="checkbox" className="peer sr-only" />
                        <span
                          aria-hidden
                          className="relative top-[0.1em] grid size-5 shrink-0 place-items-center self-start rounded-[6px] border-2 border-[#2D2F2C]/45 bg-[#FFFEF9] text-transparent transition-colors group-hover:border-[#2D2F2C] peer-checked:border-[#2D2F2C] peer-checked:bg-[#2D2F2C] peer-checked:text-[#FAF2E0] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E6BE68] print:hidden"
                        >
                          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.4}>
                            <path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-[#2D2F2C] transition-opacity peer-checked:line-through peer-checked:opacity-45">
                          {item.name}
                          {item.note && <span className="text-[#2D2F2C]/55">, {item.note}</span>}
                        </span>
                        <span aria-hidden className="min-w-4 flex-1 translate-y-[-0.2em] border-b-2 border-dotted border-[#2D2F2C]/20" />
                        <b className="shrink-0 text-right font-display text-[#2D2F2C] transition-opacity peer-checked:opacity-45">{item.amount}</b>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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

            {/* ─── Note card: a tip from David (photo, name, role: Rezepte-Seite → Notiz-Karte) ─── */}
            {recipe.whyItWorks && (
              <figure className="relative mb-14 -rotate-[0.6deg] rounded-[1.5rem] bg-[#FAF2E0] p-6 pt-8 shadow-[0_22px_44px_-26px_rgb(29_29_29/40%)] md:p-8 md:pt-10 print:rotate-0 print:shadow-none">
                <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-[4deg] rounded-[3px] bg-[#E6BE68]/80 print:hidden" />
                <p className={cn(SMALL_CAPS, 'text-[#2D2F2C]/55')}>{l.whyItWorks}</p>
                <blockquote className="mt-3 text-[1.15rem] leading-relaxed text-[#2D2F2C] md:text-[1.22rem]">
                  „{recipe.whyItWorks}“
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {isResolvedMedia(page.note?.photo) ? (
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[#FFFEF9]">
                      <MediaComponent resource={page.note.photo} fill imgClassName="object-cover object-[50%_12%]" />
                    </span>
                  ) : (
                    <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-[#2D2F2C] font-display text-[1.1rem] font-bold text-[#FAF2E0]">
                      {noteName.charAt(0)}
                    </span>
                  )}
                  <span className="flex flex-col">
                    <span className="font-display text-[1.05rem] font-bold text-[#2D2F2C]">{noteName}</span>
                    <span className="text-[0.88rem] text-[#2D2F2C]/60">{noteRole}</span>
                  </span>
                  <svg aria-hidden viewBox="0 0 120 30" className="ml-auto h-7 w-24 text-[#2D2F2C]/35 print:hidden" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                    <path d="M3 22c8-14 14-17 16-10s-6 12-3 7 10-15 13-12-2 12 2 10 7-9 10-9 1 9 5 8 6-8 9-8 2 8 6 7 8-6 12-6 4 6 9 5 9-4 14-4 8 3 14 2" />
                  </svg>
                </figcaption>
              </figure>
            )}

            <h2 className="mb-8 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-[#2D2F2C]">{l.steps}</h2>
            <ol className="flex flex-col gap-10">
              {(recipe.steps ?? []).map((step, si) => (
                <li key={step.id ?? si} className="grid grid-cols-[2.75rem_1fr] gap-5">
                  <span className="flex size-11 items-center justify-center rounded-full border-2 border-[#2D2F2C] font-display text-[1.05rem] font-bold text-[#2D2F2C]">
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

            {/* ─── Partner (sponsored) — only when switched on ─── */}
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
          </section>
        )}

        {/* ─── Workshop invitation — same ending as /rezepte ─── */}
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
