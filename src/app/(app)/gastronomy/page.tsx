import type { Metadata } from 'next'

import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { EditPageLink } from '@/components/EditPageLink'
import { GastronomyOfferCards } from '@/components/gastronomy/GastronomyOfferCards'
import { GastronomyProductSlider } from '@/components/gastronomy/GastronomyProductSlider'
import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import type { Page as PageType } from '@/payload-types'

const DEFAULT_HERO_CTA = 'Take A Look'
const DEFAULT_OFFER_TITLE = 'What we offer'
const DEFAULT_CTA_HEADING =
  "Transform tradition into innovation. Fermentation is not just preservation it's the future of gastronomy."
const DEFAULT_CTA_SUBLINE = 'Partner with us to differentiate your business.'
const DEFAULT_CTA_BUTTON = 'Send Inquiry'
const DEFAULT_WORKSHOP_TITLE = 'Next Workshop'
const DEFAULT_WORKSHOP_SUBTITLE = 'Exclusive and Personalized Fermentations'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL = 'Next Appointment:'
const DEFAULT_SLIDER_PREV = 'PREV'
const DEFAULT_SLIDER_NEXT = 'NEXT'
const TRUSTED_BY_DEFAULT = 'Trusted by'
const FALLBACK_TRUST_BADGES_DE = [
  'Restaurants',
  'Hotels',
  'Catering',
  'Feinkost',
  'Food Concept Stores',
] as const
const FALLBACK_TRUST_BADGES_EN = [
  'Restaurants',
  'Hotels',
  'Catering',
  'Delis',
  'Food Concept Stores',
] as const

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const locale = await getLocale()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 0,
    locale,
  })
  const doc = result.docs[0] as PageType | undefined
  if (!doc) {
    return { title: 'Gastronomie | Fermentfreude' }
  }
  return generateMeta({ doc })
}

export default async function GastronomyPage() {
  const locale = await getLocale()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 4,
    locale,
  })
  const page = result.docs[0] as PageType | undefined
  const g = page?.gastronomy

  const heroCtaLabel = g?.gastronomyHeroCtaLabel ?? DEFAULT_HERO_CTA
  const heroCtaUrl = g?.gastronomyHeroCtaUrl ?? '#offer'
  const detailsTitle = g?.gastronomyOfferDetailsTitle?.trim()
  const sectionTitleFallback = g?.gastronomyOfferSectionTitle?.trim()
  const offerGridTitle =
    (detailsTitle && detailsTitle.length > 0 ? detailsTitle : null) ??
    (sectionTitleFallback && sectionTitleFallback.length > 0 ? sectionTitleFallback : null) ??
    DEFAULT_OFFER_TITLE
  const offerCards = g?.gastronomyOfferCards ?? []

  const cta = g?.gastronomyCtaBanner
  const ctaHeading = cta?.heading?.trim() || DEFAULT_CTA_HEADING
  const ctaSubline = cta?.description?.trim() || DEFAULT_CTA_SUBLINE
  const ctaButtonLabel = cta?.buttonLabel?.trim() || DEFAULT_CTA_BUTTON
  const ctaButtonHref = cta?.buttonHref?.trim() || '#contact'

  const workshopSectionTitle = g?.gastronomyWorkshopSectionTitle ?? DEFAULT_WORKSHOP_TITLE
  const workshopSectionSubtitle = g?.gastronomyWorkshopSectionSubtitle ?? DEFAULT_WORKSHOP_SUBTITLE
  const workshopClarification = g?.gastronomyWorkshopClarification ?? null
  const workshopNextDateLabel =
    g?.gastronomyWorkshopNextDateLabel ?? DEFAULT_WORKSHOP_NEXT_DATE_LABEL
  const nextDates = await getNextWorkshopDatesByHref(locale === 'en' ? 'en' : 'de')
  const workshopCards = (g?.gastronomyWorkshopCards ?? []).map((c) => ({
    ...c,
    nextDate: (c.buttonUrl && nextDates[c.buttonUrl]) || c.nextDate || undefined,
  }))
  const offerDetails = g?.gastronomyOfferDetails ?? []

  const trustedByHeading =
    g?.gastronomyTrustedByHeading?.trim() ||
    (locale === 'de' ? 'Vertraut von' : TRUSTED_BY_DEFAULT)
  const trustBadgesFromCms = (g?.gastronomyTrustedByBadges ?? [])
    .map((b) => b?.label?.trim())
    .filter((x): x is string => Boolean(x))
  const trustBadges =
    trustBadgesFromCms.length > 0
      ? trustBadgesFromCms
      : locale === 'de'
        ? [...FALLBACK_TRUST_BADGES_DE]
        : [...FALLBACK_TRUST_BADGES_EN]

  const sliderPrevLabel = g?.gastronomyHeroSliderPrevLabel ?? DEFAULT_SLIDER_PREV
  const sliderNextLabel = g?.gastronomyHeroSliderNextLabel ?? DEFAULT_SLIDER_NEXT
  const sliderAutoplayMs =
    typeof g?.gastronomyHeroSliderAutoplayMs === 'number' &&
    Number.isFinite(g.gastronomyHeroSliderAutoplayMs) &&
    g.gastronomyHeroSliderAutoplayMs >= 2000
      ? g.gastronomyHeroSliderAutoplayMs
      : null

  const fallbackOutcomesDE = [
    {
      before: 'Kein klares Ferment-Angebot',
      after: 'Signature-Komponenten mit Wiedererkennungswert',
    },
    { before: 'Unsichere Team-Abläufe', after: 'Klare Standards für Produktion und Service' },
    {
      before: 'Standard-Menüs ohne Differenzierung',
      after: 'Markante Aromen mit eigener Handschrift',
    },
  ]
  const fallbackOutcomesEN = [
    {
      before: 'No clear fermentation offer',
      after: 'Signature components with strong identity',
    },
    {
      before: 'Inconsistent team workflows',
      after: 'Clear standards for production and service',
    },
    {
      before: 'Standard menus with little differentiation',
      after: 'Distinctive flavors with a unique point of view',
    },
  ]
  const cmsOutcomeRows = (g?.gastronomyOutcomesItems ?? []).filter(
    (row) => row?.before?.trim() && row?.after?.trim(),
  )
  const outcomes =
    cmsOutcomeRows.length > 0
      ? cmsOutcomeRows.map((row) => ({
          before: row.before!.trim(),
          after: row.after!.trim(),
        }))
      : locale === 'de'
        ? fallbackOutcomesDE
        : fallbackOutcomesEN
  const outcomeLabel =
    g?.gastronomyOutcomesEyebrow?.trim() || (locale === 'de' ? 'Ergebnisse' : 'Outcomes')
  const outcomeTitle =
    g?.gastronomyOutcomesTitle?.trim() ||
    (locale === 'de' ? 'Vorher / Nachher in der Küche' : 'Before / After In The Kitchen')
  const outcomeBeforeLabel =
    g?.gastronomyOutcomesBeforeLabel?.trim() || (locale === 'de' ? 'Vorher' : 'Before')
  const outcomeAfterLabel =
    g?.gastronomyOutcomesAfterLabel?.trim() || (locale === 'de' ? 'Nachher' : 'After')

  const fallbackProcessDE = [
    {
      title: 'Analyse',
      description:
        'Wir prüfen Ihr Konzept, Ihre Küche und Ihr Team-Setup, um die beste Ferment-Strategie zu definieren.',
    },
    {
      title: 'Team Workshop',
      description:
        'Praxisnahes Training vor Ort oder hybrid, mit sofort einsetzbaren Techniken für Ihren Alltag.',
    },
    {
      title: 'Menu Integration',
      description:
        'Wir begleiten die Umsetzung in Ihre Karte, inklusive Prozesse, Qualität und geschmacklicher Linie.',
    },
  ]
  const fallbackProcessEN = [
    {
      title: 'Assessment',
      description:
        'We review your concept, kitchen setup, and team workflow to define the right fermentation strategy.',
    },
    {
      title: 'Team Workshop',
      description:
        'Hands-on training on-site or hybrid, with techniques your team can use immediately.',
    },
    {
      title: 'Menu Integration',
      description:
        'We support implementation into your menu, including process, quality, and flavor direction.',
    },
  ]
  const cmsProcessSteps = (g?.gastronomyProcessSteps ?? []).filter(
    (row) => row?.title?.trim() && row?.description?.trim(),
  )
  const processSteps =
    cmsProcessSteps.length > 0
      ? cmsProcessSteps.map((row) => ({
          title: row.title!.trim(),
          description: row.description!.trim(),
        }))
      : locale === 'de'
        ? fallbackProcessDE
        : fallbackProcessEN
  const processLabel =
    g?.gastronomyProcessEyebrow?.trim() || (locale === 'de' ? 'Ablauf' : 'Process')
  const processTitle =
    g?.gastronomyProcessTitle?.trim() ||
    (locale === 'de' ? 'So arbeiten wir mit Ihrem Team' : 'How We Work With Your Team')

  const fallbackTestimonialsDE = [
    {
      quote:
        'Die Zusammenarbeit hat unsere Speisekarte klar aufgewertet. Die Fermentfreude-Ideen waren sofort umsetzbar.',
      author: 'Küchenleitung, Boutique-Hotel',
    },
    {
      quote:
        'Das Teamtraining war strukturiert, praxisnah und inspirierend. Genau das, was wir für unsere Küche gebraucht haben.',
      author: 'Head Chef, Fine Dining Restaurant',
    },
    {
      quote:
        'Unsere Gäste reagieren begeistert auf die neuen Ferment-Komponenten. Geschmacklich ein echter Unterschied.',
      author: 'Operations Lead, Catering Company',
    },
  ]
  const fallbackTestimonialsEN = [
    {
      quote:
        'The collaboration elevated our menu immediately. Fermentfreude delivered practical ideas we could execute fast.',
      author: 'Kitchen Lead, Boutique Hotel',
    },
    {
      quote:
        'The team workshop was clear, hands-on, and inspiring. Exactly what we needed for our kitchen operations.',
      author: 'Head Chef, Fine Dining Restaurant',
    },
    {
      quote:
        'Our guests love the new fermented elements. It made a visible difference in flavor and identity.',
      author: 'Operations Lead, Catering Company',
    },
  ]
  const cmsTestimonials = (g?.gastronomyTestimonialsItems ?? []).filter(
    (row) => row?.quote?.trim() && row?.author?.trim(),
  )
  const testimonials =
    cmsTestimonials.length > 0
      ? cmsTestimonials.map((row) => ({
          quote: row.quote!.trim(),
          author: row.author!.trim(),
        }))
      : locale === 'de'
        ? fallbackTestimonialsDE
        : fallbackTestimonialsEN
  const testimonialLabel =
    g?.gastronomyTestimonialsEyebrow?.trim() || (locale === 'de' ? 'Referenzen' : 'Testimonials')
  const testimonialTitle =
    g?.gastronomyTestimonialsTitle?.trim() ||
    (locale === 'de' ? 'Was Gastronomie-Profis sagen' : 'What Culinary Teams Say')

  const fallbackFaqDE = [
    {
      q: 'Für welche Teamgröße ist das geeignet?',
      a: 'Unsere Formate funktionieren für kleine Küchen-Teams ebenso wie für größere Hotel- oder Catering-Strukturen.',
    },
    {
      q: 'Wie schnell können wir starten?',
      a: 'Je nach Verfügbarkeit meist innerhalb weniger Wochen, inklusive klarer Vorbereitungsschritte.',
    },
    {
      q: 'Geht das auch bei uns vor Ort?',
      a: 'Ja, wir bieten On-Site Workshops und begleiten die Implementierung direkt in Ihrer Küche.',
    },
  ]
  const fallbackFaqEN = [
    {
      q: 'What team size is this suitable for?',
      a: 'Our formats work for small kitchen teams as well as larger hotel and catering operations.',
    },
    {
      q: 'How quickly can we start?',
      a: 'Depending on availability, usually within a few weeks including clear preparation steps.',
    },
    {
      q: 'Can this be delivered on-site?',
      a: 'Yes. We offer on-site workshops and support implementation directly in your kitchen.',
    },
  ]
  const cmsFaqItems = (g?.gastronomyFaqItems ?? []).filter(
    (row) => row?.question?.trim() && row?.answer?.trim(),
  )
  const faqMiniItems =
    cmsFaqItems.length > 0
      ? cmsFaqItems.map((row) => ({
          q: row.question!.trim(),
          a: row.answer!.trim(),
        }))
      : locale === 'de'
        ? fallbackFaqDE
        : fallbackFaqEN
  const faqMiniLabel = g?.gastronomyFaqEyebrow?.trim() || 'B2B FAQ'
  const faqMiniTitle =
    g?.gastronomyFaqTitle?.trim() ||
    (locale === 'de'
      ? 'Häufige Fragen von Gastronomiebetrieben'
      : 'Common Questions From Hospitality Teams')

  const formPlaceholders = g?.gastronomyFormPlaceholders as
    | { firstName?: string; lastName?: string; email?: string; message?: string }
    | undefined
  const subjectOptions = g?.gastronomySubjectOptions as
    | { default?: string; options?: Array<{ label?: string }> }
    | undefined

  const contactBlockProps = {
    blockType: 'contactBlock' as const,
    hideHeroSection: true,
    hero: {
      image: null,
      heading: '',
      subtext: '',
      buttonLabel: null,
      buttonHref: null,
    },
    contactImage: g?.gastronomyContactImage ?? null,
    contact: {
      heading: g?.gastronomyContactTitle ?? 'Contact',
      description:
        g?.gastronomyContactDescription ??
        'Would you like to book a workshop or have questions? We look forward to hearing from you.',
    },
    contactForm: {
      placeholders: {
        firstName: formPlaceholders?.firstName ?? 'First Name',
        lastName: formPlaceholders?.lastName ?? 'Last Name',
        email: formPlaceholders?.email ?? 'Email',
        message: formPlaceholders?.message ?? 'Message',
      },
      subjectOptions: {
        default: subjectOptions?.default ?? 'Subject',
        options: (subjectOptions?.options ?? []).map((o) => o?.label ?? '') || [
          'General Inquiry',
          'Workshop',
          'Product',
          'Partnership',
        ],
      },
      submitButton: g?.gastronomySubmitButtonLabel ?? 'Send Message',
    },
    ctaBanner: {
      heading: '',
      description: '',
      buttonLabel: '',
      buttonHref: '',
    },
    hideCtaBanner: true,
    hideMap: true,
  }

  return (
    <article className="font-sans">
      <GastronomyProductSlider
        slides={offerCards.map((c) => ({
          id: c.id ?? undefined,
          title: c.title,
          description: c.description,
          image: c.image,
        }))}
        ctaLabel={heroCtaLabel}
        ctaUrl={heroCtaUrl}
        prevLabel={sliderPrevLabel}
        nextLabel={sliderNextLabel}
        autoplayIntervalMs={sliderAutoplayMs}
      />

      <section
        className="px-6 pb-6 pt-2 md:px-12 md:pb-8 lg:px-20"
        aria-label={locale === 'de' ? 'Branchen & Partner' : 'Trusted by industries'}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-3 gap-y-3 rounded-full border border-[#E6E4E0] bg-white px-5 py-4 md:gap-x-5 md:px-8 md:py-5">
            <span className="shrink-0 font-display text-sm font-bold uppercase tracking-[0.14em] text-[#757575]">
              {trustedByHeading}
            </span>
            {trustBadges.map((badge, i) => (
              <span
                key={`${badge}-${i}`}
                className="inline-flex items-center rounded-full border border-[#E8E2D6] bg-white px-3.5 py-1.5 font-display text-sm font-bold text-[#333333] md:px-4"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-[#333333] px-8 py-16 md:px-16">
            <p className="text-center text-xl font-medium text-white md:text-2xl">{ctaHeading}</p>
            <p className="mt-4 text-center text-base text-[#E6BE68]">{ctaSubline}</p>
            <div className="mt-8 flex justify-center">
              <Link
                href={ctaButtonHref}
                className="inline-flex items-center justify-center rounded-full bg-[#E6BE68] px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#1b1b1b] transition-colors hover:bg-[#EDD195]"
              >
                {ctaButtonLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GastronomyOfferCards
        title={offerGridTitle}
        cards={offerDetails.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
        }))}
      />

      <section id="outcomes" className="scroll-mt-24 px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#737672]">
            {outcomeLabel}
          </p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold text-ff-black md:text-4xl">
            {outcomeTitle}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {outcomes.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#E6BE68]/28 bg-linear-to-b from-white to-[#FBF8F2] p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7f47]">
                  {outcomeBeforeLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ff-gray-text">{item.before}</p>
                <div className="my-3 h-px bg-black/10" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4a6b58]">
                  {outcomeAfterLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed font-semibold text-ff-black">
                  {item.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-24 px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[#111315] px-6 py-10 md:px-10 md:py-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#E6BE68]">
            {processLabel}
          </p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold text-white md:text-4xl">
            {processTitle}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {processSteps.map((step, i) => (
              <div
                key={`${step.title}-${i}`}
                className="rounded-2xl border border-white/14 bg-white/7 p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
              >
                <p className="font-display text-3xl font-bold text-[#E6BE68]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="scroll-mt-24 px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#737672]">
            {testimonialLabel}
          </p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold text-ff-black md:text-4xl">
            {testimonialTitle}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E6BE68]/25 bg-linear-to-b from-white to-[#FBF8F2] p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
              >
                <p className="text-sm leading-relaxed text-ff-gray-text md:text-base">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="mt-4 font-display text-sm font-bold text-ff-black">{item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#E6BE68]/28 bg-linear-to-b from-white to-[#FAF7F1] p-6 md:p-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#737672]">
            {faqMiniLabel}
          </p>
          <h2 className="mt-2 text-center font-display text-2xl font-bold text-ff-black md:text-3xl">
            {faqMiniTitle}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {faqMiniItems.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-black/8 bg-white p-5 text-center shadow-[0_8px_18px_rgba(0,0,0,0.04)]"
              >
                <h3 className="font-display text-base font-bold text-ff-black">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ff-gray-text">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="contact" className="scroll-mt-24">
        <ContactBlockComponent
          {...(contactBlockProps as unknown as Parameters<typeof ContactBlockComponent>[0])}
        />
      </div>

      <WorkshopCardsSection
        title={workshopSectionTitle}
        subtitle={workshopSectionSubtitle}
        clarification={workshopClarification}
        nextDateLabel={workshopNextDateLabel}
        cards={workshopCards.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.image,
          price: c.price,
          priceSuffix: (c as { priceSuffix?: string }).priceSuffix,
          buttonLabel: c.buttonLabel,
          buttonUrl: c.buttonUrl,
          nextDate: (c as { nextDate?: string }).nextDate,
        }))}
        cardBg="#ffffff"
        layout="centered"
      />

      {page?.id && (
        <EditPageLink collection="pages" id={String(page.id)} label="Edit page in Admin" />
      )}

      <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
        <Link
          href={ctaButtonHref}
          className="block rounded-full bg-[#1b1b1b] px-6 py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-white shadow-[0_12px_26px_rgba(0,0,0,0.28)]"
        >
          {ctaButtonLabel}
        </Link>
      </div>
    </article>
  )
}
