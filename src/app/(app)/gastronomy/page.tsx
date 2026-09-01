import type { Metadata } from 'next'

import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { GastronomyOfferCards } from '@/components/gastronomy/GastronomyOfferCards'
import { GastronomyProductSlider } from '@/components/gastronomy/GastronomyProductSlider'
import { WorkshopCardsSection } from '@/components/WorkshopCardsSection'
import { generateMeta } from '@/utilities/generateMeta'
import { getLocale } from '@/utilities/getLocale'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import {
  GASTRONOMY_FAQ_EN,
  GASTRONOMY_OUTCOMES_EN,
  GASTRONOMY_PROCESS_STEPS_EN,
  GASTRONOMY_TESTIMONIALS_EN,
  GASTRONOMY_TRUST_BADGES_EN,
  isGermanBeforeAfterLabel,
  looksGerman,
  resolveLocalizedRows,
  resolveLocalizedText,
  resolveTrustBadges,
  resolveTrustedByHeading,
} from '@/utilities/gastronomyLocaleContent'
import { buildSyncedWorkshopCards } from '@/utilities/gastronomyWorkshopCards'
import { getWorkshopPageCardDataByHref } from '@/utilities/workshopHeroImages'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { getPayload } from 'payload'

import type { Page as PageType } from '@/payload-types'

const DEFAULT_HERO_CTA_EN = 'Take A Look'
const DEFAULT_HERO_CTA_DE = 'Jetzt ansehen'
const DEFAULT_OFFER_TITLE_EN = 'What we offer'
const DEFAULT_OFFER_TITLE_DE = 'Was wir bieten'
const DEFAULT_CTA_HEADING_EN =
  "Transform tradition into innovation. Fermentation is not just preservation it's the future of gastronomy."
const DEFAULT_CTA_HEADING_DE =
  'Tradition in Innovation verwandeln. Fermentation ist mehr als Konservierung – sie ist die Zukunft der Gastronomie.'
const DEFAULT_CTA_SUBLINE_EN = 'Partner with us to differentiate your business.'
const DEFAULT_CTA_SUBLINE_DE = 'Gemeinsam heben wir euer Angebot von der Masse ab.'
const DEFAULT_CTA_BUTTON_EN = 'Send inquiry'
const DEFAULT_CTA_BUTTON_DE = 'Anfrage senden'
const DEFAULT_WORKSHOP_TITLE_EN = 'Next workshop'
const DEFAULT_WORKSHOP_TITLE_DE = 'Nächster Workshop'
const DEFAULT_WORKSHOP_SUBTITLE_EN = 'Exclusive and personalized fermentations'
const DEFAULT_WORKSHOP_SUBTITLE_DE = 'Exklusive und persönliche Fermentationen'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL_EN = 'Next date:'
const DEFAULT_WORKSHOP_NEXT_DATE_LABEL_DE = 'Nächster Termin:'
const DEFAULT_SLIDER_PREV_EN = 'PREV'
const DEFAULT_SLIDER_PREV_DE = 'ZURÜCK'
const DEFAULT_SLIDER_NEXT_EN = 'NEXT'
const DEFAULT_SLIDER_NEXT_DE = 'VOR'
const TRUSTED_BY_DEFAULT = 'Trusted by'
const TRUSTED_BY_DEFAULT_DE = 'Für Profiküchen'
const FALLBACK_TRUST_BADGES_DE = [
  'Restaurants',
  'Hotels',
  'Catering',
  'Feinkost',
  'Gemeinschaftsverpflegung',
] as const

function isGermanSliderPrevLabel(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return false
  return /^zurück$|^zurueck$/i.test(trimmed)
}

function isGermanSliderNextLabel(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return false
  return /^vor$|^weiter$/i.test(trimmed)
}

function resolveSliderNavLabel(
  cmsValue: string | null | undefined,
  locale: 'de' | 'en',
  deDefault: string,
  enDefault: string,
  isGermanBleed: (value: string | null | undefined) => boolean,
): string {
  const trimmed = cmsValue?.trim()
  if (locale === 'en' && (!trimmed || isGermanBleed(trimmed))) {
    return enDefault
  }
  return trimmed || (locale === 'de' ? deDefault : enDefault)
}

async function fetchGastronomyPage(locale: string) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'gastronomy' } },
    limit: 1,
    depth: 4,
    locale: locale as 'de' | 'en',
    fallbackLocale: false,
  })
  return (result.docs[0] as PageType | undefined) ?? null
}

const getCachedGastronomyPageProd = unstable_cache(
  fetchGastronomyPage,
  ['gastronomy-page'],
  { revalidate: 3600, tags: ['pages'] },
)

async function getCachedGastronomyPage(locale: string) {
  if (process.env.NODE_ENV === 'development') {
    return fetchGastronomyPage(locale)
  }
  return getCachedGastronomyPageProd(locale)
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const locale = await getLocale()
    const doc = await getCachedGastronomyPage(locale)
    if (!doc) return { title: 'Gastronomie | Fermentfreude' }
    return generateMeta({ doc })
  } catch {
    return { title: 'Gastronomie | Fermentfreude' }
  }
}

export default async function GastronomyPage() {
  const locale = await getLocale()
  const page = await getCachedGastronomyPage(locale)
  const g = page?.gastronomy

  const localeKey = locale as 'de' | 'en'
  const heroCtaLabel = resolveLocalizedText(
    g?.gastronomyHeroCtaLabel,
    localeKey,
    DEFAULT_HERO_CTA_DE,
    DEFAULT_HERO_CTA_EN,
  )
  const heroCtaUrl = g?.gastronomyHeroCtaUrl ?? '#offer'
  const detailsTitle = g?.gastronomyOfferDetailsTitle?.trim()
  const sectionTitleFallback = g?.gastronomyOfferSectionTitle?.trim()
  const offerGridTitleRaw =
    (detailsTitle && detailsTitle.length > 0 ? detailsTitle : null) ??
    (sectionTitleFallback && sectionTitleFallback.length > 0 ? sectionTitleFallback : null)
  const offerGridTitle = resolveLocalizedText(
    offerGridTitleRaw,
    locale as 'de' | 'en',
    DEFAULT_OFFER_TITLE_DE,
    DEFAULT_OFFER_TITLE_EN,
  )
  const offerCardsFromCms = (g?.gastronomyOfferCards ?? []).filter(
    (card) => card?.title?.trim() && card?.description?.trim(),
  )
  const offerCards =
    localeKey === 'en' &&
    offerCardsFromCms.length > 0 &&
    looksGerman(
      offerCardsFromCms.map((card) => `${card.title} ${card.description}`).join(' '),
    )
      ? []
      : (g?.gastronomyOfferCards ?? [])

  const cta = g?.gastronomyCtaBanner
  const ctaHeading = resolveLocalizedText(
    cta?.heading,
    localeKey,
    DEFAULT_CTA_HEADING_DE,
    DEFAULT_CTA_HEADING_EN,
  )
  const ctaSubline = resolveLocalizedText(
    cta?.description,
    localeKey,
    DEFAULT_CTA_SUBLINE_DE,
    DEFAULT_CTA_SUBLINE_EN,
  )
  const ctaButtonLabel = resolveLocalizedText(
    cta?.buttonLabel,
    localeKey,
    DEFAULT_CTA_BUTTON_DE,
    DEFAULT_CTA_BUTTON_EN,
  )
  const ctaButtonHref = cta?.buttonHref?.trim() || '#contact'

  const workshopSectionTitle = resolveLocalizedText(
    g?.gastronomyWorkshopSectionTitle,
    localeKey,
    DEFAULT_WORKSHOP_TITLE_DE,
    DEFAULT_WORKSHOP_TITLE_EN,
  )
  const workshopSectionSubtitle = resolveLocalizedText(
    g?.gastronomyWorkshopSectionSubtitle,
    localeKey,
    DEFAULT_WORKSHOP_SUBTITLE_DE,
    DEFAULT_WORKSHOP_SUBTITLE_EN,
  )
  const workshopClarification =
    localeKey === 'en' &&
    g?.gastronomyWorkshopClarification?.trim() &&
    looksGerman(g.gastronomyWorkshopClarification)
      ? null
      : (g?.gastronomyWorkshopClarification ?? null)
  const workshopNextDateLabel = resolveLocalizedText(
    g?.gastronomyWorkshopNextDateLabel,
    localeKey,
    DEFAULT_WORKSHOP_NEXT_DATE_LABEL_DE,
    DEFAULT_WORKSHOP_NEXT_DATE_LABEL_EN,
  )
  const [nextDates, workshopPageData] = await Promise.all([
    getNextWorkshopDatesByHref(locale === 'en' ? 'en' : 'de'),
    getWorkshopPageCardDataByHref(locale as 'de' | 'en'),
  ])
  const workshopCards = buildSyncedWorkshopCards(
    g?.gastronomyWorkshopCards ?? [],
    workshopPageData,
    locale as 'de' | 'en',
    nextDates,
  )
  const offerDetailsFromCms = (g?.gastronomyOfferDetails ?? [])
    .filter((item) => item?.title?.trim() && item?.description?.trim())
    .map((item) => ({
      id: item.id,
      title: item.title!.trim(),
      description: item.description!.trim(),
      icon: item.icon,
    }))
  const offerDetails =
    offerDetailsFromCms.length > 0 &&
    !(locale === 'en' &&
      looksGerman(
        offerDetailsFromCms.map((item) => `${item.title} ${item.description}`).join(' '),
      ))
      ? offerDetailsFromCms
      : []

  const trustedByHeadingRaw = g?.gastronomyTrustedByHeading?.trim()
  const trustedByHeading = resolveTrustedByHeading(
    trustedByHeadingRaw,
    locale as 'de' | 'en',
    TRUSTED_BY_DEFAULT_DE,
    TRUSTED_BY_DEFAULT,
  )
  const trustBadgesFromCms = (g?.gastronomyTrustedByBadges ?? [])
    .map((b) => b?.label?.trim())
    .filter((x): x is string => Boolean(x))
  const trustBadges = resolveTrustBadges(
    trustBadgesFromCms,
    locale as 'de' | 'en',
    FALLBACK_TRUST_BADGES_DE,
    GASTRONOMY_TRUST_BADGES_EN,
  )

  const sliderPrevLabel = resolveSliderNavLabel(
    g?.gastronomyHeroSliderPrevLabel,
    locale as 'de' | 'en',
    DEFAULT_SLIDER_PREV_DE,
    DEFAULT_SLIDER_PREV_EN,
    isGermanSliderPrevLabel,
  )
  const sliderNextLabel = resolveSliderNavLabel(
    g?.gastronomyHeroSliderNextLabel,
    locale as 'de' | 'en',
    DEFAULT_SLIDER_NEXT_DE,
    DEFAULT_SLIDER_NEXT_EN,
    isGermanSliderNextLabel,
  )
  const sliderAutoplayMs =
    typeof g?.gastronomyHeroSliderAutoplayMs === 'number' &&
    Number.isFinite(g.gastronomyHeroSliderAutoplayMs) &&
    g.gastronomyHeroSliderAutoplayMs >= 2000
      ? g.gastronomyHeroSliderAutoplayMs
      : null

  const fallbackOutcomesDE = [
    {
      before: 'Vegetarische Optionen ohne Substanz',
      after: 'Tempeh als eigenständiges, pflanzliches Hauptgericht',
    },
    {
      before: 'Stark verarbeitete Fleischalternativen auf der Karte',
      after: 'Fermentierte Produkte auf Basis echter, regionaler Zutaten',
    },
    {
      before: 'Austauschbare Gerichte ohne Profil',
      after: 'Gerichte mit eigener Handschrift und Wiedererkennungswert',
    },
  ]
  const cmsOutcomeRows = (g?.gastronomyOutcomesItems ?? [])
    .filter((row) => row?.before?.trim() && row?.after?.trim())
    .map((row) => ({
      before: row.before!.trim(),
      after: row.after!.trim(),
    }))
  const outcomes = resolveLocalizedRows(
    cmsOutcomeRows,
    locale as 'de' | 'en',
    fallbackOutcomesDE,
    GASTRONOMY_OUTCOMES_EN,
    (rows) => rows.map((row) => `${row.before} ${row.after}`).join(' '),
  )
  const outcomeLabel = resolveLocalizedText(
    g?.gastronomyOutcomesEyebrow,
    locale as 'de' | 'en',
    'Ausgangssituation in vielen Küchen',
    'The situation in many kitchens',
  )
  const outcomeTitle = resolveLocalizedText(
    g?.gastronomyOutcomesTitle,
    locale as 'de' | 'en',
    'So verändert Fermentation Ihre Küche',
    'How fermentation transforms your kitchen',
  )
  const outcomeBeforeLabel = resolveLocalizedText(
    g?.gastronomyOutcomesBeforeLabel,
    locale as 'de' | 'en',
    'Vorher',
    'Before',
    isGermanBeforeAfterLabel,
  )
  const outcomeAfterLabel = resolveLocalizedText(
    g?.gastronomyOutcomesAfterLabel,
    locale as 'de' | 'en',
    'Nachher',
    'After',
    isGermanBeforeAfterLabel,
  )

  const fallbackProcessDE = [
    {
      title: 'Tempeh & Co.',
      description:
        'Für den Einsatz in Ihrer Küche – wir zeigen Ihnen, wie Fermente in Ihre Gerichte passen',
    },
    {
      title: 'Schulungen für Küchenteams',
      description:
        'Praxisnahes Wissen, um Fermente im Betrieb herzustellen und sinnvoll einzusetzen.',
    },
    {
      title: 'Teambuilding-Events für Unternehmen',
      description:
        'Gemeinsam fermentieren und erleben – als kulinarisches Format für Ihr Team.',
    },
  ]
  const cmsProcessSteps = (g?.gastronomyProcessSteps ?? [])
    .filter((row) => row?.title?.trim() && row?.description?.trim())
    .map((row) => ({
      title: row.title!.trim(),
      description: row.description!.trim(),
    }))
  const processSteps = resolveLocalizedRows(
    cmsProcessSteps,
    locale as 'de' | 'en',
    fallbackProcessDE,
    GASTRONOMY_PROCESS_STEPS_EN,
    (rows) => rows.map((row) => `${row.title} ${row.description}`).join(' '),
  )
  const processLabel = resolveLocalizedText(
    g?.gastronomyProcessEyebrow,
    locale as 'de' | 'en',
    'Interesse geweckt?',
    'Interested?',
  )
  const processTitle = resolveLocalizedText(
    g?.gastronomyProcessTitle,
    locale as 'de' | 'en',
    'Einfach anfragen und ausprobieren',
    'Just ask and give it a try',
  )

  const fallbackTestimonialsDE = [
    {
      quote:
        'Der Käferbohnen-Tempeh von Fermentfreude überzeugt durch seinen mild-nussigen Geschmack und vielseitige Einsetzbarkeit. Eine echte Bereicherung für die steirische Küche.',
      author: 'Michael Wankerl, Gerüchteküche',
    },
    {
      quote:
        'Die Zusammenarbeit unterstreicht genau das, wofür wir stehen: saisonales Gemüse, handwerkliches Wissen und echte Wertschätzung für Lebensmittel. Die Workshops sind praxisnah, inspirierend und passen perfekt in unseren Marktgarten-Alltag.',
      author: 'Johanna & Bernhard Steinhauszer, Unser Bauerngarten',
    },
    {
      quote:
        'Der SVS-Kulmland-Gesundheitstag wurde durch die Workshops von Fermentfreude fachlich und praktisch bereichert. Die Zusammenarbeit war professionell und die Rückmeldungen der Teilnehmer:innen sehr positiv.',
      author: 'Mag. Robert Matzer, Kulmland',
    },
  ]
  const cmsTestimonials = (g?.gastronomyTestimonialsItems ?? [])
    .filter((row) => row?.quote?.trim() && row?.author?.trim())
    .map((row) => ({
      quote: row.quote!.trim(),
      author: row.author!.trim(),
    }))
  const testimonials = resolveLocalizedRows(
    cmsTestimonials,
    locale as 'de' | 'en',
    fallbackTestimonialsDE,
    GASTRONOMY_TESTIMONIALS_EN,
    (rows) => rows.map((row) => `${row.quote} ${row.author}`).join(' '),
  )
  const testimonialLabel = resolveLocalizedText(
    g?.gastronomyTestimonialsEyebrow,
    locale as 'de' | 'en',
    'Referenzen',
    'References',
  )
  const testimonialTitle = resolveLocalizedText(
    g?.gastronomyTestimonialsTitle,
    locale as 'de' | 'en',
    'Das sagen Gastro-Profis, Betriebe und Unternehmer:innen',
    'What gastro professionals, businesses and entrepreneurs say',
  )

  const fallbackFaqDE = [
    {
      q: 'Wie aufwendig ist der Einsatz von Tempeh im Betrieb?',
      a: 'Der Einsatz ist unkompliziert. Tempeh kommt als Block (ca. 200g) und kann wie andere Komponenten gebraten, mariniert oder weiterverarbeitet werden und lässt sich ohne große Umstellungen in bestehende Abläufe integrieren',
    },
    {
      q: 'Muss ich meine Gerichte oder Abläufe anpassen?',
      a: 'Nein. Tempeh lässt sich in bestehende Gerichte integrieren oder als neue Komponente einsetzen – ohne dass die Küche grundlegend umgestellt werden muss.',
    },
    {
      q: 'Ist Tempeh ein Ersatzprodukt für Fleisch?',
      a: 'Nein. Tempeh ist zwar sehr proteinreich aber ein eigenständiges Lebensmittel auf Basis von Hülsenfrüchte mit eigener Textur und Aromatik – kein klassischer Fleischersatz.',
    },
    {
      q: 'Ist Tempeh vegan?',
      a: 'Ja, bei Tempeh handelt es sich um ein veganes und glutenfreies Produkt.',
    },
    {
      q: 'Braucht mein Team Erfahrung mit Fermentation?',
      a: 'Nein. Wir zeigen praxisnah, wie Tempeh und andere Fermente im Betrieb eingesetzt oder selbst hergestellt werden können – abgestimmt auf Ihren Küchenalltag.',
    },
    {
      q: 'Wie wird Tempeh gelagert und wie lange ist er haltbar?',
      a: 'Tempeh wird gekühlt gelagert und ist bei richtiger Lagerung mehrere Wochen haltbar. Er lässt sich gut in bestehende Kühlketten integrieren.',
    },
    {
      q: 'Wie erfolgt die Lieferung?',
      a: 'Wir liefern vorerst im Großraum Graz und in der Steiermark direkt aus. Der Versand innerhalb Österreichs ist in Planung und wird schrittweise aufgebaut.',
    },
    {
      q: 'Bieten Sie neben Tempeh auch andere Produkte an?',
      a: 'Ja. Neben Käferbohnen-Tempeh bieten wir ausgewählte fermentierte Produkte wie Kimchi oder andere Lakto-Fermente an.',
    },
  ]
  const cmsFaqItems = (g?.gastronomyFaqItems ?? [])
    .filter((row) => row?.question?.trim() && row?.answer?.trim())
    .map((row) => ({
      q: row.question!.trim(),
      a: row.answer!.trim(),
    }))
  const faqMiniItems = resolveLocalizedRows(
    cmsFaqItems,
    locale as 'de' | 'en',
    fallbackFaqDE,
    GASTRONOMY_FAQ_EN,
    (rows) => rows.map((row) => `${row.q} ${row.a}`).join(' '),
  )
  const faqMiniLabel = resolveLocalizedText(
    g?.gastronomyFaqEyebrow,
    locale as 'de' | 'en',
    'FAQ',
    'FAQ',
  )
  const faqMiniTitle = resolveLocalizedText(
    g?.gastronomyFaqTitle,
    locale as 'de' | 'en',
    'Häufige Fragen',
    'Common questions',
  )

  const formPlaceholders = g?.gastronomyFormPlaceholders as
    | { firstName?: string; lastName?: string; email?: string; message?: string }
    | undefined
  const subjectOptions = g?.gastronomySubjectOptions as
    | { default?: string; options?: Array<{ label?: string }> }
    | undefined
  const contactFormHeading = resolveLocalizedText(
    g?.gastronomyContactFormHeading,
    localeKey,
    'Frag uns alles',
    'Ask About Anything',
  )

  const contactHeadingFallback =
    locale === 'de' ? 'Kontakt' : 'Contact'
  const contactDescriptionFallback =
    locale === 'de'
      ? 'Möchtet ihr einen Workshop buchen oder habt ihr Fragen? Wir freuen uns auf eure Nachricht.'
      : 'Would you like to book a workshop or have questions? We look forward to hearing from you.'
  const subjectOptionLabels = (subjectOptions?.options ?? [])
    .map((o) => o?.label?.trim())
    .filter((x): x is string => Boolean(x))
  const defaultSubjectOptions =
    locale === 'de'
      ? ['Allgemeine Anfrage', 'Workshop', 'Produkt', 'Partnerschaft']
      : ['General Inquiry', 'Workshop', 'Product', 'Partnership']

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
      heading: resolveLocalizedText(
        g?.gastronomyContactTitle,
        localeKey,
        contactHeadingFallback,
        contactHeadingFallback,
      ),
      description: resolveLocalizedText(
        g?.gastronomyContactDescription,
        localeKey,
        contactDescriptionFallback,
        contactDescriptionFallback,
      ),
      address: g?.gastronomyContactAddress ?? undefined,
      phone: g?.gastronomyContactPhone ?? undefined,
      email: g?.gastronomyContactEmail ?? undefined,
    },
    contactForm: {
      formHeading: contactFormHeading,
      placeholders: {
        firstName: resolveLocalizedText(
          formPlaceholders?.firstName,
          localeKey,
          'Vorname',
          'First Name',
        ),
        lastName: resolveLocalizedText(
          formPlaceholders?.lastName,
          localeKey,
          'Nachname',
          'Last Name',
        ),
        email: resolveLocalizedText(formPlaceholders?.email, localeKey, 'E-Mail', 'Email'),
        message: resolveLocalizedText(formPlaceholders?.message, localeKey, 'Nachricht', 'Message'),
      },
      subjectOptions: {
        default: resolveLocalizedText(subjectOptions?.default, localeKey, 'Betreff', 'Subject'),
        options:
          subjectOptionLabels.length > 0 &&
          !(localeKey === 'en' && looksGerman(subjectOptionLabels.join(' ')))
            ? subjectOptionLabels
            : defaultSubjectOptions,
      },
      submitButton: resolveLocalizedText(
        g?.gastronomySubmitButtonLabel,
        localeKey,
        'Nachricht senden',
        'Send message',
      ),
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
        locale={locale}
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
          availableSpots: (c as { availableSpots?: number }).availableSpots,
        }))}
        cardBg="#ffffff"
        layout="centered"
        locale={locale as 'de' | 'en'}
      />

    </article>
  )
}
