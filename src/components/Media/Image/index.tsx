'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/cn'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'

const { breakpoints } = cssVariables

function isValidImageSrc(src: unknown): src is string {
  if (typeof src !== 'string' || !src.trim()) return false
  if (/undefined|null|NaN/.test(src)) return false
  try {
    if (src.startsWith('/')) {
      new URL(src, 'https://example.com')
    } else {
      new URL(src)
    }
    return true
  } catch {
    return false
  }
}

export const Image: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  const [, setIsLoading] = React.useState(true)

  let width: number | undefined | null
  let height: number | undefined | null
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  // Extract src string from StaticImageData (static imports)
  if (typeof src === 'object' && src !== null && 'src' in src) {
    src = (src as StaticImageData).src
  }

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = widthFromProps ?? fullWidth
    height = heightFromProps ?? fullHeight
    alt = altFromResource

    // Use path as-is when relative (/media/...) so images load from current origin
    if (url && typeof url === 'string') {
      const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
      src =
        url.startsWith('http') || url.startsWith('/')
          ? url
          : base ? `${base}/${url.replace(/^\//, '')}` : url.startsWith('/') ? url : `/${url}`
    }
  }

  if (!isValidImageSrc(src)) {
    return (
      <div
        className={cn('bg-[#ECE5DE]', fill && 'absolute inset-0', imgClassName)}
        style={!fill ? { width: width ?? 200, height: height ?? 300 } : undefined}
        aria-hidden
      />
    )
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value}px`)
        .join(', ')

  return (
    <NextImage
      alt={alt || ''}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height || heightFromProps : undefined}
      onClick={onClick}
      onLoad={() => {
        setIsLoading(false)
        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      priority={priority}
      quality={90}
      sizes={sizes}
      src={src}
      unoptimized
      width={!fill ? width || widthFromProps : undefined}
    />
  )
}
