import type { Media as MediaType, Workshop } from '@/payload-types'
import type { ReactNode } from 'react'

import type { PostCard } from '@/components/fermentation/FermentedVegHowTos'
import { resolveLocalizedString } from '@/utilities/resolveLocalizedString'
import { serializeForClient } from '@/utilities/serializeForClient'

import { FermentedVegHowTos } from '@/components/fermentation/FermentedVegHowTos'
import { WorkshopTypesSlider } from '@/components/workshops/WorkshopTypesSlider'
import type { WorkshopItem } from '@/utilities/getWorkshops'
import type { FlattenedWorkshopDetail, HeroStyle } from '@/utilities/workshopPageUtils'
import { getOrderedStandardSections } from '@/utilities/workshopPageUtils'

import { buildWorkshopDefaults } from './build-workshop-defaults'
import { KombuchaBookingCard } from './KombuchaBookingCard'
import { KombuchaFAQ } from './KombuchaFAQ'
import { KombuchaHero } from './KombuchaHero'
import { KombuchaVoucherCta } from './KombuchaVoucherCta'
import { LaktoBookingCard } from './LaktoBookingCard'
import { LaktoCalendar } from './LaktoCalendar'
import { LaktoFAQ } from './LaktoFAQ'
import { LaktoHero } from './LaktoHero'
import { LaktoVoucherCta } from './LaktoVoucherCta'
import { TempehHero } from './TempehHero'
import { WorkshopHero } from './WorkshopHero'
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

export type StandardWorkshopPageProps = {
  pageSlug: string
  dbSlug: string
  heroStyle: HeroStyle
  locale: 'de' | 'en'
  detail?: FlattenedWorkshopDetail
  workshopAppointments: WorkshopDate[]
  similarWorkshops: WorkshopItem[]
  howToArticles: PostCard[]
  voucherCms?: VoucherCms
  soldOutByHref: Record<string, boolean>
  soldOutLabel: string
  workshopRecord?: Workshop | null
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

function StandardWorkshopHero({
  heroStyle,
  cms,
}: {
  heroStyle: HeroStyle
  cms?: {
    eyebrow?: string | null
    title?: string | null
    description?: string | null
    attributes?: Array<{ text?: string | null }> | null
    image?: unknown
  }
}) {
  const heroCms = cms
    ? {
        eyebrow: cms.eyebrow,
        title: cms.title,
        description: cms.description,
        attributes: cms.attributes,
        image: cms.image as MediaType | string | null | undefined,
      }
    : undefined

  switch (heroStyle) {
    case 'lakto':
      return <LaktoHero cms={heroCms} />
    case 'tempeh':
      return <TempehHero cms={heroCms} />
    case 'kombucha':
      return <KombuchaHero cms={heroCms} />
    default:
      return <WorkshopHero cms={heroCms} />
  }
}

function resolveWorkshopFallback(
  pageSlug: string,
  dbSlug: string,
  detail: StandardWorkshopPageProps['detail'],
  workshopRecord: Workshop | null | undefined,
  locale: 'de' | 'en',
) {
  if (pageSlug === 'lakto-gemuese') {
    return getWorkshopBySlug(pageSlug)!
  }
  if (pageSlug === 'tempeh') {
    return tempehDefaults
  }
  return buildWorkshopDefaults(pageSlug, dbSlug, workshopRecord ?? null, detail, locale)
}

function howToWorkshopType(heroStyle: HeroStyle): 'lakto' | 'tempeh' | 'kombucha' {
  if (heroStyle === 'tempeh') return 'tempeh'
  if (heroStyle === 'kombucha') return 'kombucha'
  return 'lakto'
}

export function StandardWorkshopPage({
  pageSlug,
  dbSlug,
  heroStyle,
  locale,
  detail,
  workshopAppointments,
  similarWorkshops,
  howToArticles,
  voucherCms,
  soldOutByHref,
  soldOutLabel,
  workshopRecord,
}: StandardWorkshopPageProps) {
  const isDe = locale === 'de'
  const workshopDefaults = resolveWorkshopFallback(
    pageSlug,
    dbSlug,
    detail,
    workshopRecord,
    locale,
  )

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

  const pageSections = Array.isArray(detail?.pageSections)
    ? (detail!.pageSections as Array<{ blockType?: string; enabled?: boolean | null }>)
    : undefined

  const showHowTo =
    pageSections?.some((s) => s.blockType === 'howTo' && s.enabled !== false) ??
    detail?.showHowToGuides !== false

  const orderedSections = getOrderedStandardSections(
    pageSections,
    heroStyle,
    detail?.showSeasonalCalendar,
  ).filter((row) => row.enabled)

  const bookingCms = serializeForClient({
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

  const faqCms = detail
    ? serializeForClient({
        faqEyebrow: detail.faqEyebrow,
        faqTitle: detail.faqTitle,
        faqDescription: detail.faqDescription,
        faqItems: detail.faqItems,
        items: detail.faqItems,
      })
    : undefined

  const bookingTitle =
    resolveLocalizedString(detail?.bookingTitle, locale) ?? workshopDefaults.title

  const sectionNodes: Partial<Record<string, ReactNode>> = {
    hero: (
      <StandardWorkshopHero
        key="hero"
        heroStyle={heroStyle}
        cms={
          detail
            ? serializeForClient({
                eyebrow: detail.heroEyebrow,
                title: detail.heroTitle,
                description: detail.heroDescription,
                attributes: detail.heroAttributes,
                image: detail.heroImage,
              })
            : undefined
        }
      />
    ),
    booking:
      heroStyle === 'kombucha' ? (
        <KombuchaBookingCard
          key="booking"
          cms={bookingCms as Parameters<typeof KombuchaBookingCard>[0]['cms']}
        />
      ) : (
        <LaktoBookingCard
          key="booking"
          workshop={serializeForClient(workshopDefaults)}
          cms={bookingCms as Parameters<typeof LaktoBookingCard>[0]['cms']}
          cartOverrides={{
            workshopSlug: dbSlug,
            workshopTitle: bookingTitle,
            pageSlug,
          }}
        />
      ),
    calendar: (
      <LaktoCalendar
        key="calendar"
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
    ),
    howTo: showHowTo ? (
      <FermentedVegHowTos
        key="howTo"
        workshopType={howToWorkshopType(heroStyle)}
        cms={serializeForClient({
          eyebrow: detail?.howToEyebrow,
          title: detail?.howToTitle,
          description: detail?.howToDescription,
          howToArticles,
        })}
      />
    ) : null,
    faq:
      heroStyle === 'kombucha' ? (
        <KombuchaFAQ key="faq" cms={faqCms as Parameters<typeof KombuchaFAQ>[0]['cms']} />
      ) : (
        <LaktoFAQ
          key="faq"
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
      ),
    moreWorkshops: (
      <WorkshopTypesSlider
        key="moreWorkshops"
        workshops={serializeForClient(similarWorkshops)}
        heading={workshopTypesHeading}
        subtitle={workshopTypesSub}
        pillLabel={workshopTypePill}
        buyLabel={bookLabel}
        moreInfoLabel={learnMoreLabel}
        soldOutByHref={soldOutByHref}
        soldOutLabel={soldOutLabel}
      />
    ),
    voucher:
      heroStyle === 'kombucha' ? (
        <KombuchaVoucherCta
          key="voucher"
          cms={voucherCms ? serializeForClient(voucherCms) : undefined}
        />
      ) : (
        <LaktoVoucherCta
          key="voucher"
          cms={voucherCms ? serializeForClient(voucherCms) : undefined}
        />
      ),
  }

  return (
    <article>
      {orderedSections.map((row) => sectionNodes[row.section] ?? null)}
    </article>
  )
}
