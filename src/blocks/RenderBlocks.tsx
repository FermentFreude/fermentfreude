import { AboutBlockComponent } from '@/blocks/AboutBlock/Component'
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
import { SponsorsBarBlock } from '@/blocks/SponsorsBar/Component'
import { TeamPreviewBlock } from '@/blocks/TeamPreview/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { ThreeItemGridBlock } from '@/blocks/ThreeItemGrid/Component'
import { VoucherCtaBlock } from '@/blocks/VoucherCta/Component'
import { WorkshopSliderBlock } from '@/blocks/WorkshopSlider/Component'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Page } from '../payload-types'

const blockComponents = {
  aboutBlock: AboutBlockComponent,
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
  sponsorsBar: SponsorsBarBlock,
  teamPreview: TeamPreviewBlock,
  testimonials: TestimonialsBlock,
  threeItemGrid: ThreeItemGridBlock,
  voucherCta: VoucherCtaBlock,
  workshopSlider: WorkshopSliderBlock,
}

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>
}> = (props) => {
  const { blocks } = props
  const blockList = blocks ?? []

  const hasBlocks = blockList.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blockList.map((block, index) => {
          const { blockName, blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType as keyof typeof blockComponents]

            if (Block) {
              return (
                <div className="my-(--space-content-xl)" key={index}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block id={toKebabCase(blockName!)} {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
