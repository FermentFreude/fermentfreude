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

const HERO_BLOCK_COLORS = ['#FAF2E0', '#E6BE68', '#4B4B4B', '#EDD195'] as const

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
const DEFAULT_DANGER_TITLE = 'Is it dangerous?'
const DEFAULT_DANGER_INTRO =
  'Fermentation is one of the safest food preservation methods when done correctly. The acidic environment created during lacto-fermentation prevents harmful bacteria from growing.'
const DEFAULT_DANGER_CONCERNS_HEADING = 'Common concerns addressed:'
const DEFAULT_DANGER_CLOSING =
  'With proper hygiene, quality ingredients, and correct salt ratios, fermentation is a reliable and time-tested practice.'
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
  let heroBlocks = f?.fermentationHeroBlocks ?? []

  // Resolve hero block icons if they're just IDs
  if (heroBlocks.length > 0) {
    heroBlocks = await Promise.all(
      heroBlocks.map(async (block) => {
        const icon = (block as { icon?: unknown }).icon
        if (icon && typeof icon === 'string') {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: icon,
              depth: 0,
            })
            return { ...block, icon: mediaDoc }
          } catch {
            return block
          }
        }
        return block
      }),
    )
  }

  const guideTag = f?.fermentationGuideTag ?? DEFAULT_GUIDE_TAG
  const guideTitle = f?.fermentationGuideTitle ?? DEFAULT_GUIDE_TITLE
  const guideBody = f?.fermentationGuideBody ?? DEFAULT_GUIDE_BODY
  const guideImage = f?.fermentationGuideImage

  const whatTitle = f?.fermentationWhatTitle ?? DEFAULT_WHAT_TITLE
  const whatBody = f?.fermentationWhatBody ?? DEFAULT_WHAT_BODY
  const whatMotto = f?.fermentationWhatMotto ?? DEFAULT_WHAT_MOTTO
  const whatLinks = f?.fermentationWhatLinks ?? []
  const whatImage = f?.fermentationWhatImage

  const whyTitle = f?.fermentationWhyTitle ?? DEFAULT_WHY_TITLE
  const whyItems = f?.fermentationWhyItems ?? []
  const whyImage = f?.fermentationWhyImage

  const dangerTitle = f?.fermentationDangerTitle ?? DEFAULT_DANGER_TITLE
  const dangerIntro = f?.fermentationDangerIntro ?? DEFAULT_DANGER_INTRO
  const dangerConcernsHeading = f?.fermentationDangerConcernsHeading ?? DEFAULT_DANGER_CONCERNS_HEADING
  const dangerConcerns = f?.fermentationDangerConcerns ?? []
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
  const faqItems = f?.fermentationFaqItems ?? []
  const faqCtaTitle = f?.fermentationFaqCtaTitle ?? DEFAULT_FAQ_CTA_TITLE
  const faqCtaBody = f?.fermentationFaqCtaBody ?? DEFAULT_FAQ_CTA_BODY
  const faqMoreText = f?.fermentationFaqMoreText ?? DEFAULT_FAQ_MORE
  const faqContactLabel = f?.fermentationFaqContactLabel ?? DEFAULT_FAQ_CONTACT
  const faqContactUrl = f?.fermentationFaqContactUrl ?? DEFAULT_FAQ_CONTACT_URL

  return (
    <article className="font-sans">
      {/* Hero — title + description, image, 4 boxes overlapping */}
      <section className="relative bg-white">
        <div className="content-full mx-auto px-6 pt-16 pb-8 md:px-12 lg:px-20">
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
            {heroBlocks.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ position: 'inherit' }}>
                {heroBlocks.slice(0, 4).map((block, i) => {
                const bgColor = HERO_BLOCK_COLORS[i] ?? HERO_BLOCK_COLORS[0]
                const isDark = bgColor === '#4B4B4B'
                  const blockContent = (
                    <div
                      className="rounded-2xl p-6 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
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
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Guide section — A complete guide to fermentation */}
      <section className="bg-white pt-4 pb-6 md:pt-6 md:pb-8">
        <FadeIn delay={0}>
        <div className="content-medium mx-auto px-4 sm:px-6">
          <h2 className="font-display text-section-heading font-bold" style={{ color: '#555954' }}>
            {guideTitle}
          </h2>
          {guideBody && (
            <p className="mt-4 text-body leading-relaxed sm:mt-6 sm:text-body-lg" style={{ color: '#555954' }}>
              {guideBody}
            </p>
          )}
          {isResolvedMedia(guideImage) && (
            <div className="mt-8 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl">
              <Media resource={guideImage} fill imgClassName="object-cover object-center" />
            </div>
          )}
        </div>
        </FadeIn>
      </section>

      {/* What is fermentation? — light beige block */}
      <section id="what" className="bg-white pt-4 pb-6 md:pt-6 md:pb-8">
        <FadeIn delay={100}>
        <div className="mx-auto max-w-[1516px] px-4 sm:px-6">
          <div className="rounded-2xl bg-[#F5F0E8] p-6 sm:p-8 md:p-12">
            <div
              className={
                isResolvedMedia(whatImage)
                  ? 'grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start'
                  : ''
              }
            >
              <div>
                <h2 className="font-display text-2xl font-bold leading-tight text-ff-black sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                  {whatTitle}
                </h2>
                {whatBody && (
                  <p className="mt-4 font-bold leading-relaxed text-ff-black text-base sm:mt-6 sm:text-lg md:text-xl lg:text-[1.5625rem]">
                    {whatBody}
                  </p>
                )}
                {whatMotto && (
                  <p className="mt-8 font-bold leading-relaxed whitespace-pre-line text-ff-black text-base sm:mt-10 sm:text-lg md:mt-14 md:text-xl lg:mt-[62px] lg:text-[1.5625rem]">
                    {whatMotto.replace('. Just ', '.\nJust ')}
                  </p>
                )}
              </div>
              {isResolvedMedia(whatImage) && (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Media resource={whatImage} fill imgClassName="object-cover object-center" />
                </div>
              )}
            </div>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* Why is it so special? — light beige block, 6 items in 2 columns */}
      {(whyItems.length > 0 || isResolvedMedia(whyImage)) && (
        <section className="section-padding-sm bg-white">
          <FadeIn delay={150}>
          <div className="mx-auto max-w-[1516px] px-4 sm:px-6">
            <div className="rounded-2xl bg-[#F9F0DC] p-6 sm:p-10 md:p-14 lg:p-16">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
                <div className="flex-1">
                  <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-black">
                    {whyTitle}
                  </h2>
                  <div className="mt-8 grid grid-cols-1 gap-x-16 gap-y-8 sm:mt-10 sm:gap-y-10 md:grid-cols-2 md:mt-12 md:gap-y-12 lg:gap-x-20">
                    {whyItems.map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="border-l-2 border-ff-black/20 pl-4 sm:pl-6 md:pl-8"
                  >
                    <h3 className="font-display text-title font-bold leading-tight text-ff-black md:text-subheading">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-body leading-relaxed text-ff-black md:text-body-lg">
                      {item.description}
                    </p>
                  </div>
                ))}
                  </div>
                </div>
                {isResolvedMedia(whyImage) && (
                  <div className="w-full shrink-0 md:w-80 lg:w-96">
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                      <Media resource={whyImage} fill imgClassName="object-cover object-center" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </FadeIn>
        </section>
      )}

      {/* Is it dangerous? — light gray block */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={200}>
        <div className="mx-auto max-w-[1516px] px-4 sm:px-6">
          <div className="rounded-2xl bg-[#ECE5DE] p-6 sm:p-8 md:p-12">
            <h2 className="font-display text-section-heading font-bold text-ff-black">
              {dangerTitle}
            </h2>
            {dangerIntro && (
              <p className="mt-4 text-body leading-relaxed text-ff-black sm:mt-6 sm:text-body-lg">
                {dangerIntro}
              </p>
            )}
            {dangerConcerns.length > 0 && dangerConcernsHeading && (
              <div className="mt-8 sm:mt-10">
                <h3 className="font-display text-title font-bold text-ff-black md:text-subheading">
                  {dangerConcernsHeading}
                </h3>
                <ul className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">
                  {dangerConcerns.map((concern, i) => (
                    <li key={concern.id ?? i} className="border-l-2 border-ff-black/20 pl-4 sm:pl-6">
                      <span className="font-display font-bold text-ff-black">{concern.title}:</span>{' '}
                      <span className="text-body leading-relaxed text-ff-black sm:text-body-lg">
                        {concern.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dangerClosing && (
              <p className="mt-6 text-body leading-relaxed text-ff-black sm:mt-8 sm:text-body-lg">
                {dangerClosing}
              </p>
            )}
          </div>
        </div>
        </FadeIn>
      </section>

      {/* A practice, not a trend — light cream block */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={250}>
        <div className="mx-auto max-w-[1516px] px-4 sm:px-6">
          <div className="rounded-2xl bg-[#FAF2E0] p-6 sm:p-10 md:p-14 lg:p-16">
            <div
              className={
                isResolvedMedia(practiceImage)
                  ? 'grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-12'
                  : ''
              }
            >
              <div className={isResolvedMedia(practiceImage) ? 'lg:col-span-3' : ''}>
                <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-black">
                  {practiceTitle}
                </h2>
                <div className="mt-8 max-w-3xl space-y-6 sm:mt-10 sm:space-y-7 md:space-y-8">
                  {practiceParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className="border-l-2 border-ff-black/20 pl-4 text-body leading-[1.7] text-ff-black sm:pl-6 sm:text-body-lg md:leading-[1.75]"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
              {isResolvedMedia(practiceImage) && (
                <div className="lg:col-span-1">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                    <Media resource={practiceImage} fill imgClassName="object-cover object-center" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </FadeIn>
      </section>

      {/* Ready to learn? CTA — gold block or video bg, two buttons */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={300}>
        <div className="mx-auto max-w-[1516px] px-4 sm:px-6 text-center">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[#E6BE68] px-8 py-16 md:px-16">
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
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.25),transparent)]"
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

      {/* FAQ — centered, light gray container */}
      <section className="section-padding-sm bg-white">
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
            <div className="rounded-2xl border border-[#333333]/15 bg-[#E8E6E3] p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                {faqItems.map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="flex gap-4 rounded-xl bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#333333]/10 font-display text-base font-bold text-ff-black">
                      ?
                    </span>
                    <div>
                      <h3 className="font-display text-title font-bold text-ff-black">
                        {item.question}
                      </h3>
                      <p className="mt-2 text-body-sm leading-relaxed text-ff-black/90">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {(faqCtaTitle || faqCtaBody) && (
                <div className="mt-8 rounded-xl bg-white/80 p-6 text-center sm:mt-10 sm:p-8">
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

      {/* Workshop cards — shared with gastronomy, uses gastronomy data */}
      <FadeIn delay={400}>
      <WorkshopCardsSection
        title={
          workshopTitleSuffix ? `${workshopTitle} ${workshopTitleSuffix}` : workshopTitle
        }
        subtitle={workshopSubtitle}
        nextDateLabel={workshopNextDateLabel}
        viewAllLabel={workshopViewAllLabel}
        viewAllUrl={workshopViewAllUrl}
        cards={workshopCards.map((c) => ({
          id: (c as { id?: string }).id,
          title: c.title,
          description: c.description,
          image: c.image,
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
