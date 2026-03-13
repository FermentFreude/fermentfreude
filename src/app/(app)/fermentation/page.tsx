import type { Metadata } from 'next'

import { EditPageLink } from '@/components/EditPageLink'
import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { DangerAccordion } from '@/app/(app)/fermentation/DangerAccordion'
import { FaqAccordion } from '@/app/(app)/fermentation/FaqAccordion'
import { PracticeAccordion } from '@/app/(app)/fermentation/PracticeAccordion'
import { WhySection } from '@/app/(app)/fermentation/WhySection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Fragment } from 'react'

import type { Media as MediaType, Page as PageType } from '@/payload-types'

type HeroBlock = { id?: string; title: string; description?: string; icon?: string | MediaType | null; url?: string }
const HERO_BLOCK_COLORS = ['#FAF2E0', '#E6BE68', '#4B4B4B', '#EDD195'] as const
const HERO_BLOCK_ICONS = [
  '/assets/images/fermentation/icon-probiotics.svg',
  '/assets/images/fermentation/icon-enzymes.svg',
  '/assets/images/fermentation/icon-nutrition.svg',
  '/assets/images/fermentation/icon-preservation.svg',
] as const
const DEFAULT_HERO_BLOCKS: HeroBlock[] = [
  { title: 'RAW MILK', description: 'Learn more about dairy fermentation.', url: '/workshops/basics' },
  { title: 'KOMBUCHA', description: 'Discover fermented tea and its benefits.', url: '/workshops/kombucha' },
  { title: 'FERMENTS', description: 'Explore lacto-fermentation and vegetables.', url: '/workshops/lakto-gemuese' },
  { title: 'TEMPEH', description: 'Master plant-based protein fermentation.', url: '/workshops/tempeh' },
]

const DEFAULT_HERO_TITLE = 'Innovation meets Tradition'
const DEFAULT_HERO_DESCRIPTION =
  'Our courses combine ancient fermentation techniques with modern culinary applications. Learn how to craft delicious and nutritious fermented foods at home.'
const DEFAULT_GUIDE_TAG = 'Quick Guide'
const DEFAULT_GUIDE_TITLE = 'A complete guide to fermentation'
const DEFAULT_GUIDE_BODY =
  'Unlock the secrets of traditional preservation and create your own fermented delights.'
const DEFAULT_WHAT_TITLE = 'What is fermentation?'
const DEFAULT_WHAT_BODY =
  "This is an ancient food preservation technique. Why not learn how to get started? We'll help you master the art of fermentation in the comfort of your own kitchen."
const DEFAULT_WHAT_MOTTO = 'No additives. No shortcuts. Just patience and care.'
const DEFAULT_WHAT_LIST_ITEMS = ['Microbiome', 'Botanical', 'Living microorganisms']
const DEFAULT_WHY_TITLE = 'Why is it so special?'
const DEFAULT_WHY_ITEMS: Array<{ id?: string; title: string; description: string }> = [
  {
    title: 'Improves gut flora and overall well-being',
    description: 'Probiotics support a healthy gut microbiome and can aid digestion.',
  },
  {
    title: 'Rich in flavors and aromas',
    description: 'Fermented foods develop unique, complex flavor profiles.',
  },
  {
    title: 'Easy and cost-effective',
    description: 'With few ingredients and simple techniques, you can ferment at home.',
  },
  {
    title: 'Supports a balanced lifestyle',
    description: 'Fermented foods fit perfectly into a mindful diet.',
  },
  {
    title: 'Eco-friendly and sustainable',
    description: 'Fermentation reduces food waste and extends shelf life naturally.',
  },
  {
    title: 'Diverse applications',
    description: 'From vegetables to drinks to soy products - fermentation is versatile.',
  },
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
      "Common mold generally forms a fuzzy, green, black, or white layer on the surface. It's usually harmless if removed—fermentation creates an acidic environment that prevents harmful mold from penetrating.",
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
  'Join our workshops and discover the fascinating world of fermented foods.'
const DEFAULT_CTA_VIDEO = '/assets/videos/VIDEO-2026-02-06-12-18-34.mp4'
const DEFAULT_CTA_PRIMARY = 'View workshops'
const DEFAULT_CTA_PRIMARY_URL = '/workshops'
const DEFAULT_CTA_SECONDARY = 'Browse online courses'
const DEFAULT_CTA_SECONDARY_URL = '/workshops'
const DEFAULT_WORKSHOP_TITLE = 'Learn UNIQUE.'
const DEFAULT_WORKSHOP_TITLE_SUFFIX = 'FLAVOURS'
const DEFAULT_WORKSHOP_SUBTITLE =
  'Explore our different courses and discover what you can create.'
const DEFAULT_WORKSHOP_VIEW_ALL = 'View All'
const DEFAULT_WORKSHOP_VIEW_ALL_URL = '/workshops'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL = 'Next Date:'
const DEFAULT_WORKSHOP_CARDS = [
  {
    title: 'Lakto-Gemüse',
    description:
      'Ferment vegetables, experience flavours – different every month. Live online session.',
    price: 'From €4,200',
    priceSuffix: '',
    buttonLabel: 'BOOK NOW',
    buttonUrl: '/workshops/lakto-gemuese',
    nextDate: 'Starts May 4, 2026',
  },
  {
    title: 'Kombucha',
    description:
      'Dive into the world of fermented tea – full of character and aromas. Interactive online.',
    price: 'From €1,800',
    priceSuffix: '',
    buttonLabel: 'BOOK NOW',
    buttonUrl: '/workshops/kombucha',
    nextDate: 'Starts May 4, 2026',
  },
  {
    title: 'Tempeh',
    description:
      'Rediscover a plant-based protein source – mild, nutty and versatile. Online masterclass.',
    price: 'From €2,500',
    priceSuffix: '',
    buttonLabel: 'BOOK NOW',
    buttonUrl: '/workshops/tempeh',
    nextDate: 'Starts May 4, 2026',
  },
]
const DEFAULT_FAQ_TITLE = 'Frequently Asked Questions'
const DEFAULT_FAQ_SUBTITLE = 'Common questions about fermentation answered.'
const DEFAULT_FAQ_CTA_TITLE = 'Ready to Start Fermenting?'
const DEFAULT_FAQ_CTA_BODY =
  'Begin with simple vegetables like cabbage or cucumbers, use the proper salt ratio (2–3% by weight), and trust the process!'
const DEFAULT_FAQ_MORE = "Can't find your answer?"
const DEFAULT_FAQ_CONTACT = 'Contact Us'
const DEFAULT_FAQ_CONTACT_URL = '/contact'
const DEFAULT_FAQ_ITEMS: Array<{ id?: string; question: string; answer: string }> = [
  {
    question: 'What ingredients do I need?',
    answer:
      'Basic lacto-fermentation needs vegetables, salt (2–3% by weight), and water. No special equipment required.',
  },
  {
    question: 'Do I need special equipment?',
    answer:
      'No. A clean jar, a weight to keep vegetables submerged, and a lid are enough. Our workshops cover simple setups.',
  },
  {
    question: 'How long does fermentation take?',
    answer:
      'It varies. Sauerkraut can be ready in 1–2 weeks; kimchi in 3–5 days. Taste regularly to find your preference.',
  },
  {
    question: 'What if I make a mistake?',
    answer:
      'Most mistakes are fixable. Mold on the surface can often be removed. Our workshops teach you how to troubleshoot.',
  },
  {
    question: 'Is it safe to eat?',
    answer:
      'Yes. Fermentation creates an acidic environment that inhibits harmful bacteria. When done correctly, it is one of the safest preservation methods.',
  },
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

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Fermentation | Fermentfreude',
    description:
      'Discover the art of fermentation. A complete guide to lacto-fermentation, kombucha, and tempeh. Workshops and products for gut health.',
  }
}

type FermentationPageProps = {
  searchParams?: Promise<{ defaults?: string }>
}

export default async function FermentationPage({ searchParams }: FermentationPageProps) {
  const locale = await getLocale()
  const params = await searchParams
  // Use code defaults when ?defaults=1 or FERMENTATION_USE_DEFAULTS=1. Set in .env to always see design.
  const forceDefaults =
    params?.defaults === '1' ||
    process.env.FERMENTATION_USE_DEFAULTS === '1' ||
    process.env.FERMENTATION_USE_DEFAULTS === 'true'

  const payload = await getPayload({ config: configPromise })
  const [fermentationResult, gastronomyResult] = await Promise.all([
    forceDefaults
      ? { docs: [] as PageType[] }
      : payload.find({
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
  const page = fermentationResult.docs?.[0] as PageType | undefined
  const f = forceDefaults ? undefined : page?.fermentation
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
  let heroBlocks =
    (f?.fermentationHeroBlocks?.length ?? 0) > 0
      ? (f?.fermentationHeroBlocks ?? [])
      : DEFAULT_HERO_BLOCKS

  // Resolve hero block icons if they're just IDs
  if (heroBlocks.length > 0) {
    heroBlocks = (await Promise.all(
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
    )) as typeof heroBlocks
  }

  const _guideTag = f?.fermentationGuideTag ?? DEFAULT_GUIDE_TAG
  const guideTitle = f?.fermentationGuideTitle ?? DEFAULT_GUIDE_TITLE
  const guideBody = f?.fermentationGuideBody ?? DEFAULT_GUIDE_BODY
  const guideImage = f?.fermentationGuideImage

  const whatTitle = f?.fermentationWhatTitle ?? DEFAULT_WHAT_TITLE
  const whatBody = f?.fermentationWhatBody ?? DEFAULT_WHAT_BODY
  const whatMotto = f?.fermentationWhatMotto ?? DEFAULT_WHAT_MOTTO
  const whatLinks = f?.fermentationWhatLinks ?? []
  const whatListItems =
    whatLinks.length > 0
      ? whatLinks.map((l) => (typeof l === 'object' && l !== null && 'label' in l ? String((l as { label?: string }).label) : '')).filter(Boolean)
      : DEFAULT_WHAT_LIST_ITEMS
  const whatImage = f?.fermentationWhatImage

  const whyTitle = f?.fermentationWhyTitle ?? DEFAULT_WHY_TITLE
  const whyItems =
    (f?.fermentationWhyItems?.length ?? 0) > 0 ? (f?.fermentationWhyItems ?? []) : DEFAULT_WHY_ITEMS
  const whyImage = f?.fermentationWhyImage

  const dangerTitle = f?.fermentationDangerTitle ?? DEFAULT_DANGER_TITLE
  const dangerIntro = f?.fermentationDangerIntro ?? DEFAULT_DANGER_INTRO
  const dangerConcernsHeading =
    f?.fermentationDangerConcernsHeading ?? DEFAULT_DANGER_CONCERNS_HEADING
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
  let ctaVideoMedia = (f as { fermentationCtaVideo?: unknown } | undefined)?.fermentationCtaVideo
  if (ctaVideoMedia && typeof ctaVideoMedia === 'string') {
    try {
      const mediaDoc = await payload.findByID({
        collection: 'media',
        id: ctaVideoMedia,
        depth: 0,
      })
      ctaVideoMedia = mediaDoc as MediaType
    } catch {
      ctaVideoMedia = undefined
    }
  }
  const ctaVideoUrlFromText = f?.fermentationCtaVideoUrl
  const ctaVideoUrl =
    (typeof ctaVideoMedia === 'object' &&
    ctaVideoMedia !== null &&
    'url' in ctaVideoMedia &&
    typeof (ctaVideoMedia as { url?: string; mimeType?: string }).url === 'string')
      ? (ctaVideoMedia as { url: string }).url
      : ctaVideoUrlFromText ?? DEFAULT_CTA_VIDEO
  const ctaVideoMimeType =
    typeof ctaVideoMedia === 'object' &&
    ctaVideoMedia !== null &&
    typeof (ctaVideoMedia as { mimeType?: string }).mimeType === 'string'
      ? (ctaVideoMedia as { mimeType: string }).mimeType
      : 'video/mp4'
  const ctaBackgroundImage = f?.fermentationCtaBackgroundImage

  // Workshop section — fermentation or gastronomy fallback (skip gastronomy when forceDefaults)
  const workshopTitle = f?.fermentationWorkshopTitle ?? DEFAULT_WORKSHOP_TITLE
  const workshopTitleSuffix = f?.fermentationWorkshopTitleSuffix ?? DEFAULT_WORKSHOP_TITLE_SUFFIX
  const workshopSubtitle =
    f?.fermentationWorkshopSubtitle ??
    (forceDefaults ? undefined : g?.gastronomyWorkshopSectionSubtitle) ??
    DEFAULT_WORKSHOP_SUBTITLE
  const workshopViewAllLabel = f?.fermentationWorkshopViewAllLabel ?? DEFAULT_WORKSHOP_VIEW_ALL
  const workshopViewAllUrl = f?.fermentationWorkshopViewAllUrl ?? DEFAULT_WORKSHOP_VIEW_ALL_URL
  const workshopNextDateLabel =
    f?.fermentationWorkshopNextDateLabel ??
    (forceDefaults ? undefined : g?.gastronomyWorkshopNextDateLabel) ??
    DEFAULT_WORKSHOP_NEXT_DATE_LABEL
  const workshopCards = forceDefaults
    ? DEFAULT_WORKSHOP_CARDS
    : (f?.fermentationWorkshopCards?.length ?? 0) > 0
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
            <Link
              href="#what"
              className="mt-10 inline-block font-display text-subheading font-bold uppercase tracking-wide transition-colors hover:text-ff-black md:mt-12"
              style={{ color: '#555954' }}
            >
              {heroBenefitsTitle}
            </Link>
          </div>

          {/* Image + 4 boxes — wrapped together */}
          <div className="mt-6 pt-8 md:mt-12 md:pt-30">
            {/* Image of two people — in front of the boxes */}
            <div className="relative z-20 flex justify-center md:justify-end">
              <div
                className="relative aspect-4/3 w-full min-h-60 max-w-3xl overflow-hidden md:max-h-105"
                style={{ top: -80 }}
              >
                {isResolvedMedia(heroImage) ? (
                  <Media resource={heroImage} fill imgClassName="object-contain" priority />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/assets/images/fermentation/hero-founders.png"
                    alt="Fermentation – founders"
                    className="size-full object-contain object-bottom"
                  />
                )}
              </div>
            </div>

            {/* 4 boxes — behind the image */}
            <div className="relative z-0 -mt-32 pb-16 md:-mt-20 lg:-mt-28">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ position: 'inherit' }}>
                {heroBlocks.slice(0, 4).map((block, i) => {
                  const bgColor = HERO_BLOCK_COLORS[i] ?? HERO_BLOCK_COLORS[0]
                  const isDark = bgColor === '#4B4B4B'
                  const blockContent = (
                    <div
                      className="rounded-2xl p-6 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                      style={{ backgroundColor: bgColor }}
                    >
                      {/* 1. Icon (from CMS or fallback to static SVG) */}
                      <div className="mx-auto mb-4 flex size-12 items-center justify-center [&_img]:animate-[gentle-float_3s_ease-in-out_infinite]">
                        {isResolvedMedia((block as { icon?: unknown }).icon) ? (
                          <Media
                            resource={(block as { icon?: MediaType }).icon}
                            width={48}
                            height={48}
                            imgClassName={`size-12 object-contain ${isDark ? 'brightness-0 invert' : ''}`}
                          />
                        ) : (
                          <img
                            src={HERO_BLOCK_ICONS[i] ?? HERO_BLOCK_ICONS[0]}
                            alt=""
                            width={48}
                            height={48}
                            className={`size-12 object-contain ${isDark ? 'brightness-0 invert' : ''}`}
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
      </section>

      {/* Guide section — A complete guide to fermentation */}
      <section className="bg-white pt-4 pb-6 md:pt-6 md:pb-8">
        <FadeIn delay={0}>
          <div className="content-medium mx-auto px-4 sm:px-6 text-center">
            <h2
              className="font-display text-section-heading font-bold"
              style={{ color: '#555954' }}
            >
              {guideTitle}
            </h2>
            {guideBody && (
              <p
                className="mt-4 text-body leading-relaxed sm:mt-6 sm:text-body-lg mx-auto max-w-2xl"
                style={{ color: '#555954' }}
              >
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
          <div className="mx-auto max-w-379 px-4 sm:px-6">
            <div className="rounded-2xl bg-[#F5F0E8] p-6 sm:p-8 md:p-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
                <div>
                  <h2 className="font-display text-2xl font-bold leading-tight text-ff-black sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                    {whatTitle}
                  </h2>
                  {whatBody && (
                    <p className="mt-4 font-bold leading-relaxed text-ff-black text-base sm:mt-6 sm:text-lg md:text-xl lg:text-[1.5625rem]">
                      {whatBody}
                    </p>
                  )}
                  {whatListItems.length > 0 && (
                    <ul className="mt-6 space-y-2 sm:mt-8">
                      {whatListItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-body font-medium text-ff-black sm:text-lg"
                        >
                          <span className="size-1.5 shrink-0 rounded-full bg-[#E6BE68]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {whatMotto && (
                    <blockquote className="mt-8 sm:mt-10 md:mt-12">
                      <p className="font-display text-lg font-bold leading-relaxed text-ff-black sm:text-xl md:text-2xl">
                        <span className="text-[#E6BE68]">&quot;</span>
                        {whatMotto.split('. ').filter(Boolean).map((phrase, i, arr) => (
                          <span key={i}>
                            {phrase}{phrase.endsWith('.') ? '' : '.'}
                            {i < arr.length - 1 && <br />}
                          </span>
                        ))}
                        <span className="text-[#E6BE68]">&quot;</span>
                      </p>
                    </blockquote>
                  )}
                </div>
                <div className="aspect-4/3 w-full overflow-hidden rounded-2xl shadow-md">
                  {isResolvedMedia(whatImage) ? (
                    <Media resource={whatImage} fill imgClassName="object-cover object-center" />
                  ) : isResolvedMedia(guideImage) ? (
                    <Media resource={guideImage} fill imgClassName="object-cover object-center" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/assets/images/fermentation/what-is-fermentation.png"
                      alt="What is fermentation – daikon kimchi"
                      className="size-full object-cover object-center"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Why is it so special? — BENEFITS label, 2x3 cards with numbers & icons */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={150}>
          <WhySection title={whyTitle} items={whyItems} image={whyImage} />
        </FadeIn>
      </section>

      {/* Is it dangerous? / A practice, not a trend — accordions */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={185}>
          <div className="mx-auto max-w-379 space-y-6 px-4 sm:px-6">
            <DangerAccordion
              title={dangerTitle}
              intro={dangerIntro ?? ''}
              concernsHeading={dangerConcernsHeading ?? ''}
              concerns={dangerConcerns}
              closing={dangerClosing ?? ''}
            />
            <PracticeAccordion
              title={practiceTitle}
              paragraphs={practiceParagraphs}
              image={practiceImage}
            />
          </div>
        </FadeIn>
      </section>

      {/* Ready to learn? CTA — dark banner with image/video, EXPLORE WORKSHOPS button */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={200}>
          <div className="mx-auto max-w-379 px-4 sm:px-6 text-center">
            <div className="relative min-h-70 overflow-hidden rounded-2xl bg-[#555954] px-8 py-16 md:px-16">
              {/* Optional video or image background */}
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
                    <source src={ctaVideoUrl} type={ctaVideoMimeType} />
                  </video>
                  <div className="absolute inset-0 bg-[#333333]/80" aria-hidden />
                </>
              ) : isResolvedMedia(ctaBackgroundImage) ? (
                <>
                  <Media
                    resource={ctaBackgroundImage as MediaType}
                    fill
                    imgClassName="object-cover"
                  />
                  <div className="absolute inset-0 bg-[#333333]/80" aria-hidden />
                </>
              ) : (
                <div
                  className="pointer-events-none absolute inset-0 bg-[#555954]"
                  aria-hidden
                />
              )}
              <div className="relative z-10">
                <h2 className="font-display text-section-heading font-bold text-white drop-shadow-md">
                  {ctaTitle}
                </h2>
                {ctaDescription && (
                  <p className="mt-4 text-body-lg leading-relaxed text-white/95 drop-shadow-md">
                    {ctaDescription}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link
                    href={ctaPrimaryUrl}
                    className="inline-flex items-center justify-center rounded-full bg-[#E6BE68] px-8 py-3.5 font-display text-sm font-bold text-[#1a1a1a] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:bg-[#EDD195] hover:shadow-xl"
                  >
                    {ctaPrimaryLabel}
                  </Link>
                  {ctaSecondaryLabel && (
                    <Link
                      href={ctaSecondaryUrl ?? '#'}
                      className="inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-3.5 font-display text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.05] hover:bg-white/20 hover:shadow-lg"
                    >
                      {ctaSecondaryLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FAQ — accordion style */}
      <section className="section-padding-sm bg-white">
        <FadeIn delay={250}>
          <div className="mx-auto max-w-379 px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-section-heading font-bold text-ff-black">
                {faqTitle}
              </h2>
              {faqSubtitle && (
                <p className="mt-2 text-body text-ff-black/80 sm:text-body-lg">{faqSubtitle}</p>
              )}
            </div>
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="overflow-hidden rounded-2xl border border-[#333333]/15 bg-[#E8E6E3] p-6 sm:p-8 md:p-10">
                <FaqAccordion items={faqItems} type="single" />
                {(faqCtaTitle || faqCtaBody) && (
                  <div className="mt-8 rounded-xl bg-white p-6 text-center sm:mt-10 sm:p-8">
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
        cards={workshopCards.map((c, idx) => {
          const card = c as {
            id?: string
            title: string
            description: string
            image?: unknown
            price?: string
            priceSuffix?: string
            buttonLabel?: string
            buttonUrl?: string
            nextDate?: string
          }
          const fallbacksByUrl: Record<string, string> = {
            '/workshops/lakto-gemuese': '/assets/images/fermentation/workshop-lakto.png',
            '/workshops/kombucha': '/assets/images/fermentation/workshop-kombucha.png',
            '/workshops/tempeh': '/assets/images/fermentation/workshop-tempeh.png',
          }
          const fallbacksByIndex = [
            '/assets/images/fermentation/workshop-lakto.png',
            '/assets/images/fermentation/workshop-kombucha.png',
            '/assets/images/fermentation/workshop-tempeh.png',
          ]
          const fallback =
            (card.buttonUrl && fallbacksByUrl[card.buttonUrl]) ?? fallbacksByIndex[idx]
          const image = fallback ? { url: fallback } : card.image
          return {
            id: card.id,
            title: card.title,
            description: card.description,
            image,
            price: card.price,
            priceSuffix: card.priceSuffix,
            buttonLabel: card.buttonLabel,
            buttonUrl: card.buttonUrl,
            nextDate: card.nextDate,
          }
        })}
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
