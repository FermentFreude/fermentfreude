import type { Metadata } from 'next'

import { AddToCart } from '@/components/Cart/AddToCart'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { EditPageLink } from '@/components/EditPageLink'
import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { ContentSection } from '@/components/ui/ContentSection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import {
  Bell,
  BookOpen,
  Carrot,
  Clock,
  FlaskConical,
  Milk,
  type LucideIcon,
  User,
  Wheat,
  Wine,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { getPayload } from 'payload'

import type { Media as MediaType, Page as PageType, Product } from '@/payload-types'
import { NotifyMeDialog } from '@/components/courses/NotifyMeDialog'

const LEARN_CARD_ICONS: LucideIcon[] = [
  Carrot, // Vegetable Fermentation
  Wine, // Fermented Beverages
  Wheat, // Sourdough Bread
  Milk, // Dairy Fermentation
  FlaskConical, // Safety & Science
  Wrench, // Troubleshooting
]

/* ═══════════════════════════════════════════════════════════════
 *  HARDCODED DEFAULTS (English — CMS data always wins)
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_HERO_TITLE = 'Master Fermentation from Scratch'
const DEFAULT_HERO_DESCRIPTION =
  'Master the art of fermentation from home. Our online courses bring hands-on techniques, expert guidance, and a community of learners—whenever and wherever you are.'

const DEFAULT_LEARN_HEADING = "What You'll Learn"
const DEFAULT_MODULES_HEADING = 'Course Modules'
const DEFAULT_WORKSHOPS_HEADING = 'More Courses on the Way'
const DEFAULT_ADD_TO_CART = 'Buy Now'
const DEFAULT_DETAILS = 'More Info'
const DEFAULT_AVAILABLE = 'Available Immediately'
const _DEFAULT_COMING_SOON_TITLE = 'Course Coming Soon'
const _DEFAULT_COMING_SOON_DESC = 'New courses are in the works. Stay tuned!'
const _DEFAULT_LEARN_MORE = 'Learn More'
const DEFAULT_NOTIFY_ME = 'Notify Me When Available'

const DEFAULT_LEARN_CARDS: Array<{ title: string; description: string }> = [
  { title: 'Vegetable Fermentation', description: 'Master sauerkraut, kimchi, and pickled vegetables with traditional and modern techniques.' },
  { title: 'Fermented Beverages', description: 'Brew kombucha, water kefir, and other probiotic drinks at home.' },
  { title: 'Sourdough Bread', description: 'Create and maintain a starter; bake artisan loaves with a perfect crust.' },
  { title: 'Dairy Fermentation', description: 'Make yogurt, kefir, and cultured dairy with optimal probiotics.' },
  { title: 'Safety & Science', description: 'Understand fermentation science, equipment, and food safety.' },
  { title: 'Troubleshooting', description: 'Identify and fix common fermentation issues with expert guidance.' },
]

const DEFAULT_MODULES: Array<{ title: string; lessons: Array<{ title: string; locked: boolean }> }> = [
  {
    title: 'Basic Fermentation Course',
    lessons: [
      { title: 'Welcome and Overview', locked: false },
      { title: 'What is Fermentation?', locked: false },
      { title: 'Essential Equipment', locked: true },
    ],
  },
]

const DEFAULT_WORKSHOP_CARDS: Array<{ title: string; description: string; comingSoonBadge?: string }> = [
  { title: 'Advanced Miso & Koji', description: 'Deep dive into koji and miso making.', comingSoonBadge: 'Coming Soon' },
  { title: 'Fermented Hot Sauces', description: 'Craft fermented hot sauces and condiments.', comingSoonBadge: 'Coming Soon' },
  { title: 'Tempeh & Plant-Based', description: 'Master tempeh and plant-based fermentation.', comingSoonBadge: 'Coming Soon' },
]

function isResolvedProduct(p: unknown): p is Product {
  return typeof p === 'object' && p !== null && 'id' in p && 'title' in p
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Online Courses | FermentFreude',
    description:
      'Learn fermentation anytime, anywhere. Browse our online workshops in lacto-fermentation, kombucha, tempeh, kimchi, and more.',
  }
}

type CoursesPageProps = {
  searchParams?: Promise<{ defaults?: string }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  noStore()
  const locale = await getLocale()
  const params = await searchParams
  const forceDefaults =
    params?.defaults === '1' ||
    process.env.ONLINE_COURSES_USE_DEFAULTS === '1' ||
    process.env.ONLINE_COURSES_USE_DEFAULTS === 'true'

  const payload = await getPayload({ config: configPromise })
  const result = forceDefaults
    ? { docs: [] as PageType[] }
    : await payload.find({
        collection: 'pages',
        where: { slug: { equals: 'courses' } },
        limit: 1,
        depth: 5,
        draft: false,
        locale,
        overrideAccess: true,
      })

  const page = result.docs?.[0] as PageType | undefined
  const oc = forceDefaults ? undefined : page?.onlineCourses

  // Resolve media by ID when Payload returns unpopulated relations (so images show locally)
  const mediaMap = new Map<string, MediaType>()
  if (oc) {
    const mediaIds = new Set<string>()
    const addId = (v: unknown) => {
      if (v == null) return
      if (typeof v === 'object' && v !== null && 'id' in v) {
        const id = (v as { id: unknown }).id
        if (typeof id === 'string' || typeof id === 'number') mediaIds.add(String(id))
      } else if (typeof v === 'string' || typeof v === 'number') mediaIds.add(String(v))
    }
    addId(oc.onlineCoursesHeroImage)
    addId(oc.onlineCoursesHeroImageBread)
    addId(oc.onlineCoursesHeroImageVeg)
    addId(oc.onlineCoursesHeroImageKimchi)
    ;((oc.onlineCoursesWorkshopCards ?? []) as Array<{ image?: unknown }>).forEach((c) => addId(c.image))

    for (const id of mediaIds) {
      try {
        const doc = await payload.findByID({
          collection: 'media',
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (doc?.id != null) {
          const mediaDoc = doc as unknown as MediaType
          const rawUrl = typeof mediaDoc?.url === 'string' && mediaDoc.url.length > 0 ? mediaDoc.url : null
          const filename = typeof mediaDoc?.filename === 'string' && mediaDoc.filename.length > 0 ? mediaDoc.filename : null
          const urlValid = rawUrl && (rawUrl.startsWith('http') || rawUrl.startsWith('/')) && !rawUrl.includes('undefined')
          // In development, prefer /media/filename so local public/media (written by seed) is used; R2 URL may 404 locally
          const useLocal = process.env.NODE_ENV === 'development' && filename
          const resolvedUrl = useLocal ? `/media/${filename}` : (urlValid ? rawUrl : filename ? `/media/${filename}` : null)
          if (resolvedUrl) {
            mediaMap.set(String(doc.id), {
              id: doc.id,
              url: resolvedUrl,
              filename: filename ?? undefined,
              alt: mediaDoc?.alt,
              width: mediaDoc?.width ?? undefined,
              height: mediaDoc?.height ?? undefined,
            } as MediaType)
          }
        }
      } catch {
        // Skip this media
      }
    }
  }
  const resolveMedia = (v: unknown): MediaType | null => {
    if (v == null) return null
    const id =
      typeof v === 'object' && v !== null && 'id' in v
        ? String((v as { id: unknown }).id)
        : typeof v === 'string' || typeof v === 'number'
          ? String(v)
          : null
    const fromMap = id ? mediaMap.get(String(id)) : null
    if (fromMap && typeof fromMap.url === 'string') return fromMap
    const mediaUrl = typeof v === 'object' && v !== null && 'url' in v ? (v as MediaType).url : undefined
    if (typeof mediaUrl === 'string' && mediaUrl.length > 0) return v as MediaType
    return fromMap ?? null
  }

  // Fetch home page for Testimonials + TeamPreview blocks
  let testimonialsBlock: NonNullable<PageType['layout']>[number] | undefined
  let teamPreviewBlock: NonNullable<PageType['layout']>[number] | undefined
  if (!forceDefaults) {
    const homeResult = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' }, _status: { equals: 'published' } },
      limit: 1,
      depth: 2,
      draft: false,
      locale,
    })
    const homePage = homeResult.docs?.[0] as PageType | undefined
    const homeBlocks = homePage?.layout ?? []
    testimonialsBlock = homeBlocks.find(
      (block) => block?.blockType === 'testimonials',
    ) as NonNullable<PageType['layout']>[number] | undefined
    teamPreviewBlock = homeBlocks.find(
      (block) => block?.blockType === 'teamPreview',
    ) as NonNullable<PageType['layout']>[number] | undefined
  }

  const heroTitle = oc?.onlineCoursesHeroTitle ?? DEFAULT_HERO_TITLE
  const heroDescription = oc?.onlineCoursesHeroDescription ?? DEFAULT_HERO_DESCRIPTION
  const heroCtaLabel = oc?.onlineCoursesHeroCtaLabel
  const heroCtaUrl = oc?.onlineCoursesHeroCtaUrl ?? '#workshops'
  const heroCta2Label = oc?.onlineCoursesHeroCta2Label
  const heroCta2Url = oc?.onlineCoursesHeroCta2Url ?? '#workshops'
  const heroImageBreadResolved = resolveMedia(oc?.onlineCoursesHeroImageBread ?? oc?.onlineCoursesHeroImage)
  const heroImageVegResolved = resolveMedia(oc?.onlineCoursesHeroImageVeg ?? oc?.onlineCoursesHeroImage)
  const heroImageKimchiResolved = resolveMedia(oc?.onlineCoursesHeroImageKimchi ?? oc?.onlineCoursesHeroImage)

  const learnEyebrow = oc?.onlineCoursesLearnEyebrow ?? 'Overview'
  const learnHeading = oc?.onlineCoursesWhyHeading ?? DEFAULT_LEARN_HEADING
  const learnDescription = oc?.onlineCoursesWhyDescription
  const learnCardsRaw = oc?.onlineCoursesWhyCards ?? []
  const learnCards = learnCardsRaw.length > 0 ? learnCardsRaw : DEFAULT_LEARN_CARDS.map((c) => ({ title: c.title, description: c.description }))

  const modulesEyebrow = oc?.onlineCoursesModulesEyebrow ?? 'Course Overview'
  const modulesHeading = oc?.onlineCoursesModulesHeading ?? DEFAULT_MODULES_HEADING
  const modulesRaw = (oc?.onlineCoursesModules ?? []) as Array<{
    id?: string
    title?: string
    lessons?: Array<{ id?: string; title?: string; locked?: boolean }>
  }>
  const modules = modulesRaw.length > 0 ? modulesRaw : DEFAULT_MODULES.map((m) => ({ title: m.title, lessons: m.lessons }))
  const modulesButtonLabel = oc?.onlineCoursesModulesButtonLabel
  const modulesButtonUrl = oc?.onlineCoursesModulesButtonUrl ?? '#workshops'

  const exploreEyebrow = oc?.onlineCoursesExploreEyebrow ?? 'Explore'
  const workshopsHeading = oc?.onlineCoursesWorkshopsHeading ?? DEFAULT_WORKSHOPS_HEADING
  const workshopsDescription = oc?.onlineCoursesWorkshopsDescription
  const workshopsSectionBadge = oc?.onlineCoursesComingSoonSectionBadge
  const workshopCardsRaw = oc?.onlineCoursesWorkshopCards ?? []
  const workshopCards = workshopCardsRaw.length > 0 ? workshopCardsRaw : DEFAULT_WORKSHOP_CARDS.map((c) => ({ title: c.title, description: c.description, comingSoonBadge: c.comingSoonBadge }))
  const notifyMeLabel = locale === 'de' ? 'Benachrichtige mich' : DEFAULT_NOTIFY_ME

  const heroEyebrow = oc?.onlineCoursesHeroEyebrow
  const heroCtaHint = oc?.onlineCoursesHeroCtaHint
  const howHeading = oc?.onlineCoursesHowHeading
  const howStepsRaw = (oc?.onlineCoursesHowSteps ?? []) as Array<{ id?: string; title?: string; description?: string }>
  const howSteps = howStepsRaw.length > 0 ? howStepsRaw : []

  return (
    <article className="font-sans pb-0">
      {/* 1. Hero — light warm yellow theme, stats, dual CTAs, featured image */}
      <section
        className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20"
        style={{ backgroundColor: 'var(--ff-cream)' }}
      >
        <div className="container relative mx-auto container-padding">
          <div className="grid min-h-[50vh] items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <div className="max-w-xl">
                {heroEyebrow && (
                  <span className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
                    {heroEyebrow}
                  </span>
                )}
                <h1 className="font-display text-display font-bold leading-[1.05] tracking-tight text-ff-near-black">
                  {heroTitle}
                </h1>
                {heroDescription && (
                  <p className="mt-6 text-body-lg leading-relaxed text-ff-gray-text">
                    {heroDescription}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-4">
                  {heroCtaLabel && heroCtaUrl && (
                    <Link
                      href={heroCtaUrl}
                      className="inline-flex items-center justify-center rounded-lg bg-ff-gold-accent px-8 py-3.5 font-display font-bold text-ff-near-black transition-all hover:bg-ff-gold-accent-dark hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {heroCtaLabel}
                    </Link>
                  )}
                  {heroCta2Label && heroCta2Url && (
                    <Link
                      href={heroCta2Url}
                      className="inline-flex items-center justify-center rounded-lg border-2 border-ff-charcoal bg-transparent px-8 py-3.5 font-display font-bold text-ff-charcoal transition-all hover:bg-ff-warm-gray/30"
                    >
                      {heroCta2Label}
                    </Link>
                  )}
                </div>
                {heroCtaHint && (
                  <p className="mt-3 text-body text-ff-gray-text">{heroCtaHint}</p>
                )}
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="relative mx-auto h-full max-w-xl lg:max-w-none">
                <div className="relative aspect-[4/3] lg:aspect-square">
                  {/* Bottom card (bread) — CMS url or static fallback /courses-hero/bread.webp */}
                  <div className="absolute left-0 bottom-4 z-10 w-4/5 max-w-sm origin-bottom-left -rotate-4 overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 ease-out hover:-translate-y-1 hover:rotate-1">
                    <div className="relative aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroImageBreadResolved?.url ?? '/courses-hero/bread.webp'}
                        alt={typeof heroImageBreadResolved?.alt === 'string' ? heroImageBreadResolved.alt : 'Sourdough bread'}
                        className="size-full object-cover"
                        fetchPriority="high"
                      />
                    </div>
                  </div>

                  {/* Top/front card (veg) */}
                  <div className="absolute left-10 top-6 z-30 w-4/5 max-w-sm origin-center rotate-1 overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.03] lg:left-16 lg:top-10">
                    <div className="relative aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroImageVegResolved?.url ?? '/courses-hero/veg.webp'}
                        alt={typeof heroImageVegResolved?.alt === 'string' ? heroImageVegResolved.alt : 'Vegetables in jar'}
                        className="size-full object-cover"
                        fetchPriority="high"
                      />
                    </div>
                  </div>

                  {/* Upper-right card (kimchi) */}
                  <div className="absolute right-0 top-2 z-20 w-3/4 max-w-sm origin-top-right rotate-5 overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 ease-out hover:-translate-y-1 hover:-rotate-1">
                    <div className="relative aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroImageKimchiResolved?.url ?? '/courses-hero/kimchi.webp'}
                        alt={typeof heroImageKimchiResolved?.alt === 'string' ? heroImageKimchiResolved.alt : 'Kimchi'}
                        className="size-full object-cover"
                        fetchPriority="high"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 2. What You'll Learn — 6 cards, 2x3 grid */}
      <ContentSection bg="white" padding="sm">
        <FadeIn delay={50}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
              {learnEyebrow}
            </span>
            <h2 className="mt-2 font-display text-section-heading font-bold text-ff-near-black">
              {learnHeading}
            </h2>
            {learnDescription && (
              <p className="mt-4 text-body-lg leading-relaxed text-ff-gray-text">
                {learnDescription}
              </p>
            )}
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />
          </div>
          <div className="mt-14 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learnCards.slice(0, 6).map((card, i) => {
              const c = card as { icon?: unknown; title?: string; description?: string }
              const Icon = LEARN_CARD_ICONS[i] ?? CheckIcon
              return (
                <FadeIn key={i} delay={80 + i * 60} duration={0.6} from="bottom" className="h-full">
                  <div className="group flex h-full flex-col items-center rounded-xl border border-ff-border-light bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ff-gold-accent/30 hover:shadow-md">
                    <div className="flex size-10 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5 text-ff-gold-accent" strokeWidth={2} />
                    </div>
                    <h3 className="mt-4 font-display text-subheading font-bold text-ff-near-black">
                      {c.title ?? ''}
                    </h3>
                    <p className="mt-2 flex-1 text-body leading-relaxed text-ff-gray-text">
                      {c.description ?? ''}
                    </p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      </ContentSection>

      {/* 3. Course Modules */}
      <ContentSection bg="white" padding="sm" className="!pt-6 md:!pt-8">
        <FadeIn delay={100}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
              {modulesEyebrow}
            </span>
            <h2 className="mt-2 font-display text-section-heading font-bold text-ff-near-black">
              {modulesHeading}
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />
          </div>
          <div className="mx-auto mt-12 max-w-2xl space-y-6">
            {modules.map((mod, i) => (
              <FadeIn key={'id' in mod && mod.id ? mod.id : `mod-${i}`} delay={120 + i * 80} duration={0.6} from="bottom">
                <div className="text-center">
                  <h3 className="font-display text-subheading font-bold text-ff-near-black">
                    {mod.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {(mod.lessons ?? []).map((lesson, j) => (
                      <li
                        key={'id' in lesson && lesson.id ? lesson.id : `lesson-${j}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-ff-border-light bg-ff-cream/50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ff-gold-accent/20">
                            <CheckIcon className="size-4 text-ff-olive" />
                          </div>
                          <span className="text-body text-ff-near-black">{lesson.title}</span>
                        </div>
                        {lesson.locked && (
                          <svg
                            className="size-5 shrink-0 text-ff-gray-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
          {modulesButtonLabel && modulesButtonUrl && (
            <FadeIn delay={300}>
              <div className="mt-10 flex justify-center">
                <Link
                  href={modulesButtonUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-ff-gold-accent px-8 py-3.5 font-display font-bold text-ff-near-black transition-all hover:bg-ff-gold-accent-dark"
                >
                  {modulesButtonLabel}
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </FadeIn>
          )}
        </FadeIn>
      </ContentSection>

      {/* 3b. How It Works — steps from CMS */}
      {howHeading && howSteps.length > 0 && (
        <ContentSection bg="white" padding="sm">
          <FadeIn delay={80}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-section-heading font-bold text-ff-near-black">
                {howHeading}
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {howSteps.map((step, i) => (
                <FadeIn key={step.id ?? i} delay={100 + i * 80} duration={0.6} from="bottom">
                  <div className="flex flex-col rounded-xl border border-ff-border-light bg-ff-cream/30 p-6 text-center">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ff-gold-accent/20 font-display text-xl font-bold text-ff-gold-accent-dark mx-auto">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 font-display text-subheading font-bold text-ff-near-black">
                      {step.title ?? ''}
                    </h3>
                    {step.description && (
                      <p className="mt-2 text-body leading-relaxed text-ff-gray-text">
                        {step.description}
                      </p>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </ContentSection>
      )}

      {/* 4. More Courses on the Way — workshop cards + coming soon */}
      <ContentSection bg="white" padding="sm" id="workshops">
        <FadeIn delay={150}>
          <div className="mx-auto max-w-3xl text-center">
            {workshopsSectionBadge && (
              <div className="inline-flex items-center gap-2 rounded-full bg-ff-gold-accent/20 px-4 py-1.5 text-sm font-semibold text-ff-gold-accent-dark">
                <Bell className="size-4 shrink-0" strokeWidth={2} />
                {workshopsSectionBadge}
              </div>
            )}
            {!workshopsSectionBadge && (
              <span className="text-caption font-display font-semibold uppercase tracking-[0.2em] text-ff-gold-accent">
                {exploreEyebrow}
              </span>
            )}
            <h2 className="mt-3 font-display text-section-heading font-bold text-ff-near-black">
              {workshopsHeading}
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ff-gold-accent" aria-hidden />
            {workshopsDescription && (
              <p className="mt-4 text-body-lg leading-relaxed text-ff-gray-text">
                {workshopsDescription}
              </p>
            )}
          </div>
          <div
            className={`mt-14 grid auto-rows-fr gap-6 sm:gap-8 ${
              workshopCards.length <= 2 ? 'mx-auto max-w-4xl sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {workshopCards.map((card, i) => {
              const c = card as {
                id?: string
                image?: unknown
                title?: string
                description?: string
                price?: string
                durationText?: string
                product?: Product | string | number
                detailsUrl?: string
                detailsLabel?: string
                instructor?: string
                levelText?: string
                comingSoonBadge?: string
              }
              const product = c.product
              const resolvedProduct =
                product && isResolvedProduct(product) ? product : undefined
              const image = resolveMedia(c.image)
              const isComingSoon = !resolvedProduct && (c.comingSoonBadge ?? c.title)

              return (
                <FadeIn key={c.id ?? i} delay={180 + i * 60} duration={0.6} from="bottom" className="h-full min-h-0">
                  <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ff-border-light">
                    <div className="relative aspect-[3/2] shrink-0 overflow-hidden">
                      {image ? (
                        <Media
                          resource={image}
                          fill
                          imgClassName="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          className="relative aspect-[3/2]"
                        />
                      ) : (
                        <div className="size-full bg-ff-warm-gray" />
                      )}
                      {isComingSoon && c.comingSoonBadge && (
                        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-ff-gold-accent px-3 py-1.5 text-ff-near-black shadow-sm">
                          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <span className="text-sm font-semibold">{c.comingSoonBadge}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col p-6">
                      <h3 className="font-display text-[1.125rem] font-bold leading-snug text-ff-near-black">
                        {c.title ?? ''}
                      </h3>
                      {c.description && (
                        <p className="mt-2 text-[0.875rem] leading-relaxed text-ff-gray-text">
                          {c.description}
                        </p>
                      )}
                      {isComingSoon ? (
                        <>
                          <div className="mt-4 space-y-2 text-[0.8125rem] text-ff-gray-text">
                            {c.instructor && (
                              <div className="flex items-center gap-2">
                                <User className="size-4 shrink-0 text-ff-gray-muted" strokeWidth={2} />
                                <span>Instructor: {c.instructor}</span>
                              </div>
                            )}
                            {c.durationText && (
                              <div className="flex items-center gap-2">
                                <Clock className="size-4 shrink-0 text-ff-gray-muted" strokeWidth={2} />
                                <span>{c.durationText}</span>
                              </div>
                            )}
                            {c.levelText && (
                              <div className="flex items-center gap-2">
                                <BookOpen className="size-4 shrink-0 text-ff-gray-muted" strokeWidth={2} />
                                <span>{c.levelText}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-5 flex-1" aria-hidden />
                          <NotifyMeDialog
                            courseTitle={c.title ?? 'FermentFreude course'}
                            courseSlug={c.detailsUrl}
                            locale={locale}
                            buttonLabel={notifyMeLabel}
                            triggerClassName="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ff-border-light bg-ff-cream/50 py-3 text-[0.875rem] font-semibold text-ff-gray-text transition-colors hover:bg-ff-cream"
                          />
                        </>
                      ) : (
                        <>
                          <div className="mt-4 flex-1 min-h-0" aria-hidden />
                          <div className="mt-4 flex items-baseline gap-2">
                            {c.price && (
                              <span className="font-display text-[1.25rem] font-bold text-ff-near-black">
                                {c.price}
                              </span>
                            )}
                            {c.durationText && (
                              <span className="text-[0.8125rem] text-ff-gray-text-light">
                                {c.durationText}
                              </span>
                            )}
                          </div>
                          <div className="mt-4 flex gap-3">
                            {c.detailsUrl && (
                              <Link
                                href={c.detailsUrl}
                                className="flex flex-1 items-center justify-center rounded-full border border-ff-charcoal bg-white py-3 text-[0.875rem] font-semibold text-ff-charcoal transition-colors hover:bg-ff-warm-gray/30"
                              >
                                {c.detailsLabel ?? DEFAULT_DETAILS}
                              </Link>
                            )}
                            {resolvedProduct ? (
                              <AddToCart
                                product={resolvedProduct}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ff-charcoal py-3 text-[0.875rem] font-semibold text-white transition-colors hover:bg-ff-charcoal-hover"
                              >
                                {DEFAULT_ADD_TO_CART}
                                <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </AddToCart>
                            ) : c.detailsUrl ? (
                              <Link
                                href={c.detailsUrl}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ff-charcoal py-3 text-[0.875rem] font-semibold text-white transition-colors hover:bg-ff-charcoal-hover"
                              >
                                {DEFAULT_ADD_TO_CART}
                                <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ) : null}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-[0.8125rem] text-ff-charcoal">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-ff-charcoal">
                              <CheckIcon className="size-3 text-ff-charcoal" />
                            </span>
                            {DEFAULT_AVAILABLE}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      </ContentSection>

      {/* 5. Unser Team — from Home page */}
      {teamPreviewBlock && (
        <RenderBlocks blocks={[teamPreviewBlock] as NonNullable<PageType['layout']>} />
      )}

      {/* 6. Testimonials — Was IHNEN AN UNSEREM Fermentationskurs gefällt — from Home page */}
      {testimonialsBlock && (
        <RenderBlocks blocks={[testimonialsBlock] as NonNullable<PageType['layout']>} />
      )}

      {page?.id && (
        <EditPageLink collection="pages" id={String(page.id)} label="Edit page in Admin" />
      )}
    </article>
  )
}
