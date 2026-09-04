'use client'

import type { Product } from '@/payload-types'

import { cn } from '@/utilities/cn'
import {
  resolveProductCardMedia,
  SHOP_CARD_IMAGE_FALLBACK,
} from '@/utilities/productDetailDisplay'
import NextImage from 'next/image'
import { useState } from 'react'

export function ShopProductCardImage({
  product,
  resource,
  fallbackSrc: fallbackSrcProp,
  className,
  imgClassName,
  sizes = '280px',
  emptyClassName = 'bg-[#ECE5DE]',
  priority = false,
}: {
  product: Product
  resource?: { url?: string | null; alt?: string | null; width?: number | null; height?: number | null } | null
  /** Overrides slug default — use for PDP gallery index fallbacks */
  fallbackSrc?: string
  className?: string
  imgClassName?: string
  sizes?: string
  emptyClassName?: string
  priority?: boolean
}) {
  const cmsMedia = resource ?? resolveProductCardMedia(product)
  const slugFallback = product.slug ? SHOP_CARD_IMAGE_FALLBACK[product.slug] : undefined
  const fallbackSrc = fallbackSrcProp ?? slugFallback
  const cmsUrl = cmsMedia?.url?.trim() || null
  const [imageFailed, setImageFailed] = useState(false)

  // CMS/gallery image takes priority whenever one exists and hasn't failed to
  // load — editors managing images through /admin expect their upload to
  // actually render. The local /public/shop asset is a true fallback only:
  // used when there's no CMS image yet, or the CMS URL 404s.
  const showCms = Boolean(cmsUrl) && !imageFailed
  const showLocal = !showCms && Boolean(fallbackSrc)

  return (
    <div className={cn('relative', className)}>
      {showCms && cmsUrl ? (
        // Native img — reliable onError when R2/CMS URLs 404 (Next/Image often skips fallback)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cmsUrl}
          alt={cmsMedia?.alt ?? product.title ?? ''}
          className={cn('absolute inset-0 h-full w-full', imgClassName)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : showLocal && fallbackSrc ? (
        <NextImage
          src={fallbackSrc}
          alt={product.title ?? ''}
          fill
          className={imgClassName}
          sizes={sizes}
          priority={priority}
          unoptimized
        />
      ) : (
        <div className={cn('absolute inset-0', emptyClassName)} aria-hidden />
      )}
    </div>
  )
}
