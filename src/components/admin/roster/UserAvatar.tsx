'use client'

import React from 'react'

import { AvatarMark } from '../BrandLockup'

/** The first letter of the name (an email address works too). */
export function initialsOf(name: string) {
  return (name.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase()
}

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
  name,
  url,
  size = 32,
}: {
  user?: AvatarUser
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
