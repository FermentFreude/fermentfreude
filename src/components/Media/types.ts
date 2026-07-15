import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  height?: number
  htmlElement?: ElementType | null
  imgClassName?: string
  imgStyle?: React.CSSProperties
  onClick?: () => void
  onLoad?: () => void
  onVideoCanPlay?: () => void
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData // for static media
  videoClassName?: string
  videoMuted?: boolean
  videoPoster?: string
  width?: number
}
