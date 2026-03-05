import type { Metadata } from 'next'

import { EditPageLink } from '@/components/EditPageLink'
import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Fragment } from 'react'
import { getPayload } from 'payload'

import type { Media as MediaType, Page as PageType } from '@/payload-types'

import { DangerAccordion } from './DangerAccordion'
import { FaqAccordion } from './FaqAccordion'
import { PracticeAccordion } from './PracticeAccordion'
import { WhySection } from './WhySection'

type HeroBlock = { id?: string; title: string; description?: string; icon?: string | MediaType | null; url?: string }

const HERO_BLOCK_COLORS = ['#FAF2E0', '#E6BE68', '#4B4B4B', '#EDD195'] as const
const DEFAULT_HERO_BLOCKS: HeroBlock[] = [
  { title: 'Health & Well-being', description: 'Support your gut microbiome with probiotic-rich foods.' },
  { title: 'Unique Flavours', description: 'Discover complex umami and tangy taste profiles.' },
  { title: 'Simple Processes', description: 'No special equipment—just salt, time, and patience.' },
  { title: 'Learn & Share', description: 'Join workshops and connect with fermentation enthusiasts.' },
]

const DEFAULT_HERO_TITLE = 'Innovation meets Tradition'
const DEFAULT_HERO_DESCRIPTION =
  'Fermentation is more than sauerkraut or yogurt. It is a world full of taste, creativity and surprising aromas.'
const DEFAULT_GUIDE_TAG = 'Quick Guide'
const DEFAULT_GUIDE_TITLE = 'A complete guide to fermentation'
const DEFAULT_GUIDE_BODY =
  'Unlock the secrets of traditional preservation and create your own fermented delights.'
const DEFAULT_WHAT_TITLE = 'What is fermentation?'
const DEFAULT_WHAT_BODY =
  'Fermentation is a natural metabolic process where microorganisms like bacteria, yeast, and fungi convert organic compounds—usually carbohydrates—into alcohol, gases, or organic acids.'
const DEFAULT_WHAT_MOTTO = 'No additives. No shortcuts. Just patience and care.'
const DEFAULT_WHY_TITLE = 'Why is it so special?'
const DEFAULT_WHY_ITEMS: Array<{ id?: string; title: string; description: string }> = [
  { title: 'Improves gut flora and overall well-being', description: 'Fermented foods support a healthy microbiome.' },
  { title: 'Easy and cost-effective', description: 'No special equipment needed—just salt, time, and patience.' },
  { title: 'Eco-friendly and sustainable', description: 'Reduces food waste and extends shelf life naturally.' },
  { title: 'Rich in flavors and aromas', description: 'Creates complex umami and tangy profiles.' },
  { title: 'Supports a balanced lifestyle', description: 'Integrates traditional wisdom with modern nutrition.' },
  { title: 'Diverse applications', description: 'From vegetables to dairy, grains to beverages.' },
]
const DEFAULT_DANGER_TITLE = 'Is it dangerous?'
const DEFAULT_DANGER_INTRO =
  'Fermentation is one of the safest food preservation methods when done correctly. The acidic environment created during lacto-fermentation prevents harmful bacteria from growing.'
const DEFAULT_DANGER_CONCERNS_HEADING = 'Common concerns addressed:'
const DEFAULT_DANGER_CLOSING =
  'With proper hygiene, quality ingredients, and correct salt ratios, fermentation is a reliable and time-tested practice.'
const DEFAULT_DANGER_CONCERNS: Array<{ id?: string; title: string; description: string }> = [
  {
    title: 'Mold',
    description:
      'Common mold generally forms a fuzzy, green, black, or white layer on the surface. It\'s usually harmless if removed—fermentation creates an acidic environment that prevents harmful mold from penetrating.',
  },
  {
    title: 'Botulism',
    description:
      'Clostridium botulinum cannot grow in acidic environments (pH below 4.6). Lacto-fermented vegetables are well below that, making them safe.',
  },
  {
    title: 'Pathogens',
    description:
      'Fermentation increases acidity, which inhibits harmful bacteria. Proper salt ratios and hygiene further reduce risk.',
  },
  {
    title: 'Cross-contamination',
    description:
      'Using clean utensils and equipment, and keeping vegetables submerged in brine, prevents contamination.',
  },
]
const DEFAULT_PRACTICE_TITLE = 'A practice, not a trend'
const DEFAULT_PRACTICE_PARAGRAPHS = [
  'Fermentation has existed across cultures for thousands of years—from Korean kimchi to German sauerkraut, from Japanese miso to Ethiopian injera.',
  "It doesn't promise quick results. It rewards consistency, observation, and care.",
  'Each batch is different. You learn by doing—and by trusting the process. Temperature, salt, time, and intuition all play a role.',
  'This is food made slowly, with attention. It asks you to observe, taste, and adjust. In return, it offers nourishment, flavor, and a deeper relationship with what you eat.',
]
const DEFAULT_CTA_TITLE = 'Ready to learn?'
const DEFAULT_CTA_DESCRIPTION =
  'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.'
const DEFAULT_CTA_PRIMARY = 'View workshops'
const DEFAULT_CTA_PRIMARY_URL = '/workshops'
const DEFAULT_CTA_SECONDARY = 'Browse online courses'
const DEFAULT_CTA_SECONDARY_URL = '/workshops'
const DEFAULT_WORKSHOP_TITLE = 'Learn UNIQUE.'
const DEFAULT_WORKSHOP_TITLE_SUFFIX = 'FLAVOURS'
const DEFAULT_WORKSHOP_SUBTITLE =
  'Learn fermentation through taste hands-on workshops that turn fresh ingredients into vibrant, living food.'
const DEFAULT_WORKSHOP_VIEW_ALL = 'View All Dates'
const DEFAULT_WORKSHOP_VIEW_ALL_URL = '/workshops'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL = 'Next Date:'
const DEFAULT_WORKSHOP_CARDS = [
  {
    title: 'Lakto-Gemüse',
    description:
      'Ferment vegetables, experience flavours – different every month. Live online session.',
    price: '€99',
    priceSuffix: 'per person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/lakto-gemuese',
    nextDate: 'February 15, 2026',
  },
  {
    title: 'Kombucha',
    description:
      'Dive into the world of fermented tea – full of character and aromas. Interactive online.',
    price: '€99',
    priceSuffix: 'per person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/kombucha',
    nextDate: 'February 18, 2026',
  },
  {
    title: 'Tempeh',
    description:
      'Rediscover a plant-based protein source – mild, nutty and versatile. Online masterclass.',
    price: '€99',
    priceSuffix: 'per person',
    buttonLabel: 'More Info & Book',
    buttonUrl: '/workshops/tempeh',
    nextDate: 'February 20, 2026',
  },
]
const DEFAULT_FAQ_TITLE = 'Frequently Asked Questions'
const DEFAULT_FAQ_SUBTITLE = 'Common questions about fermentation answered'
const DEFAULT_FAQ_CTA_TITLE = 'Ready to Start Fermenting?'
const DEFAULT_FAQ_CTA_BODY =
  'Begin with simple vegetables like cabbage or cucumbers, use the proper salt ratio (2-3% by weight), and trust the process!'
const DEFAULT_FAQ_MORE = "Can't find your answer?"
const DEFAULT_FAQ_CONTACT = 'Contact Us'
const DEFAULT_FAQ_CONTACT_URL = '/contact'
const DEFAULT_FAQ_ITEMS: Array<{ id?: string; question: string; answer: string }> = [
  {
    question: 'Does fermentation kill bacteria?',
    answer:
      'Fermentation encourages beneficial bacteria (lactobacilli) while creating an acidic environment that inhibits harmful pathogens.',
  },
  {
    question: 'Can I ferment at room temperature?',
    answer:
      'Yes. Most lacto-fermentation works best at 18–24°C (65–75°F). Cooler slows the process; warmer speeds it up.',
  },
  {
    question: 'How long does fermentation take?',
    answer:
      'It varies. Sauerkraut can be ready in 1–2 weeks; kimchi in 3–5 days. Taste regularly to find your preference.',
  },
  {
    question: 'Is fermentation the same as pickling?',
    answer:
      'Not exactly. Pickling often uses vinegar (acid added). Fermentation creates acid naturally through bacteria.',
  },
  {
    question: 'Can I eat fermented foods every day?',
    answer:
      'Yes. Many cultures consume fermented foods daily. Start small and increase gradually to let your gut adjust.',
  },
  {
    question: 'Do fermented foods go bad?',
    answer:
      'They can. Signs: mold, off smell, slimy texture. Properly fermented foods stored in the fridge last months.',
  },
]

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Fermentation | Fermentfreude',
    description:
      'Discover the art of fermentation. A complete guide to lacto-fermentation, kombucha, and tempeh. Workshops and products for gut health.',
  }
}

export default async function FermentationPage() {
  const locale = await getLocale()
  const payload = await getPayload({ config: configPromise })
  const [fermentationResult, gastronomyResult] = await Promise.all([
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'fermentation' } },
      limit: 1,
      depth: 4,
      locale,
    }),
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'gastronomy' } },
      limit: 1,
      depth: 3,
      locale,
    }),
  ])
  const page = fermentationResult.docs[0] as PageType | undefined
  const f = page?.fermentation
  const g = (gastronomyResult.docs[0] as PageType | undefined)?.gastronomy

  // Resolve hero image if it's just an ID (depth didn't populate)
  let heroImage = f?.fermentationHeroImage
  if (heroImage && typeof heroImage === 'string') {
    try {
      const mediaDoc = await payload.findByID({
        collection: 'media',
        id: heroImage,
        depth: 0,
      })
      heroImage = mediaDoc as MediaType
    } catch {
      heroImage = undefined
    }
  }

  const heroTitle = f?.fermentationHeroTitle ?? DEFAULT_HERO_TITLE
  const heroDescription = f?.fermentationHeroDescription ?? DEFAULT_HERO_DESCRIPTION
  const heroBenefitsTitle = f?.fermentationHeroBenefitsTitle ?? 'WHY FERMENTATION?'
  let heroBlocks: HeroBlock[] =
    (f?.fermentationHeroBlocks?.length ?? 0) > 0
      ? (f?.fermentationHeroBlocks ?? []) as HeroBlock[]
      : DEFAULT_HERO_BLOCKS

  // Resolve hero block icons if they're just IDs
  if (heroBlocks.length > 0) {
    heroBlocks = (await Promise.all(
      heroBlocks.map(async (block): Promise<HeroBlock> => {
        const icon = block.icon
        if (icon && typeof icon === 'string') {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: icon,
              depth: 0,
            })
            return { ...block, icon: mediaDoc as MediaType }
          } catch {
            return block
          }
        }
        return block
      }),
    )) as HeroBlock[]
  }

  const _guideTag = f?.fermentationGuideTag ?? DEFAULT_GUIDE_TAG
  const guideTitle = f?.fermentationGuideTitle ?? DEFAULT_GUIDE_TITLE
  const guideBody = f?.fermentationGuideBody ?? DEFAULT_GUIDE_BODY
  const guideImage = f?.fermentationGuideImage

  const whatTitle = f?.fermentationWhatTitle ?? DEFAULT_WHAT_TITLE
  const whatBody = f?.fermentationWhatBody ?? DEFAULT_WHAT_BODY
  const whatMotto = f?.fermentationWhatMotto ?? DEFAULT_WHAT_MOTTO
  const _whatLinks = f?.fermentationWhatLinks ?? []
  const whatImage = f?.fermentationWhatImage

  const whyTitle = f?.fermentationWhyTitle ?? DEFAULT_WHY_TITLE
  const whyItems = (f?.fermentationWhyItems?.length ?? 0) > 0 ? (f?.fermentationWhyItems ?? []) : DEFAULT_WHY_ITEMS
  const whyImage = f?.fermentationWhyImage

  const dangerTitle = f?.fermentationDangerTitle ?? DEFAULT_DANGER_TITLE
  const dangerIntro = f?.fermentationDangerIntro ?? DEFAULT_DANGER_INTRO
  const dangerConcernsHeading = f?.fermentationDangerConcernsHeading ?? DEFAULT_DANGER_CONCERNS_HEADING
  const dangerConcerns =
    (f?.fermentationDangerConcerns?.length ?? 0) > 0
      ? (f?.fermentationDangerConcerns ?? [])
      : DEFAULT_DANGER_CONCERNS
  const dangerClosing = f?.fermentationDangerClosing ?? DEFAULT_DANGER_CLOSING

  const practiceTitle = f?.fermentationPracticeTitle ?? DEFAULT_PRACTICE_TITLE
  const practiceBody = f?.fermentationPracticeBody
  const practiceImage = f?.fermentationPracticeImage
  const practiceParagraphs = practiceBody
    ? practiceBody.split(/\n\n+/).filter(Boolean)
    : DEFAULT_PRACTICE_PARAGRAPHS

  const ctaTitle = f?.fermentationCtaTitle ?? DEFAULT_CTA_TITLE
  const ctaDescription = f?.fermentationCtaDescription ?? DEFAULT_CTA_DESCRIPTION
  const ctaPrimaryLabel = f?.fermentationCtaPrimaryLabel ?? DEFAULT_CTA_PRIMARY
  const ctaPrimaryUrl = f?.fermentationCtaPrimaryUrl ?? DEFAULT_CTA_PRIMARY_URL
  const ctaSecondaryLabel = f?.fermentationCtaSecondaryLabel ?? DEFAULT_CTA_SECONDARY
  const ctaSecondaryUrl = f?.fermentationCtaSecondaryUrl ?? DEFAULT_CTA_SECONDARY_URL
  const ctaVideoUrl = f?.fermentationCtaVideoUrl
  const ctaBackgroundImage = f?.fermentationCtaBackgroundImage

  // Workshop section — fermentation or gastronomy fallback
  const workshopTitle = f?.fermentationWorkshopTitle ?? DEFAULT_WORKSHOP_TITLE
  const workshopTitleSuffix = f?.fermentationWorkshopTitleSuffix ?? DEFAULT_WORKSHOP_TITLE_SUFFIX
  const workshopSubtitle =
    f?.fermentationWorkshopSubtitle ?? g?.gastronomyWorkshopSectionSubtitle ?? DEFAULT_WORKSHOP_SUBTITLE
  const workshopViewAllLabel = f?.fermentationWorkshopViewAllLabel ?? DEFAULT_WORKSHOP_VIEW_ALL
  const workshopViewAllUrl = f?.fermentationWorkshopViewAllUrl ?? DEFAULT_WORKSHOP_VIEW_ALL_URL
  const workshopNextDateLabel =
    f?.fermentationWorkshopNextDateLabel ?? g?.gastronomyWorkshopNextDateLabel ?? DEFAULT_WORKSHOP_NEXT_DATE_LABEL
  const workshopCards =
    (f?.fermentationWorkshopCards?.length ?? 0) > 0
      ? (f?.fermentationWorkshopCards ?? [])
      : (g?.gastronomyWorkshopCards?.length ?? 0) > 0
        ? (g?.gastronomyWorkshopCards ?? [])
        : DEFAULT_WORKSHOP_CARDS

  const faqTitle = f?.fermentationFaqTitle ?? DEFAULT_FAQ_TITLE
  const faqSubtitle = f?.fermentationFaqSubtitle ?? DEFAULT_FAQ_SUBTITLE
  const faqItems =
    (f?.fermentationFaqItems?.length ?? 0) > 0 ? (f?.fermentationFaqItems ?? []) : DEFAULT_FAQ_ITEMS
  const faqCtaTitle = f?.fermentationFaqCtaTitle ?? DEFAULT_FAQ_CTA_TITLE
  const faqCtaBody = f?.fermentationFaqCtaBody ?? DEFAULT_FAQ_CTA_BODY
  const _faqMoreText = f?.fermentationFaqMoreText ?? DEFAULT_FAQ_MORE
  const _faqContactLabel = f?.fermentationFaqContactLabel ?? DEFAULT_FAQ_CONTACT
  const _faqContactUrl = f?.fermentationFaqContactUrl ?? DEFAULT_FAQ_CONTACT_URL

  return (
    <article className="font-sans">
      {/* Hero — title + description, image, 4 boxes overlapping */}
      <section className="relative bg-[#FAFAF8]">
        <div className="content-full mx-auto px-6 pt-20 pb-12 md:px-12 md:pt-24 lg:px-20 lg:pb-16">
          {/* Title + description + WHY FERMENTATION? */}
          <div className="relative z-20">
            <h1 className="font-display text-hero font-bold text-ff-black md:text-display">
              {heroTitle}
            </h1>
            {heroDescription && (
              <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-ff-gray-text">
                {heroDescription}
              </p>
            )}
            <h2 className="mt-10 max-w-2xl font-display text-subheading font-bold uppercase tracking-wide md:mt-12" style={{ color: '#555954' }}>
              {heroBenefitsTitle}
            </h2>
          </div>

          {/* Image + 4 boxes — wrapped together */}
          <div className="mt-6 pt-8 md:mt-12 md:pt-[120px]">
            {/* Image of two people — in front of the boxes */}
            <div className="relative z-20 flex justify-center md:justify-end">
              <div
                className="relative aspect-[4/3] w-full min-h-[240px] max-w-3xl overflow-hidden md:max-h-[420px]"
                style={{ top: -80 }}
              >
                {isResolvedMedia(heroImage) ? (
                  <Media resource={heroImage} fill imgClassName="object-cover object-center" priority />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ff-gray-text/30 bg-[#E8E6E3]">
                    <span className="text-sm font-medium text-ff-gray-text">
                      Hero image
                    </span>
                    <span className="text-xs text-ff-gray-text/80">
                      Upload in Admin → Pages → Fermentation → Hero Image
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 boxes — behind the image */}
            <div className="relative z-0 -mt-12 pb-16 md:-mt-20 lg:-mt-28">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ position: 'inherit' }}>
                {heroBlocks.slice(0, 4).map((block, i) => {
                const bgColor = HERO_BLOCK_COLORS[i] ?? HERO_BLOCK_COLORS[0]
                const isDark = bgColor === '#4B4B4B'
                  const blockContent = (
                    <div
                      className="rounded-2xl p-6 text-center shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                      style={{ backgroundColor: bgColor }}
                    >
                      {/* 1. Icon (upload from Admin → Hero Blocks) */}
                      <div className="mx-auto mb-4 flex size-12 items-center justify-center [&_img]:animate-[gentle-float_3s_ease-in-out_infinite]">
                        {isResolvedMedia((block as { icon?: unknown }).icon) ? (
                          <Media
                            resource={(block as { icon?: MediaType }).icon}
                            width={48}
                            height={48}
                            imgClassName={`size-12 object-contain ${isDark ? 'brightness-0 invert' : ''}`}
                          />
                        ) : (
                          <div
                            className={`size-12 rounded-lg ${
                              isDark ? 'bg-white/20' : 'bg-ff-gray-text/10'
                            }`}
                            title="Upload icon in Admin → Pages → Fermentation → Hero Blocks"
                          />
                        )}
                      </div>
                      {/* 2. Title */}
                      <h3
                        className={`font-display text-sm font-bold uppercase tracking-wide ${
                          isDark ? 'text-white' : 'text-ff-black'
                        }`}
                      >
                        {block.title}
                      </h3>
                      {/* 3. Description */}
                      {block.description && (
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            isDark ? 'text-white/90' : 'text-ff-gray-text'
                          }`}
                        >
                          {block.description}
                        </p>
                      )}
                    </div>
                  )
                  return (
                    <Fragment key={block.id ?? i}>
                      {block.url ? (
                        <Link href={block.url} className="block">
                          {blockContent}
                        </Link>
                      ) : (
                        blockContent
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Organic wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-full w-full">
            <path d="M0 12 Q25 0 50 12 T100 12 V12 H0 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Guide section — A complete guide to fermentation */}
      <section className="bg-white pt-10 pb-4 md:pt-12 md:pb-5">
        <FadeIn delay={0}>
        <div className="content-medium mx-auto px-4 sm:px-6 text-center">
          {_guideTag && (
            <span className="font-display text-caption font-bold uppercase tracking-[0.2em] text-[#E6BE68]">
              {_guideTag}
            </span>
          )}
          <h2 className="font-display text-section-heading font-bold mt-2" style={{ color: '#555954' }}>
            {guideTitle}
          </h2>
          {guideBody && (
            <p className="mt-4 text-body leading-relaxed sm:mt-6 sm:text-body-lg mx-auto max-w-2xl" style={{ color: '#555954' }}>
              {guideBody}
            </p>
          )}
          {isResolvedMedia(guideImage) && (
            <div className="mx-auto mt-8 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl shadow-md">
              <Media resource={guideImage} fill imgClassName="object-cover object-center" />
            </div>
          )}
        </div>
        </FadeIn>
      </section>

      {/* What is fermentation? — warm, joyful block with image */}
      <section id="what" className="bg-white pt-8 pb-8 md:pt-10 md:pb-10">
        <FadeIn delay={100}>
        <div className="mx-auto max-w-379 px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5F0E8] via-[#FAF2E0] to-[#F9F0DC] p-6 sm:p-8 md:p-12 shadow-sm">
            <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[#E6BE68]/15 blur-3xl" aria-hidden />
            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center md:gap-12">
              <div className="order-2 md:order-1">
                <h2 className="font-display text-2xl font-bold leading-tight text-ff-black sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                  {whatTitle}
                </h2>
                {whatBody && (
                  <p className="mt-4 leading-relaxed text-ff-black/90 text-base sm:mt-6 sm:text-lg md:text-xl">
                    {whatBody}
                  </p>
                )}
                {whatMotto && (
                  <blockquote className="mt-8 sm:mt-10 md:mt-12">
                    <p className="font-display text-lg font-bold leading-relaxed text-ff-black sm:text-xl md:text-2xl">
                      <span className="text-[#E6BE68]">“</span>
                      {whatMotto.split('. ').filter(Boolean).map((phrase, i, arr) => (
                        <span key={i}>
                          {phrase}{phrase.endsWith('.') ? '' : '.'}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))}
                      <span className="text-[#E6BE68]">”</span>
                    </p>
                  </blockquote>
                )}
              </div>
              <div className="order-1 md:order-2 aspect-4/3 w-full overflow-hidden rounded-2xl shadow-md">
                {isResolvedMedia(whatImage) ? (
                  <Media resource={whatImage} fill imgClassName="object-cover object-center" />
                ) : isResolvedMedia(guideImage) ? (
                  <Media resource={guideImage} fill imgClassName="object-cover object-center" />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-3 bg-[#ECE5DE] text-center">
                    <span className="text-4xl" aria-hidden>🫙</span>
                    <span className="text-sm font-medium text-ff-gray-text max-w-[12rem]">
                      Add image in Admin → Pages → Fermentation → What Image
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* Why is it so special? — creative cards with icons */}
      {(whyItems.length > 0 || isResolvedMedia(whyImage)) && (
        <section className="bg-white pt-8 pb-8 md:pt-10 md:pb-10">
          <FadeIn delay={150}>
          <WhySection
            title={whyTitle}
            items={whyItems}
            image={whyImage}
          />
          </FadeIn>
        </section>
      )}

      {/* Is it dangerous? — collapsible accordion */}
      <section className="bg-white pt-8 pb-8 md:pt-10 md:pb-10">
        <FadeIn delay={200}>
        <div className="mx-auto max-w-379 px-4 sm:px-6">
          <DangerAccordion
            title={dangerTitle}
            intro={dangerIntro}
            concernsHeading={dangerConcernsHeading}
            concerns={dangerConcerns}
            closing={dangerClosing}
          />
        </div>
        </FadeIn>
      </section>

      {/* A practice, not a trend — compact, collapsible */}
      <section className="bg-white pt-8 pb-8 md:pt-10 md:pb-10">
        <FadeIn delay={250}>
        <div className="mx-auto max-w-379 px-4 sm:px-6">
          <PracticeAccordion
            title={practiceTitle}
            paragraphs={practiceParagraphs}
            image={practiceImage}
          />
        </div>
        </FadeIn>
      </section>

      {/* Ready to learn? CTA — gold block or video bg, two buttons */}
      <section className="bg-white pt-8 pb-8 md:pt-10 md:pb-10">
        <FadeIn delay={300}>
        <div className="mx-auto max-w-379 px-4 sm:px-6 text-center">
          <div className="relative min-h-70 overflow-hidden rounded-2xl bg-[#E6BE68] px-8 py-16 md:px-16 shadow-xl">
            {/* Optional video background */}
            {ctaVideoUrl ? (
              <>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 size-full object-cover"
                  poster={
                    isResolvedMedia(ctaBackgroundImage)
                      ? ((ctaBackgroundImage as MediaType).url ?? undefined)
                      : undefined
                  }
                >
                  <source src={ctaVideoUrl} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/60" aria-hidden />
              </>
            ) : (
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.4),rgba(255,255,255,0.1)_50%,transparent_70%)]"
                aria-hidden
              />
            )}
            <div className="relative z-10">
            <h2
              className={`font-display text-section-heading font-bold drop-shadow-md ${
                ctaVideoUrl ? 'text-white' : 'text-ff-black'
              }`}
            >
              {ctaTitle}
            </h2>
            {ctaDescription && (
              <p
                className={`mt-4 text-body-lg leading-relaxed drop-shadow-md ${
                  ctaVideoUrl ? 'text-white/95' : 'text-ff-black/90'
                }`}
              >
                {ctaDescription}
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={ctaPrimaryUrl}
                className={
                  ctaVideoUrl
                    ? 'inline-flex items-center justify-center rounded-full bg-[#E6BE68] px-8 py-3.5 font-display text-sm font-bold text-[#1a1a1a] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:bg-[#EDD195] hover:shadow-xl'
                    : 'inline-flex items-center justify-center rounded-full bg-[#333333] px-8 py-3.5 font-display text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:bg-[#1a1a1a] hover:shadow-xl'
                }
              >
                {ctaPrimaryLabel}
              </Link>
              <Link
                href={ctaSecondaryUrl}
                className={
                  ctaVideoUrl
                    ? 'inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-3.5 font-display text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:bg-white/20 hover:shadow-lg'
                    : 'inline-flex items-center justify-center rounded-full border-2 border-[#333333] bg-white px-8 py-3.5 font-display text-sm font-bold text-[#333333] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:border-[#1a1a1a] hover:bg-[#f5f5f5] hover:shadow-lg'
                }
              >
                {ctaSecondaryLabel}
              </Link>
            </div>
            </div>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* FAQ — accordion */}
      <section className="bg-white pt-8 pb-8 md:pt-10 md:pb-10">
        <FadeIn delay={350}>
        <div className="mx-auto max-w-[1516px] px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-section-heading font-bold text-ff-black">
              {faqTitle}
            </h2>
            {faqSubtitle && (
              <p className="mt-2 text-body text-ff-black/80 sm:text-body-lg">
                {faqSubtitle}
              </p>
            )}
          </div>
          <div className="mx-auto mt-8 max-w-4xl">
            <div className="rounded-2xl border border-[#333333]/10 bg-[#E8E6E3] p-6 sm:p-8 md:p-10 shadow-sm">
              <FaqAccordion items={faqItems} />
              {(faqCtaTitle || faqCtaBody) && (
                <div className="mt-8 rounded-xl bg-white/90 p-6 text-center sm:mt-10 sm:p-8 border border-[#333333]/5">
                  {faqCtaTitle && (
                    <h3 className="font-display text-subheading font-bold text-ff-black">
                      {faqCtaTitle}
                    </h3>
                  )}
                  {faqCtaBody && (
                    <p className="mx-auto mt-3 max-w-2xl text-body leading-relaxed text-ff-black/90 sm:text-body-lg">
                      {faqCtaBody}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* Workshop cards */}
      <FadeIn delay={400}>
      <WorkshopCardsSection
        title={
          workshopTitleSuffix ? `${workshopTitle} ${workshopTitleSuffix}` : workshopTitle
        }
        subtitle={workshopSubtitle}
        nextDateLabel={workshopNextDateLabel}
        viewAllLabel={workshopViewAllLabel}
        viewAllUrl={workshopViewAllUrl}
        sectionBg="white"
        cards={workshopCards.map((c) => ({
          id: (c as { id?: string }).id,
          title: c.title,
          description: c.description,
          image: (c as { image?: unknown }).image,
          price: (c as { price?: string }).price,
          priceSuffix: (c as { priceSuffix?: string }).priceSuffix,
          buttonLabel: (c as { buttonLabel?: string }).buttonLabel,
          buttonUrl: (c as { buttonUrl?: string }).buttonUrl,
          nextDate: (c as { nextDate?: string }).nextDate,
        }))}
        cardBg="#ffffff"
        layout="inline"
      />
      </FadeIn>

      {page?.id && (
        <EditPageLink collection="pages" id={String(page.id)} label="Edit page in Admin" />
      )}
    </article>
  )
}
