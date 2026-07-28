import type { Media as MediaType, Page as PageType } from '@/payload-types'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Media } from '@/components/Media'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { findWorkshopPageSafe } from '@/utilities/findWorkshopPageSafe'
import { getNextWorkshopDatesByHref } from '@/utilities/getNextWorkshopDatesByHref'
import { getPostsBySlugs } from '@/utilities/getPostsBySlugs'
import { populateWorkshopDetailMedia } from '@/utilities/populateWorkshopDetailMedia'
import { localizeWorkshopDetail } from '@/utilities/resolveLocalizedString'
import { extractHowToArticleIds, resolveHowToArticles, toPostCards } from '@/utilities/resolveHowToArticles'
import { getVoucherCtaGlobal } from '@/utilities/getVoucherCtaGlobal'
import { findWorkshopBySlug, getAllWorkshops } from '@/utilities/getWorkshops'
import { getWorkshopRecordBySlug } from '@/utilities/getWorkshopRecord'
import {
  finalizeLegacyWorkshopImages,
  flattenWorkshopDetail,
  isWorkshopDetailPageKind,
  resolveHeroStyle,
  resolveLayoutTemplate,
  resolveWorkshopDbSlug,
  resolveWorkshopDetailForPage,
} from '@/utilities/workshopPageUtils'
import { draftMode } from 'next/headers'
import { getWorkshopAppointments } from './get-workshop-appointments'
import { LaktoBookingCard } from './LaktoBookingCard'
import { LegacyWorkshopPage, type LegacyWorkshopSlug } from './LegacyWorkshopPage'
import { StandardWorkshopPage } from './StandardWorkshopPage'
import { FeldInsGlasExperience } from './FeldInsGlas/Experience'
import { FeldInsGlasHero } from './FeldInsGlas/Hero'
import { FeldInsGlasFAQ } from './FeldInsGlas/FAQ'
import { FeldInsGlasHowTos } from './FeldInsGlas/HowTos'
import { FeldInsGlasRecipePlan } from './FeldInsGlas/RecipePlan'
import { FeldInsGlasVoucher } from './FeldInsGlas/Voucher'
import { FeldInsGlasMoreWorkshops } from './FeldInsGlas/MoreWorkshops'
import {
  FELD_INS_GLAS_COPY,
  FELD_INS_GLAS_HOWTO_SLUGS,
  FELD_INS_GLAS_SLUG,
  getFeldInsGlasWorkshop,
} from './FeldInsGlas/data'
import { getFeldInsGlasImages } from './FeldInsGlas/images'

/* ═══════════════════════════════════════════════════════════════
 *  Workshop detail page — /workshops/[slug]
 *  Standard template (CMS-driven) + Vom Feld ins Glas special case
 * ═══════════════════════════════════════════════════════════════ */

type Args = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const localeKey = locale === 'en' ? 'en' : 'de'

  if (slug === FELD_INS_GLAS_SLUG) {
    const copy = FELD_INS_GLAS_COPY[localeKey]
    return {
      title: `${copy.title} | Fermentfreude`,
      description: copy.partnerLine,
    }
  }

  const marketing = await findWorkshopBySlug(slug, localeKey)
  const dbSlug = resolveWorkshopDbSlug(slug)
  const record = await getWorkshopRecordBySlug(dbSlug, localeKey)
  const title =
    marketing?.title ??
    (typeof record?.title === 'string' ? record.title : null) ??
    'Workshop'

  return {
    title: `${title} | Fermentfreude`,
    description: marketing?.description ?? undefined,
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
  const { isEnabled: draft } = await draftMode()
  const localeKey = locale === 'en' ? 'en' : 'de'

  const payload = await getPayload({ config: configPromise })

  const nextDatesByHref = await getNextWorkshopDatesByHref(localeKey)
  const soldOutByHref: Record<string, boolean> = Object.fromEntries(
    Object.entries(nextDatesByHref).map(([href, info]) => [href, Boolean(info.soldOut)]),
  )
  const soldOutLabel = localeKey === 'en' ? 'Sold Out' : 'Ausgebucht'

  const legacySlugs: LegacyWorkshopSlug[] = ['lakto-gemuese', 'tempeh', 'kombucha']
  const isLegacyWorkshop = legacySlugs.includes(slug as LegacyWorkshopSlug)

  const [workshop, allWorkshops, workshopPage] = await Promise.all([
    findWorkshopBySlug(slug, localeKey).catch((err) => {
      console.error('[workshop page] findWorkshopBySlug failed:', err)
      return null
    }),
    getAllWorkshops(localeKey).catch((err) => {
      console.error('[workshop page] getAllWorkshops failed:', err)
      return [] as Awaited<ReturnType<typeof getAllWorkshops>>
    }),
    findWorkshopPageSafe(payload, {
      slug,
      locale: localeKey,
      draft,
      depth: isLegacyWorkshop ? 10 : 0,
    }),
  ])

  const pageKind = workshopPage?.pageKind
  const localizedDetailRaw = localizeWorkshopDetail(
    workshopPage?.workshopDetail as Record<string, unknown> | undefined,
    localeKey,
  )

  // Legacy: flat fields already merged from raw DB in findWorkshopPageSafe.
  const resolvedDetail = isLegacyWorkshop
    ? (localizedDetailRaw as ReturnType<typeof resolveWorkshopDetailForPage>)
    : resolveWorkshopDetailForPage(localizedDetailRaw, slug)

  const blockImageFallback =
    isLegacyWorkshop && workshopPage?.workshopDetail
      ? flattenWorkshopDetail(
          {
            pageSections: (workshopPage.workshopDetail as Record<string, unknown>).pageSections,
          } as Record<string, unknown>,
          slug,
        )
      : undefined

  let detailRawWithMedia = await populateWorkshopDetailMedia(
    resolvedDetail as Record<string, unknown> | undefined,
  )
  if (isLegacyWorkshop) {
    detailRawWithMedia = finalizeLegacyWorkshopImages(
      detailRawWithMedia,
      blockImageFallback as Record<string, unknown> | undefined,
    )
  }
  const detail = isLegacyWorkshop
    ? (detailRawWithMedia as ReturnType<typeof resolveWorkshopDetailForPage>)
    : resolveWorkshopDetailForPage(
        localizeWorkshopDetail(detailRawWithMedia, localeKey),
        slug,
      )

  const layoutTemplate = resolveLayoutTemplate(slug, detail)
  const dbSlug = resolveWorkshopDbSlug(slug, detail)
  const workshopRecord = await getWorkshopRecordBySlug(dbSlug, localeKey)
  const workshopAppointments = await getWorkshopAppointments(dbSlug)

  const howToArticles = await resolveHowToArticles(
    localeKey,
    workshopPage?.workshopDetail as Record<string, unknown> | undefined,
  )
  const hasCuratedHowToArticles =
    extractHowToArticleIds(workshopPage?.workshopDetail as Record<string, unknown> | undefined)
      .length > 0

  const useGlobalVoucher = detail?.useGlobalVoucherData !== false
  const voucherGlobal = useGlobalVoucher ? await getVoucherCtaGlobal(localeKey) : null
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
            backgroundImage: detail.voucherBackgroundImage as MediaType | string | null | undefined,
          }
        : undefined

  /* ══════════════════════════════════════════════════════════════
   *  Vom Feld ins Glas — Marktgarten special workshop
   *  Hero → Experience → Booking → Recipe plan → FAQ → Voucher → More workshops
   * ══════════════════════════════════════════════════════════════ */
  if (slug === FELD_INS_GLAS_SLUG) {
    const isDe = locale === 'de'
    const baseCopy = FELD_INS_GLAS_COPY[isDe ? 'de' : 'en']
    const cmsHeroTitle = detail?.heroTitle?.trim()
    const cmsHeroDescription = detail?.heroDescription?.trim()
    const cmsHeroEyebrow = detail?.heroEyebrow?.trim()
    const titleLinesFromCms = (() => {
      if (!cmsHeroTitle) return baseCopy.titleLines
      if (cmsHeroTitle.includes('\n')) {
        return cmsHeroTitle
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      }
      // Keep designed two-line split for the default titles
      if (cmsHeroTitle === 'Vom Feld ins Glas') return ['Vom Feld', 'ins Glas']
      if (cmsHeroTitle === 'From Field to Jar') return ['From Field', 'to Jar']
      return [cmsHeroTitle]
    })()
    const copy: typeof baseCopy = {
      ...baseCopy,
      eyebrow: cmsHeroEyebrow || baseCopy.eyebrow,
      title: cmsHeroTitle || baseCopy.title,
      titleLines: titleLinesFromCms,
      heroSubline: cmsHeroDescription || baseCopy.heroSubline,
      description: cmsHeroDescription || baseCopy.description,
      sealRingText: detail?.sealRingText?.trim() || baseCopy.sealRingText,
      sealCenterText: detail?.sealCenterText?.trim() || baseCopy.sealCenterText,
    }
    const workshopData = getFeldInsGlasWorkshop(isDe ? 'de' : 'en')
    const images = await getFeldInsGlasImages()
    const cmsHeroImage =
      detail?.heroImage && typeof detail.heroImage === 'object' && detail.heroImage !== null
        ? (detail.heroImage as MediaType)
        : null
    const heroImage = cmsHeroImage ?? images.hero
    const cmsVoucherImage =
      voucherCms?.backgroundImage &&
      typeof voucherCms.backgroundImage === 'object' &&
      voucherCms.backgroundImage !== null
        ? (voucherCms.backgroundImage as MediaType)
        : null
    const voucherImage =
      cmsVoucherImage ?? images.feld ?? images.konzept ?? images.jars
    const localeKey = isDe ? 'de' : 'en'

    const similarWorkshops = allWorkshops.filter((w) => {
      const s = getSlugFromCtaLink(w.ctaLink)
      return s && s !== slug
    })
    const workshopTypesHeading =
      detail?.sliderHeading ??
      (isDe ? 'Entdecke weitere Workshops.' : 'Discover more workshops.')

    type FeldSectionId =
      | 'hero'
      | 'experience'
      | 'booking'
      | 'recipePlan'
      | 'howTo'
      | 'faq'
      | 'voucher'
      | 'moreWorkshops'

    const DEFAULT_FELD_SECTIONS: Array<{ section: FeldSectionId; enabled: boolean }> = [
      { section: 'hero', enabled: true },
      { section: 'experience', enabled: true },
      { section: 'booking', enabled: true },
      { section: 'recipePlan', enabled: true },
      { section: 'howTo', enabled: false },
      { section: 'faq', enabled: true },
      { section: 'voucher', enabled: true },
      { section: 'moreWorkshops', enabled: true },
    ]

    const cmsSections = Array.isArray(detail?.pageSections) ? detail.pageSections : []
    const orderedSections: Array<{ section: FeldSectionId; enabled: boolean }> =
      cmsSections.length > 0
        ? cmsSections
            .map((row) => {
              // blocks use blockType; older array format used section
              const section = ((row as { blockType?: string; section?: string }).blockType ??
                (row as { section?: string }).section) as FeldSectionId
              return {
                section,
                enabled: (row as { enabled?: boolean | null }).enabled !== false,
              }
            })
            .filter((row) =>
              [
                'hero',
                'experience',
                'booking',
                'recipePlan',
                'howTo',
                'faq',
                'voucher',
                'moreWorkshops',
              ].includes(row.section),
            )
        : DEFAULT_FELD_SECTIONS

    const howToRowEnabled = orderedSections.some((s) => s.section === 'howTo' && s.enabled)
    const showHowToGuides = howToRowEnabled || detail?.showHowToGuides === true
    const howToForFeld = showHowToGuides
      ? hasCuratedHowToArticles
        ? howToArticles
        : await (async () => {
            const curated = toPostCards(
              await getPostsBySlugs(localeKey, [...FELD_INS_GLAS_HOWTO_SLUGS]),
            )
            return curated.length >= 4 ? curated : howToArticles
          })()
      : []

    const sectionNodes: Partial<Record<FeldSectionId, ReactNode>> = {
      hero: <FeldInsGlasHero key="hero" copy={copy} image={heroImage} />,
      experience: (
        <FeldInsGlasExperience
          key="experience"
          copy={copy}
          locale={isDe ? 'de' : 'en'}
          images={{
            hero: heroImage,
            hands: images.hands,
            jars: images.jars,
            konzept: images.konzept,
            feld: images.feld,
            kueche: images.kueche,
            glas: images.glas,
          }}
        />
      ),
      booking: (
        <div key="booking" id="buchen" className="bg-white">
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
              bookingImage:
                (detail?.bookingImage &&
                typeof detail.bookingImage === 'object' &&
                detail.bookingImage !== null
                  ? (detail.bookingImage as MediaType)
                  : null) ??
                images.jars ??
                images.hands ??
                heroImage,
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
      ),
      recipePlan: (
        <FeldInsGlasRecipePlan
          key="recipePlan"
          locale={localeKey}
          cms={{
            eyebrow: detail?.recipePlanEyebrow,
            title: detail?.recipePlanTitle,
            description: detail?.recipePlanDescription,
            recipes: detail?.recipePlanRecipes,
          }}
        />
      ),
      howTo: showHowToGuides ? (
        <FeldInsGlasHowTos
          key="howTo"
          locale={localeKey}
          eyebrow={detail?.howToEyebrow ?? (isDe ? 'Wissen' : 'Knowledge')}
          title={detail?.howToTitle ?? (isDe ? 'Tipps & Guides.' : 'Tips & Guides.')}
          articles={howToForFeld.map((post) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            readTime: post.readTime,
            heroImage: post.heroImage,
          }))}
        />
      ) : null,
      faq: (
        <FeldInsGlasFAQ
          key="faq"
          locale={localeKey}
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
      ),
      voucher: (
        <FeldInsGlasVoucher
          key="voucher"
          cms={voucherCms}
          locale={localeKey}
          image={voucherImage}
        />
      ),
      moreWorkshops: (
        <FeldInsGlasMoreWorkshops
          key="moreWorkshops"
          workshops={similarWorkshops}
          locale={localeKey}
          heading={workshopTypesHeading}
        />
      ),
    }

    return (
      <article className="bg-white">
        {orderedSections
          .filter((row) => row.enabled)
          .map((row) => sectionNodes[row.section] ?? null)}
      </article>
    )
  }

  const legacySlugsForRender: LegacyWorkshopSlug[] = ['lakto-gemuese', 'tempeh', 'kombucha']
  const canRenderStandard =
    slug !== FELD_INS_GLAS_SLUG &&
    layoutTemplate !== 'special' &&
    (isWorkshopDetailPageKind(pageKind) ||
      workshopRecord ||
      workshop ||
      legacySlugsForRender.includes(slug as LegacyWorkshopSlug))

  if (!canRenderStandard) return notFound()

  const similarWorkshops = allWorkshops.filter((w) => {
    const s = getSlugFromCtaLink(w.ctaLink)
    return s && s !== slug
  })

  if (isLegacyWorkshop) {
    return (
      <LegacyWorkshopPage
        slug={slug as LegacyWorkshopSlug}
        locale={localeKey}
        detail={detail}
        workshopAppointments={workshopAppointments}
        similarWorkshops={similarWorkshops}
        howToArticles={howToArticles}
        voucherCms={voucherCms}
        soldOutByHref={soldOutByHref}
        soldOutLabel={soldOutLabel}
      />
    )
  }

  return (
    <StandardWorkshopPage
      pageSlug={slug}
      dbSlug={dbSlug}
      heroStyle={resolveHeroStyle(slug, detail)}
      locale={localeKey}
      detail={detail}
      workshopAppointments={workshopAppointments}
      similarWorkshops={similarWorkshops}
      howToArticles={howToArticles}
      voucherCms={voucherCms}
      soldOutByHref={soldOutByHref}
      soldOutLabel={soldOutLabel}
      workshopRecord={workshopRecord}
    />
  )
}
