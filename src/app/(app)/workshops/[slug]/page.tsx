import type { Media as MediaType, Page as PageType } from '@/payload-types'
import type { Metadata } from 'next'

import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { FermentedVegHowTos } from '@/components/fermentation/FermentedVegHowTos'
import { FAQSliderSection } from '@/components/workshops/FAQSliderSection'
import { GiftAndOnlineSection } from '@/components/workshops/GiftAndOnlineSection'
import { LearnOnlineSection } from '@/components/workshops/LearnOnlineSection'
import { TeamBuildingSection } from '@/components/workshops/TeamBuildingSection'
import { WhyOnlineSection } from '@/components/workshops/WhyOnlineSection'
import { WorkshopBookingSection } from '@/components/workshops/WorkshopBookingSection'
import { WorkshopTermineSection } from '@/components/workshops/WorkshopTermineSection'
import { WorkshopTypesSlider } from '@/components/workshops/WorkshopTypesSlider'
import { getLatestPosts } from '@/utilities/getLatestPosts'
import { getPostsBySlugs } from '@/utilities/getPostsBySlugs'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import { getVoucherCtaGlobal } from '@/utilities/getVoucherCtaGlobal'
import type { WorkshopItem } from '@/utilities/getWorkshops'
import { findWorkshopBySlug, getAllWorkshops } from '@/utilities/getWorkshops'
import { getWorkshopTermine } from '@/utilities/getWorkshopTermine'
import { draftMode } from 'next/headers'
import { getWorkshopAppointments } from './get-workshop-appointments'
import { KombuchaBookingCard } from './KombuchaBookingCard'
import { KombuchaFAQ } from './KombuchaFAQ'
import { KombuchaHero } from './KombuchaHero'
import { KombuchaVoucherCta } from './KombuchaVoucherCta'
import { LaktoBookingCard } from './LaktoBookingCard'
import { LaktoCalendar } from './LaktoCalendar'
import { LaktoFAQ } from './LaktoFAQ'
import { LaktoHero } from './LaktoHero'
import { LaktoVoucherCta } from './LaktoVoucherCta'
import { tempehDefaults } from './tempeh-data'
import { TempehBookingCard } from './TempehBookingCard'
import { TempehFAQ } from './TempehFAQ'
import { TempehHero } from './TempehHero'
import { TempehVoucherCta } from './TempehVoucherCta'
import { FeldInsGlasExperience } from './FeldInsGlas/Experience'
import { FeldInsGlasHero } from './FeldInsGlas/Hero'
import { FeldInsGlasFAQ } from './FeldInsGlas/FAQ'
import { FeldInsGlasHowTos } from './FeldInsGlas/HowTos'
import { FeldInsGlasVoucher } from './FeldInsGlas/Voucher'
import { FeldInsGlasMoreWorkshops } from './FeldInsGlas/MoreWorkshops'
import {
  FELD_INS_GLAS_COPY,
  FELD_INS_GLAS_HOWTO_SLUGS,
  FELD_INS_GLAS_SLUG,
  getFeldInsGlasWorkshop,
} from './FeldInsGlas/data'
import { getFeldInsGlasImages } from './FeldInsGlas/images'
import { getWorkshopBySlug } from './workshop-data'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop detail page — /workshops/[slug]
 *  Design: Hero, Workshop Types, Alle Termine, Workshop Booking, Gift & Online
 * ═══════════════════════════════════════════════════════════════ */

const DEFAULT_BOOK_LABEL = 'Jetzt buchen'
const DEFAULT_BOOK_LABEL_EN = 'Book now'
const DEFAULT_LEARN_MORE_LABEL = 'Mehr erfahren'
const DEFAULT_LEARN_MORE_LABEL_EN = 'Learn more'
const DEFAULT_WORKSHOP_TYPES_DE = 'Workshop-Arten'
const DEFAULT_WORKSHOP_TYPES_EN = 'Workshop Types'
const DEFAULT_WORKSHOP_TYPES_SUB_DE =
  'Wähle deinen Weg in die Welt der Mikroorganismen. Jeder Workshop ist für Einsteiger und Enthusiasten konzipiert.'
const DEFAULT_WORKSHOP_TYPES_SUB_EN =
  'Choose your path into the world of microorganisms. Each workshop is designed for beginners and enthusiasts alike.'
const DEFAULT_WORKSHOP_TYPE_PILL_DE = 'WORKSHOP-ART'
const DEFAULT_WORKSHOP_TYPE_PILL_EN = 'WORKSHOP TYPE'
const DEFAULT_ALLE_TERMINE_DE = 'Alle Termine'
const DEFAULT_ALLE_TERMINE_EN = 'All Appointments'
const DEFAULT_ALLE_TERMINE_SUB_DE = 'Finde den perfekten Workshop-Termin für dich.'
const DEFAULT_ALLE_TERMINE_SUB_EN = 'Find the perfect workshop appointment for you.'
const DEFAULT_SLOTS_FREE_DE = 'Plätze frei'
const DEFAULT_SLOTS_FREE_EN = 'spots available'
const DEFAULT_FILTER_ALL_DE = 'Alle Workshops'
const DEFAULT_FILTER_ALL_EN = 'All workshops'
const DEFAULT_DATE_LABEL_DE = 'Datum'
const DEFAULT_DATE_LABEL_EN = 'Date'
const DEFAULT_QUANTITY_LABEL_DE = 'Anzahl'
const DEFAULT_QUANTITY_LABEL_EN = 'Quantity'
const DEFAULT_DETAILS_LABEL_DE = 'Workshop Details'
const DEFAULT_DETAILS_LABEL_EN = 'Workshop Details'
const DEFAULT_RESERVE_LABEL_DE = 'Platz reservieren'
const DEFAULT_RESERVE_LABEL_EN = 'Reserve Your Spot'
const DEFAULT_TIME_STARTS_DE = 'Startet um 11:00 Uhr'
const DEFAULT_TIME_STARTS_EN = 'Starts at 11:00 AM'
const DEFAULT_GIFT_TITLE_DE = 'Verschenke ein besonderes Geschmackserlebnis'
const DEFAULT_GIFT_TITLE_EN = 'Gift a special tasty experience'
const DEFAULT_GIFT_DESC_DE =
  'Unsere Gutscheine sind das perfekte Geschenk für Feinschmecker, gesundheitsbewusste Freunde und Hobbyköche. Einlösbar für jeden Workshop vor Ort oder online.'
const DEFAULT_GIFT_DESC_EN =
  'Our vouchers are the perfect gift for foodies, health-conscious friends, and hobby chefs. Redeemable for any on-site or online workshop.'
const DEFAULT_GIFT_BUY_NOW_DE = 'Jetzt kaufen'
const DEFAULT_GIFT_BUY_NOW_EN = 'Buy Now'
const DEFAULT_GIFT_BUY_VOUCHER_DE = 'Gutschein kaufen'
const DEFAULT_GIFT_BUY_VOUCHER_EN = 'Buy Voucher'
const DEFAULT_ONLINE_TITLE_DE = 'Fermentation jederzeit und überall lernen'
const DEFAULT_ONLINE_TITLE_EN = 'Learn Fermentation Anytime, Anywhere'
const DEFAULT_ONLINE_DESC_DE =
  'Keine Zeit für Berlin? Unsere digitalen Workshops bringen die Expertise in deine Küche – mit hochwertigen Video-Tutorials und herunterladbaren Anleitungen.'
const DEFAULT_ONLINE_DESC_EN =
  "Can't make it to Berlin? Our digital workshops bring the expertise to your kitchen with high-quality video tutorials and downloadable guides."
const DEFAULT_ONLINE_BUTTON_DE = 'Online-Kurse entdecken'
const DEFAULT_ONLINE_BUTTON_EN = 'Explore Online Courses'
const DEFAULT_FAQ_HEADING_DE = 'Du hast Fragen zu Fermentieren?'
const DEFAULT_FAQ_HEADING_EN = 'Do you have questions about Fermentation?'
const DEFAULT_FAQ_SUBTITLE_DE = 'Klicke, um alle Antworten zu sehen!'
const DEFAULT_FAQ_SUBTITLE_EN = 'Click to view all the answers!'

const DEFAULT_FAQ_ITEMS_DE: Array<{ question: string; answer: string }> = [
  {
    question: 'Wie lange dauert ein Workshop?',
    answer: 'Unsere Workshops dauern in der Regel 2,5 bis 3 Stunden.',
  },
  {
    question: 'Muss ich Vorkenntnisse mitbringen?',
    answer: 'Nein, alle Workshops sind für Einsteiger konzipiert.',
  },
  {
    question: 'Kann ich den Workshop verschenken?',
    answer: 'Ja, wir bieten Gutscheine für alle Workshops an.',
  },
  {
    question: 'Wo finden die Workshops statt?',
    answer: 'In Berlin-Neukölln. Die genaue Adresse erhältst du nach der Buchung.',
  },
  {
    question: 'Was passiert bei Absage?',
    answer: 'Du kannst bis 48 Stunden vorher kostenlos stornieren.',
  },
  {
    question: 'Gibt es Online-Alternativen?',
    answer: 'Ja, wir bieten auch digitale Workshops und Kurse an.',
  },
]

const DEFAULT_FAQ_ITEMS_EN: Array<{ question: string; answer: string }> = [
  {
    question: 'How long does a workshop last?',
    answer: 'Our workshops typically last 2.5 to 3 hours.',
  },
  {
    question: 'Do I need prior experience?',
    answer: 'No, all workshops are designed for beginners.',
  },
  { question: 'Can I gift a workshop?', answer: 'Yes, we offer vouchers for all workshops.' },
  {
    question: 'Where do the workshops take place?',
    answer: "In Berlin-Neukölln. You'll receive the exact address after booking.",
  },
  {
    question: 'What happens if I cancel?',
    answer: 'You can cancel free of charge up to 48 hours before.',
  },
  {
    question: 'Are there online alternatives?',
    answer: 'Yes, we also offer digital workshops and courses.',
  },
]

const DEFAULT_TEAM_EYEBROW_DE = 'Firmenveranstaltungen'
const DEFAULT_TEAM_EYEBROW_EN = 'Corporate Events'
const DEFAULT_TEAM_HEADING_DE = 'Fermentation als Teambuilding'
const DEFAULT_TEAM_HEADING_EN = 'Fermentation as Team Building'
const DEFAULT_TEAM_DESC_DE =
  'Auf der Suche nach einem einzigartigen Team-Erlebnis? Unsere B2B-Workshops fördern die Zusammenarbeit durch den meditativen und bereichernden Prozess des gemeinsamen Fermentierens. Bei uns im Studio oder bei Ihnen im Büro.'
const DEFAULT_TEAM_DESC_EN =
  'Looking for a unique team experience? Our B2B workshops are designed to foster collaboration through the meditative and rewarding process of fermenting together. Available at our studio or your office.'
const DEFAULT_TEAM_BULLETS_DE = [
  'Maßgeschneiderte Workshop-Themen',
  'Catering inklusive',
  'Mitnahme-Gläser für jeden Teilnehmer',
]
const DEFAULT_TEAM_BULLETS_EN = [
  'Customized workshop themes',
  'Catering included',
  'Take-home jars for every participant',
]
const DEFAULT_TEAM_CTA_DE = 'Anfrage senden'
const DEFAULT_TEAM_CTA_EN = 'Request Quote'
const DEFAULT_LEARN_ONLINE_HEADING_DE = 'Lerne Fermentation'
const DEFAULT_LEARN_ONLINE_HEADING_EN = 'Learn Fermentation'
const DEFAULT_LEARN_ONLINE_HEADING_2_DE = 'Jederzeit, überall'
const DEFAULT_LEARN_ONLINE_HEADING_2_EN = 'Anytime, Anywhere'
const DEFAULT_LEARN_ONLINE_DESC_DE =
  'Sofortiger Zugang zu allen Online-Video-Workshops. Kein Warten, keine festen Termine. Starte jetzt und lerne in deinem eigenen Tempo.'
const DEFAULT_LEARN_ONLINE_DESC_EN =
  'Instant access to all online video workshops. No waiting, no scheduled appointments. Start now and learn at your own pace.'
const DEFAULT_LEARN_ONLINE_BTN_DE = 'Online-Kurse entdecken'
const DEFAULT_LEARN_ONLINE_BTN_EN = 'Explore Online Courses'
const DEFAULT_WHY_ONLINE_HEADING_DE = 'Warum unsere Online-Workshops?'
const DEFAULT_WHY_ONLINE_HEADING_EN = 'Why Our Online Workshops?'

const DEFAULT_WHY_ONLINE_FEATURES_DE = [
  {
    icon: 'lightning' as const,
    title: 'Sofortiger Zugang',
    description: 'Direkter Zugang nach dem Kauf – keine Wartezeit',
  },
  {
    icon: 'clock' as const,
    title: 'Dein Tempo',
    description: 'Pausieren, wiederholen, wann immer du möchtest',
  },
  {
    icon: 'home' as const,
    title: 'Von Zuhause',
    description: 'Lerne bequem in deiner eigenen Küche',
  },
  {
    icon: 'book' as const,
    title: 'Rezepte & PDFs',
    description: 'Alle Rezepte zum Download verfügbar',
  },
]

const DEFAULT_WHY_ONLINE_FEATURES_EN = [
  {
    icon: 'lightning' as const,
    title: 'Instant Access',
    description: 'Direct access after purchase – no waiting time',
  },
  { icon: 'clock' as const, title: 'Your Pace', description: 'Pause, repeat, whenever you want' },
  {
    icon: 'home' as const,
    title: 'From Home',
    description: 'Learn comfortably in your own kitchen',
  },
  {
    icon: 'book' as const,
    title: 'Recipes & PDFs',
    description: 'All recipes available for download',
  },
]

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()

  // Special Marktgarten workshop metadata
  if (slug === FELD_INS_GLAS_SLUG) {
    const copy = FELD_INS_GLAS_COPY[locale === 'en' ? 'en' : 'de']
    return {
      title: `${copy.title} | Fermentfreude`,
      description: copy.partnerLine,
    }
  }

  const workshop = await findWorkshopBySlug(slug, locale)

  if (!workshop) return { title: 'Workshop | Fermentfreude' }

  return {
    title: `${workshop.title} | Fermentfreude`,
    description: workshop.description,
  }
}

function isResolvedMedia(img: unknown): img is MediaType {
  return typeof img === 'object' && img !== null && 'url' in img
}

function getSlugFromCtaLink(ctaLink: string | null | undefined): string | null {
  if (!ctaLink) return null
  const match = ctaLink.match(/\/workshops\/([^/]+)/)
  return match ? match[1] : null
}

function normalizeVoucherHref(href: string | null | undefined): string | null | undefined {
  return href === '/voucher' ? '/workshops/voucher' : href
}

export default async function WorkshopDetailPage({ params }: Args) {
  const { slug } = await params
  const locale = await getLocale()
  const { isEnabled: draft } = await draftMode()
  const WORKSHOP_PAGE_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha', 'vom-feld-ins-glas']

  // Fetch workshop appointments from database
  const workshopAppointments = await getWorkshopAppointments(slug)
  // Fetch next-bookable-appointment map so the "Other workshops" slider can
  // render a Sold Out badge + disable the buy button on workshops that have
  // no future appointment with available spots (e.g. Kombucha right now).
  const nextDatesByHref = await getNextWorkshopDatesByHref(locale)
  const soldOutByHref: Record<string, boolean> = Object.fromEntries(
    Object.entries(nextDatesByHref).map(([href, info]) => [href, Boolean(info.soldOut)]),
  )
  const soldOutLabel = locale === 'en' ? 'Sold Out' : 'Ausgebucht'
  const [workshop, allWorkshops, termins, gastronomyResult, workshopPageResult] = await Promise.all(
    [
      findWorkshopBySlug(slug, locale),
      getAllWorkshops(locale),
      getWorkshopTermine(locale),
      getPayload({ config: configPromise }).then((p) =>
        p.find({
          collection: 'pages',
          where: { slug: { equals: 'gastronomy' } },
          limit: 1,
          depth: 20,
          locale,
        }),
      ),
      WORKSHOP_PAGE_SLUGS.includes(slug)
        ? getPayload({ config: configPromise }).then((p) =>
            p.find({
              collection: 'pages',
              draft,
              where: {
                slug: { equals: slug },
                ...(draft ? {} : { _status: { equals: 'published' } }),
              },
              limit: 1,
              depth: 10,
              locale,
              overrideAccess: true,
            }),
          )
        : Promise.resolve({ docs: [] }),
    ],
  )

  const workshopPage = workshopPageResult.docs[0] as PageType | undefined

  const detail = workshopPage?.workshopDetail

  // How-To Articles: per-page `howToArticles` relationship wins when set,
  // otherwise fall back to the latest 6 published posts so editors only
  // need to manage articles in /admin/collections/posts (one place,
  // shared across all workshop pages).
  // We only count *resolved* posts (objects) — stale relationship IDs that
  // no longer point to an existing post are returned by Payload as bare
  // strings and must be ignored, otherwise the page falls into a hardcoded
  // placeholder state with no cover images (see tempeh page).
  const perPageHowToArticlesRaw = Array.isArray(detail?.howToArticles) ? detail!.howToArticles : []
  const perPageHowToArticles = perPageHowToArticlesRaw.filter(
    (item): item is Exclude<typeof item, string> => typeof item === 'object' && item !== null,
  )
  // Per founder request (issue tracker #2): show the same articles on every
  // workshop page (Lakto, Tempeh, Kombucha). The `workshopType` field on
  // posts is kept as metadata for future per-page curation, but is no longer
  // used to filter the fallback list — editors only need to publish a post
  // once and it appears on all three pages automatically.
  // Per-page `workshopDetail.howToArticles` still wins when set, so editors
  // can override the list for a specific workshop later.
  const howToArticles =
    perPageHowToArticles.length > 0 ? perPageHowToArticles : await getLatestPosts(locale, 6)

  // Voucher CTA: use global data when toggled on, otherwise use inline detail fields
  const useGlobalVoucher = detail?.useGlobalVoucherData !== false
  const voucherGlobal = useGlobalVoucher ? await getVoucherCtaGlobal(locale) : null
  const voucherCms =
    voucherGlobal && (voucherGlobal.eyebrow || voucherGlobal.title)
      ? {
          eyebrow: voucherGlobal.eyebrow,
          title: voucherGlobal.title,
          description: voucherGlobal.description,
          primaryLabel: voucherGlobal.primaryLabel,
          primaryHref: voucherGlobal.primaryHref,
          secondaryLabel: voucherGlobal.secondaryLabel,
          secondaryHref: voucherGlobal.secondaryHref,
          pills: voucherGlobal.pills as Array<{ text?: string | null }> | null,
          backgroundImage: voucherGlobal.backgroundImage as MediaType | string | null,
        }
      : detail
        ? {
            eyebrow: detail.voucherEyebrow,
            title: detail.voucherTitle,
            description: detail.voucherDescription,
            primaryLabel: detail.voucherPrimaryLabel,
            primaryHref: detail.voucherPrimaryHref,
            secondaryLabel: detail.voucherSecondaryLabel,
            secondaryHref: detail.voucherSecondaryHref,
            pills: detail.voucherPills,
            backgroundImage: detail.voucherBackgroundImage,
          }
        : undefined

  const gastronomyPage = gastronomyResult.docs[0] as PageType | undefined
  const offerCards = (gastronomyPage?.gastronomy?.gastronomyOfferCards ?? []) as Array<{
    image?: unknown
    title?: string
  }>
  const corporateCard = offerCards.find(
    (c) =>
      c.title?.toLowerCase().includes('corporate') ||
      c.title?.toLowerCase().includes('firmen') ||
      c.title?.toLowerCase().includes('teambuilding'),
  )
  const gastronomyTeamImage =
    corporateCard?.image && isResolvedMedia(corporateCard.image) ? corporateCard.image : null
  const teamBuildingImage = gastronomyTeamImage

  // Get hardcoded workshop data for lakto-gemuese (booking card + details)
  const workshopDetailData = slug === 'lakto-gemuese' ? getWorkshopBySlug(slug) : null

  // Generic-layout section data — these sections are seeded via seed-workshop-pages.ts
  // and stored as top-level page fields (workshopGiftOnline, workshopFaq, etc.).
  // Dedicated layouts (lakto/tempeh/kombucha) have their own section components.
  const gift = undefined as
    | {
        giftTitle?: string | null
        giftDescription?: string | null
        giftBuyNowLabel?: string | null
        giftBuyVoucherLabel?: string | null
        giftBuyNowHref?: string | null
        giftBuyVoucherHref?: string | null
        onlineTitle?: string | null
        onlineDescription?: string | null
        onlineButtonLabel?: string | null
        onlineButtonHref?: string | null
        onlineBullets?: Array<{ text?: string | null }> | null
      }
    | undefined
  const faq = undefined as
    | {
        faqHeading?: string | null
        faqSubtitle?: string | null
        faqItems?: Array<{ question?: string | null; answer?: string | null }> | null
      }
    | undefined
  const team = undefined as
    | {
        teamEyebrow?: string | null
        teamHeading?: string | null
        teamDescription?: string | null
        teamBullets?: Array<{ text?: string | null }> | null
        teamCtaLabel?: string | null
        teamCtaHref?: string | null
        teamImage?: unknown
      }
    | undefined
  const learn = undefined as
    | {
        learnOnlineHeading?: string | null
        learnOnlineDescription?: string | null
        learnOnlineButtonLabel?: string | null
        learnOnlineButtonHref?: string | null
      }
    | undefined
  const why = undefined as
    | {
        whyOnlineHeading?: string | null
        whyOnlineFeatures?: Array<{
          icon?: string | null
          title?: string | null
          description?: string | null
        }> | null
      }
    | undefined

  /* ══════════════════════════════════════════════════════════════
   *  Vom Feld ins Glas — Marktgarten special workshop
   *  Hero → Experience → Booking → Calendar → HowTos → FAQ (special) → Slider → Voucher
   * ══════════════════════════════════════════════════════════════ */
  if (slug === FELD_INS_GLAS_SLUG) {
    const isDe = locale === 'de'
    const copy = FELD_INS_GLAS_COPY[isDe ? 'de' : 'en']
    const workshopData = getFeldInsGlasWorkshop(isDe ? 'de' : 'en')
    const images = await getFeldInsGlasImages()
    const localeKey = isDe ? 'de' : 'en'

    const similarWorkshops = allWorkshops.filter((w) => {
      const s = getSlugFromCtaLink(w.ctaLink)
      return s && s !== slug
    })
    const workshopTypesHeading =
      detail?.sliderHeading ??
      (isDe ? 'Entdecke weitere Workshops.' : 'Discover more workshops.')

    const howToForFeld =
      perPageHowToArticles.length > 0
        ? howToArticles
        : await (async () => {
            const curated = await getPostsBySlugs(localeKey, [...FELD_INS_GLAS_HOWTO_SLUGS])
            return curated.length >= 4 ? curated : howToArticles
          })()

    return (
      <article className="bg-white">
        <FeldInsGlasHero copy={copy} image={images.hero} />
        <FeldInsGlasExperience
          copy={copy}
          locale={isDe ? 'de' : 'en'}
          images={{
            hero: images.hero,
            hands: images.hands,
            jars: images.jars,
            konzept: images.konzept,
            feld: images.feld,
            kueche: images.kueche,
            glas: images.glas,
          }}
        />

        <div id="buchen" className="bg-white">
          <LaktoBookingCard
            className="pt-0 [padding-block-start:0]"
            accentColor="#1A1A1A"
            workshop={workshopData}
            cartOverrides={{
              workshopSlug: FELD_INS_GLAS_SLUG,
              workshopTitle: copy.title,
              pageSlug: FELD_INS_GLAS_SLUG,
              locationName: isDe
                ? 'Marktgarten „Unser Bauerngarten“'
                : 'Marktgarten “Unser Bauerngarten”',
              locationAddress: isDe
                ? 'Hochfeldweg, Graz (nicht Grabenstraße)'
                : 'Hochfeldweg, Graz (not Grabenstraße)',
            }}
            cms={{
              bookingEyebrow:
                detail?.bookingEyebrow ?? (isDe ? 'Fermentations-Workshop' : 'Fermentation Workshop'),
              bookingTitle: detail?.bookingTitle ?? copy.title,
              bookingPrice: detail?.bookingPrice ?? copy.price,
              bookingPriceSuffix: detail?.bookingPriceSuffix ?? copy.priceLabel,
              bookingCurrency: detail?.bookingCurrency ?? copy.currency,
              bookingImage: images.jars ?? images.hands ?? images.hero,
              bookingAttributes:
                detail?.bookingAttributes ?? copy.attributes.map((text) => ({ text })),
              bookingViewDatesLabel: detail?.bookingViewDatesLabel ?? workshopData.viewDatesLabel,
              bookingHideDatesLabel: detail?.bookingHideDatesLabel ?? workshopData.hideDatesLabel,
              bookingMoreDetailsLabel:
                detail?.bookingMoreDetailsLabel ?? workshopData.moreInfoLabel,
              bookingBookLabel: detail?.bookingBookLabel ?? workshopData.bookLabel,
              bookingSpotsLabel: detail?.bookingSpotsLabel ?? workshopData.spotsLabel,
              aboutHeading: detail?.aboutHeading ?? workshopData.aboutHeading,
              aboutText: detail?.aboutText ?? workshopData.aboutText,
              scheduleHeading: detail?.scheduleHeading ?? workshopData.scheduleHeading,
              schedule: detail?.schedule ?? workshopData.schedule,
              includedHeading: detail?.includedHeading ?? workshopData.includedHeading,
              includedItems: detail?.includedItems ?? workshopData.includedItems,
              whyHeading: detail?.whyHeading ?? workshopData.whyHeading,
              whyPoints: detail?.whyPoints ?? workshopData.whyPoints,
              experienceCards: [],
              datesHeading: detail?.datesHeading ?? workshopData.datesHeading,
              dates: workshopAppointments,
              modalConfirmHeading: detail?.modalConfirmHeading ?? workshopData.confirmHeading,
              modalConfirmSubheading:
                detail?.modalConfirmSubheading ?? workshopData.confirmSubheading,
              modalWorkshopLabel: detail?.modalWorkshopLabel ?? workshopData.workshopLabel,
              modalDateLabel: detail?.modalDateLabel ?? workshopData.dateLabel,
              modalTimeLabel: detail?.modalTimeLabel ?? workshopData.timeLabel,
              modalTotalLabel: detail?.modalTotalLabel ?? workshopData.totalLabel,
              modalCancelLabel: detail?.modalCancelLabel ?? workshopData.cancelLabel,
              modalConfirmLabel: detail?.modalConfirmLabel ?? workshopData.confirmLabel,
            }}
          />
        </div>

        <LaktoCalendar
          cms={
            detail
              ? {
                  eyebrow: detail.calendarEyebrow,
                  title: detail.calendarTitle,
                  description: detail.calendarDescription,
                  months: detail.calendarMonths,
                }
              : undefined
          }
        />

        <FeldInsGlasHowTos
          locale={localeKey}
          eyebrow={detail?.howToEyebrow ?? (isDe ? 'Wissen' : 'Knowledge')}
          title={detail?.howToTitle ?? (isDe ? 'Tipps & Guides.' : 'Tips & Guides.')}
          articles={howToForFeld.map((post) => ({
            id: String(post.id),
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            readTime: post.readTime,
            heroImage: post.heroImage,
          }))}
        />

        <FeldInsGlasFAQ
          cms={
            detail
              ? {
                  eyebrow: detail.faqEyebrow,
                  title: detail.faqTitle,
                  description: detail.faqDescription,
                  items: detail.faqItems,
                }
              : undefined
          }
        />

        <FeldInsGlasVoucher
          cms={voucherCms}
          locale={localeKey}
          image={images.feld ?? images.konzept ?? images.jars}
        />

        <FeldInsGlasMoreWorkshops
          workshops={similarWorkshops}
          locale={localeKey}
          heading={workshopTypesHeading}
        />
      </article>
    )
  }

  if (!workshop) return notFound()

  const similarWorkshops = allWorkshops.filter((w) => {
    const s = getSlugFromCtaLink(w.ctaLink)
    return s && s !== slug
  })

  const isDe = locale === 'de'
  const bookLabel = detail?.sliderBuyLabel ?? (isDe ? DEFAULT_BOOK_LABEL : DEFAULT_BOOK_LABEL_EN)
  const learnMoreLabel =
    detail?.sliderMoreInfoLabel ?? (isDe ? DEFAULT_LEARN_MORE_LABEL : DEFAULT_LEARN_MORE_LABEL_EN)
  const workshopTypesHeading =
    detail?.sliderHeading ?? (isDe ? DEFAULT_WORKSHOP_TYPES_DE : DEFAULT_WORKSHOP_TYPES_EN)
  const workshopTypesSub =
    detail?.sliderSubtitle ?? (isDe ? DEFAULT_WORKSHOP_TYPES_SUB_DE : DEFAULT_WORKSHOP_TYPES_SUB_EN)
  const workshopTypePill =
    detail?.sliderPillLabel ??
    (isDe ? DEFAULT_WORKSHOP_TYPE_PILL_DE : DEFAULT_WORKSHOP_TYPE_PILL_EN)
  const alleTermineHeading = isDe ? DEFAULT_ALLE_TERMINE_DE : DEFAULT_ALLE_TERMINE_EN
  const alleTermineSub = isDe ? DEFAULT_ALLE_TERMINE_SUB_DE : DEFAULT_ALLE_TERMINE_SUB_EN
  const slotsFreeLabel = isDe ? DEFAULT_SLOTS_FREE_DE : DEFAULT_SLOTS_FREE_EN
  const filterAllLabel = isDe ? DEFAULT_FILTER_ALL_DE : DEFAULT_FILTER_ALL_EN
  const dateLabel = isDe ? DEFAULT_DATE_LABEL_DE : DEFAULT_DATE_LABEL_EN
  const quantityLabel = isDe ? DEFAULT_QUANTITY_LABEL_DE : DEFAULT_QUANTITY_LABEL_EN
  const detailsLabel = isDe ? DEFAULT_DETAILS_LABEL_DE : DEFAULT_DETAILS_LABEL_EN
  const reserveLabel = isDe ? DEFAULT_RESERVE_LABEL_DE : DEFAULT_RESERVE_LABEL_EN
  const timeStartsLabel = isDe ? DEFAULT_TIME_STARTS_DE : DEFAULT_TIME_STARTS_EN
  const giftTitle = gift?.giftTitle ?? (isDe ? DEFAULT_GIFT_TITLE_DE : DEFAULT_GIFT_TITLE_EN)
  const giftDesc = gift?.giftDescription ?? (isDe ? DEFAULT_GIFT_DESC_DE : DEFAULT_GIFT_DESC_EN)
  const giftBuyNowLabel =
    gift?.giftBuyNowLabel ?? (isDe ? DEFAULT_GIFT_BUY_NOW_DE : DEFAULT_GIFT_BUY_NOW_EN)
  const giftBuyVoucherLabel =
    gift?.giftBuyVoucherLabel ?? (isDe ? DEFAULT_GIFT_BUY_VOUCHER_DE : DEFAULT_GIFT_BUY_VOUCHER_EN)
  const giftBuyNowHref = normalizeVoucherHref(gift?.giftBuyNowHref) ?? '/shop'
  const giftBuyVoucherHref = normalizeVoucherHref(gift?.giftBuyVoucherHref) ?? '/workshops/voucher'
  const onlineTitle =
    gift?.onlineTitle ?? (isDe ? DEFAULT_ONLINE_TITLE_DE : DEFAULT_ONLINE_TITLE_EN)
  const onlineDesc =
    gift?.onlineDescription ?? (isDe ? DEFAULT_ONLINE_DESC_DE : DEFAULT_ONLINE_DESC_EN)
  const onlineButtonLabel =
    gift?.onlineButtonLabel ?? (isDe ? DEFAULT_ONLINE_BUTTON_DE : DEFAULT_ONLINE_BUTTON_EN)
  const onlineButtonHref = gift?.onlineButtonHref ?? '/workshops'

  const onlineBullets =
    (gift?.onlineBullets?.length ?? 0) > 0
      ? gift!.onlineBullets!.map((b) => b.text ?? '').filter(Boolean)
      : isDe
        ? [
            'Lebenslanger Zugang zu allen Inhalten',
            'Herunterladbare Rezeptbücher',
            'Direkte Unterstützung im Schülerforum',
          ]
        : [
            'Lifetime access to all content',
            'Downloadable recipe books',
            'Direct support in the student forum',
          ]

  const faqHeading = faq?.faqHeading ?? (isDe ? DEFAULT_FAQ_HEADING_DE : DEFAULT_FAQ_HEADING_EN)
  const faqSubtitle = faq?.faqSubtitle ?? (isDe ? DEFAULT_FAQ_SUBTITLE_DE : DEFAULT_FAQ_SUBTITLE_EN)
  const faqItems =
    (faq?.faqItems?.length ?? 0) > 0
      ? faq!.faqItems!.map((f) => ({ question: f.question ?? '', answer: f.answer ?? '' }))
      : isDe
        ? DEFAULT_FAQ_ITEMS_DE
        : DEFAULT_FAQ_ITEMS_EN

  const teamEyebrow =
    team?.teamEyebrow ?? (isDe ? DEFAULT_TEAM_EYEBROW_DE : DEFAULT_TEAM_EYEBROW_EN)
  const teamHeading =
    team?.teamHeading ?? (isDe ? DEFAULT_TEAM_HEADING_DE : DEFAULT_TEAM_HEADING_EN)
  const teamDesc = team?.teamDescription ?? (isDe ? DEFAULT_TEAM_DESC_DE : DEFAULT_TEAM_DESC_EN)
  const teamBullets =
    (team?.teamBullets?.length ?? 0) > 0
      ? team!.teamBullets!.map((b) => b.text ?? '').filter(Boolean)
      : isDe
        ? DEFAULT_TEAM_BULLETS_DE
        : DEFAULT_TEAM_BULLETS_EN
  const teamCtaLabel = team?.teamCtaLabel ?? (isDe ? DEFAULT_TEAM_CTA_DE : DEFAULT_TEAM_CTA_EN)
  const teamCtaHref = team?.teamCtaHref ?? '/contact'

  const learnOnlineHeading =
    learn?.learnOnlineHeading ??
    (isDe
      ? `${DEFAULT_LEARN_ONLINE_HEADING_DE}\n${DEFAULT_LEARN_ONLINE_HEADING_2_DE}`
      : `${DEFAULT_LEARN_ONLINE_HEADING_EN}\n${DEFAULT_LEARN_ONLINE_HEADING_2_EN}`)
  const learnOnlineDesc =
    learn?.learnOnlineDescription ??
    (isDe ? DEFAULT_LEARN_ONLINE_DESC_DE : DEFAULT_LEARN_ONLINE_DESC_EN)
  const learnOnlineBtnLabel =
    learn?.learnOnlineButtonLabel ??
    (isDe ? DEFAULT_LEARN_ONLINE_BTN_DE : DEFAULT_LEARN_ONLINE_BTN_EN)
  const learnOnlineButtonHref = learn?.learnOnlineButtonHref ?? '/workshops'

  const whyOnlineHeading =
    why?.whyOnlineHeading ?? (isDe ? DEFAULT_WHY_ONLINE_HEADING_DE : DEFAULT_WHY_ONLINE_HEADING_EN)
  const whyOnlineFeatures =
    (why?.whyOnlineFeatures?.length ?? 0) >= 4
      ? why!.whyOnlineFeatures!.map((f) => ({
          icon: (f.icon ?? 'lightning') as 'lightning' | 'clock' | 'home' | 'book',
          title: f.title ?? '',
          description: f.description ?? '',
        }))
      : isDe
        ? DEFAULT_WHY_ONLINE_FEATURES_DE
        : DEFAULT_WHY_ONLINE_FEATURES_EN

  const workshopTypesSlides: WorkshopItem[] = [workshop, ...similarWorkshops]

  const workshopTermins = termins.filter((t) => t.workshopSlug === slug)
  const bookingDateOptions =
    workshopTermins.length > 0
      ? workshopTermins.map((t) => ({ id: t.id, label: `${t.date} · ${t.timeStart}–${t.timeEnd}` }))
      : [{ id: 'placeholder', label: isDe ? 'Termine folgen' : 'Dates to follow' }]

  const galleryImages = [
    workshop.image2,
    workshop.image3,
    workshop.image4,
    workshop.image5,
    workshop.image6,
    workshop.image7,
    workshop.image8,
    workshop.image9,
  ].filter((img) => isResolvedMedia(img)) as MediaType[]

  /* ══════════════════════════════════════════════════════════════
   *  LAKTO-GEMÜSE — Dedicated standalone layout
   *  Hero → Booking → Calendar → HowTos → Workshop Slider → Voucher → FAQ
   * ══════════════════════════════════════════════════════════════ */
  if (slug === 'lakto-gemuese') {
    return (
      <article>
        {/* 1. Dedicated Lakto Hero */}
        <LaktoHero
          cms={
            detail
              ? {
                  eyebrow: detail.heroEyebrow,
                  title: detail.heroTitle,
                  description: detail.heroDescription,
                  attributes: detail.heroAttributes,
                  image: detail.heroImage,
                }
              : undefined
          }
        />

        {/* 2. Modern Booking Card */}
        <LaktoBookingCard
          workshop={workshopDetailData!}
          cms={{
            ...(detail
              ? {
                  bookingEyebrow: detail.bookingEyebrow,
                  bookingTitle: detail.bookingTitle,
                  bookingPrice: detail.bookingPrice,
                  bookingPriceSuffix: detail.bookingPriceSuffix,
                  bookingCurrency: detail.bookingCurrency,
                  bookingImage: detail.bookingImage,
                  bookingAttributes: detail.bookingAttributes,
                  bookingViewDatesLabel: detail.bookingViewDatesLabel,
                  bookingHideDatesLabel: detail.bookingHideDatesLabel,
                  bookingMoreDetailsLabel: detail.bookingMoreDetailsLabel,
                  bookingBookLabel: detail.bookingBookLabel,
                  bookingSpotsLabel: detail.bookingSpotsLabel,
                  aboutHeading: detail.aboutHeading,
                  aboutText: detail.aboutText,
                  scheduleHeading: detail.scheduleHeading,
                  schedule: detail.schedule,
                  includedHeading: detail.includedHeading,
                  includedItems: detail.includedItems,
                  whyHeading: detail.whyHeading,
                  whyPoints: detail.whyPoints,
                  experienceEyebrow: detail.experienceEyebrow,
                  experienceTitle: detail.experienceTitle,
                  experienceCards: detail.experienceCards,
                  datesHeading: detail.datesHeading,
                  modalConfirmHeading: detail.modalConfirmHeading,
                  modalConfirmSubheading: detail.modalConfirmSubheading,
                  modalWorkshopLabel: detail.modalWorkshopLabel,
                  modalDateLabel: detail.modalDateLabel,
                  modalTimeLabel: detail.modalTimeLabel,
                  modalTotalLabel: detail.modalTotalLabel,
                  modalCancelLabel: detail.modalCancelLabel,
                  modalConfirmLabel: detail.modalConfirmLabel,
                }
              : {}),
            dates: workshopAppointments,
          }}
        />

        {/* 3. Seasonal Fermentation Calendar */}
        <LaktoCalendar
          cms={
            detail
              ? {
                  eyebrow: detail.calendarEyebrow,
                  title: detail.calendarTitle,
                  description: detail.calendarDescription,
                  months: detail.calendarMonths,
                }
              : undefined
          }
        />

        {/* 4. Fermented Vegetables How-Tos */}
        <FermentedVegHowTos
          workshopType="lakto"
          cms={{
            eyebrow: detail?.howToEyebrow,
            title: detail?.howToTitle,
            description: detail?.howToDescription,
            howToArticles,
          }}
        />

        {/* 5. Booking FAQ */}
        <LaktoFAQ
          cms={
            detail
              ? {
                  eyebrow: detail.faqEyebrow,
                  title: detail.faqTitle,
                  description: detail.faqDescription,
                  items: detail.faqItems,
                }
              : undefined
          }
        />

        {/* 6. Other Workshops (slider — excludes lakto-gemuese) */}
        <WorkshopTypesSlider
          workshops={similarWorkshops}
          heading={workshopTypesHeading}
          subtitle={workshopTypesSub}
          pillLabel={workshopTypePill}
          buyLabel={bookLabel}
          moreInfoLabel={learnMoreLabel}
          soldOutByHref={soldOutByHref}
          soldOutLabel={soldOutLabel}
        />

        {/* 7. Voucher CTA */}
        <LaktoVoucherCta cms={voucherCms} />
      </article>
    )
  }

  /* ══════════════════════════════════════════════════════════════
   *  TEMPEH — Dedicated standalone layout
   *  Hero → Booking → Voucher → FAQ
   * ══════════════════════════════════════════════════════════════ */
  if (slug === 'tempeh') {
    return (
      <article>
        {/* 1. Dedicated Tempeh Hero */}
        <TempehHero
          cms={
            detail
              ? {
                  eyebrow: detail.heroEyebrow,
                  title: detail.heroTitle,
                  description: detail.heroDescription,
                  attributes: detail.heroAttributes,
                  image: detail.heroImage,
                }
              : undefined
          }
        />

        {/* 2. Modern Booking Card */}
        <TempehBookingCard
          workshop={tempehDefaults}
          cms={{
            ...(detail
              ? {
                  bookingEyebrow: detail.bookingEyebrow,
                  bookingTitle: detail.bookingTitle,
                  bookingPrice: detail.bookingPrice,
                  bookingPriceSuffix: detail.bookingPriceSuffix,
                  bookingCurrency: detail.bookingCurrency,
                  bookingImage: detail.bookingImage,
                  bookingAttributes: detail.bookingAttributes,
                  bookingViewDatesLabel: detail.bookingViewDatesLabel,
                  bookingHideDatesLabel: detail.bookingHideDatesLabel,
                  bookingMoreDetailsLabel: detail.bookingMoreDetailsLabel,
                  bookingBookLabel: detail.bookingBookLabel,
                  bookingSpotsLabel: detail.bookingSpotsLabel,
                  aboutHeading: detail.aboutHeading,
                  aboutText: detail.aboutText,
                  scheduleHeading: detail.scheduleHeading,
                  schedule: detail.schedule,
                  includedHeading: detail.includedHeading,
                  includedItems: detail.includedItems,
                  whyHeading: detail.whyHeading,
                  whyPoints: detail.whyPoints,
                  experienceEyebrow: detail.experienceEyebrow,
                  experienceTitle: detail.experienceTitle,
                  experienceCards: detail.experienceCards,
                  datesHeading: detail.datesHeading,
                  modalConfirmHeading: detail.modalConfirmHeading,
                  modalConfirmSubheading: detail.modalConfirmSubheading,
                  modalWorkshopLabel: detail.modalWorkshopLabel,
                  modalDateLabel: detail.modalDateLabel,
                  modalTimeLabel: detail.modalTimeLabel,
                  modalTotalLabel: detail.modalTotalLabel,
                  modalCancelLabel: detail.modalCancelLabel,
                  modalConfirmLabel: detail.modalConfirmLabel,
                }
              : {}),
            dates: workshopAppointments,
          }}
        />

        {/* 3. Other Workshops (slider — excludes tempeh) */}
        <WorkshopTypesSlider
          workshops={similarWorkshops}
          heading={workshopTypesHeading}
          subtitle={workshopTypesSub}
          pillLabel={workshopTypePill}
          buyLabel={bookLabel}
          moreInfoLabel={learnMoreLabel}
          soldOutByHref={soldOutByHref}
          soldOutLabel={soldOutLabel}
        />

        {/* 4. Voucher CTA */}
        <TempehVoucherCta cms={voucherCms} />

        {/* 5. How-To Articles */}
        <FermentedVegHowTos
          workshopType="tempeh"
          cms={{
            eyebrow: detail?.howToEyebrow,
            title: detail?.howToTitle,
            description: detail?.howToDescription,
            howToArticles,
          }}
        />

        {/* 6. FAQ */}
        <TempehFAQ
          cms={
            detail
              ? {
                  eyebrow: detail.faqEyebrow,
                  title: detail.faqTitle,
                  description: detail.faqDescription,
                  items: detail.faqItems,
                }
              : undefined
          }
        />
      </article>
    )
  }

  /* ══════════════════════════════════════════════════════════════
   *  KOMBUCHA — Dedicated standalone layout
   *  Hero → Booking → Voucher → FAQ (same as Tempeh, no calendar)
   * ══════════════════════════════════════════════════════════════ */
  if (slug === 'kombucha') {
    return (
      <article>
        {/* 1. Dedicated Kombucha Hero */}
        <KombuchaHero
          cms={
            detail
              ? {
                  eyebrow: detail.heroEyebrow,
                  title: detail.heroTitle,
                  description: detail.heroDescription,
                  attributes: detail.heroAttributes,
                  image: detail.heroImage,
                }
              : undefined
          }
        />

        {/* 2. Modern Booking Card */}
        <KombuchaBookingCard
          _workshop={undefined}
          cms={{
            ...(detail
              ? {
                  bookingEyebrow: detail.bookingEyebrow,
                  bookingTitle: detail.bookingTitle,
                  bookingPrice: detail.bookingPrice,
                  bookingPriceSuffix: detail.bookingPriceSuffix,
                  bookingCurrency: detail.bookingCurrency,
                  bookingImage: detail.bookingImage,
                  bookingAttributes: detail.bookingAttributes,
                  bookingViewDatesLabel: detail.bookingViewDatesLabel,
                  bookingHideDatesLabel: detail.bookingHideDatesLabel,
                  bookingMoreDetailsLabel: detail.bookingMoreDetailsLabel,
                  bookingBookLabel: detail.bookingBookLabel,
                  bookingSpotsLabel: detail.bookingSpotsLabel,
                  aboutHeading: detail.aboutHeading,
                  aboutText: detail.aboutText,
                  scheduleHeading: detail.scheduleHeading,
                  schedule: detail.schedule,
                  includedHeading: detail.includedHeading,
                  includedItems: detail.includedItems,
                  whyHeading: detail.whyHeading,
                  whyPoints: detail.whyPoints,
                  experienceEyebrow: detail.experienceEyebrow,
                  experienceTitle: detail.experienceTitle,
                  experienceCards: detail.experienceCards,
                  datesHeading: detail.datesHeading,
                  modalConfirmHeading: detail.modalConfirmHeading,
                  modalConfirmSubheading: detail.modalConfirmSubheading,
                  modalWorkshopLabel: detail.modalWorkshopLabel,
                  modalDateLabel: detail.modalDateLabel,
                  modalTimeLabel: detail.modalTimeLabel,
                  modalTotalLabel: detail.modalTotalLabel,
                  modalCancelLabel: detail.modalCancelLabel,
                  modalConfirmLabel: detail.modalConfirmLabel,
                }
              : {}),
            dates: workshopAppointments,
          }}
        />

        {/* 3. Other Workshops (slider — excludes kombucha) */}
        <WorkshopTypesSlider
          workshops={similarWorkshops}
          heading={workshopTypesHeading}
          subtitle={workshopTypesSub}
          pillLabel={workshopTypePill}
          buyLabel={bookLabel}
          moreInfoLabel={learnMoreLabel}
          soldOutByHref={soldOutByHref}
          soldOutLabel={soldOutLabel}
        />

        {/* 4. Voucher CTA */}
        <KombuchaVoucherCta cms={voucherCms} />

        {/* 5. How-To Articles */}
        <FermentedVegHowTos
          workshopType="kombucha"
          cms={{
            eyebrow: detail?.howToEyebrow,
            title: detail?.howToTitle,
            description: detail?.howToDescription,
            howToArticles,
          }}
        />

        {/* 6. FAQ */}
        <KombuchaFAQ
          cms={
            detail
              ? {
                  faqEyebrow: detail.faqEyebrow,
                  faqTitle: detail.faqTitle,
                  faqDescription: detail.faqDescription,
                  faqItems: detail.faqItems,
                  faqContactEmail: detail.faqContactEmail,
                }
              : undefined
          }
        />
      </article>
    )
  }

  return (
    <article className="pb-24">
      {/* ── 1. Hero ───────────────────────────────────────────────── */}
      <section className="relative aspect-video w-full overflow-hidden lg:aspect-21/9 lg:min-h-112">
        {isResolvedMedia(workshop.image) ? (
          <Media resource={workshop.image} fill imgClassName="object-cover" priority />
        ) : (
          <div className="flex size-full items-center justify-center bg-[#ECE5DE]" />
        )}
      </section>

      {/* ── 2. Workshop Types (slider) ───────────────────────────────── */}
      <WorkshopTypesSlider
        workshops={workshopTypesSlides}
        heading={workshopTypesHeading}
        subtitle={workshopTypesSub}
        pillLabel={workshopTypePill}
        buyLabel={bookLabel}
        moreInfoLabel={learnMoreLabel}
        soldOutByHref={soldOutByHref}
        soldOutLabel={soldOutLabel}
      />

      {/* ── 3. Booking & Details ─────────────────────────────────── */}
      {/* Alle Termine (appointments list) */}
      <WorkshopTermineSection
        termins={termins}
        heading={alleTermineHeading}
        subtitle={alleTermineSub}
        bookLabel={bookLabel}
        slotsFreeLabel={slotsFreeLabel}
        filterAllLabel={filterAllLabel}
      />

      {/* Workshop Booking (image + booking panel, white bg) */}
      <WorkshopBookingSection
        mainImage={workshop.image}
        galleryImages={galleryImages}
        title={workshop.title}
        description={workshop.description}
        price={workshop.price ?? null}
        location={workshop.location ?? null}
        timeLabel={timeStartsLabel}
        duration={workshop.duration ?? null}
        slug={slug}
        dateLabel={dateLabel}
        quantityLabel={quantityLabel}
        detailsLabel={detailsLabel}
        reserveLabel={reserveLabel}
        dateOptions={bookingDateOptions}
      />

      {/* ── 5. Learn Fermentation Anytime, Anywhere (dark card) ─────── */}
      <LearnOnlineSection
        heading={learnOnlineHeading}
        description={learnOnlineDesc}
        buttonLabel={learnOnlineBtnLabel}
        buttonHref={learnOnlineButtonHref}
      />

      {/* ── 6. Gift & Online (two cards on dark bg) ─────────────────── */}
      <GiftAndOnlineSection
        giftTitle={giftTitle}
        giftDescription={giftDesc}
        giftBuyNowLabel={giftBuyNowLabel}
        giftBuyVoucherLabel={giftBuyVoucherLabel}
        giftBuyNowHref={giftBuyNowHref}
        giftBuyVoucherHref={giftBuyVoucherHref}
        onlineTitle={onlineTitle}
        onlineDescription={onlineDesc}
        onlineBullets={onlineBullets}
        onlineButtonLabel={onlineButtonLabel}
        onlineButtonHref={onlineButtonHref}
      />

      {/* ── 7. FAQ Slider ─────────────────────────────────────────── */}
      <FAQSliderSection heading={faqHeading} subtitle={faqSubtitle} faqs={faqItems} />

      {/* ── 8. Team Building / Corporate Events ───────────────────── */}
      <TeamBuildingSection
        eyebrow={teamEyebrow}
        heading={teamHeading}
        description={teamDesc}
        bullets={teamBullets}
        ctaLabel={teamCtaLabel}
        ctaHref={teamCtaHref}
        image={teamBuildingImage}
      />

      {/* ── 9. Why Our Online Workshops (last section, bg white) ───── */}
      <WhyOnlineSection heading={whyOnlineHeading} features={whyOnlineFeatures} />
    </article>
  )
}
