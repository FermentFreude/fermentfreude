import { ProductSliderBlock } from '@/blocks/ProductSlider/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { SponsorsBarBlock } from '@/blocks/SponsorsBar/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { VoucherCtaBlock } from '@/blocks/VoucherCta/Component'
import { ProductSliderGlobalWrapper } from '@/components/ProductSliderGlobalWrapper'
import { SponsorsBarGlobalWrapper } from '@/components/SponsorsBarGlobalWrapper'
import { TestimonialsGlobalWrapper } from '@/components/TestimonialsGlobalWrapper'
import { VoucherCtaGlobalWrapper } from '@/components/VoucherCtaGlobalWrapper'
import { AllWorkshopsHero } from '@/components/workshops/AllWorkshopsHero'
import { WorkshopCalendar } from '@/components/workshops/WorkshopCalendar'
import type { Media, Page, Product } from '@/payload-types'
import { getAllWorkshopAppointments } from '@/utilities/getAllWorkshopAppointments'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Workshops | FermentFreude',
    openGraph: {
      title: 'Workshops | FermentFreude',
      description: 'Entdecke unsere Fermentations-Workshops',
    },
  }
}

export default async function WorkshopsPage() {
  const locale = await getLocale()
  const { isEnabled: draft } = await draftMode()

  // Fetch all upcoming workshop appointments from database (cached 2 min)
  const upcomingAppointments = await getCachedWorkshopAppointments()

  // Get workshops page data (hero + calendar sections editable from admin)
  const workshopsPageData = draft
    ? await queryPageBySlug({ slug: 'workshops', locale, draft: true })
    : await getCachedWorkshopsPage(locale)

  // Get CMS data for section titles/descriptions
  const workshopsData = workshopsPageData as Page | undefined
  const ws = workshopsData?.workshops

  // Any extra blocks added in the Content tab (e.g., Gastronomy Banner)
  const extraBlocks = workshopsData?.layout ?? []

  // Enhance workshop cards with real next dates from database.
  // Only use the first AVAILABLE (non-sold-out) appointment as the "next date".
  // Never fall back to the CMS card.nextDate — that string becomes stale and
  // would show past dates once all future appointments expire.
  const enhancedCards = ws?.workshopsCalendarCards?.map((card) => {
    const nextAppointment = upcomingAppointments.find(
      (apt) => apt.workshopType === card.workshopType && apt.availableSpots > 0,
    )
    return {
      ...card,
      nextDate: nextAppointment?.date ?? null,
    }
  })

  // Check which sections use page-level overrides vs globals
  const useCustomVoucher = ws?.workshopsVoucherCustom === true
  const useCustomProductSlider = ws?.workshopsProductSliderCustom === true
  const useCustomSponsors = ws?.workshopsSponsorsCustom === true
  const useCustomTestimonials = ws?.workshopsTestimonialsCustom === true

  return (
    <article className="pb-24">
      {/* 1. Hero Section */}
      <AllWorkshopsHero
        cms={
          ws
            ? {
                eyebrow: ws.workshopsHeroEyebrow,
                title: ws.workshopsHeroTitle,
                description: ws.workshopsHeroDescription,
                attributes: ws.workshopsHeroAttributes,
                image: ws.workshopsHeroImage,
              }
            : undefined
        }
      />

      {/* 2. Workshop Calendar Section */}
      <WorkshopCalendar
        cards={enhancedCards}
        title={ws?.workshopsCalendarTitle}
        description={ws?.workshopsCalendarDescription}
        appointments={upcomingAppointments}
        nextDateLabel={ws?.workshopsCalendarNextDateLabel}
        allDatesHeading={ws?.workshopsCalendarAllDatesHeading}
        allFilterLabel={ws?.workshopsCalendarAllFilterLabel}
        typeColumnLabel={ws?.workshopsCalendarTypeColumnLabel}
        dateColumnLabel={ws?.workshopsCalendarDateColumnLabel}
        spotsColumnLabel={ws?.workshopsCalendarSpotsColumnLabel}
        spotsLabel={ws?.workshopsCalendarSpotsLabel}
        soldOutLabel={ws?.workshopsCalendarSoldOutLabel}
        bookLabel={ws?.workshopsCalendarBookLabel}
        emptyMessage={ws?.workshopsCalendarEmptyMessage}
        comingSoonLabel={locale === 'en' ? 'New dates coming soon' : 'Bald neue Termine verfügbar'}
      />

      {/* 3. Voucher CTA — page override or global */}
      {useCustomVoucher ? (
        <VoucherCtaBlock
          blockType="voucherCta"
          heading={ws?.workshopsVoucherHeading ?? undefined}
          description={ws?.workshopsVoucherDescription ?? undefined}
          buttonLabel={ws?.workshopsVoucherButtonLabel ?? undefined}
          buttonLink={ws?.workshopsVoucherButtonLink ?? undefined}
          galleryImages={
            (ws?.workshopsVoucherGalleryImages as Array<{ image: string | Media }>) ?? []
          }
          backgroundImage={ws?.workshopsVoucherBackgroundImage ?? null}
        />
      ) : (
        <VoucherCtaGlobalWrapper />
      )}

      {/* 4. Product Slider — page override or global */}
      {useCustomProductSlider ? (
        <ProductSliderBlock
          blockType="productSlider"
          heading={ws?.workshopsProductSliderHeading ?? undefined}
          headingAccent={ws?.workshopsProductSliderHeadingAccent ?? undefined}
          description={ws?.workshopsProductSliderDescription ?? undefined}
          buttonLabel={ws?.workshopsProductSliderButtonLabel ?? undefined}
          buttonLink={ws?.workshopsProductSliderButtonLink ?? undefined}
          products={(ws?.workshopsProductSliderProducts as Array<string | Product>) ?? []}
        />
      ) : (
        <ProductSliderGlobalWrapper />
      )}

      {/* 5. Sponsors Bar — page override or global */}
      {useCustomSponsors ? (
        <SponsorsBarBlock
          blockType="sponsorsBar"
          heading={ws?.workshopsSponsorsHeading ?? undefined}
          sponsors={
            (ws?.workshopsSponsorsList as Array<{
              name: string
              logo: string | Media
              url?: string | null
            }>) ?? []
          }
        />
      ) : (
        <SponsorsBarGlobalWrapper />
      )}

      {/* 6. Extra blocks from Content tab */}
      {extraBlocks.length > 0 && <RenderBlocks blocks={extraBlocks} />}

      {/* 7. Testimonials — page override or global */}
      {useCustomTestimonials ? (
        <TestimonialsBlock
          eyebrow={ws?.workshopsTestimonialsEyebrow ?? undefined}
          heading={ws?.workshopsTestimonialsHeading ?? undefined}
          testimonials={
            (ws?.workshopsTestimonialsList as Array<{
              quote: string
              authorName: string
              authorRole?: string
              rating?: number
            }>) ?? []
          }
        />
      ) : (
        <TestimonialsGlobalWrapper />
      )}
    </article>
  )
}

const getCachedWorkshopsPage = unstable_cache(
  async (locale: string) => {
    return queryPageBySlug({ slug: 'workshops', locale: locale as 'de' | 'en', draft: false })
  },
  ['workshops-page'],
  { revalidate: 3600, tags: ['pages'] },
)

const getCachedWorkshopAppointments = unstable_cache(
  () => getAllWorkshopAppointments(),
  ['workshop-appointments'],
  { revalidate: 120, tags: ['workshop-appointments'] },
)

const queryPageBySlug = async ({
  slug,
  locale,
  draft,
}: {
  slug: string
  locale?: 'de' | 'en'
  draft: boolean
}) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    depth: 20,
    draft,
    limit: 1,
    locale,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
