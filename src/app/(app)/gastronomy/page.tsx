import type { Metadata } from 'next'

import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { EditPageLink } from '@/components/EditPageLink'
import { GastronomyOfferCards } from '@/components/gastronomy/GastronomyOfferCards'
import { GastronomyProductSlider } from '@/components/gastronomy/GastronomyProductSlider'
import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import type { Page as PageType } from '@/payload-types'

const DEFAULT_HERO_CTA = 'Take A Look'
const DEFAULT_OFFER_TITLE = 'What we offer'
const DEFAULT_QUOTE =
  "Transform tradition into innovation. Fermentation is not just preservation it's the future of gastronomy."
const DEFAULT_QUOTE_SUBTEXT = 'Partner with us to differentiate your business.'
const DEFAULT_WORKSHOP_TITLE = 'Next Workshop'
const DEFAULT_WORKSHOP_SUBTITLE = 'Exclusive and Personalized Fermentations'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL = 'Next Appointment:'
const TRUSTED_BY_DEFAULT = 'Trusted by'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Gastronomie | Fermentfreude',
    description:
      'Fermentierte Produkte für Restaurants, Hotels und Catering. Heben Sie Ihre Küche mit einzigartigen Aromen und probiotischen Zutaten auf ein neues Level.',
  }
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
  const offerSectionTitle = g?.gastronomyOfferSectionTitle ?? DEFAULT_OFFER_TITLE
  const offerCards = g?.gastronomyOfferCards ?? []
  const quoteText = g?.gastronomyQuoteText ?? DEFAULT_QUOTE
  const quoteSubtext = g?.gastronomyQuoteSubtext ?? DEFAULT_QUOTE_SUBTEXT
  const quoteButtonLabel =
    (g as unknown as { gastronomyQuoteButtonLabel?: string } | undefined)?.gastronomyQuoteButtonLabel ??
    (locale === 'de' ? 'Anfrage senden' : 'Send Inquiry')
  const quoteButtonUrl =
    (g as unknown as { gastronomyQuoteButtonUrl?: string } | undefined)?.gastronomyQuoteButtonUrl ??
    '#contact'
  const workshopSectionTitle = g?.gastronomyWorkshopSectionTitle ?? DEFAULT_WORKSHOP_TITLE
  const workshopSectionSubtitle = g?.gastronomyWorkshopSectionSubtitle ?? DEFAULT_WORKSHOP_SUBTITLE
  const workshopClarification = g?.gastronomyWorkshopClarification ?? null
  const workshopNextDateLabel =
    g?.gastronomyWorkshopNextDateLabel ?? DEFAULT_WORKSHOP_NEXT_DATE_LABEL
  const workshopCards = g?.gastronomyWorkshopCards ?? []
  const offerDetails = g?.gastronomyOfferDetails ?? []
  const trustedByLabel = locale === 'de' ? 'Vertraut von' : TRUSTED_BY_DEFAULT
  const trustBadges =
    locale === 'de'
      ? ['Restaurants', 'Hotels', 'Catering', 'Feinkost', 'Food Concept Stores']
      : ['Restaurants', 'Hotels', 'Catering', 'Delis', 'Food Concept Stores']
  const outcomeLabel = locale === 'de' ? 'Ergebnisse' : 'Outcomes'
  const outcomeTitle = locale === 'de' ? 'Vorher / Nachher in der Küche' : 'Before / After In The Kitchen'
  const outcomes =
    locale === 'de'
      ? [
          { before: 'Kein klares Ferment-Angebot', after: 'Signature-Komponenten mit Wiedererkennungswert' },
          { before: 'Unsichere Team-Abläufe', after: 'Klare Standards für Produktion und Service' },
          { before: 'Standard-Menüs ohne Differenzierung', after: 'Markante Aromen mit eigener Handschrift' },
        ]
      : [
          { before: 'No clear fermentation offer', after: 'Signature components with strong identity' },
          { before: 'Inconsistent team workflows', after: 'Clear standards for production and service' },
          { before: 'Standard menus with little differentiation', after: 'Distinctive flavors with a unique point of view' },
        ]
  const processLabel = locale === 'de' ? 'Ablauf' : 'Process'
  const processTitle = locale === 'de' ? 'So arbeiten wir mit Ihrem Team' : 'How We Work With Your Team'
  const processSteps =
    locale === 'de'
      ? [
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
      : [
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
  const testimonialLabel = locale === 'de' ? 'Referenzen' : 'Testimonials'
  const testimonialTitle =
    locale === 'de' ? 'Was Gastronomie-Profis sagen' : 'What Culinary Teams Say'
  const testimonials =
    locale === 'de'
      ? [
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
      : [
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
  const faqMiniLabel = locale === 'de' ? 'B2B FAQ' : 'B2B FAQ'
  const faqMiniTitle =
    locale === 'de'
      ? 'Häufige Fragen von Gastronomiebetrieben'
      : 'Common Questions From Hospitality Teams'
  const faqMiniItems =
    locale === 'de'
      ? [
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
      : [
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

  const formPlaceholders = g?.gastronomyFormPlaceholders as
    | { firstName?: string; lastName?: string; email?: string; message?: string }
    | undefined
  const subjectOptions = g?.gastronomySubjectOptions as
    | { default?: string; options?: Array<{ label?: string }> }
    | undefined

  // Contact section — same design as About page ContactBlock; CTA banner and map hidden — same design as About page ContactBlock (defaults in English per rules)
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
      {/* Hero — Kitchen Knives style product slider */}
      <GastronomyProductSlider
        slides={offerCards.map((c) => ({
          id: c.id ?? undefined,
          title: c.title,
          description: c.description,
          image: c.image,
        }))}
        ctaLabel={heroCtaLabel}
        ctaUrl={heroCtaUrl}
      />

      {/* Trust strip — quick social proof right after hero */}
      <section className="px-6 py-6 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-black/8 bg-white p-4 md:gap-4 md:p-5">
          <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-[#737672]">
            {trustedByLabel}
          </span>
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center rounded-full border border-[#E6BE68]/45 bg-white px-3 py-1.5 text-xs font-semibold text-[#333333] md:px-4 md:text-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Quote — bg #333333, main quote white, subtext #E6BE68 */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-[#333333] px-8 py-16 md:px-16">
            <p className="text-center text-xl font-medium text-white md:text-2xl">{quoteText}</p>
            <p className="mt-4 text-center text-base text-[#E6BE68]">{quoteSubtext}</p>
            <div className="mt-8 flex justify-center">
              <Link
                href={quoteButtonUrl}
                className="inline-flex items-center justify-center rounded-full bg-[#E6BE68] px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#1b1b1b] transition-colors hover:bg-[#EDD195]"
              >
                {quoteButtonLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What we offer — modern 6 boxes */}
      <GastronomyOfferCards
        title={offerSectionTitle}
        cards={offerDetails.slice(0, 6).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
        }))}
      />

      {/* Outcomes — before / after clarity */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
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
                className="rounded-2xl border border-[#E6BE68]/28 bg-gradient-to-b from-white to-[#FBF8F2] p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7f47]">
                  {locale === 'de' ? 'Vorher' : 'Before'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ff-gray-text">{item.before}</p>
                <div className="my-3 h-px bg-black/10" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4a6b58]">
                  {locale === 'de' ? 'Nachher' : 'After'}
                </p>
                <p className="mt-2 text-sm leading-relaxed font-semibold text-ff-black">{item.after}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
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
                key={step.title}
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

      {/* Testimonials — compact proof block for credibility */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
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
                className="rounded-2xl border border-[#E6BE68]/25 bg-gradient-to-b from-white to-[#FBF8F2] p-6 text-center shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
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

      {/* B2B FAQ mini block */}
      <section className="px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#E6BE68]/28 bg-gradient-to-b from-white to-[#FAF7F1] p-6 md:p-8">
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

      {/* Content tab blocks — editable in Admin → Pages → Gastronomy → Content */}
      {page?.layout && page.layout.length > 0 && (
        <div className="px-6 py-16 md:px-12 lg:px-20">
          <RenderBlocks blocks={page.layout} />
        </div>
      )}

      {/* Contact — same design as About page */}
      <div id="contact">
        <ContactBlockComponent
          {...(contactBlockProps as unknown as Parameters<typeof ContactBlockComponent>[0])}
        />
      </div>

      {/* Next Workshop — moved to bottom to keep B2B flow focused */}
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

      {/* Edit in Admin — floating link to design/edit the page */}
      {page?.id && (
        <EditPageLink collection="pages" id={String(page.id)} label="Edit page in Admin" />
      )}

      {/* Sticky mobile CTA — keeps inquiry action always visible */}
      <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
        <Link
          href="#contact"
          className="block rounded-full bg-[#1b1b1b] px-6 py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-white shadow-[0_12px_26px_rgba(0,0,0,0.28)]"
        >
          {quoteButtonLabel}
        </Link>
      </div>
    </article>
  )
}
