import type { Metadata } from 'next'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { AllWorkshopsHero } from '@/components/workshops/AllWorkshopsHero'
import { WorkshopCalendar } from '@/components/workshops/WorkshopCalendar'
import { getLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { Page } from '@/payload-types'

export const dynamic = 'force-dynamic'

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

  // Get workshops page data (all sections editable from admin)
  const workshopsPageData = await queryPageBySlug({
    slug: 'workshops',
    locale,
    draft,
  })

  // Get home page to extract reusable block components
  const homeData = await queryPageBySlug({
    slug: 'home',
    locale,
    draft,
  })

  // Extract block components from home page (ProductSlider, Testimonials, Sponsors default content)
  const homeBlocks = homeData?.layout ?? []
  const productSliderBlock = homeBlocks.find((block) => block?.blockType === 'productSlider')
  const testimonialsBlock = homeBlocks.find((block) => block?.blockType === 'testimonials')
  const sponsorsBlock = homeBlocks.find((block) => block?.blockType === 'sponsorsBar')

  // Get CMS data for section titles/descriptions
  const workshopsData = workshopsPageData as Page | undefined

  return (
    <article className="pb-24">
      {/* 1. Hero Section - CMS editable */}
      <AllWorkshopsHero
        cms=
          {
            workshopsData?.workshops
              ? {
                  eyebrow: workshopsData.workshops.workshopsHeroEyebrow,
                  title: workshopsData.workshops.workshopsHeroTitle,
                  description: workshopsData.workshops.workshopsHeroDescription,
                  attributes: workshopsData.workshops.workshopsHeroAttributes,
                  image: workshopsData.workshops.workshopsHeroImage,
                }
              : undefined
          }
      />

      {/* 2. Workshop Calendar - CMS editable title/description */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          {workshopsData?.workshops?.workshopsCalendarTitle && (
            <h2 className="mb-4 text-section-heading font-bold tracking-tight">
              {workshopsData.workshops.workshopsCalendarTitle}
            </h2>
          )}
          {workshopsData?.workshops?.workshopsCalendarDescription && (
            <p className="mb-12 max-w-2xl text-body-lg leading-relaxed text-gray-600">
              {workshopsData.workshops.workshopsCalendarDescription}
            </p>
          )}
        </div>
        <WorkshopCalendar />
      </section>

      {/* 3. Product Slider - CMS editable title/description */}
      {productSliderBlock && (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            {workshopsData?.workshops?.workshopsProductSliderTitle && (
              <h2 className="mb-4 text-section-heading font-bold tracking-tight">
                {workshopsData.workshops.workshopsProductSliderTitle}
              </h2>
            )}
            {workshopsData?.workshops?.workshopsProductSliderDescription && (
              <p className="mb-12 max-w-2xl text-body-lg leading-relaxed text-gray-600">
                {workshopsData.workshops.workshopsProductSliderDescription}
              </p>
            )}
          </div>
          <RenderBlocks blocks={[productSliderBlock]} />
        </section>
      )}

      {/* 4. Testimonials - CMS editable title/description */}
      {testimonialsBlock && (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            {workshopsData?.workshops?.workshopsTestimonialsTitle && (
              <h2 className="mb-4 text-section-heading font-bold tracking-tight">
                {workshopsData.workshops.workshopsTestimonialsTitle}
              </h2>
            )}
            {workshopsData?.workshops?.workshopsTestimonialsDescription && (
              <p className="mb-12 max-w-2xl text-body-lg leading-relaxed text-gray-600">
                {workshopsData.workshops.workshopsTestimonialsDescription}
              </p>
            )}
          </div>
          <RenderBlocks blocks={[testimonialsBlock]} />
        </section>
      )}

      {/* 5. Sponsors - CMS editable title/description */}
      {sponsorsBlock && (
        <section className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            {workshopsData?.workshops?.workshopsSponsorsTitle && (
              <h2 className="mb-4 text-section-heading font-bold tracking-tight">
                {workshopsData.workshops.workshopsSponsorsTitle}
              </h2>
            )}
            {workshopsData?.workshops?.workshopsSponsorsDescription && (
              <p className="mb-12 max-w-2xl text-body-lg leading-relaxed text-gray-600">
                {workshopsData.workshops.workshopsSponsorsDescription}
              </p>
            )}
          </div>
          <RenderBlocks blocks={[sponsorsBlock]} />
        </section>
      )}
    </article>
  )
}

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
    overrideAccess: draft,
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
