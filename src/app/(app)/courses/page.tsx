import { RenderBlocks } from '@/blocks/RenderBlocks'
import { FadeIn } from '@/components/FadeIn'
import { TestimonialsGlobalWrapper } from '@/components/TestimonialsGlobalWrapper'
import { ContentSection } from '@/components/ui/ContentSection'
import type { FeatureCardsBlock, Page as PageType } from '@/payload-types'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { Carrot, FlaskConical, Milk, Wheat, Wine, Wrench, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const DEFAULT_HERO_TITLE = 'Master Fermentation from Scratch'
const DEFAULT_HERO_DESCRIPTION =
  'Master the art of fermentation from home. Our online courses bring hands-on techniques, expert guidance, and a community of learners\u2014whenever and wherever you are.'

const LEARN_CARD_ICONS: LucideIcon[] = [
  Carrot, // Vegetable Fermentation
  Wine, // Fermented Beverages
  Wheat, // Sourdough Bread
  Milk, // Dairy Fermentation
  FlaskConical, // Safety & Science
  Wrench, // Troubleshooting
]

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Online Courses | FermentFreude',
    description: DEFAULT_HERO_DESCRIPTION,
  }
}

export default async function CoursesPage() {
  noStore()
  const locale = await getLocale()
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'courses' },
      ...(draft ? {} : { _status: { equals: 'published' } }),
    },
    limit: 1,
    depth: 2,
    draft,
    locale,
    overrideAccess: true,
  })
  const page = result.docs?.[0] as PageType | undefined
  const blocks = page?.layout ?? []

  // Extract the FeatureCards block for "What You'll Learn" — render inline with old grid style
  const featureCardsBlock = blocks.find((b) => b.blockType === 'featureCards') as
    | FeatureCardsBlock
    | undefined
  // All non-featureCards blocks are rendered via RenderBlocks (OnlineCourseSlider, etc.)
  const otherBlocks = blocks.filter((b) => b.blockType !== 'featureCards')

  const learnEyebrow = featureCardsBlock?.eyebrow ?? 'Overview'
  const learnHeading = featureCardsBlock?.heading ?? "What You'll Learn"
  const learnDescription = featureCardsBlock?.description
  const learnCards = (featureCardsBlock?.cards ?? []) as Array<{
    title?: string | null
    description?: string | null
  }>

  return (
    <article className="font-sans pb-0">
      {/* Hero — 3 rotated image cards, unique to courses page */}
      <section
        className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20"
        style={{ backgroundColor: 'var(--ff-cream)' }}
      >
        <div className="container relative mx-auto container-padding">
          <div className="grid min-h-[50vh] items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <div className="max-w-xl">
                <h1 className="font-display text-display font-bold leading-[1.05] tracking-tight text-ff-near-black">
                  {DEFAULT_HERO_TITLE}
                </h1>
                <p className="mt-6 text-body-lg leading-relaxed text-ff-gray-text">
                  {DEFAULT_HERO_DESCRIPTION}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="relative mx-auto h-full max-w-xl lg:max-w-none">
                <div className="relative aspect-4/3 lg:aspect-square">
                  {/* Bottom card — bread */}
                  <div className="absolute left-0 bottom-4 z-10 w-4/5 max-w-sm origin-bottom-left -rotate-4 overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 ease-out hover:-translate-y-1 hover:rotate-1">
                    <div className="relative aspect-4/3">
                      <Image
                        src="/courses-hero/bread.webp"
                        alt="Sourdough bread"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                  {/* Front card — vegetables */}
                  <div className="absolute left-10 top-6 z-30 w-4/5 max-w-sm origin-center rotate-1 overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.03] lg:left-16 lg:top-10">
                    <div className="relative aspect-4/3">
                      <Image
                        src="/courses-hero/veg.webp"
                        alt="Fermented vegetables"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                  {/* Upper-right card — kimchi */}
                  <div className="absolute right-0 top-2 z-20 w-3/4 max-w-sm origin-top-right rotate-5 overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-500 ease-out hover:-translate-y-1 hover:-rotate-1">
                    <div className="relative aspect-4/3">
                      <Image
                        src="/courses-hero/kimchi.webp"
                        alt="Kimchi"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* What You'll Learn — 6-icon grid (Ala's original layout) */}
      {learnCards.length > 0 && (
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
                const Icon = LEARN_CARD_ICONS[i] ?? CheckIcon
                return (
                  <FadeIn
                    key={i}
                    delay={80 + i * 60}
                    duration={0.6}
                    from="bottom"
                    className="h-full"
                  >
                    <div className="group flex h-full flex-col items-center rounded-xl border border-ff-border-light bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ff-gold-accent/30 hover:shadow-md">
                      <div className="flex size-10 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-5 text-ff-gold-accent" strokeWidth={2} />
                      </div>
                      <h3 className="mt-4 font-display text-subheading font-bold text-ff-near-black">
                        {card.title ?? ''}
                      </h3>
                      <p className="mt-2 flex-1 text-body leading-relaxed text-ff-gray-text">
                        {card.description ?? ''}
                      </p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </FadeIn>
        </ContentSection>
      )}

      {/* Course blocks from CMS (OnlineCourseSlider, etc.) */}
      <RenderBlocks blocks={otherBlocks as NonNullable<PageType['layout']>} />

      {/* Testimonials from global */}
      <TestimonialsGlobalWrapper />
    </article>
  )
}
