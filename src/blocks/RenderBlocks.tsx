import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContactBlockComponent } from '@/blocks/ContactBlock/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FeatureCardsBlock } from '@/blocks/FeatureCards/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { HeroBannerBlock } from '@/blocks/HeroBanner/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { OurStoryBlock } from '@/blocks/OurStory/Component'
import { ProductSliderBlock } from '@/blocks/ProductSlider/Component'
import { ReadyToLearnCTABlock } from '@/blocks/ReadyToLearnCTA/Component'
import { SponsorsBarBlock } from '@/blocks/SponsorsBar/Component'
import { TeamCardsBlock } from '@/blocks/TeamCards/Component'
import { TeamPreviewBlock } from '@/blocks/TeamPreview/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { ThreeItemGridBlock } from '@/blocks/ThreeItemGrid/Component'
import { VoucherCtaBlock } from '@/blocks/VoucherCta/Component'
import { WorkshopPhasesComponent } from '@/blocks/WorkshopPhases/Component'
import { WorkshopSliderBlock } from '@/blocks/WorkshopSlider/Component'
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
  voucherCta: VoucherCtaBlock,
  workshopSlider: WorkshopSliderBlock,
  workshopPhases: WorkshopPhasesComponent,
}

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>
  slug?: string
}> = (props) => {
  const { blocks, slug } = props
  const blockList = blocks ?? []
  const isAbout = slug === 'about'
  const gapClass = isAbout
    ? 'mb-12 last:mb-0' // increased margin between sections on About
    : 'my-[var(--space-section-md)] first:mt-0 last:mb-0'

  const hasBlocks = blockList.length > 0

  if (hasBlocks) {
    const Wrapper = isAbout ? 'div' : Fragment
    const wrapperProps = isAbout ? { className: 'page-about' } : {}
    return (
      <Wrapper {...wrapperProps}>
        {blockList.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents] as React.FC<
              { id?: string } & Record<string, unknown>
            >

            if (Block) {
              return (
                <div className={gapClass} key={index}>
                  <Block {...block} id={blockName ? toKebabCase(blockName) : undefined} />
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
