'use client'

/**
 * EXPERIMENT — home special-workshop banner
 * Currently hidden until an approved Figma design exists.
 */

import type { SpecialWorkshopBannerBlock as BlockType } from '@/payload-types'

type Props = BlockType & { id?: string }

export const SpecialWorkshopBannerBlock: React.FC<Props> = () => {
  // Do not render on home until design is approved (Raphaella / founders).
  return null
}
