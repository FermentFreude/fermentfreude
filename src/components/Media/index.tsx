import React, { Fragment } from 'react'

import { cn } from '@/utilities/cn'

import type { Props } from './types'

import { Image } from './Image'
import { Video } from './Video'

export const Media: React.FC<Props> = (props) => {
  const { className, fill, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = (htmlElement as React.ElementType) || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className: cn(className, fill && 'relative size-full'),
          }
        : {})}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is forwarded via props to next/image */}
      {isVideo ? <Video {...props} /> : <Image {...props} />}
    </Tag>
  )
}
