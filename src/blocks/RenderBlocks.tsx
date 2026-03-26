import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { CollectionGridComponent } from '@/blocks/CollectionGrid/Component'
import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FeatureCardsBlock } from '@/blocks/FeatureCards/Component'
import { FeaturedProductCardsComponent } from '@/blocks/FeaturedProductCards/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { HeroBannerBlock } from '@/blocks/HeroBanner/Component'
import { LaktoVoucherCtaBlockComponent } from '@/blocks/LaktoVoucherCta/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { OnlineCourseSliderBlock } from '@/blocks/OnlineCourseSlider/Component'
import { OurStoryBlock } from '@/blocks/OurStory/Component'
import { ProductSliderBlock } from '@/blocks/ProductSlider/Component'
import { ReadyToLearnCTABlock } from '@/blocks/ReadyToLearnCTA/Component'
import { ShopHeroComponent } from '@/blocks/ShopHero/Component'
import { ShopProductGridComponent } from '@/blocks/ShopProductGrid/Component'
import { ShopProductListComponent } from '@/blocks/ShopProductList/Component'
import { SponsorsBarBlock } from '@/blocks/SponsorsBar/Component'
import { TeamCardsBlock } from '@/blocks/TeamCards/Component'
import { TeamPreviewBlock } from '@/blocks/TeamPreview/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { ThreeItemGridBlock } from '@/blocks/ThreeItemGrid/Component'
import { VoucherCtaBlock } from '@/blocks/VoucherCta/Component'
import { WorkshopPhasesComponent } from '@/blocks/WorkshopPhases/Component'
import { WorkshopSliderBlock } from '@/blocks/WorkshopSlider/Component'
import { ProductSliderGlobalWrapper } from '@/components/ProductSliderGlobalWrapper'
import { SponsorsBarGlobalWrapper } from '@/components/SponsorsBarGlobalWrapper'
import { VoucherCtaGlobalWrapper } from '@/components/VoucherCtaGlobalWrapper'
import { WorkshopSliderGlobalWrapper } from '@/components/WorkshopSliderGlobalWrapper'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Page } from '../payload-types'

const blockComponents = {
  contactBlock: ContactBlockComponent,
  archive: ArchiveBlock,
  banner: BannerBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  featureCards: FeatureCardsBlock,
  formBlock: FormBlock,
  heroBanner: HeroBannerBlock,
  mediaBlock: MediaBlock,
  ourStory: OurStoryBlock,
  readyToLearnCta: ReadyToLearnCTABlock,
  sponsorsBar: SponsorsBarBlock,
  teamCards: TeamCardsBlock,
  teamPreview: TeamPreviewBlock,
  testimonials: TestimonialsBlock,
  threeItemGrid: ThreeItemGridBlock,
  productSlider: ProductSliderBlock,
  featuredProductCards: FeaturedProductCardsComponent,
  shopHero: ShopHeroComponent,
  shopProductGrid: ShopProductGridComponent,
  shopProductList: ShopProductListComponent,
  collectionGrid: CollectionGridComponent,
  voucherCta: VoucherCtaBlock,
  laktoVoucherCta: LaktoVoucherCtaBlockComponent,
  onlineCourseSlider: OnlineCourseSliderBlock,
  workshopSlider: WorkshopSliderBlock,
  workshopPhases: WorkshopPhasesComponent,
}

// Maps block types to their GlobalWrapper component (used when useGlobalData is true)
// Each wrapper accepts optional fallback props from the block-level data
const globalWrappers: Record<
  string,
  React.FC<{ id?: string; fallbackData?: Record<string, unknown> }>
> = {
  sponsorsBar: SponsorsBarGlobalWrapper as unknown as React.FC<{
    id?: string
    fallbackData?: Record<string, unknown>
  }>,
  laktoVoucherCta: VoucherCtaGlobalWrapper as unknown as React.FC<{
    id?: string
    fallbackData?: Record<string, unknown>
  }>,
  workshopSlider: WorkshopSliderGlobalWrapper as unknown as React.FC<{
    id?: string
    fallbackData?: Record<string, unknown>
  }>,
  productSlider: ProductSliderGlobalWrapper as unknown as React.FC<{
    id?: string
    fallbackData?: Record<string, unknown>
  }>,
}

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>
  slug?: string
}> = (props) => {
  const { blocks, slug } = props
  const blockList = blocks ?? []
  const isAbout = slug === 'about'
  const isShop = slug === 'shop'
  const gapClass = isAbout
    ? 'mb-12 last:mb-0' // increased margin between sections on About
    : isShop
      ? 'first:mt-0 last:mb-0' // shop: no extra margin between blocks (each block handles its own padding)
      : 'my-[var(--space-section-md)] first:mt-0 last:mb-0'

  const hasBlocks = blockList.length > 0

  if (hasBlocks) {
    const Wrapper = isAbout ? 'div' : Fragment
    const wrapperProps = isAbout ? { className: 'page-about' } : {}
    return (
      <Wrapper {...wrapperProps}>
        {blockList.map((block, index) => {
          const { blockName, blockType } = block
          const blockId = blockName ? toKebabCase(blockName) : undefined

          // When useGlobalData is explicitly true, render the GlobalWrapper
          // Block-level data is passed as fallback (used when global is empty)
          const blockData = block as unknown as Record<string, unknown>
          const useGlobal = blockData.useGlobalData === true
          if (useGlobal && blockType && blockType in globalWrappers) {
            // Respect the block-level visible toggle
            if ('visible' in block && blockData.visible === false) return null
            const GlobalWrapper = globalWrappers[blockType]
            return (
              <div className={gapClass} key={index}>
                <GlobalWrapper id={blockId} fallbackData={blockData} />
              </div>
            )
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents] as React.FC<
              { id?: string } & Record<string, unknown>
            >

            if (Block) {
              return (
                <div className={gapClass} key={index}>
                  <Block {...block} id={blockId} />
                </div>
              )
            }
          }
          return null
        })}
      </Wrapper>
    )
  }

  return null
}
