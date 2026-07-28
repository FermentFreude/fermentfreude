import type { Media as MediaType } from '@/payload-types'

import type { PostCard } from '@/components/fermentation/FermentedVegHowTos'
import { FermentedVegHowTos } from '@/components/fermentation/FermentedVegHowTos'
import { WorkshopTypesSlider } from '@/components/workshops/WorkshopTypesSlider'
import type { WorkshopItem } from '@/utilities/getWorkshops'
import type { FlattenedWorkshopDetail } from '@/utilities/workshopPageUtils'
import { serializeForClient } from '@/utilities/serializeForClient'

import { KombuchaBookingCard } from './KombuchaBookingCard'
import { KombuchaFAQ } from './KombuchaFAQ'
import { KombuchaHero } from './KombuchaHero'
import { KombuchaVoucherCta } from './KombuchaVoucherCta'
import { LaktoBookingCard } from './LaktoBookingCard'
import { LaktoCalendar } from './LaktoCalendar'
import { LaktoFAQ } from './LaktoFAQ'
import { LaktoHero } from './LaktoHero'
import { LaktoVoucherCta } from './LaktoVoucherCta'
import { TempehBookingCard } from './TempehBookingCard'
import { TempehFAQ } from './TempehFAQ'
import { TempehHero } from './TempehHero'
import { TempehVoucherCta } from './TempehVoucherCta'
import { getWorkshopBySlug } from './workshop-data'
import { tempehDefaults } from './tempeh-data'
import type { WorkshopDate } from './workshop-data'

type VoucherCms = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
  pills?: Array<{ text?: string | null }> | null
  backgroundImage?: MediaType | string | null
}

export type LegacyWorkshopSlug = 'lakto-gemuese' | 'tempeh' | 'kombucha'

export type LegacyWorkshopPageProps = {
  slug: LegacyWorkshopSlug
  locale: 'de' | 'en'
  detail?: FlattenedWorkshopDetail
  workshopAppointments: WorkshopDate[]
  similarWorkshops: WorkshopItem[]
  howToArticles: PostCard[]
  voucherCms?: VoucherCms
  soldOutByHref: Record<string, boolean>
  soldOutLabel: string
}

const DEFAULT_BOOK_LABEL_DE = 'Jetzt buchen'
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

function buildHeroCms(detail?: FlattenedWorkshopDetail) {
  if (!detail) return undefined
  return serializeForClient({
    eyebrow: detail.heroEyebrow,
    title: detail.heroTitle,
    description: detail.heroDescription,
    attributes: detail.heroAttributes,
    image: detail.heroImage as MediaType | string | null | undefined,
  })
}

function buildBookingCms(
  detail: FlattenedWorkshopDetail | undefined,
  workshopAppointments: WorkshopDate[],
) {
  return serializeForClient({
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
  })
}

function buildHowToCms(detail: FlattenedWorkshopDetail | undefined, howToArticles: PostCard[]) {
  return serializeForClient({
    eyebrow: detail?.howToEyebrow,
    title: detail?.howToTitle,
    description: detail?.howToDescription,
    howToArticles,
  })
}

/** Production layouts for Lakto, Tempeh, and Kombucha (matches main branch). */
export function LegacyWorkshopPage({
  slug,
  locale,
  detail,
  workshopAppointments,
  similarWorkshops,
  howToArticles,
  voucherCms,
  soldOutByHref,
  soldOutLabel,
}: LegacyWorkshopPageProps) {
  const isDe = locale === 'de'
  const bookLabel = detail?.sliderBuyLabel ?? (isDe ? DEFAULT_BOOK_LABEL_DE : DEFAULT_BOOK_LABEL_EN)
  const learnMoreLabel =
    detail?.sliderMoreInfoLabel ?? (isDe ? DEFAULT_LEARN_MORE_LABEL : DEFAULT_LEARN_MORE_LABEL_EN)
  const workshopTypesHeading =
    detail?.sliderHeading ?? (isDe ? DEFAULT_WORKSHOP_TYPES_DE : DEFAULT_WORKSHOP_TYPES_EN)
  const workshopTypesSub =
    detail?.sliderSubtitle ?? (isDe ? DEFAULT_WORKSHOP_TYPES_SUB_DE : DEFAULT_WORKSHOP_TYPES_SUB_EN)
  const workshopTypePill =
    detail?.sliderPillLabel ??
    (isDe ? DEFAULT_WORKSHOP_TYPE_PILL_DE : DEFAULT_WORKSHOP_TYPE_PILL_EN)

  const heroCms = buildHeroCms(detail)
  const bookingCms = buildBookingCms(detail, workshopAppointments)
  const howToCms = buildHowToCms(detail, howToArticles)
  const serializedSimilar = serializeForClient(similarWorkshops)
  const serializedVoucher = voucherCms ? serializeForClient(voucherCms) : undefined

  const slider = (
    <WorkshopTypesSlider
      workshops={serializedSimilar}
      heading={workshopTypesHeading}
      subtitle={workshopTypesSub}
      pillLabel={workshopTypePill}
      buyLabel={bookLabel}
      moreInfoLabel={learnMoreLabel}
      soldOutByHref={soldOutByHref}
      soldOutLabel={soldOutLabel}
    />
  )

  if (slug === 'lakto-gemuese') {
    return (
      <article>
        <LaktoHero cms={heroCms} />
        <LaktoBookingCard
          workshop={serializeForClient(getWorkshopBySlug(slug)!)}
          cms={bookingCms as Parameters<typeof LaktoBookingCard>[0]['cms']}
        />
        <LaktoCalendar
          cms={
            detail
              ? serializeForClient({
                  eyebrow: detail.calendarEyebrow,
                  title: detail.calendarTitle,
                  description: detail.calendarDescription,
                  months: detail.calendarMonths,
                })
              : undefined
          }
        />
        <FermentedVegHowTos workshopType="lakto" cms={howToCms} />
        {slider}
        <LaktoVoucherCta cms={serializedVoucher} />
        <LaktoFAQ
          cms={
            detail
              ? serializeForClient({
                  eyebrow: detail.faqEyebrow,
                  title: detail.faqTitle,
                  description: detail.faqDescription,
                  items: detail.faqItems,
                })
              : undefined
          }
        />
      </article>
    )
  }

  if (slug === 'tempeh') {
    return (
      <article>
        <TempehHero cms={heroCms} />
        <TempehBookingCard
          workshop={serializeForClient(tempehDefaults)}
          cms={bookingCms as Parameters<typeof TempehBookingCard>[0]['cms']}
        />
        {slider}
        <TempehVoucherCta cms={serializedVoucher} />
        <FermentedVegHowTos workshopType="tempeh" cms={howToCms} />
        <TempehFAQ
          cms={
            detail
              ? serializeForClient({
                  eyebrow: detail.faqEyebrow,
                  title: detail.faqTitle,
                  description: detail.faqDescription,
                  items: detail.faqItems,
                })
              : undefined
          }
        />
      </article>
    )
  }

  return (
    <article>
      <KombuchaHero cms={heroCms} />
      <KombuchaBookingCard cms={bookingCms as Parameters<typeof KombuchaBookingCard>[0]['cms']} />
      {slider}
      <KombuchaVoucherCta cms={serializedVoucher} />
      <FermentedVegHowTos workshopType="kombucha" cms={howToCms} />
      <KombuchaFAQ
        cms={
          detail
            ? serializeForClient({
                faqEyebrow: detail.faqEyebrow,
                faqTitle: detail.faqTitle,
                faqDescription: detail.faqDescription,
                faqItems: detail.faqItems,
                faqContactEmail: detail.faqContactEmail,
              })
            : undefined
        }
      />
    </article>
  )
}
