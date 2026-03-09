import type { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
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
  noStore()
  const locale = await getLocale()
  const { isEnabled: draft } = await draftMode()

  // Get workshops page data (all sections editable from admin)
  const workshopsPageData = await queryPageBySlug({
    slug: 'workshops',
    locale,
    draft,
  })

  // Get home page to extract blocks
  const homeData = await queryPageBySlug({
    slug: 'home',
    locale,
    draft,
  })

  // Get lakto page to extract voucher block (has background image)
  const laktoData = await queryPageBySlug({
    slug: 'lakto',
    locale,
    draft,
  })

  // Extract blocks from home and lakto
  const homeBlocks = homeData?.layout ?? []
  const laktoBlocks = laktoData?.layout ?? []
  
  // Get voucher block FROM LAKTO (has the background image)
  const voucherBlock = laktoBlocks.find((block) => block?.blockType === 'voucherCta')
  
  const productSliderBlock = homeBlocks.find((block) => block?.blockType === 'productSlider')
  const sponsorsBlock = homeBlocks.find((block) => block?.blockType === 'sponsorsBar')
  const gastroBlock = homeBlocks.find((block) => block?.blockType === 'heroBanner')
  const testimonialsBlock = homeBlocks.find((block) => block?.blockType === 'testimonials')

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

      {/* 2. Workshop Calendar Section */}
      <WorkshopCalendar 
        cards={workshopsData?.workshops?.workshopsCalendarCards}
        title={workshopsData?.workshops?.workshopsCalendarTitle}
        description={workshopsData?.workshops?.workshopsCalendarDescription}
      />

      {/* 3. Voucher Block (from Lakto — with background image) */}
      {voucherBlock && <RenderBlocks blocks={[voucherBlock]} />}

      {/* 4. Product Slider (from Home) */}
      {productSliderBlock && <RenderBlocks blocks={[productSliderBlock]} />}

      {/* 5. Sponsors Bar (from Home) */}
      {sponsorsBlock && <RenderBlocks blocks={[sponsorsBlock]} />}

      {/* 6. Gastronomy Banner (from Home) */}
      {gastroBlock && <RenderBlocks blocks={[gastroBlock]} />}

      {/* 7. Testimonials (from Home) */}
      {testimonialsBlock && <RenderBlocks blocks={[testimonialsBlock]} />}
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
