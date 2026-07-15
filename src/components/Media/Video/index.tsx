'use client'

import { cn } from '@/utilities/cn'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '../types'

function resolveMediaSrc(resource: NonNullable<MediaProps['resource']>): string | null {
  if (typeof resource !== 'object' || resource === null) return null

  const { filename, url } = resource
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')

  if (url && typeof url === 'string') {
    return url.startsWith('http') || url.startsWith('/')
      ? url
      : base
        ? `${base}/${url.replace(/^\//, '')}`
        : url.startsWith('/')
          ? url
          : `/${url}`
  }

  if (filename) {
    return base ? `${base}/media/${filename}` : `/media/${filename}`
  }

  return null
}

export const Video: React.FC<MediaProps> = (props) => {
  const { onClick, onVideoCanPlay, resource, videoClassName, videoMuted = true, videoPoster } = props

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = videoMuted
    if (!videoMuted) {
      void video.play().catch(() => undefined)
    }
  }, [videoMuted])

  if (resource && typeof resource === 'object') {
    const { mimeType } = resource
    const src = resolveMediaSrc(resource)

    if (!src) return null

    return (
      <video
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted={videoMuted}
        onCanPlay={() => onVideoCanPlay?.()}
        onClick={onClick}
        playsInline
        poster={videoPoster}
        preload="auto"
        ref={videoRef}
      >
        <source src={src} type={mimeType ?? undefined} />
      </video>
    )
  }

  return null
}
