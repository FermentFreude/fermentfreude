import type { Media as MediaType, Page as PageType } from '@/payload-types'
import type { Metadata } from 'next'

import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

import { FAQSliderSection } from '@/components/workshops/FAQSliderSection'
import { LearnOnlineSection } from '@/components/workshops/LearnOnlineSection'
import { GiftAndOnlineSection } from '@/components/workshops/GiftAndOnlineSection'
import { TeamBuildingSection } from '@/components/workshops/TeamBuildingSection'
import { WhyOnlineSection } from '@/components/workshops/WhyOnlineSection'
import { WorkshopBookingSection } from '@/components/workshops/WorkshopBookingSection'
import { WorkshopTermineSection } from '@/components/workshops/WorkshopTermineSection'
import { WorkshopTypesSlider } from '@/components/workshops/WorkshopTypesSlider'
import type { WorkshopItem } from '@/utilities/getWorkshops'
import { findWorkshopBySlug, getAllWorkshops } from '@/utilities/getWorkshops'
import { getWorkshopTermine } from '@/utilities/getWorkshopTermine'

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
  { question: 'Wie lange dauert ein Workshop?', answer: 'Unsere Workshops dauern in der Regel 2,5 bis 3 Stunden.' },
  { question: 'Muss ich Vorkenntnisse mitbringen?', answer: 'Nein, alle Workshops sind für Einsteiger konzipiert.' },
  { question: 'Kann ich den Workshop verschenken?', answer: 'Ja, wir bieten Gutscheine für alle Workshops an.' },
  { question: 'Wo finden die Workshops statt?', answer: 'In Berlin-Neukölln. Die genaue Adresse erhältst du nach der Buchung.' },
  { question: 'Was passiert bei Absage?', answer: 'Du kannst bis 48 Stunden vorher kostenlos stornieren.' },
  { question: 'Gibt es Online-Alternativen?', answer: 'Ja, wir bieten auch digitale Workshops und Kurse an.' },
]

const DEFAULT_FAQ_ITEMS_EN: Array<{ question: string; answer: string }> = [
  { question: 'How long does a workshop last?', answer: 'Our workshops typically last 2.5 to 3 hours.' },
  { question: 'Do I need prior experience?', answer: 'No, all workshops are designed for beginners.' },
  { question: 'Can I gift a workshop?', answer: 'Yes, we offer vouchers for all workshops.' },
  { question: 'Where do the workshops take place?', answer: 'In Berlin-Neukölln. You\'ll receive the exact address after booking.' },
  { question: 'What happens if I cancel?', answer: 'You can cancel free of charge up to 48 hours before.' },
  { question: 'Are there online alternatives?', answer: 'Yes, we also offer digital workshops and courses.' },
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
  { icon: 'lightning' as const, title: 'Sofortiger Zugang', description: 'Direkter Zugang nach dem Kauf – keine Wartezeit' },
  { icon: 'clock' as const, title: 'Dein Tempo', description: 'Pausieren, wiederholen, wann immer du möchtest' },
  { icon: 'home' as const, title: 'Von Zuhause', description: 'Lerne bequem in deiner eigenen Küche' },
  { icon: 'book' as const, title: 'Rezepte & PDFs', description: 'Alle Rezepte zum Download verfügbar' },
]

const DEFAULT_WHY_ONLINE_FEATURES_EN = [
  { icon: 'lightning' as const, title: 'Instant Access', description: 'Direct access after purchase – no waiting time' },
  { icon: 'clock' as const, title: 'Your Pace', description: 'Pause, repeat, whenever you want' },
  { icon: 'home' as const, title: 'From Home', description: 'Learn comfortably in your own kitchen' },
  { icon: 'book' as const, title: 'Recipes & PDFs', description: 'All recipes available for download' },
]

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
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

export default async function WorkshopDetailPage({ params }: Args) {
  const { slug } = await params
  const locale = await getLocale()
  const WORKSHOP_PAGE_SLUGS = ['tempeh', 'lakto-gemuese', 'kombucha']
  const [workshop, allWorkshops, termins, gastronomyResult, workshopPageResult] = await Promise.all([
    findWorkshopBySlug(slug, locale),
    getAllWorkshops(locale),
    getWorkshopTermine(locale),
    getPayload({ config: configPromise }).then((p) =>
      p.find({ collection: 'pages', where: { slug: { equals: 'gastronomy' } }, limit: 1, depth: 3, locale }),
    ),
    WORKSHOP_PAGE_SLUGS.includes(slug)
      ? getPayload({ config: configPromise }).then((p) =>
          p.find({
            collection: 'pages',
            where: { slug: { equals: slug }, _status: { equals: 'published' } },
            limit: 1,
            depth: 2,
            locale,
          }),
        )
      : Promise.resolve({ docs: [] }),
  ])

  const workshopPage = workshopPageResult.docs[0] as {
    workshopGiftOnline?: {
      giftTitle?: string
      giftDescription?: string
      giftBuyNowLabel?: string
      giftBuyVoucherLabel?: string
      giftBuyNowHref?: string
      giftBuyVoucherHref?: string
      onlineTitle?: string
      onlineDescription?: string
      onlineBullets?: Array<{ text?: string }>
      onlineButtonLabel?: string
      onlineButtonHref?: string
    }
    workshopLearnOnline?: {
      learnOnlineHeading?: string
      learnOnlineDescription?: string
      learnOnlineButtonLabel?: string
      learnOnlineButtonHref?: string
    }
    workshopFaq?: {
      faqHeading?: string
      faqSubtitle?: string
      faqItems?: Array<{ question?: string; answer?: string }>
    }
    workshopWhyOnline?: {
      whyOnlineHeading?: string
      whyOnlineFeatures?: Array<{ icon?: string; title?: string; description?: string }>
    }
    workshopTeamBuilding?: {
      teamEyebrow?: string
      teamHeading?: string
      teamDescription?: string
      teamBullets?: Array<{ text?: string }>
      teamCtaLabel?: string
      teamCtaHref?: string
      teamImage?: unknown
    }
  } | undefined

  const gift = workshopPage?.workshopGiftOnline
  const learn = workshopPage?.workshopLearnOnline
  const faq = workshopPage?.workshopFaq
  const why = workshopPage?.workshopWhyOnline
  const team = workshopPage?.workshopTeamBuilding

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
  const teamBuildingImage =
    team?.teamImage && isResolvedMedia(team.teamImage) ? team.teamImage : gastronomyTeamImage

  if (!workshop) return notFound()

  const similarWorkshops = allWorkshops.filter((w) => {
    const s = getSlugFromCtaLink(w.ctaLink)
    return s && s !== slug
  })

  const isDe = locale === 'de'
  const bookLabel = isDe ? DEFAULT_BOOK_LABEL : DEFAULT_BOOK_LABEL_EN
  const learnMoreLabel = isDe ? DEFAULT_LEARN_MORE_LABEL : DEFAULT_LEARN_MORE_LABEL_EN
  const workshopTypesHeading = isDe ? DEFAULT_WORKSHOP_TYPES_DE : DEFAULT_WORKSHOP_TYPES_EN
  const workshopTypesSub = isDe ? DEFAULT_WORKSHOP_TYPES_SUB_DE : DEFAULT_WORKSHOP_TYPES_SUB_EN
  const workshopTypePill = isDe ? DEFAULT_WORKSHOP_TYPE_PILL_DE : DEFAULT_WORKSHOP_TYPE_PILL_EN
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
  const giftBuyNowLabel = gift?.giftBuyNowLabel ?? (isDe ? DEFAULT_GIFT_BUY_NOW_DE : DEFAULT_GIFT_BUY_NOW_EN)
  const giftBuyVoucherLabel =
    gift?.giftBuyVoucherLabel ?? (isDe ? DEFAULT_GIFT_BUY_VOUCHER_DE : DEFAULT_GIFT_BUY_VOUCHER_EN)
  const giftBuyNowHref = gift?.giftBuyNowHref ?? '/shop'
  const giftBuyVoucherHref = gift?.giftBuyVoucherHref ?? '/workshops/voucher'
  const onlineTitle = gift?.onlineTitle ?? (isDe ? DEFAULT_ONLINE_TITLE_DE : DEFAULT_ONLINE_TITLE_EN)
  const onlineDesc = gift?.onlineDescription ?? (isDe ? DEFAULT_ONLINE_DESC_DE : DEFAULT_ONLINE_DESC_EN)
  const onlineButtonLabel =
    gift?.onlineButtonLabel ?? (isDe ? DEFAULT_ONLINE_BUTTON_DE : DEFAULT_ONLINE_BUTTON_EN)
  const onlineButtonHref = gift?.onlineButtonHref ?? '/workshops'

  const onlineBullets =
    (gift?.onlineBullets?.length ?? 0) > 0
      ? gift!.onlineBullets!.map((b) => b.text ?? '').filter(Boolean)
      : isDe
        ? ['Lebenslanger Zugang zu allen Inhalten', 'Herunterladbare Rezeptbücher', 'Direkte Unterstützung im Schülerforum']
        : ['Lifetime access to all content', 'Downloadable recipe books', 'Direct support in the student forum']

  const faqHeading = faq?.faqHeading ?? (isDe ? DEFAULT_FAQ_HEADING_DE : DEFAULT_FAQ_HEADING_EN)
  const faqSubtitle = faq?.faqSubtitle ?? (isDe ? DEFAULT_FAQ_SUBTITLE_DE : DEFAULT_FAQ_SUBTITLE_EN)
  const faqItems =
    (faq?.faqItems?.length ?? 0) > 0
      ? faq!.faqItems!.map((f) => ({ question: f.question ?? '', answer: f.answer ?? '' }))
      : isDe
        ? DEFAULT_FAQ_ITEMS_DE
        : DEFAULT_FAQ_ITEMS_EN

  const teamEyebrow = team?.teamEyebrow ?? (isDe ? DEFAULT_TEAM_EYEBROW_DE : DEFAULT_TEAM_EYEBROW_EN)
  const teamHeading = team?.teamHeading ?? (isDe ? DEFAULT_TEAM_HEADING_DE : DEFAULT_TEAM_HEADING_EN)
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
    (isDe ? `${DEFAULT_LEARN_ONLINE_HEADING_DE}\n${DEFAULT_LEARN_ONLINE_HEADING_2_DE}` : `${DEFAULT_LEARN_ONLINE_HEADING_EN}\n${DEFAULT_LEARN_ONLINE_HEADING_2_EN}`)
  const learnOnlineDesc = learn?.learnOnlineDescription ?? (isDe ? DEFAULT_LEARN_ONLINE_DESC_DE : DEFAULT_LEARN_ONLINE_DESC_EN)
  const learnOnlineBtnLabel =
    learn?.learnOnlineButtonLabel ?? (isDe ? DEFAULT_LEARN_ONLINE_BTN_DE : DEFAULT_LEARN_ONLINE_BTN_EN)
  const learnOnlineButtonHref = learn?.learnOnlineButtonHref ?? '/workshops'

  const whyOnlineHeading = why?.whyOnlineHeading ?? (isDe ? DEFAULT_WHY_ONLINE_HEADING_DE : DEFAULT_WHY_ONLINE_HEADING_EN)
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

  return (
    <article className="pb-24">
      {/* ── 1. Hero ───────────────────────────────────────────────── */}
      <section className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-[21/9] lg:min-h-[28rem]">
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
      />

      {/* ── 3. Alle Termine (appointments list) ─────────────────────── */}
      <WorkshopTermineSection
        termins={termins}
        heading={alleTermineHeading}
        subtitle={alleTermineSub}
        bookLabel={bookLabel}
        slotsFreeLabel={slotsFreeLabel}
        filterAllLabel={filterAllLabel}
      />

      {/* ── 4. Workshop Booking (image + booking panel, white bg) ───── */}
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
