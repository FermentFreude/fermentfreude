'use client'

import React from 'react'

import { AvatarMark } from '../BrandLockup'

type AvatarUser = { name?: string | null; email?: string | null; avatar?: unknown } | null | undefined

export function avatarUrl(avatar: unknown): string | null {
  if (avatar && typeof avatar === 'object' && 'url' in avatar) {
    const a = avatar as { url?: string | null; sizes?: Record<string, { url?: string | null } | undefined> }
    return a.sizes?.thumbnail?.url || a.url || null
  }
  return null
}

/** Profile photo, or the Fermentfreude logo mark as the default avatar. */
export function UserAvatar({
  user,
  url,
  size = 32,
}: {
  user?: AvatarUser
  /** Kept for callers; the avatar shows a photo or the logo mark, never initials. */
  name?: string
  url?: string | null
  size?: number
}) {
  const src = url ?? avatarUrl(user?.avatar)
  return (
    <span
      className="ff-av"
      style={{ ['--s' as string]: `${size}px` }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny avatar from our own media store */}
      {src ? <img src={src} alt="" /> : <AvatarMark />}
    </span>
  )
}
